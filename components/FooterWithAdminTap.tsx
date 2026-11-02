'use client'
import React, { useState, useRef } from 'react'

interface FooterWithAdminTapProps {
  onNavigate?: (view: string) => void;
}

export default function FooterWithAdminTap({ onNavigate }: FooterWithAdminTapProps) {
  const [tapCount, setTapCount] = useState(0)
  const timerRef = useRef<any>(null)

  const handleLogoTap = () => {
    const newCount = tapCount + 1
    setTapCount(newCount)
    console.log(`Admin tap ${newCount}/7`)

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setTapCount(0), 3000)

    if (newCount >= 7) {
      setTapCount(0)
      const secret = prompt('Enter Admin Secret:')
      if (secret === 'GoyeAdmin@2026' || secret === (process.env as any).NEXT_PUBLIC_ADMIN_SECRET) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('goye_admin', 'true')
        }
        if (onNavigate) {
          onNavigate('admin')
        } else if (typeof window !== 'undefined') {
          window.location.href = '/admin'
        }
      } else if (secret !== null) {
        alert('Wrong secret')
      }
    }
  }

  return (
    <footer className="w-full bg-black border-t border-gray-800 p-6 mt-20">
      <div className="flex flex-col items-center gap-4">
        <div onClick={handleLogoTap} className="flex items-center gap-2 cursor-pointer select-none active:scale-95 transition">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-purple-600 rounded-full flex items-center justify-center font-bold text-black shadow-lg">G</div>
          <div>
            <div className="text-white font-bold tracking-tight">GOYE <span className="bg-yellow-500 text-black px-2 py-0.5 rounded text-xs font-black">WEB3</span></div>
            <div className="text-gray-400 text-[10px] tracking-wider uppercase font-semibold">BUSINESS HUB</div>
          </div>
        </div>
        <div className="text-gray-500 text-xs">© 2026 Goye Web3 Business Hub - Pi Powered</div>
        {tapCount > 0 && tapCount < 7 && <div className="text-yellow-500 text-xs font-mono">{tapCount}/7</div>}
      </div>
    </footer>
  )
}
