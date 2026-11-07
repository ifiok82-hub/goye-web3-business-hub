'use client'
import { useState, useEffect } from 'react'
import FooterWithAdminTap from '../components/FooterWithAdminTap'
import LockedProducts from '../components/LockedProducts'

export default function Page() {
  const [authed, setAuthed] = useState(false)
  const [authStatus, setAuthStatus] = useState('idle') // idle, authenticating, verified, error

  useEffect(() => {
    const s = document.createElement('script'); s.src = 'https://sdk.minepi.com/pi-sdk.js'; s.async = true
    s.onload = () => { try { (window as any).Pi.init({ version: "2.0", sandbox: true }) } catch {} }
    document.head.appendChild(s)
  }, [])

  const handlePiAuth = async () => {
    try {
      const Pi = (window as any).Pi
      if (!Pi) return alert('Open in Pi Browser - not Chrome')
      setAuthStatus('authenticating')
      
      // With 15s timeout
      const authPromise = Pi.authenticate(["username", "payments"], (p: any) => console.log('incomplete', p))
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Auth timed out')), 15000))
      
      const auth = await Promise.race([authPromise, timeoutPromise]) as any
      
      const r = await fetch('/api/pi/appstudio-auth', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ accessToken: auth.accessToken }) 
      })
      const data = await r.json()
      if (!data.ok) throw new Error('Auth verify failed')
      
      setAuthed(true)
      setAuthStatus('verified')
      alert('Signed in with Pi - Verified!')
    } catch (e: any) {
      setAuthStatus('error')
      alert('Pi Auth failed: ' + e.message + ' - Open in Pi Browser, check App URL in Developer Portal = https://goye-web3-business-hub.vercel.app')
    }
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <header className="p-6">
        <h1 className="text-2xl font-bold">GOYE Web3 Business Hub</h1>
        <div className="flex gap-2 mt-4">
          <button onClick={handlePiAuth} className="bg-yellow-500 text-black px-4 py-2 rounded-full font-bold">
            {authStatus === 'authenticating' ? 'Authenticating...' : authed ? 'Pi Verified ✓' : 'Sign in with Pi'}
          </button>
          <button className="border border-gray-600 px-4 py-2 rounded-full">Register Business ID</button>
        </div>
      </header>
      
      <section className="p-6">
        <h2 className="text-xl font-bold mb-4">15 Products</h2>
        <LockedProducts />
      </section>

      <FooterWithAdminTap />
    </main>
  )
}
