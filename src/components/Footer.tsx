import React from 'react';
import { ExternalLink, ShieldCheck, Download } from 'lucide-react';
import { GoyeLogo } from './GoyeLogo';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useSevenTap } from '../hooks/useSevenTap';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { openPromptManually, isInstalled } = usePWAInstall();
  const handleTap = useSevenTap(onNavigate);

  return (
    <footer className="bg-[#080A0F] border-t border-white/10 text-slate-400 text-sm mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & Purpose */}
          <div className="lg:col-span-2 space-y-4">
            <button
              onClick={() => onNavigate('home')}
              className="text-left focus:outline-none cursor-pointer"
            >
              <GoyeLogo size="sm" subtitle="Business Hub" />
            </button>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Build. Automate. Trade. Pay. Grow.
              <br />
              Enterprise AI tools, verifiable digital commerce identity, cryptographic contracts, and Web3 infrastructure connecting African and global enterprises.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>Strict Anti-Speculation & Transparent Identity Architecture</span>
            </div>
          </div>

          {/* Ecosystem Properties */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">GOYE Ecosystem</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">
                  GOYE Business Hub
                </button>
              </li>
              <li>
                <a
                  href="https://goye.services"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1 group"
                >
                  <span>GOYE Services Hub</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li>
                <a
                  href="https://gasv.store"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1 group"
                >
                  <span>GOYE Digital / gasv.store</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li>
                <a
                  href="https://sirwise.online"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1 group"
                >
                  <span>Sirwise.online Academy</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li>
                <button onClick={() => onNavigate('trade-assurance')} className="hover:text-white transition-colors">
                  GOYE Trade Assurance Hub
                </button>
              </li>
            </ul>
          </div>

          {/* Infrastructure & Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Platform Services</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('business-id')} className="hover:text-white transition-colors">
                  GOYE Business ID
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('marketplace')} className="hover:text-white transition-colors">
                  Enterprise Marketplace
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contracts-invoices')} className="hover:text-white transition-colors">
                  Digital Contracts & Invoices
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('ai-agents')} className="hover:text-white transition-colors">
                  Autonomous AI Agents
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('pi-readiness')} className="hover:text-[#D4AF37] transition-colors font-medium">
                  Pi Readiness Diagnostic
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('pi-developer-checklist')} className="hover:text-[#D4AF37] transition-colors font-medium">
                  Pi Developer Checklist
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('pi-sandbox-test')} className="hover:text-[#D4AF37] transition-colors font-medium">
                  Pi Sandbox Test (/pi-sandbox-test)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('pi-status')} className="hover:text-white transition-colors">
                  Pi Network Technical Status
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('verify')} className="hover:text-[#D4AF37] transition-colors font-semibold">
                  Official Record Verifier
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Governance */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Compliance & Legal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('privacy')} className="hover:text-white transition-colors font-medium text-[#D4AF37]">
                  Privacy Policy (/privacy)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('terms')} className="hover:text-white transition-colors font-medium text-[#D4AF37]">
                  Terms of Service (/terms)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('legal')} className="hover:text-white transition-colors">
                  Legal Disclosures & Overview
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('legal')} className="hover:text-white transition-colors">
                  Web3 Risk Disclosure
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('legal')} className="hover:text-white transition-colors">
                  Payment & Escrow Disclaimer
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('legal')} className="hover:text-white transition-colors">
                  AI Accuracy Notice
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('pi-status')} className="hover:text-white transition-colors">
                  Production Readiness Audit
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-[#D4AF37] transition-colors font-medium">
                  Compliance Admin Console
                </button>
              </li>
              {!isInstalled && (
                <li>
                  <button
                    onClick={openPromptManually}
                    className="text-[#D4AF37] hover:text-[#f3c643] transition-colors font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Install PWA App</span>
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Mandatory Regulatory & Risk Disclosure */}
        <div className="mt-12 pt-8 border-t border-white/5 text-xs text-slate-500 space-y-3 leading-relaxed">
          <p>
            <strong className="text-slate-400">Mandatory Regulatory Notice:</strong> GOYE Web3 Business Hub is a digital business infrastructure and software platform. GOYE is not a bank, trust company, or licensed custodial financial institution. Digital contracts and invoice records are generated for commercial management and operational coordination and do not replace independent legal or financial counsel.
          </p>
          <p>
            <strong className="text-slate-400">Digital Asset & Pi Network Status:</strong> GOYE does not guarantee cryptocurrency profits, price performance, or investment yields. Pi Network Testnet is strictly for developer experimentation. Mainnet operations remain gated by official server-side credential verification and Pi Developer Portal compliance. GOYE does not claim unverified affiliations or government accreditation.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>© 2026 GOYE Technologies. All rights reserved.</div>
            <div className="flex items-center gap-3 text-slate-400">
              <button
                onClick={() => onNavigate('privacy')}
                className="hover:text-[#D4AF37] transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
              <span className="text-slate-600">|</span>
              <button
                onClick={() => onNavigate('terms')}
                className="hover:text-[#D4AF37] transition-colors cursor-pointer"
              >
                Terms of Service
              </button>
            </div>
            <div className="text-slate-400">Build. Automate. Trade. Pay. Grow.</div>
          </div>
        </div>

        {/* Secret 7-Tap Admin Access Logo in Footer */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col items-center justify-center">
          <div
            id="goye-secret-admin-logo"
            onClick={handleTap}
            onTouchStart={handleTap}
            onTouchEnd={(e) => e.preventDefault()}
            className="flex items-center gap-2 p-4 opacity-60 cursor-default select-none group transition-transform duration-100"
            style={{ touchAction: 'manipulation', userSelect: 'none' }}
          >
            <div className="w-10 h-10 rounded-full bg-[#c9a84c] flex items-center justify-center font-bold text-[#0B0E14]">G</div>
            <span className="text-sm font-bold text-white">GOYE WEB3</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
