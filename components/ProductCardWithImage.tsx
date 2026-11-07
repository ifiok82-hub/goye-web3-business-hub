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
  const [purchased, setPurchased] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem('purchased_products')
    if (saved) {
      try {
        if (JSON.parse(saved).includes(product.id)) {
          setPurchased(true)
        }
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
      await window.Pi.init({ version: "2.0", sandbox: true })
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
          setPurchased(true)
          alert(`Access granted to ${product.name}! TX: ${txid}`)
          setLoading(false)
        },
        onCancel: () => setLoading(false),
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
    <div className="relative bg-[#121620] border border-gray-700/80 rounded-2xl overflow-hidden hover:border-yellow-500/40 transition-all flex flex-col justify-between shadow-xl">
      {/* IMAGE - ALWAYS CLEAR, BEAUTIFUL, NEVER LOCKED/BLURRED */}
      <div className="relative h-52 w-full overflow-hidden bg-black/30">
        <img
          src={product.image || '/images/business-id.jpg'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        {/* Only small price badge on image corner, not covering beauty */}
        <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md border border-yellow-500/30 px-3 py-1 rounded-full text-yellow-400 text-xs font-bold font-mono shadow-md">
          {product.price} π
        </div>
        {purchased && (
          <div className="absolute top-3 left-3 bg-emerald-500 text-black px-3 py-1 rounded-full text-xs font-bold shadow-md">
            ✓ Owned
          </div>
        )}
      </div>
      
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-white text-lg leading-snug">{product.name}</h3>
          <p className="text-gray-400 text-xs mt-1.5 mb-4 leading-relaxed">{product.desc}</p>
        </div>
        
        {/* LOCK IS ONLY ON CONTENT ACCESS, NOT IMAGE */}
        {!purchased ? (
          <div className="space-y-2 pt-2 border-t border-gray-800">
            <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
              <span>🔒</span>
              <span>Content locked - Buy to access full product</span>
            </div>
            <button
              onClick={handleBuy}
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600 disabled:opacity-50 text-black py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
            >
              {loading ? "Processing..." : `Buy with ${product.price} Pi 🔒`}
            </button>
          </div>
        ) : (
          <button
            onClick={() => alert(`Access granted to full content for ${product.name}`)}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-sm cursor-pointer transition-colors shadow-md flex items-center justify-center gap-2"
          >
            ✓ Access Product Content
          </button>
        )}
      </div>
    </div>
  )
}
