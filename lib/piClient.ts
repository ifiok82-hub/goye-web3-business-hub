declare global {
  interface Window {
    Pi?: any;
  }
}

let sdkLoadPromise: Promise<boolean> | null = null;
let sdkInitialized = false;

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
    const useSandbox = process.env.NEXT_PUBLIC_PI_SANDBOX !== 'false';
    await Promise.resolve(
      window.Pi.init(useSandbox ? { version: '2.0', sandbox: true } : { version: '2.0' })
    );
    sdkInitialized = true;
  }

  return true;
}

export async function handleIncompletePayment(payment: any): Promise<void> {
  if (!payment?.identifier) return;
  try {
    const res = await fetch('/api/pi/incomplete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId: payment.identifier }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data?.fulfilled && data?.productId && typeof window !== 'undefined') {
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
  } catch {
    // Incomplete payment recovery will retry on next authenticate
  }
}

export async function authenticateForPayments(
  scopes: string[] = ['payments']
): Promise<{ accessToken: string; userUid?: string }> {
  const ready = await initPiSdk();
  if (!ready || typeof window === 'undefined' || !window.Pi) {
    throw new Error('Open inside Pi Browser to continue with Pi.');
  }

  const auth = await window.Pi.authenticate(scopes, handleIncompletePayment);
  if (!auth?.accessToken) {
    throw new Error('Pi authentication did not return an accessToken.');
  }

  const userUid = auth?.user?.uid ? String(auth.user.uid) : undefined;
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
