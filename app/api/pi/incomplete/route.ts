import { NextResponse } from 'next/server';

const PI_TESTNET_API_BASE = 'https://api.testnet.minepi.com';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawId =
      body?.paymentId || body?.payment_id || body?.payment?.identifier || body?.identifier;
    const paymentId = typeof rawId === 'string' ? rawId.trim() : '';

    if (!paymentId) {
      return NextResponse.json({ error: 'paymentId is required' }, { status: 400 });
    }

    const apiKey = (process.env.PI_API_KEY || process.env.PI_NETWORK_API_KEY || '').trim();
    if (!apiKey || apiKey === 'NOT CONFIGURED') {
      console.log('PI_API_KEY MISSING IN VERCEL');
      return NextResponse.json({ error: 'PI_API_KEY MISSING IN VERCEL' }, { status: 500 });
    }

    const headers = {
      Authorization: `Key ${apiKey}`,
      'Content-Type': 'application/json',
    };

    const getRes = await fetch(
      `${PI_TESTNET_API_BASE}/v2/payments/${encodeURIComponent(paymentId)}`,
      { method: 'GET', headers, cache: 'no-store', signal: AbortSignal.timeout(8000) }
    );

    if (!getRes.ok) {
      const errText = await getRes.text().catch(() => '');
      return NextResponse.json(
        { error: errText || `Failed to inspect payment (${getRes.status})` },
        { status: getRes.status }
      );
    }

    const payment = await getRes.json();
    if (payment?.status?.cancelled || payment?.status?.user_cancelled) {
      return NextResponse.json({ success: true, status: 'cancelled', paymentId });
    }

    const txid = payment?.transaction?.txid || body?.txid;
    const productId =
      payment?.metadata?.productId !== undefined ? Number(payment.metadata.productId) : undefined;

    if (txid) {
      if (!payment?.status?.developer_approved) {
        await fetch(
          `${PI_TESTNET_API_BASE}/v2/payments/${encodeURIComponent(paymentId)}/approve`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({}),
            cache: 'no-store',
            signal: AbortSignal.timeout(8000),
          }
        ).catch(() => undefined);
      }

      const compRes = await fetch(
        `${PI_TESTNET_API_BASE}/v2/payments/${encodeURIComponent(paymentId)}/complete`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ txid }),
          cache: 'no-store',
          signal: AbortSignal.timeout(8000),
        }
      );

      if (!compRes.ok) {
        const compErr = await compRes.text().catch(() => '');
        if (!compErr.toLowerCase().includes('already')) {
          return NextResponse.json({ error: compErr || 'Complete failed' }, { status: 500 });
        }
      }

      return NextResponse.json({
        success: true,
        fulfilled: true,
        status: 'completed',
        paymentId,
        txid,
        ...(productId && !Number.isNaN(productId) ? { productId } : {}),
      });
    }

    await fetch(
      `${PI_TESTNET_API_BASE}/v2/payments/${encodeURIComponent(paymentId)}/cancel`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      }
    ).catch(() => undefined);

    return NextResponse.json({ success: true, fulfilled: false, status: 'cancelled', paymentId });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Incomplete recovery failed' }, { status: 500 });
  }
}
