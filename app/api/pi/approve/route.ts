export class NextResponse extends Response {
  static json(data: any, init?: ResponseInit) {
    return new Response(JSON.stringify(data), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const paymentId = body.paymentId || body.payment_id;
    if (!paymentId) return NextResponse.json({ error: 'No paymentId' }, { status: 400 });

    console.log('[PI APPROVE] Payment:', paymentId, 'Using new API key');

    const res = await fetch(`https://api.testnet.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    const data = await res.json().catch(() => ({}));
    console.log('[PI APPROVE] Response:', res.status, data);

    if (!res.ok) {
      return NextResponse.json({ error: 'Pi approve failed', details: data, keyUsed: 'new key 4sup304m...' }, { status: res.status });
    }

    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    console.error('[PI APPROVE ERROR]', e);
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
