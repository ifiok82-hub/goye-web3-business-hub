'use client'
import { useState } from 'react'

export default function PiPayment({ amount, memo, metadata }: { amount: number, memo: string, metadata: any }) {
  const [loading, setLoading] = useState(false)

  const handlePay = async () => {
    setLoading(true)
    try {
      // Step 1: MUST authenticate FIRST to get username popup
      if (!window.Pi) {
        const s = document.createElement('script')
        s.src = 'https://sdk.minepi.com/pi-sdk.js'
        await new Promise((res, rej) => {
          s.onload = res
          s.onerror = rej
          document.head.appendChild(s)
        })
      }
      await window.Pi.init({ version: "2.0", sandbox: true })
      console.log("Step 1: Authenticating to show username ifiok1967...")
      const auth = await window.Pi.authenticate(["username", "payments"], (p: any) => {
        console.log("incomplete payment found", p)
      })
      console.log(`Authenticated as @${auth.user.username}`)

      // Step 2: Create payment - must be within 10 sec of approve
      console.log("Step 2: Creating Pi payment...")
      await window.Pi.createPayment({
        amount,
        memo,
        metadata
      }, {
        onReadyForServerApproval: async (paymentId: string) => {
          console.log(`Payment ${paymentId} ready for approval, calling backend immediately...`)
          // Call both payments/approve and approve endpoints
          const res = await fetch('/api/pi/payments/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId })
          })
          const data = await res.json()
          if (!data.success) throw new Error(`Approve failed: ${JSON.stringify(data)}`)
          console.log("Payment approved by backend")
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          console.log(`Payment ${paymentId} ready for completion with txid ${txid}`)
          const res = await fetch('/api/pi/payments/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, txid })
          })
          const data = await res.json()
          if (!data.success) throw new Error(`Complete failed`)
          alert(`Payment successful! TX: ${txid}`)
          setLoading(false)
        },
        onCancel: (paymentId: string) => {
          console.log("Payment cancelled", paymentId)
          setLoading(false)
          alert("Payment cancelled")
        },
        onError: (error: any, payment: any) => {
          console.error("Payment error", error, payment)
          setLoading(false)
          alert(`Payment error: ${error?.message || JSON.stringify(error)}`)
        }
      })
    } catch (e: any) {
      console.error(e)
      setLoading(false)
      alert(`Failed: ${e?.message || e} - Use Pi Browser app, not Chrome`)
    }
  }

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="w-full bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600 text-black p-4 rounded-xl font-bold text-lg mt-4 shadow-lg cursor-pointer transition-colors"
    >
      {loading ? "Processing Pi Payment..." : "Pay with Pi (Testnet) - @ifiok1967"}
    </button>
  )
}
