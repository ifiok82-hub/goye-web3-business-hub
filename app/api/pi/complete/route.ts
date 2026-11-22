import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { paymentId, txid } = await req.json();
    if (!paymentId) {
      return NextResponse.json({ error: 'no paymentId' }, { status: 400 });
    }

    const apiKey = (process.env.PI_API_KEY || '').trim();
    console.log('COMPLETE START', paymentId, txid, 'KEY EXISTS?', !!apiKey);

    if (!apiKey || apiKey === 'NOT CONFIGURED') {
      console.log('PI_API_KEY MISSING IN VERCEL');
      return NextResponse.json({ error: 'PI_API_KEY MISSING IN VERCEL' }, { status: 500 });
    }

    const res = await fetch(
      `https://api.testnet.minepi.com/v2/payments/${encodeURIComponent(paymentId)}/complete`,
      {
        method: 'POST',
        headers: {
          Authorization: `Key ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ txid }),
        cache: 'no-store',
        signal: AbortSignal.timeout(4500),
      }
    );

    const data = await res.text();
    console.log('COMPLETE RESULT', res.status, data);
    if (!res.ok) {
      return NextResponse.json({ error: data }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.log('COMPLETE ERROR', e?.message);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
