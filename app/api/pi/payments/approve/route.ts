import { NextResponse } from 'next/server'

const DEFAULT_KEY = '4sup304m5joyhqnmhmiov2tdjvybp4l9pr7a9qe47nf9nri4dzyczexm1dmmei2r'

export async function POST(req: Request) {
  try {
    const { paymentId } = await req.json()
    if (!paymentId) return NextResponse.json({ error: 'no paymentId' }, { status: 400 })
    const apiKey = process.env.PI_API_KEY || DEFAULT_KEY
    console.log(`Approving payment ${paymentId} with key ${apiKey.substring(0, 10)}...`)
    const res = await fetch(`https://api.testnet.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })
    const data = await res.json()
    console.log('Approve result', data)
    if (!res.ok) {
      if (JSON.stringify(data).toLowerCase().includes('already approved')) {
        return NextResponse.json({ success: true, alreadyApproved: true, data })
      }
      return NextResponse.json({ error: 'approve failed', details: data, status: res.status }, { status: 400 })
    }
    return NextResponse.json({ success: true, data })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 })
  }
}
