'use client';
import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
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
    title: 'Global B2B Marketplace & Sourcing',
    desc: 'Connect verified merchants, digital agencies, and enterprise vendors across Africa and global Web3 hubs.',
    image: '/images/marketplace_services_1791792116237.jpg',
    tag: 'Verified Commerce',
  },
  {
    title: 'AI Business Automation Suite',
    desc: 'Deploy 24/7 commercial intake assistants, lead qualification, and automated WhatsApp customer handoffs.',
    image: '/images/ai_assistants_1791792070445.jpg',
    tag: 'Enterprise AI',
  },
  {
    title: 'Smart Contracts & Digital Invoicing',
    desc: 'Generate tamper-evident commercial agreements, milestone schedules, and verifiable settlement receipts.',
    image: '/images/contracts_invoices_1791792093198.jpg',
    tag: 'Web3 Infrastructure',
  },
];

const VERIFICATION_LEVELS = [
  { level: 'Level 1', title: 'Registered Profile', desc: 'Unique GOYE-BIZ ID issued at onboarding.' },
  { level: 'Level 2', title: 'Documents Submitted', desc: 'Corporate filings queued for compliance audit.' },
  { level: 'Level 3', title: 'KYB Audited', desc: 'Entity registration and signatory verified.' },
  { level: 'Level 4', title: 'Trade Bonded', desc: 'Backed by Trade Assurance milestone protection.' },
  { level: 'Level 5', title: 'Global Enterprise', desc: 'Cross-border settlement & API tier unlocked.' },
];

