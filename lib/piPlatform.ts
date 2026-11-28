export function isPiSandboxServer(): boolean {
  return process.env.NEXT_PUBLIC_PI_SANDBOX !== 'false' && process.env.PI_SANDBOX !== 'false';
}

export function getPiApiBase(): string {
  // Pi Platform v2 API (/v2/me, /v2/payments/*) ALWAYS resides at https://api.minepi.com
  // for both Testnet (sandbox: true) and Mainnet apps. api.testnet.minepi.com is Horizon
  // blockchain RPC and returns 404 for /v2/payments/*/approve.
  return (process.env.PI_PLATFORM_API_BASE || 'https://api.minepi.com').replace(/\/+$/, '');
}

export function getPiApiKeyOrNull(): string | null {
  const raw = (process.env.PI_API_KEY || process.env.PI_NETWORK_API_KEY || '').trim();
  const key = raw
    .replace(/^['"]|['"]$/g, '')
    .replace(/^Key\s+/i, '')
    .trim();
  if (!key || key === 'NOT CONFIGURED') {
    return null;
  }
  return key;
}

export function getPiApiKeyStatus(): 'CONFIGURED' | 'NOT CONFIGURED' {
  return getPiApiKeyOrNull() ? 'CONFIGURED' : 'NOT CONFIGURED';
}

export interface PiPlatformPayment {
  identifier: string;
  user_uid: string;
  amount: number;
  memo: string;
  metadata?: Record<string, unknown>;
  from_address?: string;
  to_address?: string;
  direction: 'user_to_app' | 'app_to_user' | string;
  created_at?: string;
  network?: string;
  transaction?: {
    txid?: string;
    verified?: boolean;
    _link?: string;
  } | null;
  status?: {
    developer_approved?: boolean;
    transaction_verified?: boolean;
    developer_completed?: boolean;
    cancelled?: boolean;
    user_cancelled?: boolean;
  };
}

export interface PiMeUser {
  uid: string;
  username: string;
  credentials?: {
    scopes?: string[];
  };
}

export class PiConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PiConfigError';
  }
}

export class PiPlatformApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'PiPlatformApiError';
    this.status = status;
    this.details = details;
  }
}

function getServerApiKey(): string {
  const key = getPiApiKeyOrNull();
  if (!key) {
    throw new PiConfigError('PI_API_KEY is NOT CONFIGURED on the server.');
  }
  return key;
}

async function piRequest<T>(path: string, init: RequestInit): Promise<T> {
  const apiKey = getServerApiKey();
  const base = getPiApiBase();
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      Authorization: `Key ${apiKey}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  });

  const text = await res.text();
  let parsed: any = {};
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    parsed = { raw: text };
  }

  if (!res.ok) {
    throw new PiPlatformApiError(
      parsed?.message || parsed?.error || `Pi Platform API error (${res.status})`,
      res.status,
      parsed
    );
  }

  return parsed as T;
}

export async function verifyPiUserAccessToken(accessToken: string): Promise<PiMeUser> {
  const cleanToken = accessToken.trim();
  if (!cleanToken) {
    throw new PiPlatformApiError('Missing Pi accessToken', 400);
  }

  const base = getPiApiBase();
  try {
    const res = await fetch(`${base}/v2/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${cleanToken}`,
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });

    const text = await res.text();
    let parsed: any = {};
    try {
      parsed = text ? JSON.parse(text) : {};
    } catch {
      parsed = { raw: text };
    }

    if (res.ok && parsed?.uid && parsed?.username) {
      return {
        uid: String(parsed.uid),
        username: String(parsed.username),
        credentials: parsed.credentials,
      };
    }

    throw new PiPlatformApiError(
      parsed?.message || parsed?.error || 'Pi token verification failed against /v2/me',
      res.status >= 400 && res.status < 600 ? res.status : 401,
      parsed
    );
  } catch (err: any) {
    if (err instanceof PiPlatformApiError) throw err;
    throw new PiPlatformApiError(
      err?.message || 'Network error reaching Pi /v2/me',
      502,
      { error: err?.message || 'Network error' }
    );
  }
}

export async function getPiPayment(paymentId: string): Promise<PiPlatformPayment> {
  if (!paymentId || typeof paymentId !== 'string') {
    throw new PiPlatformApiError('Invalid paymentId', 400);
  }
  return piRequest<PiPlatformPayment>(
    `/v2/payments/${encodeURIComponent(paymentId)}`,
    { method: 'GET' }
  );
}

export async function approvePiPayment(paymentId: string): Promise<PiPlatformPayment> {
  return piRequest<PiPlatformPayment>(
    `/v2/payments/${encodeURIComponent(paymentId)}/approve`,
    {
      method: 'POST',
      body: JSON.stringify({}),
    }
  );
}

export async function completePiPayment(
  paymentId: string,
  txid: string
): Promise<PiPlatformPayment> {
  return piRequest<PiPlatformPayment>(
    `/v2/payments/${encodeURIComponent(paymentId)}/complete`,
    {
      method: 'POST',
      body: JSON.stringify({ txid }),
    }
  );
}

export async function cancelPiPayment(paymentId: string): Promise<PiPlatformPayment> {
  return piRequest<PiPlatformPayment>(
    `/v2/payments/${encodeURIComponent(paymentId)}/cancel`,
    {
      method: 'POST',
      body: JSON.stringify({}),
    }
  );
}
