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

export interface ProductData {
  id: number;
  name: string;
  desc: string;
  price: number;
  image?: string;
  iconName:
    | 'fingerprint'
    | 'bot'
    | 'store'
    | 'package'
    | 'graduation'
    | 'compliance'
    | 'handshake'
    | 'receipt'
    | 'scale'
    | 'building'
    | 'globe'
    | 'shopping'
    | 'cpu'
    | 'key'
    | 'code';
}

function renderProductIcon(iconName: ProductData['iconName']) {
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

export default function ProductCardWithImage({ product }: { product: ProductData }) {
  const [purchased, setPurchased] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
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
  }, [product.id]);

  const handleUnlock = async () => {
    setLoading(true);
    setStatusMsg(null);
    try {
      if (typeof window === 'undefined') {
        throw new Error('Browser required.');
      }
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
      if (!window.Pi) {
        throw new Error('Open inside Pi Browser to unlock module.');
      }

      await Promise.resolve(window.Pi.init({ version: '2.0' }));
      await window.Pi.authenticate(['username', 'payments'], () => {});

      await window.Pi.createPayment(
        {
          amount: product.price,
          memo: `Goye Hub - ${product.name}`,
          metadata: {
            productId: product.id,
            productName: product.name,
            wallet: 'GDDTB2ND3AZU7BY36A7N5CHLO63XMXVSGNCMXOIDZI7FUP5GI3P7X24E',
          },
        },
        {
          onReadyForServerApproval: async (paymentId: string) => {
            await fetch('/api/pi/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId }),
            });
          },
          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            await fetch('/api/pi/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid }),
            });
            try {
              const saved = window.localStorage.getItem('purchased_products');
              const arr = saved ? JSON.parse(saved) : [];
              if (!arr.includes(product.id)) {
                arr.push(product.id);
              }
              window.localStorage.setItem('purchased_products', JSON.stringify(arr));
            } catch {
              // Ignore restricted storage
            }
            setPurchased(true);
            setStatusMsg(`Unlocked • TX: ${txid.slice(0, 12)}...`);
            setLoading(false);
          },
          onCancel: () => {
            setLoading(false);
            setStatusMsg('Cancelled.');
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
      setStatusMsg(`Open in Pi Browser (${msg})`);
    }
  };

  return (
    <div className="bg-[#0E162B] border border-slate-700/70 rounded-2xl p-6 hover:border-[#D4AF37]/50 transition-all flex flex-col justify-between gap-5 shadow-xl">
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
            onClick={handleUnlock}
            disabled={loading}
            className="w-full bg-[#D4AF37] hover:bg-[#e5c14b] disabled:opacity-50 text-[#0A1128] py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>{loading ? 'Processing...' : `Buy with ${product.price} Pi`}</span>
          </button>
          {statusMsg && (
            <p className="text-xs text-amber-300 text-center">{statusMsg}</p>
          )}
        </div>
      ) : (
        <div className="space-y-2 pt-3 border-t border-slate-800/80">
          <button
            onClick={() => setStatusMsg(`Full access active for ${product.name}`)}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-sm cursor-pointer transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Access Product Content</span>
          </button>
          {statusMsg && (
            <p className="text-xs text-emerald-300 text-center">{statusMsg}</p>
          )}
        </div>
      )}
    </div>
  );
}
