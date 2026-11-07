import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { accessToken } = await req.json()
    const piRes = await fetch('https://api.minepi.com/v2/me', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    const piMe = await piRes.json()
    if (!piRes.ok) return NextResponse.json({ error: 'pi me failed', details: piMe }, { status: 400 })
    return NextResponse.json({ success: true, user: piMe })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
