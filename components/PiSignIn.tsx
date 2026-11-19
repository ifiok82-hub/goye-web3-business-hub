'use client';
import { useEffect, useState } from 'react';
declare global { interface Window { Pi: any } }
export default function PiSignIn() {
  const [status, setStatus] = useState('Sign in with Pi');
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (document.querySelector('script[src="https://sdk.minepi.com/pi-sdk.js"]')) return;
    const s = document.createElement('script');
    s.src = 'https://sdk.minepi.com/pi-sdk.js';
    s.async = true;
    document.head.appendChild(s);
  }, []);
  async function signIn() {
    try {
      setStatus('Connecting...');
      if (!window.Pi) { setStatus('Pi SDK not loaded - open in Pi Browser'); return; }
      await window.Pi.init({ version: '2.0' });
      const auth = await window.Pi.authenticate(['username'], (p: any) => { console.log(p); });
      setStatus('Verifying...');
      const res = await fetch('/api/pi/appstudio-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: auth.accessToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'App Studio rejected');
      try { sessionStorage.setItem('pi_sessionToken', data.sessionToken); } catch {}
      setDone(true);
      setStatus('Pi Verified ✓');
    } catch (e: any) {
      setStatus('Sign in with Pi - Tap to retry');
      alert('Pi sign-in failed: ' + (e.message || e));
    }
  }
  return (
    <button onClick={signIn} style={{ background: '#a855f7', color: '#fff', padding: '16px', borderRadius: '12px', width: '100%', fontWeight: 700, fontSize: '18px' }}>
      {done ? 'Pi Verified ✓' : status}
    </button>
  );
}
