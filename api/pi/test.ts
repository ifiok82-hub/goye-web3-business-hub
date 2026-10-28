/**
 * Vercel Serverless Function: GET /api/pi/test
 */
export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  res.status(200).json({
    ok: true,
    hasApiKey: !!process.env.PI_API_KEY,
    wallet: process.env.PI_WALLET_PUBLIC ? 'set' : 'missing'
  });
}
