declare global {
  interface Window {
    Pi?: any;
  }
}

export const PI_CONFIG = {
  apiUrl: process.env.NEXT_PUBLIC_PI_API_URL || 'https://api.minepi.com',
  isMainnet: true,
  apiKey: process.env.PI_API_KEY
};

export const initPi = () => {
  if (typeof window !== 'undefined' && window.Pi) {
    window.Pi.init({ version: '2.0' });
  }
};

export const detectPiBrowser = () => {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent || '';
  return /PiBrowser/i.test(ua) || Boolean(window.Pi);
};
