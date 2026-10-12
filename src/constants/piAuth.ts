/**
 * GOYE Web3 Business Hub - Official Pi Network OAuth Configuration
 *
 * Official Pi Network Sign-in Integration:
 * - Authorization Endpoint: https://accounts.pinet.com/oauth/authorize
 * - Client ID: oyEFvUGrkruWe8giGoqhq5py6Q60F6dtMT_WQedySqk
 * - Registered Production Redirect URI: https://goye-web3-business-hub.vercel.app/signin/callback
 * - Registered Localhost Redirect URI: http://localhost:3000/signin/callback
 * - Flow: OAuth 2.0 Implicit Grant (response_type=token)
 * - Minimum Required Scope: username
 * - Strict Anti-Simulation Policy: Never creates mock tokens or simulated Pioneers.
 */

export const PI_OAUTH_CLIENT_ID =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_PI_OAUTH_CLIENT_ID) ||
  'oyEFvUGrkruWe8giGoqhq5py6Q60F6dtMT_WQedySqk';

export const PI_OAUTH_AUTHORIZE_URL = 'https://accounts.pinet.com/oauth/authorize';

export const PI_REGISTERED_REDIRECT_URIS = {
  production: 'https://goye-web3-business-hub.vercel.app/signin/callback',
  local: 'http://localhost:3000/signin/callback',
} as const;

export const PI_OAUTH_MINIMUM_SCOPE = 'username';

const OAUTH_STATE_KEY = 'goye_pi_oauth_state';
const OAUTH_STATE_TIMESTAMP_KEY = 'goye_pi_oauth_state_time';
const OAUTH_RETURN_VIEW_KEY = 'goye_pi_oauth_return_view';
export const PI_SESSION_STORAGE_KEY = 'goye_pi_verified_session';

/**
 * Determines the appropriate registered redirect URI based on the current origin.
 * Strictly uses registered URIs to ensure compliance with Pi Developer Platform.
 */
export function getPiOAuthRedirectUri(): string {
  if (typeof window === 'undefined') {
    return PI_REGISTERED_REDIRECT_URIS.production;
  }

  const hostname = window.location.hostname;

  // Local development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return PI_REGISTERED_REDIRECT_URIS.local;
  }

  // Production Vercel or any public domain
  return PI_REGISTERED_REDIRECT_URIS.production;
}

/**
 * Generates a cryptographically strong 192-bit random state string for CSRF mitigation.
 */
export function generateOAuthState(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(24);
    window.crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  // Safe fallback
  return Math.random().toString(36).substring(2) + Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Stores OAuth state in sessionStorage with timestamp and optional return view.
 */
export function storeOAuthState(state: string, returnView?: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(OAUTH_STATE_KEY, state);
    sessionStorage.setItem(OAUTH_STATE_TIMESTAMP_KEY, Date.now().toString());
    if (returnView) {
      sessionStorage.setItem(OAUTH_RETURN_VIEW_KEY, returnView);
    }
  } catch (e) {
    console.warn('[Pi OAuth] Unable to access sessionStorage:', e);
  }
}

/**
 * Validates the returned OAuth state against the stored state.
 * Clears the stored state upon successful validation to prevent replay attacks.
 */
export function validateAndClearOAuthState(returnedState: string | null): {
  isValid: boolean;
  returnView?: string;
  errorMessage?: string;
} {
  if (typeof window === 'undefined') {
    return { isValid: false, errorMessage: 'Browser window is undefined.' };
  }

  try {
    const storedState = sessionStorage.getItem(OAUTH_STATE_KEY);
    const storedTime = sessionStorage.getItem(OAUTH_STATE_TIMESTAMP_KEY);
    const returnView = sessionStorage.getItem(OAUTH_RETURN_VIEW_KEY) || undefined;

    // Clean up stored state
    sessionStorage.removeItem(OAUTH_STATE_KEY);
    sessionStorage.removeItem(OAUTH_STATE_TIMESTAMP_KEY);
    sessionStorage.removeItem(OAUTH_RETURN_VIEW_KEY);

    if (!returnedState) {
      return { isValid: false, errorMessage: 'No state parameter was returned by the authorization server.' };
    }

    if (!storedState) {
      return {
        isValid: false,
        errorMessage: 'No initiating OAuth state found in session. Please start the sign-in flow again.',
      };
    }

    // Check expiration (15 minutes)
    if (storedTime) {
      const elapsed = Date.now() - parseInt(storedTime, 10);
      if (elapsed > 15 * 60 * 1000) {
        return { isValid: false, errorMessage: 'OAuth authorization request has expired. Please try again.' };
      }
    }

    if (returnedState !== storedState) {
      return {
        isValid: false,
        errorMessage: 'OAuth state mismatch (potential CSRF). Authentication has been halted for your security.',
      };
    }

    return { isValid: true, returnView };
  } catch (e) {
    return { isValid: false, errorMessage: 'Failed to access browser session storage.' };
  }
}

/**
 * Constructs the official Pi OAuth authorization URL.
 */
export function buildPiOAuthUrl(options?: { redirectUri?: string; returnView?: string }): {
  url: string;
  state: string;
  redirectUri: string;
} {
  const state = generateOAuthState();
  const redirectUri = options?.redirectUri || getPiOAuthRedirectUri();

  storeOAuthState(state, options?.returnView);

  const params = new URLSearchParams({
    response_type: 'token',
    client_id: PI_OAUTH_CLIENT_ID,
    redirect_uri: redirectUri,
    state,
    scope: PI_OAUTH_MINIMUM_SCOPE,
  });

  return {
    url: `${PI_OAUTH_AUTHORIZE_URL}?${params.toString()}`,
    state,
    redirectUri,
  };
}

export interface ParsedOAuthCallback {
  accessToken: string | null;
  tokenType: string | null;
  state: string | null;
  expiresIn: number | null;
  error: string | null;
  errorDescription: string | null;
}

/**
 * Parses the URL fragment (hash) and query parameters from the redirect URI callback.
 * Pi OAuth implicit flow returns the access_token in the URL fragment (#access_token=...&state=...).
 */
export function parseOAuthCallbackUrl(): ParsedOAuthCallback {
  if (typeof window === 'undefined') {
    return {
      accessToken: null,
      tokenType: null,
      state: null,
      expiresIn: null,
      error: 'Window is not defined',
      errorDescription: null,
    };
  }

  // 1. Try URL fragment (#...)
  const hash = window.location.hash.startsWith('#')
    ? window.location.hash.substring(1)
    : window.location.hash;
  const hashParams = new URLSearchParams(hash);

  // 2. Try query string (?...) for errors
  const searchParams = new URLSearchParams(window.location.search);

  const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
  const tokenType = hashParams.get('token_type') || searchParams.get('token_type');
  const state = hashParams.get('state') || searchParams.get('state');
  const expiresInRaw = hashParams.get('expires_in') || searchParams.get('expires_in');
  const expiresIn = expiresInRaw ? parseInt(expiresInRaw, 10) : null;

  const error = hashParams.get('error') || searchParams.get('error');
  const errorDescription =
    hashParams.get('error_description') || searchParams.get('error_description');

  return {
    accessToken,
    tokenType,
    state,
    expiresIn,
    error,
    errorDescription,
  };
}
