import React from 'react';
import { ASSETS } from '../constants/assets';
import {
  ShieldCheck,
  Cpu,
  Layers,
  FileText,
  CreditCard,
  QrCode,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Lock,
  Globe2,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { GoyeLogo } from '../components/GoyeLogo';
import { PWAInstallButton } from '../components/PWAInstallButton';

interface HomeViewProps {
  onNavigate: (view: string) => void;
  onOpenCreateBusiness: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onOpenCreateBusiness }) => {
  return (
    <div className="space-y-24">
      {/* 1. Hero Section */}
      <section className="relative pt-8 pb-16 lg:pt-16 lg:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Copy & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <GoyeLogo size="sm" subtitle="Business Hub" />
                <div className="h-4 w-px bg-white/20 hidden sm:block" />
                <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                  <span>AI + Web3 Infrastructure</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15] text-balance">
                Build the Business of Tomorrow.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                AI-powered business tools, digital commerce, cryptographic identity, and Web3 infrastructure designed for entrepreneurs, SMEs, and organizations entering the next generation of the internet.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={onOpenCreateBusiness}
                  className="px-5 py-3 text-sm font-semibold text-[#0B0E14] bg-[#D4AF37] hover:bg-[#e0bc46] rounded-md transition-colors shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <span>Create Business Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('marketplace')}
                  className="px-5 py-3 text-sm font-medium text-white bg-white/10 hover:bg-white/15 border border-white/15 rounded-md transition-colors shrink-0 cursor-pointer"
                >
                  Explore Services & Marketplace
                </button>

                <PWAInstallButton variant="hero" />

                <button
                  onClick={() => onNavigate('pi-status')}
                  className="px-4 py-3 text-sm font-medium text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 rounded-md transition-colors shrink-0 cursor-pointer"
                >
                  Pi System Audit
                </button>
              </div>

              {/* Verified Trust Markers */}
              <div className="pt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400 border-t border-white/10">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  <span>5-Level Verifiable Business ID</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-[#D4AF37]" />
                  <span>Autonomous AI Assistants</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-[#D4AF37]" />
                  <span>Dual Web2 / Pi Browser Readiness</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Container */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-xl overflow-hidden border border-white/15 shadow-2xl bg-[#121620]">
                <img
                  src={ASSETS.hero}
                  alt="African entrepreneurs collaborating in a modern technology and business workspace with laptops and mobile devices"
                  referrerPolicy="no-referrer"
                  className="w-full h-80 sm:h-96 lg:h-[420px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/30 to-transparent" />
                
                {/* Overlay Card: Live Protocol Metrics */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-lg bg-[#0B0E14]/90 backdrop-blur-md border border-white/10">
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/10">
                    <span className="font-semibold text-white">GOYE Infrastructure Registry</span>
                    <span className="text-[#D4AF37] font-mono">v1.0.0-PROD</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                    <div>
                      <div className="text-xs text-slate-400">Business ID</div>
                      <div className="text-sm font-bold text-white font-mono">5 Levels</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Payment Rails</div>
                      <div className="text-sm font-bold text-white font-mono">Dual Web2 + Pi</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Pi Integration</div>
                      <div className="text-sm font-bold text-[#D4AF37] font-mono">Web3 Ready</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Full-Width Architectural KPI Row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 rounded-xl bg-[#121620] border border-white/10">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 uppercase tracking-wider">Identity Layer</span>
            <div className="text-xl sm:text-2xl font-bold text-white font-mono tabular-nums">GOYE Business ID</div>
            <p className="text-xs text-slate-400">Cryptographically verifiable 5-level status profiles.</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-400 uppercase tracking-wider">Automation Layer</span>
            <div className="text-xl sm:text-2xl font-bold text-[#D4AF37] font-mono tabular-nums">9 AI Agents</div>
            <p className="text-xs text-slate-400">Enterprise customer discovery, booking & lead qualification.</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-400 uppercase tracking-wider">Settlement Layer</span>
            <div className="text-xl sm:text-2xl font-bold text-white font-mono tabular-nums">Dual Web2 + Pi</div>
            <p className="text-xs text-slate-400">Bank Wire, Paystack, Flutterwave & Pi Platform API.</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-400 uppercase tracking-wider">Commerce Layer</span>
            <div className="text-xl sm:text-2xl font-bold text-white font-mono tabular-nums">Trade Assurance</div>
            <p className="text-xs text-slate-400">Digital contracts, verifiable milestones & invoice QR codes.</p>
          </div>
        </div>
      </section>

      {/* 3. CORE PHOTOGRAPHIC VISUAL SYSTEM SHOWCASE (4-Quadrant Mood Board Layout) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
              <span>Real African Enterprises</span>
              <span aria-hidden="true">·</span>
              <span>Production Infrastructure</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Verified Infrastructure in Real Business Action
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl">
              Authentic tools designed for real African entrepreneurs, organizations, and digital founders operating across modern Web2 systems and Web3-enabled commerce.
            </p>
          </div>
          <button
            onClick={() => onNavigate('marketplace')}
            className="text-xs font-semibold text-[#D4AF37] hover:underline flex items-center gap-1.5 shrink-0"
          >
            <span>Explore All Capabilities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4-Quadrant Visual Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quadrant 1: Websites & Digital Infrastructure */}
          <div className="group rounded-2xl bg-[#121620] border border-white/10 overflow-hidden hover:border-[#D4AF37]/50 transition-all">
            <div className="relative h-64 sm:h-72 overflow-hidden bg-[#0B0E14]">
              <img
                src={ASSETS.hero}
                alt="African entrepreneurs collaborating on websites, e-commerce, and digital solutions"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121620] via-[#121620]/30 to-transparent" />
              
              {/* Badges Overlay */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 max-w-[85%]">
                <span className="px-2 py-0.5 rounded bg-[#0B0E14]/80 backdrop-blur-sm text-[11px] font-semibold text-[#D4AF37] border border-[#D4AF37]/30">
                  Websites
                </span>
                <span className="px-2 py-0.5 rounded bg-[#0B0E14]/80 backdrop-blur-sm text-[11px] font-semibold text-slate-200 border border-white/10">
                  E-Commerce
                </span>
                <span className="px-2 py-0.5 rounded bg-[#0B0E14]/80 backdrop-blur-sm text-[11px] font-semibold text-slate-200 border border-white/10">
                  Digital Solutions
                </span>
                <span className="px-2 py-0.5 rounded bg-[#0B0E14]/80 backdrop-blur-sm text-[11px] font-semibold text-slate-200 border border-white/10">
                  AI Automation
                </span>
              </div>
            </div>

            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Create · Build · Grow</h3>
                <span className="text-xs font-mono text-[#D4AF37]">01. INFRASTRUCTURE</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Launch high-conversion business websites, turnkey e-commerce systems, and client portals engineered for African markets and international clients.
              </p>
              <div className="pt-2 flex items-center justify-between text-xs border-t border-white/5">
                <span className="text-slate-400">Production Web Engineering</span>
                <button
                  onClick={() => onNavigate('marketplace')}
                  className="font-semibold text-[#D4AF37] hover:underline flex items-center gap-1"
                >
                  View Solutions <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Quadrant 2: Business Profile & Verifiable Identity */}
          <div className="group rounded-2xl bg-[#121620] border border-white/10 overflow-hidden hover:border-[#D4AF37]/50 transition-all">
            <div className="relative h-64 sm:h-72 overflow-hidden bg-[#0B0E14]">
              <img
                src={ASSETS.businessIdentity}
                alt="Entrepreneur viewing professional digital business profile dashboard with verification badges and documents"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121620] via-[#121620]/30 to-transparent" />

              {/* Badges Overlay */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 max-w-[85%]">
                <span className="px-2 py-0.5 rounded bg-emerald-950/80 backdrop-blur-sm text-[11px] font-semibold text-emerald-400 border border-emerald-800">
                  ✓ Verified Profile
                </span>
                <span className="px-2 py-0.5 rounded bg-[#0B0E14]/80 backdrop-blur-sm text-[11px] font-semibold text-slate-200 border border-white/10">
                  CAC / Documents
                </span>
                <span className="px-2 py-0.5 rounded bg-[#0B0E14]/80 backdrop-blur-sm text-[11px] font-semibold text-slate-200 border border-white/10">
                  QR Verification
                </span>
                <span className="px-2 py-0.5 rounded bg-[#0B0E14]/80 backdrop-blur-sm text-[11px] font-semibold text-[#D4AF37] border border-[#D4AF37]/30">
                  5-Tier Status
                </span>
              </div>
            </div>

            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Cryptographic Business ID</h3>
                <span className="text-xs font-mono text-[#D4AF37]">02. IDENTITY</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Establish corporate trust with verifiable business identification, transparent verification history, director records, and scannable validation endpoints.
              </p>
              <div className="pt-2 flex items-center justify-between text-xs border-t border-white/5">
                <span className="text-slate-400">Verifiable Entity Protocol</span>
                <button
                  onClick={() => onNavigate('business-id')}
                  className="font-semibold text-[#D4AF37] hover:underline flex items-center gap-1"
                >
                  Verify Profile <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Quadrant 3: AI Business Assistants */}
          <div className="group rounded-2xl bg-[#121620] border border-white/10 overflow-hidden hover:border-[#D4AF37]/50 transition-all">
            <div className="relative h-64 sm:h-72 overflow-hidden bg-[#0B0E14]">
              <img
                src={ASSETS.aiAssistants}
                alt="African business owners using AI business assistant and customer support dashboard"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121620] via-[#121620]/30 to-transparent" />

              {/* Badges Overlay */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 max-w-[85%]">
                <span className="px-2 py-0.5 rounded bg-[#123B72]/80 backdrop-blur-sm text-[11px] font-semibold text-white border border-[#123B72]">
                  24/7 AI Reception
                </span>
                <span className="px-2 py-0.5 rounded bg-[#0B0E14]/80 backdrop-blur-sm text-[11px] font-semibold text-slate-200 border border-white/10">
                  Lead Generation
                </span>
                <span className="px-2 py-0.5 rounded bg-[#0B0E14]/80 backdrop-blur-sm text-[11px] font-semibold text-[#D4AF37] border border-[#D4AF37]/30">
                  WhatsApp Handoff
                </span>
                <span className="px-2 py-0.5 rounded bg-[#0B0E14]/80 backdrop-blur-sm text-[11px] font-semibold text-slate-200 border border-white/10">
                  Zero Key Exposure
                </span>
              </div>
            </div>

            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">AI Business Assistants</h3>
                <span className="text-xs font-mono text-[#D4AF37]">03. AUTOMATION</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Server-backed AI assistants powered by Gemini models that qualify inquiries, generate quotes, answer questions, and route warm leads directly to WhatsApp.
              </p>
              <div className="pt-2 flex items-center justify-between text-xs border-t border-white/5">
                <span className="text-slate-400">9 Specialized Agents</span>
                <button
                  onClick={() => onNavigate('ai-agents')}
                  className="font-semibold text-[#D4AF37] hover:underline flex items-center gap-1"
                >
                  Test Live Console <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Quadrant 4: Digital Commerce & Dual Settlement */}
          <div className="group rounded-2xl bg-[#121620] border border-white/10 overflow-hidden hover:border-[#D4AF37]/50 transition-all">
            <div className="relative h-64 sm:h-72 overflow-hidden bg-[#0B0E14]">
              <img
                src={ASSETS.digitalCommerce}
                alt="African businesswoman completing a verified digital business transaction using smartphone and laptop"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121620] via-[#121620]/30 to-transparent" />

              {/* Badges Overlay */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 max-w-[85%]">
                <span className="px-2 py-0.5 rounded bg-emerald-950/80 backdrop-blur-sm text-[11px] font-semibold text-emerald-400 border border-emerald-800">
                  ✓ Payment Confirmed
                </span>
                <span className="px-2 py-0.5 rounded bg-[#0B0E14]/80 backdrop-blur-sm text-[11px] font-semibold text-slate-200 border border-white/10">
                  Bank Wire / NIP
                </span>
                <span className="px-2 py-0.5 rounded bg-[#0B0E14]/80 backdrop-blur-sm text-[11px] font-semibold text-[#D4AF37] border border-[#D4AF37]/30">
                  Pi Platform API
                </span>
                <span className="px-2 py-0.5 rounded bg-[#0B0E14]/80 backdrop-blur-sm text-[11px] font-semibold text-slate-200 border border-white/10">
                  Trade Protected
                </span>
              </div>
            </div>

            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Digital Commerce & Settlement</h3>
                <span className="text-xs font-mono text-[#D4AF37]">04. COMMERCE</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Accept direct bank wires, digital invoices, and server-verified Pi payments. Strict anti-mocking architecture with zero client-side verification tricks.
              </p>
              <div className="pt-2 flex items-center justify-between text-xs border-t border-white/5">
                <span className="text-slate-400">Multi-Rail Payment Engine</span>
                <button
                  onClick={() => onNavigate('pi-status')}
                  className="font-semibold text-[#D4AF37] hover:underline flex items-center gap-1"
                >
                  Audit Status <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ENTERPRISE CONTRACTS, TRADE ASSURANCE & GLOBAL DIGITAL ECONOMY SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-2 border-b border-white/10 pb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
            <span>Commercial Trust & Scalability</span>
            <span aria-hidden="true">·</span>
            <span>Global Connectivity</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Enterprise Governance, Contracts & Global Trade Nexus
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl">
            From verifiable multi-currency invoicing to cross-border milestone assurance, GOYE provides the operational backbone for modern digital business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card A: Contracts & Invoices */}
          <div className="rounded-2xl bg-[#121620] border border-white/10 overflow-hidden space-y-4 hover:border-[#D4AF37]/40 transition-colors flex flex-col">
            <div className="relative h-52 overflow-hidden bg-[#0B0E14]">
              <img
                src={ASSETS.contractsInvoices}
                alt="Corporate executive reviewing a digital contract and invoice ledger dashboard on a laptop"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121620] via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 text-xs font-mono text-[#D4AF37]">
                SHA-256 DIGITAL CONTRACTS
              </div>
            </div>
            <div className="p-5 pt-0 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Contracts & Invoices</h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                  Draft legally grounded scope agreements with milestone payment terms, cryptographic sign-off hashes, and automated multi-currency billing.
                </p>
              </div>
              <button
                onClick={() => onNavigate('contracts-invoices')}
                className="text-xs font-semibold text-[#D4AF37] hover:underline flex items-center gap-1 pt-3 border-t border-white/5"
              >
                <span>Manage Digital Ledger</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Card B: Trade Assurance */}
          <div className="rounded-2xl bg-[#121620] border border-white/10 overflow-hidden space-y-4 hover:border-[#D4AF37]/40 transition-colors flex flex-col">
            <div className="relative h-52 overflow-hidden bg-[#0B0E14]">
              <img
                src={ASSETS.tradeAssurance}
                alt="Professional African business partners concluding a verified B2B transaction with a digital trade agreement and milestone assurance badge on tablet"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121620] via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 text-xs font-mono text-[#D4AF37]">
                7-STAGE TRADE PIPELINE
              </div>
            </div>
            <div className="p-5 pt-0 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Trade Assurance Protocol</h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                  Protect B2B transactions with milestone inspection logs, mutual confirmations, and tamper-evident dispute mitigation archives.
                </p>
              </div>
              <button
                onClick={() => onNavigate('trade-assurance')}
                className="text-xs font-semibold text-[#D4AF37] hover:underline flex items-center gap-1 pt-3 border-t border-white/5"
              >
                <span>Explore Trade Assurance</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Card C: Global Digital Economy */}
          <div className="rounded-2xl bg-[#121620] border border-white/10 overflow-hidden space-y-4 hover:border-[#D4AF37]/40 transition-colors flex flex-col">
            <div className="relative h-52 overflow-hidden bg-[#0B0E14]">
              <img
                src={ASSETS.globalEconomy}
                alt="African corporate leadership team standing in an executive boardroom with global digital network connectivity map"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121620] via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 text-xs font-mono text-[#D4AF37]">
                GLOBAL DIGITAL NEXUS
              </div>
            </div>
            <div className="p-5 pt-0 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Global Digital Economy</h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                  Connecting African entrepreneurs with cross-border trade partners across Europe, America, and Asia using decentralized-ready infrastructure.
                </p>
              </div>
              <button
                onClick={() => onNavigate('marketplace')}
                className="text-xs font-semibold text-[#D4AF37] hover:underline flex items-center gap-1 pt-3 border-t border-white/5"
              >
                <span>Explore Ecosystem Network</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BUILD • AUTOMATE • GROW Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
            Core Operating Capability
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Build. Automate. Grow.
          </h2>
          <p className="text-sm text-slate-400">
            End-to-end digital transformation pathways designed for real businesses navigating traditional commerce and Web3.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* BUILD */}
          <div className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-4 hover:border-[#D4AF37]/50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[#123B72]/40 border border-[#123B72] flex items-center justify-center text-[#D4AF37]">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">01. Build</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Launch enterprise-grade digital presences engineered for performance, security, and conversion:
            </p>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" /> High-Performance Business Websites
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" /> Custom SaaS & Client Portals
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" /> E-Commerce & Payment Gateways
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" /> Web3 & Pi Browser DApps
              </li>
            </ul>
            <button
              onClick={() => onNavigate('marketplace')}
              className="text-xs font-semibold text-[#D4AF37] hover:underline flex items-center gap-1 pt-2"
            >
              Browse Build Solutions <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* AUTOMATE */}
          <div className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-4 hover:border-[#D4AF37]/50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[#123B72]/40 border border-[#123B72] flex items-center justify-center text-[#D4AF37]">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">02. Automate</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Deploy server-backed AI assistants and operations workflows that run autonomously 24/7:
            </p>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" /> 24/7 AI Receptionist & Front-Desk
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" /> Automated WhatsApp Lead Handoff
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" /> Inbound Lead Qualification Agents
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" /> Quotation & Invoice Generation
              </li>
            </ul>
            <button
              onClick={() => onNavigate('ai-agents')}
              className="text-xs font-semibold text-[#D4AF37] hover:underline flex items-center gap-1 pt-2"
            >
              Explore AI Agent Marketplace <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* GROW */}
          <div className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-4 hover:border-[#D4AF37]/50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[#123B72]/40 border border-[#123B72] flex items-center justify-center text-[#D4AF37]">
              <Globe2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">03. Grow</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Scale enterprise reputation and trade reach with verified credentials and legal trade tools:
            </p>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" /> Verifiable GOYE Business ID Badge
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" /> Cryptographic Digital Contracts
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" /> Multi-Currency Invoicing Engine
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" /> Sirwise Academy Masterclasses
              </li>
            </ul>
            <button
              onClick={() => onNavigate('business-id')}
              className="text-xs font-semibold text-[#D4AF37] hover:underline flex items-center gap-1 pt-2"
            >
              Verify Your Business Identity <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </section>

      {/* 6. Explain Web3 Simply (Zero-jargon educational contrast) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 lg:p-12 rounded-2xl bg-gradient-to-br from-[#121620] to-[#0B0E14] border border-white/15">
          <div className="max-w-3xl mb-8 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
              Demystifying Emerging Technology
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Web3-Enabled Architecture Explained Without the Jargon.
            </h2>
            <p className="text-sm text-slate-400">
              The GOYE platform combines conventional enterprise web infrastructure with decentralisation-ready verification and Pi-enabled commerce. Rather than making false claims of running 100% on-chain, GOYE utilizes practical cryptographic auditability where it provides genuine commercial value.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg bg-[#0B0E14]/70 border border-white/10 space-y-3">
              <div className="text-sm font-bold text-slate-200">Web2 (Conventional)</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your standard corporate website, email, business registration documents, and fiat payment rails (direct bank wires, Paystack, Flutterwave).
              </p>
              <div className="text-xs text-slate-500 pt-2 border-t border-white/5">
                Reliable web infrastructure & commercial banking rails.
              </div>
            </div>

            <div className="p-6 rounded-lg bg-[#0B0E14]/70 border border-white/10 space-y-3">
              <div className="text-sm font-bold text-[#D4AF37]">Web3 (Decentralisation-Ready)</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cryptographic digital identities, non-custodial wallet readiness, peer-to-peer verification, and official Pi Network commerce.
              </p>
              <div className="text-xs text-slate-500 pt-2 border-t border-white/5">
                Cryptographic signatures & verifiable audit trails.
              </div>
            </div>

            <div className="p-6 rounded-lg bg-[#123B72]/20 border border-[#D4AF37]/30 space-y-3">
              <div className="text-sm font-bold text-white flex items-center justify-between">
                <span>GOYE Hub (The Bridge)</span>
                <span className="text-[#D4AF37] text-xs font-mono">HYBRID</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Seamlessly bridges both worlds. Works in standard desktop and mobile browsers, as well as official Pi Browser. Protects your business with real verification and zero mock simulations.
              </p>
              <div className="text-xs text-[#D4AF37] pt-2 border-t border-white/10">
                Secure digital business platform for real trade.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Connected GOYE Ecosystem Architecture */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 mb-8">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
            Interconnected Ecosystem
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Central Hub for the GOYE Enterprise Network.
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl">
            Designed to unify existing and upcoming properties through standardized APIs, shared business identities, and verified trade coordination.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Hub 1: Services Hub */}
          <div className="p-5 rounded-xl bg-[#121620] border border-white/10 space-y-3">
            <div className="text-xs font-mono text-[#D4AF37]">HUB 01</div>
            <h4 className="text-base font-bold text-white">GOYE Services Hub</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Custom software engineering, corporate digital strategy, and enterprise technical consulting.
            </p>
            <a
              href="https://goye.services"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-[#D4AF37] flex items-center gap-1 hover:underline pt-2"
            >
              <span>Visit goye.services</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Hub 2: GOYE Digital */}
          <div className="p-5 rounded-xl bg-[#121620] border border-white/10 space-y-3">
            <div className="text-xs font-mono text-[#D4AF37]">HUB 02</div>
            <h4 className="text-base font-bold text-white">GOYE Digital / gasv.store</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Curated digital commerce, ready-made business assets, digital templates, and turnkey software products.
            </p>
            <a
              href="https://gasv.store"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-[#D4AF37] flex items-center gap-1 hover:underline pt-2"
            >
              <span>Visit gasv.store</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Hub 3: Sirwise / Academy */}
          <div className="p-5 rounded-xl bg-[#121620] border border-white/10 space-y-3">
            <div className="text-xs font-mono text-[#D4AF37]">HUB 03</div>
            <h4 className="text-base font-bold text-white">Sirwise Digital Academy</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Executive training in AI workflows, Pi Network developer architecture, and Web3 business mastery.
            </p>
            <a
              href="https://sirwise.online"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-[#D4AF37] flex items-center gap-1 hover:underline pt-2"
            >
              <span>Visit sirwise.online</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Hub 4: Trade Assurance */}
          <div className="p-5 rounded-xl bg-[#121620] border border-white/10 space-y-3">
            <div className="text-xs font-mono text-[#D4AF37]">HUB 04</div>
            <h4 className="text-base font-bold text-white">GOYE Trade Assurance Hub</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Commercial dispute reduction, milestone evidence tracking, and verifiable trade coordination.
            </p>
            <button
              onClick={() => onNavigate('trade-assurance')}
              className="text-xs text-[#D4AF37] flex items-center gap-1 hover:underline pt-2"
            >
              <span>Explore Trade Assurance</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </section>

      {/* 8. High-Trust Call To Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative p-8 lg:p-14 rounded-2xl bg-[#121620] border border-[#D4AF37]/30 text-center space-y-6 overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Ready to Establish Your Verifiable Business ID?
            </h2>
            <p className="text-sm text-slate-300">
              Join the growing network of verified African and global enterprises operating with cryptographic clarity, automated AI customer care, and dual-mode payments.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={onOpenCreateBusiness}
              className="px-6 py-3 text-sm font-semibold text-[#0B0E14] bg-[#D4AF37] hover:bg-[#e0bc46] rounded-md transition-colors shadow-lg cursor-pointer"
            >
              Register Your Business ID Now
            </button>
            <button
              onClick={() => onNavigate('business-id')}
              className="px-6 py-3 text-sm font-medium text-white bg-white/10 hover:bg-white/15 border border-white/15 rounded-md transition-colors cursor-pointer"
            >
              Search Official Registry
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
