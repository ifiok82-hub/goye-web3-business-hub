'use client';
import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { handleIncompletePayment, initPiSdk, loadPiSdk, markPiSessionAuthenticated } from '../lib/piClient';

const APP_STUDIO_LOGIN_URL =
  'https://backend.appstudio-u7cm9zhmha0ruwv8.piappengine.com/pi/auth/v1/login';

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
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const autoAttemptedRef = useRef(false);

  const runSignIn = async (isAuto = false) => {
    if (loading || verified) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const ready = await initPiSdk();
      if (!ready || typeof window === 'undefined' || !window.Pi) {
        if (!isAuto) {
          setErrorMsg('Open in Pi Browser to sign in with Pi');
        }
        setLoading(false);
        return;
      }

      const auth = await window.Pi.authenticate(['username', 'payments'], handleIncompletePayment);
      const accessToken = auth?.accessToken;
      if (!accessToken || typeof accessToken !== 'string') {
        throw new Error('No accessToken returned');
      }

      const userUid = auth?.user?.uid ? String(auth.user.uid) : undefined;
      markPiSessionAuthenticated(userUid);

      if (userUid) {
        try {
          if (window.sessionStorage) {
            window.sessionStorage.setItem('pi_user_uid', userUid);
          }
        } catch {
          // Ignore restricted storage
        }
      }

      // Send ONLY { accessToken } to GOYE App Studio backend; never call /v2/me
      let authSucceeded = false;
      try {
        const appStudioRes = await fetch(APP_STUDIO_LOGIN_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken }),
        });

        if (appStudioRes.ok) {
          const appStudioData = await appStudioRes.json().catch(() => ({}));
          try {
            if (window.sessionStorage && appStudioData?.sessionToken) {
              window.sessionStorage.setItem(
                'pi_sessionToken',
                String(appStudioData.sessionToken)
              );
            }
          } catch {
            // Ignore restricted storage
          }
          authSucceeded = true;
        } else {
          const errBody = await appStudioRes.text().catch(() => '');
          throw new Error(`HTTP ${appStudioRes.status} ${errBody}`);
        }
      } catch (directErr) {
        const proxyRes = await fetch('/api/pi/appstudio-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken }),
        });
        if (!proxyRes.ok) {
          throw directErr;
        }
        const proxyData = await proxyRes.json().catch(() => ({}));
        try {
          if (window.sessionStorage && proxyData?.sessionToken) {
            window.sessionStorage.setItem('pi_sessionToken', String(proxyData.sessionToken));
          }
        } catch {
          // Ignore restricted storage
        }
        authSucceeded = true;
      }

      if (authSucceeded) {
        console.log('AppStudio auth sent');
        setVerified(true);
        window.dispatchEvent(new CustomEvent('goye:entitlements-updated'));
      }
    } catch (err: any) {
      console.log('AppStudio auth failed', err?.message || err);
      if (!isAuto) {
        setErrorMsg('Sign-in failed — tap to retry');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Only auto-run Pi.authenticate inside Pi Browser / App Studio preview;
    // outside Pi Browser, defer until user taps "Sign in with Pi" so page loads fast with zero timeouts.
    if (isPiEnvironment()) {
      loadPiSdk().then((loaded) => {
        if (!autoAttemptedRef.current && loaded) {
          autoAttemptedRef.current = true;
          runSignIn(true);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (verified) {
    return (
      <span className="px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 font-semibold text-xs sm:text-sm inline-flex items-center gap-2 whitespace-nowrap">
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        <span>Pi Verified Testnet</span>
      </span>
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
        <span>{loading ? 'Verifying...' : 'Sign in with Pi'}</span>
      </button>
      {errorMsg ? <span className="text-[11px] text-red-300 mt-1">{errorMsg}</span> : null}
    </div>
  );
}
