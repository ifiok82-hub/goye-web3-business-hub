import React, { useState, useEffect } from 'react';
import { ASSETS } from '../constants/assets';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  FileCheck2,
  CreditCard,
  Camera,
  CheckCheck,
  Building2,
  ExternalLink,
} from 'lucide-react';

interface TradeDeal {
  id: string;
  contractId: string;
  invoiceId: string;
  title: string;
  buyerName: string;
  sellerName: string;
  amount: number;
  currency: string;
  currentStage: string;
  stages: Array<{
    stage: string;
    label: string;
    completed: boolean;
    timestamp?: string;
    notes?: string;
  }>;
}

export const TradeAssuranceView: React.FC = () => {
  const [deals, setDeals] = useState<TradeDeal[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<TradeDeal | null>(null);

  useEffect(() => {
    fetch('/api/trade-assurance/deals')
      .then((res) => res.json())
      .then((data) => {
        setDeals(data.deals || []);
        if (data.deals && data.deals.length > 0) {
          setSelectedDeal(data.deals[0]);
        }
      })
      .catch((err) => console.error('Error fetching trade deals:', err));
  }, []);

  const handleAdvanceStage = async (stage: string) => {
    if (!selectedDeal) return;
    try {
      const res = await fetch(`/api/trade-assurance/deals/${selectedDeal.id}/stage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage,
          notes: 'Evidence verified and signed off by buyer inspector.',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedDeal(data.deal);
        setDeals((prev) => prev.map((d) => (d.id === data.deal.id ? data.deal : d)));
      }
    } catch (err) {
      console.error('Error advancing stage:', err);
    }
  };

  const workflowSteps = [
    { num: '01', title: 'Deal', desc: 'Commercial agreement & scope specifications logged.' },
    { num: '02', title: 'Contract', desc: 'Legally structured milestones & cryptographic signature.' },
    { num: '03', title: 'Invoice', desc: 'Multi-currency billing record with SHA-256 QR code.' },
    { num: '04', title: 'Payment', desc: 'Verified settlement through bank wire or Pi Platform API.' },
    { num: '05', title: 'Evidence', desc: 'Deliverables / inspection report uploaded and verified.' },
    { num: '06', title: 'Completion', desc: 'Mutual confirmation and cryptographic closing audit.' },
    { num: '07', title: 'Dispute Record', desc: 'Arbitration trail preserved in permanent ledger.' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
            <span>Commercial Trust Protocol</span>
            <span aria-hidden="true">·</span>
            <span>Milestone Coordination</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            GOYE Trade Assurance Hub
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Eliminating commercial mistrust through verifiable digital records, milestone-gated evidence, and transparent trade coordination for African and global commerce.
          </p>
        </div>
      </div>

      {/* Mandatory Statutory Notice */}
      <div className="p-4 rounded-xl bg-[#121620] border border-white/10 flex items-start gap-3 text-xs text-slate-400">
        <AlertTriangle className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-200">Statutory Role & Architecture:</strong> GOYE is not a bank, trust entity, or licensed custodial escrow provider. GOYE provides digital trade coordination, verifiable milestone record-keeping, and dispute evidence logs. Funds move directly between transacting parties and verified settlement providers.
        </div>
      </div>

      {/* Hero Split: 7-Stage Workflow Strip + Image Asset */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            The 7-Stage Trade Assurance Pipeline
          </h2>
          <div className="space-y-3">
            {workflowSteps.map((step, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg bg-[#121620] border border-white/10 flex items-start gap-4 hover:border-[#D4AF37]/40 transition-colors"
              >
                <span className="font-mono text-xs font-bold text-[#D4AF37] shrink-0 mt-0.5">
                  {step.num}
                </span>
                <div>
                  <div className="text-xs font-bold text-white">{step.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-xl overflow-hidden border border-white/15 bg-[#121620]">
            <img
              src={ASSETS.tradeAssurance}
              alt="Two businesses conducting a professional transaction with digital contract, invoice, verification and secure-deal concepts on tablet"
              referrerPolicy="no-referrer"
              className="w-full h-80 object-cover"
            />
            <div className="p-4 text-xs text-slate-400 bg-[#0B0E14] border-t border-white/10">
              <span className="font-semibold text-white">Verified Trade Agreement & Milestone Dossier</span>
              <p className="text-[11px] text-slate-400 mt-1">
                Every trade stage creates a timestamped audit trail that can be verified and exported for transparent counterparty due diligence.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Active Trade Deal Tracker */}
      {selectedDeal && (
        <div className="p-6 sm:p-8 rounded-xl bg-[#121620] border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-mono text-[#D4AF37]">{selectedDeal.id}</span>
              <h3 className="text-lg font-bold text-white">{selectedDeal.title}</h3>
              <div className="text-xs text-slate-400 mt-0.5">
                Buyer: <strong className="text-white">{selectedDeal.buyerName}</strong> · Seller: <strong className="text-white">{selectedDeal.sellerName}</strong>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">Contract Sum</div>
              <div className="text-lg font-bold text-white font-mono tabular-nums">
                {selectedDeal.amount.toLocaleString()} {selectedDeal.currency}
              </div>
            </div>
          </div>

          {/* Interactive Stage Progress Stepper */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Live Deal Execution Tracker
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {selectedDeal.stages.slice(0, 4).map((s, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-lg border space-y-1 ${
                    s.completed
                      ? 'bg-[#0B0E14] border-emerald-800 text-slate-300'
                      : 'bg-[#0B0E14]/40 border-white/5 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{s.label}</span>
                    {s.completed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-slate-600" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">{s.notes || 'Awaiting milestone'}</div>
                  {s.timestamp && (
                    <div className="font-mono text-[10px] text-[#D4AF37]">
                      {new Date(s.timestamp).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              {selectedDeal.stages.slice(4).map((s, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-lg border space-y-1 ${
                    s.completed
                      ? 'bg-[#0B0E14] border-emerald-800 text-slate-300'
                      : 'bg-[#0B0E14]/40 border-white/5 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{s.label}</span>
                    {s.completed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-slate-600" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">{s.notes || 'Stage in progress'}</div>
                </div>
              ))}
            </div>

            {/* Stage Action Trigger */}
            {!selectedDeal.stages.find((s) => s.stage === 'evidence')?.completed && (
              <div className="pt-4 flex items-center justify-between border-t border-white/10">
                <span className="text-xs text-slate-400">
                  Ready to certify deliverable evidence for this milestone?
                </span>
                <button
                  onClick={() => handleAdvanceStage('evidence')}
                  className="px-4 py-2 text-xs font-semibold text-[#0B0E14] bg-[#D4AF37] hover:bg-[#e0bc46] rounded transition-colors"
                >
                  Sign Off Deliverable Evidence
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
