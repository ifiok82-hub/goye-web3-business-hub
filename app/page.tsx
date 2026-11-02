'use client'
import React from 'react'
import LockedProducts from '../components/LockedProducts'
import FooterWithAdminTap from '../components/FooterWithAdminTap'

export default function Page() {
  return (
    <main className="min-h-screen bg-[#08080f] text-white flex flex-col justify-between">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 w-full space-y-8">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-bold uppercase tracking-wider mb-2">
              Official Pi Mainnet Hub
            </div>
            <h1 className="text-3xl font-extrabold text-white">GOYE Web3 Business Hub</h1>
            <p className="text-sm text-gray-400 mt-1">
              AI + Web3 Business Infrastructure for the Global Digital Economy
            </p>
          </div>
          <div className="text-right hidden md:block">
            <span className="text-xs text-gray-500 block">Settlement Asset</span>
            <span className="text-sm font-bold text-yellow-400 font-mono">Pi (Mainnet)</span>
          </div>
        </header>

        {/* 15 Flagship Products in Locked state with Pi pricing */}
        <section className="space-y-4">
          <LockedProducts />
        </section>
      </div>

      <FooterWithAdminTap />
    </main>
  )
}
