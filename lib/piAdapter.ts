/**
 * GOYE Web3 Business Hub - Pi Network Dual-Browser Adapter
 * Handles Pi Browser detection, dynamic SDK script loading, authentication,
 * and real-time payment creation with instant server approval dispatch.
 */

declare global {
  interface Window {
    Pi?: {
      init: (options: { version: string; sandbox: boolean }) => void;
      authenticate: (
        scopes: string[],
        onIncompletePaymentFound: (payment: any) => void
      ) => Promise<{
        accessToken: string;
        user: {
          uid: string;
          username: string;
        };
      }>;
      createPayment: (
        paymentData: {
          amount: number;
          memo: string;
          metadata: Record<string, any>;
        },
        callbacks: {
          onReadyForServerApproval: (paymentId: string) => void | Promise<void>;
          onReadyForServerCompletion: (paymentId: string, txid: string) => void | Promise<void>;
          onCancel: (paymentId: string) => void;
          onError: (error: Error, payment?: any) => void;
        }
      ) => void;
    };
  }
}

export interface BrowserDetectionResult {
  isPiBrowser: boolean;
  isStandardBrowser: boolean;
  userAgent: string;
}

/**
 * Detects whether the current environment is the official Pi Browser or a standard browser.
 */
export function detectBrowser(): BrowserDetectionResult {
  if (typeof window === 'undefined') {
    return {
      isPiBrowser: false,
      isStandardBrowser: true,
      userAgent: '',
    };
  }

  const ua = window.navigator.userAgent || '';
  const isPiBrowser = ua.toLowerCase().includes('pibrowser') || Boolean(window.Pi);

  return {
    isPiBrowser,
    isStandardBrowser: !isPiBrowser,
    userAgent: ua,
  };
}

let scriptLoadPromise: Promise<boolean> | null = null;

/**
 * Ensures the official Pi SDK script (https://sdk.minepi.com/pi-sdk.js) is loaded in the DOM.
 */
export async function loadPiSDKScript(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (window.Pi) return true;

  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }

  scriptLoadPromise = new Promise((resolve) => {
    // Check if script tag is already in DOM
    const existing = document.querySelector('script[src*="sdk.minepi.com/pi-sdk.js"]');
    if (existing) {
      if (window.Pi) {
        resolve(true);
        return;
      }
      existing.addEventListener('load', () => resolve(Boolean(window.Pi)));
      existing.addEventListener('error', () => resolve(false));
      setTimeout(() => resolve(Boolean(window.Pi)), 3000);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.minepi.com/pi-sdk.js';
    script.async = true;
    script.onload = () => resolve(Boolean(window.Pi));
    script.onerror = () => {
      console.warn('[Pi Adapter] Failed to load Pi SDK script from CDN');
      resolve(false);
    };
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

let isInitialized = false;

/**
 * Initializes the Pi SDK for Testnet development (sandbox: true).
 */
export async function initPiSDK(options?: { sandbox?: boolean }): Promise<boolean> {
  await loadPiSDKScript();

  if (typeof window === 'undefined' || !window.Pi) {
    console.warn('[Pi Adapter] Pi SDK not available on window. Open in Pi Browser.');
    return false;
  }

  const sandbox = options?.sandbox !== undefined ? options.sandbox : true;

  try {
    window.Pi.init({ version: '2.0', sandbox });
    isInitialized = true;
    console.log(`[Pi Adapter] Initialized Pi SDK (version: "2.0", sandbox: ${sandbox})`);
    return true;
  } catch (err) {
    console.warn('[Pi Adapter] Init warning:', err);
    isInitialized = true;
    return true;
  }
}

let cachedAuthToken: string | null = null;

/**
 * Handler for incomplete payments discovered during authentication.
 */
export async function onIncompletePaymentFound(payment: any): Promise<void> {
  console.warn('[Pi Adapter] Incomplete payment found:', payment);
  try {
    await fetch('/api/pi/incomplete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentId: payment.identifier,
        txid: payment.transaction?.txid,
        payment,
      }),
    });
  } catch (err) {
    console.warn('[Pi Adapter] Failed to notify incomplete payment:', err);
  }
}

/**
 * Authenticates the user with Pi SDK: Pi.authenticate(["username", "payments"], ...)
 */
export async function authenticatePi(
  onIncomplete?: (payment: any) => void | Promise<void>
): Promise<{
  success: boolean;
  user?: { uid: string; username: string };
  accessToken?: string;
  error?: string;
}> {
  const initialized = await initPiSDK({ sandbox: true });
  if (!initialized || !window.Pi) {
    return {
      success: false,
      error: 'Pi SDK not loaded. Please open in Pi Browser.',
    };
  }

  try {
    const authResult = await window.Pi.authenticate(
      ['username', 'payments'],
      async (incompletePayment) => {
        if (onIncomplete) {
          await onIncomplete(incompletePayment);
        } else {
          await onIncompletePaymentFound(incompletePayment);
        }
      }
    );

    if (authResult?.accessToken) {
      cachedAuthToken = authResult.accessToken;
    }

    return {
      success: true,
      user: authResult.user,
      accessToken: authResult.accessToken,
    };
  } catch (err: any) {
    console.error('[Pi Adapter] Authentication failed:', err);
    return {
      success: false,
      error: err?.message || 'Pi authentication failed.',
    };
  }
}

export interface GoyePaymentOptions {
  amount: number;
  memo?: string;
  metadata?: Record<string, any>;
  onStatusChange?: (status: string, details?: string) => void;
  onSuccess?: (result: { paymentId: string; txid: string; payment: any }) => void;
  onError?: (error: string, details?: any) => void;
  onCancel?: (paymentId: string) => void;
  forceSandbox?: boolean;
}

