'use client';
import React, { useState } from 'react';
import { ShieldCheck, Terminal, Zap } from 'lucide-react';

const TESTNET_WALLET = 'GDDTB2ND3AZU7BY36A7N5CHLO63XMXVSGNCMXOIDZI7FUP5GI3P7X24E';

export default function AdminPiTools() {
  const [logs, setLogs] = useState<string>('Ready for Testnet diagnostic payment');
  const [loading, setLoading] = useState(false);

  const ensurePiSdk = async () => {
    if (typeof window === 'undefined') return null;
    if (!window.Pi) {
      const s = document.createElement('script');
      s.src = 'https://sdk.minepi.com/pi-sdk.js';
      s.async = true;
      await new Promise((res, rej) => {
        s.onload = res;
        s.onerror = rej;
        document.head.appendChild(s);
      });
    }
    return window.Pi;
  };

  const handleTestnetPayment = async () => {
    setLoading(true);
    setLogs('Initializing Pi SDK (Testnet sandbox auto)...');
    try {
      const Pi = await ensurePiSdk();
      if (!Pi) throw new Error('Pi SDK unavailable. Open in Pi Browser.');

      await Promise.resolve(Pi.init({ version: '2.0' }));
      await Pi.authenticate(['username', 'payments'], (incomplete: unknown) => {
        setLogs(`Incomplete payment found: ${JSON.stringify(incomplete)}`);
      });

      setLogs(`Creating Testnet payment (1 Pi) to ${TESTNET_WALLET}...`);
      Pi.createPayment(
        {
          amount: 1,
          memo: 'GOYE Admin Testnet Payment Test (1 Pi)',
          metadata: {
            adminTest: true,
            testnet: true,
            wallet: TESTNET_WALLET,
          },
        },
        {
          onReadyForServerApproval: async (paymentId: string) => {
            setLogs(`Approving payment ${paymentId} via /api/pi/approve...`);
            const res = await fetch('/api/pi/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId }),
            });
            const data = await res.json();
            if (!res.ok) {
              throw new Error(data?.error || 'Server approval failed');
            }
            setLogs(`Approved ${paymentId}: ${JSON.stringify(data)}`);
          },
          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            setLogs(`Completing payment ${paymentId} (TX: ${txid}) via /api/pi/complete...`);
            const res = await fetch('/api/pi/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid }),
            });
            const data = await res.json();
            if (!res.ok) {
              throw new Error(data?.error || 'Server completion failed');
            }
            setLogs(`Testnet Payment Complete! Payment ID: ${paymentId} | TX: ${txid}`);
            setLoading(false);
          },
          onCancel: () => {
            setLogs('Payment cancelled by admin.');
            setLoading(false);
          },
          onError: (err: unknown) => {
            const msg = err instanceof Error ? err.message : JSON.stringify(err);
            setLogs(`Payment Error: ${msg}`);
            setLoading(false);
          },
        }
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setLogs(`Error: ${msg}`);
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-purple-950/30 border border-purple-500/40 rounded-2xl space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300 mb-1">
            <ShieldCheck className="w-4 h-4 text-yellow-400" />
            Admin Sandbox Diagnostics
          </div>
          <h3 className="text-white font-bold text-lg">
            Testnet Payment Test (Admin Only)
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            Exercises Pi.init (sandbox auto), Pi.authenticate, and server approval/completion via https://api.testnet.minepi.com for Testnet wallet {TESTNET_WALLET.slice(0, 8)}...{TESTNET_WALLET.slice(-6)}.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleTestnetPayment}
          disabled={loading}
          className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black px-5 py-2.5 rounded-xl font-bold text-sm inline-flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Zap className="w-4 h-4" />
          {loading ? 'Processing Testnet Payment...' : 'Pay with Pi (Testnet) - Test'}
        </button>
      </div>

      <div className="text-xs text-slate-300 font-mono bg-black/70 p-3.5 rounded-xl border border-slate-800 break-all flex items-start gap-2">
        <Terminal className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
        <span>{logs}</span>
      </div>
    </div>
  );
}
