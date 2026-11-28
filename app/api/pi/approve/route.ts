import { NextResponse } from 'next/server';
import { getPiApiBase, getPiApiKeyOrNull } from '@/lib/piPlatform';

export async function GET() {
  return NextResponse.json({ route: '/api/pi/approve', available: true }, { status: 200 });
}

export async function POST(req: Request) {
  const startedAt = Date.now();
  try {
    const body = await req.json().catch(() => ({}));
    const rawId = body?.paymentId || body?.payment_id;
    const paymentId = typeof rawId === 'string' ? rawId.trim() : '';

    if (!paymentId) {
      return NextResponse.json({ error: 'paymentId is required' }, { status: 400 });
    }

    const apiKey = getPiApiKeyOrNull();
    if (!apiKey) {
      console.error('APPROVE ERROR: PI_API_KEY is not configured on server');
      return NextResponse.json(
        { approved: false, error: 'PI_API_KEY is not configured on server' },
        { status: 500 }
      );
    }

    const piApiBase = getPiApiBase();
    const approveUrl = `${piApiBase}/v2/payments/${encodeURIComponent(paymentId)}/approve`;
    console.log('APPROVE START', { paymentId, approveUrl });

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

    console.log('APPROVE RESULT', {
      paymentId,
      status: res.status,
      ms: Date.now() - startedAt,
      body: rawText,
    });

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

      const piMessage =
        parsed?.message || parsed?.error || rawText || `Pi approve failed (${res.status})`;
      return NextResponse.json(
        {
          approved: false,
          error: `Pi API ${res.status}: ${piMessage}`,
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
    console.error('APPROVE EXCEPTION', {
      ms: Date.now() - startedAt,
      error: e?.message || e,
    });
    return NextResponse.json(
      { approved: false, error: e?.message || 'Approve request failed on server' },
      { status: 500 }
    );
  }
}
