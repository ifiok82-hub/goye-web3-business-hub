'use client';
import { useEffect, useState } from 'react';
declare global { interface Window { Pi: any } }
export default function PiSignIn() {
  const [status, setStatus] = useState('Sign in with Pi');
  const [done, setDone] = useState(false);
  const [errorText, setErrorText] = useState('');
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.querySelector('script[src="https://sdk.minepi.com/pi-sdk.js"]')) return;
    const s = document.createElement('script');
    s.src = 'https://sdk.minepi.com/pi-sdk.js';
    s.async = true;
    document.head.appendChild(s);
  }, []);
  async function signIn() {
    try {
      setErrorText('');
      setStatus('Connecting...');
      if (typeof window === 'undefined' || !window.Pi) {
        setStatus('Sign in with Pi');
        setErrorText('Open in Pi Browser to sign in');
        return;
      }
      await window.Pi.init({ version: '2.0' });
      const auth = await window.Pi.authenticate(['username'], (p: any) => { console.log(p); });
      setStatus('Verifying...');
      const res = await fetch('/api/pi/appstudio-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: auth.accessToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'App Studio rejected');
      try {
        if (window.sessionStorage && data.sessionToken) {
          window.sessionStorage.setItem('pi_sessionToken', data.sessionToken);
        }
      } catch {}
      setDone(true);
      setStatus('Pi Verified ✓');
    } catch (e: any) {
      setStatus('Sign in with Pi - Tap to retry');
      setErrorText(e?.message || 'Pi sign-in failed');
    }
  }
  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        onClick={signIn}
        style={{ background: '#a855f7', color: '#fff', padding: '10px 18px', borderRadius: '9999px', fontWeight: 700, fontSize: '14px' }}
        className="whitespace-nowrap cursor-pointer hover:opacity-90 transition-opacity"
      >
        {done ? 'Pi Verified ✓' : status}
      </button>
      {errorText ? <span className="text-[11px] text-red-300 mt-1">{errorText}</span> : null}
    </div>
  );
}
