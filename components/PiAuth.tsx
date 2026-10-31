'use client'
import { useState, useEffect } from 'react'

export default function PiAuth() {
  const [user, setUser] = useState<{ uid: string; username: string } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.Pi) {
      const s = document.createElement('script')
      s.src = 'https://sdk.minepi.com/pi-sdk.js'
      s.async = true
      document.head.appendChild(s)
    }
  }, [])

  const onIncompletePaymentFound = (payment: any) => {
    fetch('/api/pi/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId: payment.identifier, txid: payment.transaction?.txid })
    })
  }

  const signIn = async () => {
    setLoading(true)
    try {
      await window.Pi!.init({ version: '2.0' })
      const auth = await window.Pi!.authenticate(['username'], onIncompletePaymentFound)
      const accessToken = auth.accessToken
      const res = await fetch('/api/pi/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setUser(data.user)
    } catch (e: any) {
      console.error(e)
      alert('Pi auth failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {!user ? (
        <button
          onClick={signIn}
          disabled={loading}
          className="bg-[#c4a46a] hover:bg-[#d5b57b] text-black px-6 py-3 rounded-full font-bold cursor-pointer transition-colors shadow-lg"
        >
          {loading ? 'Connecting...' : 'Sign in with Pi'}
        </button>
      ) : (
        <div className="text-center bg-[#121620] border border-[#c4a46a]/30 px-6 py-3 rounded-full shadow-md">
          <p className="text-xs text-gray-400">Signed in as</p>
          <p className="font-bold text-[#c4a46a]">@{user.username}</p>
        </div>
      )}
    </div>
  )
}
