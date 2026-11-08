'use client'
import { useEffect, useState } from 'react'

export default function PiAuth() {
  const [user, setUser] = useState<any>(null)
  useEffect(() => {
    const s = document.createElement('script')
    s.src = 'https://sdk.minepi.com/pi-sdk.js'
    s.async = true
    document.head.appendChild(s)
  }, [])
  const signIn = async () => {
    await (window as any).Pi.init({ version: "2.0" })
    const auth = await (window as any).Pi.authenticate(["username"], () => {})
    const res = await fetch('/api/pi/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken: auth.accessToken })
    })
    const data = await res.json()
    setUser(data.user)
  }
  return <button onClick={signIn} className="px-5 py-2.5 rounded-full bg-[#c4a46a] text-black font-bold cursor-pointer hover:bg-[#d5b57b] transition-colors">{user ? `@${user.username}` : 'Sign in with Pi'}</button>
}
