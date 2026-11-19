import {NextResponse} from 'next/server'
export async function POST(req:Request){
  try{
    const {paymentId, txid}=await req.json()
    if(!paymentId || !txid) return NextResponse.json({error:'Missing data'},{status:400})
    const res=await fetch(`https://api.testnet.minepi.com/v2/payments/${paymentId}/complete`,{
        method:'POST',
        headers:{
            'Authorization':`Key ${process.env.PI_API_KEY}`,
            'Content-Type':'application/json'
        },
        body: JSON.stringify({txid})
    })
    if(!res.ok) return NextResponse.json({error:'Complete failed'},{status:res.status})
    return NextResponse.json({ok:true})
  }catch(e:any){ return NextResponse.json({error:e.message},{status:500}) }
}
