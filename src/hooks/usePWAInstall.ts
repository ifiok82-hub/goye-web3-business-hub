import { useState, useEffect, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showAutoPrompt, setShowAutoPrompt] = useState(false);
  const [installOutcome, setInstallOutcome] = useState<'idle' | 'accepted' | 'dismissed'>('idle');

  useEffect(() => {
    // 1. Detect if running standalone (already installed)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    setIsInstalled(isStandalone);

    // 2. Detect iOS / iPadOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice =
      /iphone|ipad|ipod/.test(userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);

    // Check if dismissed recently (cooldown in localStorage)
    const dismissedTime = localStorage.getItem('goye_pwa_dismissed_at');
    const wasRecentlyDismissed =
      dismissedTime && Date.now() - parseInt(dismissedTime, 10) < 1000 * 60 * 60 * 24; // 24h cooldown

    // 3. Listen for browser install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);

      // Auto-trigger prompt banner if not already installed
      if (!isStandalone && !wasRecentlyDismissed) {
        setTimeout(() => {
          setShowAutoPrompt(true);
        }, 1200);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowAutoPrompt(false);
      setInstallOutcome('accepted');
      localStorage.removeItem('goye_pwa_dismissed_at');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // For iOS users who are not in standalone mode, show install prompt banner after delay
    if (isIOSDevice && !isStandalone && !wasRecentlyDismissed) {
      const timer = setTimeout(() => {
        setShowAutoPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstallOutcome('accepted');
        setIsInstalled(true);
        setDeferredPrompt(null);
        setShowAutoPrompt(false);
        return true;
      } else {
        setInstallOutcome('dismissed');
        return false;
      }
    } catch (err) {
      console.error('Error during PWA installation:', err);
      return false;
    }
  }, [deferredPrompt]);

  const dismissPrompt = useCallback(() => {
    setShowAutoPrompt(false);
    localStorage.setItem('goye_pwa_dismissed_at', Date.now().toString());
  }, []);

  const openPromptManually = useCallback(() => {
    setShowAutoPrompt(true);
  }, []);

  return {
    isInstallable: !!deferredPrompt || isIOS,
    hasDeferredPrompt: !!deferredPrompt,
    isInstalled,
    isIOS,
    showAutoPrompt,
    installOutcome,
    install,
    dismissPrompt,
    openPromptManually,
    setShowAutoPrompt,
  };
}
