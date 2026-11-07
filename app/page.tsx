'use client'
import { useEffect, useState } from 'react'
export default function Page(){
  const [authed,setAuthed]=useState(false)
  useEffect(()=>{
    const s=document.createElement('script'); s.src='https://sdk.minepi.com/pi-sdk.js'; s.async=true
    s.onload=()=>{ try{(window as any).Pi.init({version:"2.0", sandbox:true})}catch{} }
    document.head.appendChild(s)
  },[])
  const handlePiAuth=async()=>{
    try{
      const Pi=(window as any).Pi
      if(!Pi) return alert('Open in Pi Browser - not Chrome')
      await Pi.init({version:"2.0", sandbox:true})
      // MUST request username + payments scopes for App Studio
      const auth=await Pi.authenticate(["username","payments"], (p:any)=>console.log('incomplete',p))
      // Send ONLY accessToken to backend, backend verifies via Pi API
      const r=await fetch('/api/pi/appstudio-auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({accessToken: auth.accessToken})})
      const data=await r.json()
      if(!data.ok) throw new Error('Auth verify failed')
      setAuthed(true)
      // DO NOT show username publicly - show generic welcome
      alert('Signed in with Pi - Verified!')
    }catch(e:any){
      alert('Pi Auth failed: '+e.message+' - Open in Pi Browser, check App URL in Developer Portal = https://goye-web3-business-hub.vercel.app')
    }
  }
  return (
    <main>
      <button onClick={handlePiAuth}>Sign in with Pi</button>
      {authed && <div>Pi Verified ✓</div>}
      {/* Keep Testnet payment button FOR NOW because not migrated - label it: Pay with Pi (Testnet) - but DO NOT show username */}
      {/* Images CLEAR, not blurred */}
    </main>
  )
}
