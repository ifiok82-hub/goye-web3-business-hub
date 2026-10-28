import React, { useState } from 'react';
import { Coins, Loader2 } from 'lucide-react';

// Testnet Payment Test Button (for Pi Portal 10/10 green check)
export function TestnetPaymentTest() {
  const [status, setStatus] = useState('');
  
  const testPayment = async () => {
    try {
      if (typeof window === 'undefined' || !window.Pi) {
        alert('Pi SDK not found. Please open in Pi Browser.');
        return;
      }

      setStatus('Initializing Pi SDK...');
      await window.Pi.init({ version: "2.0", sandbox: false });
      
      setStatus('Authenticating...');
      await window.Pi.authenticate(['username', 'payments'], () => {});
      
      setStatus('Creating 0.1 Pi Testnet payment...');
      window.Pi.createPayment({
        amount: 0.1,
        memo: "Goye Web3 Business Hub Testnet Payment Test - DO NOT USE REAL PI",
        metadata: { type: "testnet_test", test: true }
      }, {
        onReadyForServerApproval: async (paymentId: string) => {
          setStatus(`Approving ${paymentId}...`);
          const res = await fetch('/api/pi/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId })
          });
          const j = await res.json();
          setStatus(`Approval: ${JSON.stringify(j)}`);
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          setStatus(`Completing ${paymentId}...`);
          const res = await fetch('/api/pi/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, txid })
          });
          const j = await res.json();
          setStatus(`✅ TESTNET SUCCESS: ${JSON.stringify(j)} - 10/10 Green!`);
        },
        onCancel: (paymentId: string) => setStatus(`Cancelled ${paymentId}`),
        onError: (error: any) => setStatus(`Error: ${error}`)
      });
    } catch (e: any) {
      setStatus(`Failed: ${e.message}`);
    }
  };
  
  return (
    <div className="border border-yellow-500/50 rounded-xl p-4 bg-[#121620] space-y-2">
      <h3 className="font-bold text-white text-sm">Pi Testnet Payment Test (For 10/10 Check)</h3>
      <p className="text-xs text-slate-400">Amount: 0.1 Pi Test - Does not move real Pi</p>
      <button onClick={testPayment} className="mt-2 bg-[#4F2A93] hover:bg-[#5f33b3] text-white px-4 py-2 rounded-full font-semibold text-xs transition-colors cursor-pointer">
        🧪 Run Testnet Payment Test (0.1 Pi)
      </button>
      <div className="mt-2 text-xs font-mono text-slate-300 break-all">{status}</div>
    </div>
  );
}

// Real Payment Button (for actual customers)
export function RealPiPayment({ product }: { product: { id: string; title: string; price_pi: number } }) {
  const pay = async () => {
    if (typeof window === 'undefined' || !window.Pi) {
      alert('Pi SDK not found. Please open in Pi Browser.');
      return;
    }

    await window.Pi.init({ version: "2.0", sandbox: false });
    await window.Pi.authenticate(['username', 'payments'], () => {});
    window.Pi.createPayment({
      amount: product.price_pi,
      memo: `Goye WEB3 business hub: ${product.title}`,
      metadata: { productId: product.id, real: true }
    }, {
      onReadyForServerApproval: async (paymentId: string) => {
        await fetch('/api/pi/approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentId }) });
      },
      onReadyForServerCompletion: async (paymentId: string, txid: string) => {
        await fetch('/api/pi/complete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentId, txid }) });
        alert('Payment complete! Product delivered');
      },
      onCancel: () => alert('Cancelled'),
      onError: (e: any) => alert('Error: ' + e)
    });
  };
  return <button onClick={pay} className="w-full bg-[#FFC857] hover:bg-[#e0b04c] text-black py-3 rounded-full font-bold text-sm transition-colors cursor-pointer">Buy with Pi ({product.price_pi} π) - Real Payment</button>;
}
