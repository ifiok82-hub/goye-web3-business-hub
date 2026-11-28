import { NextResponse } from 'next/server';
import { getPiApiBase, getPiApiKeyOrNull } from '@/lib/piPlatform';
import { markPaymentCompletedAndFulfill } from '@/lib/piPaymentsStore';
import { getProductById } from '@/lib/products';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawId =
      body?.paymentId || body?.payment_id || body?.payment?.identifier || body?.identifier;
    const paymentId = typeof rawId === 'string' ? rawId.trim() : '';

    if (!paymentId) {
      return NextResponse.json({ error: 'paymentId is required' }, { status: 400 });
    }

    const apiKey = getPiApiKeyOrNull();
    if (!apiKey) {
      console.log('PI_API_KEY MISSING IN VERCEL');
      return NextResponse.json({ error: 'PI_API_KEY is NOT CONFIGURED on server' }, { status: 500 });
    }

    const piApiBase = getPiApiBase();
    const headers = {
      Authorization: `Key ${apiKey}`,
      'Content-Type': 'application/json',
    };

    const getRes = await fetch(
      `${piApiBase}/v2/payments/${encodeURIComponent(paymentId)}`,
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
    const product = productId && !Number.isNaN(productId) ? getProductById(productId) : undefined;

    if (txid) {
      if (!payment?.status?.developer_approved) {
        await fetch(
          `${piApiBase}/v2/payments/${encodeURIComponent(paymentId)}/approve`,
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
        `${piApiBase}/v2/payments/${encodeURIComponent(paymentId)}/complete`,
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

      if (product) {
        await markPaymentCompletedAndFulfill({
          paymentId,
          txid,
          productId: product.id,
          userUid: String(payment?.user_uid || 'verified_pioneer'),
          amount: product.price,
          direction: String(payment?.direction || 'user_to_app'),
        }).catch(() => undefined);
      }

      return NextResponse.json({
        success: true,
        fulfilled: true,
        status: 'completed',
        paymentId,
        txid,
        ...(product ? { productId: product.id } : productId ? { productId } : {}),
      });
    }

    await fetch(
      `${piApiBase}/v2/payments/${encodeURIComponent(paymentId)}/cancel`,
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
