/**
 * Next.js App Router compatible Route Handler
 * POST /api/pi/complete
 * Completes a payment with the Pi Platform API after user signs on blockchain.
 */

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
    const txid = body.txid || body.txId || body.transaction_id;

    if (!paymentId || !txid) {
      return NextResponse.json(
        { success: false, error: 'Both paymentId and txid are required for completion' },
        { status: 400 }
      );
    }

    const apiKey = process.env.PI_API_KEY;
    if (!apiKey) {
      console.error('[App Router Pi Complete] PI_API_KEY is not configured');
      return NextResponse.json(
        { success: false, error: 'PI_API_KEY is not configured on server' },
        { status: 503 }
      );
    }

    console.log(`[App Router Pi Complete] Completing payment ${paymentId} (txid: ${txid}) via ${PI_BASE}...`);

    const piRes = await fetch(`${PI_BASE}/v2/payments/${paymentId.trim()}/complete`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${apiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ txid: txid.trim() }),
      signal: AbortSignal.timeout(8000),
    });

    if (!piRes.ok) {
      const errText = await piRes.text();
      console.error(`[App Router Pi Complete] Failed (${piRes.status}):`, errText);
      return NextResponse.json(
        { success: false, error: 'Pi server rejected completion', details: errText },
        { status: piRes.status }
      );
    }

    const data = await piRes.json();
    console.log(`[App Router Pi Complete] SUCCESS for payment ${paymentId}`);

    // TODO: Fulfill order in DB (handled by GOYE database adapter)

    return NextResponse.json({
      success: true,
      verified: true,
      status: 'COMPLETED',
      payment: data,
    });
  } catch (err: any) {
    console.error('[App Router Pi Complete] Network/Execution error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Server completion error' },
      { status: 500 }
    );
  }
}
