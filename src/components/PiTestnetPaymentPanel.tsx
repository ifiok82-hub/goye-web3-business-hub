/**
 * GOYE Web3 Business Hub - PI TESTNET PAYMENT TEST CARD
 *
 * Requirements:
 * - Real Pi Testnet payment flow using official Pi SDK
 * - Network: Pi Testnet
 * - Amount: 0.1 Test-Pi
 * - Description: "Real Testnet payment for GOYE Web3 Business Hub integration testing. Test-Pi has no monetary value."
 * - Prominent Button: [ 🟡 PAY 0.1 TEST-PI ]
 * - Real live status progression:
 *   NOT STARTED -> AUTHENTICATING -> PAYMENT CREATED -> WAITING FOR APPROVAL ->
 *   WAITING FOR USER CONFIRMATION -> TRANSACTION SUBMITTED -> COMPLETING PAYMENT ->
 *   TESTNET PAYMENT SUCCESSFUL
 * - Success Screen with real values verified by GOYE server + Pi Platform API
 * - Zero mocks, zero fake txids, zero fake balances, zero simulated success.
 */

import React, { useState, useEffect } from 'react';
import {
  detectPiEnvironment,
  executePiTestnetPayment,
  authenticatePi,
  RealPaymentEvidence,
  PiPaymentFlowStatus,
} from '../utils/piSdk';
import { usePiAuth } from '../context/PiAuthContext';
import {
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Smartphone,
  Key,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Lock,
} from 'lucide-react';
import { GoyeLogo } from './GoyeLogo';
import { PiTestnetTestButton } from './PiTestnetTestButton';
import { PiPayButton } from './PiPayButton';

