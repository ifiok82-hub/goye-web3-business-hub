'use client'
import React, { useState, useEffect } from 'react'

export interface ProductData {
  id: number;
  name: string;
  desc: string;
  price: number;
  image?: string;
  category?: string;
  tags?: string[];
}

export default function ProductCardWithImage({ product }: { product: ProductData }) {
  const [unlocked, setUnlocked] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem('purchased_products')
    if (saved) {
      try {
        const arr = JSON.parse(saved)
        if (arr.includes(product.id)) setUnlocked(true)
      } catch (_) {}
    }
  }, [product.id])

  const handleBuy = async () => {
    setLoading(true)
    try {
      if (typeof window === 'undefined' || !window.Pi) {
        const s = document.createElement('script')
        s.src = 'https://sdk.minepi.com/pi-sdk.js'
        await new Promise((res, rej) => { s.onload = res; s.onerror = rej; document.head.appendChild(s) })
      }
      await window.Pi.init({ version: "2.0" })
      await window.Pi.authenticate(["username", "payments"], () => {})
      
      await window.Pi.createPayment({
        amount: product.price,
        memo: `Goye Hub - ${product.name}`,
        metadata: {
          productId: product.id,
          productName: product.name,
          wallet: "GBR4B47WY7JDK2JKUUQQTWWQENOUUYTAQAOYLXZ7XE36YFQY6LKPVO6R"
        }
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
          const saved = localStorage.getItem('purchased_products')
          const arr = saved ? JSON.parse(saved) : []
          if (!arr.includes(product.id)) {
            arr.push(product.id)
          }
          localStorage.setItem('purchased_products', JSON.stringify(arr))
          setUnlocked(true)
          alert(`Purchased ${product.name}! TX: ${txid}`)
          setLoading(false)
        },
        onCancel: () => {
          setLoading(false)
        },
        onError: (e: any) => {
          setLoading(false)
          alert(e?.message || e)
        }
      })
    } catch (e: any) {
      setLoading(false)
      alert(`Buy failed: ${e?.message || e} - Use Pi Browser`)
    }
  }

  return (
    <div className="relative bg-[#121620] border border-gray-800 rounded-2xl overflow-hidden group hover:border-yellow-500/50 transition-all shadow-lg flex flex-col justify-between">
      {/* Product Image with Lock Overlay */}
      {product.image && (
        <div className="relative h-48 w-full overflow-hidden bg-black/40">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {!unlocked && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
              <div className="bg-black/80 rounded-full p-3.5 mb-2 shadow-xl border border-yellow-500/30">
                <span className="text-2xl">🔒</span>
              </div>
              <div className="bg-yellow-500/20 border border-yellow-500/50 px-3 py-1 rounded-full text-yellow-400 text-xs font-bold font-mono">
                🔒 {product.price} π Locked
              </div>
            </div>
          )}
          {unlocked && (
            <div className="absolute top-3 right-3 bg-emerald-500 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              ✓ Purchased
            </div>
          )}
        </div>
      )}
      
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2 gap-2">
            <h3 className="font-bold text-white text-base leading-snug">{product.name}</h3>
            {!product.image && !unlocked && (
              <span className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full text-xs font-bold font-mono shrink-0">
                🔒 {product.price} π
              </span>
            )}
          </div>
          <p className="text-gray-400 text-xs leading-relaxed mb-4">{product.desc}</p>
        </div>
        
        <div>
          {!unlocked ? (
            <button
              onClick={handleBuy}
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600 disabled:opacity-50 text-black py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
            >
              {loading ? "Processing..." : `Buy with ${product.price} Pi 🔒`}
            </button>
          ) : (
            <button
              onClick={() => alert(`Access granted to ${product.name}`)}
              className="w-full bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 py-3 rounded-xl font-bold text-sm cursor-pointer hover:bg-emerald-950/60 transition-colors"
            >
              ✓ Access Product
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
