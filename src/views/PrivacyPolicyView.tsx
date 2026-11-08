import React from 'react';
import { ShieldCheck, Lock, FileText, ArrowLeft, ExternalLink, Globe, Smartphone, Server } from 'lucide-react';

interface PrivacyPolicyViewProps {
  onNavigateHome?: () => void;
  onNavigateTerms?: () => void;
}

export const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({ onNavigateHome, onNavigateTerms }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between gap-4">
        {onNavigateHome && (
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Return to GOYE Ecosystem</span>
          </button>
        )}
        {onNavigateTerms && (
          <button
            onClick={onNavigateTerms}
            className="text-xs text-[#D4AF37] hover:underline transition-colors cursor-pointer font-medium"
          >
            Read Terms of Service (/terms) &rarr;
          </button>
        )}
      </div>

      {/* Header Banner */}
      <div className="border-b border-white/10 pb-6 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
          <span>Official Statutory Compliance · Public Access</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Privacy Policy & Data Sovereignty Disclosures
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
          Non-custodial cryptographic business infrastructure for the global digital economy. We collect only what is strictly necessary to verify entities, record commercial invoices, and mediate trade.
        </p>
        <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500 font-mono">
          <span>Effective: March 1, 2026</span>
          <span aria-hidden="true">·</span>
          <span>Last Audit: October 15, 2026</span>
          <span aria-hidden="true">·</span>
          <span className="text-[#D4AF37]">URL: https://goye-web3-business-hub.vercel.app/privacy</span>
        </div>
      </div>

      {/* Public Accessibility Banner */}
      <div className="p-4 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-xs text-slate-300 space-y-1.5">
        <div className="font-bold text-[#D4AF37] flex items-center gap-1.5">
          <Lock className="w-4 h-4" />
          <span>Strict Non-Custodial & No-Login Architecture</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          This policy is publicly readable without requiring login, registration, or Pi authentication. GOYE Web3 Business Hub systems NEVER request, store, or handle Pi Wallet passphrases, secret seeds, or private keys.
        </p>
      </div>

      {/* Structured Sections */}
      <div className="space-y-6 text-xs text-slate-300 leading-relaxed">
        {/* Section 1 */}
        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#D4AF37]" />
            1. Introduction & Operational Scope
          </h2>
          <p>
            GOYE Web3 Business Hub (&ldquo;GOYE&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;) provides commercial business identity verification, digital invoicing, cryptographic milestone timestamping, autonomous AI agent services, and trade assurance mediation.
          </p>
          <p>
            This policy applies to all visitors, registered corporate merchants, prospective buyers, and Pi Network Pioneers accessing our services via standard web browsers or the official Pi Browser at <strong>https://goye-web3-business-hub.vercel.app</strong>.
          </p>
        </section>

        {/* Section 2 */}
        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#D4AF37]" />
            2. Corporate & Business Information Collected
          </h2>
          <p>
            When an organization registers for a GOYE Business ID or creates a public profile, we collect:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li><strong>Legal & Trading Identity:</strong> Entity name, brand trading style, CAC/corporate registration number, registered jurisdiction, and physical address.</li>
            <li><strong>Official Contact Channels:</strong> Corporate email address, telephone contact, WhatsApp business dispatch number, and website URL.</li>
            <li><strong>Commercial Catalog:</strong> Product offerings, delivery schedules, price benchmarks (NGN, USD, Pi), and verified capabilities.</li>
            <li><strong>Verification Records:</strong> Optional registration certificates uploaded for compliance level assessment (Levels 1 through 5).</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#D4AF37]" />
            3. Pi Network Authentication Information
          </h2>
          <p>
            Our integration with the official Pi Network Platform SDK and APIs processes:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li><strong>Pioneer Identity:</strong> Pi User Identifier (UID) and public Pi username (e.g., <code>@username</code>) obtained through official <code>Pi.authenticate()</code>.</li>
            <li><strong>Requested Scopes:</strong> Strictly limited to <code>username</code> and <code>payments</code> scopes.</li>
            <li><strong>Anti-Phishing Guarantee:</strong> We NEVER ask you to input your 24-word wallet passphrase or private keys. Any request asking for your passphrase is an impersonation and not affiliated with GOYE.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-[#D4AF37]" />
            4. Payment Processing & Testnet Transactions
          </h2>
          <p>
            Payment transactions operate strictly under official Pi Platform API specifications:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li><strong>Development Environment:</strong> Uses Pi Testnet (0.1 Test-Pi validation payments). Test-Pi has zero monetary value and is used solely for integration testing.</li>
            <li><strong>Two-Phase Verification:</strong> Payments are approved server-side via <code>/api/pi/approve</code> and marked completed only after official blockchain confirmation via <code>/api/pi/complete</code>.</li>
            <li><strong>Zero-Simulation Policy:</strong> Orders are never marked PAID without authoritative blockchain receipts from the Pi Platform API.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#D4AF37]" />
            5. Document Uploads & Cryptographic Storage
          </h2>
          <p>
            Documents submitted to the GOYE Document Vault or Trade Assurance Hub:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li>Generate SHA-256 cryptographic checksums ensuring verifiable non-tampering.</li>
            <li>Are restricted strictly to authenticated business owners and assigned audit compliance officers.</li>
            <li>Are never shared, rented, or traded with third-party marketing companies.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            6. AI Features & Concierge Privacy
          </h2>
          <p>
            Autonomous AI agents configured on the platform (Receptionist, Sales, Support, FAQ):
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li>Synthesize responses strictly from verified business profile data and public listings.</li>
            <li>Route lead intakes (contact details, budget, project scope) exclusively to the business entity.</li>
            <li>Do not retain or transmit proprietary client data to public training sets.</li>
          </ul>
        </section>

        {/* Section 7 - 12 */}
        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white">7. Cookies, Storage & Session Identifiers</h2>
          <p>
            We utilize essential localStorage keys solely to remember UI themes, PWA installation status, and session tokens. No cross-site advertising or third-party behavioral cookies are used.
          </p>
        </section>

        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white">8. Security Architecture & Audit Immutability</h2>
          <p>
            All commercial events—including invoice issuance, contract execution, payment verification, and status changes—are logged into an append-only audit trail with IP address and timestamp recording. Sensitive credentials like <code>PI_API_KEY</code> are strictly maintained on the server and never sent to browsers.
          </p>
        </section>

        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white">9. Data Retention & Archival</h2>
          <p>
            Commercial records and transaction logs are maintained in compliance with business record-keeping practices. Merchants may request profile archiving, data exports, or contact information updates by emailing our compliance team.
          </p>
        </section>

        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white">10. Pioneer & Merchant Rights</h2>
          <p>
            Users have the right to inspect their published business directory records, review their active session status, download their commercial invoices, and disconnect their Pi session at any time.
          </p>
        </section>

        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white">11. Third-Party Infrastructure</h2>
          <p>
            Services rely on official infrastructure provided by SocialChain Inc. (Pi Network Platform API) and Vercel Inc. (Global edge hosting with Transport Layer Security).
          </p>
        </section>

        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white">12. Compliance Contact & Grievance Desk</h2>
          <p>
            For compliance reviews, data inquiries, or verification queries:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li><strong>Compliance Desk:</strong> <a href="mailto:compliance@goye.services" className="text-[#D4AF37] hover:underline">compliance@goye.services</a></li>
            <li><strong>Support Desk:</strong> <a href="mailto:support@goye.services" className="text-[#D4AF37] hover:underline">support@goye.services</a></li>
            <li><strong>Record Verification:</strong> <a href="/verify" className="text-[#D4AF37] hover:underline">https://goye-web3-business-hub.vercel.app/verify</a></li>
          </ul>
        </section>
      </div>

      {/* Footer Disclaimer */}
      <div className="pt-4 border-t border-white/10 text-center text-xs text-slate-500">
        GOYE Web3 Business Hub · Public Privacy Policy · Domain: goye-web3-business-hub.vercel.app
      </div>
    </div>
  );
};
