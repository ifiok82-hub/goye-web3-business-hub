/**
 * Official Pi Network Client-Side SDK Integration Wrapper
 * Strict Zero-Simulation Policy: Never fakes payment or blockchain status.
 *
 * Architecture:
 * - Pi.init({ version: "2.0", sandbox: false })
 * - Pi.authenticate(["username", "payments"], onIncompletePaymentFound)
 * - Two-phase payment: Pi.createPayment() -> onReadyForServerApproval -> onReadyForServerCompletion
 * - Authoritative backend validation with Pi Platform API (/v2/payments/{id}/complete)
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

export type PiPaymentFlowStatus =
  | 'IDLE'
  | 'CREATED'
  | 'APPROVAL_PENDING'
  | 'APPROVED'
  | 'USER_ACTION_REQUIRED'
  | 'TRANSACTION_SUBMITTED'
  | 'COMPLETION_PENDING'
  | 'COMPLETED'
  | 'VERIFIED'
  | 'PAID'
  | 'CANCELLED'
  | 'FAILED';

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

/**
 * Initializes the official Pi SDK.
 * Critical Production Requirement: sandbox = false (standard production SDK architecture).
 */
export async function initializePiSDK(sandbox = false): Promise<boolean> {
  if (typeof window === 'undefined' || !window.Pi) {
    return false;
  }

  if (isInitialized) return true;

  try {
    // Official Pi SDK initialization (must be sandbox: false)
    window.Pi.init({ version: '2.0', sandbox: false });
    isInitialized = true;
    return true;
  } catch (err) {
    console.warn('[Pi SDK] Initialization warning:', err);
    return false;
  }
}

/**
 * Reconciles an incomplete payment with the backend.
 */
export async function resolveIncompletePaymentServer(payment: any): Promise<{
  resolved: boolean;
  status: string;
  message: string;
}> {
  try {
    const res = await fetch('/api/pi/incomplete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentId: payment.identifier,
        txid: payment.transaction?.txid,
        payment,
      }),
    });
    const data = await res.json();
    return {
      resolved: Boolean(data.resolved),
      status: data.status || 'PENDING',
      message: data.message || 'Incomplete payment processed.',
    };
  } catch (err) {
    return {
      resolved: false,
      status: 'UNAVAILABLE',
      message: 'Failed to communicate with server to reconcile incomplete payment.',
    };
  }
}

/**
 * Authenticates before payment with:
 * Pi.authenticate(["username", "payments"], onIncompletePaymentFound)
 */
export async function authenticatePi(
  onIncompleteFound?: (payment: any) => void
): Promise<{
  success: boolean;
  user?: { uid: string; username: string };
  accessToken?: string;
  incompletePayment?: any;
  errorMessage?: string;
}> {
  if (typeof window === 'undefined' || !window.Pi) {
    return {
      success: false,
      errorMessage: 'Pi SDK unavailable. Please open this app inside the official Pi Browser.',
    };
  }

  try {
    await initializePiSDK(false);

    let detectedIncomplete: any = null;

    const authResult = await window.Pi.authenticate(
      ['username', 'payments'],
      (incompletePayment) => {
        console.warn('[Pi SDK] Incomplete payment found on authentication:', incompletePayment);
        detectedIncomplete = incompletePayment;
        if (onIncompleteFound) {
          onIncompleteFound(incompletePayment);
        }
        // Asynchronously notify backend to inspect and resolve
        resolveIncompletePaymentServer(incompletePayment);
      }
    );

    return {
      success: true,
      user: authResult.user,
      accessToken: authResult.accessToken,
      incompletePayment: detectedIncomplete,
    };
  } catch (err: any) {
    console.error('Pi Authentication Error:', err);
    return {
      success: false,
      errorMessage: err?.message || 'Pi authentication failed. Please try again later.',
    };
  }
}

