declare global {
  interface Window {
    Pi?: any;
  }
}

let sdkLoadPromise: Promise<boolean> | null = null;
let sdkInitialized = false;
let initPromise: Promise<boolean> | null = null;

export function hasPiSdk(): boolean {
  return typeof window !== 'undefined' && Boolean(window.Pi);
}

export function isPiSandboxClient(): boolean {
  return process.env.NEXT_PUBLIC_PI_SANDBOX !== 'false';
}

export function loadPiSdk(): Promise<boolean> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.resolve(false);
  }
  if (window.Pi) return Promise.resolve(true);
  if (sdkLoadPromise) return sdkLoadPromise;

  sdkLoadPromise = new Promise<boolean>((resolve) => {
    try {
      const existing = document.querySelector(
        'script[src="https://sdk.minepi.com/pi-sdk.js"]'
      );
      if (existing) {
        if (window.Pi) {
          resolve(true);
          return;
        }
        existing.addEventListener('load', () => resolve(Boolean(window.Pi)), { once: true });
        existing.addEventListener('error', () => resolve(false), { once: true });
        setTimeout(() => resolve(Boolean(window.Pi)), 3500);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://sdk.minepi.com/pi-sdk.js';
      script.async = true;
      script.onload = () => resolve(Boolean(window.Pi));
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    } catch {
      resolve(false);
    }
  });

  return sdkLoadPromise;
}

export async function initPiSdk(): Promise<boolean> {
  if (sdkInitialized && hasPiSdk()) {
    return true;
  }
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const loaded = await loadPiSdk();
    if (!loaded || typeof window === 'undefined' || !window.Pi) {
      return false;
    }

    if (!sdkInitialized) {
      const sandbox = isPiSandboxClient();
      await Promise.resolve(window.Pi.init({ version: '2.0', sandbox }));
      sdkInitialized = true;
    }

    return true;
  })();

  try {
    return await initPromise;
  } finally {
    if (!sdkInitialized) {
      initPromise = null;
    }
  }
}

export interface IncompleteRecoveryResult {
  success?: boolean;
  fulfilled?: boolean;
  status?: string;
  paymentId?: string;
  productId?: number;
  txid?: string;
  error?: string;
}

export async function handleIncompletePayment(
  payment: any
): Promise<IncompleteRecoveryResult> {
  const paymentId = payment?.identifier;
  if (!paymentId) return { success: false, error: 'Missing incomplete payment identifier' };

  try {
    const res = await fetch('/api/pi/incomplete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentId,
        txid: payment?.transaction?.txid,
        payment,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as IncompleteRecoveryResult;
    if (
      res.ok &&
      (data?.success || data?.fulfilled) &&
      data?.status === 'completed' &&
      data?.productId &&
      typeof window !== 'undefined'
    ) {
      try {
        const saved = window.localStorage.getItem('purchased_products');
        const arr = saved ? JSON.parse(saved) : [];
        if (Array.isArray(arr) && !arr.includes(data.productId)) {
          arr.push(data.productId);
          window.localStorage.setItem('purchased_products', JSON.stringify(arr));
        }
      } catch {
        // Ignore restricted storage
      }
      window.dispatchEvent(
        new CustomEvent('goye:entitlements-updated', { detail: { productId: data.productId } })
      );
    }
    return data;
  } catch (err: any) {
    return { success: false, error: err?.message || 'Incomplete payment recovery failed' };
  }
}
