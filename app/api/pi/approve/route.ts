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

const DEFAULT_PI_API_KEY = '4sup304m5joyhqnmhmiov2tdjvybp4l9pr7a9qe47nf9nri4dzyczexm1dmmei2r';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const paymentId = body.paymentId || body.payment_id;
    if (!paymentId) return NextResponse.json({ error: 'No paymentId' }, { status: 400 });

    const apiKey = process.env.PI_API_KEY || DEFAULT_PI_API_KEY;
    console.log('[PI APPROVE] Payment:', paymentId, 'Using API key length:', apiKey?.length);

    const res = await fetch(`https://api.testnet.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    const data = await res.json().catch(() => ({}));
    console.log('[PI APPROVE] Response:', res.status, data);

    if (!res.ok) {
      return NextResponse.json({ error: 'Pi approve failed', details: data }, { status: res.status });
    }

    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    console.error('[PI APPROVE ERROR]', e);
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
