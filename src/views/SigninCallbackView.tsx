/**
 * GOYE Web3 Business Hub - Official Pi Network OAuth Callback View
 * Route: /signin/callback
 *
 * Handles official Pi OAuth 2.0 Implicit Grant callback:
 * 1. Reads access_token and state from URL fragment (#access_token=...&state=...)
 * 2. Verifies state against session storage (CSRF protection)
 * 3. Sends access_token to backend (/api/pi/oauth-verify)
 * 4. Backend verifies identity via official Pi Platform API (/v2/me)
 * 5. Displays verified Pioneer badge and establishes session
 * 6. Never mocks or simulates login success
 */

import React, { useEffect, useState } from 'react';
import {
  parseOAuthCallbackUrl,
  validateAndClearOAuthState,
} from '../constants/piAuth';
import { usePiAuth } from '../context/PiAuthContext';
import { CheckCircle2, AlertTriangle, ShieldCheck, Loader2, ArrowRight, RefreshCw, Globe, Key } from 'lucide-react';
import { GoyeLogo } from '../components/GoyeLogo';

interface SigninCallbackViewProps {
  onNavigate: (view: string) => void;
}

export const SigninCallbackView: React.FC<SigninCallbackViewProps> = ({ onNavigate }) => {
  const { setVerifiedSession } = usePiAuth();

  const [status, setStatus] = useState<'processing' | 'verifying_api' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [verifiedUsername, setVerifiedUsername] = useState<string | null>(null);
  const [verifiedUid, setVerifiedUid] = useState<string | null>(null);
  const [returnTarget, setReturnTarget] = useState<string>('home');

  useEffect(() => {
    let isMounted = true;

    async function processCallback() {
      // 1. Parse callback parameters from URL fragment and query
      const callbackData = parseOAuthCallbackUrl();

      // Check for authorization error returned by Pi Network (e.g. user cancelled or denied)
      if (callbackData.error) {
        if (!isMounted) return;
        setStatus('error');
        if (callbackData.error === 'access_denied') {
          setErrorMessage('Pi Sign-in was cancelled or access was denied by the user.');
        } else {
          setErrorMessage(`Pi Authorization Server returned error: ${callbackData.error}`);
        }
        setErrorDetails(callbackData.errorDescription || 'The authorization request was not completed.');
        return;
      }

      // 2. Validate state against sessionStorage for CSRF protection
      const stateValidation = validateAndClearOAuthState(callbackData.state);
      if (!stateValidation.isValid) {
        if (!isMounted) return;
        setStatus('error');
        setErrorMessage('CSRF State Validation Failed');
        setErrorDetails(
          stateValidation.errorMessage ||
            'The returned OAuth state parameter does not match the active session. This protects against cross-site request forgery attacks.'
        );
        return;
      }

      if (stateValidation.returnView) {
        setReturnTarget(stateValidation.returnView);
      }

      // 3. Ensure access_token is present in the implicit grant fragment
      if (!callbackData.accessToken) {
        if (!isMounted) return;
        setStatus('error');
        setErrorMessage('Missing Pi Access Token');
        setErrorDetails(
          'No access token was returned in the authorization callback fragment. Please initiate sign-in again.'
        );
        return;
      }

      // 4. Send token to GOYE backend to verify against official Pi Platform API
      if (!isMounted) return;
      setStatus('verifying_api');

      try {
        const verifyRes = await fetch('/api/pi/oauth-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: callbackData.accessToken }),
        });

        const data = await verifyRes.json();

        if (!isMounted) return;

        if (verifyRes.ok && data.success && data.user) {
          // Success: Authoritative identity verified by Pi Platform API
          setVerifiedUsername(data.user.username);
          setVerifiedUid(data.user.uid);
          setVerifiedSession(data.sessionToken, data.user, data.expiresAt);
          setStatus('success');

          // Notify opener if this callback ran inside a popup
          if (window.opener && window.opener !== window) {
            try {
              window.opener.postMessage(
                {
                  type: 'PI_OAUTH_AUTH_SUCCESS',
                  user: data.user,
                  sessionToken: data.sessionToken,
                },
                '*'
              );
            } catch (_) {}
          }

          // Auto-redirect after 2 seconds
          setTimeout(() => {
            if (isMounted) {
              // Clean URL hash to remove token from browser history
              if (window.history && window.history.replaceState) {
                window.history.replaceState(null, '', '/');
              }
              onNavigate(stateValidation.returnView || 'home');
            }
          }, 2200);
        } else {
          // Failure response from backend / Pi Platform API
          setStatus('error');
          setErrorMessage(data.error || 'Pi authentication is currently unavailable. Please try again later.');
          setErrorDetails(data.details || 'The access token could not be verified by the Pi Platform API.');
        }
      } catch (networkErr: any) {
        if (!isMounted) return;
        setStatus('error');
        setErrorMessage('Pi authentication is currently unavailable. Please check your network connection.');
        setErrorDetails(networkErr?.message || 'Failed to communicate with the verification server.');
      }
    }

    processCallback();

    return () => {
      isMounted = false;
    };
  }, [setVerifiedSession, onNavigate]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-[#12161F] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl -z-0 pointer-events-none" />

        <div className="relative z-10 text-center space-y-6">
          {/* Brand Logo */}
          <div className="flex justify-center pb-2 border-b border-white/5">
            <GoyeLogo size="sm" subtitle="Official Callback" />
          </div>

          {/* Header Icon */}
          <div className="flex justify-center">
            {status === 'processing' || status === 'verifying_api' ? (
              <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : status === 'success' ? (
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-8 h-8" />
              </div>
            )}
          </div>

          {/* Title and Descriptions */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {status === 'processing' && 'Processing Pi Sign-in...'}
              {status === 'verifying_api' && 'Verifying Pioneer Identity...'}
              {status === 'success' && 'Pi Network Authentication Verified'}
              {status === 'error' && 'Pi Authentication Notice'}
            </h1>
            <p className="text-sm text-slate-400 mt-2">
              {status === 'processing' && 'Validating CSRF state tokens and response parameters.'}
              {status === 'verifying_api' &&
                'Contacting the official Pi Platform API (/v2/me) as the source of truth.'}
              {status === 'success' && 'Official Pi Pioneer session established for GOYE Web3 Business Hub.'}
              {status === 'error' && errorMessage}
            </p>
          </div>

          {/* Success Card */}
          {status === 'success' && (
            <div className="bg-[#0B0E14] border border-emerald-500/30 rounded-xl p-4 text-left space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <span className="text-xs text-slate-400">Authenticated Pioneer:</span>
                <span className="text-sm font-semibold text-[#D4AF37] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  @{verifiedUsername}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Pi User ID:</span>
                <span className="font-mono text-slate-300">
                  {verifiedUid ? `${verifiedUid.slice(0, 8)}...${verifiedUid.slice(-6)}` : 'Verified'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Verification Source:</span>
                <span className="text-emerald-400 font-medium">Official Pi Platform API (v2)</span>
              </div>
              <div className="pt-2 text-[11px] text-slate-400 border-t border-white/5 flex items-center gap-2">
                <Key className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <span>
                  Identity verified. Separate authorization is required for any payment transaction.
                </span>
              </div>
            </div>
          )}

          {/* Error Details Card */}
          {status === 'error' && (
            <div className="bg-[#0B0E14] border border-rose-500/20 rounded-xl p-4 text-left space-y-2">
              <div className="text-xs font-semibold text-rose-300">Diagnostic Details:</div>
              <div className="text-xs text-slate-400 font-mono break-words bg-black/40 p-2.5 rounded border border-white/5">
                {errorDetails || 'No additional technical error details reported.'}
              </div>
              <div className="text-[11px] text-slate-400 pt-1">
                Note: In accordance with Pi Developer security rules, mock and simulated logins are strictly
                disabled.
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2">
            {status === 'success' ? (
              <button
                onClick={() => {
                  if (window.history && window.history.replaceState) {
                    window.history.replaceState(null, '', '/');
                  }
                  onNavigate(returnTarget);
                }}
                className="w-full py-3 px-4 bg-[#D4AF37] hover:bg-[#e0bc46] text-[#0B0E14] font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Continue to Ecosystem
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : status === 'error' ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => onNavigate('signin')}
                  className="flex-1 py-2.5 px-4 bg-[#D4AF37] hover:bg-[#e0bc46] text-[#0B0E14] font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
                <button
                  onClick={() => onNavigate('home')}
                  className="flex-1 py-2.5 px-4 bg-white/5 hover:bg-white/10 text-white font-medium text-sm rounded-lg border border-white/10 transition-colors"
                >
                  Return to Ecosystem
                </button>
              </div>
            ) : (
              <div className="text-xs text-slate-400 flex items-center justify-center gap-2">
                <Globe className="w-3.5 h-3.5" />
                <span>Redirecting automatically upon verification...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
