'use client'
import React from 'react'
import PiAuth from '../components/PiAuth'

export default function Page() {
  return (
    <main className="min-h-screen bg-[#0B0E14] text-white flex flex-col items-center justify-center p-6 space-y-8">
      <div className="text-center space-y-3 max-w-md">
        <h1 className="text-3xl font-extrabold text-[#D4AF37]">GOYE Web3 Business Hub</h1>
        <p className="text-sm text-slate-300">
          Authenticate with your Pi Network account to access digital commerce tools and Testnet payments.
        </p>
      </div>

      <PiAuth />
    </main>
  )
}
