import React, { useState, useEffect } from 'react';
import { detectPiEnvironment } from '../utils/piSdk';
import { usePiAuth } from '../context/PiAuthContext';
import { ShieldCheck, Smartphone, Globe, Menu, X, Key, LogOut, User } from 'lucide-react';
import { GoyeLogo } from './GoyeLogo';
import { PWAInstallButton } from './PWAInstallButton';

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
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [envStatus, setEnvStatus] = useState({ isPiBrowser: false, isSdkLoaded: false });

  const { user, isAuthenticated, signOut } = usePiAuth();

  useEffect(() => {
    const env = detectPiEnvironment();
    setEnvStatus(env);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Ecosystem' },
    { id: 'products', label: '15 Products' },
    { id: 'business-id', label: 'Business ID' },
    { id: 'marketplace', label: 'Marketplace' },
    { id: 'contracts-invoices', label: 'Contracts & Invoices' },
    { id: 'ai-agents', label: 'AI Agents' },
    { id: 'trade-assurance', label: 'Trade Assurance' },
    { id: 'academy', label: 'Academy' },
    { id: 'admin', label: 'Admin' },
    { id: 'pi-status', label: 'System Status' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0B0E14]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Official GOYE Logo Brand Zone */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('home')}
              className="text-left group flex items-center focus:outline-none cursor-pointer"
            >
              <GoyeLogo size="sm" subtitle="Business Hub" />
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

          {/* Zone 3: Actions + Auth + Unboxed Environment Label */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Unboxed environment indicator (Zero-pill discipline) */}
            <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-400">
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

            {/* Official Pi Sign-in Button / Authenticated Pioneer Badge */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 rounded-md hover:bg-emerald-950/70 transition-colors whitespace-nowrap"
                  title="Verified Pi Pioneer Account"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="max-w-[120px] truncate">@{user.username}</span>
                </button>

                {/* Pioneer Profile Dropdown Popover */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#12161F] border border-white/10 rounded-xl shadow-2xl p-3 z-50 text-xs space-y-2.5">
                    <div className="border-b border-white/5 pb-2">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Verified Pioneer</div>
                      <div className="text-sm font-bold text-[#D4AF37] flex items-center gap-1 mt-0.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        @{user.username}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-1 truncate">
                        UID: {user.uid}
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 leading-snug">
                      Authenticated via official Pi Network OAuth. Transactions require separate approvals.
                    </div>

                    <div className="pt-2 border-t border-white/5 flex gap-2">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onNavigate('signin');
                        }}
                        className="flex-1 py-1.5 px-2 bg-white/5 hover:bg-white/10 text-white rounded text-center transition-colors font-medium text-[11px]"
                      >
                        Auth Details
                      </button>
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          signOut();
                        }}
                        className="py-1.5 px-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded text-center transition-colors font-medium text-[11px] flex items-center gap-1"
                      >
                        <LogOut className="w-3 h-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onNavigate('signin')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#D4AF37] border border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 rounded-md transition-colors whitespace-nowrap"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Sign in with Pi</span>
              </button>
            )}

            {/* PWA Install Button */}
            <PWAInstallButton variant="header" />

            {/* Register Business ID Action Button */}
            <button
              onClick={onOpenCreateBusiness}
              className="px-3.5 py-2 text-xs font-semibold text-[#0B0E14] bg-[#D4AF37] hover:bg-[#e0bc46] rounded-md transition-colors shadow-sm whitespace-nowrap shrink-0"
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
          <div className="flex items-center justify-between py-2 px-3 text-xs text-slate-400 border-b border-white/5 mb-2">
            <div>
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

            {isAuthenticated && user && (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> @{user.username}
              </span>
            )}
          </div>

          {/* Mobile Auth Button */}
          <div className="px-3 py-1">
            {isAuthenticated && user ? (
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40">
                <div className="flex items-center gap-2 text-xs">
                  <User className="w-4 h-4 text-[#D4AF37]" />
                  <span className="font-semibold text-white">@{user.username}</span>
                </div>
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-rose-300 hover:text-rose-200 flex items-center gap-1 font-medium"
                >
                  <LogOut className="w-3 h-3" />
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onNavigate('signin');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-[#D4AF37] border border-[#D4AF37]/40 bg-[#D4AF37]/5 rounded-md"
              >
                <Key className="w-3.5 h-3.5" />
                Sign in with Pi
              </button>
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

          <div className="pt-2 space-y-2">
            <PWAInstallButton variant="mobile" />
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
