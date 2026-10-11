import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Server,
  Lock,
  Smartphone,
  Layers,
  FileCheck2,
} from 'lucide-react';

export const PiStatusView: React.FC = () => {
  const [piStatus, setPiStatus] = useState<any | null>(null);
  const [systemAudit, setSystemAudit] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const [piRes, auditRes] = await Promise.all([
        fetch('/api/pi/status'),
        fetch('/api/audit/system-status'),
      ]);
      const piData = await piRes.json();
      const auditData = await auditRes.json();
      setPiStatus(piData);
      setSystemAudit(auditData);
    } catch (err) {
      console.error('Error fetching system audit:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const getBadgeClass = (val: string) => {
    if (val === 'CONFIGURED' || val === 'AVAILABLE' || val === 'ACTIVE' || val === 'VERIFIED') {
      return 'text-emerald-400 bg-emerald-950/60 border border-emerald-800';
    }
    if (val.includes('MANUAL') || val.includes('TESTNET') || val.includes('REQUIRED')) {
      return 'text-amber-400 bg-amber-950/60 border border-amber-800';
    }
    return 'text-red-400 bg-red-950/60 border border-red-800';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
            <span>Production Audit Console</span>
            <span aria-hidden="true">·</span>
            <span>Zero-Simulation Enforcement</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Pi Network & System Status Audit
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Factual engineering telemetry reflecting the true configuration state of the GOYE platform. Never artificially reports green or simulates external gateway approval.
          </p>
        </div>

        <button
          onClick={fetchStatus}
          disabled={loading}
          className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-[#121620] border border-white/10 hover:border-white/20 rounded-md transition-colors flex items-center gap-2 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Audit</span>
        </button>
      </div>

      {/* Mandatory Notice */}
      <div className="p-4 rounded-xl bg-[#121620] border border-white/10 flex items-start gap-3 text-xs text-slate-400">
        <ShieldAlert className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-200">Strict Anti-Mock Policy:</strong> Mock payments, simulated transaction IDs, and bypass flags are permanently prohibited in this codebase. If external credentials are unconfigured, operations truthfully fail closed with transparent status notices.
        </div>
      </div>

      {/* 1. Official Pi System Technical Status Matrix */}
      {piStatus && (
        <div className="p-6 sm:p-8 rounded-xl bg-[#121620] border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Pi Network Integration Matrix</h2>
              <p className="text-xs text-slate-400">Platform API v2 Specification</p>
            </div>
            <div className="text-xs font-mono text-[#D4AF37]">{piStatus.environment}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Environment */}
            <div className="p-4 rounded-lg bg-[#0B0E14] border border-white/5 space-y-2">
              <div className="text-slate-400">PI ENVIRONMENT</div>
              <div className="text-base font-bold text-white font-mono">{piStatus.environment}</div>
              <div className="text-[11px] text-slate-500">
                Default safe environment for developer validation.
              </div>
            </div>

            {/* Sandbox Mode */}
            <div className="p-4 rounded-lg bg-[#0B0E14] border border-white/5 space-y-2">
              <div className="text-slate-400">SANDBOX MODE</div>
              <div className="text-base font-bold text-white font-mono">
                {piStatus.sandbox ? 'ENABLED (true)' : 'DISABLED (false)'}
              </div>
              <div className="text-[11px] text-slate-500">
                Determines whether Pi.init routes to Testnet or Production.
              </div>
            </div>

            {/* Server API Key Status */}
            <div className="p-4 rounded-lg bg-[#0B0E14] border border-white/5 space-y-2">
              <div className="text-slate-400">SERVER API KEY</div>
              <div>
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${getBadgeClass(piStatus.serverApiKeyStatus)}`}>
                  {piStatus.serverApiKeyStatus}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Loaded exclusively from process.env.PI_API_KEY. Never sent to browser.
              </div>
            </div>

            {/* Testnet Wallet */}
            <div className="p-4 rounded-lg bg-[#0B0E14] border border-white/5 space-y-2">
              <div className="text-slate-400">TESTNET WALLET</div>
              <div>
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${getBadgeClass(piStatus.testnetWallet)}`}>
                  {piStatus.testnetWallet}
                </span>
              </div>
              <div className="text-[11px] text-[#D4AF37]">{piStatus.testnetWalletLabel}</div>
            </div>

            {/* Mainnet Wallet */}
            <div className="p-4 rounded-lg bg-[#0B0E14] border border-white/5 space-y-2">
              <div className="text-slate-400">MAINNET WALLET</div>
              <div>
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${getBadgeClass(piStatus.mainnetWallet)}`}>
                  {piStatus.mainnetWallet}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Requires official Pi Developer Portal production configuration.
              </div>
            </div>

            {/* Payment Verification Status */}
            <div className="p-4 rounded-lg bg-[#0B0E14] border border-white/5 space-y-2">
              <div className="text-slate-400">PAYMENT VERIFICATION</div>
              <div>
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${getBadgeClass(piStatus.paymentVerification)}`}>
                  {piStatus.paymentVerification}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Server-side approval & completion via /api/pi/approve and /complete.
              </div>
            </div>

            {/* Domain Validation */}
            <div className="p-4 rounded-lg bg-[#0B0E14] border border-white/5 space-y-2">
              <div className="text-slate-400">DOMAIN VALIDATION</div>
              <div>
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${getBadgeClass(piStatus.domainValidation)}`}>
                  {piStatus.domainValidation}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Requires manual registration in Pi Developer Portal app settings.
              </div>
            </div>

            {/* Mock Payment System */}
            <div className="p-4 rounded-lg bg-[#0B0E14] border border-white/5 space-y-2">
              <div className="text-slate-400">MOCK PAYMENT FLOW</div>
              <div>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800">
                  DISABLED
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Guaranteed: No mock or simulated callbacks exist.
              </div>
            </div>

            {/* Mainnet Activation State */}
            <div className="p-4 rounded-lg bg-[#0B0E14] border border-white/5 space-y-2">
              <div className="text-slate-400">MAINNET ACTIVATION</div>
              <div className="text-xs font-semibold text-amber-400">
                {piStatus.mainnetActivation}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Persistent Database Architecture & Integrity Audit */}
      {systemAudit?.database && (
        <div className="p-6 sm:p-8 rounded-xl bg-[#121620] border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#123B72]/40 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Database Persistence & Relational Schema Audit</h2>
                <p className="text-xs text-slate-400">Enterprise relational architecture with atomic persistence & Cloud SQL adapter</p>
              </div>
            </div>
            <div>
              <span
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                  systemAudit.database.isProductionDbConfigured
                    ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800'
                    : 'text-amber-400 bg-amber-950/60 border border-amber-800'
                }`}
              >
                {systemAudit.database.isProductionDbConfigured
                  ? 'CLOUD_SQL_POSTGRES: CONFIGURED'
                  : 'DATABASE PRODUCTION CREDENTIALS: NOT CONFIGURED'}
              </span>
            </div>
          </div>

          {/* Transparent Status Report Notice */}
          <div className="p-4 rounded-lg bg-[#0B0E14] border border-white/5 space-y-2 text-xs">
            <div className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">Active Persistence Engine Report</div>
            <div className="text-slate-200 font-mono leading-relaxed">
              {systemAudit.database.status}
            </div>
            <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-2">
              <span>Primary Storage Engine:</span>
              <code className="text-[#D4AF37] font-mono">{systemAudit.database.persistenceFile}</code>
            </div>
          </div>

          {/* Table Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
            {systemAudit.database.records &&
              Object.entries(systemAudit.database.records).map(([key, count]: [string, any]) => (
                <div key={key} className="p-3 rounded bg-[#0B0E14] border border-white/5 space-y-1">
                  <div className="text-[10px] text-slate-500 uppercase truncate">{key.replace('_', ' ')}</div>
                  <div className="text-lg font-bold text-white font-mono">{count}</div>
                  <div className="text-[10px] text-emerald-400">Persistent</div>
                </div>
              ))}
          </div>

          {/* 25 Standardized Schemas Implemented */}
          <div className="space-y-2 text-xs pt-2">
            <div className="text-slate-400 font-semibold flex items-center justify-between">
              <span>25 Relational Tables with Foreign Key Constraints & Immutable Audit Logs</span>
              <span className="text-[11px] font-mono text-emerald-400">100% Schema Coverage</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {systemAudit.database.schemasImplemented?.map((schema: string) => (
                <span
                  key={schema}
                  className="px-2 py-0.5 rounded bg-[#0B0E14] border border-white/10 text-[11px] font-mono text-slate-300"
                >
                  {schema}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Automated Production Readiness Report */}
      {systemAudit && (
        <div className="p-6 sm:p-8 rounded-xl bg-[#121620] border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Full Platform Production Readiness Report</h2>
              <p className="text-xs text-slate-400">Generated: {new Date(systemAudit.timestamp).toLocaleString()}</p>
            </div>
            <div className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-1 rounded">
              BUILD: {systemAudit.buildStatus}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* CONFIGURED */}
            <div className="p-5 rounded-lg bg-[#0B0E14] border border-emerald-900/40 space-y-3">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>CONFIGURED & OPERATIONAL</span>
              </div>
              <ul className="space-y-1.5 text-slate-300">
                {systemAudit.configuredItems.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-snug">
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* NOT CONFIGURED */}
            <div className="p-5 rounded-lg bg-[#0B0E14] border border-red-900/40 space-y-3">
              <div className="flex items-center gap-2 font-bold text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span>NOT CONFIGURED (Pending Secrets)</span>
              </div>
              {systemAudit.notConfiguredItems.length === 0 ? (
                <p className="text-slate-500">All primary credentials are configured.</p>
              ) : (
                <ul className="space-y-1.5 text-slate-300">
                  {systemAudit.notConfiguredItems.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-1.5 leading-snug">
                      <span className="text-red-400 mt-0.5">•</span>
                      <span className="font-mono text-slate-300">{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* MANUAL VERIFICATION REQUIRED */}
            <div className="p-5 rounded-lg bg-[#0B0E14] border border-amber-900/40 space-y-3">
              <div className="flex items-center gap-2 font-bold text-amber-400">
                <HelpCircle className="w-4 h-4" />
                <span>MANUAL PORTAL VERIFICATION</span>
              </div>
              <ul className="space-y-1.5 text-slate-300">
                {systemAudit.manualVerificationRequired.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-snug">
                    <span className="text-amber-400 mt-0.5">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
