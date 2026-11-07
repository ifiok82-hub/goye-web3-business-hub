import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { paymentId } = await req.json()
    const apiKey = process.env.PI_API_KEY
    const res = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: { 'Authorization': `Key ${apiKey}` }
    })
    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: 'approve failed', details: data }, { status: 400 })
    return NextResponse.json({ success: true, data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