export interface RealPaymentEvidence {
  paymentId: string;
  txid: string;
  network: 'TESTNET';
  amount: number;
  developerApproval: 'PASS' | 'FAIL';
  transactionVerification: 'PASS' | 'FAIL';
  developerCompletion: 'PASS' | 'FAIL';
  finalPaymentStatus: 'PAID' | 'NOT PAID';
  rawPayment?: any;
}

/**
 * Dedicated Pi Testnet Payment Validation Execution
 * Strictly executes:
 * 1. Backend test payment initiation (0.1 Test-Pi, order ID registered)
 * 2. Pi.createPayment({ amount: 0.1, memo: "GOYE Web3 Business Hub Testnet Payment", metadata: ... })
 * 3. onReadyForServerApproval -> POST /api/pi/approve -> Pi Platform API /approve
 * 4. Pioneer confirms and signs on Testnet blockchain
 * 5. onReadyForServerCompletion -> POST /api/pi/complete -> Pi Platform API /complete
 * 6. Backend confirms completion -> Order marked PAID -> returns real evidence
 *
 * Absolutely NO mock payments, simulated txids, or fake completions.
 */
export async function executePiTestnetPayment(options: {
  onStatusChange: (status: PiPaymentFlowStatus, details?: string) => void;
  onSuccess: (evidence: RealPaymentEvidence) => void;
  onError: (errorMessage: string, details?: any) => void;
  onIncompleteFound?: (payment: any) => void;
}): Promise<void> {
  if (typeof window === 'undefined' || !window.Pi) {
    options.onStatusChange('FAILED', 'Pi SDK unavailable.');
    options.onError('Pi SDK unavailable. Please open this app inside the official Pi Browser.');
    return;
  }

  try {
    options.onStatusChange('IDLE', 'Initializing official Pi SDK (sandbox: false)...');
    await initializePiSDK(false);

    // Step 1: Authenticate Pioneer with payments scope
    options.onStatusChange('IDLE', 'Authenticating Pioneer with Pi SDK...');
    const authRes = await authenticatePi(options.onIncompleteFound);
    if (!authRes.success || !authRes.user) {
      options.onStatusChange('FAILED', 'Pi authentication failed.');
      options.onError(authRes.errorMessage || 'Pi authentication failed.');
      return;
    }

    // Step 2: Register genuine Testnet payment intent on backend
    options.onStatusChange('CREATED', 'Initiating testnet payment order on GOYE backend...');
    const initRes = await fetch('/api/pi/test-payment/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: authRes.user.username,
        userUid: authRes.user.uid,
      }),
    });

    if (!initRes.ok) {
      const initErr = await initRes.json();
      options.onStatusChange('FAILED', 'Server failed to initiate testnet payment.');
      options.onError(initErr.error || 'Server failed to initiate testnet payment.');
      return;
    }

    const { orderId, amount, memo, metadata } = await initRes.json();

    let capturedPaymentId = '';
    let approvalPass = false;

    // Step 3: Call official Pi.createPayment()
    options.onStatusChange('CREATED', 'Opening official Pi payment interface (0.1 Test-Pi)...');

    window.Pi.createPayment(
      {
        amount: 0.1,
        memo: memo || 'GOYE Web3 Business Hub Testnet Payment',
        metadata: {
          purpose: 'pi_testnet_integration_test',
          app: 'GOYE Web3 Business Hub',
          orderId,
          network: 'TESTNET',
          ...metadata,
        },
      },
      {
        onReadyForServerApproval: async (paymentId: string) => {
          capturedPaymentId = paymentId;
          options.onStatusChange('APPROVAL_PENDING', 'Waiting for GOYE backend server approval...');

          try {
            const approveRes = await fetch('/api/pi/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentId,
                internalOrderId: orderId,
              }),
            });

            const approveData = await approveRes.json();
            if (!approveRes.ok || !approveData.success) {
              options.onStatusChange('FAILED', 'Server approval failed.');
              options.onError(approveData.error || 'Server approval failed.', approveData);
              return;
            }

            approvalPass = true;
            options.onStatusChange('APPROVED', 'Payment approved by backend. Waiting for Testnet transaction...');
            options.onStatusChange('USER_ACTION_REQUIRED', 'Please review and confirm the transaction in your Pi Wallet.');
          } catch (err: any) {
            options.onStatusChange('FAILED', 'Server approval network error.');
            options.onError('Server approval failed due to network error.');
          }
        },

        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          options.onStatusChange('TRANSACTION_SUBMITTED', 'Transaction submitted. Waiting for server completion...');
          options.onStatusChange('COMPLETION_PENDING', 'Submitting real TxID to Pi Platform API for server completion...');

          try {
            const completeRes = await fetch('/api/pi/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentId,
                txid,
                internalOrderId: orderId,
              }),
            });

            const completeData = await completeRes.json();
            if (!completeRes.ok || !completeData.success || !completeData.verified) {
              options.onStatusChange('FAILED', 'Payment completion failed.');
              options.onError(completeData.error || 'Payment completion failed.', completeData);
              return;
            }

            options.onStatusChange('COMPLETED', 'Payment completed.');
            options.onStatusChange('VERIFIED', 'Pi Platform API confirmed completion.');
            options.onStatusChange('PAID', 'Payment officially verified. Order marked PAID.');

            const evidence: RealPaymentEvidence = {
              paymentId,
              txid,
              network: 'TESTNET',
              amount: 0.1,
              developerApproval: approvalPass ? 'PASS' : 'FAIL',
              transactionVerification: 'PASS',
              developerCompletion: 'PASS',
              finalPaymentStatus: 'PAID',
              rawPayment: completeData.payment,
            };

            options.onSuccess(evidence);
          } catch (err) {
            options.onStatusChange('FAILED', 'Pi payment verification failed.');
            options.onError('Pi payment verification failed. Payment has NOT been confirmed.');
          }
        },

        onCancel: (paymentId: string) => {
          options.onStatusChange('CANCELLED', 'Payment was cancelled.');
          options.onError('Payment was cancelled.');
        },

        onError: (error: Error, payment?: any) => {
          console.error('[Pi SDK Payment Error]:', error, payment);
          options.onStatusChange('FAILED', 'Pi payment could not be created.');
          options.onError(error.message || 'Pi payment could not be created.', payment);
        },
      }
    );
  } catch (err: any) {
    console.error('[Pi SDK] General invocation error:', err);
    options.onStatusChange('FAILED', 'Pi Platform is temporarily unavailable.');
    options.onError(err.message || 'Pi Platform is temporarily unavailable.');
  }
}

