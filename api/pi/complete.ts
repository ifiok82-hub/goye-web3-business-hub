/**
 * Vercel Serverless Function: POST /api/pi/complete
 */
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const body = req.body || {};
    const { paymentId, txid } = body;
    const apiKey = process.env.PI_API_KEY;

    if (!paymentId || !txid) {
      return res.status(400).json({ completed: false, error: 'paymentId and txid required' });
    }

    const piRes = await fetch(`https://api.testnet.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey || ''}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ txid })
    });

    const data = await piRes.text();
    console.log('Complete:', piRes.status, data);

    if (piRes.ok) {
      let json = {};
      try { json = JSON.parse(data); } catch (_) {}
      return res.status(200).json({ completed: true, payment: json });
    } else {
      return res.status(400).json({ completed: false, error: data });
    }
  } catch (e: any) {
    return res.status(500).json({ completed: false, error: e?.message || 'Server error' });
  }
}
