'use client'
import { useEffect } from 'react'

export default function PiAuthSilent() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const init = () => {
      if ((window as any).Pi) {
        (window as any).Pi.init({ version: "2.0" })
      } else {
        const s = document.createElement('script')
        s.src = 'https://sdk.minepi.com/pi-sdk.js'
        s.onload = () => (window as any).Pi.init({ version: "2.0" })
        document.head.appendChild(s)
      }
    }
    init()
  }, [])
  return null
}
