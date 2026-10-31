/**
 * GOYE Web3 Business Hub - Pi Network Client SDK Helper
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
          onReadyForServerApproval: (paymentId: string) => void | Promise<void>;
          onReadyForServerCompletion: (paymentId: string, txid: string) => void | Promise<void>;
          onCancel: (paymentId: string) => void;
          onError: (error: Error, payment?: any) => void;
        }
      ) => void;
    };
  }
}

export const initPi = () => {
  if (typeof window !== 'undefined' && window.Pi) {
    window.Pi.init({ version: '2.0', sandbox: true });
  }
};

export const detectPiBrowser = () => {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent || '';
  return /PiBrowser/i.test(ua) || Boolean(window.Pi);
};
