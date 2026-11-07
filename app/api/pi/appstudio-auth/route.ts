import {NextResponse} from 'next/server'
export async function POST(req:Request){
  try{
    const {accessToken}=await req.json()
    if(!accessToken) return NextResponse.json({error:'No token'},{status:400})
    const res=await fetch('https://api.testnet.minepi.com/v2/me',{headers:{Authorization:`Bearer ${accessToken}`}})
    if(!res.ok) return NextResponse.json({error:'Invalid token'},{status:401})
    const me=await res.json()
    return NextResponse.json({ok:true, uid:me.uid, username:me.username})
  }catch(e:any){ return NextResponse.json({error:e.message},{status:500}) }
}
