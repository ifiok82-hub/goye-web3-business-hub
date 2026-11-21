'use client';
import React, { useState, useEffect } from 'react';
import {
  Lock,
  CheckCircle2,
  Fingerprint,
  Bot,
  Store,
  PackageCheck,
  GraduationCap,
  FileCheck2,
  Handshake,
  Receipt,
  Scale,
  Building2,
  Globe,
  ShoppingBag,
  Cpu,
  KeyRound,
  Code2,
} from 'lucide-react';
import { ProductData, ProductIconName } from '../lib/products';
import { authenticateForPayments } from '../lib/piClient';

function renderProductIcon(iconName: ProductIconName) {
  const cls = 'w-11 h-11 text-[#F5D061]';
  switch (iconName) {
    case 'fingerprint':
      return <Fingerprint className={cls} />;
    case 'bot':
      return <Bot className={cls} />;
    case 'store':
      return <Store className={cls} />;
    case 'package':
      return <PackageCheck className={cls} />;
    case 'graduation':
      return <GraduationCap className={cls} />;
    case 'compliance':
      return <FileCheck2 className={cls} />;
    case 'handshake':
      return <Handshake className={cls} />;
    case 'receipt':
      return <Receipt className={cls} />;
    case 'scale':
      return <Scale className={cls} />;
    case 'building':
      return <Building2 className={cls} />;
    case 'globe':
      return <Globe className={cls} />;
    case 'shopping':
      return <ShoppingBag className={cls} />;
    case 'cpu':
      return <Cpu className={cls} />;
    case 'key':
      return <KeyRound className={cls} />;
    case 'code':
      return <Code2 className={cls} />;
  }
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

  const handleUnlock = async () => {
    if (loading || purchased) return;
    setLoading(true);
    setStatusMsg(null);

    try {
      const { userUid } = await authenticateForPayments(['payments']);

      // Create server-owned order so amount, memo, and productId are authoritative on server
      const orderRes = await fetch('/api/pi/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, userUid }),
      });

      const orderData = await orderRes.json().catch(() => ({}));
      if (!orderRes.ok || !orderData?.orderId) {
        throw new Error(orderData?.error || 'Could not initialize server order.');
      }

      if (typeof window === 'undefined' || !window.Pi) {
        throw new Error('Pi SDK unavailable.');
      }

      window.Pi.createPayment(
        {
          amount: orderData.amount,
          memo: orderData.memo,
          metadata: orderData.metadata,
        },
        {
          onReadyForServerApproval: async (paymentId: string) => {
            setStatusMsg('Approving payment on server...');
            const approveRes = await fetch('/api/pi/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, orderId: orderData.orderId }),
            });
            const approveData = await approveRes.json().catch(() => ({}));
            if (!approveRes.ok || !approveData?.success) {
              throw new Error(approveData?.error || 'Server approval rejected.');
            }
            setStatusMsg('Waiting for wallet confirmation...');
          },
          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            setStatusMsg('Verifying transaction & granting access...');
            const completeRes = await fetch('/api/pi/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid, orderId: orderData.orderId }),
            });
            const completeData = await completeRes.json().catch(() => ({}));
            if (!completeRes.ok || !completeData?.fulfilled) {
              setLoading(false);
              setStatusMsg(completeData?.error || 'Server completion failed.');
              return;
            }
            try {
              const saved = window.localStorage.getItem('purchased_products');
              const arr = saved ? JSON.parse(saved) : [];
              if (Array.isArray(arr) && !arr.includes(product.id)) {
                arr.push(product.id);
                window.localStorage.setItem('purchased_products', JSON.stringify(arr));
              }
            } catch {
              // Ignore restricted storage
            }
            window.dispatchEvent(
              new CustomEvent('goye:entitlements-updated', {
                detail: { productId: product.id },
              })
            );
            setPurchased(true);
            setStatusMsg(`Unlocked • TX: ${txid.slice(0, 12)}...`);
            setLoading(false);
          },
          onCancel: () => {
            setLoading(false);
            setStatusMsg('Payment cancelled.');
          },
          onError: (e: unknown) => {
            const msg = e instanceof Error ? e.message : String(e);
            setLoading(false);
            setStatusMsg(msg);
          },
        }
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setLoading(false);
      setStatusMsg(msg);
    }
  };

  return (
    <div className="bg-[#0E162B] border border-slate-700/70 rounded-2xl p-6 hover:border-[#D4AF37]/50 transition-all flex flex-col justify-between gap-5 shadow-xl text-left">
      <div className="space-y-4">
        {product.image ? (
          <div className="aspect-video w-full overflow-hidden rounded-2xl bg-[#070C1A] border border-slate-800">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-video w-full rounded-2xl bg-gradient-to-br from-[#0A1128] via-[#121E3F] to-[#262010] border border-[#D4AF37]/30 flex flex-col items-center justify-center gap-3 p-4">
            <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center">
              {renderProductIcon(product.iconName)}
            </div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#F5D061]">
              GOYE Module #{String(product.id).padStart(2, '0')}
            </span>
          </div>
        )}

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
            onClick={handleUnlock}
            disabled={loading}
            className="w-full bg-[#D4AF37] hover:bg-[#e5c14b] disabled:opacity-50 text-[#0A1128] py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>{loading ? 'Processing...' : `Buy with ${product.price} Pi`}</span>
          </button>
          {statusMsg && <p className="text-xs text-amber-300 text-center">{statusMsg}</p>}
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
          {statusMsg && <p className="text-xs text-emerald-300 text-center">{statusMsg}</p>}
        </div>
      )}
    </div>
  );
}
