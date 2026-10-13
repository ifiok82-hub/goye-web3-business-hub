import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, CheckCircle, Share2, PlusSquare, X } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'header' | 'mobile' | 'hero';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstalled, isIOS, hasDeferredPrompt, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installing, setInstalling] = useState(false);

  // If already installed in standalone mode, show clean installed state or hide
  if (isInstalled) {
    if (variant === 'mobile') {
      return (
        <div className="flex items-center gap-2 px-3 py-2 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 rounded-lg">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>App Installed</span>
        </div>
      );
    }
    return null;
  }

  const handleClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    if (hasDeferredPrompt) {
      setInstalling(true);
      await install();
      setInstalling(false);
    } else {
      // In case browser ambient prompt is used or not fired yet
      alert('To install GOYE Web3 Business Hub, use your browser menu and choose "Add to Home Screen" or "Install App".');
    }
  };

  const buttonContent = (
    <>
      <Download className="w-3.5 h-3.5 shrink-0" />
      <span>{installing ? 'Installing...' : 'Install App'}</span>
    </>
  );

  return (
    <>
      {variant === 'header' && (
        <button
          onClick={handleClick}
          title="Install GOYE Web3 Business Hub as a PWA app"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#D4AF37] bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/40 rounded-lg transition-all shadow-sm hover:shadow-[#D4AF37]/10 cursor-pointer"
        >
          {buttonContent}
        </button>
      )}

      {variant === 'mobile' && (
        <button
          onClick={handleClick}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] rounded-xl shadow-md transition-all cursor-pointer"
        >
          {buttonContent}
        </button>
      )}

      {variant === 'hero' && (
        <button
          onClick={handleClick}
          className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-white bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl backdrop-blur transition-all cursor-pointer"
        >
          {buttonContent}
        </button>
      )}

      {/* iOS Modal Guide */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-[#0F1420] border border-[#D4AF37]/40 p-5 text-white shadow-2xl relative">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-bold text-white mb-2">Install on iOS Safari</h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              1. Tap the <Share2 className="w-3.5 h-3.5 inline mx-1 text-blue-400" /> Share button in Safari.<br />
              2. Select <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-[#D4AF37]" /> <strong>Add to Home Screen</strong>.
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full bg-[#123B72] text-white text-xs font-semibold py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
