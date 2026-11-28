import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  isPiSandboxServer,
  PiPlatformApiError,
  verifyPiUserAccessToken,
} from '@/lib/piPlatform';

const SESSION_COOKIE = 'goye_pi_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

interface SessionPayload {
  uid: string;
  username: string;
  exp: number;
}

function getSessionSecret(): string {
  return (
    process.env.GOYE_SESSION_SECRET ||
    process.env.GOYE_ADMIN_SECRET ||
    process.env.PI_API_KEY ||
    'goye-ephemeral-session-key'
  );
}

function signSession(payload: SessionPayload): string {
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${sig}`;
}

function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token || !token.includes('.')) return null;
  const [encoded, sig] = token.split('.', 2);
  if (!encoded || !sig) return null;

  const expectedSig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(encoded)
    .digest('base64url');

  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SessionPayload;
    if (!parsed?.uid || !parsed?.username || typeof parsed.exp !== 'number') {
      return null;
    }
    if (Date.now() > parsed.exp * 1000) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(SESSION_COOKIE)?.value;
  const session = verifySessionToken(cookie);
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }
  return NextResponse.json(
    {
      authenticated: true,
      user: { uid: session.uid, username: session.username },
      network: isPiSandboxServer() ? 'testnet' : 'mainnet',
    },
    { status: 200 }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const accessToken = typeof body?.accessToken === 'string' ? body.accessToken.trim() : '';

    if (!accessToken) {
      return NextResponse.json(
        { authenticated: false, error: 'Missing Pi accessToken.' },
        { status: 400 }
      );
    }

    const verifiedUser = await verifyPiUserAccessToken(accessToken);

    const clientUid = body?.user?.uid ? String(body.user.uid) : undefined;
    if (clientUid && clientUid !== verifiedUser.uid) {
      return NextResponse.json(
        { authenticated: false, error: 'Authenticated Pi user UID mismatch.' },
        { status: 403 }
      );
    }

    const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
    const sessionToken = signSession({
      uid: verifiedUser.uid,
      username: verifiedUser.username,
      exp,
    });

    const response = NextResponse.json(
      {
        authenticated: true,
        user: {
          uid: verifiedUser.uid,
          username: verifiedUser.username,
        },
        network: isPiSandboxServer() ? 'testnet' : 'mainnet',
      },
      { status: 200 }
    );

    const isHttps =
      req.headers.get('x-forwarded-proto') === 'https' || req.url.startsWith('https://');

    response.cookies.set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      sameSite: isHttps ? 'none' : 'lax',
      secure: isHttps,
      path: '/',
      maxAge: SESSION_TTL_SECONDS,
    });

    return response;
  } catch (err) {
    if (err instanceof PiPlatformApiError) {
      return NextResponse.json(
        { authenticated: false, error: err.message, details: err.details },
        { status: err.status }
      );
    }
    const message = err instanceof Error ? err.message : 'Pi authentication verification failed.';
    return NextResponse.json({ authenticated: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const isHttps =
    req.headers.get('x-forwarded-proto') === 'https' || req.url.startsWith('https://');
  const response = NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: isHttps ? 'none' : 'lax',
    secure: isHttps,
    path: '/',
    maxAge: 0,
  });
  return response;
}
