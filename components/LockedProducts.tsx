'use client'
import React, { useState, useEffect } from 'react'

export interface ProductItem {
  id: number;
  name: string;
  price: number;
  desc: string;
}

export const PRODUCTS: ProductItem[] = [
  { id: 1, name: "Business ID Registration", price: 2, desc: "5-Level Verifiable Cryptographic Identity" },
  { id: 2, name: "AI Assistant Setup", price: 3, desc: "Autonomous AI Enterprise Agents" },
  { id: 3, name: "Marketplace Listing", price: 1, desc: "Web3 Global Marketplace Verified Listing" },
  { id: 4, name: "Smart Contracts & Escrow", price: 2, desc: "Automated milestone-based escrow contracts" },
  { id: 5, name: "Invoicing & Settlement", price: 1, desc: "Cryptographic invoicing with Pi verification" },
  { id: 6, name: "Trade Assurance Protocol", price: 3, desc: "Dispute resolution and bonded transaction protection" },
  { id: 7, name: "Corporate Business Profile", price: 2, desc: "Public verifiable business registry on Pi Network" },
  { id: 8, name: "AI Workflow Studio", price: 4, desc: "Custom agentic pipeline design and automation" },
  { id: 9, name: "Cross-Border Settlement", price: 3, desc: "Low-latency international digital trade" },
  { id: 10, name: "Developer API Hub", price: 2, desc: "Direct API keys, webhooks, and SDK integration" },
  { id: 11, name: "Merchant Mobile POS", price: 1, desc: "In-person QR code point-of-sale checkout" },
  { id: 12, name: "Multi-Sig Vault Security", price: 3, desc: "Threshold governance for digital enterprise assets" },
  { id: 13, name: "Supply Chain Tracking", price: 2, desc: "Provenance verification & batch serialization" },
  { id: 14, name: "Academy Certification", price: 1, desc: "Accredited Web3 commerce developer program" },
  { id: 15, name: "Enterprise Compliance Kit", price: 4, desc: "Audit logs, exportable tax and KYC reporting" }
]

export default function LockedProducts() {
  const [unlocked, setUnlocked] = useState<number[]>([])
  const [loading, setLoading] = useState<number | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem('unlocked_products')
    if (saved) {
      try {
        setUnlocked(JSON.parse(saved))
      } catch (_) {}
    }
  }, [])

  const handlePiPay = async (product: ProductItem) => {
    setLoading(product.id)
    try {
      if (!window.Pi) {
        const s = document.createElement('script')
        s.src = 'https://sdk.minepi.com/pi-sdk.js'
        await new Promise((res, rej) => { s.onload = res; s.onerror = rej; document.head.appendChild(s) })
      }
      await window.Pi.init({ version: "2.0" })
      await window.Pi.authenticate(["username", "payments"], () => {})
      
      await window.Pi.createPayment({
        amount: product.price,
        memo: `Goye Hub - ${product.name}`,
        metadata: { productId: product.id, type: "product_unlock", wallet: "GBR4B47WY7JDK2JKUUQQTWWQENOUUYTAQAOYLXZ7XE36YFQY6LKPVO6R" }
      }, {
        onReadyForServerApproval: async (paymentId: string) => {
          await fetch('/api/pi/payments/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId })
          })
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          await fetch('/api/pi/payments/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, txid })
          })
          const newUnlocked = [...unlocked, product.id]
          setUnlocked(newUnlocked)
          localStorage.setItem('unlocked_products', JSON.stringify(newUnlocked))
          alert(`Unlocked ${product.name}! TX: ${txid}`)
          setLoading(null)
        },
        onCancel: () => {
          setLoading(null)
          alert("Payment cancelled")
        },
        onError: (e: any) => {
          setLoading(null)
          alert(`Error: ${e?.message || e}`)
        }
      })
    } catch (e: any) {
      setLoading(null)
      alert(`Pi Payment failed: ${e?.message || e} - Open in Pi Browser`)
    }
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-gray-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>15 Flagship Products & Infrastructure</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 font-semibold">
              Pi Mainnet
            </span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Instant digital access via official Pi Network payments.
          </p>
        </div>
        <div className="text-xs font-mono text-gray-400">
          Unlocked: <strong className="text-yellow-400">{unlocked.length}</strong> / 15
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PRODUCTS.map(p => {
          const isUnlocked = unlocked.includes(p.id)
          return (
            <div
              key={p.id}
              className={`p-4 rounded-xl border transition-all ${
                isUnlocked
                  ? 'bg-emerald-950/20 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                  : 'bg-[#121620] border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-bold text-white text-sm leading-snug">{p.name}</h3>
                {isUnlocked ? (
                  <span className="text-xs font-bold text-emerald-400 shrink-0 bg-emerald-950/50 px-2 py-0.5 rounded">
                    ✓ Unlocked
                  </span>
                ) : (
                  <span className="text-xs font-bold text-yellow-400 shrink-0 bg-yellow-950/40 px-2 py-0.5 rounded">
                    🔒 {p.price} π
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-xs mt-2 leading-relaxed min-h-[36px]">{p.desc}</p>
              {!isUnlocked ? (
                <button
                  onClick={() => handlePiPay(p)}
                  disabled={loading === p.id}
                  className="w-full mt-3 bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600 disabled:opacity-50 text-black py-2 rounded-lg font-bold text-xs cursor-pointer transition-colors shadow-md flex items-center justify-center gap-1.5"
                >
                  {loading === p.id ? "Processing..." : `Unlock with ${p.price} Pi`}
                </button>
              ) : (
                <button
                  onClick={() => alert(`Access granted for ${p.name}`)}
                  className="w-full mt-3 bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-200 border border-emerald-500/30 py-2 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                >
                  Access Product
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