export const PiTestnetPaymentPanel: React.FC = () => {
  const { user, isAuthenticated, setVerifiedSession } = usePiAuth();

  const [envStatus, setEnvStatus] = useState({ isPiBrowser: false, isSdkLoaded: false });
  const [serverStatus, setServerStatus] = useState<any | null>(null);
  const [loadingTelemetry, setLoadingTelemetry] = useState<boolean>(true);

  // Live Status Flow
  const [flowStatus, setFlowStatus] = useState<PiPaymentFlowStatus>('NOT STARTED');
  const [statusDetail, setStatusDetail] = useState<string>('Ready to initiate real Testnet payment.');
  const [inProgress, setInProgress] = useState<boolean>(false);

  // Real Captured Values (Never fake placeholders)
  const [capturedPaymentId, setCapturedPaymentId] = useState<string | null>(null);
  const [capturedTxid, setCapturedTxid] = useState<string | null>(null);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);

  // Verified Success Screen Data
  const [successEvidence, setSuccessEvidence] = useState<RealPaymentEvidence | null>(null);

  const fetchTelemetry = async () => {
    setLoadingTelemetry(true);
    setEnvStatus(detectPiEnvironment());
    try {
      const res = await fetch('/api/pi/status');
      if (res.ok) {
        const data = await res.json();
        setServerStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch status:', err);
    } finally {
      setLoadingTelemetry(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  // Handler: Manual Authentication with Pi
  const handleAuthenticate = async () => {
    setErrorFeedback(null);
    setFlowStatus('AUTHENTICATING');
    setStatusDetail('Authenticating Pioneer via official Pi SDK...');

    const res = await authenticatePi();
    if (res.success && res.user && res.accessToken) {
      setStatusDetail(`Authenticated as Pioneer @${res.user.username}.`);
      setFlowStatus('NOT STARTED');

      try {
        const vRes = await fetch('/api/pi/oauth-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: res.accessToken }),
        });
        if (vRes.ok) {
          const vData = await vRes.json();
          if (vData.success && vData.user) {
            setVerifiedSession(vData.sessionToken, vData.user, vData.expiresAt);
          }
        }
      } catch (_) {}
    } else {
      setFlowStatus('FAILED');
      setErrorFeedback(res.errorMessage || 'Pi authentication failed. Please try again.');
      setStatusDetail('Pi authentication failed.');
    }
  };

  // Handler: Primary Button [ 🟡 PAY 0.1 TEST-PI ]
  const handlePayTestnet = async () => {
    if (inProgress) return;
    setInProgress(true);
    setErrorFeedback(null);
    setSuccessEvidence(null);
    setCapturedPaymentId(null);
    setCapturedTxid(null);

    await executePiTestnetPayment({
      onStatusChange: (status: PiPaymentFlowStatus, detail?: string) => {
        setFlowStatus(status);
        if (detail) {
          setStatusDetail(detail);
        }
      },
      onPaymentCreated: (paymentId: string) => {
        setCapturedPaymentId(paymentId);
      },
      onTransactionReceived: (txid: string) => {
        setCapturedTxid(txid);
      },
      onSuccess: (evidence: RealPaymentEvidence) => {
        setInProgress(false);
        setSuccessEvidence(evidence);
        setFlowStatus('TESTNET PAYMENT SUCCESSFUL');
        setStatusDetail('TESTNET PAYMENT SUCCESSFUL');
      },
      onError: (errMsg: string) => {
        setInProgress(false);
        setErrorFeedback(errMsg);
        setStatusDetail(errMsg);
      },
    });
  };

  // Reset to initiate another test payment
  const handleReset = () => {
    setFlowStatus('NOT STARTED');
    setStatusDetail('Ready to initiate real Testnet payment.');
    setCapturedPaymentId(null);
    setCapturedTxid(null);
    setErrorFeedback(null);
    setSuccessEvidence(null);
  };

  const getStatusColor = (status: PiPaymentFlowStatus) => {
    switch (status) {
      case 'TESTNET PAYMENT SUCCESSFUL':
        return 'text-emerald-400 bg-emerald-950/70 border-emerald-700';
      case 'FAILED':
      case 'CANCELLED':
        return 'text-rose-400 bg-rose-950/70 border-rose-800';
      case 'NOT STARTED':
        return 'text-slate-400 bg-slate-900 border-white/10';
      default:
        return 'text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37]/40 animate-pulse';
    }
  };

  return (
    <div className="bg-[#121620] border-2 border-[#D4AF37]/40 rounded-2xl p-5 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* 1. Header Card Specification */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5 relative z-10">
        <div className="flex items-center gap-4">
          <GoyeLogo size="sm" showText={false} useImage={true} />
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-[11px] font-bold uppercase tracking-wider mb-1">
              <span>Official Pi SDK Integration</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              PI TESTNET PAYMENT TEST
            </h2>
          </div>
        </div>

        <button
          onClick={fetchTelemetry}
          disabled={loadingTelemetry}
          className="self-start sm:self-auto px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-[#0B0E14] border border-white/10 hover:border-white/20 rounded-lg transition-colors flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingTelemetry ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* 2. Parameters Card: Network, Amount, Description */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs relative z-10">
        <div className="p-3.5 rounded-xl bg-[#0B0E14] border border-white/5 space-y-1">
          <div className="text-slate-400 text-[11px] font-semibold uppercase">Network:</div>
          <div className="text-base font-extrabold text-[#D4AF37] font-mono">Pi Testnet</div>
          <div className="text-[10px] text-slate-500">Strictly isolated from Mainnet</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0B0E14] border border-white/5 space-y-1">
          <div className="text-slate-400 text-[11px] font-semibold uppercase">Amount:</div>
          <div className="text-base font-extrabold text-white font-mono">0.1 Test-Pi</div>
          <div className="text-[10px] text-amber-300/80">No monetary value</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0B0E14] border border-white/5 space-y-1">
          <div className="text-slate-400 text-[11px] font-semibold uppercase">SDK Mode:</div>
          <div className="text-base font-extrabold text-emerald-400 font-mono">sandbox: false</div>
          <div className="text-[10px] text-slate-500">Production architecture</div>
        </div>
      </div>

      {/* Description */}
      <div className="p-4 rounded-xl bg-[#0B0E14] border border-white/5 text-xs text-slate-300 leading-relaxed relative z-10">
        <p>
          "Real Testnet payment for GOYE Web3 Business Hub integration testing. Test-Pi has no monetary value."
        </p>
      </div>

      {/* Success Screen (Rendered upon genuine completion) */}
      {successEvidence ? (
        <div className="p-6 rounded-xl bg-[#0B0E14] border-2 border-emerald-500 shadow-xl space-y-4 text-xs relative z-10 animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <h3 className="text-base sm:text-lg font-black text-emerald-400">
                ✅ PI TESTNET PAYMENT SUCCESSFUL
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-950 border border-emerald-700 text-emerald-300">
              PAID
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-slate-400 block text-[11px]">Amount:</span>
              <span className="text-white font-bold text-sm font-mono">0.1 Test-Pi</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Network:</span>
              <span className="text-[#D4AF37] font-bold text-sm font-mono">TESTNET</span>
            </div>

            <div className="sm:col-span-2">
              <span className="text-slate-400 block text-[11px]">Payment ID:</span>
              <span className="font-mono text-slate-200 select-all break-all text-xs font-semibold">
                {successEvidence.paymentId}
              </span>
            </div>

            <div className="sm:col-span-2">
              <span className="text-slate-400 block text-[11px]">Transaction ID (TxID):</span>
              <span className="font-mono text-[#D4AF37] select-all break-all text-xs font-semibold">
                {successEvidence.txid}
              </span>
            </div>

            <div className="sm:col-span-2 pt-2 border-t border-white/5">
              <span className="text-slate-400 block text-[11px]">Verified by:</span>
              <span className="text-emerald-400 font-semibold text-xs">
                GOYE server + Pi Platform API
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90">
            <strong>Important:</strong> This is a Testnet transaction and has no monetary value.
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleReset}
              className="py-2.5 px-4 bg-[#D4AF37] hover:bg-[#e0bc46] text-[#0B0E14] font-bold text-xs rounded-lg transition-colors text-center"
            >
              Test Another Payment
            </button>
            <a
              href={`https://minepi.com/blockexplorer/`}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-semibold text-xs rounded-lg transition-colors text-center flex items-center justify-center gap-1.5"
            >
              <span>Verify on Pi Explorer</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      ) : (
        /* 3. Action Section: Buttons + Live Progression Status */
        <div className="space-y-5 relative z-10">
          {/* Main Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            {/* Primary Action Button: [ 🟡 PAY 0.1 TEST-PI ] */}
            <button
              onClick={handlePayTestnet}
              disabled={inProgress}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] hover:from-[#e0bc46] hover:to-[#f5e9bd] text-[#0B0E14] font-black text-sm sm:text-base rounded-xl transition-all shadow-xl hover:shadow-[#D4AF37]/30 flex items-center justify-center gap-3 active:scale-[0.99] disabled:opacity-50"
              aria-label="Pay 0.1 Test-Pi"
            >
              {inProgress ? (
                <Loader2 className="w-5 h-5 animate-spin text-[#0B0E14]" />
              ) : (
                <span className="w-5 h-5 rounded-full bg-[#0B0E14] text-[#D4AF37] flex items-center justify-center font-black text-xs">
                  🟡
                </span>
              )}
              <span className="tracking-wide">PAY 0.1 TEST-PI</span>
            </button>

            {/* Optional Step: Authenticate with Pi */}
            <button
              onClick={handleAuthenticate}
              disabled={inProgress}
              className="py-3 px-4 bg-[#0B0E14] hover:bg-[#181d29] text-white border border-white/10 hover:border-white/20 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Key className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>
                {isAuthenticated && user ? `Authenticated (@${user.username})` : 'Authenticate with Pi'}
              </span>
            </button>
          </div>

          {/* 4. Live Payment Status UI Area */}
          <div className="p-4 rounded-xl bg-[#0B0E14] border border-white/10 space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                Pi Testnet Payment Status:
              </span>
              <span
                className={`px-2.5 py-1 rounded text-xs font-black font-mono border ${getStatusColor(
                  flowStatus
                )}`}
              >
                {flowStatus}
              </span>
            </div>

            {/* Live Status Description */}
            <div className="text-slate-200 text-xs flex items-start gap-2 pt-1 font-sans">
              {inProgress && <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37] shrink-0 mt-0.5" />}
              <span>{statusDetail}</span>
            </div>

            {/* Error Message Display */}
            {errorFeedback && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorFeedback}</span>
              </div>
            )}

            {/* Real Values Display (Only populated when real values are received) */}
            <div className="pt-2 border-t border-white/5 space-y-1.5 text-[11px] font-mono">
              <div className="flex flex-col sm:flex-row sm:justify-between text-slate-400">
                <span>Payment ID:</span>
                <span className="text-slate-200 select-all font-semibold break-all">
                  {capturedPaymentId || '[Awaiting payment creation in Pi Wallet]'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between text-slate-400">
                <span>Transaction ID:</span>
                <span className="text-[#D4AF37] select-all font-semibold break-all">
                  {capturedTxid || '[Awaiting blockchain transaction signature]'}
                </span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Network:</span>
                <span className="text-slate-200 font-semibold">TESTNET</span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Amount:</span>
                <span className="text-slate-200 font-semibold">0.1 Test-Pi</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Direct Pi Testnet Test Button */}
      <div className="pt-2 space-y-3">
        <PiTestnetTestButton />
        <PiPayButton />
      </div>

      {/* Environment Context Warning */}
      {!envStatus.isPiBrowser && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300/90 flex items-start gap-2.5">
          <Smartphone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Pi Browser Required:</strong> To sign Testnet transactions with your Pi Testnet wallet, please open this link inside the official <strong>Pi Browser</strong>.
          </div>
        </div>
      )}

      {/* Terms and Privacy Policy Binding Notice */}
      <div className="pt-2 text-center text-[11px] text-slate-500 leading-normal">
        By initiating Testnet transactions, you acknowledge the{' '}
        <a href="/terms" className="text-[#D4AF37] hover:underline font-medium">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="/privacy" className="text-[#D4AF37] hover:underline font-medium">
          Privacy Policy
        </a>
        . Test-Pi has zero monetary value.
      </div>
    </div>
  );
};
