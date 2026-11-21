import { NextResponse } from 'next/server';
export async function POST(req: Request) {
  try {
    const { accessToken } = await req.json();
    if (!accessToken) return NextResponse.json({ error: 'Missing accessToken' }, { status: 400 });
    const res = await fetch('https://backend.appstudio-u7cm9zhmha0ruwv8.piappengine.com/pi/auth/v1/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.user?.uid) {
      return NextResponse.json({ error: 'App Studio rejected', detail: data }, { status: 401 });
    }
    return NextResponse.json({
      ok: true,
      sessionToken: data.sessionToken ?? null,
      verified: true,
      network: 'testnet',
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Auth request failed' }, { status: 500 });
  }
}
