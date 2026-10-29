/**
 * GOYE Web3 Business Hub - 7-Tap Secret Admin Access Hook
 */

import { useRef } from 'react';

export function useSevenTap(onNavigate?: (view: string) => void) {
  const tapCount = useRef(0);
  const lastTap = useRef(0);
  const timeout = useRef<any>(null);

  const handleTap = (e: any) => {
    if (e && e.preventDefault) e.preventDefault();
    const now = Date.now();
    if (now - lastTap.current > 2500) {
      tapCount.current = 0;
    }
    tapCount.current += 1;
    lastTap.current = now;

    console.log(`Goye tap ${tapCount.current}/7`);

    const el = document.getElementById('goye-secret-admin-logo');
    if (el) {
      el.style.transform = 'scale(0.95)';
      setTimeout(() => {
        el.style.transform = 'scale(1)';
      }, 100);
    }

    if (tapCount.current >= 7) {
      tapCount.current = 0;
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          (navigator as any).vibrate([100, 50, 100, 50, 200]);
        } catch (_) {}
      }
      alert('Admin access granted - Opening console...');
      if (onNavigate) {
        onNavigate('admin');
      }
      try {
        window.location.hash = '#admin';
      } catch (_) {}
    }

    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      tapCount.current = 0;
    }, 2500);
  };

  return handleTap;
}
