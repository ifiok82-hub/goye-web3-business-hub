'use client';
import React, { useState, useRef } from 'react';
import { Lock } from 'lucide-react';

interface FooterWithAdminTapProps {
  onNavigate?: (view: string) => void;
}

export default function FooterWithAdminTap({ onNavigate }: FooterWithAdminTapProps) {
  const [tapCount, setTapCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setTapCount(0), 3000);
    if (newCount >= 7) {
      setTapCount(0);
      try {
        if (typeof window === 'undefined') return;
        const secret = window.prompt('Enter Admin Secret:');
        if (secret === 'GoyeAdmin@2026') {
          try {
            if (window.localStorage) {
              window.localStorage.setItem('goye_admin', 'true');
            }
          } catch {
            // Ignore restricted storage
          }
          if (onNavigate) {
            onNavigate('admin');
          } else {
            window.location.href = '/admin';
          }
        }
      } catch {
        // Ignore restricted prompt
      }
    }
  };

  return (
    <footer className="w-full bg-[#070C1A] border-t border-slate-800/80 px-6 py-12 mt-16">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div
          onClick={handleTap}
          className="flex items-center gap-4 cursor-pointer select-none active:scale-95 transition-transform"
        >
          <img
            src="/logo.png"
            alt="GOYE Web3 Business Hub"
            width={64}
            height={64}
            className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-700/60"
          />
          <div className="space-y-1">
            <div className="text-white font-bold text-base tracking-normal">
              GOYE Web3 Business Hub
            </div>
            <div className="text-slate-400 text-xs leading-relaxed">
              Build Your Business. Take It Online. Add AI.
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
          <a href="/privacy.html" className="hover:text-white transition-colors">
            Privacy Policy
          </a>
          <a href="/terms.html" className="hover:text-white transition-colors">
            Terms of Service
          </a>
          <span className="inline-flex items-center gap-1.5 text-slate-500">
            <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Non-Custodial Commercial Registry</span>
          </span>
          <span className="text-slate-500 font-mono">Build GOYE-ALLOW-FIX</span>
        </div>
      </div>
    </footer>
  );
}
