export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { accessToken } = body;
    if (!accessToken) return res.status(400).json({ error: 'Missing accessToken' });

    const response = await fetch('https://backend.appstudio-u7cm9zhmha0ruwv8.piappengine.com/pi/auth/v1/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('[Pi Auth] App Studio failed', data);
      return res.status(response.status).json({ error: 'Auth validation failed', details: data });
    }

    const { sessionToken, user } = data;

    res.setHeader('Set-Cookie', [
      `pi_session=${sessionToken}; Path=/; Max-Age=604800; Secure; SameSite=None; HttpOnly`,
      `pi_user=${encodeURIComponent(JSON.stringify({ uid: user.uid, username: user.username }))}; Path=/; Max-Age=604800; Secure; SameSite=None`
    ]);

    return res.status(200).json({
      success: true,
      user: { uid: user.uid, username: user.username },
      sessionToken
    });
  } catch (err: any) {
    console.error('[Pi Auth Vercel Error]', err);
    return res.status(500).json({ error: err.message });
  }
}
