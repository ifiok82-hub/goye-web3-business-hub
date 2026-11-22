'use client';
import React, { useState } from 'react';
import { BadgeCheck, Terminal, Zap } from 'lucide-react';
import { authenticateForPayments } from '../lib/piClient';

export default function AdminPiTools() {
  const [logs, setLogs] = useState<string>('Ready for admin U2A diagnostic payment');
  const [loading, setLoading] = useState(false);

  const handleDiagnosticPayment = async () => {
    setLoading(true);
    setLogs('Authenticating Pi SDK (payments scope)...');
    try {
      const { userUid } = await authenticateForPayments(['payments']);

      setLogs('Creating authoritative server order for Module #3 (1 Pi)...');
      const orderRes = await fetch('/api/pi/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: 3, userUid }),
      });
      const orderData = await orderRes.json().catch(() => ({}));
      if (!orderRes.ok || !orderData?.orderId) {
        throw new Error(orderData?.error || 'Failed to create server order');
      }

      if (typeof window === 'undefined' || !window.Pi) {
        throw new Error('Pi SDK unavailable. Open in Pi Browser.');
      }

      setLogs(`Initiating U2A payment (${orderData.amount} Pi, Order ${orderData.orderId})...`);
      window.Pi.createPayment(
        {
          amount: orderData.amount,
          memo: orderData.memo,
          metadata: orderData.metadata,
        },
        {
          onReadyForServerApproval: async (paymentId: string) => {
            setLogs(`Retrieving & approving payment ${paymentId} via /api/pi/approve...`);
            const res = await fetch('/api/pi/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, orderId: orderData.orderId }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data?.success) {
              throw new Error(data?.error || 'Server approval failed');
            }
            setLogs(`Approved ${paymentId}: ${JSON.stringify(data)}`);
          },
          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            setLogs(`Verifying & completing ${paymentId} (TX: ${txid}) via /api/pi/complete...`);
            const res = await fetch('/api/pi/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid, orderId: orderData.orderId }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data?.fulfilled) {
              throw new Error(data?.error || 'Server completion failed');
            }
            setLogs(`U2A Payment Verified & Fulfilled! Payment ID: ${paymentId} | TX: ${txid}`);
            setLoading(false);
          },
          onCancel: async (paymentId: string) => {
            try {
              await fetch('/api/pi/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId }),
              });
            } catch {
              // Ignore cancel network errors
            }
            setLogs(`Payment cancelled by admin (${paymentId}).`);
            setLoading(false);
          },
          onError: (err: unknown, payment?: unknown) => {
            console.error('[PI ADMIN PAYMENT ERROR]', err, payment);
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
            <BadgeCheck className="w-4 h-4 text-yellow-400" />
            <span>Admin U2A Diagnostics</span>
          </div>
          <h3 className="text-white font-bold text-lg">
            U2A Payment Test (Admin Only)
          </h3>
          <p className="text-slate-400 text-sm mt-1 leading-relaxed">
            Exercises Pi.init, Pi.authenticate, server order creation, and Testnet Pi Platform validation/approval/completion via https://api.testnet.minepi.com.
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
          {loading ? 'Processing U2A Payment...' : 'Run Admin U2A Payment Test (1 Pi)'}
        </button>
      </div>

      <div className="text-xs text-slate-300 font-mono bg-black/70 p-3.5 rounded-xl border border-slate-800 break-all flex items-start gap-2">
        <Terminal className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
        <span>{logs}</span>
      </div>
    </div>
  );
}
