'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'

interface PiAuthContextValue {
  piUser: any;
  ready: boolean;
  authenticate: () => Promise<any>;
}

const PiAuthContext = createContext<PiAuthContextValue>({
  piUser: null,
  ready: false,
  authenticate: async () => null,
});

export function PiAuthProvider({ children }: { children: React.ReactNode }) {
  const [piUser, setPiUser] = useState<any>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const initPi = () => {
      if (typeof window !== 'undefined' && window.Pi) {
        window.Pi.init({ version: "2.0", sandbox: true })
        setReady(true)
      } else if (typeof document !== 'undefined') {
        const s = document.createElement('script')
        s.src = 'https://sdk.minepi.com/pi-sdk.js'
        s.onload = () => {
          if (window.Pi) {
            window.Pi.init({ version: "2.0", sandbox: true })
            setReady(true)
          }
        }
        document.head.appendChild(s)
      }
    }
    initPi()

    const saved = typeof window !== 'undefined' ? localStorage.getItem('pi_user') : null
    if (saved) {
      try {
        setPiUser(JSON.parse(saved))
      } catch (_) {}
    }
  }, [])

  const authenticate = async () => {
    try {
      if (!window.Pi) throw new Error('Pi SDK not loaded')
      const auth = await window.Pi.authenticate(["username", "payments"], (payment: any) => {
        console.log("incomplete payment", payment)
      })
      console.log("Pi auth success", auth?.user?.username)
      const res = await fetch('/api/pi/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: auth.accessToken })
      })
      const data = await res.json()
      if (data.success) {
        setPiUser(data.user)
        localStorage.setItem('pi_user', JSON.stringify(data.user))
        return data.user
      }
      return auth.user
    } catch (e) {
      console.error("Pi auth failed", e)
      throw e
    }
  }

  return (
    <PiAuthContext.Provider value={{ piUser, ready, authenticate }}>
      <div data-pi-ready={ready}>
        {children}
        <div style={{ display: 'none' }} id="pi-auth-func" data-auth={authenticate.toString()} />
      </div>
    </PiAuthContext.Provider>
  )
}

export function usePiAuth() {
  return useContext(PiAuthContext)
}
