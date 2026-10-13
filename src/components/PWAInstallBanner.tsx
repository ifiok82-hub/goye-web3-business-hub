import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, X, Share2, PlusSquare, CheckCircle2, Shield, Smartphone } from 'lucide-react';
import { GoyeLogo } from './GoyeLogo';

export const PWAInstallBanner: React.FC = () => {
  const {
    isInstalled,
    isIOS,
    showAutoPrompt,
    hasDeferredPrompt,
    install,
    dismissPrompt,
  } = usePWAInstall();

  const [installing, setInstalling] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  // If already installed as native standalone app, do not show banner
  if (isInstalled || !showAutoPrompt) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (hasDeferredPrompt) {
      setInstalling(true);
      await install();
      setInstalling(false);
    }
  };

  return (
    <>
      {/* Floating Bottom / Banner Prompt */}
      <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="relative overflow-hidden rounded-2xl bg-[#0F1420]/95 backdrop-blur-xl border border-[#D4AF37]/40 shadow-2xl shadow-black/80 p-4 sm:p-5 text-white">
          {/* Subtle Ambient Gold Glow */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#D4AF37]/15 rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={dismissPrompt}
            aria-label="Dismiss install prompt"
            className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3.5 pr-6">
            <GoyeLogo size="sm" showText={false} useImage={true} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-white">
                  Install GOYE Web3 Hub
                </span>
                <span className="px-1.5 py-0.2 bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#D4AF37] text-[10px] font-bold rounded">
                  PWA APP
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Add to your home screen for instant launch, offline records, and seamless Pi payments.
              </p>
            </div>
          </div>

          {/* Quick Feature Badges */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10 text-[11px] text-slate-300">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-[#D4AF37]" />
              <span>Offline Cache</span>
            </div>
            <div className="flex items-center gap-1">
              <Smartphone className="w-3 h-3 text-emerald-400" />
              <span>Full Screen</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-blue-400" />
              <span>Pi Wallet Ready</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 mt-3.5">
            <button
              onClick={handleInstallClick}
              disabled={installing}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl hover:from-[#F59E0B] hover:to-[#D4AF37] shadow-lg shadow-[#D4AF37]/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              {installing ? 'Installing...' : isIOS ? 'Install on iPhone / iPad' : 'Install App Now'}
            </button>
            <button
              onClick={dismissPrompt}
              className="text-xs font-medium text-slate-400 hover:text-slate-200 py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              Later
            </button>
          </div>
        </div>
      </div>

      {/* iOS Safari Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-[#0F1420] border border-[#D4AF37]/40 p-6 text-white shadow-2xl relative">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <GoyeLogo size="sm" showText={false} useImage={true} />
              <div>
                <h3 className="text-base font-bold text-white">Install on iOS Safari</h3>
                <p className="text-xs text-slate-400">Add to your iPhone / iPad Home Screen</p>
              </div>
            </div>

            <div className="space-y-3.5 my-5 text-sm text-slate-200">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-white text-xs">Step 1: Tap Share</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Tap the Safari Share button in the browser bottom toolbar.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="p-2 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-white text-xs">Step 2: Add to Home Screen</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Scroll down and tap <strong>Add to Home Screen</strong>, then confirm.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full bg-[#123B72] hover:bg-[#1A4C8F] text-white font-semibold text-xs py-2.5 rounded-xl transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