export default function Page() {
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
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-[#0B0E14]/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <a href="#top" className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5D061] via-[#D4AF37] to-[#8C6A1B] flex items-center justify-center shadow-lg shadow-[#D4AF37]/25 border border-[#F5D061]/50">
              <span className="font-black text-[#0B0E14] text-lg">G</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm sm:text-base font-extrabold tracking-wide text-white">
                GOYE <span className="text-[#D4AF37]">HUB</span>
              </div>
              <div className="text-[10px] text-slate-400 hidden sm:block">
                Build. Automate. Trade. Pay. Grow.
              </div>
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-300">
            <a href="#business-id" className="hover:text-[#D4AF37] transition-colors">
              Business ID
            </a>
            <a href="#flagship-products" className="hover:text-[#D4AF37] transition-colors">
              15 Flagship Products
            </a>
            <a href="#marketplace" className="hover:text-[#D4AF37] transition-colors">
              Services & Marketplace
            </a>
            <a href="#trade-assurance" className="hover:text-[#D4AF37] transition-colors">
              Trade Assurance
            </a>
            <a href="#system-audit" className="hover:text-[#D4AF37] transition-colors">
              Pi System Audit
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <PiSignIn />

            <button
              onClick={() => setShowCreateModal(true)}
              className="hidden sm:inline-flex px-4 py-2 rounded-full bg-[#D4AF37] hover:bg-[#e5c14b] text-[#0B0E14] font-bold text-xs sm:text-sm items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              <span>Create Business Profile</span>
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="flex-1">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#F5D061] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI + Web3 Business Infrastructure for the Global Digital Economy</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
                Verifiable Commerce,{' '}
                <span className="text-[#D4AF37]">Autonomous Operations</span> & Pi Settlements.
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                Register your cryptographic GOYE Business ID, unlock 15 flagship digital infrastructure modules, execute milestone-backed trade contracts, and accept Pi Network payments in one unified enterprise hub.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-5 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#e5c14b] text-[#0B0E14] font-bold text-sm inline-flex items-center gap-2 transition-colors shadow-lg shadow-[#D4AF37]/20 cursor-pointer"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Create Business Profile</span>
                </button>
                <a
                  href="#flagship-products"
                  className="px-5 py-3 rounded-xl bg-[#161B26] hover:bg-[#1E2534] border border-slate-700 text-white font-semibold text-sm inline-flex items-center gap-2 transition-colors"
                >
                  <Layers className="w-4 h-4 text-[#D4AF37]" />
                  <span>15 Flagship Products</span>
                </a>
                <a
                  href="#marketplace"
                  className="px-5 py-3 rounded-xl bg-[#161B26] hover:bg-[#1E2534] border border-slate-700 text-slate-200 font-semibold text-sm inline-flex items-center gap-2 transition-colors"
                >
                  <Briefcase className="w-4 h-4 text-purple-400" />
                  <span>Explore Services & Marketplace</span>
                </a>
                <a
                  href="#system-audit"
                  className="px-5 py-3 rounded-xl bg-[#161B26] hover:bg-[#1E2534] border border-slate-700 text-slate-200 font-semibold text-sm inline-flex items-center gap-2 transition-colors"
                >
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Pi System Audit</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-2xl bg-[#121620]">
                <img
                  src="/images/hero_workspace_1791792049238.jpg"
                  alt="GOYE Web3 Business Hub Workspace"
                  className="w-full h-72 sm:h-80 object-cover"
                />
                <div className="p-4 bg-[#0F131C] border-t border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F5D061] to-[#8C6A1B] flex items-center justify-center font-black text-[#0B0E14] text-sm">
                      G
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">GOYE Enterprise Shield</div>
                      <div className="text-[11px] text-slate-400">5-Level KYB Registry Active</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">
                    Live Registry
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Verifiable Business ID Section */}
        <section id="business-id" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-t border-slate-800/80">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                <FileCheck2 className="w-4 h-4" />
                <span>Verifiable Business ID</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                5-Level Cryptographic Commercial Identity
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Every enterprise onboarded onto GOYE receives an immutable registry identifier and progressive trust tier from initial registration to bonded global settlement.
              </p>

              <div className="rounded-2xl overflow-hidden border border-slate-800 bg-[#121620]">
                <img
                  src="/images/business_identity_1791792060699.jpg"
                  alt="Verifiable Business Identity"
                  className="w-full h-52 object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {VERIFICATION_LEVELS.map((v) => (
                  <div
                    key={v.level}
                    className="p-4 rounded-xl bg-[#121620] border border-slate-800 hover:border-[#D4AF37]/40 transition-colors"
                  >
                    <div className="text-xs font-mono font-bold text-[#D4AF37]">{v.level}</div>
                    <div className="text-sm font-bold text-white mt-1">{v.title}</div>
                    <p className="text-xs text-slate-400 mt-1">{v.desc}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-[#121620] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Active Registry Records</h3>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="text-xs font-semibold text-[#D4AF37] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Register New ID</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {registeredBusinesses.map((biz) => (
                    <div
                      key={biz.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-[#0B0E14] border border-slate-800/80"
                    >
                      <div>
                        <div className="text-sm font-bold text-white">{biz.name}</div>
                        <div className="text-xs text-slate-400">
                          {biz.category} • {biz.country}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-1 rounded-md border border-[#D4AF37]/20">
                          {biz.id}
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
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
        <section id="flagship-products" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-t border-slate-800/80">
          <LockedProducts />
        </section>

        {/* Explore Services & Marketplace */}
        <section id="marketplace" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-t border-slate-800/80 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400 mb-1">
                <Globe className="w-4 h-4" />
                <span>Explore Services & Marketplace</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Enterprise Commerce & AI Infrastructure
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SERVICES.map((svc) => (
              <div
                key={svc.title}
                className="rounded-2xl overflow-hidden bg-[#121620] border border-slate-800 hover:border-purple-500/40 transition-colors flex flex-col"
              >
                <div className="h-48 w-full overflow-hidden bg-black/40">
                  <img
                    src={svc.image}
                    alt={svc.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 mb-2">
                      {svc.tag}
                    </span>
                    <h3 className="text-lg font-bold text-white">{svc.title}</h3>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{svc.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Trade Assurance Hub */}
        <section id="trade-assurance" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-t border-slate-800/80">
          <div className="rounded-2xl bg-[#121620] border border-[#D4AF37]/30 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-5 h-64 lg:h-auto">
              <img
                src="/images/trade_assurance_1791686713918.jpg"
                alt="GOYE Trade Assurance Hub"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                <Scale className="w-4 h-4" />
                <span>Trade Assurance Hub</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Milestone Protection & Evidence-Backed Reconciliation
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Every commercial invoice and digital agreement adheres to strict non-custodial payment integrity: orders remain Pending until verifiable settlement evidence is reconciled and countersigned.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-[#0B0E14] border border-slate-800">
                  <div className="text-xs font-bold text-white">1. Contract Draft</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Timestamped scope & terms</div>
                </div>
                <div className="p-3 rounded-xl bg-[#0B0E14] border border-slate-800">
                  <div className="text-xs font-bold text-white">2. Evidence Review</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Audit-logged reconciliation</div>
                </div>
                <div className="p-3 rounded-xl bg-[#0B0E14] border border-slate-800">
                  <div className="text-xs font-bold text-white">3. Verified Release</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">QR-verifiable receipt</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pi System Audit */}
        <section id="system-audit" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-t border-slate-800/80">
          <div className="p-6 rounded-2xl bg-[#121620] border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Pi System Audit</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Platform Integrity & Compliance Architecture
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold self-start sm:self-auto">
                App Studio Auth Ready
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#0B0E14] border border-slate-800 space-y-1">
                <div className="font-bold text-white">Identity Verification</div>
                <div className="text-slate-400">
                  Server-verified Pi access tokens via /api/pi/appstudio-auth with zero public username exposure.
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#0B0E14] border border-slate-800 space-y-1">
                <div className="font-bold text-white">Frame & CSP Hardening</div>
                <div className="text-slate-400">
                  Configured for Pi Browser & Pi App Studio verification with text/plain domain validation.
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#0B0E14] border border-slate-800 space-y-1">
                <div className="font-bold text-white">Payment Integrity</div>
                <div className="text-slate-400">
                  Server-side approval & completion endpoints with strict non-custodial audit logging.
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Create Business Profile Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#121620] border border-slate-700 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Create Business Profile</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateBusiness} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  required
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                  placeholder="e.g. Lagos Web3 Logistics Ltd"
                  className="w-full bg-[#0B0E14] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={bizCategory}
                  onChange={(e) => setBizCategory(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  <option>Software & AI</option>
                  <option>E-Commerce & Retail</option>
                  <option>Logistics & Supply Chain</option>
                  <option>Financial & Consulting</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Country</label>
                <input
                  type="text"
                  value={bizCountry}
                  onChange={(e) => setBizCountry(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#D4AF37] hover:bg-[#e5c14b] text-[#0B0E14] font-bold py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
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
