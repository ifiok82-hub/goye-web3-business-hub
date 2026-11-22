import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { paymentId } = await req.json();
    if (!paymentId) {
      return NextResponse.json({ error: 'no paymentId' }, { status: 400 });
    }

    const apiKey = (process.env.PI_API_KEY || '').trim();
    console.log('APPROVE START', paymentId, 'KEY EXISTS?', !!apiKey);

    if (!apiKey || apiKey === 'NOT CONFIGURED') {
      console.log('PI_API_KEY MISSING');
      return NextResponse.json({ error: 'PI_API_KEY MISSING' }, { status: 500 });
    }

    const res = await fetch(
      `https://api.testnet.minepi.com/v2/payments/${encodeURIComponent(paymentId)}/approve`,
      {
        method: 'POST',
        headers: {
          Authorization: `Key ${apiKey}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(4500),
      }
    );

    const data = await res.text();
    console.log('APPROVE RESULT', res.status, data);
    if (!res.ok) {
      return NextResponse.json({ error: data }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.log('APPROVE ERROR', e?.message);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
