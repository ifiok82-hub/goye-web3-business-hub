/**
 * Vercel Serverless Function: POST /api/pi/approve
 */
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const body = req.body || {};
    const paymentId = body.paymentId;
    if (!paymentId) return res.status(400).json({ error: 'No paymentId' });

    const apiKey = process.env.PI_API_KEY;
    console.log('Approving', paymentId, 'with key', apiKey ? 'present' : 'missing');

    const piRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey || ''}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    const text = await piRes.text();
    console.log('Pi approve response:', piRes.status, text);

    if (piRes.ok) {
      let data = {};
      try { data = JSON.parse(text); } catch (_) {}
      return res.status(200).json({ approved: true, paymentId, ...data });
    } else {
      return res.status(200).json({ approved: false, error: text, status: piRes.status });
    }
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ approved: false, error: e?.message || 'Server error' });
  }
}
