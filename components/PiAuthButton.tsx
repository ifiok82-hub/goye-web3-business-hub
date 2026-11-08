'use client'
import { useState, useEffect } from 'react'

export default function PiAuthButton() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('pi_user') : null
    if (saved) {
      try {
        setUser(JSON.parse(saved))
      } catch (_) {}
    }
  }, [])

  const handleAuth = async () => {
    setLoading(true)
    try {
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
      const auth = await window.Pi.authenticate(["username", "payments"], (payment: any) => {
        console.log("incomplete", payment)
      })
      // auth.user.username should be ifiok1967
      console.log("Pi authenticated", auth.user)
      // Call backend appstudio auth
      await fetch('/api/pi/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: auth.accessToken })
      })
      // Also call our own app studio login for app studio verification
      await fetch('/api/pi/appstudio-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: auth.accessToken })
      }).catch(() => {})

      setUser(auth.user)
      localStorage.setItem('pi_user', JSON.stringify(auth.user))
      alert(`Welcome @${auth.user.username}! Pi Auth successful.`)
    } catch (err: any) {
      console.error(err)
      alert(`Pi Auth failed: ${err?.message || err} - Make sure you are in Pi Browser app, not Chrome`)
    }
    setLoading(false)
  }

  if (user) {
    return (
      <div className="p-3 bg-purple-900/40 border border-purple-500/40 text-purple-200 rounded-lg text-sm flex items-center justify-between">
        <span>✅ Signed in as <strong>@{user.username}</strong> ({user.uid})</span>
        <button
          onClick={() => {
            localStorage.removeItem('pi_user')
            setUser(null)
          }}
          className="ml-2 text-xs text-purple-300 underline hover:text-white cursor-pointer"
        >
          Logout
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleAuth}
      disabled={loading}
      className="w-full bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white p-4 rounded-xl font-bold text-lg shadow-lg cursor-pointer transition-colors"
    >
      {loading ? "Connecting to Pi..." : "Sign in with Pi - Show Username"}
    </button>
  )
}
