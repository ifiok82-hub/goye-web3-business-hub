'use client'
import React from 'react'
import PiAuthButton from '../components/PiAuthButton'
import PiPayment from '../components/PiPayment'

export default function Page() {
  return (
    <main className="min-h-screen bg-[#08080f] text-white flex flex-col items-center justify-center p-6 space-y-6">
      <div className="w-full max-w-md bg-[#12121f] border border-[#2a2a44] p-6 rounded-2xl shadow-2xl space-y-5">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#facc15]/10 border border-[#facc15]/20 text-[#facc15] text-xs font-bold uppercase tracking-wider">
            Pi Network Only
          </div>
          <h1 className="text-2xl font-extrabold text-[#f5f3ff]">GOYE Web3 Business Hub</h1>
          <p className="text-xs text-zinc-400">
            Official Pi Testnet Checkout for @ifiok1967
          </p>
        </div>

        {/* 1. Pi Auth Button at top so user sees username popup before paying */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Step 1: Pioneer Authentication</label>
          <PiAuthButton />
        </div>

        {/* 2. Pi Payment Component */}
        <div className="space-y-2 pt-2 border-t border-[#23233a]">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Step 2: Testnet Payment (1 Pi)</label>
          <PiPayment
            amount={1}
            memo="Goye Web3 Hub Test Payment for ifiok1967"
            metadata={{ product: "test", user: "ifiok1967", wallet: "GDDTB2ND3AZU7BY36A7N5CHLO63XMXVSGNCMXOIDZI7FUP5GI3P7X24E" }}
          />
        </div>

        <div className="text-[11px] text-zinc-500 text-center leading-relaxed">
          Pi Testnet Sandbox Active • Zero monetary loss • Recipient: GDDTB2...X24E
        </div>
      </div>
    </main>
  )
}
