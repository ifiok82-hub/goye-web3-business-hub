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
      init: (options: { version: string; sandbox?: boolean }) => Promise<void> | void;
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
          onReadyForServerApproval: (paymentId: string) => Promise<void> | void;
          onReadyForServerCompletion: (paymentId: string, txid: string) => Promise<void> | void;
          onCancel: (paymentId: string) => void;
          onError: (error: Error, payment?: any) => void;
        }
      ) => void;
    };
  }
}

export type PiPaymentFlowStatus =
  | 'NOT STARTED'
  | 'AUTHENTICATING'
  | 'PAYMENT CREATED'
  | 'WAITING FOR APPROVAL'
  | 'WAITING FOR USER CONFIRMATION'
  | 'TRANSACTION SUBMITTED'
  | 'COMPLETING PAYMENT'
  | 'TESTNET PAYMENT SUCCESSFUL'
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

export type PiEnvironmentMode = 'development' | 'production';

export interface PiSdkConfig {
  version: '2.0';
  sandbox: boolean;
  environment: PiEnvironmentMode;
}

/**
 * Returns current Pi SDK environment configuration according to architectural rules:
 * - Development / Sandbox: http://localhost:3000 -> sandbox: true
 * - Production: https://goye-web3-business-hub.vercel.app -> sandbox: false
 * Explicit VITE_PI_ENV or VITE_PI_SANDBOX takes precedence.
 */
export function getPiSdkEnvironment(): PiSdkConfig {
  const vitePiEnv = import.meta.env.VITE_PI_ENV;
  const viteSandbox = import.meta.env.VITE_PI_SANDBOX;

  if (viteSandbox === 'true') {
    return { version: '2.0', sandbox: true, environment: 'development' };
  }
  if (viteSandbox === 'false') {
    return { version: '2.0', sandbox: false, environment: 'production' };
  }
  if (vitePiEnv === 'development') {
    return { version: '2.0', sandbox: true, environment: 'development' };
  }
  if (vitePiEnv === 'production') {
    return { version: '2.0', sandbox: false, environment: 'production' };
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1' || window.location.port === '3000';
    if (isLocal) {
      return { version: '2.0', sandbox: true, environment: 'development' };
    }
    if (host.includes('vercel.app') || host.includes('goye')) {
      return { version: '2.0', sandbox: false, environment: 'production' };
    }
  }

  const isDev = Boolean(import.meta.env.DEV);
  return {
    version: '2.0',
    sandbox: isDev,
    environment: isDev ? 'development' : 'production',
  };
}

let currentInitializedConfig: PiSdkConfig | null = null;

/**
 * Initializes the official Pi SDK with strict environment rules:
 * - Development: sandbox = true
 * - Production: sandbox = false
 * Never hardcodes sandbox: true in production; never hardcodes sandbox: false in development.
 */
