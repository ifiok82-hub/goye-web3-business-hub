'use client';
import React, { useState, useRef } from 'react';
import { Shield } from 'lucide-react';

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
      const secret = window.prompt('Enter Admin Secret:');
      if (secret === 'GoyeAdmin@2026') {
        localStorage.setItem('goye_admin', 'true');
        if (onNavigate) {
          onNavigate('admin');
        } else {
          window.location.href = '/admin';
        }
      }
    }
  };

  return (
    <footer className="w-full bg-[#07090E] border-t border-slate-800/80 px-6 py-10 mt-16">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div
          onClick={handleTap}
          className="flex items-center gap-3 cursor-pointer select-none active:scale-95 transition-transform"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5D061] via-[#D4AF37] to-[#8C6A1B] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20 border border-[#F5D061]/40">
            <span className="font-black text-[#0B0E14] text-lg tracking-tight">G</span>
          </div>
          <div>
            <div className="text-white font-bold text-sm tracking-wide">
              GOYE WEB3 BUSINESS HUB
            </div>
            <div className="text-slate-400 text-xs">
              AI + Web3 Business Infrastructure • Pi Powered
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
            <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
            Non-Custodial Commercial Registry
          </span>
        </div>
      </div>
    </footer>
  );
}
