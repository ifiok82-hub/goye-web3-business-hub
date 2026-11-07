const DEFAULT_KEY = '4sup304m5joyhqnmhmiov2tdjvybp4l9pr7a9qe47nf9nri4dzyczexm1dmmei2r'

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const paymentId = body.paymentId || body.payment_id;
    const txid = body.txid || body.transactionId;
    if (!paymentId) return res.status(400).json({ error: 'no paymentId' });

    const apiKey = process.env.PI_API_KEY || DEFAULT_KEY;
    console.log(`Completing payment ${paymentId} with txid ${txid}...`);

    const piRes = await fetch(`https://api.testnet.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ txid })
    });

    const data = await piRes.json().catch(() => ({}));
    console.log('Complete result', data);

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
