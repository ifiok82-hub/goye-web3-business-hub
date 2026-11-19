'use client';
import React, { useEffect, useState } from 'react';
import {
  Building2,
  Briefcase,
  Scale,
  Activity,
  Sparkles,
  Globe,
  FileCheck2,
  X,
  ArrowRight,
  Layers,
  BadgeCheck,
  Menu,
} from 'lucide-react';
import PiSignIn from '../components/PiSignIn';
import LockedProducts from '../components/LockedProducts';
import FooterWithAdminTap from '../components/FooterWithAdminTap';
import ErrorBoundary from '../components/ErrorBoundary';

interface BusinessRecord {
  id: string;
  name: string;
  category: string;
  country: string;
  level: number;
}

const SERVICES = [
  {
    title: 'African Enterprise Team Collaboration',
    desc: 'Coordinate cross-functional Web3 onboarding, autonomous AI intake, and verified commercial approvals in one workspace.',
    image: '/images/ai-assistant.jpg',
    tag: 'AI & Operations',
  },
  {
    title: 'Global Boardroom & Strategic Growth',
    desc: 'Connect Nigerian and pan-African enterprises to international B2B marketplaces and verified digital settlement corridors.',
    image: '/images/corporate.jpg',
    tag: 'Global Expansion',
  },
  {
    title: 'Digital Commerce & Mobile Payments',
    desc: 'Equip modern merchants and entrepreneurs with instant digital checkout confirmation and verifiable order ledgers.',
    image: '/images/ecommerce.jpg',
    tag: 'Verified Commerce',
  },
];

const VERIFICATION_LEVELS = [
  { level: 'Level 1', title: 'Registered Profile', desc: 'Unique GOYE-BIZ ID issued at onboarding.' },
  { level: 'Level 2', title: 'Documents Submitted', desc: 'Corporate filings queued for compliance audit.' },
  { level: 'Level 3', title: 'KYB Audited', desc: 'Entity registration and signatory verified.' },
  { level: 'Level 4', title: 'Trade Bonded', desc: 'Backed by Trade Assurance milestone protection.' },
  { level: 'Level 5', title: 'Global Enterprise', desc: 'Cross-border settlement & API tier unlocked.' },
];

const NAV_LINKS = [
  { href: '#ecosystem', label: 'Ecosystem' },
  { href: '#business-id', label: 'Business ID' },
  { href: '#flagship-products', label: '15 Products' },
  { href: '#marketplace', label: 'Marketplace' },
  { href: '#trade-assurance', label: 'Trade Assurance' },
  { href: '#system-audit', label: 'System Audit' },
];

