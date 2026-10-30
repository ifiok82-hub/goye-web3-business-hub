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
    const { paymentId, txid } = body;
    if (!paymentId || !txid) return NextResponse.json({ error: 'paymentId and txid required' }, { status: 400 });

    console.log('[PI COMPLETE] Payment:', paymentId, 'txid:', txid);

    const res = await fetch(`https://api.testnet.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ txid })
    });

    const data = await res.json().catch(() => ({}));
    console.log('[PI COMPLETE] Response:', res.status, data);

    if (!res.ok) {
      return NextResponse.json({ error: 'Pi complete failed', details: data }, { status: res.status });
    }

    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    console.error('[PI COMPLETE ERROR]', e);
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
