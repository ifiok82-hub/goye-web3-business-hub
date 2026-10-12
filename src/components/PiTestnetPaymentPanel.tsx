/**
 * GOYE Web3 Business Hub - Pi Testnet Payment Test Panel
 * Real End-to-End Payment Validation (Zero-Simulation Architecture)
 *
 * Rules:
 * - Network: TESTNET
 * - Sandbox: FALSE
 * - Test Amount: 0.1 Test-Pi
 * - Official Pi SDK: Pi.authenticate(['username', 'payments'], onIncompletePaymentFound) -> Pi.createPayment(...)
 * - Two-phase server approval and completion
 * - Never populates fake placeholders. Evidence appears ONLY upon a genuine transaction.
 */

import React, { useState, useEffect } from 'react';
import {
  detectPiEnvironment,
  executePiTestnetPayment,
  authenticatePi,
  resolveIncompletePaymentServer,
  RealPaymentEvidence,
  PiPaymentFlowStatus,
} from '../utils/piSdk';
import { usePiAuth } from '../context/PiAuthContext';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Smartphone,
  Key,
  ArrowRight,
  Loader2,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';

export const PiTestnetPaymentPanel: React.FC = () => {
  const { user, isAuthenticated, setVerifiedSession } = usePiAuth();

  const [envStatus, setEnvStatus] = useState({ isPiBrowser: false, isSdkLoaded: false });
  const [serverStatus, setServerStatus] = useState<any | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);

  // Payment Execution State
  const [flowStatus, setFlowStatus] = useState<PiPaymentFlowStatus>('IDLE');
  const [statusMessage, setStatusMessage] = useState<string>('Ready for Pi Testnet payment validation.');
  const [inProgress, setInProgress] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Incomplete Payment tracking
  const [incompletePayment, setIncompletePayment] = useState<any | null>(null);
  const [resolvingIncomplete, setResolvingIncomplete] = useState<boolean>(false);

  // Real Transaction Evidence (NEVER fake placeholders)
  const [transactionEvidence, setTransactionEvidence] = useState<RealPaymentEvidence | null>(null);

  const fetchTelemetry = async () => {
    setLoadingStatus(true);
    setEnvStatus(detectPiEnvironment());
    try {
      const res = await fetch('/api/pi/status');
      if (res.ok) {
        const data = await res.json();
        setServerStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch Pi telemetry:', err);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  // Handler: Authenticate with Pi SDK
  const handleAuthenticate = async () => {
    setAuthError(null);
    setPaymentError(null);
    setFlowStatus('IDLE');
    setStatusMessage('Authenticating Pioneer via official Pi SDK...');

    const res = await authenticatePi((incomplete) => {
      setIncompletePayment(incomplete);
    });

    if (res.success && res.user && res.accessToken) {
      setStatusMessage(`Authenticated as @${res.user.username}.`);
      if (res.incompletePayment) {
        setIncompletePayment(res.incompletePayment);
      }
      // Authoritatively verify with backend
      try {
        const verifyRes = await fetch('/api/pi/oauth-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: res.accessToken }),
        });
        if (verifyRes.ok) {
          const vData = await verifyRes.json();
          if (vData.success && vData.user) {
            setVerifiedSession(vData.sessionToken, vData.user, vData.expiresAt);
          }
        }
      } catch (_) {}
    } else {
      setAuthError(res.errorMessage || 'Pi authentication failed.');
      setStatusMessage('Pi authentication failed.');
    }
  };

  // Handler: Execute genuine Testnet payment
  const handlePayTestPi = async () => {
    if (inProgress) return;
    setInProgress(true);
    setPaymentError(null);
    setAuthError(null);
    setTransactionEvidence(null);

    await executePiTestnetPayment({
      onStatusChange: (status: PiPaymentFlowStatus, details?: string) => {
        setFlowStatus(status);
        if (details) {
          setStatusMessage(details);
        }
      },
      onSuccess: (evidence: RealPaymentEvidence) => {
        setInProgress(false);
        setTransactionEvidence(evidence);
        setStatusMessage('Payment officially verified. Order marked PAID.');
      },
      onError: (errorMessage: string) => {
        setInProgress(false);
        setPaymentError(errorMessage);
        setStatusMessage(errorMessage);
      },
      onIncompleteFound: (incomplete: any) => {
        setIncompletePayment(incomplete);
      },
    });
  };

  // Handler: Reconcile incomplete payment
  const handleResolveIncomplete = async () => {
    if (!incompletePayment) return;
    setResolvingIncomplete(true);
    try {
      const result = await resolveIncompletePaymentServer(incompletePayment);
      if (result.resolved) {
        setIncompletePayment(null);
        setStatusMessage('Incomplete payment successfully resolved.');
        fetchTelemetry();
      } else {
        setStatusMessage(result.message || 'Incomplete payment retrieved from Pi Platform API.');
      }
    } catch (err) {
      setStatusMessage('Error resolving incomplete payment.');
    } finally {
      setResolvingIncomplete(false);
    }
  };

  // Readiness Calculation
  const isServerConfigured = serverStatus?.serverApiKeyStatus === 'CONFIGURED';
  const isReady = envStatus.isPiBrowser && isServerConfigured;

  return (
    <div className="bg-[#121620] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-8 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/5 rounded-full blur-3xl -z-0 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            End-to-End Real Payment Validation
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            GOYE Web3 Business Hub — Pi Testnet Payment Test
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Official Pi Developer Platform User-to-App payment testing. Zero mocks, zero simulations.
          </p>
        </div>

        <button
          onClick={fetchTelemetry}
          disabled={loadingStatus}
          className="self-start md:self-auto px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-[#0B0E14] border border-white/10 rounded-lg transition-colors flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingStatus ? 'animate-spin' : ''}`} />
          <span>Refresh Payment Status</span>
        </button>
      </div>

      {/* Required Specifications Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs relative z-10">
        {/* Network */}
        <div className="p-3 rounded-xl bg-[#0B0E14] border border-white/5 space-y-1">
          <div className="text-slate-400 text-[11px]">Network:</div>
          <div className="text-sm font-bold text-[#D4AF37] font-mono">TESTNET</div>
          <div className="text-[10px] text-slate-500">Separated from Mainnet</div>
        </div>

        {/* Sandbox */}
        <div className="p-3 rounded-xl bg-[#0B0E14] border border-white/5 space-y-1">
          <div className="text-slate-400 text-[11px]">Sandbox:</div>
          <div className="text-sm font-bold text-emerald-400 font-mono">FALSE</div>
          <div className="text-[10px] text-slate-500">Standard production SDK</div>
        </div>

        {/* Test Amount */}
        <div className="p-3 rounded-xl bg-[#0B0E14] border border-white/5 space-y-1">
          <div className="text-slate-400 text-[11px]">Test Amount:</div>
          <div className="text-sm font-bold text-white font-mono">0.1 Test-Pi</div>
          <div className="text-[10px] text-slate-500">No monetary value</div>
        </div>

        {/* Status */}
        <div className="p-3 rounded-xl bg-[#0B0E14] border border-white/5 space-y-1">
          <div className="text-slate-400 text-[11px]">Status:</div>
          <div>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                isReady
                  ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800'
                  : 'text-amber-400 bg-amber-950/60 border border-amber-800'
              }`}
            >
              {isReady ? 'READY' : 'NOT READY'}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 truncate">
            {!envStatus.isPiBrowser
              ? 'Requires Pi Browser'
              : !isServerConfigured
              ? 'Requires Server API Key'
              : 'SDK & Server Active'}
          </div>
        </div>
      </div>

      {/* Mandatory Non-Monetary Testnet Notice */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Mandatory Notice:</strong> Testnet payment — Test-Pi has no monetary value.
          This payment executes on the official Pi Testnet blockchain and does not represent real-money trade or Mainnet assets.
        </div>
      </div>

      {/* Incomplete Payment Alert (if detected) */}
      {incompletePayment && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="font-semibold flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              Incomplete Payment Detected by Pi SDK
            </div>
            <div className="text-[11px] text-amber-200/80 font-mono">
              Payment ID: {incompletePayment.identifier}
            </div>
          </div>
          <button
            onClick={handleResolveIncomplete}
            disabled={resolvingIncomplete}
            className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs rounded-md transition-colors shrink-0"
          >
            {resolvingIncomplete ? 'Resolving...' : 'Reconcile on Server'}
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Button 1: Authenticate */}
        <button
          onClick={handleAuthenticate}
          disabled={inProgress}
          className="flex-1 py-3 px-4 bg-[#0B0E14] hover:bg-[#181d29] text-white border border-white/10 hover:border-white/20 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Key className="w-4 h-4 text-[#D4AF37]" />
          <span>
            {isAuthenticated && user ? `Authenticated (@${user.username})` : 'Authenticate with Pi'}
          </span>
        </button>

        {/* Button 2: Pay 0.1 Test-Pi */}
        <button
          onClick={handlePayTestPi}
          disabled={inProgress}
          className="flex-1 py-3 px-4 bg-[#D4AF37] hover:bg-[#e0bc46] disabled:opacity-50 text-[#0B0E14] font-bold text-xs rounded-xl transition-all shadow-md hover:shadow-[#D4AF37]/20 flex items-center justify-center gap-2"
        >
          {inProgress ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#0B0E14]" />
          ) : (
            <div className="w-4 h-4 rounded-full bg-[#0B0E14] text-[#D4AF37] flex items-center justify-center font-bold text-[10px]">
              π
            </div>
          )}
          <span>Pay 0.1 Test-Pi</span>
        </button>
      </div>

      {/* Live Status Progress & Truthful Diagnoses */}
      <div className="p-4 rounded-xl bg-[#0B0E14] border border-white/5 space-y-2 text-xs font-mono">
        <div className="flex items-center justify-between text-slate-400 border-b border-white/5 pb-2">
          <span>PI PAYMENT FLOW STATUS:</span>
          <span
            className={`font-bold ${
              flowStatus === 'PAID' || flowStatus === 'COMPLETED'
                ? 'text-emerald-400'
                : flowStatus === 'FAILED' || flowStatus === 'CANCELLED'
                ? 'text-rose-400'
                : flowStatus === 'IDLE'
                ? 'text-slate-400'
                : 'text-amber-400'
            }`}
          >
            {flowStatus}
          </span>
        </div>
        <div className="text-slate-300 font-sans text-xs pt-1 flex items-start gap-2">
          {inProgress && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4AF37] shrink-0 mt-0.5" />}
          <span>{statusMessage}</span>
        </div>

        {/* Error Details */}
        {(paymentError || authError) && (
          <div className="pt-2 border-t border-white/5 text-rose-400 font-sans text-xs">
            {paymentError || authError}
          </div>
        )}
      </div>

      {/* Real Transaction Evidence Ledger (NEVER fake placeholders) */}
      {transactionEvidence ? (
        <div className="p-6 rounded-xl bg-[#0B0E14] border border-emerald-500/40 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-bold text-white">Genuine Testnet Payment Evidence</span>
            </div>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-950/80 border border-emerald-700 text-emerald-400">
              STATUS: {transactionEvidence.finalPaymentStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-slate-400 block text-[11px]">Payment ID:</span>
              <span className="font-mono text-slate-200 select-all break-all font-semibold">
                {transactionEvidence.paymentId}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Transaction ID (TxID):</span>
              <span className="font-mono text-[#D4AF37] select-all break-all font-semibold">
                {transactionEvidence.txid}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Network:</span>
              <span className="font-mono text-slate-200 font-semibold">{transactionEvidence.network}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Amount:</span>
              <span className="font-mono text-slate-200 font-semibold">{transactionEvidence.amount} Test-Pi</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center">
            <div className="p-2 rounded bg-white/5">
              <span className="text-[10px] text-slate-400 block">Developer Approval</span>
              <span className="font-bold text-emerald-400">{transactionEvidence.developerApproval}</span>
            </div>
            <div className="p-2 rounded bg-white/5">
              <span className="text-[10px] text-slate-400 block">Transaction Verification</span>
              <span className="font-bold text-emerald-400">{transactionEvidence.transactionVerification}</span>
            </div>
            <div className="p-2 rounded bg-white/5">
              <span className="text-[10px] text-slate-400 block">Developer Completion</span>
              <span className="font-bold text-emerald-400">{transactionEvidence.developerCompletion}</span>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-white/5">
            <span>Verified with official Pi Platform API (/v2/payments/{transactionEvidence.paymentId}).</span>
            <a
              href={`https://minepi.com/blockexplorer/`}
              target="_blank"
              rel="noreferrer"
              className="text-[#D4AF37] hover:underline flex items-center gap-1 shrink-0 ml-2"
            >
              <span>Pi Block Explorer</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      ) : (
        /* Empty State / Integrity Guarantee Note */
        <div className="p-4 rounded-xl bg-[#0B0E14] border border-white/5 text-[11px] text-slate-500 space-y-1">
          <div className="text-slate-400 font-medium">Payment Evidence Integrity Guarantee:</div>
          <div>
            Transaction ID, Payment ID, Developer Approval, and Completion verification status will appear here exclusively upon completion of a genuine Pi Testnet transaction signed by a Pioneer in the official Pi Browser.
          </div>
        </div>
      )}
    </div>
  );
};
