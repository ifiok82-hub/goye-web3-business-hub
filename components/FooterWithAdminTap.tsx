'use client'
import React, { useState, useRef } from 'react'

interface FooterWithAdminTapProps {
  onNavigate?: (view: string) => void;
}

export default function FooterWithAdminTap({ onNavigate }: FooterWithAdminTapProps) {
  const [tapCount, setTapCount] = useState(0)
  const timerRef = useRef<any>(null)

  const handleTap = () => {
    const newCount = tapCount + 1
    setTapCount(newCount)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setTapCount(0), 3000)
    if (newCount >= 7) {
      setTapCount(0)
      const secret = prompt('Enter Admin Secret:')
      if (secret === 'GoyeAdmin@2026') {
        if (typeof window !== 'undefined') {
          localStorage.setItem('goye_admin', 'true')
        }
        if (onNavigate) {
          onNavigate('admin')
        } else if (typeof window !== 'undefined') {
          window.location.href = '/admin'
        }
      } else if (secret !== null) {
        alert('Wrong')
      }
    }
  }

  return (
    <footer className="w-full bg-black border-t border-gray-800 p-6 mt-20">
      <div className="flex flex-col items-center gap-2">
        <div onClick={handleTap} className="flex items-center gap-2 cursor-pointer select-none active:scale-95">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-purple-600 rounded-full flex items-center justify-center font-bold text-black text-lg">G</div>
          <div>
            <div className="text-white font-bold text-sm">GOYE WEB3 BUSINESS HUB</div>
            <div className="text-gray-500 text-xs">Pi Powered</div>
          </div>
        </div>
        {tapCount > 0 && tapCount < 7 && <div className="text-yellow-500 text-xs font-mono">{tapCount}/7</div>}
      </div>
    </footer>
  )
}
