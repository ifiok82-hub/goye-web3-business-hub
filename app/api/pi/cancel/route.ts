import { NextResponse } from 'next/server';
import { getPiApiBase, getPiApiKeyOrNull } from '@/lib/piPlatform';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawId = body?.paymentId || body?.payment_id;
    const paymentId = typeof rawId === 'string' ? rawId.trim() : '';

    if (!paymentId) {
      return NextResponse.json({ error: 'no paymentId' }, { status: 400 });
    }

    const apiKey = getPiApiKeyOrNull();
    console.log('CANCEL START', paymentId, 'KEY EXISTS?', !!apiKey);

    if (!apiKey) {
      console.log('PI_API_KEY MISSING IN VERCEL');
      return NextResponse.json({ error: 'PI_API_KEY is NOT CONFIGURED on server' }, { status: 500 });
    }

    const piApiBase = getPiApiBase();
    const res = await fetch(
      `${piApiBase}/v2/payments/${encodeURIComponent(paymentId)}/cancel`,
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
