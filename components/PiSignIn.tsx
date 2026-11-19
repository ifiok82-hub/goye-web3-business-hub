'use client';
import React, { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface PiSdk {
  init: (config: { version: string; sandbox?: boolean }) => Promise<void> | void;
  authenticate: (
    scopes: string[],
    onIncompletePaymentFound: (payment: unknown) => void
  ) => Promise<{ accessToken: string; user?: { uid?: string; username?: string } }>;
}

type PiWindow = Window & { Pi?: PiSdk };

let piSdkPromise: Promise<void> | null = null;
let piInitialized = false;

function getPi(): PiSdk | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as PiWindow).Pi;
}

function loadPiSdkOnce(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (getPi()) return Promise.resolve();
  if (piSdkPromise) return piSdkPromise;

  piSdkPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector('script[src="https://sdk.minepi.com/pi-sdk.js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Pi SDK')), { once: true });
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://sdk.minepi.com/pi-sdk.js';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load Pi SDK'));
    document.head.appendChild(s);
  });

  return piSdkPromise;
}

export default function PiSignIn() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'verified' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const savedToken = sessionStorage.getItem('pi_appstudio_session_token');
        if (savedToken && active) {
          setStatus('verified');
        }
        await loadPiSdkOnce();
        const Pi = getPi();
        if (Pi && !piInitialized) {
          await Promise.resolve(Pi.init({ version: '2.0' }));
          piInitialized = true;
        }
      } catch {
        // Ignore SDK load failure outside Pi Browser until user clicks
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleSignIn = async () => {
    if (status === 'loading') return;
    setStatus('loading');
    setErrorMsg('');

    try {
      await loadPiSdkOnce();
      const Pi = getPi();
      if (!Pi) {
        throw new Error('Open inside Pi Browser to sign in with Pi.');
      }

      if (!piInitialized) {
        await Promise.resolve(Pi.init({ version: '2.0' }));
        piInitialized = true;
      }

      const onIncompletePaymentFound = (_payment: unknown) => {
        // Handled silently during App Studio sign-in
      };

      const auth = await Pi.authenticate(['username'], onIncompletePaymentFound);
      if (!auth?.accessToken) {
        throw new Error('No access token returned by Pi SDK.');
      }

      // Send ONLY accessToken to /api/pi/appstudio-auth (one exchange per sign-in)
      const res = await fetch('/api/pi/appstudio-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: auth.accessToken }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.user?.uid) {
        throw new Error(data?.error || 'Pi App Studio authentication failed.');
      }

      if (data.sessionToken) {
        sessionStorage.setItem('pi_appstudio_session_token', String(data.sessionToken));
      } else {
        sessionStorage.setItem('pi_appstudio_session_token', 'verified');
      }

      setStatus('verified');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to sign in with Pi.';
      setStatus('error');
      setErrorMsg(msg);
    }
  };

  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        onClick={handleSignIn}
        disabled={status === 'loading'}
        className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-semibold text-xs sm:text-sm inline-flex items-center gap-2 transition-colors shadow-lg shadow-purple-900/30 cursor-pointer"
      >
        {status === 'verified' ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>Pi Verified ✓</span>
          </>
        ) : status === 'loading' ? (
          <span>Signing in...</span>
        ) : (
          <span>Sign in with Pi</span>
        )}
      </button>
      {status === 'error' && errorMsg && (
        <span className="text-[11px] text-red-300 mt-1 max-w-[240px] text-right">
          {errorMsg}
        </span>
      )}
    </div>
  );
}
