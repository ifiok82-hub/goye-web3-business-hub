import { NextResponse } from 'next/server';

const PI_TESTNET_API_BASE = 'https://api.testnet.minepi.com';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawId = body?.paymentId || body?.payment_id;
    const paymentId = typeof rawId === 'string' ? rawId.trim() : '';

    if (!paymentId) {
      return NextResponse.json({ error: 'paymentId is required.' }, { status: 400 });
    }

    console.log('APPROVE', paymentId);

    const apiKey = (process.env.PI_API_KEY || process.env.PI_NETWORK_API_KEY || '').trim();
    if (!apiKey || apiKey === 'NOT CONFIGURED') {
      return NextResponse.json(
        { error: 'PI_API_KEY (Testnet) is not configured on the server.' },
        { status: 503 }
      );
    }

    const res = await fetch(
      `${PI_TESTNET_API_BASE}/v2/payments/${encodeURIComponent(paymentId)}/approve`,
      {
        method: 'POST',
        headers: {
          Authorization: `Key ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
        cache: 'no-store',
        signal: AbortSignal.timeout(4500),
      }
    );

    const text = await res.text();
    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }

    if (!res.ok) {
      const msg = String(data?.message || data?.error || '');
      if (msg.toLowerCase().includes('already')) {
        return NextResponse.json({ success: true, alreadyApproved: true, paymentId }, { status: 200 });
      }
      console.error('APPROVE FAILED', paymentId, res.status, data);
      return NextResponse.json(
        {
          error: msg || `Pi Testnet approve failed (${res.status})`,
          details: data,
        },
        { status: res.status >= 400 && res.status < 600 ? res.status : 502 }
      );
    }

    return NextResponse.json({ success: true, paymentId, payment: data }, { status: 200 });
  } catch (err: any) {
    console.error('APPROVE ERROR', err?.message || err);
    return NextResponse.json(
      { error: err?.message || 'Unexpected error during Pi payment approval.' },
      { status: 500 }
    );
  }
}
