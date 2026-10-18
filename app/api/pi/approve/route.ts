/**
 * Next.js App Router compatible Route Handler
 * POST /api/pi/approve
 * Approves a payment with the Pi Platform API within 10 seconds.
 */

// Next.js Web API types & polyfill for non-Next runtimes
export type NextRequest = Request;

export class NextResponse extends Response {
  static json(data: any, init?: ResponseInit) {
    return new Response(JSON.stringify(data), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
    });
  }
}

const PI_BASE =
  (process.env.PI_NETWORK_MODE || '').toUpperCase() === 'MAINNET' && process.env.PI_SANDBOX !== 'true'
    ? 'https://api.minepi.com'
    : 'https://api.testnet.minepi.com';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const paymentId = body.paymentId || body.payment_id;

    if (!paymentId || typeof paymentId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid paymentId is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.PI_API_KEY;
    if (!apiKey) {
      console.error('[App Router Pi Approve] PI_API_KEY is not configured');
      return NextResponse.json(
        { success: false, error: 'PI_API_KEY is not configured on server' },
        { status: 503 }
      );
    }

    console.log(`[App Router Pi Approve] Approving payment ${paymentId} via ${PI_BASE}...`);

    const piRes = await fetch(`${PI_BASE}/v2/payments/${paymentId.trim()}/approve`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${apiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(8000),
    });

    if (!piRes.ok) {
      const errText = await piRes.text();
      console.error(`[App Router Pi Approve] Failed (${piRes.status}):`, errText);
      return NextResponse.json(
        { success: false, error: 'Pi server rejected approval', details: errText },
        { status: piRes.status }
      );
    }

    const data = await piRes.json();
    console.log(`[App Router Pi Approve] SUCCESS for payment ${paymentId}`);

    return NextResponse.json({
      success: true,
      status: 'APPROVED',
      payment: data,
    });
  } catch (err: any) {
    console.error('[App Router Pi Approve] Network/Execution error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Server approval error' },
      { status: 500 }
    );
  }
}
