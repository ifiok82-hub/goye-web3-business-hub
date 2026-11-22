'use client';
import React, { useState, useEffect } from 'react';
import { Lock, CheckCircle2 } from 'lucide-react';
import { ProductData } from '../lib/products';
import { initPiSdk } from '../lib/piClient';

function onIncompletePayment(payment: any) {
  console.log('INCOMPLETE PAYMENT', payment?.identifier);
  if (!payment?.identifier) return;
  if (payment?.transaction?.txid) {
    return fetch('/api/pi/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentId: payment.identifier,
        txid: payment.transaction.txid,
      }),
    });
  }
  return fetch('/api/pi/cancel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentId: payment.identifier }),
  });
}

export default function ProductCardWithImage({
  product,
  serverUnlocked = false,
}: {
  product: ProductData;
  serverUnlocked?: boolean;
}) {
  const [purchased, setPurchased] = useState(serverUnlocked);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    if (serverUnlocked) {
      setPurchased(true);
      return;
    }
    if (typeof window === 'undefined') return;
    try {
      const saved = window.localStorage.getItem('purchased_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.includes(product.id)) {
          setPurchased(true);
        }
      }
    } catch {
      // Ignore restricted storage
    }
  }, [product.id, serverUnlocked]);

  async function handleBuy(targetProduct: ProductData) {
    if (loading || purchased) return;
    setLoading(true);
    setStatusMsg('Requesting Pi payments permission...');

    try {
      const ready = await initPiSdk();
      const Pi = typeof window !== 'undefined' ? (window as any).Pi : null;
      if (!ready || !Pi) {
        setLoading(false);
        setStatusMsg('Open in Pi Browser');
        return;
      }

      // STEP 1 — MUST SHOW ALLOW POPUP — DO NOT SKIP
      console.log('AUTH FOR PAYMENT START');
      const auth = await Pi.authenticate(['username', 'payments'], onIncompletePayment);
      console.log('AUTH FOR PAYMENT SUCCESS', JSON.stringify(auth));

      // STEP 2 — ONLY AFTER Allow, create payment
      console.log('BUY TAPPED', targetProduct.id, targetProduct.price);
      setStatusMsg('Opening Pi Wallet...');

      await Pi.createPayment(
        {
          amount: targetProduct.price,
          memo: targetProduct.name,
          metadata: { productId: targetProduct.id },
        },
        {
          onReadyForServerApproval: (paymentId: string) => {
            console.log('READY FOR APPROVAL', paymentId);
            setStatusMsg('Approving payment on server...');
            return fetch('/api/pi/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId }),
            }).then(async (r) => {
              console.log('APPROVE FETCH DONE', r.status);
              if (!r.ok) {
                const errText = await r.text().catch(() => '');
                setStatusMsg(`Approve failed: ${r.status}${errText ? ` ${errText}` : ''}`);
                setLoading(false);
                throw new Error('Approve failed ' + r.status);
              }
              setStatusMsg('Waiting for wallet confirmation...');
            });
          },
          onReadyForServerCompletion: (paymentId: string, txid: string) => {
            console.log('READY FOR COMPLETION', paymentId, txid);
            setStatusMsg('Completing payment...');
            return fetch('/api/pi/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid }),
            }).then(async (r) => {
              console.log('COMPLETE FETCH DONE', r.status);
              if (r.ok) {
                try {
                  const saved = window.localStorage.getItem('purchased_products');
                  const arr = saved ? JSON.parse(saved) : [];
                  if (Array.isArray(arr) && !arr.includes(targetProduct.id)) {
                    arr.push(targetProduct.id);
                    window.localStorage.setItem('purchased_products', JSON.stringify(arr));
                  }
                } catch {
                  // Ignore restricted storage
                }
                window.dispatchEvent(
                  new CustomEvent('goye:entitlements-updated', {
                    detail: { productId: targetProduct.id },
                  })
                );
                setPurchased(true);
                setStatusMsg(`Unlocked • TX: ${txid.slice(0, 12)}...`);
              } else {
                const errText = await r.text().catch(() => '');
                setStatusMsg(`Complete failed: ${r.status}${errText ? ` ${errText}` : ''}`);
              }
              setLoading(false);
            });
          },
          onCancel: (paymentId: string) => {
            console.log('CANCELLED', paymentId);
            setLoading(false);
            setStatusMsg('Payment cancelled.');
          },
          onError: (error: any) => {
            console.log('PAYMENT ERROR', JSON.stringify(error));
            setLoading(false);
            setStatusMsg('Payment error: ' + (error?.message || 'unknown'));
          },
        }
      );
    } catch (e: any) {
      console.log('BUY ERROR', e?.message || JSON.stringify(e));
      setLoading(false);
      setStatusMsg('Please tap Allow when Pi asks for payments permission, then tap Buy again.');
    }
  }

  return (
    <div className="bg-[#0E162B] border border-slate-700/70 rounded-2xl p-6 hover:border-[#D4AF37]/50 transition-all flex flex-col justify-between gap-5 shadow-xl text-left">
      <div className="space-y-4">
        <div className="aspect-video w-full overflow-hidden rounded-2xl bg-[#070C1A] border border-slate-800">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-white text-lg leading-snug">{product.name}</h3>
            <span className="shrink-0 px-2.5 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#F5D061] text-xs font-bold font-mono">
              {product.price} π
            </span>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed line-clamp-2">{product.desc}</p>
        </div>
      </div>

      {!purchased ? (
        <div className="space-y-2.5 pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Lock className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
            <span>Module locked — unlock instant digital access</span>
          </div>
          <button
            type="button"
            onClick={() => handleBuy(product)}
            disabled={loading}
            className="w-full bg-[#D4AF37] hover:bg-[#e5c14b] disabled:opacity-50 text-[#0A1128] py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>{loading ? 'Processing...' : `Buy with ${product.price} Pi`}</span>
          </button>
          {statusMsg && <p className="text-xs text-amber-300 text-center break-words">{statusMsg}</p>}
        </div>
      ) : (
        <div className="space-y-2 pt-3 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => setStatusMsg(`Full access active for ${product.name}`)}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-sm cursor-pointer transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Access Product Content</span>
          </button>
          {statusMsg && <p className="text-xs text-emerald-300 text-center break-words">{statusMsg}</p>}
        </div>
      )}
    </div>
  );
}