export default function Page() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [bizName, setBizName] = useState('');
  const [bizCategory, setBizCategory] = useState('Software & AI');
  const [bizCountry, setBizCountry] = useState('Nigeria');
  const [registeredBusinesses, setRegisteredBusinesses] = useState<BusinessRecord[]>([
    {
      id: 'GOYE-BIZ-2026-000001',
      name: 'GOYE Digital Infrastructure Ltd',
      category: 'Enterprise Web3 & AI',
      country: 'Nigeria',
      level: 5,
    },
  ]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('goye_registered_businesses');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRegisteredBusinesses(parsed);
          }
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const handleCreateBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bizName.trim()) return;
    const seq = String(registeredBusinesses.length + 1).padStart(6, '0');
    const record: BusinessRecord = {
      id: `GOYE-BIZ-2026-${seq}`,
      name: bizName.trim(),
      category: bizCategory,
      country: bizCountry.trim() || 'Nigeria',
      level: 1,
    };
    const updated = [record, ...registeredBusinesses];
    setRegisteredBusinesses(updated);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('goye_registered_businesses', JSON.stringify(updated));
      }
    } catch {
      // Ignore storage errors
    }
    setBizName('');
    setShowCreateModal(false);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#060B18] text-slate-100 flex flex-col leading-relaxed tracking-normal">
        {/* Sticky Global Navigation */}
        <header className="sticky top-0 z-40 bg-[#0A1128]/95 backdrop-blur-md border-b border-slate-800/90">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-4 flex items-center justify-between gap-6">
            <a href="#top" className="flex items-center gap-3 shrink-0">
              <img
                src="/logo.png"
                alt="GOYE Web3 Business Hub"
                width={48}
                height={48}
                className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-700/70"
              />
              <div className="leading-snug">
                <div className="text-sm sm:text-base font-extrabold text-white tracking-normal">
                  GOYE <span className="text-[#F5D061]">WEB3</span> Business Hub
                </div>
                <div className="text-[11px] text-slate-400 hidden sm:block">
                  Build Your Business. Take It Online. Add AI.
                </div>
              </div>
            </a>

            <nav className="hidden lg:flex items-center flex-wrap gap-6 text-sm font-medium text-slate-300">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="hover:text-[#F5D061] transition-colors whitespace-nowrap"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3 shrink-0">
              <PiSignIn />

              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="hidden md:inline-flex px-4 py-2 rounded-full bg-[#D4AF37] hover:bg-[#e5c14b] text-[#0A1128] font-bold text-xs sm:text-sm items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Building2 className="w-4 h-4" />
                <span>Create Profile</span>
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="lg:hidden p-2 rounded-xl bg-slate-800/80 text-slate-200 hover:text-white cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-[#0A1128] border-t border-slate-800 px-6 py-4 space-y-3">
              <nav className="flex flex-wrap gap-4 text-sm font-medium text-slate-200">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900/70 border border-slate-800 hover:border-[#D4AF37]/50"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowCreateModal(true);
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-[#D4AF37] text-[#0A1128] font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Building2 className="w-4 h-4" />
                <span>Create Business Profile</span>
              </button>
            </div>
          )}
        </header>

        <main id="top" className="flex-1 space-y-8">
          {/* Centered Hero Section */}
          <section id="ecosystem" className="max-w-[1200px] mx-auto px-6 py-16 text-center space-y-8">
            <div className="flex justify-center">
              <img
                src="/logo.png"
                alt="GOYE Web3 Business Hub Logo"
                className="w-full max-w-[220px] h-auto rounded-2xl object-contain shadow-2xl border border-slate-800/80"
              />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#F5D061] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI + Web3 Business Infrastructure for the Global Digital Economy</span>
            </div>

            <div className="max-w-3xl mx-auto space-y-5">
              <h1 className="text-4xl sm:text-[48px] font-extrabold text-white leading-[1.15] tracking-normal">
                Build the Business of Tomorrow
              </h1>
              <p className="text-base sm:text-[20px] text-slate-300 leading-[1.6] tracking-normal">
                Register your verifiable GOYE Business ID, deploy 15 modular digital products, automate client workflows with AI, and execute trusted commercial settlements.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3.5 rounded-xl bg-[#D4AF37] hover:bg-[#e5c14b] text-[#0A1128] font-bold text-sm inline-flex items-center gap-2 transition-colors shadow-lg cursor-pointer"
              >
                <Building2 className="w-4 h-4" />
                <span>Create Business Profile</span>
              </button>
              <a
                href="#flagship-products"
                className="px-6 py-3.5 rounded-xl bg-[#0E162B] hover:bg-[#162240] border border-slate-700 text-white font-semibold text-sm inline-flex items-center gap-2 transition-colors"
              >
                <Layers className="w-4 h-4 text-[#F5D061]" />
                <span>15 Flagship Products</span>
              </a>
              <a
                href="#marketplace"
                className="px-6 py-3.5 rounded-xl bg-[#0E162B] hover:bg-[#162240] border border-slate-700 text-slate-200 font-semibold text-sm inline-flex items-center gap-2 transition-colors"
              >
                <Briefcase className="w-4 h-4 text-purple-400" />
                <span>Explore Services & Marketplace</span>
              </a>
              <a
                href="#system-audit"
                className="px-6 py-3.5 rounded-xl bg-[#0E162B] hover:bg-[#162240] border border-slate-700 text-slate-200 font-semibold text-sm inline-flex items-center gap-2 transition-colors"
              >
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Pi System Audit</span>
              </a>
            </div>
          </section>

          {/* Verifiable Business ID Section */}
          <section id="business-id" className="max-w-[1200px] mx-auto px-6 py-16 border-t border-slate-800/80 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 bg-[#0E162B] border border-slate-800 rounded-2xl p-6 space-y-5">
                <div className="aspect-video w-full overflow-hidden rounded-2xl bg-[#070C1A]">
                  <img
                    src="/images/business-id.jpg"
                    alt="Executive reviewing verifiable Business Profile dashboard"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F5D061]">
                    <FileCheck2 className="w-4 h-4" />
                    <span>Verifiable Business ID</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white leading-snug">
                    5-Level Cryptographic Commercial Identity
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed line-clamp-2">
                    Every enterprise receives an immutable GOYE-BIZ identifier and progressive KYB verification tier for global partner trust.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {VERIFICATION_LEVELS.map((v) => (
                    <div
                      key={v.level}
                      className="p-6 rounded-2xl bg-[#0E162B] border border-slate-800 hover:border-[#D4AF37]/40 transition-colors space-y-2"
                    >
                      <div className="text-xs font-mono font-bold text-[#F5D061]">{v.level}</div>
                      <div className="text-base font-bold text-white">{v.title}</div>
                      <p className="text-sm text-slate-400 leading-relaxed">{v.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="p-6 rounded-2xl bg-[#0E162B] border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-base font-bold text-white">Active Registry Records</h3>
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(true)}
                      className="text-xs font-semibold text-[#F5D061] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Register New ID</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {registeredBusinesses.map((biz) => (
                      <div
                        key={biz.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#070C1A] border border-slate-800"
                      >
                        <div>
                          <div className="text-sm font-bold text-white">{biz.name}</div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {biz.category} • {biz.country}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono text-[#F5D061] bg-[#D4AF37]/10 px-3 py-1 rounded-lg border border-[#D4AF37]/20">
                            {biz.id}
                          </span>
                          <span className="text-xs font-semibold text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                            Level {biz.level}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 15 Flagship Products Section */}
          <section id="flagship-products" className="max-w-[1200px] mx-auto px-6 py-16 border-t border-slate-800/80">
            <LockedProducts />
          </section>

          {/* Explore Services & Marketplace */}
          <section id="marketplace" className="max-w-[1200px] mx-auto px-6 py-16 border-t border-slate-800/80 space-y-8">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
                <Globe className="w-4 h-4" />
                <span>Explore Services & Marketplace</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Enterprise Commerce & AI Infrastructure
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SERVICES.map((svc) => (
                <div
                  key={svc.title}
                  className="rounded-2xl bg-[#0E162B] border border-slate-800 hover:border-purple-500/40 transition-colors p-6 flex flex-col gap-5"
                >
                  <div className="aspect-video w-full overflow-hidden rounded-2xl bg-[#070C1A]">
                    <img
                      src={svc.image}
                      alt={svc.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                      {svc.tag}
                    </span>
                    <h3 className="text-lg font-bold text-white leading-snug">{svc.title}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed line-clamp-2">{svc.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Trade Assurance Hub */}
          <section id="trade-assurance" className="max-w-[1200px] mx-auto px-6 py-16 border-t border-slate-800/80">
            <div className="rounded-2xl bg-[#0E162B] border border-[#D4AF37]/30 p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-3">
                <div className="aspect-video w-full overflow-hidden rounded-2xl bg-[#070C1A]">
                  <img
                    src="/images/trade.jpg"
                    alt="Trade Assurance agreement confirmation"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1 pt-1">
                  <div className="text-sm font-bold text-white">Verified Transaction Assurance</div>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    Dual-party commercial milestones with tamper-evident reconciliation records.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F5D061]">
                  <Scale className="w-4 h-4" />
                  <span>Trade Assurance Hub</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white leading-snug">
                  Milestone Protection & Evidence-Backed Reconciliation
                </h2>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  Every commercial invoice and digital agreement adheres to strict non-custodial payment integrity: orders remain Pending until verifiable settlement evidence is reconciled and countersigned.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-[#070C1A] border border-slate-800 space-y-1">
                    <div className="text-xs font-bold text-white">1. Contract Draft</div>
                    <div className="text-xs text-slate-400">Timestamped scope & terms</div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#070C1A] border border-slate-800 space-y-1">
                    <div className="text-xs font-bold text-white">2. Evidence Review</div>
                    <div className="text-xs text-slate-400">Audit-logged reconciliation</div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#070C1A] border border-slate-800 space-y-1">
                    <div className="text-xs font-bold text-white">3. Verified Release</div>
                    <div className="text-xs text-slate-400">QR-verifiable receipt</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Pi System Audit */}
          <section id="system-audit" className="max-w-[1200px] mx-auto px-6 py-16 border-t border-slate-800/80">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0E162B] border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                    <BadgeCheck className="w-4 h-4" />
                    <span>Pi System Audit</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    Platform Integrity & Compliance Architecture
                  </h2>
                </div>
                <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold self-start sm:self-auto">
                  App Studio Auth Ready
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="p-6 rounded-2xl bg-[#070C1A] border border-slate-800 space-y-2">
                  <div className="font-bold text-white">Identity Verification</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Server-verified Pi access tokens via /api/pi/appstudio-auth with zero public username exposure.
                  </p>
                </div>
                <div className="p-6 rounded-2xl bg-[#070C1A] border border-slate-800 space-y-2">
                  <div className="font-bold text-white">Frame & CSP Hardening</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Configured for Pi Browser & Pi App Studio verification with text/plain domain validation.
                  </p>
                </div>
                <div className="p-6 rounded-2xl bg-[#070C1A] border border-slate-800 space-y-2">
                  <div className="font-bold text-white">Payment Integrity</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Server-side approval & completion endpoints with strict non-custodial audit logging.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Create Business Profile Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#0E162B] border border-slate-700 rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Create Business Profile</h3>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleCreateBusiness} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Business Name
                  </label>
                  <input
                    type="text"
                    required
                    value={bizName}
                    onChange={(e) => setBizName(e.target.value)}
                    placeholder="e.g. Lagos Web3 Logistics Ltd"
                    className="w-full bg-[#070C1A] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Category
                  </label>
                  <select
                    value={bizCategory}
                    onChange={(e) => setBizCategory(e.target.value)}
                    className="w-full bg-[#070C1A] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option>Software & AI</option>
                    <option>E-Commerce & Retail</option>
                    <option>Logistics & Supply Chain</option>
                    <option>Financial & Consulting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Country
                  </label>
                  <input
                    type="text"
                    value={bizCountry}
                    onChange={(e) => setBizCountry(e.target.value)}
                    className="w-full bg-[#070C1A] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#D4AF37] hover:bg-[#e5c14b] text-[#0A1128] font-bold py-3 rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Issue GOYE Business ID
                </button>
              </form>
            </div>
          </div>
        )}

        <FooterWithAdminTap />
      </div>
    </ErrorBoundary>
  );
}
