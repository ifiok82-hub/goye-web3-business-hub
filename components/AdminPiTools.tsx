'use client'
import React, { useState } from 'react'

export default function AdminPiTools() {
  const [logs, setLogs] = useState<string[]>([])
  const [authUsername, setAuthUsername] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 19)])
  }

  const handleTestAuth = async () => {
    setLoading(true)
    addLog("Testing Pi Auth (expecting popup)...")
    try {
      if (typeof window === 'undefined' || !window.Pi) {
        const s = document.createElement('script')
        s.src = 'https://sdk.minepi.com/pi-sdk.js'
        await new Promise((res, rej) => { s.onload = res; s.onerror = rej; document.head.appendChild(s) })
      }
      await window.Pi.init({ version: "2.0", sandbox: true })
      addLog("Pi SDK initialized in sandbox: true")

      const auth = await window.Pi.authenticate(["username", "payments"], (payment: any) => {
        addLog(`Incomplete payment detected: ${payment?.identifier}`)
      })

      const username = auth?.user?.username || 'ifiok1967'
      setAuthUsername(username)
      addLog(`✅ Auth SUCCESS! Username: @${username} (UID: ${auth?.user?.uid})`)
      alert(`Pi Auth Success: @${username}`)
    } catch (err: any) {
      addLog(`❌ Auth ERROR: ${err?.message || err}`)
      alert(`Pi Auth Error: ${err?.message || err}`)
    } finally {
      setLoading(false)
    }
  }

  const handleTestPayment = async () => {
    setLoading(true)
    addLog("Initiating 0.1 Test-Pi Payment...")
    try {
      if (typeof window === 'undefined' || !window.Pi) {
        const s = document.createElement('script')
        s.src = 'https://sdk.minepi.com/pi-sdk.js'
        await new Promise((res, rej) => { s.onload = res; s.onerror = rej; document.head.appendChild(s) })
      }
      await window.Pi.init({ version: "2.0", sandbox: true })
      const auth = await window.Pi.authenticate(["username", "payments"], () => {})
      addLog(`Pioneer authenticated: @${auth?.user?.username || 'ifiok1967'}`)

      window.Pi.createPayment({
        amount: 0.1,
        memo: "Admin Sandbox Testnet Payment for ifiok1967",
        metadata: { adminTest: true, testnet: true, recipient: "GDDTB2ND3AZU7BY36A7N5CHLO63XMXVSGNCMXOIDZI7FUP5GI3P7X24E" }
      }, {
        onReadyForServerApproval: async (paymentId: string) => {
          addLog(`Calling server approval for ${paymentId}...`)
          const res = await fetch('/api/pi/payments/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId })
          })
          const data = await res.json()
          addLog(`Approval response: ${JSON.stringify(data)}`)
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          addLog(`Payment approved! Submitting blockchain completion with txid ${txid}...`)
          const res = await fetch('/api/pi/payments/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, txid })
          })
          const data = await res.json()
          addLog(`✅ Completion response: ${JSON.stringify(data)}`)
          alert(`Testnet Payment Complete! Tx: ${txid}`)
          setLoading(false)
        },
        onCancel: (paymentId: string) => {
          addLog(`Payment cancelled: ${paymentId}`)
          setLoading(false)
        },
        onError: (err: any) => {
          addLog(`Payment error: ${err?.message || JSON.stringify(err)}`)
          setLoading(false)
        }
      })
    } catch (err: any) {
      addLog(`Execution error: ${err?.message || err}`)
      setLoading(false)
    }
  }

  return (
    <div className="p-6 rounded-2xl bg-[#121620] border border-yellow-500/30 space-y-4">
      <div className="flex items-center justify-between border-b border-gray-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-yellow-400 flex items-center gap-2">
            <span>⚙️ Pi Testnet Tools (Admin Only)</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 font-mono">SANDBOX</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Internal diagnostics for Pioneer auth and server approval verification.
          </p>
        </div>
        {authUsername && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
            @{authUsername}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleTestAuth}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 disabled:opacity-50 text-white font-bold text-xs cursor-pointer transition-colors shadow-md flex items-center gap-2"
        >
          <span>👤 Test Pi Auth - Show @ifiok1967 popup</span>
        </button>

        <button
          onClick={handleTestPayment}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600 disabled:opacity-50 text-black font-bold text-xs cursor-pointer transition-colors shadow-md flex items-center gap-2"
        >
          <span>🧪 Test Pi Payment Testnet (0.1 π)</span>
        </button>
      </div>

      {logs.length > 0 && (
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Diagnostics Console Logs</label>
          <div className="p-3 rounded-lg bg-black/60 border border-gray-800 font-mono text-[11px] text-gray-300 max-h-48 overflow-y-auto space-y-1">
            {logs.map((log, idx) => (
              <div key={idx} className="break-all">{log}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
