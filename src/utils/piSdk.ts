/**
 * Official Pi Network Client-Side SDK Integration Wrapper
 * Strict Zero-Simulation Policy: Never fakes payment or blockchain status.
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
          onReadyForServerApproval: (paymentId: string) => void;
          onReadyForServerCompletion: (paymentId: string, txid: string) => void;
          onCancel: (paymentId: string) => void;
          onError: (error: Error, payment?: any) => void;
        }
      ) => void;
    };
  }
}

export interface PiEnvironmentDetection {
  isPiBrowser: boolean;
  isSdkLoaded: boolean;
  userAgent: string;
}

export function detectPiEnvironment(): PiEnvironmentDetection {
  if (typeof window === 'undefined') {
    return { isPiBrowser: false, isSdkLoaded: false, userAgent: '' };
  }

  const ua = window.navigator.userAgent || '';
  const isPiBrowser = ua.toLowerCase().includes('pibrowser') || Boolean(window.Pi);
  const isSdkLoaded = typeof window.Pi !== 'undefined';

  return {
    isPiBrowser,
    isSdkLoaded,
    userAgent: ua,
  };
}

let isInitialized = false;

export async function initializePiSDK(sandbox = false): Promise<boolean> {
  if (typeof window === 'undefined' || !window.Pi) {
    return false;
  }

  if (isInitialized) return true;

  try {
    // Production requirement: sandbox is false
    window.Pi.init({ version: '2.0', sandbox });
    isInitialized = true;
    return true;
  } catch (err) {
    console.warn('Pi.init status:', err);
    return false;
  }
}

export async function authenticatePi(): Promise<{
  success: boolean;
  user?: { uid: string; username: string };
  accessToken?: string;
  errorMessage?: string;
}> {
  if (typeof window === 'undefined' || !window.Pi) {
    return {
      success: false,
      errorMessage: 'Pi payment verification is currently unavailable. Please open this app inside the official Pi Browser.',
    };
  }

  try {
    await initializePiSDK(false);

    const authResult = await window.Pi.authenticate(['username', 'payments'], (incompletePayment) => {
      console.log('[Pi SDK] Incomplete payment found:', incompletePayment);
      // Incomplete payments should be resolved server-side
    });

    return {
      success: true,
      user: authResult.user,
      accessToken: authResult.accessToken,
    };
  } catch (err: any) {
    console.error('Pi Authentication Error:', err);
    return {
      success: false,
      errorMessage:
        err?.message || 'Pi payment verification is currently unavailable. Please try again later.',
    };
  }
}

/**
 * Executes authentic Pi Payment flow:
 * 1. Customer initiates payment via Pi.createPayment()
 * 2. On onReadyForServerApproval: calls backend POST /api/pi/approve (server approves via Pi Platform API)
 * 3. Pioneer signs payment
 * 4. On onReadyForServerCompletion: calls backend POST /api/pi/complete (server verifies with Pi Platform API)
 * 5. Only after backend verifies completion does onSuccess execute
 * Strict anti-mock policy: Zero client-side verification, zero simulated transactions.
 */
export async function executePiPayment(options: {
  amount: number;
  memo: string;
  internalOrderId: string;
  onStatusChange: (status: string) => void;
  onSuccess: (payment: any) => void;
  onError: (errorMessage: string) => void;
}) {
  if (typeof window === 'undefined' || !window.Pi) {
    options.onError('Pi payment verification is currently unavailable. Please try again later.');
    return;
  }

  options.onStatusChange('Initializing official Pi SDK (Production Architecture)...');

  try {
    await initializePiSDK(false);

    window.Pi.createPayment(
      {
        amount: options.amount,
        memo: options.memo,
        metadata: {
          internalOrderId: options.internalOrderId,
          platform: 'GOYE Web3 Business Hub',
          timestamp: new Date().toISOString(),
        },
      },
      {
        onReadyForServerApproval: async (paymentId: string) => {
          options.onStatusChange('Contacting GOYE backend for official server-side payment approval...');
          try {
            const approveRes = await fetch('/api/pi/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentId,
                internalOrderId: options.internalOrderId,
              }),
            });

            const approveData = await approveRes.json();
            if (!approveRes.ok) {
              options.onError(
                approveData.error || 'Server approval failed. Pi payment verification is currently unavailable.'
              );
              return;
            }

            options.onStatusChange('Payment approved by backend. Awaiting Pioneer blockchain confirmation...');
          } catch (err: any) {
            options.onError('Network connection error during server-side payment approval.');
          }
        },

        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          options.onStatusChange('Payment broadcasted to blockchain. Verifying completion via Pi Platform API...');
          try {
            const completeRes = await fetch('/api/pi/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentId,
                txid,
                internalOrderId: options.internalOrderId,
              }),
            });

            const completeData = await completeRes.json();
            if (!completeRes.ok) {
              options.onError(completeData.error || 'Backend failed to verify completion with Pi Platform API.');
              return;
            }

            options.onSuccess(completeData.payment);
          } catch (err) {
            options.onError('Network connection error during final payment verification.');
          }
        },

        onCancel: (paymentId: string) => {
          options.onStatusChange('Payment cancelled by user.');
          options.onError(`Payment ${paymentId} was cancelled.`);
        },

        onError: (error: Error) => {
          console.error('Pi SDK Payment Error:', error);
          options.onError(error.message || 'Pi payment verification is currently unavailable. Please try again later.');
        },
      }
    );
  } catch (err: any) {
    console.error('Pi SDK createPayment invocation error:', err);
    options.onError('Pi payment verification is currently unavailable. Please try again later.');
  }
}
