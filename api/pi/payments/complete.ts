export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const paymentId = body.paymentId || body.payment_id;
    const txid = body.txid || body.transactionId;
    const apiKey = process.env.PI_API_KEY;

    const piRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ txid })
    });

    const data = await piRes.json().catch(() => ({}));
    if (!piRes.ok) {
      if (JSON.stringify(data).toLowerCase().includes('already completed')) {
        return res.status(200).json({ success: true, alreadyCompleted: true, data });
      }
      return res.status(400).json({ error: 'complete failed', details: data });
    }

    return res.status(200).json({ success: true, data });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Server error' });
  }
}
