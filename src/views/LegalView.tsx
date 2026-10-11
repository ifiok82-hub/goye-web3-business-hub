import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, FileText, Lock, Scale } from 'lucide-react';

export const LegalView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'privacy' | 'terms' | 'web3' | 'trade' | 'ai'>('privacy');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
            <span>Statutory Compliance</span>
            <span aria-hidden="true">·</span>
            <span>Governance & Legal Disclosures</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Legal & Compliance Hub
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Transparent operational disclaimers, data protection frameworks, and commercial risk disclosures governing the GOYE Web3 Business Hub platform.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 text-xs">
        {[
          { id: 'privacy', label: 'Privacy Policy' },
          { id: 'terms', label: 'Terms of Service' },
          { id: 'web3', label: 'Web3 Risk Disclosure' },
          { id: 'trade', label: 'Trade & Escrow Disclaimer' },
          { id: 'ai', label: 'AI Accuracy Notice' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            className={`px-4 py-2 rounded-md whitespace-nowrap transition-colors ${
              activeSection === tab.id
                ? 'bg-white text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white bg-[#121620]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="p-8 rounded-xl bg-[#121620] border border-white/10 space-y-6 text-xs text-slate-300 leading-relaxed max-w-4xl">
        {activeSection === 'privacy' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">1. Privacy Policy & Data Sovereignty</h2>
            <p>
              GOYE Technologies respects your entity and personal privacy. We collect only the data necessary to provide cryptographic business identity, invoice generation, contract timestamping, and lead capture routing.
            </p>
            <h3 className="text-sm font-semibold text-white pt-2">Data We Collect</h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Corporate registration data submitted during GOYE Business ID enrollment.</li>
              <li>Operational details, services, catalog items, and business contact channels.</li>
              <li>Server-side audit event logs detailing transaction references and contract signing timestamps.</li>
              <li>Customer inquiries captured through business-configured AI Assistant widgets.</li>
            </ul>
            <p className="pt-2">
              We never sell your corporate data to third parties. Private keys and Pi Wallet passphrases are NEVER requested, handled, or stored by GOYE systems.
            </p>
          </div>
        )}

        {activeSection === 'terms' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">2. Terms of Service & Acceptable Use</h2>
            <p>
              By accessing or creating a profile on GOYE Web3 Business Hub, you agree to these operational terms.
            </p>
            <h3 className="text-sm font-semibold text-white pt-2">Authenticity & Conduct</h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>You may not register fraudulent entities or impersonate existing corporate trademarks.</li>
              <li>You may not use GOYE invoices or contract structures for illegal activities, illicit trade, or deceptive marketing.</li>
              <li>GOYE reserves the right to suspend or revoke verification levels upon confirmed regulatory or trade disputes.</li>
            </ul>
          </div>
        )}

        {activeSection === 'web3' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">3. Web3 & Digital Asset Risk Disclosure</h2>
            <p className="text-amber-400 font-semibold">
              Notice: GOYE Web3 Business Hub is NOT a cryptocurrency investment platform.
            </p>
            <p>
              GOYE does NOT promise profits, guaranteed returns, or speculative rewards. The platform provides software tools for businesses to accept emerging forms of digital settlement and manage verifiable commercial documents.
            </p>
            <h3 className="text-sm font-semibold text-white pt-2">Pi Network Testnet & Mainnet Status</h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Testnet environments are strictly for developer testing and cannot hold real monetary value.</li>
              <li>Mainnet operations require official server credentials and Pi Developer Portal authorization.</li>
              <li>GOYE makes no claim of official affiliation or partnership beyond utilizing the public Pi Platform SDK and APIs.</li>
            </ul>
          </div>
        )}

        {activeSection === 'trade' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">4. Trade Coordination & Non-Custodial Disclaimer</h2>
            <p className="text-amber-400 font-semibold">
              Statutory Notice: GOYE is not a bank or licensed custodial financial institution.
            </p>
            <p>
              GOYE Trade Assurance Hub provides software infrastructure for commercial coordination, evidence collection, and milestone auditing.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>GOYE does NOT hold customer funds in custodial escrow.</li>
              <li>Settlements move directly through approved payment gateways (e.g. Paystack, Flutterwave) or direct bank transfer.</li>
              <li>Digital contracts generated on this platform are operational conveniences and do not substitute for formal legal representation.</li>
            </ul>
          </div>
        )}

        {activeSection === 'ai' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">5. AI Business Assistant Accuracy Notice</h2>
            <p>
              GOYE AI Business Assistants are powered by modern Large Language Models (including server-side Gemini 3.8 Flash). While engineered with strict anti-hallucination guardrails, AI assistants may occasionally produce incomplete statements.
            </p>
            <p>
              Users must always verify official pricing, terms, and delivery schedules through direct human contact with the business before executing financial commitments.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
