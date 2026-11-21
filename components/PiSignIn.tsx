'use client';
import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

declare global {
  interface Window {
    Pi?: any;
  }
}

const APP_STUDIO_LOGIN_URL =
  'https://backend.appstudio-u7cm9zhmha0ruwv8.piappengine.com/pi/auth/v1/login';

let piSdkPromise: Promise<boolean> | null = null;
let piInitialized = false;

function loadPiSdkOnce(): Promise<boolean> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.resolve(false);
  }
  if (window.Pi) return Promise.resolve(true);
  if (piSdkPromise) return piSdkPromise;

  piSdkPromise = new Promise<boolean>((resolve) => {
    try {
      const existing = document.querySelector(
        'script[src="https://sdk.minepi.com/pi-sdk.js"]'
      );
      if (existing) {
        if (window.Pi) {
          resolve(true);
          return;
        }
        existing.addEventListener('load', () => resolve(Boolean(window.Pi)), { once: true });
        existing.addEventListener('error', () => resolve(false), { once: true });
        setTimeout(() => resolve(Boolean(window.Pi)), 4000);
        return;
      }

      const s = document.createElement('script');
      s.src = 'https://sdk.minepi.com/pi-sdk.js';
      s.async = true;
      s.onload = () => resolve(Boolean(window.Pi));
      s.onerror = () => resolve(false);
      document.head.appendChild(s);
    } catch {
      resolve(false);
    }
  });

  return piSdkPromise;
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
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const autoAttemptedRef = useRef(false);

  const runPiAuth = async (isAuto = false) => {
    if (loading || verified) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const loaded = await loadPiSdkOnce();
      if (!loaded || typeof window === 'undefined' || !window.Pi) {
        if (!isAuto) {
          setErrorMsg('Open in Pi Browser to sign in');
        }
        setLoading(false);
        return;
      }

      if (!piInitialized) {
        await Promise.resolve(window.Pi.init({ version: '2.0' }));
        piInitialized = true;
      }

      const onIncompletePayment = async (payment: any) => {
        if (payment?.identifier && payment?.transaction?.txid) {
          try {
            await fetch('/api/pi/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentId: payment.identifier,
                txid: payment.transaction.txid,
              }),
            });
          } catch {
            // Ignore incomplete payment recovery error during auth
          }
        }
      };

      const auth = await window.Pi.authenticate(['username', 'payments'], onIncompletePayment);
      const accessToken = auth?.accessToken;
      if (!accessToken || typeof accessToken !== 'string') {
        throw new Error('No accessToken returned');
      }

      // Send ONLY { accessToken } directly to Pi App Studio login endpoint
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
        // Fallback through Next.js API route (still sending ONLY { accessToken }) if direct browser CORS is blocked
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

    // Preload Pi SDK script once and auto-run auth if inside Pi Browser / App Studio preview
    loadPiSdkOnce().then((loaded) => {
      if (!autoAttemptedRef.current && loaded && isPiEnvironment()) {
        autoAttemptedRef.current = true;
        runPiAuth(true);
      }
    });
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
        onClick={() => runPiAuth(false)}
        disabled={loading}
        className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-semibold text-xs sm:text-sm inline-flex items-center gap-2 transition-colors shadow-lg shadow-purple-900/30 cursor-pointer whitespace-nowrap"
      >
        <span>{loading ? 'Verifying...' : 'Sign in with Pi'}</span>
      </button>
      {errorMsg ? <span className="text-[11px] text-red-300 mt-1">{errorMsg}</span> : null}
    </div>
  );
}
