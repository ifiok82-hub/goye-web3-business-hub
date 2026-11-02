'use client'
import { useEffect } from 'react'

export default function PiAuthSilent() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.Pi) {
      const s = document.createElement('script')
      s.src = 'https://sdk.minepi.com/pi-sdk.js'
      s.onload = () => {
        window.Pi.init({ version: "2.0" })
      }
      document.head.appendChild(s)
    } else {
      window.Pi.init({ version: "2.0" })
    }
  }, [])
  return null
}
