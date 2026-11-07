import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { paymentId, txid } = await req.json()
    const apiKey = process.env.PI_API_KEY
    const res = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: { 'Authorization': `Key ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ txid })
    })
    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: 'complete failed', details: data }, { status: 400 })
    return NextResponse.json({ success: true, data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
