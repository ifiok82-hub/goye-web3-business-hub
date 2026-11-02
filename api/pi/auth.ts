export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { accessToken } = body;
    if (!accessToken) return res.status(400).json({ error: 'no token' });

    const piRes = await fetch('https://api.minepi.com/v2/me', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const piMe = await piRes.json();
    if (!piRes.ok) return res.status(400).json({ error: 'pi me failed', details: piMe });

    return res.status(200).json({ success: true, user: piMe });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Server error' });
  }
}
