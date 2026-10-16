import React from 'react';
import {
  ShieldCheck,
  Lock,
  FileText,
  ArrowLeft,
  ExternalLink,
  Globe,
  AlertTriangle,
  Scale,
  Cpu,
  ShoppingBag,
  Coins,
  CheckCircle2,
  HelpCircle,
  Clock,
  BookOpen,
} from 'lucide-react';

interface TermsOfServiceViewProps {
  onNavigateHome?: () => void;
  onNavigatePrivacy?: () => void;
}

export const TermsOfServiceView: React.FC<TermsOfServiceViewProps> = ({
  onNavigateHome,
  onNavigatePrivacy,
}) => {
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
        {onNavigatePrivacy && (
          <button
            onClick={onNavigatePrivacy}
            className="text-xs text-[#D4AF37] hover:underline transition-colors cursor-pointer font-medium"
          >
            Read Privacy Policy (/privacy) &rarr;
          </button>
        )}
      </div>

      {/* Header Banner */}
      <div className="border-b border-white/10 pb-6 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
          <Scale className="w-4 h-4 text-[#D4AF37]" />
          <span>Legal Agreement · Public Access · No Login Required</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Terms of Service
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
          Standard terms, conditions, disclosures, and operational rules governing access to and use of the GOYE Web3 Business Hub platform, enterprise software tools, and related digital services.
        </p>
        <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500 font-mono">
          <span>Effective Date: October 16, 2026</span>
          <span aria-hidden="true">·</span>
          <span>Last Updated: October 16, 2026</span>
          <span aria-hidden="true">·</span>
          <span className="text-[#D4AF37]">URL: https://goye-web3-business-hub.vercel.app/terms</span>
        </div>
      </div>

      {/* Mandatory Prominent Notice (Requirement 18) */}
      <div className="p-5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-xs text-slate-200 space-y-2">
        <div className="font-bold text-[#D4AF37] flex items-center gap-2 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Notice of Binding Terms</span>
        </div>
        <p className="text-sm font-semibold text-white leading-relaxed">
          These Terms govern use of the GOYE Web3 Business Hub. By using the platform, you agree to these Terms.
        </p>
        <p className="text-slate-300 leading-relaxed">
          Please read these Terms carefully before accessing or using GOYE Web3 Business Hub. If you do not agree to all provisions of these Terms, you must not access or use the platform.
        </p>
      </div>

      {/* Public Accessibility & Non-Custodial Notice (Requirements 1, 7, 8, 20) */}
      <div className="p-4 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-300 space-y-1.5">
        <div className="font-semibold text-white flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Independent Platform · Non-Custodial · Zero-Credential Architecture</span>
        </div>
        <p className="text-slate-400 leading-relaxed">
          This document is publicly accessible without login, registration, or Pi authentication. GOYE Web3 Business Hub is an independent software application. References to Pi Network describe technical compatibility and API integration where applicable. GOYE is not affiliated with, certified by, or an official partner of the Pi Core Team, nor a bank, licensed depository institution, or custodial escrow provider.
        </p>
      </div>

      {/* Structured Sections (Requirements 10, 11, 12, 13) */}
      <div className="space-y-6 text-xs text-slate-300 leading-relaxed">

        {/* 1. Acceptance of Terms */}
        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#D4AF37]" />
            1. Acceptance of Terms
          </h2>
          <p>
            By visiting, browsing, registering on, or interacting with the GOYE Web3 Business Hub (the &ldquo;Platform&rdquo;, &ldquo;Service&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), whether through a standard web browser, mobile browser, or the official Pi Browser, you (&ldquo;User&rdquo;, &ldquo;Merchant&rdquo;, &ldquo;Pioneer&rdquo;, or &ldquo;you&rdquo;) enter into a legally binding agreement subject to these Terms of Service (&ldquo;Terms&rdquo;) and our accompanying{' '}
            <button
              onClick={onNavigatePrivacy}
              className="text-[#D4AF37] underline hover:text-white transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>.
          </p>
          <p>
            If you represent a corporate entity, partnership, or enterprise, you represent and warrant that you possess the full legal power and authority to bind that entity to these Terms.
          </p>
        </section>

        {/* 2. Description of GOYE Web3 Business Hub */}
        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#D4AF37]" />
            2. Description of GOYE Web3 Business Hub
          </h2>
          <p>
            GOYE Web3 Business Hub is an enterprise software platform designed to provide commercial tools for business identity creation, digital catalog management, cryptographic document milestone recording, digital invoice generation, autonomous AI assistant routing, and trade assurance mediation.
          </p>
          <p>
            GOYE operates solely as a software technology platform. We do not act as a broker, lender, custodian, bank, payment processor, insurer, or guarantor of any merchant, product, or transaction listed on the platform.
          </p>
        </section>

        {/* 3. Eligibility */}
        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
            3. Eligibility
          </h2>
          <p>
            You must be at least 18 years old or the age of legal majority in your jurisdiction to use the Platform. By using GOYE, you represent and warrant that:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
            <li>You have the legal capacity to form a binding contract.</li>
            <li>You are not barred from receiving services under applicable trade sanctions or international law.</li>
            <li>Your use of the Platform complies with all local, regional, and national laws and regulations applicable to your business operations.</li>
          </ul>
        </section>

        {/* 4. Pi Authentication and Account Access */}
        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#D4AF37]" />
            4. Pi Authentication and Account Access
          </h2>
          <p>
            GOYE supports optional sign-in via the official Pi Network authentication mechanism (Pi SDK / OAuth Implicit Flow).
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
            <li><strong>Non-Custodial Architecture:</strong> GOYE never requests, receives, transmits, or stores your Pi Wallet passphrase, secret seed phrase, or private keys. Any request purporting to ask for your passphrase in connection with GOYE is fraudulent and should be reported immediately.</li>
            <li><strong>Account Responsibility:</strong> You are solely responsible for maintaining the confidentiality of your Pi account, mobile device, and credentials used to interact with the Platform.</li>
            <li><strong>Technical Compatibility:</strong> References to Pi Network describe technical compatibility and official SDK integration. GOYE is an independently developed application and is not operated by the Pi Core Team.</li>
          </ul>
        </section>

        {/* 5. Business ID */}
        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#D4AF37]" />
            5. Business ID (Digital Commercial Identity)
          </h2>
          <p>
            Merchants may register a structured digital commercial identity (&ldquo;GOYE Business ID&rdquo;, format <code>GOYE-BIZ-YYYY-XXXXXX</code>) to publish catalogs, issue digital invoices, and record corporate operational parameters.
          </p>
          <p>
            You warrant that all corporate details, commercial names, tax identification numbers, and contact channels provided during Business ID creation are truthful, accurate, and kept up to date. Impersonation of existing entities or registered trademarks is strictly prohibited.
          </p>
        </section>

        {/* 6. Business Verification */}
        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            6. Business Verification
          </h2>
          <p>
            GOYE provides programmatic verification markers (such as &ldquo;Tier 1 Verified&rdquo;, &ldquo;Cryptographically Verified&rdquo;, or &ldquo;Active Merchant&rdquo;).
          </p>
          <p className="text-slate-400">
            <strong>Limitation:</strong> Business verification denotes that specified data points or documents were submitted and mathematically verified or timestamped on our platform. Verification does NOT constitute:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li>A government accreditation or corporate affairs commission endorsement.</li>
            <li>A guarantee of merchant solvency, creditworthiness, or performance.</li>
            <li>An endorsement, insurance policy, or warranty by GOYE regarding goods or services.</li>
          </ul>
        </section>

        {/* 7. AI Services and AI-Generated Information */}
        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#D4AF37]" />
            7. AI Services and AI-Generated Information
          </h2>
          <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-semibold">
            Mandatory Disclaimer: AI-generated information is provided for convenience and operational assistance only and must be independently reviewed.
          </div>
          <p>
            The Platform offers autonomous AI concierge assistants, natural language catalog search, and automated inquiry routing. You expressly acknowledge and agree that:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
            <li>AI responses are machine-generated approximations based on available catalog data and context.</li>
            <li>AI-generated text does NOT constitute legal, financial, accounting, tax, regulatory, or engineering advice.</li>
            <li>Users must verify specifications, pricing, delivery times, and contract details directly with the human counterparty before entering financial commitments.</li>
            <li>GOYE does not warrant that AI outputs will be error-free, uninterrupted, or fully accurate in all operational scenarios.</li>
          </ul>
        </section>

        {/* 8. Marketplace */}
        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
            8. Marketplace & Merchant Catalogues
          </h2>
          <p>
            GOYE provides a decentralized digital marketplace directory enabling verified businesses to showcase products, services, and commercial offerings.
          </p>
          <p>
            All purchase agreements, commercial sales, product warranties, and shipping commitments are strictly bipartite contracts between the respective buyer and seller. GOYE is not a party to such transactions and assumes no liability for product defects, non-delivery, or merchant breach.
          </p>
        </section>

        {/* 9. Digital Contracts */}
        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#D4AF37]" />
            9. Digital Contracts & Cryptographic Milestone Recording
          </h2>
          <p>
            The Platform provides contract templates, milestone tracking, and SHA-256 cryptographic verification hashes to record agreed deliverables between commercial parties.
          </p>
          <p className="text-slate-400">
            <strong>Legal Counsel Notice:</strong> Contract templates and digital signing workflows provided through GOYE are software utilities and do NOT constitute formal legal advice or statutory attorney representation. Parties are advised to seek independent legal counsel in their relevant jurisdiction to ensure compliance with local contract law.
          </p>
        </section>

        {/* 10. Digital Invoices */}
        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#D4AF37]" />
            10. Digital Invoices
          </h2>
          <p>
            Businesses may generate digital invoices containing unique invoice references, QR verification codes, line items, and payment instructions.
          </p>
          <p>
            Merchants are solely responsible for determining and fulfilling applicable sales tax, VAT, withholding tax, and reporting obligations arising from invoices issued through the Platform.
          </p>
        </section>

        {/* 11. Service Booking */}
        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#D4AF37]" />
            11. Service Booking & Availability Schedules
          </h2>
          <p>
            GOYE offers operational calendar scheduling, consultation booking, and professional appointment slots. Merchants define availability, consultation rates, and cancellation windows. Users agree to respect confirmed bookings and merchant cancellation policies.
          </p>
        </section>

        {/* 12. Trade Assurance */}
        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            12. Trade Assurance & Milestone Mediation
          </h2>
          <div className="p-3.5 rounded-lg bg-slate-900 border border-white/10 text-slate-300">
            <strong>Statutory Disclosure:</strong> Trade Assurance on GOYE is a technical software mediation framework and cryptographic milestone reconciliation protocol. It does NOT create a bank, licensed financial institution, trust company, or custodial escrow relationship unless a specific regulated service is actually implemented and legally authorized.
          </div>
          <p>
            Funds or transaction references tracked through Trade Assurance represent commercial agreements between buyer and seller. GOYE provides software-based status logging and audit logs but does not hold customer fiat deposits in custodial escrow.
          </p>
        </section>

        {/* 13. Document Vault */}
        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#D4AF37]" />
            13. Document Vault & Cryptographic Timestamping
          </h2>
          <p>
            Users may register document metadata, certificate hashes, and operational files in the GOYE Document Vault. Hashes generated (SHA-256) serve to establish proof-of-existence at a specific point in time. GOYE does not guarantee permanent archival retention of underlying heavy binary files and recommends users maintain independent offline backups.
          </p>
        </section>

        {/* 14. Payments */}
        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Coins className="w-4 h-4 text-[#D4AF37]" />
            14. Payments Architecture & Settlement
          </h2>
          <p>
            GOYE integrates with multiple payment rails including direct merchant settlement and Web3 protocols. GOYE does not guarantee third-party blockchain network confirmation times, gas fees, or third-party bank clearing schedules.
          </p>
        </section>

        {/* 15. Pi Testnet and Test-Pi */}
        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Coins className="w-4 h-4 text-[#D4AF37]" />
            15. Pi Testnet and Test-Pi Disclosures
          </h2>
          <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 space-y-1">
            <div className="font-bold">Current Operational Status: Pi Testnet Developer Mode</div>
            <p>
              GOYE Web3 Business Hub is currently configured for Pi Testnet development and testing. Test-Pi transactions executed on the platform use the Pi Testnet blockchain and have NO real monetary value, cash equivalent, or commercial value.
            </p>
          </div>
          <p>
            Testnet payments are strictly for developer debugging, milestone simulation, and verification of approval workflows. You agree not to attempt to purchase real goods or services using Test-Pi with an expectation of legal or commercial monetary consideration.
          </p>
        </section>

        {/* 16. Future Pi Mainnet Payments */}
        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Coins className="w-4 h-4 text-[#D4AF37]" />
            16. Future Pi Mainnet Payments & Review Status
          </h2>
          <p>
            Mainnet payment functionality is currently <strong>DISABLED</strong> in accordance with architectural isolation rules. Mainnet payments will only be enabled if and when the GOYE application receives official credentials and approval through the Pi Developer Portal review process.
          </p>
          <p>
            GOYE does not represent or warrant that Mainnet approval will occur on any specific date. Production payment availability must never be represented to buyers as active unless officially announced and verified on the platform.
          </p>
        </section>

        {/* 17. Refunds and Cancellations */}
        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#D4AF37]" />
            17. Refunds and Cancellations
          </h2>
          <p>
            Refund and cancellation terms for commercial products and services listed on GOYE are set individually by each selling merchant in their catalog policies.
          </p>
          <p>
            Platform subscription fees or software tooling charges (if any) are non-refundable once computational or cryptographic verification services have been rendered, except where required by mandatory consumer protection law.
          </p>
        </section>

        {/* 18. User Responsibilities */}
        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
            18. User Responsibilities
          </h2>
          <p>When using the Platform, you agree to:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
            <li>Provide true, accurate, and current business and personal details.</li>
            <li>Maintain security over your authentication sessions, browser, and device.</li>
            <li>Promptly notify our compliance desk if you suspect unauthorized access.</li>
            <li>Fulfill all commercial contracts and invoices agreed with other merchants.</li>
            <li>Comply with all applicable tax and regulatory reporting rules in your jurisdiction.</li>
          </ul>
        </section>

        {/* 19. Prohibited Activities */}
        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#D4AF37]" />
            19. Prohibited Activities
          </h2>
          <p>Users are strictly prohibited from:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
            <li>Publishing fraudulent, deceptive, counterfeit, or misleading business profiles.</li>
            <li>Attempting to phishing, harvesting, or requesting Pi Wallet passphrases or seed phrases.</li>
            <li>Engaging in money laundering, terrorist financing, sanction evasion, or illegal commercial trade.</li>
            <li>Creating fake or simulated payment proofs, fraudulent txids, or fabricated verification badges.</li>
            <li>Interfering with the operation, security, or network infrastructure of the Platform or Vercel hosting.</li>
            <li>Scraping or harvesting user directories without explicit authorization.</li>
          </ul>
        </section>

        {/* 20. Intellectual Property */}
        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#D4AF37]" />
            20. Intellectual Property Rights
          </h2>
          <p>
            The GOYE Web3 Business Hub software, user interface design, logos, brand elements, and underlying codebase are the intellectual property of GOYE Technologies and its licensors. All rights not expressly granted herein are reserved.
          </p>
          <p>
            Merchants retain ownership of their proprietary logos, trademarks, and catalog content uploaded to the Platform, while granting GOYE a worldwide, non-exclusive license to display such content for catalog hosting, verification, and marketplace operation.
          </p>
        </section>

        {/* 21. Third-Party Services */}
        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-[#D4AF37]" />
            21. Third-Party Services & Links
          </h2>
          <p>
            The Platform may interface with or provide links to third-party services, including Pi Network (Pi Browser, Pi SDK, Pi Platform API), payment gateways (Paystack, Flutterwave), cloud providers (Vercel, Google Cloud), and external merchant sites.
          </p>
          <p>
            GOYE does not control and is not responsible for the content, privacy practices, terms, or availability of any third-party service. Your interactions with third-party providers are governed by their respective terms.
          </p>
        </section>

        {/* 22. Service Availability */}
        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#D4AF37]" />
            22. Service Availability & Maintenance
          </h2>
          <p>
            While we strive for high availability and reliability, GOYE does not warrant that the Service will be uninterrupted, error-free, or perpetually available. We reserve the right to perform scheduled maintenance, upgrades, or emergency security patches with or without prior notice.
          </p>
        </section>

        {/* 23. Security */}
        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#D4AF37]" />
            23. Security & Non-Custodial Architecture
          </h2>
          <p>
            GOYE implements industry-standard Transport Layer Security (TLS/HTTPS), salted cryptographic password hashing, role-based access control, and strict environment variable isolation for server API keys.
          </p>
          <p>
            Because GOYE is strictly non-custodial, the loss or compromise of your independent Pi Wallet credentials, device access, or local private keys cannot be reversed or recovered by GOYE.
          </p>
        </section>

        {/* 24. Privacy */}
        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            24. Privacy & Data Governance
          </h2>
          <p>
            Our collection, handling, and protection of personal and commercial data are governed comprehensively by our{' '}
            <button
              onClick={onNavigatePrivacy}
              className="text-[#D4AF37] underline hover:text-white transition-colors cursor-pointer font-medium"
            >
              Privacy Policy (/privacy)
            </button>
            , which is incorporated by reference into these Terms.
          </p>
        </section>

        {/* 25. Disclaimer */}
        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#D4AF37]" />
            25. Disclaimer of Warranties
          </h2>
          <p className="uppercase text-[11px] font-mono text-slate-400">
            TO THE MAXIMUM EXTENT PERMITTED UNDER APPLICABLE LAW, THE GOYE WEB3 BUSINESS HUB PLATFORM, ITS TOOLS, CATALOGUES, CONTRACT TEMPLATES, AND AI ASSISTANTS ARE PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING WITHOUT LIMITATION WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, NON-INFRINGEMENT, OR UNINTERRUPTED AVAILABILITY.
          </p>
        </section>

        {/* 26. Limitation of Liability */}
        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#D4AF37]" />
            26. Limitation of Liability
          </h2>
          <p className="uppercase text-[11px] font-mono text-slate-400">
            IN NO EVENT SHALL GOYE TECHNOLOGIES, ITS DIRECTORS, EMPLOYEES, AFFILIATES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES (INCLUDING LOSS OF PROFITS, DATA, GOODWILL, REPUTATION, OR BUSINESS INTERRUPTION) ARISING OUT OF OR IN CONNECTION WITH YOUR ACCESS TO OR INABILITY TO USE THE PLATFORM, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
          </p>
          <p>
            GOYE&apos;s aggregate liability for all claims arising under these Terms shall not exceed the total fees paid by you directly to GOYE for platform access during the three (3) months preceding the event giving rise to liability, or fifty US Dollars ($50.00 USD), whichever is lesser.
          </p>
        </section>

        {/* 27. Indemnification */}
        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#D4AF37]" />
            27. Indemnification
          </h2>
          <p>
            You agree to defend, indemnify, and hold harmless GOYE Technologies, its officers, directors, employees, and agents from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or legal fees arising out of or relating to your violation of these Terms, your commercial transactions with third parties, or your misuse of the Platform.
          </p>
        </section>

        {/* 28. Suspension and Termination */}
        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#D4AF37]" />
            28. Suspension and Termination
          </h2>
          <p>
            We reserve the right, in our reasonable discretion and without liability, to suspend, terminate, or restrict your access to the Platform or Business ID verification if you violate these Terms, engage in fraudulent commerce, or compromise platform integrity. You may discontinue use of the Service at any time.
          </p>
        </section>

        {/* 29. Changes to the Terms */}
        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#D4AF37]" />
            29. Changes to These Terms
          </h2>
          <p>
            We may revise and update these Terms from time to time to reflect operational enhancements, statutory changes, or platform improvements. When updates are published, the &ldquo;Last Updated&rdquo; date at the top of this page will be revised accordingly. Continued use of the Platform following published changes constitutes acceptance of the revised Terms.
          </p>
        </section>

        {/* 30. Governing Law */}
        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#D4AF37]" />
            30. Governing Law & Dispute Resolution
          </h2>
          <p>
            These Terms and any dispute or claim arising out of or related to them shall be governed by and construed in accordance with applicable commercial laws, without giving effect to any choice of law or conflict of law principles. Parties agree to attempt in good faith to resolve any dispute through informal administrative mediation before initiating legal proceedings.
          </p>
        </section>

        {/* 31. Contact and Support (Requirement 15) */}
        <section className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#D4AF37]" />
            31. Contact & Support Desk
          </h2>
          <p>
            If you have questions, inquiries, or grievance notices regarding these Terms of Service or wish to submit an administrative inquiry, please use our official support channels:
          </p>
          <div className="p-4 rounded-lg bg-slate-900 border border-white/5 space-y-2 text-slate-300">
            <div>
              <strong>Compliance & Legal Desk:</strong>{' '}
              <a href="mailto:compliance@goye.services" className="text-[#D4AF37] hover:underline font-mono">
                compliance@goye.services
              </a>
            </div>
            <div>
              <strong>In-App Support Ticket Desk:</strong> Accessible via the Compliance Admin Console (<code>/admin</code>) or the AI Concierge.
            </div>
            <div>
              <strong>Platform URL:</strong>{' '}
              <a href="https://goye-web3-business-hub.vercel.app" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white font-mono">
                https://goye-web3-business-hub.vercel.app
              </a>
            </div>
          </div>
        </section>

      </div>

      {/* Bottom Action Footer */}
      <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div>
          © 2026 GOYE Technologies. All rights reserved.
        </div>
        <div className="flex items-center gap-4">
          {onNavigatePrivacy && (
            <button
              onClick={onNavigatePrivacy}
              className="text-[#D4AF37] hover:underline cursor-pointer"
            >
              Privacy Policy (/privacy)
            </button>
          )}
          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              Ecosystem Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
