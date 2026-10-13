/**
 * GOYE Web3 Business Hub - Official Pi Network Sign-in View
 * Route: /signin
 *
 * Implements the official Pi Network OAuth 2.0 Sign-in flow:
 * - Direct redirect to https://accounts.pinet.com/oauth/authorize
 * - Client ID: oyEFvUGrkruWe8giGoqhq5py6Q60F6dtMT_WQedySqk
 * - Registered Redirect URIs:
 *   - Production: https://goye-web3-business-hub.vercel.app/signin/callback
 *   - Local Development: http://localhost:3000/signin/callback
 * - Strict Separation: OAuth is authentication only. Payments require explicit separate Pi.createPayment().
 */

import React, { useState, useEffect } from 'react';
import { usePiAuth } from '../context/PiAuthContext';
import {
  PI_OAUTH_CLIENT_ID,
  PI_REGISTERED_REDIRECT_URIS,
  getPiOAuthRedirectUri,
  PI_OAUTH_MINIMUM_SCOPE,
} from '../constants/piAuth';
import { detectPiEnvironment } from '../utils/piSdk';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  Smartphone,
  Globe,
  Key,
  Info,
  LogOut,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { GoyeLogo } from '../components/GoyeLogo';

interface SigninViewProps {
  onNavigate: (view: string) => void;
}

