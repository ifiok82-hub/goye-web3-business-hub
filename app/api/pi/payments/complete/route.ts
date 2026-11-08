import { NextResponse } from 'next/server'

const DEFAULT_KEY = '4sup304m5joyhqnmhmiov2tdjvybp4l9pr7a9qe47nf9nri4dzyczexm1dmmei2r'

export async function POST(req: Request) {
  try {
    const { paymentId, txid } = await req.json()
    if (!paymentId) return NextResponse.json({ error: 'no paymentId' }, { status: 400 })
    const apiKey = process.env.PI_API_KEY || DEFAULT_KEY
    console.log(`Completing payment ${paymentId} with txid ${txid}...`)
    const res = await fetch(`https://api.testnet.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ txid })
    })
    const data = await res.json().catch(() => ({}))
    console.log('Complete result', data)
    if (!res.ok) {
      if (JSON.stringify(data).toLowerCase().includes('already completed')) {
        return NextResponse.json({ success: true, alreadyCompleted: true, data })
      }
      return NextResponse.json({ error: 'complete failed', details: data }, { status: 400 })
    }
    return NextResponse.json({ success: true, data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 })
  }
}
