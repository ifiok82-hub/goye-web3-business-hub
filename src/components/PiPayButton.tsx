import React, { useState } from 'react';
import { detectPiBrowser } from '../lib/pi';
import { Coins, Loader2, Smartphone } from 'lucide-react';

export const PiPayButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handlePayment = async () => {
    if (!detectPiBrowser()) {
      alert('Please open this application inside the official Pi Browser to execute Testnet payments.');
      return;
    }

    setLoading(true);
    setStatus('Initializing Pi SDK...');

    try {
      if (window.Pi) {
        window.Pi.init({ version: '2.0', sandbox: true });
      }

      setStatus('Authenticating Pi user & wallet...');
      const auth = await window.Pi!.authenticate(['username', 'payments', 'wallet_address'], async (incompletePayment: any) => {
        console.log('Incomplete payment found:', incompletePayment);
        if (incompletePayment?.identifier && incompletePayment?.transaction?.txid) {
          try {
            await fetch('/api/pi/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentId: incompletePayment.identifier,
                txid: incompletePayment.transaction.txid,
              }),
            });
          } catch (e) {
            console.error('Failed to complete incomplete payment:', e);
          }
        }
      });

      console.log('Authenticated user:', auth?.user?.username, auth?.user?.uid);
      setStatus(`Authenticated as ${auth?.user?.username || 'Pioneer'}. Opening Pi Wallet...`);

      const paymentData = {
        amount: 1,
        memo: 'Goye Hub Test Payment',
        metadata: {
          user: auth?.user?.username || 'Pioneer',
          fromWallet: 'GBR4B47WY7JDK2JKUUQQTWWQENOUUYTAQAOYLXZ7XE36YFQY6LKPVO6R',
          toWallet: 'GDDTB2ND3AZU7BY36A7N5CHLO63XMXVSGNCMXOIDZI7FUP5GI3P7X24E',
          testnet: true
        },
      };

      const callbacks = {
        onReadyForServerApproval: async (paymentId: string) => {
          setStatus(`Approving payment ${paymentId} on server...`);
          try {
            const res = await fetch('/api/pi/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId }),
            });
            const data = await res.json();
            console.log('Approve result:', data);
            if (!res.ok || !data.success) {
              console.error('Server approval failed:', data);
            }
          } catch (err) {
            console.error('Server approval error:', err);
          }
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          setStatus(`Completing payment ${paymentId}...`);
          try {
            const res = await fetch('/api/pi/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid }),
            });
            const data = await res.json();
            setLoading(false);
            setStatus('');
            if (res.ok && (data.success || data.completed || data.verified)) {
              alert(`Payment successful! ID: ${paymentId}, TxID: ${txid}`);
            } else {
              alert(`Payment completed. TxID: ${txid}`);
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
          console.log('cancelled', paymentId);
          alert(`Payment cancelled: ${paymentId}`);
        },
        onError: (error: Error, payment?: any) => {
          setLoading(false);
          setStatus('');
          console.log(error, payment);
          alert(`Payment error: ${error?.message || 'Unknown error'}`);
        },
      };

      window.Pi!.createPayment(paymentData, callbacks);
    } catch (err: any) {
      setLoading(false);
      setStatus('');
      alert(`Pi Payment Error: ${err?.message || err}`);
    }
  };

  if (!detectPiBrowser()) {
    return (
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-2">
        <div className="flex items-center gap-2 font-bold">
          <Smartphone className="w-4 h-4 shrink-0" />
          <span>Pi Browser Required</span>
        </div>
        <p className="text-slate-300">
          To test Pi Testnet payments, please open <strong>https://goye-web3-business-hub.vercel.app</strong> inside the official Pi Browser app.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#e0bc46] text-[#0B0E14] font-bold text-sm shadow-lg transition-all cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-[#0B0E14]" />
            <span>{status || 'Processing...'}</span>
          </>
        ) : (
          <>
            <Coins className="w-4 h-4 text-[#0B0E14]" />
            <span>Pay 1 Pi Testnet (Authenticate First)</span>
          </>
        )}
      </button>
      {status && !loading && (
        <div className="text-[11px] font-mono text-slate-400 text-center">{status}</div>
      )}
    </div>
  );
};
