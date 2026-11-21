const PI_PLATFORM_API_BASE = 'https://api.minepi.com';

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
  const key = (process.env.PI_NETWORK_API_KEY || '').trim();
  if (!key || key === 'NOT CONFIGURED') {
    throw new PiConfigError('PI_NETWORK_API_KEY is not configured on the server.');
  }
  return key;
}

async function piRequest<T>(path: string, init: RequestInit): Promise<T> {
  const apiKey = getServerApiKey();
  const res = await fetch(`${PI_PLATFORM_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Key ${apiKey}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    cache: 'no-store',
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
