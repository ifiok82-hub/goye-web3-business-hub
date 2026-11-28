'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { BadgeCheck, RefreshCw, ShieldCheck, Terminal, Zap } from 'lucide-react';
import {
  handleIncompletePayment,
  hasPiSdk,
  initPiSdk,
  isPiSandboxClient,
} from '../lib/piClient';

interface DiagnosticsState {
  checkedAt: string;
  windowPiLoaded: boolean;
  clientSandbox: boolean;
  serverSandbox: boolean | null;
  network: string;
  piApiKeyStatus: 'CONFIGURED' | 'NOT CONFIGURED' | 'UNKNOWN';
  approveRouteOk: boolean;
  completeRouteOk: boolean;
  authRouteStatus: string;
}

export default function AdminPiTools() {
  const [logs, setLogs] = useState<string[]>([
    'Ready for Pi Integration Diagnostics & 0.01 Pi Testnet payment test',
  ]);
  const [loading, setLoading] = useState(false);
  const [diagLoading, setDiagLoading] = useState(false);
  const [diag, setDiag] = useState<DiagnosticsState | null>(null);

  const appendLog = (line: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${line}`]);
  };

  const runDiagnostics = useCallback(async () => {
    setDiagLoading(true);
    try {
      const sdkReady = await initPiSdk();
      const [statusRes, approveRes, completeRes, authRes] = await Promise.all([
        fetch('/api/pi/status', { cache: 'no-store', credentials: 'include' }).catch(() => null),
        fetch('/api/pi/approve', { method: 'GET', cache: 'no-store', credentials: 'include' }).catch(() => null),
        fetch('/api/pi/complete', { method: 'GET', cache: 'no-store', credentials: 'include' }).catch(() => null),
        fetch('/api/auth/pi', { method: 'GET', cache: 'no-store', credentials: 'include' }).catch(() => null),
      ]);

      const statusData = statusRes?.ok ? await statusRes.json().catch(() => null) : null;
      const authData = authRes?.ok ? await authRes.json().catch(() => null) : null;

      setDiag({
        checkedAt: new Date().toLocaleTimeString(),
        windowPiLoaded: sdkReady && hasPiSdk(),
        clientSandbox: isPiSandboxClient(),
        serverSandbox:
          typeof statusData?.sandbox === 'boolean' ? statusData.sandbox : null,
        network: typeof statusData?.network === 'string' ? statusData.network : 'unknown',
        piApiKeyStatus:
          statusData?.piApiKeyStatus === 'CONFIGURED'
            ? 'CONFIGURED'
            : statusData?.piApiKeyStatus === 'NOT CONFIGURED'
              ? 'NOT CONFIGURED'
              : 'UNKNOWN',
        approveRouteOk: Boolean(approveRes?.ok),
        completeRouteOk: Boolean(completeRes?.ok),
        authRouteStatus: authData?.authenticated
          ? `AUTHENTICATED (@${authData?.user?.username || 'unknown'})`
          : authRes?.ok
            ? 'READY (Not signed in)'
            : 'ERROR',
      });
    } finally {
      setDiagLoading(false);
    }
  }, []);

  useEffect(() => {
    runDiagnostics();
  }, [runDiagnostics]);

  const handleDiagnosticPayment = async () => {
    setLoading(true);
    setLogs([]);

    const ready = await initPiSdk();
    const Pi = typeof window !== 'undefined' ? window.Pi : null;
    if (!ready || !Pi) {
      appendLog('ERROR: window.Pi unavailable. Open /admin inside Pi Browser.');
      setLoading(false);
      return;
    }

    // STEP 1 — Authenticate with username + payments scope & verify via /api/auth/pi
    try {
      appendLog('STEP 1: Calling Pi.authenticate(["username", "payments"])...');
      const auth = await Pi.authenticate(['username', 'payments'], handleIncompletePayment);
      const authRes = await fetch('/api/auth/pi', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: auth?.accessToken,
          user: auth?.user ? { uid: auth.user.uid, username: auth.user.username } : undefined,
        }),
      });
      const authData = await authRes.json().catch(() => ({}));
      if (!authRes.ok || !authData?.authenticated) {
        appendLog(`AUTH VERIFY FAILED (${authRes.status}): ${authData?.error || 'unknown'}`);
        setLoading(false);
        return;
      }
      appendLog(`AUTH VERIFIED: @${authData.user.username} (${authData.user.uid})`);
    } catch (authErr: unknown) {
      const msg = authErr instanceof Error ? authErr.message : String(authErr);
      appendLog(`AUTH ERROR: ${msg}`);
      setLoading(false);
      return;
    }

    // STEP 2 — Create 0.01 Pi payment and verify server approval & completion
    try {
      appendLog('STEP 2: Calling Pi.createPayment(0.01 Pi)...');

      await Pi.createPayment(
        {
          amount: 0.01,
          memo: 'GOYE Admin Diagnostic 0.01 Pi',
          metadata: { productId: 'admin-test-0.01' },
        },
        {
          onReadyForServerApproval: (paymentId: string) => {
            const approvePromise = fetch('/api/pi/approve', {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId }),
            }).then(async (r) => {
              const data = await r.json().catch(() => ({}));
              appendLog(`APPROVE RESPONSE ${r.status}: ${JSON.stringify(data)}`);
              if (!r.ok || !data?.approved) {
                setLoading(false);
                throw new Error(data?.error || `Approve failed (${r.status})`);
              }
            });
            appendLog(`READY FOR APPROVAL: ${paymentId}`);
            return approvePromise;
          },
          onReadyForServerCompletion: (paymentId: string, txid: string) => {
            const completePromise = fetch('/api/pi/complete', {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid }),
            }).then(async (r) => {
              const data = await r.json().catch(() => ({}));
              appendLog(`COMPLETE RESPONSE ${r.status}: ${JSON.stringify(data)}`);
              if (r.ok && data?.completed === true && data?.fulfilled === true && data?.status === 'PAID') {
                appendLog(
                  `PAID CONFIRMED • Receipt: ${data?.receipt?.receiptId || 'N/A'} | TX: ${data.txid}`
                );
              } else {
                appendLog(`COMPLETE FAILED (${r.status}): ${data?.error || 'Unverified'}`);
              }
              setLoading(false);
            });
            appendLog(`READY FOR COMPLETION: ${paymentId} | TX: ${txid}`);
            return completePromise;
          },
          onCancel: (id: string) => {
            appendLog(`PAYMENT CANCELLED: ${id}`);
            setLoading(false);
            return fetch('/api/pi/cancel', {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId: id }),
            }).catch(() => undefined);
          },
          onError: (error: unknown) => {
            const msg = error instanceof Error ? error.message : JSON.stringify(error);
            appendLog(`PAYMENT ERROR: ${msg}`);
            setLoading(false);
          },
        }
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      appendLog(`BUY ERROR: ${msg}`);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Factual Pi Diagnostics Matrix (Zero Secrets Exposed) */}
      <div className="p-6 bg-[#121620] border border-slate-800 rounded-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Pi Integration Diagnostics</span>
            </div>
            <h2 className="text-white font-bold text-lg">Live Environment & Route Checks</h2>
          </div>
          <button
            type="button"
            onClick={runDiagnostics}
            disabled={diagLoading}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs font-semibold text-slate-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${diagLoading ? 'animate-spin' : ''}`} />
            <span>{diagLoading ? 'Checking...' : 'Refresh Diagnostics'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-black/50 border border-slate-800 space-y-1">
            <div className="text-slate-400">window.Pi SDK Loaded</div>
            <div className={`font-mono font-bold ${diag?.windowPiLoaded ? 'text-emerald-400' : 'text-amber-300'}`}>
              {diag ? (diag.windowPiLoaded ? 'LOADED' : 'NOT LOADED (Open in Pi Browser)') : 'Checking...'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-black/50 border border-slate-800 space-y-1">
            <div className="text-slate-400">PI_SANDBOX State</div>
            <div className="font-mono font-bold text-slate-100">
              {diag
                ? `Client=${String(diag.clientSandbox)} | Server=${String(diag.serverSandbox)} (${diag.network})`
                : 'Checking...'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-black/50 border border-slate-800 space-y-1">
            <div className="text-slate-400">PI_API_KEY Status</div>
            <div
              className={`font-mono font-bold ${
                diag?.piApiKeyStatus === 'CONFIGURED' ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {diag ? diag.piApiKeyStatus : 'Checking...'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-black/50 border border-slate-800 space-y-1">
            <div className="text-slate-400">/api/pi/approve Route</div>
            <div className={`font-mono font-bold ${diag?.approveRouteOk ? 'text-emerald-400' : 'text-red-400'}`}>
              {diag ? (diag.approveRouteOk ? 'AVAILABLE (200 OK)' : 'UNAVAILABLE') : 'Checking...'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-black/50 border border-slate-800 space-y-1">
            <div className="text-slate-400">/api/pi/complete Route</div>
            <div className={`font-mono font-bold ${diag?.completeRouteOk ? 'text-emerald-400' : 'text-red-400'}`}>
              {diag ? (diag.completeRouteOk ? 'AVAILABLE (200 OK)' : 'UNAVAILABLE') : 'Checking...'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-black/50 border border-slate-800 space-y-1">
            <div className="text-slate-400">/api/auth/pi Session</div>
            <div className="font-mono font-bold text-slate-100 truncate">
              {diag ? diag.authRouteStatus : 'Checking...'}
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostic Testnet Payment Runner */}
      <div className="p-6 bg-purple-950/30 border border-purple-500/40 rounded-2xl space-y-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300 mb-1">
            <BadgeCheck className="w-4 h-4 text-yellow-400" />
            <span>Admin Payment Verification</span>
          </div>
          <h3 className="text-white font-bold text-lg">
            End-to-End Pi Payment Test Console (Admin Only)
          </h3>
          <p className="text-slate-400 text-sm mt-1 leading-relaxed">
            Runs Pi.authenticate([&quot;username&quot;, &quot;payments&quot;]), server /api/auth/pi verification, and a 0.01 Pi payment through /api/pi/approve and /api/pi/complete.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleDiagnosticPayment}
            disabled={loading}
            className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black px-5 py-2.5 rounded-xl font-bold text-sm inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            {loading ? 'Processing 0.01 Pi Test...' : 'Test Payment 0.01 Pi'}
          </button>
        </div>

        <div className="text-xs text-slate-300 font-mono bg-black/70 p-3.5 rounded-xl border border-slate-800 break-all space-y-1">
          <div className="flex items-center gap-2 text-purple-400 mb-1">
            <Terminal className="w-4 h-4 shrink-0" />
            <span>Debug Output</span>
          </div>
          {logs.map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
