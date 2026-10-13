/**
 * GOYE WEB3 BUSINESS HUB
 * Tagline: Build. Automate. Trade. Pay. Grow.
 * Secondary: AI + Web3 Business Infrastructure for the Global Digital Economy
 */

import React, { useState, useEffect } from 'react';
import { PiAuthProvider } from './context/PiAuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeView } from './views/HomeView';
import { BusinessIdView } from './views/BusinessIdView';
import { MarketplaceView } from './views/MarketplaceView';
import { ContractsAndInvoicesView } from './views/ContractsAndInvoicesView';
import { AiAgentsView } from './views/AiAgentsView';
import { TradeAssuranceView } from './views/TradeAssuranceView';
import { AcademyView } from './views/AcademyView';
import { PiStatusView } from './views/PiStatusView';
import { LegalView } from './views/LegalView';
import { AdminView } from './views/AdminView';
import { VerifyRecordView } from './views/VerifyRecordView';
import { SigninView } from './views/SigninView';
import { SigninCallbackView } from './views/SigninCallbackView';
import { CreateBusinessModal } from './components/CreateBusinessModal';
import { AiAssistantWidget } from './components/AiAssistantWidget';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Bot } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [showCreateBusinessModal, setShowCreateBusinessModal] = useState<boolean>(false);
  const [activeAssistantBusinessId, setActiveAssistantBusinessId] = useState<string | null>(null);
  const [showAssistantWidget, setShowAssistantWidget] = useState<boolean>(false);
  const [verifyParams, setVerifyParams] = useState<{ type: 'business' | 'invoice' | 'contract'; id: string }>({
    type: 'business',
    id: 'GOYE-BIZ-2026-000001',
  });

  // Deep-linking URL detector for OAuth redirect, direct links & QR routing
  useEffect(() => {
    try {
      const pathname = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view');
      const verifyType = params.get('type') as 'business' | 'invoice' | 'contract' | null;
      const verifyId = params.get('id');

      // 1. Detect Pi OAuth Callback Route
      if (pathname === '/signin/callback' || pathname.startsWith('/signin/callback')) {
        setCurrentView('signin-callback');
        return;
      }

      // 2. Detect Pi Signin Route
      if (pathname === '/signin' || pathname.startsWith('/signin')) {
        setCurrentView('signin');
        return;
      }

      // 3. Detect Query or Path Parameters
      if (viewParam) {
        setCurrentView(viewParam);
      } else if (pathname.startsWith('/verify/')) {
        const parts = pathname.split('/').filter(Boolean);
        if (parts.length >= 3) {
          const type = parts[1] as 'business' | 'invoice' | 'contract';
          const id = decodeURIComponent(parts[2]);
          setVerifyParams({ type, id });
          setCurrentView('verify');
        } else {
          setCurrentView('verify');
        }
      }

      if (verifyType && verifyId) {
        setVerifyParams({ type: verifyType, id: decodeURIComponent(verifyId) });
        setCurrentView('verify');
      }
    } catch (e) {
      // Ignore URL parsing errors
    }
  }, []);

  // Scroll to top on view transition
  const handleNavigate = (view: string) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAiAssistant = (businessId?: string) => {
    setActiveAssistantBusinessId(businessId || 'GOYE-BIZ-2026-000001');
    setShowAssistantWidget(true);
  };

  const handleBusinessCreated = (_newBusiness: any) => {
    setCurrentView('business-id');
  };

  return (
    <PiAuthProvider>
      <div className="min-h-screen bg-[#0B0E14] text-slate-100 flex flex-col justify-between selection:bg-[#D4AF37]/20 selection:text-[#D4AF37]">
        {/* Top Navigation */}
        <Header
          currentView={currentView}
          onNavigate={handleNavigate}
          onOpenCreateBusiness={() => setShowCreateBusinessModal(true)}
        />

        {/* Main View Router */}
        <main className="flex-1 pt-6 pb-12">
          {currentView === 'home' && (
            <HomeView
              onNavigate={handleNavigate}
              onOpenCreateBusiness={() => setShowCreateBusinessModal(true)}
            />
          )}

          {currentView === 'signin' && <SigninView onNavigate={handleNavigate} />}

          {currentView === 'signin-callback' && <SigninCallbackView onNavigate={handleNavigate} />}

          {currentView === 'business-id' && (
            <BusinessIdView
              onOpenCreateBusiness={() => setShowCreateBusinessModal(true)}
              onOpenAiAssistant={handleOpenAiAssistant}
            />
          )}

          {currentView === 'marketplace' && (
            <MarketplaceView
              onOpenBusinessProfile={(_id) => {
                setCurrentView('business-id');
              }}
              onOpenCreateBusiness={() => setShowCreateBusinessModal(true)}
            />
          )}

          {currentView === 'contracts-invoices' && <ContractsAndInvoicesView />}

          {currentView === 'ai-agents' && <AiAgentsView />}

          {currentView === 'trade-assurance' && <TradeAssuranceView />}

          {currentView === 'academy' && <AcademyView />}

          {currentView === 'pi-status' && <PiStatusView />}

          {currentView === 'legal' && <LegalView />}

          {currentView === 'admin' && <AdminView />}

          {currentView === 'verify' && (
            <VerifyRecordView
              initialType={verifyParams.type}
              initialId={verifyParams.id}
              onNavigateHome={() => handleNavigate('home')}
            />
          )}
        </main>

        {/* Persistent Floating AI Concierge Button */}
        {!showAssistantWidget && (
          <button
            onClick={() => handleOpenAiAssistant()}
            className="fixed bottom-6 right-6 z-40 px-4 py-2.5 text-xs font-semibold text-[#0B0E14] bg-[#D4AF37] hover:bg-[#e0bc46] rounded-full shadow-2xl transition-transform hover:scale-105 flex items-center gap-2 border border-white/20"
            aria-label="Open AI Assistant Concierge"
          >
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline">GOYE AI Concierge</span>
          </button>
        )}

        {/* AI Assistant Chat Drawer */}
        <AiAssistantWidget
          businessId={activeAssistantBusinessId}
          isOpen={showAssistantWidget}
          onClose={() => setShowAssistantWidget(false)}
        />

        {/* Business ID Self-Serve Registration Modal */}
        <CreateBusinessModal
          isOpen={showCreateBusinessModal}
          onClose={() => setShowCreateBusinessModal(false)}
          onSuccess={handleBusinessCreated}
        />

        {/* PWA Auto-Install Banner & iOS Guide */}
        <PWAInstallBanner />

        {/* Real-time Offline Connectivity Toast */}
        <OfflineIndicator />

        {/* Footer */}
        <Footer onNavigate={handleNavigate} />
      </div>
    </PiAuthProvider>
  );
}
