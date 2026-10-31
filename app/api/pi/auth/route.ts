export class NextResponse extends Response {
  static json(data: any, init?: ResponseInit) {
    return new Response(JSON.stringify(data), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
    });
  }
}

export async function POST(req: Request) {
  try {
    const { accessToken } = await req.json();
    if (!accessToken) return NextResponse.json({ error: 'Missing accessToken' }, { status: 400 });

    const response = await fetch('https://backend.appstudio-u7cm9zhmha0ruwv8.piappengine.com/pi/auth/v1/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('[Pi Auth] App Studio failed', data);
      return NextResponse.json({ error: 'Auth validation failed', details: data }, { status: response.status });
    }

    const { sessionToken, user } = data;
    const res = NextResponse.json({ success: true, user: { uid: user.uid, username: user.username }, sessionToken });
    
    // In Response headers set cookies
    res.headers.append('Set-Cookie', `pi_session=${sessionToken}; Path=/; Max-Age=604800; Secure; SameSite=None; HttpOnly`);
    res.headers.append('Set-Cookie', `pi_user=${encodeURIComponent(JSON.stringify({ uid: user.uid, username: user.username }))}; Path=/; Max-Age=604800; Secure; SameSite=None`);

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
