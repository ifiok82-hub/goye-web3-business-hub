import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { accessToken } = await req.json()
  const response = await fetch('https://backend.appstudio-u7cm9zhmha0ruwv8.piappengine.com/pi/auth/v1/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken })
  })
  const data = await response.json()
  if (!response.ok) return NextResponse.json({ error: 'failed', details: data }, { status: 400 })
  return NextResponse.json({ success: true, user: data.user, sessionToken: data.sessionToken })
}