/**
 * Creates and processes a Pi Payment with immediate server approval and completion.
 * Critical Rule: onReadyForServerApproval calls /api/pi/approve IMMEDIATELY to avoid 10s timeout.
 * Memo is strictly limited to < 30 characters.
 */
export async function createGoyePayment(options: GoyePaymentOptions): Promise<void> {
  const browser = detectBrowser();
  if (!browser.isPiBrowser) {
    options.onStatusChange?.('ERROR', 'Open in Pi Browser to execute Test-Pi payments.');
    options.onError?.('Pi Browser required. Open https://goye-web3-business-hub.vercel.app in Pi Browser.');
    return;
  }

  const initialized = await initPiSDK({ sandbox: options.forceSandbox ?? true });
  if (!initialized || !window.Pi) {
    options.onStatusChange?.('ERROR', 'Pi SDK unavailable.');
    options.onError?.('Pi SDK could not be initialized.');
    return;
  }

  // Ensure authenticated
  options.onStatusChange?.('AUTHENTICATING', 'Authenticating with Pi Network...');
  const auth = await authenticatePi();
  if (!auth.success) {
    options.onStatusChange?.('ERROR', auth.error || 'Authentication required');
    options.onError?.(auth.error || 'Authentication required before payment.');
    return;
  }

  // Strict rule: Memo must be < 30 chars
  const rawMemo = options.memo || 'GOYE Testnet Pay';
  const cleanMemo = rawMemo.length > 28 ? rawMemo.substring(0, 28) : rawMemo;

  options.onStatusChange?.('CREATING_PAYMENT', 'Opening Pi Wallet for payment authorization...');

  try {
    window.Pi.createPayment(
      {
        amount: options.amount > 0 ? options.amount : 0.1,
        memo: cleanMemo,
        metadata: {
          purpose: 'GOYE_TESTNET_PAYMENT',
          app: 'GOYE Web3 Business Hub',
          ...options.metadata,
        },
      },
      {
        // 1. Immediately POST to /api/pi/approve to beat the 10s wallet timeout
        onReadyForServerApproval: async (paymentId: string) => {
          console.log('[Pi Adapter] onReadyForServerApproval fired with paymentId:', paymentId);
          options.onStatusChange?.(
            'APPROVING',
            `Payment ${paymentId.substring(0, 8)}... created. Contacting server for approval...`
          );

          try {
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (cachedAuthToken) {
              headers['Authorization'] = `Bearer ${cachedAuthToken}`;
            }

            const approveRes = await fetch('/api/pi/approve', {
              method: 'POST',
              headers,
              body: JSON.stringify({ paymentId }),
              signal: AbortSignal.timeout(8000), // Fast 8s timeout
            });

            const approveData = await approveRes.json();
            console.log('[Pi Adapter] Server approval response:', approveData);

            if (!approveRes.ok || !approveData.success) {
              const errMsg = approveData.message || approveData.error || 'Server approval failed';
              options.onStatusChange?.('APPROVAL_FAILED', errMsg);
              options.onError?.(errMsg, approveData);
              return;
            }

            options.onStatusChange?.(
              'APPROVED',
              'Payment approved by developer. Please sign in Pi Wallet...'
            );
          } catch (err: any) {
            console.error('[Pi Adapter] Server approval network error:', err);
            const msg = err?.message || 'Server approval network timeout';
            options.onStatusChange?.('APPROVAL_FAILED', msg);
            options.onError?.(msg);
          }
        },

        // 2. Immediately POST paymentId + txid to /api/pi/complete
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          console.log('[Pi Adapter] onReadyForServerCompletion fired with txid:', txid);
          options.onStatusChange?.('COMPLETING', 'Transaction broadcast to Testnet. Finalizing completion...');

          try {
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (cachedAuthToken) {
              headers['Authorization'] = `Bearer ${cachedAuthToken}`;
            }

            const completeRes = await fetch('/api/pi/complete', {
              method: 'POST',
              headers,
              body: JSON.stringify({ paymentId, txid }),
              signal: AbortSignal.timeout(8000),
            });

            const completeData = await completeRes.json();
            console.log('[Pi Adapter] Server completion response:', completeData);

            if (!completeRes.ok || (!completeData.success && !completeData.verified)) {
              const errMsg = completeData.message || completeData.error || 'Server completion failed';
              options.onStatusChange?.('COMPLETION_FAILED', errMsg);
              options.onError?.(errMsg, completeData);
              return;
            }

            options.onStatusChange?.('SUCCESS', 'Payment successfully approved, signed, and completed on Testnet!');
            options.onSuccess?.({
              paymentId,
              txid,
              payment: completeData.payment,
            });
          } catch (err: any) {
            console.error('[Pi Adapter] Server completion network error:', err);
            const msg = err?.message || 'Server completion network error';
            options.onStatusChange?.('COMPLETION_FAILED', msg);
            options.onError?.(msg);
          }
        },

        onCancel: (paymentId: string) => {
          console.log('[Pi Adapter] Payment cancelled by user:', paymentId);
          options.onStatusChange?.('CANCELLED', 'Payment was cancelled in Pi Wallet.');
          options.onCancel?.(paymentId);
        },

        onError: (error: Error, payment?: any) => {
          console.error('[Pi Adapter] Pi SDK payment error:', error, payment);
          options.onStatusChange?.('ERROR', error?.message || 'Pi payment error occurred.');
          options.onError?.(error?.message || 'Pi payment error occurred.', payment);
        },
      }
    );
  } catch (err: any) {
    console.error('[Pi Adapter] Create payment invocation error:', err);
    options.onStatusChange?.('ERROR', err?.message || 'Failed to invoke Pi.createPayment.');
    options.onError?.(err?.message || 'Failed to invoke Pi.createPayment.');
  }
}
