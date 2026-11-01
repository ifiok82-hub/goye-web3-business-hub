/**
 * GOYE Web3 Business Hub - Pi Network Client SDK Helper
 */

declare global {
  interface Window {
    Pi?: any;
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
