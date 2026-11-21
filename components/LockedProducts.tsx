'use client';
import React, { useState, useEffect, useCallback } from 'react';
import ProductCardWithImage from './ProductCardWithImage';
import { FLAGSHIP_PRODUCTS } from '../lib/products';

export { FLAGSHIP_PRODUCTS };
export const PRODUCTS = FLAGSHIP_PRODUCTS;

export default function LockedProducts() {
  const [unlockedIds, setUnlockedIds] = useState<number[]>([]);

  const loadLocalUnlocked = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = window.localStorage.getItem('purchased_products');
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr)) {
          setUnlockedIds(arr.filter((id): id is number => typeof id === 'number'));
        }
      }
    } catch {
      // Ignore restricted storage in sandboxed iframes
    }
  }, []);

  const refreshServerEntitlements = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const merged = new Set<number>();

    try {
      const saved = window.localStorage.getItem('purchased_products');
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr)) {
          for (const id of arr) {
            if (typeof id === 'number') merged.add(id);
          }
        }
      }
    } catch {
      // Ignore restricted storage
    }

    try {
      const uid = window.sessionStorage?.getItem('pi_user_uid');
      if (uid) {
        const res = await fetch(`/api/pi/orders?userUid=${encodeURIComponent(uid)}`);
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (Array.isArray(data?.entitlements)) {
            for (const ent of data.entitlements) {
              if (typeof ent?.productId === 'number') {
                merged.add(ent.productId);
              }
            }
          }
        }
      }
    } catch {
      // Ignore network/storage errors
    }

    setUnlockedIds(Array.from(merged));
  }, []);

  useEffect(() => {
    // Only read local state on initial load — zero network fetch until user signs in or buys
    loadLocalUnlocked();
    const onServerUpdate = () => {
      refreshServerEntitlements();
    };
    window.addEventListener('storage', loadLocalUnlocked);
    window.addEventListener('goye:entitlements-updated', onServerUpdate);
    return () => {
      window.removeEventListener('storage', loadLocalUnlocked);
      window.removeEventListener('goye:entitlements-updated', onServerUpdate);
    };
  }, [loadLocalUnlocked, refreshServerEntitlements]);

  return (
    <div className="w-full space-y-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-4 border-b border-slate-800 gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              15 Flagship Products & Infrastructure
            </h2>
            <span className="text-xs px-3 py-1 rounded-full bg-[#D4AF37]/15 text-[#F5D061] border border-[#D4AF37]/30 font-semibold">
              Enterprise Suite
            </span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Clear, modular digital business infrastructure unlocked after verified Pi payment completion.
          </p>
        </div>
        <div className="text-xs sm:text-sm font-mono text-slate-300 shrink-0 bg-[#0E162B] px-4 py-2 rounded-xl border border-slate-800">
          Unlocked: <strong className="text-[#F5D061] font-bold">{unlockedIds.length}</strong> / 15
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FLAGSHIP_PRODUCTS.map((p) => (
          <ProductCardWithImage
            key={p.id}
            product={p}
            serverUnlocked={unlockedIds.includes(p.id)}
          />
        ))}
      </div>
    </div>
  );
}
