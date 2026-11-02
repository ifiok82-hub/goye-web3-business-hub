'use client'
import React, { useState } from 'react'

export default function AdminPiTools() {
  const [logs, setLogs] = useState<string>('Ready for test')
  const [loading, setLoading] = useState(false)

  const handleTestnetAuth = async () => {
    setLoading(true)
    setLogs("Testing Pi Auth (Testnet)...")
    try {
      if (typeof window === 'undefined' || !window.Pi) {
        const s = document.createElement('script')
        s.src = 'https://sdk.minepi.com/pi-sdk.js'
        await new Promise((res, rej) => { s.onload = res; s.onerror = rej; document.head.appendChild(s) })
      }
      await window.Pi.init({ version: "2.0", sandbox: true })
      const auth = await window.Pi.authenticate(["username", "payments"], (p: any) => {
        setLogs(`Incomplete: ${p?.identifier || 'none'}`)
      })
      const username = auth?.user?.username || 'ifiok1967'
      setLogs(`Auth Success: @${username} (UID: ${auth?.user?.uid})`)
      alert(`Pi Auth Success: @${username}`)
    } catch (err: any) {
      setLogs(`Auth Failed: ${err?.message || err}`)
      alert(`Pi Auth Error: ${err?.message || err}`)
    } finally {
      setLoading(false)
    }
  }

  const handleTestnetPayment = async () => {
    setLoading(true)
    setLogs("Initiating 1 Pi Testnet payment...")
    try {
      if (typeof window === 'undefined' || !window.Pi) {
        const s = document.createElement('script')
        s.src = 'https://sdk.minepi.com/pi-sdk.js'
        await new Promise((res, rej) => { s.onload = res; s.onerror = rej; document.head.appendChild(s) })
      }
      await window.Pi.init({ version: "2.0", sandbox: true })
      await window.Pi.authenticate(["username", "payments"], () => {})

      window.Pi.createPayment({
        amount: 1,
        memo: "Admin Pi Testnet Payment 1 Pi for ifiok1967",
        metadata: { adminTest: true, testnet: true, recipient: "GDDTB2ND3AZU7BY36A7N5CHLO63XMXVSGNCMXOIDZI7FUP5GI3P7X24E" }
      }, {
        onReadyForServerApproval: async (paymentId: string) => {
          setLogs(`Approving ${paymentId}...`)
          const res = await fetch('/api/pi/testnet/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId })
          })
          const data = await res.json()
          setLogs(`Approved: ${JSON.stringify(data)}`)
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          setLogs(`Completing with TXID ${txid}...`)
          const res = await fetch('/api/pi/testnet/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, txid })
          })
          const data = await res.json()
          setLogs(`Payment Complete! TX: ${txid}`)
          alert(`Testnet Payment Complete! TX: ${txid}`)
          setLoading(false)
        },
        onCancel: () => {
          setLogs("Payment cancelled by user")
          setLoading(false)
        },
        onError: (err: any) => {
          setLogs(`Payment Error: ${err?.message || JSON.stringify(err)}`)
          setLoading(false)
        }
      })
    } catch (err: any) {
      setLogs(`Error: ${err?.message || err}`)
      setLoading(false)
    }
  }

  return (
    <div className="mt-8 p-4 bg-purple-900/20 border border-purple-500 rounded-xl space-y-3">
      <h3 className="text-purple-400 font-bold mb-1 text-base">PI TESTNET PAYMENT TEST (Admin Only)</h3>
      <p className="text-gray-400 text-sm mb-3">
        Test Pi Testnet payments without charging real Pi. Uses api.testnet.minepi.com
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleTestnetAuth}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold text-xs cursor-pointer transition-colors"
        >
          Test Pi Auth - Show @ifiok1967
        </button>
        <button
          onClick={handleTestnetPayment}
          disabled={loading}
          className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold text-xs cursor-pointer transition-colors"
        >
          Test Pi Testnet Payment 1 Pi
        </button>
      </div>
      <div className="mt-3 text-xs text-gray-300 font-mono bg-black/50 p-2.5 rounded border border-gray-800 break-all">
        Logs: {logs}
      </div>
    </div>
  )
}
