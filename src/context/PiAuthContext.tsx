/**
 * GOYE Web3 Business Hub - Pi Network Authentication Context
 *
 * Official Pi Network Sign-in Integration:
 * - Real OAuth 2.0 Implicit Grant Authentication
 * - Server-Verified Sessions (no local simulation or spoofing)
 * - Strict Separation: Authentication never grants payment or contract approval.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  buildPiOAuthUrl,
  PI_SESSION_STORAGE_KEY,
  getPiOAuthRedirectUri,
  PI_REGISTERED_REDIRECT_URIS,
} from '../constants/piAuth';
import { authenticatePi } from '../utils/piSdk';

export interface VerifiedPiUser {
  uid: string;
  username: string;
  roles?: string[];
}

interface StoredSession {
  sessionToken: string;
  user: VerifiedPiUser;
  expiresAt?: string;
}

interface PiAuthContextType {
  user: VerifiedPiUser | null;
  sessionToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  signInWithPiOAuth: (options?: { returnView?: string }) => void;
  signInWithPiBrowserSdk: () => Promise<boolean>;
  signOut: () => Promise<void>;
  setVerifiedSession: (sessionToken: string, user: VerifiedPiUser, expiresAt?: string) => void;
  clearAuthError: () => void;
}

const PiAuthContext = createContext<PiAuthContextType | undefined>(undefined);

export const PiAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<VerifiedPiUser | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Initialize and validate existing session from storage
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const raw = localStorage.getItem(PI_SESSION_STORAGE_KEY);
        if (!raw) {
          setIsLoading(false);
          return;
        }

        const parsed: StoredSession = JSON.parse(raw);
        if (!parsed.sessionToken || !parsed.user?.username) {
          localStorage.removeItem(PI_SESSION_STORAGE_KEY);
          setIsLoading(false);
          return;
        }

        // Validate session with server-side source of truth
        const res = await fetch('/api/pi/session', {
          headers: {
            Authorization: `Bearer ${parsed.sessionToken}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setUser(data.user);
            setSessionToken(parsed.sessionToken);
          } else {
            // Session expired or revoked
            localStorage.removeItem(PI_SESSION_STORAGE_KEY);
            setUser(null);
            setSessionToken(null);
          }
        } else {
          // If server is unreachable or restarts, preserve verified session if not expired
          if (parsed.expiresAt && new Date(parsed.expiresAt).getTime() > Date.now()) {
            setUser(parsed.user);
            setSessionToken(parsed.sessionToken);
          } else {
            localStorage.removeItem(PI_SESSION_STORAGE_KEY);
          }
        }
      } catch (err) {
        console.warn('[Pi Auth] Failed to restore session:', err);
        localStorage.removeItem(PI_SESSION_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const setVerifiedSession = useCallback(
    (token: string, verifiedUser: VerifiedPiUser, expiresAt?: string) => {
      setUser(verifiedUser);
      setSessionToken(token);
      setAuthError(null);
      try {
        const sessionData: StoredSession = {
          sessionToken: token,
          user: verifiedUser,
          expiresAt,
        };
        localStorage.setItem(PI_SESSION_STORAGE_KEY, JSON.stringify(sessionData));
      } catch (e) {
        console.warn('[Pi Auth] Failed to store session:', e);
      }
    },
    []
  );

  /**
   * Initiates the official Pi Network OAuth 2.0 flow.
   * Redirects the browser to https://accounts.pinet.com/oauth/authorize
   */
  const signInWithPiOAuth = useCallback((options?: { returnView?: string }) => {
    setAuthError(null);
    try {
      const { url } = buildPiOAuthUrl({
        returnView: options?.returnView,
      });

      // If running inside an iframe (like preview environments), open directly or in top window
      if (typeof window !== 'undefined') {
        if (window.top && window.top !== window) {
          // Inside iframe: try top or new window to avoid X-Frame-Options blocking
          try {
            window.top.location.href = url;
          } catch (_) {
            window.open(url, '_blank', 'noopener,noreferrer');
          }
        } else {
          window.location.href = url;
        }
      }
    } catch (err: any) {
      console.error('[Pi OAuth] Redirection error:', err);
      setAuthError('Failed to initiate Pi OAuth redirection. Please try again.');
    }
  }, []);

  /**
   * Authenticates directly via Pi Browser SDK if running inside the official Pi Browser.
   * Verifies the resulting access token with the backend before setting the session.
   */
  const signInWithPiBrowserSdk = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const Pi = typeof window !== 'undefined' ? (window as any).Pi : null;
      if (!Pi) {
        setAuthError('Pi SDK unavailable. Please open in Pi Browser.');
        setIsLoading(false);
        return false;
      }

      await Pi.init({ version: '2.0' });
      const auth = await Pi.authenticate(['username'], (incompletePayment: any) => {
        fetch('/api/pi/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentId: incompletePayment?.identifier,
            txid: incompletePayment?.transaction?.txid,
          }),
        });
      });

      const accessToken = auth?.accessToken;
      if (!accessToken) {
        setAuthError('Failed to obtain Pi access token.');
        setIsLoading(false);
        return false;
      }

      // Step 2 & 3: Authoritative verification against App Studio via /api/pi/auth
      const verifyRes = await fetch('/api/pi/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        setAuthError(verifyData.error || 'Failed to verify Pioneer identity against Pi Platform.');
        setIsLoading(false);
        return false;
      }

      setVerifiedSession(verifyData.sessionToken, verifyData.user);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setAuthError('Network failure during Pi authentication. Please check your connection.');
      setIsLoading(false);
      return false;
    }
  }, [setVerifiedSession]);

  /**
   * Signs the user out, cleans storage, and informs the server.
   */
  const signOut = useCallback(async () => {
    const currentToken = sessionToken;
    setUser(null);
    setSessionToken(null);
    localStorage.removeItem(PI_SESSION_STORAGE_KEY);

    if (currentToken) {
      try {
        await fetch('/api/pi/signout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${currentToken}` },
        });
      } catch (err) {
        // Ignore network errors on logout
      }
    }
  }, [sessionToken]);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  return (
    <PiAuthContext.Provider
      value={{
        user,
        sessionToken,
        isAuthenticated: Boolean(user && sessionToken),
        isLoading,
        authError,
        signInWithPiOAuth,
        signInWithPiBrowserSdk,
        signOut,
        setVerifiedSession,
        clearAuthError,
      }}
    >
      {children}
    </PiAuthContext.Provider>
  );
};

export const usePiAuth = (): PiAuthContextType => {
  const context = useContext(PiAuthContext);
  if (!context) {
    throw new Error('usePiAuth must be used within a PiAuthProvider');
  }
  return context;
};
