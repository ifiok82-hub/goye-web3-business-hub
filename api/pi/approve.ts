/**
 * Vercel Serverless Function: POST /api/pi/approve
 */
const DEFAULT_PI_API_KEY = '4sup304m5joyhqnmhmiov2tdjvybp4l9pr7a9qe47nf9nri4dzyczexm1dmmei2r';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const body = req.body || {};
    const paymentId = body.paymentId || body.payment_id;
    if (!paymentId) return res.status(400).json({ error: 'No paymentId' });

    const apiKey = process.env.PI_API_KEY || DEFAULT_PI_API_KEY;
    console.log('[PI APPROVE FN] Approving payment:', paymentId);

    const piRes = await fetch(`https://api.testnet.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    const text = await piRes.text();
    console.log('[PI APPROVE FN] Response:', piRes.status, text);

    if (piRes.ok) {
      let data = {};
      try { data = JSON.parse(text); } catch (_) {}
      return res.status(200).json({ success: true, paymentId, ...data });
    } else {
      const errLower = text.toLowerCase();
      if (errLower.includes('already approved') || errLower.includes('already_approved')) {
        return res.status(200).json({ success: true, alreadyApproved: true });
      }
      return res.status(piRes.status).json({ success: false, error: text });
    }
  } catch (e: any) {
    console.error('[PI APPROVE FN ERROR]', e);
    return res.status(500).json({ success: false, error: e?.message || 'Server error' });
  }
}
