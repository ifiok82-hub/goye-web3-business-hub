import { NextResponse } from 'next/server'

const TESTNET_KEY = '4sup304m5joyhqnmhmiov2tdjvybp4l9pr7a9qe47nf9nri4dzyczexm1dmmei2r'

export async function POST(req: Request) {
  try {
    const { paymentId, txid } = await req.json()
    const res = await fetch(`https://api.testnet.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${TESTNET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ txid })
    })
    const data = await res.json().catch(() => ({}))
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
