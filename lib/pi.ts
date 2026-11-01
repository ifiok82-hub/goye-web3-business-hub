declare global {
  interface Window {
    Pi?: any;
  }
}

export const PI_CONFIG = {
  apiUrl: process.env.NEXT_PUBLIC_PI_API_URL || 'https://api.testnet.minepi.com',
  apiKey: process.env.PI_API_KEY || '4sup304m5joyhqnmhmiov2tdjvybp4l9pr7a9qe47nf9nri4dzyczexm1dmmei2r'
};

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
