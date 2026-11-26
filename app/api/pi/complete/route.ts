import { NextResponse } from 'next/server';

const PI_TESTNET_API_BASE = 'https://api.testnet.minepi.com';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawId = body?.paymentId || body?.payment_id;
    const paymentId = typeof rawId === 'string' ? rawId.trim() : '';
    const txid = typeof body?.txid === 'string' ? body.txid.trim() : '';

    if (!paymentId) {
      return NextResponse.json({ error: 'no paymentId' }, { status: 400 });
    }
    if (!txid) {
      return NextResponse.json({ error: 'no txid' }, { status: 400 });
    }

    const apiKey = (process.env.PI_API_KEY || process.env.PI_NETWORK_API_KEY || '').trim();
    console.log('COMPLETE START', paymentId, txid, 'KEY EXISTS?', !!apiKey);

    if (!apiKey || apiKey === 'NOT CONFIGURED') {
      console.log('PI_API_KEY MISSING IN VERCEL');
      return NextResponse.json({ error: 'PI_API_KEY MISSING IN VERCEL' }, { status: 500 });
    }

    const res = await fetch(
      `${PI_TESTNET_API_BASE}/v2/payments/${encodeURIComponent(paymentId)}/complete`,
      {
        method: 'POST',
        headers: {
          Authorization: `Key ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ txid }),
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      }
    );

    const data = await res.text();
    console.log('COMPLETE RESULT', res.status, data);

    if (!res.ok) {
      if (data.toLowerCase().includes('already')) {
        return NextResponse.json({ success: true, alreadyCompleted: true, paymentId, txid });
      }
      return NextResponse.json({ error: data }, { status: res.status >= 400 && res.status < 600 ? res.status : 500 });
    }

    let parsed: any = {};
    try {
      parsed = data ? JSON.parse(data) : {};
    } catch {
      parsed = {};
    }
    const productId =
      parsed?.metadata?.productId !== undefined ? Number(parsed.metadata.productId) : undefined;

    return NextResponse.json({
      success: true,
      paymentId,
      txid,
      ...(productId && !Number.isNaN(productId) ? { productId } : {}),
    });
  } catch (e: any) {
    console.log('COMPLETE ERROR', e?.message);
    return NextResponse.json({ error: e?.message || 'Complete error' }, { status: 500 });
  }
}
