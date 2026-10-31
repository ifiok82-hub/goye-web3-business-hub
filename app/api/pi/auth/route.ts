export class NextResponse extends Response {
  cookies: any;
  static json(data: any, init?: ResponseInit) {
    const res = new Response(JSON.stringify(data), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
    }) as any;
    res.cookies = {
      set: (name: string, val: string, options?: any) => {
        let cookieStr = `${name}=${val}; Path=${options?.path || '/'}; Max-Age=${options?.maxAge || 604800};`;
        if (options?.secure) cookieStr += ' Secure;';
        if (options?.httpOnly) cookieStr += ' HttpOnly;';
        if (options?.sameSite) cookieStr += ` SameSite=${options.sameSite};`;
        res.headers.append('Set-Cookie', cookieStr);
      }
    };
    return res;
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
    if (!response.ok) return NextResponse.json({ error: 'Validation failed', details: data }, { status: response.status });

    const { sessionToken, user } = data;
    const res = NextResponse.json({ success: true, user: { uid: user.uid, username: user.username }, sessionToken });
    res.cookies.set('pi_session', sessionToken, { httpOnly: true, secure: true, sameSite: 'none', path: '/', maxAge: 604800 });
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
