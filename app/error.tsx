'use client';

import React from 'react';

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{ backgroundColor: '#060B18', color: '#f1f5f9' }}
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-5"
    >
      <img
        src="/logo.png"
        alt="GOYE Web3 Business Hub"
        width={72}
        height={72}
        className="w-18 h-18 rounded-2xl object-cover border border-slate-700/70"
      />
      <div className="space-y-1.5">
        <h1 className="text-xl font-bold text-white">GOYE Web3 Business Hub</h1>
        <p className="text-sm text-slate-400">Refreshing application state...</p>
      </div>
      <button
        type="button"
        onClick={() => reset()}
        className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#e5c14b] text-[#0A1128] font-bold text-sm cursor-pointer transition-colors"
      >
        Reload Hub
      </button>
    </div>
  );
}
