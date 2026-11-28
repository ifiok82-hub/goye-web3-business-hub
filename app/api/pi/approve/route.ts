import { NextResponse } from 'next/server';
import { getPiApiBase, getPiApiKeyOrNull } from '@/lib/piPlatform';

export async function GET() {
  return NextResponse.json({ route: '/api/pi/approve', available: true }, { status: 200 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawId = body?.paymentId || body?.payment_id;
    const paymentId = typeof rawId === 'string' ? rawId.trim() : '';

    if (!paymentId) {
      return NextResponse.json({ error: 'no paymentId' }, { status: 400 });
    }

    const apiKey = getPiApiKeyOrNull();
    const piApiBase = getPiApiBase();
    const approveUrl = `${piApiBase}/v2/payments/${encodeURIComponent(paymentId)}/approve`;
    console.log('APPROVE START', { paymentId, approveUrl, keyConfigured: Boolean(apiKey) });

    if (!apiKey) {
      console.error('PI_API_KEY MISSING ON SERVER');
      return NextResponse.json(
        { error: 'PI_API_KEY is NOT CONFIGURED on server' },
        { status: 500 }
      );
    }

    const res = await fetch(approveUrl, {
      method: 'POST',
      headers: {
        Authorization: `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });

    const rawText = await res.text();
    let parsed: any = null;
    try {
      parsed = rawText ? JSON.parse(rawText) : null;
    } catch {
      parsed = null;
    }

    console.log('APPROVE RESULT', { paymentId, status: res.status, body: rawText });

    if (!res.ok) {
      const lower = rawText.toLowerCase();
      if (lower.includes('already_approved') || lower.includes('already approved')) {
        return NextResponse.json({
          success: true,
          approved: true,
          alreadyApproved: true,
          paymentId,
        });
      }

      const errorMessage =
        parsed?.message || parsed?.error || rawText || `Pi approve failed (${res.status})`;
      return NextResponse.json(
        {
          approved: false,
          error: errorMessage,
          piStatus: res.status,
          details: parsed || rawText,
        },
        { status: res.status >= 400 && res.status < 600 ? res.status : 502 }
      );
    }

    return NextResponse.json({
      success: true,
      approved: true,
      paymentId,
      piPayment: parsed || undefined,
    });
  } catch (e: any) {
    console.error('APPROVE ERROR', e?.message || e);
    return NextResponse.json(
      { approved: false, error: e?.message || 'Approve error' },
      { status: 500 }
    );
  }
}
