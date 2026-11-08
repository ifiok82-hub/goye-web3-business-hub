/**
 * Next.js Pages Router compatible API Route
 * POST /api/pi/complete
 */

import type { IncomingMessage, ServerResponse } from 'http';

interface NextApiRequest extends IncomingMessage {
  body: any;
  query: Record<string, string | string[]>;
  method?: string;
}

interface NextApiResponse extends ServerResponse {
  status: (statusCode: number) => NextApiResponse;
  json: (data: any) => void;
  send: (body: any) => void;
}

const PI_BASE =
  (process.env.PI_NETWORK_MODE || '').toUpperCase() === 'MAINNET' && process.env.PI_SANDBOX !== 'true'
    ? 'https://api.minepi.com'
    : 'https://api.testnet.minepi.com';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const paymentId = req.body?.paymentId || req.body?.payment_id;
  const txid = req.body?.txid || req.body?.txId || req.body?.transaction_id;

  if (!paymentId || !txid) {
    return res.status(400).json({ success: false, error: 'Both paymentId and txid are required' });
  }

  const apiKey = process.env.PI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ success: false, error: 'PI_API_KEY is not configured on server' });
  }

  try {
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
      return res.status(piRes.status).json({ success: false, error: errText });
    }

    const data = await piRes.json();
    return res.status(200).json({ success: true, verified: true, status: 'COMPLETED', payment: data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Completion error' });
  }
}
