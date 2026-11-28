'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, LogOut, AlertCircle } from 'lucide-react';
import {
  handleIncompletePayment,
  hasPiSdk,
  initPiSdk,
  isPiSandboxClient,
} from '../lib/piClient';

interface VerifiedPiUser {
  uid: string;
  username: string;
}

function isPiEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = typeof window.navigator !== 'undefined' ? window.navigator.userAgent || '' : '';
  const ref = typeof document !== 'undefined' ? document.referrer || '' : '';
  const inIframe = window.self !== window.top;
  return (
    Boolean(window.Pi) ||
    /PiBrowser/i.test(ua) ||
    (inIframe && /minepi|pinet|piappengine|socialchain/i.test(ref))
  );
}

export default function PiSignIn() {
  const [user, setUser] = useState<VerifiedPiUser | null>(null);
  const [sdkReady, setSdkReady] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const autoAttemptedRef = useRef(false);

  const syncServerSession = async () => {
    try {
      const res = await fetch('/api/auth/pi', {
        cache: 'no-store',
        credentials: 'include',
      });
      if (!res.ok) return;
      const data = await res.json().catch(() => null);
      if (data?.authenticated && data?.user?.uid && data?.user?.username) {
        const verifiedUser: VerifiedPiUser = {
          uid: String(data.user.uid),
          username: String(data.user.username),
        };
        setUser(verifiedUser);
        try {
          window.sessionStorage?.setItem('pi_user_uid', verifiedUser.uid);
        } catch {
          // Ignore restricted storage
        }
      } else {
        setUser(null);
      }
    } catch {
      // Ignore transient session check errors
    }
  };

  const runSignIn = async (isAuto = false) => {
    if (loading || user) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const ready = await initPiSdk();
      setSdkReady(ready && hasPiSdk());
      if (!ready || typeof window === 'undefined' || !window.Pi) {
        if (!isAuto) {
          setErrorMsg('Pi Browser / Pi SDK required for Pi sign-in and payments.');
        }
        return;
      }

      const auth = await window.Pi.authenticate(
        ['username', 'payments'],
        handleIncompletePayment
      );
      const accessToken = auth?.accessToken;
      if (!accessToken || typeof accessToken !== 'string') {
        throw new Error('Pi did not return an access token.');
      }

      const res = await fetch('/api/auth/pi', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken,
          user: auth?.user
            ? {
                uid: auth.user.uid,
                username: auth.user.username,
              }
            : undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.authenticated || !data?.user?.username || !data?.user?.uid) {
        throw new Error(
          typeof data?.error === 'string' && data.error
            ? data.error
            : `Pi authentication verification failed (${res.status}).`
        );
      }

      const verifiedUser: VerifiedPiUser = {
        uid: String(data.user.uid),
        username: String(data.user.username),
      };

      try {
        window.sessionStorage?.setItem('pi_user_uid', verifiedUser.uid);
      } catch {
        // Ignore restricted storage
      }

      setUser(verifiedUser);
      window.dispatchEvent(new CustomEvent('goye:auth-updated', { detail: verifiedUser }));
      window.dispatchEvent(new CustomEvent('goye:entitlements-updated'));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err || 'Pi sign-in cancelled or failed.');
      if (!isAuto) {
        setErrorMsg(msg || 'Pi sign-in failed. Please allow access and retry.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/pi', { method: 'DELETE', credentials: 'include' });
    } catch {
      // Ignore network errors on sign out
    }
    try {
      window.sessionStorage?.removeItem('pi_user_uid');
    } catch {
      // Ignore restricted storage
    }
    setUser(null);
    setErrorMsg('');
    window.dispatchEvent(new CustomEvent('goye:auth-updated', { detail: null }));
    window.dispatchEvent(new CustomEvent('goye:entitlements-updated'));
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let mounted = true;

    syncServerSession();

    initPiSdk().then((loaded) => {
      if (!mounted) return;
      const available = loaded && hasPiSdk();
      setSdkReady(available);

      if (available && isPiEnvironment() && !autoAttemptedRef.current) {
        autoAttemptedRef.current = true;
        // Only auto-authenticate if no verified server session is already loaded
        fetch('/api/auth/pi', { cache: 'no-store', credentials: 'include' })
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            if (mounted && !data?.authenticated) {
              runSignIn(true);
            }
          })
          .catch(() => undefined);
      }
    });

    const onAuthUpdated = (event: Event) => {
      const custom = event as CustomEvent<VerifiedPiUser | null>;
      if (custom.detail && custom.detail.username && custom.detail.uid) {
        setUser(custom.detail);
        setErrorMsg('');
      } else {
        syncServerSession();
      }
    };

    window.addEventListener('goye:auth-updated', onAuthUpdated);
    return () => {
      mounted = false;
      window.removeEventListener('goye:auth-updated', onAuthUpdated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span
          className="px-3.5 py-2 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 font-semibold text-xs sm:text-sm inline-flex items-center gap-2 whitespace-nowrap"
          title={`Verified Pi UID: ${user.uid}`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>@{user.username}</span>
          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-200">
            {isPiSandboxClient() ? 'Testnet' : 'Mainnet'}
          </span>
        </span>
        <button
          type="button"
          onClick={handleSignOut}
          title="Sign out of Pi session"
          aria-label="Sign out of Pi session"
          className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        onClick={() => runSignIn(false)}
        disabled={loading}
        className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-semibold text-xs sm:text-sm inline-flex items-center gap-2 transition-colors shadow-lg shadow-purple-900/30 cursor-pointer whitespace-nowrap"
      >
        <span>{loading ? 'Verifying Pi...' : 'Sign in with Pi'}</span>
      </button>
      {errorMsg ? (
        <span className="text-[11px] text-red-300 mt-1 max-w-[260px] text-right inline-flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{errorMsg}</span>
        </span>
      ) : sdkReady === false ? (
        <span className="text-[11px] text-amber-300/90 mt-1 text-right">
          Pi Browser / Pi SDK required for Pi features
        </span>
      ) : null}
    </div>
  );
}
