import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Lock,
  Smartphone,
  ExternalLink,
  ArrowRight,
  Key,
} from 'lucide-react';
import {
  detectPiEnvironment,
  getPiSdkEnvironment,
  authenticatePi,
  executePiTestnetPayment,
  RealPaymentEvidence,
  PiPaymentFlowStatus,
} from '../utils/piSdk';
import { usePiAuth } from '../context/PiAuthContext';

export const PiSandboxTestView: React.FC = () => {
  const { user, isAuthenticated, setVerifiedSession } = usePiAuth();

  const [envDetection, setEnvDetection] = useState<any>({ isPiBrowser: false, isSdkLoaded: false });
  const [sdkConfig, setSdkConfig] = useState<any>(null);
  const [apiStatus, setApiStatus] = useState<any | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);

  // Payment Test State
  const [flowStatus, setFlowStatus] = useState<PiPaymentFlowStatus>('NOT STARTED');
  const [statusDetail, setStatusDetail] = useState<string>('Ready for Sandbox testing');
  const [inProgress, setInProgress] = useState<boolean>(false);
  const [capturedPaymentId, setCapturedPaymentId] = useState<string | null>(null);
  const [capturedTxid, setCapturedTxid] = useState<string | null>(null);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);
  const [successEvidence, setSuccessEvidence] = useState<RealPaymentEvidence | null>(null);

  const refreshProbe = async () => {
    setLoadingStatus(true);
    const env = detectPiEnvironment();
    const config = getPiSdkEnvironment();
    setEnvDetection(env);
    setSdkConfig(config);

    try {
      const res = await fetch('/api/pi/status');
      if (res.ok) {
        const data = await res.json();
        setApiStatus(data);
      }
    } catch (err) {
      console.error('[Pi Sandbox Test] Failed to probe status:', err);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    refreshProbe();
  }, []);

  // Compute readiness according to strict rules:
  const isDevOrSandboxEnv = sdkConfig?.environment === 'development' || sdkConfig?.sandbox === true;
  const isPiSdkDetected = Boolean(typeof window !== 'undefined' && window.Pi);
  const isTestnet = apiStatus?.network === 'TESTNET';
  const isSandboxMode = Boolean(sdkConfig?.sandbox);
  const hasBackendConfig = Boolean(apiStatus?.serverApiKeyConfigured || apiStatus?.piApiKeyConfigured);

  // Button enablement requirement:
  // The Test-Pi button must only be enabled when:
  // - development environment
  // - Testnet
  // - sandbox mode
  // - Pi SDK detected
  // - backend configuration exists
  const isPaymentButtonEnabled =
    isDevOrSandboxEnv && isTestnet && isSandboxMode && isPiSdkDetected && hasBackendConfig && !inProgress;

  // Handle Authentication in Sandbox mode
  const handleSignIn = async () => {
    setErrorFeedback(null);
    setFlowStatus('AUTHENTICATING');
    setStatusDetail('Initiating official Pi.authenticate() with sandbox: true...');

    const res = await authenticatePi(undefined, { forceSandbox: true });
    if (res.success && res.user && res.accessToken) {
      setStatusDetail(`Authenticated as @${res.user.username}`);
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
      setErrorFeedback(res.errorMessage || 'Sandbox authentication failed. Make sure you are inside Pi Browser.');
      setStatusDetail('Authentication failed');
    }
  };

  // Handle Test Payment
  const handleTestPayment = async () => {
    if (!isPaymentButtonEnabled) return;
    setInProgress(true);
    setErrorFeedback(null);
    setSuccessEvidence(null);
    setCapturedPaymentId(null);
    setCapturedTxid(null);

    await executePiTestnetPayment({
      forceSandbox: true,
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
        setStatusDetail('Payment verified on Testnet blockchain');
      },
      onError: (errMsg: string) => {
        setInProgress(false);
        setErrorFeedback(errMsg);
        setStatusDetail(errMsg);
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 space-y-2">
        <div className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
          GOYE Web3 Business Hub
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Pi Sandbox Test
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Authorized developer testbed verifying Pi SDK sandbox initialization, two-phase payment approval, and blockchain completion on Testnet.
        </p>
      </div>

      {/* Diagnostics Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* Environment */}
        <div className="p-4 rounded-xl bg-[#121620] border border-white/10 space-y-1">
          <div className="text-slate-400 font-medium">Environment:</div>
          <div className="text-sm font-bold text-white font-mono">
            {isDevOrSandboxEnv ? 'DEVELOPMENT / SANDBOX' : 'PRODUCTION (LIVE)'}
          </div>
          <div className="text-[11px] text-slate-500">
            Target URL: {isDevOrSandboxEnv ? 'http://localhost:3000' : 'https://goye-web3-business-hub.vercel.app'}
          </div>
        </div>

        {/* Pi SDK */}
        <div className="p-4 rounded-xl bg-[#121620] border border-white/10 space-y-1">
          <div className="text-slate-400 font-medium">Pi SDK:</div>
          <div className={`text-sm font-bold font-mono ${isPiSdkDetected ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isPiSdkDetected ? 'CONNECTED' : 'NOT DETECTED'}
          </div>
          <div className="text-[11px] text-slate-500">
            {envDetection.isPiBrowser ? 'Inside Pi Browser' : 'Open in Pi Browser to inject'}
          </div>
        </div>

        {/* Pi SDK Version */}
        <div className="p-4 rounded-xl bg-[#121620] border border-white/10 space-y-1">
          <div className="text-slate-400 font-medium">Pi SDK Version:</div>
          <div className="text-sm font-bold text-white font-mono">
            {isPiSdkDetected ? '2.0 (Official SDK)' : 'v2.0 Configured'}
          </div>
          <div className="text-[11px] text-slate-500">
            sandbox: {isSandboxMode ? 'true' : 'false'}
          </div>
        </div>

        {/* Authentication */}
        <div className="p-4 rounded-xl bg-[#121620] border border-white/10 space-y-1">
          <div className="text-slate-400 font-medium">Authentication:</div>
          <div className={`text-sm font-bold font-mono ${isAuthenticated ? 'text-emerald-400' : isPiSdkDetected ? 'text-cyan-400' : 'text-slate-400'}`}>
            {isAuthenticated ? 'AUTHENTICATED' : isPiSdkDetected ? 'READY' : 'NOT READY'}
          </div>
          <div className="text-[11px] text-slate-500 truncate">
            {user ? `@${user.username}` : 'Pi account unlinked'}
          </div>
        </div>
      </div>

      {/* Payment Backend Readiness Status */}
      <div className="p-4 rounded-xl bg-[#121620] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div>
          <div className="font-semibold text-white">Payment Backend:</div>
          <div className="text-slate-400">
            Approval route: <code className="text-[#D4AF37]">/api/pi/approve</code> · Completion route: <code className="text-[#D4AF37]">/api/pi/complete</code>
          </div>
        </div>
        <div className="font-mono font-bold text-xs">
          {hasBackendConfig ? (
            <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              READY
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              CONFIGURATION REQUIRED
            </span>
          )}
        </div>
      </div>

      {/* Interactive Testing Box */}
      <div className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Sandbox Actions</h2>
            <p className="text-xs text-slate-400">
              Trigger real Pi SDK authentication and 0.1 Test-Pi payment validation without mock transactions.
            </p>
          </div>
          <button
            onClick={refreshProbe}
            disabled={loadingStatus}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors cursor-pointer w-fit"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingStatus ? 'animate-spin' : ''}`} />
            <span>Refresh State</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {/* Button: Sign in with Pi */}
          <button
            onClick={handleSignIn}
            disabled={!isPiSdkDetected || inProgress}
            className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-lg transition-colors border border-white/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Smartphone className="w-4 h-4 text-[#D4AF37]" />
            <span>{isAuthenticated ? 'Re-Authenticate with Pi' : 'Sign in with Pi'}</span>
          </button>

          {/* Button: Test 0.1 Test-Pi Payment */}
          <button
            onClick={handleTestPayment}
            disabled={!isPaymentButtonEnabled}
            className={`flex-1 py-3 px-4 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
              isPaymentButtonEnabled
                ? 'bg-[#D4AF37] hover:bg-[#e0bc46] text-[#0B0E14] cursor-pointer shadow-lg'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
            }`}
          >
            {inProgress ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            <span>Test 0.1 Test-Pi Payment</span>
          </button>
        </div>

        {/* Explanatory text for why button might be disabled */}
        {!isPaymentButtonEnabled && !inProgress && (
          <div className="text-[11px] text-slate-500 bg-slate-900/60 p-3 rounded-lg border border-white/5 space-y-1">
            <div className="font-semibold text-slate-400">Requirements for Payment Execution:</div>
            <ul className="list-disc pl-4 space-y-0.5">
              <li className={isDevOrSandboxEnv ? 'text-emerald-400' : 'text-amber-400'}>
                Environment: {isDevOrSandboxEnv ? 'Development / Sandbox mode active' : 'Production environment (Use Sandbox URL or dev port 3000)'}
              </li>
              <li className={isTestnet ? 'text-emerald-400' : 'text-amber-400'}>
                Network: {isTestnet ? 'Pi Testnet' : 'Mainnet is disabled'}
              </li>
              <li className={isPiSdkDetected ? 'text-emerald-400' : 'text-amber-400'}>
                Pi SDK: {isPiSdkDetected ? 'Detected' : 'Open within Pi Browser at develop.pi'}
              </li>
              <li className={hasBackendConfig ? 'text-emerald-400' : 'text-amber-400'}>
                Backend: {hasBackendConfig ? 'PI_API_KEY verified' : 'Server PI_API_KEY required'}
              </li>
            </ul>
          </div>
        )}

        {/* Live Status Flow Card */}
        {flowStatus !== 'NOT STARTED' && (
          <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Execution Status:</span>
              <span className="font-mono text-[#D4AF37] font-bold">{flowStatus}</span>
            </div>
            <div className="text-slate-400">{statusDetail}</div>

            {capturedPaymentId && (
              <div className="text-[11px] font-mono text-slate-400 pt-1">
                Payment Identifier: <span className="text-white">{capturedPaymentId}</span>
              </div>
            )}
            {capturedTxid && (
              <div className="text-[11px] font-mono text-slate-400">
                Blockchain TxID: <span className="text-emerald-400">{capturedTxid}</span>
              </div>
            )}
            {errorFeedback && (
              <div className="text-rose-400 text-xs pt-1 flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorFeedback}</span>
              </div>
            )}
          </div>
        )}

        {/* Success Evidence Card */}
        {successEvidence && (
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-2 text-xs">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>TESTNET PAYMENT SUCCESSFUL</span>
            </div>
            <p className="text-slate-300">
              Payment verified and completed server-to-server with official Pi Platform API.
            </p>
            <div className="font-mono text-[11px] text-slate-400 space-y-1 pt-1">
              <div>Network: <span className="text-white">{successEvidence.network}</span></div>
              <div>Amount: <span className="text-white">{successEvidence.amount} Test-Pi</span></div>
              <div>Payment ID: <span className="text-white">{successEvidence.paymentId}</span></div>
              <div>Blockchain TxID: <span className="text-emerald-400">{successEvidence.txid}</span></div>
              <div>Approval: <span className="text-emerald-400">{successEvidence.developerApproval}</span></div>
              <div>Completion: <span className="text-emerald-400">{successEvidence.developerCompletion}</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Mandatory Safety Notice */}
      <div className="p-4 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-400 space-y-1">
        <div className="font-bold text-slate-200">Strict Anti-Simulation Notice:</div>
        <p>
          GOYE Web3 Business Hub does not create fake payments, counterfeit transactions, or artificial txid values. Every payment step connects directly to the official Pi Platform API endpoints.
        </p>
      </div>
    </div>
  );
};
