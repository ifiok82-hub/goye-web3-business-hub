import { NextRequest, NextResponse } from 'next/server';

const APP_STUDIO_LOGIN_URL =
  'https://backend.appstudio-u7cm9zhmha0ruwv8.piappengine.com/pi/auth/v1/login';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const accessToken = body?.accessToken;

    if (!accessToken || typeof accessToken !== 'string') {
      return NextResponse.json({ error: 'accessToken is required' }, { status: 400 });
    }

    const res = await fetch(APP_STUDIO_LOGIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.message || data?.error || 'App Studio auth failed' },
        { status: res.status || 401 }
      );
    }

    const uid = data?.user?.uid ?? data?.uid;
    const username = data?.user?.username ?? data?.username;
    const sessionToken = data?.sessionToken ?? data?.token ?? data?.accessToken ?? null;

    if (!uid) {
      return NextResponse.json(
        { error: 'App Studio did not return verified user uid' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      sessionToken,
      user: {
        uid,
        username,
      },
    });
  } catch {
    return NextResponse.json({ error: 'App Studio login request failed' }, { status: 500 });
  }
}