export const SigninView: React.FC<SigninViewProps> = ({ onNavigate }) => {
  const {
    user,
    isAuthenticated,
    isLoading,
    authError,
    signInWithPiOAuth,
    signInWithPiBrowserSdk,
    signOut,
    clearAuthError,
  } = usePiAuth();

  const [envStatus, setEnvStatus] = useState({ isPiBrowser: false, isSdkLoaded: false });
  const [activeRedirectUri, setActiveRedirectUri] = useState<string>(PI_REGISTERED_REDIRECT_URIS.production);

  useEffect(() => {
    setEnvStatus(detectPiEnvironment());
    setActiveRedirectUri(getPiOAuthRedirectUri());
  }, []);

  const handleStartOAuth = () => {
    clearAuthError();
    signInWithPiOAuth({ returnView: 'home' });
  };

  const handleSdkLogin = async () => {
    clearAuthError();
    const success = await signInWithPiBrowserSdk();
    if (success) {
      onNavigate('home');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Breadcrumb Navigation */}
      <div className="mb-6 flex items-center gap-2 text-xs text-slate-400">
        <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">
          Ecosystem
        </button>
        <span>/</span>
        <span className="text-[#D4AF37] font-medium">Pi Sign-in</span>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Sign-in Action Card */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#12161F] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            {/* Logo and Top Badge */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <GoyeLogo size="md" subtitle="Web3 Authentication" />
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-semibold">
                <Key className="w-3.5 h-3.5" />
                <span>Pi OAuth 2.0</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Sign in with Pi
            </h1>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              Authenticate your verified Pioneer identity using official Pi Network OAuth.
              Connect securely across standard browsers and Pi Browser.
            </p>

            {/* Error Banner */}
            {authError && (
              <div className="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-3">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold">Authentication Unavailable</div>
                  <div>{authError}</div>
                </div>
              </div>
            )}

            {/* If Authenticated: Show Verified Pioneer Status */}
            {isAuthenticated && user ? (
              <div className="mt-8 p-6 rounded-xl bg-[#0B0E14] border border-emerald-500/30 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                      Authenticated Pioneer
                    </div>
                    <div className="text-lg font-bold text-[#D4AF37]">@{user.username}</div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Verified Pi UID:</span>
                    <span className="font-mono text-slate-300">{user.uid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Session Status:</span>
                    <span className="text-emerald-400 font-medium">Active (Server Verified)</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => onNavigate('home')}
                    className="flex-1 py-2.5 px-4 bg-[#D4AF37] hover:bg-[#e0bc46] text-[#0B0E14] font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => signOut()}
                    className="py-2.5 px-4 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium text-xs rounded-lg border border-white/10 transition-colors flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              /* If Unauthenticated: Sign-in Buttons */
              <div className="mt-8 space-y-4">
                {/* Primary Button: Official Pi OAuth Redirect */}
                <button
                  onClick={handleStartOAuth}
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 bg-[#D4AF37] hover:bg-[#e0bc46] text-[#0B0E14] font-bold text-sm rounded-xl transition-all shadow-lg hover:shadow-[#D4AF37]/20 flex items-center justify-center gap-3 group"
                >
                  <div className="w-6 h-6 rounded-md bg-[#0B0E14] text-[#D4AF37] flex items-center justify-center font-bold text-xs">
                    π
                  </div>
                  <span>Sign in with Pi (Official OAuth)</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

                {/* Secondary Button: Pi Browser SDK (available in Pi Browser) */}
                {envStatus.isPiBrowser && (
                  <button
                    onClick={handleSdkLogin}
                    disabled={isLoading}
                    className="w-full py-3 px-6 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs rounded-xl border border-white/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <Smartphone className="w-4 h-4 text-[#D4AF37]" />
                    <span>1-Tap Sign-in via Pi Browser SDK</span>
                  </button>
                )}

                <div className="text-[11px] text-slate-400 text-center pt-2">
                  Opens official Pi OAuth endpoint:{' '}
                  <span className="font-mono text-slate-300">accounts.pinet.com/oauth/authorize</span>
                </div>
              </div>
            )}
          </div>

          {/* Core Security Guarantees */}
          <div className="bg-[#12161F] border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#D4AF37]" />
              Pioneer Security Guarantees
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-[#0B0E14] border border-white/5 space-y-1">
                <div className="font-semibold text-white">Never Requests Passphrase</div>
                <p className="text-slate-400 leading-relaxed">
                  GOYE never requests, stores, or accesses your 24-word Pi wallet passphrase.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#0B0E14] border border-white/5 space-y-1">
                <div className="font-semibold text-white">Authentication Only</div>
                <p className="text-slate-400 leading-relaxed">
                  Signing in only verifies your username. It does not authorize any payments or transactions.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#0B0E14] border border-white/5 space-y-1">
                <div className="font-semibold text-white">Strict Anti-Simulation</div>
                <p className="text-slate-400 leading-relaxed">
                  Every session is verified server-side with the official Pi Platform API (/v2/me).
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#0B0E14] border border-white/5 space-y-1">
                <div className="font-semibold text-white">Separate Payment Flow</div>
                <p className="text-slate-400 leading-relaxed">
                  All payments require individual, explicit confirmation through the official Pi SDK.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Technical Specification & Registered Configuration */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#12161F] border border-white/10 rounded-2xl p-6 space-y-5">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-[#D4AF37]" />
              Pi Developer Platform Configuration
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <div className="text-slate-400 text-[11px] mb-1">Pi OAuth Client ID (Public):</div>
                <div className="p-2.5 rounded bg-[#0B0E14] border border-white/5 font-mono text-slate-300 break-all select-all">
                  {PI_OAUTH_CLIENT_ID}
                </div>
              </div>

              <div>
                <div className="text-slate-400 text-[11px] mb-1">Authorization Endpoint:</div>
                <div className="p-2.5 rounded bg-[#0B0E14] border border-white/5 font-mono text-slate-300 break-all">
                  https://accounts.pinet.com/oauth/authorize
                </div>
              </div>

              <div>
                <div className="text-slate-400 text-[11px] mb-1">OAuth Grant Type:</div>
                <div className="p-2.5 rounded bg-[#0B0E14] border border-white/5 font-mono text-slate-300">
                  Implicit Flow (response_type=token)
                </div>
              </div>

              <div>
                <div className="text-slate-400 text-[11px] mb-1">Requested Scope:</div>
                <div className="p-2.5 rounded bg-[#0B0E14] border border-white/5 font-mono text-slate-300">
                  {PI_OAUTH_MINIMUM_SCOPE} (Minimum appropriate scope)
                </div>
              </div>

              <div className="pt-2 border-t border-white/5">
                <div className="text-slate-400 text-[11px] mb-1.5 font-semibold text-white">
                  Registered Redirect URIs:
                </div>
                <div className="space-y-2">
                  <div className="p-2 rounded bg-[#0B0E14] border border-white/5 space-y-0.5">
                    <div className="text-[10px] text-[#D4AF37] uppercase font-semibold">Production (Vercel)</div>
                    <div className="font-mono text-[11px] text-slate-300 break-all">
                      {PI_REGISTERED_REDIRECT_URIS.production}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-[#0B0E14] border border-white/5 space-y-0.5">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Localhost (Dev)</div>
                    <div className="font-mono text-[11px] text-slate-300 break-all">
                      {PI_REGISTERED_REDIRECT_URIS.local}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#0B0E14] border border-[#D4AF37]/20 text-[11px] text-slate-400 space-y-1">
                <div className="text-white font-medium flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Active Target for This Browser:
                </div>
                <div className="font-mono text-[#D4AF37] break-all">{activeRedirectUri}</div>
              </div>
            </div>
          </div>

          {/* Environment Status Card */}
          <div className="bg-[#12161F] border border-white/10 rounded-2xl p-6 space-y-3 text-xs">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#D4AF37]" />
              Client Environment Detection
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-slate-400">Environment Type:</span>
                <span className="font-medium text-white">
                  {envStatus.isPiBrowser ? 'Pi Browser (Mobile Webview)' : 'Standard HTTPS Browser'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-slate-400">Pi JS SDK:</span>
                <span className={envStatus.isSdkLoaded ? 'text-emerald-400' : 'text-slate-400'}>
                  {envStatus.isSdkLoaded ? 'Loaded in Window' : 'Not Loaded (OAuth fallback)'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-400">Production HTTPS:</span>
                <span className="text-emerald-400 font-medium">Compatible & Enforced</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