/**
 * Standard Production Payment flow (for Marketplace and services)
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
    options.onError('Pi SDK unavailable. Please open this app inside the official Pi Browser.');
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
          network: 'TESTNET',
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

            options.onStatusChange('Payment approved by backend. Waiting for Testnet transaction...');
          } catch (err: any) {
            options.onError('Server approval failed due to network error.');
          }
        },

        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          options.onStatusChange('Transaction submitted. Submitting TxID for official verification...');
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
            if (!completeRes.ok || !completeData.success || !completeData.verified) {
              options.onError(completeData.error || 'Payment completion failed. Payment has NOT been confirmed.');
              return;
            }

            options.onSuccess({
              ...completeData.payment,
              txid: completeData.txid || completeData.payment?.transaction?.txid,
              paymentId: completeData.paymentId || completeData.payment?.identifier,
            });
          } catch (err) {
            options.onError('Pi payment verification failed. Payment has NOT been confirmed.');
          }
        },

        onCancel: (paymentId: string) => {
          options.onStatusChange('Payment was cancelled.');
          options.onError(`Payment was cancelled.`);
        },

        onError: (error: Error) => {
          console.error('Pi SDK Payment Error:', error);
          options.onError(error.message || 'Pi payment could not be created.');
        },
      }
    );
  } catch (err: any) {
    console.error('Pi SDK createPayment invocation error:', err);
    options.onError('Pi Platform is temporarily unavailable.');
  }
}
