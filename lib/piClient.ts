declare global {
  interface Window {
    Pi?: any;
  }
}

let sdkLoadPromise: Promise<boolean> | null = null;
let sdkInitialized = false;
let authenticatedInSession = false;
let cachedUserUid: string | undefined;

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
        setTimeout(() => resolve(Boolean(window.Pi)), 4000);
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
  const loaded = await loadPiSdk();
  if (!loaded || typeof window === 'undefined' || !window.Pi) {
    return false;
  }

  if (!sdkInitialized) {
    const sandbox = process.env.NEXT_PUBLIC_PI_SANDBOX === 'false' ? false : true;
    await Promise.resolve(window.Pi.init({ version: '2.0', sandbox }));
    sdkInitialized = true;
  }

  return true;
}

export function markPiSessionAuthenticated(userUid?: string): void {
  authenticatedInSession = true;
  if (userUid) {
    cachedUserUid = userUid;
  }
}

export async function handleIncompletePayment(payment: any): Promise<void> {
  const paymentId = payment?.identifier;
  if (!paymentId) return;

  const txid = payment?.transaction?.txid;
  try {
    if (txid) {
      const res = await fetch('/api/pi/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, txid }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && (data?.success || data?.fulfilled) && data?.productId && typeof window !== 'undefined') {
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
    } else {
      await fetch('/api/pi/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId }),
      });
    }
  } catch {
    // Incomplete recovery errors ignored safely
  }
}

export async function authenticateForPayments(
  scopes: string[] = ['username', 'payments']
): Promise<{ accessToken?: string; userUid?: string }> {
  const ready = await initPiSdk();
  if (!ready || typeof window === 'undefined' || !window.Pi) {
    throw new Error('Open inside Pi Browser to continue with Pi.');
  }

  if (authenticatedInSession) {
    return { userUid: cachedUserUid };
  }

  const auth = await window.Pi.authenticate(scopes, handleIncompletePayment);
  if (!auth?.accessToken) {
    throw new Error('Pi authentication did not return an accessToken.');
  }

  const userUid = auth?.user?.uid ? String(auth.user.uid) : undefined;
  markPiSessionAuthenticated(userUid);

  if (userUid) {
    try {
      if (window.sessionStorage) {
        window.sessionStorage.setItem('pi_user_uid', userUid);
      }
    } catch {
      // Ignore restricted sessionStorage
    }
  }

  return { accessToken: String(auth.accessToken), userUid };
}
