'use client';

import React, { useState, useEffect } from 'react';
import { Lock, CheckCircle2, Receipt, AlertCircle } from 'lucide-react';
import { ProductData } from '../lib/products';
import { handleIncompletePayment, initPiSdk } from '../lib/piClient';

interface PaymentReceipt {
  receiptId: string;
  status: 'PAID';
  paymentId: string;
  txid: string;
  productId: number | null;
  productName: string;
  amount: number;
  network: string;
  paidAt: string;
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (serverUnlocked) {
      setPurchased(true);
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
      const savedReceipt = window.localStorage.getItem(`goye_receipt_${product.id}`);
      if (savedReceipt) {
        const parsedReceipt = JSON.parse(savedReceipt) as PaymentReceipt;
        if (parsedReceipt?.status === 'PAID' && parsedReceipt?.txid) {
          setReceipt(parsedReceipt);
        }
      }
    } catch {
      // Ignore restricted storage
    }
  }, [product.id, serverUnlocked]);

  async function handleBuy(targetProduct: ProductData) {
    if (loading || purchased) return;
    setLoading(true);
    setErrorMsg(null);
    setStatusMsg('Initializing Pi SDK...');

    const ready = await initPiSdk();
    const Pi = typeof window !== 'undefined' ? window.Pi : null;
    if (!ready || !Pi) {
      setLoading(false);
      setStatusMsg(null);
      setErrorMsg('Pi Browser / Pi SDK is required for Pi payments.');
      return;
    }

    // STEP 1 — Authenticate with username + payments scope and verify server-side via /api/auth/pi
    setStatusMsg('Requesting Pi authentication & payments permission...');
    try {
      const auth = await Pi.authenticate(['username', 'payments'], handleIncompletePayment);
      const accessToken = auth?.accessToken;
      if (!accessToken || typeof accessToken !== 'string') {
        throw new Error('Pi authentication did not return a valid access token.');
      }

      const authRes = await fetch('/api/auth/pi', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken,
          user: auth?.user
            ? { uid: auth.user.uid, username: auth.user.username }
            : undefined,
        }),
      });
      const authData = await authRes.json().catch(() => ({}));
      if (!authRes.ok || !authData?.authenticated || !authData?.user?.username) {
        throw new Error(
          typeof authData?.error === 'string' && authData.error
            ? authData.error
            : `Pi authentication verification failed (${authRes.status}).`
        );
      }

      try {
        window.sessionStorage?.setItem('pi_user_uid', String(authData.user.uid));
      } catch {
        // Ignore restricted storage
      }
      window.dispatchEvent(
        new CustomEvent('goye:auth-updated', {
          detail: {
            uid: String(authData.user.uid),
            username: String(authData.user.username),
          },
        })
      );
    } catch (authErr: unknown) {
      const msg =
        authErr instanceof Error && authErr.message
          ? authErr.message
          : 'Please tap Allow when Pi asks for username & payments permission.';
      setLoading(false);
      setStatusMsg(null);
      setErrorMsg(msg);
      return;
    }

    // STEP 2 — Create Pi payment and await verified server approval + completion
    try {
      setStatusMsg('Opening Pi Wallet...');

      await Pi.createPayment(
        {
          amount: targetProduct.price,
          memo: targetProduct.memo || targetProduct.name,
          metadata: { productId: targetProduct.id },
        },
        {
          onReadyForServerApproval: (paymentId: string) => {
            const approvePromise = fetch('/api/pi/approve', {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId }),
            }).then(async (r) => {
              const data = await r.json().catch(() => ({}));
              if (!r.ok || !data?.approved) {
                const errDetail =
                  typeof data?.error === 'string' && data.error
                    ? data.error
                    : `Server approval failed (${r.status})`;
                setStatusMsg(null);
                setErrorMsg(errDetail);
                setLoading(false);
                throw new Error(errDetail);
              }
              setStatusMsg('Waiting for wallet confirmation...');
            });
            setStatusMsg('Approving payment on server...');
            return approvePromise;
          },
          onReadyForServerCompletion: (paymentId: string, txid: string) => {
            const completePromise = fetch('/api/pi/complete', {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid }),
            }).then(async (r) => {
              const data = await r.json().catch(() => ({}));
              const isConfirmedPaid =
                r.ok &&
                data?.completed === true &&
                data?.fulfilled === true &&
                data?.status === 'PAID' &&
                Boolean(data?.txid);

              if (!isConfirmedPaid) {
                const errDetail =
                  typeof data?.error === 'string' && data.error
                    ? data.error
                    : `Server completion failed (${r.status})`;
                setStatusMsg(null);
                setErrorMsg(errDetail);
                setLoading(false);
                throw new Error(errDetail);
              }

              const confirmedReceipt: PaymentReceipt | null =
                data?.receipt && data.receipt.status === 'PAID'
                  ? data.receipt
                  : {
                      receiptId: `RCP-${paymentId.slice(0, 8).toUpperCase()}`,
                      status: 'PAID',
                      paymentId,
                      txid: String(data.txid || txid),
                      productId: targetProduct.id,
                      productName: targetProduct.name,
                      amount: targetProduct.price,
                      network: 'testnet',
                      paidAt: new Date().toISOString(),
                    };

              try {
                const saved = window.localStorage.getItem('purchased_products');
                const arr = saved ? JSON.parse(saved) : [];
                if (Array.isArray(arr) && !arr.includes(targetProduct.id)) {
                  arr.push(targetProduct.id);
                  window.localStorage.setItem('purchased_products', JSON.stringify(arr));
                }
                if (confirmedReceipt) {
                  window.localStorage.setItem(
                    `goye_receipt_${targetProduct.id}`,
                    JSON.stringify(confirmedReceipt)
                  );
                }
              } catch {
                // Ignore restricted storage
              }

              window.dispatchEvent(
                new CustomEvent('goye:entitlements-updated', {
                  detail: { productId: targetProduct.id },
                })
              );

              setReceipt(confirmedReceipt);
              setPurchased(true);
              setErrorMsg(null);
              setStatusMsg(`PAID • TX: ${String(data.txid || txid).slice(0, 12)}...`);
              setLoading(false);
            });
            setStatusMsg('Verifying transaction & completing payment...');
            return completePromise;
          },
          onCancel: (paymentId: string) => {
            setLoading(false);
            setStatusMsg(null);
            setErrorMsg('Payment cancelled. No funds were moved.');
            return fetch('/api/pi/cancel', {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId }),
            }).catch(() => undefined);
          },
          onError: (error: unknown) => {
            const msg =
              error instanceof Error
                ? error.message
                : typeof (error as any)?.message === 'string'
                  ? (error as any).message
                  : 'Pi payment error occurred.';
            setLoading(false);
            setStatusMsg(null);
            setErrorMsg(msg);
          },
        }
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Payment did not complete.';
      setLoading(false);
      setStatusMsg(null);
      setErrorMsg((prev) => prev || msg);
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
            {purchased ? (
              <span className="shrink-0 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-xs font-bold font-mono">
                PAID • {product.price} π
              </span>
            ) : (
              <span className="shrink-0 px-2.5 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#F5D061] text-xs font-bold font-mono">
                {product.price} π
              </span>
            )}
          </div>
          <p className="text-slate-300 text-sm leading-relaxed line-clamp-2">{product.desc}</p>
        </div>
      </div>

      {!purchased ? (
        <div className="space-y-2.5 pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Lock className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
            <span>Module locked — unlock after confirmed Pi payment</span>
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
          {statusMsg ? (
            <p className="text-xs text-amber-300 text-center break-words">{statusMsg}</p>
          ) : null}
          {errorMsg ? (
            <p className="text-xs text-red-300 text-center break-words inline-flex items-center justify-center gap-1 w-full">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </p>
          ) : null}
        </div>
      ) : (
        <div className="space-y-2.5 pt-3 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => setShowContent((prev) => !prev)}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-sm cursor-pointer transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{showContent ? 'Hide Unlocked Module' : 'Access Product Content'}</span>
          </button>

          {showContent ? (
            <div className="p-3 rounded-xl bg-emerald-950/35 border border-emerald-500/30 text-xs text-emerald-100 space-y-1">
              <div className="font-semibold text-emerald-300">
                Access Granted: {product.name}
              </div>
              <div className="text-slate-300">
                Memo: <span className="font-mono">{product.memo}</span>
              </div>
              {receipt ? (
                <div className="pt-1 border-t border-emerald-500/20 text-[11px] font-mono text-emerald-200 space-y-0.5 break-all">
                  <div className="inline-flex items-center gap-1 text-emerald-300">
                    <Receipt className="w-3 h-3" />
                    <span>
                      Receipt {receipt.receiptId} ({receipt.status})
                    </span>
                  </div>
                  <div>TXID: {receipt.txid}</div>
                </div>
              ) : null}
            </div>
          ) : statusMsg ? (
            <p className="text-xs text-emerald-300 text-center break-words">{statusMsg}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
