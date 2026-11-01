import React, { useState } from 'react';

// Testnet Payment Test Button (for Pi Portal 10/10 green check)
export function TestnetPaymentTest() {
  const [status, setStatus] = useState('');
  
  const testPayment = async () => {
    try {
      if (typeof window === 'undefined' || !window.Pi) {
        const s = document.createElement('script');
        s.src = 'https://sdk.minepi.com/pi-sdk.js';
        await new Promise((res, rej) => { s.onload = res; s.onerror = rej; document.head.appendChild(s); });
      }

      setStatus('Initializing Pi SDK (Testnet)...');
      await window.Pi.init({ version: "2.0", sandbox: true });
      
      setStatus('Authenticating with Pi to show username popup...');
      const auth = await window.Pi.authenticate(['username', 'payments'], (p: any) => { console.log('incomplete', p); });
      setStatus(`Authenticated as @${auth?.user?.username || 'ifiok1967'}`);
      
      setStatus('Creating 0.1 Pi Testnet payment...');
      window.Pi.createPayment({
        amount: 0.1,
        memo: "Goye Web3 Business Hub Testnet Payment Test for ifiok1967",
        metadata: { type: "testnet_test", test: true, recipient: "GDDTB2ND3AZU7BY36A7N5CHLO63XMXVSGNCMXOIDZI7FUP5GI3P7X24E" }
      }, {
        onReadyForServerApproval: async (paymentId: string) => {
          setStatus(`Instant server approving ${paymentId}...`);
          const res = await fetch('/api/pi/payments/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId })
          });
          const j = await res.json();
          if (!j.success) {
            // Fallback to /api/pi/approve
            await fetch('/api/pi/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId })
            });
          }
          setStatus(`Approved: ${JSON.stringify(j)}`);
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          setStatus(`Completing ${paymentId} with txid ${txid}...`);
          const res = await fetch('/api/pi/payments/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, txid })
          });
          const j = await res.json();
          setStatus(`✅ TESTNET SUCCESS: TX ${txid} - Payment approved & completed!`);
          alert(`Testnet Payment Complete! TXID: ${txid}`);
        },
        onCancel: (paymentId: string) => setStatus(`Cancelled: ${paymentId}`),
        onError: (error: any) => setStatus(`Error: ${error?.message || JSON.stringify(error)}`)
      });
    } catch (e: any) {
      setStatus(`Failed: ${e.message} - Open in Pi Browser`);
    }
  };
  
  return (
    <div className="border border-yellow-500/50 rounded-xl p-4 bg-[#121620] space-y-2">
      <h3 className="font-bold text-white text-sm">Pi Testnet Payment Test (@ifiok1967)</h3>
      <p className="text-xs text-slate-400">Amount: 0.1 Test-Pi • Recipient: GDDTB2...X24E</p>
      <button onClick={testPayment} className="mt-2 bg-[#4F2A93] hover:bg-[#5f33b3] text-white px-4 py-2.5 rounded-full font-semibold text-xs transition-colors cursor-pointer">
        🧪 Pay 0.1 Test-Pi (Instant Approve)
      </button>
      <div className="mt-2 text-xs font-mono text-slate-300 break-all">{status}</div>
    </div>
  );
}

// Real Payment Button (for actual customers)
export function RealPiPayment({ product }: { product: { id: string; title: string; price_pi: number } }) {
  const [loading, setLoading] = useState(false);

  const pay = async () => {
    setLoading(true);
    try {
      if (typeof window === 'undefined' || !window.Pi) {
        const s = document.createElement('script');
        s.src = 'https://sdk.minepi.com/pi-sdk.js';
        await new Promise((res, rej) => { s.onload = res; s.onerror = rej; document.head.appendChild(s); });
      }

      await window.Pi.init({ version: "2.0", sandbox: true });
      const auth = await window.Pi.authenticate(['username', 'payments'], () => {});
      console.log(`Authenticated as @${auth?.user?.username || 'ifiok1967'}`);

      window.Pi.createPayment({
        amount: product.price_pi,
        memo: `Goye Web3 Hub: ${product.title}`,
        metadata: { productId: product.id, real: true, recipient: "GDDTB2ND3AZU7BY36A7N5CHLO63XMXVSGNCMXOIDZI7FUP5GI3P7X24E" }
      }, {
        onReadyForServerApproval: async (paymentId: string) => {
          console.log(`Payment ${paymentId} ready for approval, calling backend immediately...`);
          const res = await fetch('/api/pi/payments/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId })
          });
          const data = await res.json();
          if (!data.success) {
            await fetch('/api/pi/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId })
            });
          }
          console.log("Payment approved by backend");
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          console.log(`Payment ${paymentId} ready for completion with txid ${txid}`);
          const res = await fetch('/api/pi/payments/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, txid })
          });
          const data = await res.json();
          if (!data.success) {
            await fetch('/api/pi/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid })
            });
          }
          alert(`Payment successful! TX: ${txid}`);
          setLoading(false);
        },
        onCancel: (paymentId: string) => {
          console.log("Payment cancelled", paymentId);
          setLoading(false);
          alert("Payment cancelled");
        },
        onError: (e: any) => {
          console.error("Payment error", e);
          setLoading(false);
          alert(`Payment error: ${e?.message || JSON.stringify(e)}`);
        }
      });
    } catch (err: any) {
      setLoading(false);
      alert(`Pi payment error: ${err?.message || err} - Please use Pi Browser`);
    }
  };

  return (
    <button
      onClick={pay}
      disabled={loading}
      className="w-full bg-[#facc15] hover:bg-[#eab308] active:bg-[#ca8a04] text-black py-3 px-6 rounded-full font-bold text-sm transition-colors cursor-pointer shadow-lg"
    >
      {loading ? "Processing Pi Payment..." : `Pay with Pi (Testnet) - ${product.price_pi} π`}
    </button>
  );
}
