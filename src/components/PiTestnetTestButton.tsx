import React, { useState } from 'react';
import { Coins, Loader2 } from 'lucide-react';

export const PiTestnetTestButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');

  const handleTestPayment = async () => {
    if (typeof window === 'undefined' || !window.Pi) {
      alert('Pi SDK not found. Please open this app inside the official Pi Browser.');
      return;
    }

    setLoading(true);
    setStatus('Initializing Pi SDK...');

    try {
      // 1. Initialize with sandbox: true for Testnet
      window.Pi.init({ version: '2.0', sandbox: true });

      setStatus('Authenticating Pioneer...');
      // 2. Authenticate with username and payments scopes
      const authResult = await window.Pi.authenticate(
        ['username', 'payments'],
        (incompletePayment) => {
          console.warn('Incomplete payment found:', incompletePayment);
        }
      );

      console.log('Authenticated Pioneer:', authResult);
      setStatus('Creating payment in Pi Wallet...');

      // 3. Create payment
      window.Pi.createPayment(
        {
          amount: 1,
          memo: 'sirwise testnet payment test',
          metadata: { purpose: 'sirwise_testnet_payment_test' },
        },
        {
          onReadyForServerApproval: async (paymentId: string) => {
            setStatus(`Approving payment ${paymentId} on server...`);
            try {
              const res = await fetch('/api/pi/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId }),
              });
              const data = await res.json();
              if (!res.ok || !data.success) {
                console.error('Server approval failed:', data);
              }
            } catch (err) {
              console.error('Server approval network error:', err);
            }
          },
          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            setStatus(`Completing payment ${paymentId} (txid: ${txid})...`);
            try {
              const res = await fetch('/api/pi/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId, txid }),
              });
              const data = await res.json();
              setLoading(false);
              setStatus('');
              if (res.ok && (data.success || data.verified)) {
                alert(`Payment successfully completed! Payment ID: ${paymentId}, TxID: ${txid}`);
              } else {
                alert(`Payment completion submitted. TxID: ${txid}`);
              }
            } catch (err) {
              setLoading(false);
              setStatus('');
              alert(`Payment completed with TxID: ${txid}`);
            }
          },
          onCancel: (paymentId: string) => {
            setLoading(false);
            setStatus('');
            alert(`Payment cancelled: ${paymentId}`);
          },
          onError: (error: Error, payment?: any) => {
            setLoading(false);
            setStatus('');
            alert(`Payment error: ${error?.message || 'Unknown error'}`);
          },
        }
      );
    } catch (err: any) {
      setLoading(false);
      setStatus('');
      alert(`Pi Testnet Payment Error: ${err?.message || err}`);
    }
  };

  return (
    <div className="p-4 rounded-xl bg-[#121620] border border-[#D4AF37]/30 space-y-3">
      <div className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
        Pi Testnet Direct Payment Test
      </div>
      <button
        onClick={handleTestPayment}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#D4AF37] hover:bg-[#e0bc46] text-[#0B0E14] font-bold text-sm rounded-xl transition-colors cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-[#0B0E14]" />
            <span>{status || 'Processing...'}</span>
          </>
        ) : (
          <>
            <Coins className="w-4 h-4 text-[#0B0E14]" />
            <span>Pay with Pi - Testnet Test</span>
          </>
        )}
      </button>
      {status && !loading && (
        <div className="text-[11px] text-slate-400 font-mono text-center">{status}</div>
      )}
    </div>
  );
};
