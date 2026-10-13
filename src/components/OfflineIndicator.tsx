import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-amber-500/95 backdrop-blur px-3.5 py-2 text-xs font-semibold text-slate-900 shadow-xl border border-amber-400 animate-bounce">
      <WifiOff className="w-4 h-4 text-slate-900" />
      <span>Offline Mode — Cached GOYE data active. Reconnecting...</span>
    </div>
  );
};
