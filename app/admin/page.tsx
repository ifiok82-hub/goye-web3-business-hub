'use client'
import React, { useState, useEffect } from 'react'
import AdminPiTools from '../../components/AdminPiTools'

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [checking, setChecking] = useState(true)
  const [inputSecret, setInputSecret] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('goye_admin')
      if (auth === 'true') {
        setIsAdmin(true)
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
      alert('Wrong secret')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('goye_admin')
    setIsAdmin(false)
  }

  if (checking) {
    return <div className="min-h-screen bg-black text-white p-8">Checking authorization...</div>
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-gray-900 border border-gray-800 p-6 rounded-2xl space-y-4 shadow-2xl">
          <div className="text-center space-y-1">
            <h1 className="text-xl font-bold text-white">GOYE Admin Access</h1>
            <p className="text-xs text-gray-400">Restricted to authorized system operators</p>
          </div>
          <input
            type="password"
            placeholder="Enter Admin Secret"
            value={inputSecret}
            onChange={(e) => setInputSecret(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500"
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
    <main className="min-h-screen bg-black text-white p-6 md:p-10 space-y-8 max-w-6xl mx-auto">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-800">
        <div>
          <div className="text-xs font-bold text-yellow-500 uppercase tracking-widest">Management Console</div>
          <h1 className="text-2xl font-bold text-white">GOYE Enterprise Hub Admin</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-emerald-400 font-mono">Authenticated</span>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 transition-colors cursor-pointer"
          >
            Lock Session
          </button>
        </div>
      </header>

      {/* Internal Diagnostics: Pi Testnet Tools (Admin Only) */}
      <section className="space-y-2">
        <AdminPiTools />
      </section>
    </main>
  )
}
