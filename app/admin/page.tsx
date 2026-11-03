'use client'
import React, { useState, useEffect } from 'react'
import AdminPiTools from '../../components/AdminPiTools'
import { PRODUCTS } from '../../components/LockedProducts'

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [checking, setChecking] = useState(true)
  const [inputSecret, setInputSecret] = useState('')
  const [purchasedIds, setPurchasedIds] = useState<number[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('goye_admin')
      if (auth === 'true') {
        setIsAdmin(true)
      }
      const saved = localStorage.getItem('purchased_products')
      if (saved) {
        try {
          setPurchasedIds(JSON.parse(saved))
        } catch (_) {}
      }
    }
    setChecking(false)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputSecret === 'GoyeAdmin@2026') {
      localStorage.setItem('goye_admin', 'true')
      setIsAdmin(true)
    } else {
      alert('Invalid admin secret')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('goye_admin')
    setIsAdmin(false)
  }

  if (checking) {
    return <div className="min-h-screen bg-[#08080f] text-white p-8">Checking authorization...</div>
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-[#08080f] text-white flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-[#121620] border border-gray-800 p-6 rounded-2xl space-y-4 shadow-2xl">
          <div className="text-center space-y-1">
            <h1 className="text-xl font-bold text-white">GOYE Admin Access</h1>
            <p className="text-xs text-gray-400">Restricted to authorized system operators</p>
          </div>
          <input
            type="password"
            placeholder="Enter Admin Secret"
            value={inputSecret}
            onChange={(e) => setInputSecret(e.target.value)}
            className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500"
          />
          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black py-2.5 rounded-lg font-bold text-sm transition-colors cursor-pointer"
          >
            Authenticate Admin
          </button>
        </form>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#08080f] text-white p-6 md:p-10 space-y-8 max-w-6xl mx-auto">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-800">
        <div>
          <div className="text-xs font-bold text-yellow-500 uppercase tracking-widest">Management Console</div>
          <h1 className="text-2xl font-bold text-white">GOYE Enterprise Hub Admin</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-emerald-400 font-mono">Authenticated</span>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 transition-colors"
          >
            Lock Session
          </button>
        </div>
      </header>

      {/* Internal Diagnostics: Pi Testnet Tools (Admin Only) */}
      <section className="space-y-2">
        <AdminPiTools />
      </section>

      {/* Flagship Products Management */}
      <section className="p-6 rounded-2xl bg-[#121620] border border-gray-800 space-y-4">
        <div className="flex justify-between items-center border-b border-gray-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white">15 Flagship Products & Infrastructure</h2>
            <p className="text-xs text-gray-400">Current customer purchase status ({purchasedIds.length} unlocked)</p>
          </div>
          <span className="text-xs text-yellow-500 font-mono">Pi Mainnet</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {PRODUCTS.map(p => {
            const isPurchased = purchasedIds.includes(p.id)
            return (
              <div key={p.id} className="p-3.5 rounded-lg bg-black/40 border border-gray-800 flex justify-between items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white block">{p.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isPurchased ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-gray-800 text-gray-400'}`}>
                      {isPurchased ? '✓ Purchased' : '🔒 Locked'}
                    </span>
                  </div>
                  <span className="text-gray-400 text-[11px] block mt-0.5">{p.desc}</span>
                </div>
                <span className="font-mono font-bold text-yellow-400 shrink-0">{p.price} π</span>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}
