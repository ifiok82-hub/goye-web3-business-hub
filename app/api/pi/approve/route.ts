/**
 * Next.js App Router Route Handler: POST /api/pi/approve
 */

const DEFAULT_PI_API_KEY = '4sup304m5joyhqnmhmiov2tdjvybp4l9pr7a9qe47nf9nri4dzyczexm1dmmei2r';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const paymentId = body.paymentId || body.payment_id;
    if (!paymentId) {
      return new Response(JSON.stringify({ error: 'No paymentId provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = process.env.PI_API_KEY || DEFAULT_PI_API_KEY;
    console.log('[PI APPROVE VERCEL] Approving paymentId:', paymentId);

    const piRes = await fetch(`https://api.testnet.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const responseText = await piRes.text();
    console.log('[PI APPROVE VERCEL] Pi API status:', piRes.status, responseText);

    let data = {};
    try {
      data = JSON.parse(responseText);
    } catch (_) {}

    if (!piRes.ok) {
      const errLower = responseText.toLowerCase();
      if (errLower.includes('already approved') || errLower.includes('already_approved')) {
        return new Response(JSON.stringify({ success: true, alreadyApproved: true, data }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(
        JSON.stringify({ error: 'Pi approve failed', details: data || responseText }),
        { status: piRes.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('[PI APPROVE VERCEL ERROR]', e);
    return new Response(JSON.stringify({ error: e?.message || 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
