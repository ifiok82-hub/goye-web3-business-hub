import React from 'react';

interface GoyeLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  subtitle?: string;
  className?: string;
  useImage?: boolean;
}

export const GoyeLogo: React.FC<GoyeLogoProps> = ({
  size = 'md',
  showText = true,
  subtitle = 'Business Hub',
  className = '',
  useImage = false,
}) => {
  const sizeMap = {
    xs: { icon: 'w-6 h-6', text: 'text-sm', sub: 'text-[9px]', img: 24 },
    sm: { icon: 'w-8 h-8', text: 'text-base sm:text-lg', sub: 'text-[10px]', img: 32 },
    md: { icon: 'w-10 h-10', text: 'text-lg sm:text-xl', sub: 'text-xs', img: 40 },
    lg: { icon: 'w-14 h-14', text: 'text-2xl', sub: 'text-xs', img: 56 },
    xl: { icon: 'w-20 h-20', text: 'text-3xl', sub: 'text-sm', img: 80 },
  };

  const current = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* High-Resolution Emblem */}
      <div
        className={`${current.icon} relative shrink-0 rounded-xl overflow-hidden shadow-md shadow-[#D4AF37]/10 border border-[#D4AF37]/40 p-0.5 bg-gradient-to-br from-[#123B72] via-[#0B0E14] to-[#0B0E14] flex items-center justify-center`}
      >
        {useImage ? (
          <img
            src="/pwa-192x192.png"
            alt="GOYE Web3 Business Hub"
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <img
            src="/pwa-192x192.png"
            onError={(e) => {
              // Fallback to SVG if image fails to load
              (e.currentTarget as HTMLImageElement).src = '/icon.svg';
            }}
            alt="GOYE"
            className="w-full h-full object-cover rounded-lg"
          />
        )}
        <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10 pointer-events-none" />
      </div>

      {/* Brand Wordmark */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className={`font-bold tracking-tight text-white ${current.text}`}>
              GOYE
            </span>
            <span className="text-[#D4AF37] font-bold text-xs px-1.5 py-0.5 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/30 tracking-wider">
              WEB3
            </span>
          </div>
          {subtitle && (
            <span
              className={`text-slate-400 font-semibold tracking-widest uppercase mt-0.5 ${current.sub}`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
