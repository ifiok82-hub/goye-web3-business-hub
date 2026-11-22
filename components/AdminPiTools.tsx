'use client';
import React, { useState } from 'react';
import { BadgeCheck, Terminal, Zap } from 'lucide-react';
import { authenticateForPayments, initPiSdk } from '../lib/piClient';

export default function AdminPiTools() {
  const [logs, setLogs] = useState<string[]>(['Ready for admin 0.01 Pi Testnet diagnostic payment']);
  const [loading, setLoading] = useState(false);

  const appendLog = (line: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${line}`]);
  };

  const handleDiagnosticPayment = async () => {
    setLoading(true);
    setLogs([]);
    console.log('BUY TAPPED', 'admin-test-0.01', 0.01);
    appendLog('BUY TAPPED admin-test-0.01 0.01');

    try {
      const Pi = typeof window !== 'undefined' ? (window as any).Pi : null;
      if (!Pi) {
        const ready = await initPiSdk();
        if (!ready || !(window as any).Pi) {
          throw new Error('Pi SDK unavailable. Open /admin inside Pi Browser.');
        }
        await authenticateForPayments(['username', 'payments']);
      } else {
        await initPiSdk();
      }

      const activePi = (window as any).Pi;
      console.log('CREATE PAYMENT', 0.01);
      appendLog('CREATE PAYMENT 0.01');

      await activePi.createPayment(
        {
          amount: 0.01,
          memo: 'GOYE Admin Testnet Payment 0.01 Pi',
          metadata: { productId: 'admin-test-0.01' },
        },
        {
          onReadyForServerApproval: (paymentId: string) => {
            console.log('READY FOR APPROVAL', paymentId);
            appendLog(`READY FOR APPROVAL ${paymentId}`);
            return fetch('/api/pi/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId }),
            }).then(async (r) => {
              console.log('APPROVE FETCH DONE', r.status);
              const data = await r.text().catch(() => '');
              appendLog(`APPROVE FETCH DONE ${r.status}: ${data}`);
              if (!r.ok) {
                setLoading(false);
                throw new Error('Approve failed ' + r.status);
              }
            });
          },
          onReadyForServerCompletion: (paymentId: string, txid: string) => {
            console.log('READY FOR COMPLETION', paymentId, txid);
            appendLog(`READY FOR COMPLETION ${paymentId} ${txid}`);
            return fetch('/api/pi/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid }),
            }).then(async (r) => {
              console.log('COMPLETE FETCH DONE', r.status);
              const data = await r.text().catch(() => '');
              appendLog(`COMPLETE FETCH DONE ${r.status}: ${data}`);
              if (r.ok) {
                appendLog(`SUCCESS! Payment ID: ${paymentId} | TX: ${txid}`);
              } else {
                appendLog(`Complete failed: ${r.status}`);
              }
              setLoading(false);
            });
          },
          onCancel: (id: string) => {
            console.log('CANCELLED', id);
            appendLog(`CANCELLED ${id}`);
            setLoading(false);
          },
          onError: (error: any) => {
            console.log('PAYMENT ERROR', JSON.stringify(error));
            appendLog(`PAYMENT ERROR ${error?.message || JSON.stringify(error)}`);
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
    <div className="p-6 bg-purple-950/30 border border-purple-500/40 rounded-2xl space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300 mb-1">
            <BadgeCheck className="w-4 h-4 text-yellow-400" />
            <span>Admin Testnet Diagnostics</span>
          </div>
          <h3 className="text-white font-bold text-lg">
            Testnet Payment Debug Console (Admin Only)
          </h3>
          <p className="text-slate-400 text-sm mt-1 leading-relaxed">
            Runs Pi.createPayment for 0.01 Pi via /api/pi/approve and /api/pi/complete returning Promise callbacks (Testnet only).
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleDiagnosticPayment}
          disabled={loading}
          className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black px-5 py-2.5 rounded-xl font-bold text-sm inline-flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Zap className="w-4 h-4" />
          {loading ? 'Processing 0.01 Pi Test...' : 'Test Testnet Payment 0.01 Pi'}
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
  );
}