export async function initializePiSDK(options?: { forceSandbox?: boolean }): Promise<boolean> {
  if (typeof window === 'undefined' || !window.Pi) {
    return false;
  }

  const baseConfig = getPiSdkEnvironment();
  const effectiveSandbox = options?.forceSandbox !== undefined ? options.forceSandbox : baseConfig.sandbox;
  const targetConfig: PiSdkConfig = {
    version: '2.0',
    sandbox: effectiveSandbox,
    environment: effectiveSandbox ? 'development' : 'production',
  };

  if (currentInitializedConfig && currentInitializedConfig.sandbox === effectiveSandbox) {
    return true;
  }

  try {
    window.Pi.init({ version: '2.0', sandbox: effectiveSandbox });
    currentInitializedConfig = targetConfig;
    console.log(
      `[Pi SDK] Initialized (version: "2.0", sandbox: ${effectiveSandbox}, env: ${targetConfig.environment})`
    );
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

let cachedAccessToken: string | null = null;

export function getCachedAccessToken(): string | null {
  return cachedAccessToken;
}

export function setCachedAccessToken(token: string | null) {
  cachedAccessToken = token;
}

/**
 * Authenticates before payment with:
 * Pi.authenticate(["username", "payments"], onIncompletePaymentFound)
 * Strictly conforms to security guidelines: Never requests wallet passphrase, private key, or secret seed.
 */
export async function authenticatePi(
  onIncompleteFound?: (payment: any) => void,
  options?: { forceSandbox?: boolean }
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
      errorMessage: 'Pi SDK unavailable. Please open GOYE Web3 Business Hub in Pi Browser and try again.',
    };
  }

  try {
    await initializePiSDK(options);

    let detectedIncomplete: any = null;

    const authResult = await window.Pi.authenticate(
      ['username', 'payments'],
      async (incompletePayment: any) => {
        console.warn('[Pi SDK] Incomplete payment found on authentication:', incompletePayment);
        detectedIncomplete = incompletePayment;
        if (onIncompleteFound) {
          onIncompleteFound(incompletePayment);
        }
        // Asynchronously notify backend to inspect and resolve before creating new payments
        await resolveIncompletePaymentServer(incompletePayment);
      }
    );

    if (authResult?.accessToken) {
      cachedAccessToken = authResult.accessToken;
    }

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
      errorMessage: err?.message || 'Pi authentication failed. Please try again.',
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
  verifiedBy: string;
  rawPayment?: any;
}

/**
 * Dedicated Real Pi Testnet Payment Execution
 *
 * Parameters:
 * - Amount: 0.1 Test-Pi
 * - Memo: "GOYE Testnet Payment Test"
 * - Metadata: { purpose: "GOYE_TESTNET_PAYMENT" }
 *
 * Sequence:
 * 1. Authenticate with ["username", "payments"]
 * 2. Pi.createPayment(...)
 * 3. onReadyForServerApproval(paymentId) -> POST /api/pi/approve -> Pi Platform API /approve
 * 4. Pioneer signs on Testnet blockchain with personal KYC wallet
 * 5. onReadyForServerCompletion(paymentId, txid) -> POST /api/pi/complete -> Pi Platform API /complete
 * 6. Only after backend official completion -> TESTNET PAYMENT SUCCESSFUL
 *
 * Absolutely NO mock payments, simulated txids, or fake completions.
 */
export async function executePiTestnetPayment(options: {
  onStatusChange: (status: PiPaymentFlowStatus, details?: string) => void;
  onPaymentCreated?: (paymentId: string) => void;
  onTransactionReceived?: (txid: string) => void;
  onSuccess: (evidence: RealPaymentEvidence) => void;
  onError: (errorMessage: string, details?: any) => void;
  onIncompleteFound?: (payment: any) => void;
  forceSandbox?: boolean;
}): Promise<void> {
  if (typeof window === 'undefined' || !window.Pi) {
    options.onStatusChange('FAILED', 'Pi SDK unavailable.');
    options.onError('Pi SDK unavailable. Please open GOYE Web3 Business Hub in Pi Browser and try again.');
    return;
  }

  try {
    options.onStatusChange('AUTHENTICATING', 'Authenticating with Pi SDK...');
    await initializePiSDK({ forceSandbox: options.forceSandbox });

    // Step 1: Authenticate with Pi SDK before payment
    const authRes = await authenticatePi(options.onIncompleteFound, { forceSandbox: options.forceSandbox });
    if (!authRes.success || !authRes.user) {
      options.onStatusChange('FAILED', 'Pi authentication failed.');
      options.onError(authRes.errorMessage || 'Pi authentication failed. Please try again.');
      return;
    }

    if (authRes.accessToken) {
      cachedAccessToken = authRes.accessToken;
    }

    // Step 2: Call official Pi.createPayment()
    options.onStatusChange('PAYMENT CREATED', 'Payment created. Opening Pi Wallet interface...');

    window.Pi.createPayment(
      {
        amount: 0.1,
        memo: 'GOYE Testnet Pay',
        metadata: {
          purpose: 'GOYE_TESTNET_PAYMENT',
        },
      },
      {
        onReadyForServerApproval: async (paymentId: string) => {
          if (options.onPaymentCreated) {
            options.onPaymentCreated(paymentId);
          }

          options.onStatusChange('WAITING FOR APPROVAL', `Payment ${paymentId} created. Waiting for server approval...`);

          try {
            const approveHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
            if (cachedAccessToken) {
              approveHeaders['Authorization'] = `Bearer ${cachedAccessToken}`;
            }

            const approveRes = await fetch('/api/pi/approve', {
              method: 'POST',
              headers: approveHeaders,
              body: JSON.stringify({ paymentId }),
              signal: AbortSignal.timeout(8000),
            });

            const approveData = await approveRes.json();
            if (!approveRes.ok || !approveData.success) {
              const errMsg = approveData.message || approveData.error || 'Pi server approval failed.';
              options.onStatusChange('FAILED', `Approval failed (${approveData.errorCode || approveRes.status}): ${errMsg}`);
              options.onError(errMsg, approveData);
              return;
            }

            options.onStatusChange('WAITING FOR USER CONFIRMATION', 'Approval confirmed. Waiting for user signature in Pi Wallet...');
          } catch (err: any) {
            options.onStatusChange('FAILED', 'Pi server approval network error.');
            options.onError(err?.message || 'Pi server approval failed.');
          }
        },

        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          if (options.onTransactionReceived) {
            options.onTransactionReceived(txid);
          }

          options.onStatusChange('TRANSACTION SUBMITTED', `Testnet transaction received. Submitting for server completion...`);
          options.onStatusChange('COMPLETING PAYMENT', 'Finalizing payment completion with Pi Platform API...');

          try {
            const completeHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
            if (cachedAccessToken) {
              completeHeaders['Authorization'] = `Bearer ${cachedAccessToken}`;
            }

            const completeRes = await fetch('/api/pi/complete', {
              method: 'POST',
              headers: completeHeaders,
              body: JSON.stringify({ paymentId, txid }),
            });

            const completeData = await completeRes.json();
            if (!completeRes.ok || !completeData.success || !completeData.verified) {
              const errMsg = completeData.message || completeData.error || 'Pi payment completion failed.';
              options.onStatusChange('FAILED', `Completion failed: ${errMsg}`);
              options.onError(errMsg, completeData);
              return;
            }

            options.onStatusChange('TESTNET PAYMENT SUCCESSFUL', 'TESTNET PAYMENT SUCCESSFUL');

            const evidence: RealPaymentEvidence = {
              paymentId,
              txid,
              network: 'TESTNET',
              amount: 0.1,
              developerApproval: 'PASS',
              transactionVerification: 'PASS',
              developerCompletion: 'PASS',
              finalPaymentStatus: 'PAID',
              verifiedBy: 'GOYE server + Pi Platform API',
              rawPayment: completeData.payment,
            };

            options.onSuccess(evidence);
          } catch (err) {
            options.onStatusChange('FAILED', 'Pi payment completion failed. Payment has NOT been marked successful.');
            options.onError('Pi payment completion failed. Payment has NOT been marked successful.');
          }
        },

        onCancel: (_paymentId: string) => {
          options.onStatusChange('CANCELLED', 'Pi Testnet payment cancelled.');
          options.onError('Pi Testnet payment cancelled.');
        },

        onError: (error: Error, payment?: any) => {
          console.error('[Pi SDK Payment Error]:', error, payment);
          options.onStatusChange('FAILED', 'Pi Testnet payment failed or is unavailable.');
          options.onError('Pi Testnet payment failed or is unavailable.', payment);
        },
      }
    );
  } catch (err: any) {
    console.error('[Pi SDK Invocation Error]:', err);
    options.onStatusChange('FAILED', 'Pi payment verification is temporarily unavailable. Please try again later.');
    options.onError(err?.message || 'Pi payment verification is temporarily unavailable. Please try again later.');
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
    options.onError('Pi SDK unavailable. Please open GOYE Web3 Business Hub in Pi Browser and try again.');
    return;
  }

  options.onStatusChange('Initializing official Pi SDK (Production Architecture)...');

  try {
    await initializePiSDK();

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
          options.onStatusChange('Payment created. Waiting for server approval...');
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
                approveData.error || 'Pi server approval failed.'
              );
              return;
            }

            options.onStatusChange('Waiting for user confirmation in Pi Wallet...');
          } catch (err: any) {
            options.onError('Pi server approval failed.');
          }
        },

        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          options.onStatusChange('Testnet transaction received. Completing payment...');
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
              options.onError(
                completeData.error || 'Pi payment completion failed. Payment has NOT been marked successful.'
              );
              return;
            }

            options.onSuccess({
              ...completeData.payment,
              txid: completeData.txid || completeData.payment?.transaction?.txid,
              paymentId: completeData.paymentId || completeData.payment?.identifier,
            });
          } catch (err) {
            options.onError('Pi payment completion failed. Payment has NOT been marked successful.');
          }
        },

        onCancel: (_paymentId: string) => {
          options.onStatusChange('Pi Testnet payment cancelled.');
          options.onError('Pi Testnet payment cancelled.');
        },

        onError: (error: Error) => {
          console.error('Pi SDK Payment Error:', error);
          options.onError(error.message || 'Pi Testnet payment failed or is unavailable.');
        },
      }
    );
  } catch (err: any) {
    console.error('Pi SDK createPayment invocation error:', err);
    options.onError('Pi payment verification is temporarily unavailable. Please try again later.');
  }
}
