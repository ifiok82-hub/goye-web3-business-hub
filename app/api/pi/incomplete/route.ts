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
      console.error('INCOMPLETE: PI_API_KEY MISSING ON SERVER');
      return NextResponse.json(
        { error: 'PI_API_KEY is NOT CONFIGURED on server' },
        { status: 500 }
      );
    }

    const piApiBase = getPiApiBase();
    const headers = {
      Authorization: `Key ${apiKey}`,
      'Content-Type': 'application/json',
    };

    console.log('INCOMPLETE START', { paymentId, piApiBase });

    const getRes = await fetch(
      `${piApiBase}/v2/payments/${encodeURIComponent(paymentId)}`,
      { method: 'GET', headers, cache: 'no-store', signal: AbortSignal.timeout(8000) }
    );

    if (!getRes.ok) {
      const errText = await getRes.text().catch(() => '');
      console.error('INCOMPLETE GET FAILED', { paymentId, status: getRes.status, errText });
      return NextResponse.json(
        { error: errText || `Failed to inspect payment (${getRes.status})` },
        { status: getRes.status >= 400 && getRes.status < 600 ? getRes.status : 502 }
      );
    }

    const payment = await getRes.json();
    console.log('INCOMPLETE STATUS', {
      paymentId,
      status: payment?.status,
      hasTxid: Boolean(payment?.transaction?.txid),
    });

    if (payment?.status?.cancelled || payment?.status?.user_cancelled) {
      return NextResponse.json({ success: true, status: 'cancelled', fulfilled: false, paymentId });
    }

    const txid = payment?.transaction?.txid || body?.txid;
    const productId =
      payment?.metadata?.productId !== undefined ? Number(payment.metadata.productId) : undefined;
    const product = productId && !Number.isNaN(productId) ? getProductById(productId) : undefined;

    if (txid) {
      if (!payment?.status?.developer_approved) {
        const appRes = await fetch(
          `${piApiBase}/v2/payments/${encodeURIComponent(paymentId)}/approve`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({}),
            cache: 'no-store',
            signal: AbortSignal.timeout(8000),
          }
        ).catch(() => null);
        console.log('INCOMPLETE APPROVE', { paymentId, status: appRes?.status });
      }

      if (!payment?.status?.developer_completed) {
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
        const compText = await compRes.text().catch(() => '');
        console.log('INCOMPLETE COMPLETE', { paymentId, status: compRes.status, compText });

        if (!compRes.ok && !compText.toLowerCase().includes('already')) {
          return NextResponse.json(
            { error: compText || `Complete failed (${compRes.status})` },
            { status: compRes.status >= 400 && compRes.status < 600 ? compRes.status : 502 }
          );
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

    const cancelRes = await fetch(
      `${piApiBase}/v2/payments/${encodeURIComponent(paymentId)}/cancel`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      }
    );
    const cancelText = await cancelRes.text().catch(() => '');
    console.log('INCOMPLETE CANCEL', { paymentId, status: cancelRes.status, cancelText });

    return NextResponse.json({
      success: cancelRes.ok || cancelRes.status === 400 || cancelRes.status === 404,
      fulfilled: false,
      status: 'cancelled',
      paymentId,
    });
  } catch (e: any) {
    console.error('INCOMPLETE ERROR', e?.message || e);
    return NextResponse.json({ error: e?.message || 'Incomplete recovery failed' }, { status: 500 });
  }
}
