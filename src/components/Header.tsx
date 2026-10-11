import React, { useState, useEffect } from 'react';
import { detectPiEnvironment } from '../utils/piSdk';
import { Shield, Sparkles, Smartphone, Globe, Menu, X } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenCreateBusiness: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenCreateBusiness,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [envStatus, setEnvStatus] = useState({ isPiBrowser: false, isSdkLoaded: false });

  useEffect(() => {
    const env = detectPiEnvironment();
    setEnvStatus(env);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Ecosystem' },
    { id: 'business-id', label: 'Business ID' },
    { id: 'marketplace', label: 'Marketplace' },
    { id: 'contracts-invoices', label: 'Contracts & Invoices' },
    { id: 'ai-agents', label: 'AI Agents' },
    { id: 'trade-assurance', label: 'Trade Assurance' },
    { id: 'academy', label: 'Academy' },
    { id: 'pi-status', label: 'System Status' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0B0E14]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single Wordmark Brand Zone */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('home')}
              className="text-left group flex items-center gap-2.5 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#123B72] to-[#0B0E14] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] font-bold text-sm tracking-wider shadow-sm">
                G
              </div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-[#D4AF37] transition-colors whitespace-nowrap">
                GOYE <span className="text-[#D4AF37] font-semibold text-xs tracking-widest uppercase ml-1">Business Hub</span>
              </span>
            </button>
          </div>

          {/* Zone 2: Single-line Text Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
            {navLinks.map((link) => {
              const isActive = currentView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                    isActive
                      ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] font-semibold'
                      : 'hover:text-white'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action + Clean Unboxed Environment Label */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Unboxed environment indicator (Zero-pill discipline) */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
              {envStatus.isPiBrowser ? (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className="text-[#D4AF37] font-medium">Pi Browser Active</span>
                </>
              ) : (
                <>
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>Standard Browser</span>
                </>
              )}
            </div>

            <button
              onClick={onOpenCreateBusiness}
              className="px-4 py-2 text-xs font-semibold text-[#0B0E14] bg-[#D4AF37] hover:bg-[#e0bc46] rounded-md transition-colors shadow-sm whitespace-nowrap shrink-0"
            >
              Register Business ID
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0B0E14] border-b border-white/10 px-4 pt-2 pb-6 space-y-2">
          <div className="flex items-center gap-2 py-2 px-3 text-xs text-slate-400 border-b border-white/5 mb-2">
            {envStatus.isPiBrowser ? (
              <span className="text-[#D4AF37] font-medium flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5" /> Pi Browser Mode
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-400">
                <Globe className="w-3.5 h-3.5" /> Web2 Standard Browser
              </span>
            )}
          </div>
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onNavigate(link.id);
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                currentView === link.id
                  ? 'bg-white/10 text-[#D4AF37] font-semibold'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2">
            <button
              onClick={() => {
                onOpenCreateBusiness();
                setMobileMenuOpen(false);
              }}
              className="w-full text-center px-4 py-2.5 text-xs font-semibold text-[#0B0E14] bg-[#D4AF37] rounded-md"
            >
              Register Business ID
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
