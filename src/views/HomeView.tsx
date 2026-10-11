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
} from 'lucide-react';

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
              <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                <span>AI + Web3 Business Infrastructure</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-400 font-normal">Global Digital Economy</span>
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
                  className="px-5 py-3 text-sm font-semibold text-[#0B0E14] bg-[#D4AF37] hover:bg-[#e0bc46] rounded-md transition-colors shadow-md flex items-center gap-2 shrink-0"
                >
                  <span>Create Business Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('marketplace')}
                  className="px-5 py-3 text-sm font-medium text-white bg-white/10 hover:bg-white/15 border border-white/15 rounded-md transition-colors shrink-0"
                >
                  Explore Services & Marketplace
                </button>

                <button
                  onClick={() => onNavigate('pi-status')}
                  className="px-4 py-3 text-sm font-medium text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 rounded-md transition-colors shrink-0"
                >
                  Pi System Audit
                </button>
              </div>

              {/* Verified Trust Markers (Zero-pill text format) */}
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
                  alt="GOYE Global Financial and Technology Nexus"
                  referrerPolicy="no-referrer"
                  className="w-full h-80 sm:h-96 lg:h-[420px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/40 to-transparent" />
                
                {/* Overlay Card: Live Protocol Metrics */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-lg bg-[#0B0E14]/85 backdrop-blur-md border border-white/10">
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

      {/* 3. BUILD • AUTOMATE • GROW Section */}
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

      {/* 4. Explain Web3 Simply (Zero-jargon educational contrast) */}
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

      {/* 5. Connected GOYE Ecosystem Architecture */}
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

      {/* 6. High-Trust Call To Action */}
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
              className="px-6 py-3 text-sm font-semibold text-[#0B0E14] bg-[#D4AF37] hover:bg-[#e0bc46] rounded-md transition-colors shadow-lg"
            >
              Register Your Business ID Now
            </button>
            <button
              onClick={() => onNavigate('business-id')}
              className="px-6 py-3 text-sm font-medium text-white bg-white/10 hover:bg-white/15 border border-white/15 rounded-md transition-colors"
            >
              Search Official Registry
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
