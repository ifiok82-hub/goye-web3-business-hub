import { NextResponse } from 'next/server';
import { getPiApiBase, getPiApiKeyOrNull, isPiSandboxServer } from '@/lib/piPlatform';
import { markPaymentCompletedAndFulfill } from '@/lib/piPaymentsStore';
import { getProductById } from '@/lib/products';

export async function GET() {
  return NextResponse.json({ route: '/api/pi/complete', available: true }, { status: 200 });
}

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

    const apiKey = getPiApiKeyOrNull();
    const piApiBase = getPiApiBase();
    const completeUrl = `${piApiBase}/v2/payments/${encodeURIComponent(paymentId)}/complete`;
    console.log('COMPLETE START', {
      paymentId,
      txid,
      completeUrl,
      keyConfigured: Boolean(apiKey),
    });

    if (!apiKey) {
      console.error('COMPLETE: PI_API_KEY MISSING ON SERVER');
      return NextResponse.json(
        { error: 'PI_API_KEY is NOT CONFIGURED on server' },
        { status: 500 }
      );
    }

    const res = await fetch(completeUrl, {
      method: 'POST',
      headers: {
        Authorization: `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ txid }),
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });

    const data = await res.text();
    console.log('COMPLETE RESULT', { paymentId, status: res.status, body: data });

    let parsed: any = {};
    try {
      parsed = data ? JSON.parse(data) : {};
    } catch {
      parsed = {};
    }

    if (!res.ok) {
      const lower = data.toLowerCase();
      if (lower.includes('already_completed') || lower.includes('already completed')) {
        const getRes = await fetch(
          `${piApiBase}/v2/payments/${encodeURIComponent(paymentId)}`,
          {
            method: 'GET',
            headers: { Authorization: `Key ${apiKey}` },
            cache: 'no-store',
            signal: AbortSignal.timeout(8000),
          }
        ).catch(() => null);
        if (!getRes?.ok) {
          return NextResponse.json(
            {
              error: parsed?.message || parsed?.error || data || `Complete failed (${res.status})`,
              piStatus: res.status,
            },
            { status: res.status >= 400 && res.status < 600 ? res.status : 502 }
          );
        }
        parsed = await getRes.json().catch(() => ({}));
        if (!parsed?.status?.developer_completed) {
          return NextResponse.json(
            { error: 'Pi Platform has not confirmed payment completion.' },
            { status: 409 }
          );
        }
      } else {
        const errorMessage =
          parsed?.message || parsed?.error || data || `Complete failed (${res.status})`;
        return NextResponse.json(
          { error: errorMessage, piStatus: res.status, details: parsed || data },
          { status: res.status >= 400 && res.status < 600 ? res.status : 502 }
        );
      }
    }

    const serverTxid =
      typeof parsed?.transaction?.txid === 'string' && parsed.transaction.txid
        ? parsed.transaction.txid
        : txid;

    if (parsed?.transaction?.txid && parsed.transaction.txid !== txid) {
      return NextResponse.json(
        { error: 'txid mismatches verified Pi Platform payment transaction.' },
        { status: 400 }
      );
    }

    const productId =
      parsed?.metadata?.productId !== undefined ? Number(parsed.metadata.productId) : undefined;
    const product = productId && !Number.isNaN(productId) ? getProductById(productId) : undefined;
    const amount = Number(parsed?.amount || product?.price || 0);
    const userUid = typeof parsed?.user_uid === 'string' ? parsed.user_uid : 'verified_pioneer';
    const paidAt = new Date().toISOString();

    if (product) {
      await markPaymentCompletedAndFulfill({
        paymentId,
        txid: serverTxid,
        productId: product.id,
        userUid,
        amount: product.price,
        direction: String(parsed?.direction || 'user_to_app'),
      }).catch(() => undefined);
    }

    const receipt = {
      receiptId: `RCP-${paymentId.slice(0, 8).toUpperCase()}`,
      status: 'PAID',
      paymentId,
      txid: serverTxid,
      productId: product?.id ?? productId ?? null,
      productName: product?.name ?? (parsed?.memo || 'GOYE Module'),
      amount,
      network: isPiSandboxServer() ? 'testnet' : 'mainnet',
      paidAt,
    };

    return NextResponse.json({
      success: true,
      completed: true,
      fulfilled: true,
      status: 'PAID',
      paymentId,
      txid: serverTxid,
      ...(product ? { productId: product.id } : productId ? { productId } : {}),
      receipt,
    });
  } catch (e: any) {
    console.log('COMPLETE ERROR', e?.message);
    return NextResponse.json({ error: e?.message || 'Complete error' }, { status: 500 });
  }
}
