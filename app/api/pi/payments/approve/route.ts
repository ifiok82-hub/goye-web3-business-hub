import {NextResponse} from 'next/server'
export async function POST(req:Request){
  try{
    const {paymentId}=await req.json()
    if(!paymentId) return NextResponse.json({error:'No paymentId'},{status:400})
    const res=await fetch(`https://api.testnet.minepi.com/v2/payments/${paymentId}/approve`,{
        method:'POST',
        headers:{
            'Authorization':`Key ${process.env.PI_API_KEY}`,
            'Content-Type':'application/json'
        }
    })
    if(!res.ok) return NextResponse.json({error:'Approve failed'},{status:res.status})
    return NextResponse.json({ok:true})
  }catch(e:any){ return NextResponse.json({error:e.message},{status:500}) }
}
