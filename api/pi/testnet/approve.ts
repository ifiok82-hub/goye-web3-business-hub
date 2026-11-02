const TESTNET_KEY = '4sup304m5joyhqnmhmiov2tdjvybp4l9pr7a9qe47nf9nri4dzyczexm1dmmei2r';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const paymentId = body.paymentId || body.payment_id;
    if (!paymentId) return res.status(400).json({ error: 'no paymentId' });

    const piRes = await fetch(`https://api.testnet.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${TESTNET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await piRes.json().catch(() => ({}));
    if (!piRes.ok) {
      if (JSON.stringify(data).toLowerCase().includes('already approved')) {
        return res.status(200).json({ success: true, alreadyApproved: true, data });
      }
      return res.status(400).json({ error: 'approve failed', details: data });
    }

    return res.status(200).json({ success: true, data });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Server error' });
  }
}
