import { NextResponse } from 'next/server';

const PI_TESTNET_API_BASE = 'https://api.testnet.minepi.com';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawId = body?.paymentId || body?.payment_id;
    const paymentId = typeof rawId === 'string' ? rawId.trim() : '';

    if (!paymentId) {
      return NextResponse.json({ error: 'no paymentId' }, { status: 400 });
    }

    const apiKey = (process.env.PI_API_KEY || process.env.PI_NETWORK_API_KEY || '').trim();
    console.log('CANCEL START', paymentId, 'KEY EXISTS?', !!apiKey);

    if (!apiKey || apiKey === 'NOT CONFIGURED') {
      console.log('PI_API_KEY MISSING IN VERCEL');
      return NextResponse.json({ error: 'PI_API_KEY MISSING IN VERCEL' }, { status: 500 });
    }

    const res = await fetch(
      `${PI_TESTNET_API_BASE}/v2/payments/${encodeURIComponent(paymentId)}/cancel`,
      {
        method: 'POST',
        headers: {
          Authorization: `Key ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      }
    );

    const data = await res.text();
    console.log('CANCEL RESULT', res.status, data);

    if (!res.ok && res.status !== 400 && res.status !== 404) {
      return NextResponse.json({ error: data }, { status: 500 });
    }
    return NextResponse.json({ success: true, cancelled: true, paymentId });
  } catch (e: any) {
    console.log('CANCEL ERROR', e?.message);
    return NextResponse.json({ error: e?.message || 'Cancel error' }, { status: 500 });
  }
}
