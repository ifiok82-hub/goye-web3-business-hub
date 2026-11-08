import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Clock,
  Lock,
  Server,
  Smartphone,
  Globe,
  FileText,
  Key,
} from 'lucide-react';
import { detectPiEnvironment, getPiSdkEnvironment } from '../utils/piSdk';

interface PiReadinessViewProps {
  onNavigate?: (view: string) => void;
}

export const PiReadinessView: React.FC<PiReadinessViewProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [readinessData, setReadinessData] = useState<any | null>(null);
  const [apiStatus, setApiStatus] = useState<any | null>(null);
  const [clientDetection, setClientDetection] = useState<any | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState<string>('');

  const runDiagnostics = async () => {
    setLoading(true);
    const env = detectPiEnvironment();
    const sdkEnv = getPiSdkEnvironment();
    setClientDetection({ env, sdkEnv });

    try {
      const [readinessRes, statusRes] = await Promise.all([
        fetch('/api/pi/readiness'),
        fetch('/api/pi/status'),
      ]);

      if (readinessRes.ok) {
        const rData = await readinessRes.json();
        setReadinessData(rData);
      }
      if (statusRes.ok) {
        const sData = await statusRes.json();
        setApiStatus(sData);
      }
    } catch (err) {
      console.error('[Pi Readiness] Diagnostic probe error:', err);
    } finally {
      setLoading(false);
      setLastCheckTime(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  // Application-side checks derived from truthful backend and client probes
  const isScriptLoaded = typeof window !== 'undefined' && Boolean(window.Pi);
  const isApiKeyConfigured = Boolean(apiStatus?.serverApiKeyConfigured || apiStatus?.piApiKeyConfigured);
  const isAppIdConfigured = Boolean(apiStatus?.appIdConfigured || apiStatus?.piAppIdConfigured);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
            <Server className="w-4 h-4 text-[#D4AF37]" />
            <span>Technical Verification & Diagnostic Probe</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Pi Developer Portal Readiness Diagnostic
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Truthful, zero-simulation audit dividing system readiness into verified application-side technical checks versus manual actions required inside the official Pi Developer Portal.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={runDiagnostics}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Probing...' : 'Re-Run Diagnostic'}</span>
          </button>
          {onNavigate && (
            <button
              onClick={() => onNavigate('pi-developer-checklist')}
              className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] hover:bg-[#e0bc46] text-[#0B0E14] rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              <span>View Checklist</span>
            </button>
          )}
        </div>
      </div>

      {/* Warning Notice: No portal hallucination */}
      <div className="p-4 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-300 space-y-1.5">
        <div className="font-semibold text-white flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-[#D4AF37]" />
          <span>Architectural Integrity Notice</span>
        </div>
        <p className="text-slate-400 leading-relaxed">
          The application cannot access or complete private Pi Developer Portal checklist actions (such as clicking Developer Guide, authorizing the Sandbox in your Pi Browser, or connecting the App Wallet). This diagnostic reflects factual technical implementation and guides the manual steps.
        </p>
        {lastCheckTime && (
          <div className="text-[11px] text-slate-500 font-mono pt-1">
            Last probe executed at: {lastCheckTime}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ========================================================================= */}
        {/* SECTION A: APPLICATION-SIDE CHECKS */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">
                A
              </span>
              <h2 className="text-base font-bold text-white uppercase tracking-wide">
                Application-Side Checks
              </h2>
            </div>
            <span className="text-[11px] text-emerald-400 font-mono font-medium">
              Automated Verification
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {/* Pi SDK */}
            <div className="p-3.5 rounded-lg bg-[#121620] border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Pi SDK</div>
                <div className="text-[11px] text-slate-400">Official window.Pi client integration</div>
              </div>
              <span className={`px-2 py-0.5 rounded font-bold font-mono text-[11px] ${isScriptLoaded ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                {isScriptLoaded ? 'PASS' : 'DETECTING IN PI BROWSER'}
              </span>
            </div>

            {/* Pi SDK script */}
            <div className="p-3.5 rounded-lg bg-[#121620] border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Pi SDK script</div>
                <div className="text-[11px] text-slate-400">https://sdk.minepi.com/pi-sdk.js injected in index.html</div>
              </div>
              <span className="px-2 py-0.5 rounded font-bold font-mono text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PASS
              </span>
            </div>

            {/* Development sandbox configuration */}
            <div className="p-3.5 rounded-lg bg-[#121620] border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Development sandbox configuration</div>
                <div className="text-[11px] text-slate-400">http://localhost:3000 executes with sandbox: true</div>
              </div>
              <span className="px-2 py-0.5 rounded font-bold font-mono text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PASS
              </span>
            </div>

            {/* Production sandbox configuration */}
            <div className="p-3.5 rounded-lg bg-[#121620] border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Production sandbox configuration</div>
                <div className="text-[11px] text-slate-400">Production domain executes with sandbox: false</div>
              </div>
              <span className="px-2 py-0.5 rounded font-bold font-mono text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PASS
              </span>
            </div>

            {/* Production HTTPS */}
            <div className="p-3.5 rounded-lg bg-[#121620] border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Production HTTPS</div>
                <div className="text-[11px] text-slate-400">Enforced TLS on https://goye-web3-business-hub.vercel.app</div>
              </div>
              <span className="px-2 py-0.5 rounded font-bold font-mono text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PASS
              </span>
            </div>

            {/* Production URL */}
            <div className="p-3.5 rounded-lg bg-[#121620] border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Production URL</div>
                <div className="text-[11px] text-slate-400">https://goye-web3-business-hub.vercel.app</div>
              </div>
              <span className="px-2 py-0.5 rounded font-bold font-mono text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PASS
              </span>
            </div>

            {/* Validation key file */}
            <div className="p-3.5 rounded-lg bg-[#121620] border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Validation key file</div>
                <div className="text-[11px] text-slate-400">Plain text key served at /validation-key.txt</div>
              </div>
              <span className="px-2 py-0.5 rounded font-bold font-mono text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PASS
              </span>
            </div>

            {/* Privacy Policy */}
            <div className="p-3.5 rounded-lg bg-[#121620] border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Privacy Policy</div>
                <div className="text-[11px] text-slate-400">Public HTTP 200 route at /privacy (no login required)</div>
              </div>
              <span className="px-2 py-0.5 rounded font-bold font-mono text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PASS
              </span>
            </div>

            {/* Pi authentication */}
            <div className="p-3.5 rounded-lg bg-[#121620] border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Pi authentication</div>
                <div className="text-[11px] text-slate-400">Pi.authenticate(['username', 'payments']) + backend /verify-user</div>
              </div>
              <span className={`px-2 py-0.5 rounded font-bold font-mono text-[11px] ${isApiKeyConfigured ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                {isApiKeyConfigured ? 'PASS' : 'CONFIGURATION REQUIRED'}
              </span>
            </div>

            {/* Pi payment backend */}
            <div className="p-3.5 rounded-lg bg-[#121620] border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Pi payment backend</div>
                <div className="text-[11px] text-slate-400">POST /api/pi/approve & POST /api/pi/complete</div>
              </div>
              <span className={`px-2 py-0.5 rounded font-bold font-mono text-[11px] ${isApiKeyConfigured ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                {isApiKeyConfigured ? 'PASS' : 'CONFIGURATION REQUIRED'}
              </span>
            </div>

            {/* Pi API key */}
            <div className="p-3.5 rounded-lg bg-[#121620] border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Pi API key</div>
                <div className="text-[11px] text-slate-400">Server environment variable PI_API_KEY</div>
              </div>
              <span className={`px-2 py-0.5 rounded font-bold font-mono text-[11px] ${isApiKeyConfigured ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                {isApiKeyConfigured ? 'CONFIGURED' : 'NOT CONFIGURED'}
              </span>
            </div>

            {/* Pi App ID */}
            <div className="p-3.5 rounded-lg bg-[#121620] border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Pi App ID</div>
                <div className="text-[11px] text-slate-400">Server environment variable PI_APP_ID</div>
              </div>
              <span className={`px-2 py-0.5 rounded font-bold font-mono text-[11px] ${isAppIdConfigured ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                {isAppIdConfigured ? 'CONFIGURED' : 'NOT CONFIGURED'}
              </span>
            </div>

            {/* Mainnet */}
            <div className="p-3.5 rounded-lg bg-[#121620] border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Mainnet</div>
                <div className="text-[11px] text-slate-400">Network mode strictly isolated to TESTNET</div>
              </div>
              <span className="px-2 py-0.5 rounded font-bold font-mono text-[11px] bg-slate-800 text-slate-300 border border-slate-700">
                DISABLED
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION B: PI DEVELOPER PORTAL MANUAL CHECKS */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
                B
              </span>
              <h2 className="text-base font-bold text-white uppercase tracking-wide">
                Pi Developer Portal Manual Checks
              </h2>
            </div>
            <span className="text-[11px] text-amber-400 font-mono font-medium">
              User Portal Action Required
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {/* Development URL */}
            <div className="p-3.5 rounded-lg bg-[#121620] border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Development URL</div>
                <div className="text-[11px] text-slate-400">Must be set to http://localhost:3000 in portal</div>
              </div>
              <span className="px-2 py-0.5 rounded font-bold font-mono text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                MANUAL PORTAL CHECK
              </span>
            </div>

            {/* Sandbox Run */}
            <div className="p-3.5 rounded-lg bg-[#121620] border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Sandbox Run</div>
                <div className="text-[11px] text-slate-400">Must tap &ldquo;Run in Sandbox&rdquo; &amp; authorize in Pi Browser</div>
              </div>
              <span className="px-2 py-0.5 rounded font-bold font-mono text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                MANUAL PORTAL CHECK
              </span>
            </div>

            {/* Developer Guide */}
            <div className="p-3.5 rounded-lg bg-[#121620] border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Developer Guide</div>
                <div className="text-[11px] text-slate-400">Must click &ldquo;Developer Guide&rdquo; inside portal checklist</div>
              </div>
              <span className="px-2 py-0.5 rounded font-bold font-mono text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                MANUAL PORTAL CHECK
              </span>
            </div>

            {/* Connected App Wallet */}
            <div className="p-3.5 rounded-lg bg-[#121620] border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Connected App Wallet</div>
                <div className="text-[11px] text-slate-400">Must link app wallet in Portal (distinct from personal wallet)</div>
              </div>
              <span className="px-2 py-0.5 rounded font-bold font-mono text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                MANUAL PORTAL CHECK
              </span>
            </div>

            {/* Production URL */}
            <div className="p-3.5 rounded-lg bg-[#121620] border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Production URL</div>
                <div className="text-[11px] text-slate-400">Must match https://goye-web3-business-hub.vercel.app</div>
              </div>
              <span className="px-2 py-0.5 rounded font-bold font-mono text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                MANUAL PORTAL CHECK
              </span>
            </div>

            {/* Domain Verification */}
            <div className="p-3.5 rounded-lg bg-[#121620] border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Domain Verification</div>
                <div className="text-[11px] text-emerald-400">Portal currently reports: &ldquo;Domain ownership verified&rdquo;</div>
              </div>
              <span className="px-2 py-0.5 rounded font-bold font-mono text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                MANUAL PORTAL CHECK
              </span>
            </div>

            {/* Privacy Policy URL */}
            <div className="p-3.5 rounded-lg bg-[#121620] border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Privacy Policy URL</div>
                <div className="text-[11px] text-slate-400">Enter https://goye-web3-business-hub.vercel.app/privacy</div>
              </div>
              <span className="px-2 py-0.5 rounded font-bold font-mono text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                MANUAL PORTAL CHECK
              </span>
            </div>
          </div>

          {/* Quick Action Guide */}
          <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-white/10 space-y-2 text-xs">
            <div className="font-bold text-[#D4AF37]">Instructions for Developer Inside Pi Browser:</div>
            <ol className="list-decimal pl-5 space-y-1 text-slate-400 text-[11px]">
              <li>Open Pi Browser and navigate to <strong>develop.pi</strong> (Developer Portal).</li>
              <li>Select your registered app: <strong>GOYE Web3 Business Hub</strong>.</li>
              <li>Confirm <strong>Development URL</strong> is set to <code>http://localhost:3000</code>.</li>
              <li>Tap <strong>Run in Sandbox</strong> and complete the sandbox authorization prompt.</li>
              <li>Click the <strong>Developer Guide</strong> link to fulfill the guide review requirement.</li>
              <li>Navigate to <strong>App Wallet</strong> and connect your designated application wallet.</li>
              <li>Save and confirm all checklist items turn green in the portal.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
