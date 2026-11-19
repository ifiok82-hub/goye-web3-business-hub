'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock, LogOut } from 'lucide-react';
import AdminPiTools from '../../components/AdminPiTools';

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [inputSecret, setInputSecret] = useState('');

  useEffect(() => {
    try {
      const auth = localStorage.getItem('goye_admin');
      if (auth === 'true') {
        setIsAdmin(true);
      }
    } catch {
      // Ignore restricted storage
    }
    setChecking(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputSecret === 'GoyeAdmin@2026') {
      try {
        localStorage.setItem('goye_admin', 'true');
      } catch {
        // Ignore restricted storage
      }
      setIsAdmin(true);
    } else {
      setInputSecret('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('goye_admin');
    setIsAdmin(false);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0B0E14] text-slate-300 p-8 flex items-center justify-center text-sm">
        Checking authorization...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-[#0B0E14] text-white flex items-center justify-center p-6">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm bg-[#121620] border border-slate-800 p-6 rounded-2xl space-y-4 shadow-2xl"
        >
          <div className="text-center space-y-1">
            <div className="w-11 h-11 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <h1 className="text-xl font-bold text-white">GOYE Admin Access</h1>
            <p className="text-xs text-slate-400">Restricted to authorized system operators</p>
          </div>
          <input
            type="password"
            placeholder="Enter Admin Secret"
            value={inputSecret}
            onChange={(e) => setInputSecret(e.target.value)}
            className="w-full bg-black/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500"
          />
          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer"
          >
            Authenticate Admin
          </button>
          <div className="text-center">
            <Link href="/" className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Public Hub
            </Link>
          </div>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B0E14] text-white p-6 md:p-10 space-y-8 max-w-5xl mx-auto">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="text-xs font-bold text-yellow-500 uppercase tracking-widest">
            Management Console
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">GOYE Enterprise Hub Admin</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Public Hub
          </Link>
          <button
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-xl bg-red-950/50 border border-red-800/50 hover:bg-red-900/50 text-xs text-red-300 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Lock Session
          </button>
        </div>
      </header>

      <section>
        <AdminPiTools />
      </section>
    </main>
  );
}
