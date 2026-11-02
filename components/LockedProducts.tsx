'use client'
import React, { useState, useEffect } from 'react'
import ProductCardWithImage, { ProductData } from './ProductCardWithImage'

export const FLAGSHIP_PRODUCTS: ProductData[] = [
  { id: 1, name: "Business ID Registration", desc: "5-Level Verifiable Cryptographic Identity", price: 2, image: "/images/business-id.jpg" },
  { id: 2, name: "AI Assistant Setup", desc: "Autonomous AI Enterprise Agents", price: 3, image: "/images/ai-assistant.jpg" },
  { id: 3, name: "Marketplace Listing", desc: "Web3 Global Marketplace Verified Listing", price: 1, image: "/images/marketplace.jpg" },
  { id: 4, name: "Supply Chain Tracking", desc: "Provenance verification & batch serialization", price: 2, image: "/images/supply-chain.jpg" },
  { id: 5, name: "Academy Certification", desc: "Accredited Web3 commerce developer program", price: 1, image: "/images/academy.jpg" },
  { id: 6, name: "Enterprise Compliance Kit", desc: "Audit logs, exportable tax and KYC reporting", price: 4, image: "/images/compliance.jpg" },
  { id: 7, name: "Escrow Contracts", desc: "Automated milestone-based escrow contracts", price: 2, image: "/images/escrow.jpg" },
  { id: 8, name: "Invoicing & Settlement", desc: "Cryptographic invoicing with Pi verification", price: 1, image: "/images/invoicing.jpg" },
  { id: 9, name: "Trade Assurance Protocol", desc: "Dispute resolution and bonded transaction protection", price: 3, image: "/images/trade.jpg" },
  { id: 10, name: "Corporate Business Profile", desc: "Public verifiable business registry on Pi Network", price: 2, image: "/images/corporate.jpg" },
  { id: 11, name: "Website Development", desc: "Launch high-conversion business websites", price: 3, image: "/images/websites.jpg" },
  { id: 12, name: "E-Commerce Systems", desc: "Turnkey e-commerce systems for African markets", price: 4, image: "/images/ecommerce.jpg" },
  { id: 13, name: "AI Business Automation", desc: "24/7 AI Reception, Lead Generation, WhatsApp Handoff", price: 5, image: "/images/ai-business.jpg" },
  { id: 14, name: "Cryptographic Business ID", desc: "Establish corporate trust with verifiable identity", price: 3, image: "/images/crypto-id.jpg" },
  { id: 15, name: "Production Web Engineering", desc: "Production Web Engineering enterprise solutions", price: 3, image: "/images/web-eng.jpg" },
]

export const PRODUCTS = FLAGSHIP_PRODUCTS

export default function LockedProducts() {
  const [unlockedCount, setUnlockedCount] = useState(0)

  useEffect(() => {
    const updateCount = () => {
      if (typeof window === 'undefined') return
      const saved = localStorage.getItem('purchased_products')
      if (saved) {
        try {
          const arr = JSON.parse(saved)
          setUnlockedCount(arr.length)
        } catch (_) {}
      }
    }
    updateCount()
    window.addEventListener('storage', updateCount)
    return () => window.removeEventListener('storage', updateCount)
  }, [])

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-800 gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex flex-wrap items-center gap-2.5">
            <span>15 Flagship Products & Infrastructure</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 font-semibold font-mono">
              Pi Mainnet
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Enterprise products with instant digital access via official Pi Network payments.
          </p>
        </div>
        <div className="text-xs sm:text-sm font-mono text-gray-400 shrink-0 bg-black/40 px-3 py-1.5 rounded-lg border border-gray-800">
          Unlocked: <strong className="text-yellow-400 font-bold">{unlockedCount}</strong> / 15
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FLAGSHIP_PRODUCTS.map(p => (
          <ProductCardWithImage key={p.id} product={p} />
        ))}
      </div>
    </div>
  )
}
