import React, { useState, useEffect } from 'react';
import { generateQrDataUrl } from '../utils/qrCode';
import { ASSETS } from '../constants/assets';
import {
  FileText,
  FileCheck2,
  Plus,
  QrCode,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Calendar,
  X,
  Printer,
  ShieldAlert,
} from 'lucide-react';

interface DigitalInvoice {
  id: string;
  sellerBusinessId: string;
  sellerName: string;
  buyerName: string;
  buyerEmail: string;
  buyerCompany?: string;
  items: Array<{ description: string; quantity: number; unitPrice: number; amount: number }>;
  subtotal: number;
  taxRatePercent: number;
  taxAmount: number;
  total: number;
  currency: string;
  dueDate: string;
  notes: string;
  paymentMethod: string;
  status: string;
  paidAt?: string;
  paymentEvidenceReference?: string;
  paymentEvidenceNotes?: string;
  evidenceSubmittedAt?: string;
  reconciledBy?: string;
  verifiedTransactionReference?: string;
  qrVerificationHash: string;
  createdAt: string;
}

interface DigitalContract {
  id: string;
  title: string;
  clientName: string;
  clientEmail: string;
  clientBusinessId?: string;
  providerBusinessId: string;
  providerName: string;
  serviceDescription: string;
  deliverables: string[];
  totalValue: number;
  currency: string;
  milestones: Array<{
    title: string;
    description: string;
    amount: number;
    dueDate: string;
    status: string;
  }>;
  startDate: string;
  deadlineDate: string;
  paymentTerms: string;
  cancellationTerms: string;
  disputeInstructions: string;
  clientSignedAt?: string;
  providerSignedAt: string;
  status: string;
  legalDisclaimer: string;
  contractHash: string;
  createdAt: string;
}

export const ContractsAndInvoicesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'contracts'>('invoices');
  const [invoices, setInvoices] = useState<DigitalInvoice[]>([]);
  const [contracts, setContracts] = useState<DigitalContract[]>([]);
  const [loading, setLoading] = useState(true);

  // Invoice creation modal
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [newInvBuyerName, setNewInvBuyerName] = useState('');
  const [newInvBuyerEmail, setNewInvBuyerEmail] = useState('');
  const [newInvBuyerCompany, setNewInvBuyerCompany] = useState('');
  const [newInvItemDesc, setNewInvItemDesc] = useState('');
  const [newInvItemQty, setNewInvItemQty] = useState(1);
  const [newInvItemPrice, setNewInvItemPrice] = useState(150000);
  const [newInvCurrency, setNewInvCurrency] = useState('NGN');

  // Contract creation modal
  const [showNewContractModal, setShowNewContractModal] = useState(false);
  const [contractTitle, setContractTitle] = useState('');
  const [contractClientName, setContractClientName] = useState('');
  const [contractClientEmail, setContractClientEmail] = useState('');
  const [contractServiceDesc, setContractServiceDesc] = useState('');
  const [contractTotalValue, setContractTotalValue] = useState(500000);

  // Preview modals
  const [viewingInvoice, setViewingInvoice] = useState<DigitalInvoice | null>(null);
  const [invoiceQrUrl, setInvoiceQrUrl] = useState('');
  const [settleRefInput, setSettleRefInput] = useState('');
  const [settleMessage, setSettleMessage] = useState<string | null>(null);

  const [viewingContract, setViewingContract] = useState<DigitalContract | null>(null);
  const [signMessage, setSignMessage] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, ctrRes] = await Promise.all([fetch('/api/invoices'), fetch('/api/contracts')]);
      const invData = await invRes.json();
      const ctrData = await ctrRes.json();
      setInvoices(invData.invoices || []);
      setContracts(ctrData.contracts || []);
    } catch (err) {
      console.error('Error fetching invoices/contracts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerBusinessId: 'GOYE-BIZ-2026-000001',
          buyerName: newInvBuyerName,
          buyerEmail: newInvBuyerEmail,
          buyerCompany: newInvBuyerCompany,
          currency: newInvCurrency,
          items: [
            {
              description: newInvItemDesc,
              quantity: newInvItemQty,
              unitPrice: newInvItemPrice,
            },
          ],
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowNewInvoiceModal(false);
        fetchData();
        handleOpenInvoiceDetail(data.invoice);
      }
    } catch (err) {
      console.error('Failed to create invoice:', err);
    }
  };

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: contractTitle,
          clientName: contractClientName,
          clientEmail: contractClientEmail,
          providerBusinessId: 'GOYE-BIZ-2026-000001',
          serviceDescription: contractServiceDesc,
          deliverables: ['Scope specification', 'Deliverable milestone 1', 'Final review sign-off'],
          totalValue: contractTotalValue,
          currency: 'NGN',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowNewContractModal(false);
        fetchData();
        setViewingContract(data.contract);
      }
    } catch (err) {
      console.error('Failed to create contract:', err);
    }
  };

  const handleOpenInvoiceDetail = async (inv: DigitalInvoice) => {
    setViewingInvoice(inv);
    setSettleMessage(null);
    const qr = await generateQrDataUrl(`${window.location.origin}/verify/invoice/${inv.id}`);
    setInvoiceQrUrl(qr);
  };

  const handleSettleInvoiceWithReference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingInvoice || !settleRefInput) return;

    try {
      const res = await fetch(`/api/invoices/${viewingInvoice.id}/submit-evidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionReference: settleRefInput,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSettleMessage('Payment evidence submitted. Status moved to UNDER REVIEW pending authorized reconciliation.');
        setViewingInvoice(data.invoice);
        fetchData();
      }
    } catch (err) {
      setSettleMessage('Submission failed. Please retry.');
    }
  };

  const handleSignContract = async () => {
    if (!viewingContract) return;

    try {
      const res = await fetch(`/api/contracts/${viewingContract.id}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) {
        setSignMessage('Contract countersigned. Status updated to Active.');
        setViewingContract(data.contract);
        fetchData();
      }
    } catch (err) {
      setSignMessage('Error signing contract.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
            <span>Commercial Coordination</span>
            <span aria-hidden="true">·</span>
            <span>Verifiable Business Records</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Digital Contracts & Invoices
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Create legally grounded commercial agreements and multi-currency invoices. Every document generates a cryptographic QR verification hash and immutable audit entry.
          </p>
        </div>

        {/* Tab switcher buttons */}
        <div className="flex items-center gap-2 p-1 bg-[#121620] border border-white/10 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2 rounded transition-colors ${
              activeTab === 'invoices'
                ? 'bg-white text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Digital Invoices ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab('contracts')}
            className={`px-4 py-2 rounded transition-colors ${
              activeTab === 'contracts'
                ? 'bg-white text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Digital Contracts ({contracts.length})
          </button>
        </div>
      </div>

      {/* Prominent Legal Disclaimer Banner (Mandatory) */}
      <div className="p-4 rounded-lg bg-[#121620] border border-white/10 flex items-start gap-3 text-xs text-slate-400">
        <ShieldAlert className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-200">Legal Practice Notice:</strong> Digital contract templates and invoice structures are provided for business convenience, operational milestone record-keeping, and coordination. They do not constitute formal legal counsel. Users should obtain licensed legal advice where required.
        </div>
      </div>

      {/* Photographic Contracts & Ledger Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#121620] border border-white/10 rounded-2xl overflow-hidden p-6 sm:p-8">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
            <span>Cryptographic Commercial Records</span>
            <span aria-hidden="true">·</span>
            <span>Milestone Sign-Off</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Verifiable Digital Contracts & Multi-Currency Ledger
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Eliminate invoice fraud and scope disputes with cryptographic SHA-256 signatures, verifiable milestone deliveries, and instant QR verification codes readable by accountants, auditors, and clients.
          </p>
          <div className="flex flex-wrap gap-2 text-xs pt-1">
            <span className="px-2.5 py-1 rounded bg-[#0B0E14] text-[#D4AF37] border border-[#D4AF37]/30 font-mono">
              ✓ SHA-256 Hash Seals
            </span>
            <span className="px-2.5 py-1 rounded bg-[#0B0E14] text-emerald-400 border border-emerald-800 font-mono">
              ✓ Multi-Currency (NGN/USD/Pi)
            </span>
            <span className="px-2.5 py-1 rounded bg-[#0B0E14] text-slate-300 border border-white/10 font-mono">
              ✓ Mutual Signatures
            </span>
          </div>
        </div>
        <div className="lg:col-span-5">
          <div className="relative rounded-xl overflow-hidden border border-white/15 bg-[#0B0E14] shadow-xl">
            <img
              src={ASSETS.contractsInvoices}
              alt="Professional businessperson reviewing a digital contract and invoice dashboard on a laptop"
              referrerPolicy="no-referrer"
              className="w-full h-56 sm:h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-transparent to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 text-[11px] text-slate-300 flex items-center justify-between">
              <span className="font-semibold text-white">Digital Contract & Ledger Record</span>
              <span className="text-[#D4AF37] font-mono">VERIFIABLE RECORD</span>
            </div>
          </div>
        </div>
      </div>

      {/* TAB 1: DIGITAL INVOICES */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Invoice Records</h2>
            <button
              onClick={() => setShowNewInvoiceModal(true)}
              className="px-4 py-2 text-xs font-semibold text-[#0B0E14] bg-[#D4AF37] hover:bg-[#e0bc46] rounded-md transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Invoice</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#121620]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B0E14] text-slate-400 uppercase tracking-wider border-b border-white/10 text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 font-mono">Invoice ID</th>
                  <th className="py-3.5 px-4">Client / Buyer</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4 text-right">Total Amount</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">{inv.id}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{inv.buyerName}</div>
                      <div className="text-[11px] text-slate-500">{inv.buyerEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{inv.dueDate}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white tabular-nums">
                      {inv.total.toLocaleString()} {inv.currency}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                            : inv.status === 'Under Review'
                            ? 'bg-blue-950/60 text-blue-300 border border-blue-800'
                            : 'bg-amber-950/60 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenInvoiceDetail(inv)}
                        className="text-[#D4AF37] hover:underline font-semibold"
                      >
                        View & Settle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DIGITAL CONTRACTS */}
      {activeTab === 'contracts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Commercial Agreements</h2>
            <button
              onClick={() => setShowNewContractModal(true)}
              className="px-4 py-2 text-xs font-semibold text-[#0B0E14] bg-[#D4AF37] hover:bg-[#e0bc46] rounded-md transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Draft New Contract</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contracts.map((ctr) => (
              <div
                key={ctr.id}
                className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-4 hover:border-[#D4AF37]/50 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>{ctr.id}</span>
                    <span className="text-[#D4AF37] font-sans font-semibold">{ctr.status}</span>
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight">{ctr.title}</h3>
                  <p className="text-xs text-slate-300 line-clamp-2">{ctr.serviceDescription}</p>

                  <div className="space-y-1 pt-2 text-xs text-slate-400 border-t border-white/5">
                    <div>Client: <strong className="text-white">{ctr.clientName}</strong></div>
                    <div>Provider: <strong className="text-white">{ctr.providerName}</strong></div>
                    <div>Milestones: {ctr.milestones.length} defined stages</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="text-sm font-bold text-white font-mono tabular-nums">
                    {ctr.totalValue.toLocaleString()} {ctr.currency}
                  </div>
                  <button
                    onClick={() => setViewingContract(ctr)}
                    className="px-3 py-1.5 text-xs font-semibold text-[#0B0E14] bg-[#D4AF37] rounded transition-colors"
                  >
                    Review & Sign
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invoice Detail / Settle Modal */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121620] border border-white/15 rounded-xl max-w-xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono text-[#D4AF37]">{viewingInvoice.id}</span>
                <h3 className="text-xl font-bold text-white">Commercial Invoice</h3>
                <p className="text-xs text-slate-400">Issued by {viewingInvoice.sellerName}</p>
              </div>
              <button onClick={() => setViewingInvoice(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* QR Code and Status Strip */}
            <div className="p-4 rounded-lg bg-[#0B0E14] border border-white/10 flex items-center gap-4">
              {invoiceQrUrl ? (
                <img src={invoiceQrUrl} alt="Invoice QR" className="w-24 h-24 rounded bg-white p-1 shrink-0" />
              ) : (
                <div className="w-24 h-24 rounded bg-white/5 flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-slate-500" />
                </div>
              )}
              <div className="space-y-1 text-xs text-slate-400">
                <div className="font-semibold text-white">Status: {viewingInvoice.status}</div>
                <div>Due Date: {viewingInvoice.dueDate}</div>
                {viewingInvoice.verifiedTransactionReference && (
                  <div className="font-mono text-[#D4AF37] text-[11px]">
                    Verified Ref: {viewingInvoice.verifiedTransactionReference}
                  </div>
                )}
                <div className="text-[10px] font-mono text-slate-500 truncate max-w-xs">
                  Hash: {viewingInvoice.qrVerificationHash.slice(0, 24)}...
                </div>
              </div>
            </div>

            {/* Invoice Line Items */}
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Items Billed</div>
              <div className="divide-y divide-white/5 border border-white/10 rounded-lg bg-[#0B0E14]/40 text-xs">
                {viewingInvoice.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">{item.description}</div>
                      <div className="text-slate-500 text-[11px]">Qty: {item.quantity}</div>
                    </div>
                    <div className="font-mono text-white tabular-nums">
                      {item.amount.toLocaleString()} {viewingInvoice.currency}
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-2 text-right text-xs space-y-1 text-slate-400">
                <div>Subtotal: {viewingInvoice.subtotal.toLocaleString()} {viewingInvoice.currency}</div>
                <div>VAT ({viewingInvoice.taxRatePercent}%): {viewingInvoice.taxAmount.toLocaleString()} {viewingInvoice.currency}</div>
                <div className="text-sm font-bold text-white font-mono tabular-nums">
                  Total: {viewingInvoice.total.toLocaleString()} {viewingInvoice.currency}
                </div>
              </div>
            </div>

            {/* Payment Settlement Action */}
            {viewingInvoice.status === 'Pending' ? (
              <form onSubmit={handleSettleInvoiceWithReference} className="p-4 rounded-lg bg-[#0B0E14] border border-white/10 space-y-3">
                <div className="text-xs font-semibold text-white">Submit Payment Evidence Reference</div>
                <p className="text-[11px] text-slate-400">
                  After initiating bank transfer, submit the official transaction reference. The invoice status will move to <strong className="text-blue-300">UNDER REVIEW</strong> until confirmed by authorized reconciliation.
                </p>
                <input
                  type="text"
                  required
                  placeholder="e.g. TXN-BANK-NGN-9842104"
                  value={settleRefInput}
                  onChange={(e) => setSettleRefInput(e.target.value)}
                  className="w-full bg-[#121620] border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
                {settleMessage && (
                  <div className="text-xs text-[#D4AF37] font-mono">{settleMessage}</div>
                )}
                <button
                  type="submit"
                  className="w-full py-2 text-xs font-semibold text-[#0B0E14] bg-[#D4AF37] rounded"
                >
                  Submit Payment Evidence (Moves to Under Review)
                </button>
              </form>
            ) : viewingInvoice.status === 'Under Review' ? (
              <div className="p-4 rounded-lg bg-blue-950/40 border border-blue-800 text-xs text-blue-200 space-y-1.5">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>Payment Evidence Under Review</span>
                </div>
                <p className="text-[11px] text-blue-300 leading-relaxed">
                  Reference <strong className="text-white font-mono">{viewingInvoice.paymentEvidenceReference || 'Submitted'}</strong> has been queued. Authorized reconciliation officers verify bank statement credit before an invoice is marked as PAID.
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 text-center font-medium space-y-1">
                <div>Payment verified on {new Date(viewingInvoice.paidAt!).toLocaleString()}</div>
                {viewingInvoice.paymentEvidenceReference && (
                  <div className="text-[11px] font-mono text-emerald-400">
                    Reconciled Reference: {viewingInvoice.paymentEvidenceReference}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contract Detail / Sign Modal */}
      {viewingContract && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121620] border border-white/15 rounded-xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono text-[#D4AF37]">{viewingContract.id}</span>
                <h3 className="text-xl font-bold text-white">{viewingContract.title}</h3>
                <p className="text-xs text-slate-400">Status: {viewingContract.status}</p>
              </div>
              <button onClick={() => setViewingContract(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 rounded bg-[#0B0E14] border border-white/10 grid grid-cols-2 gap-2">
                <div>Provider: <strong className="text-white">{viewingContract.providerName}</strong></div>
                <div>Client: <strong className="text-white">{viewingContract.clientName}</strong></div>
                <div>Start Date: {viewingContract.startDate}</div>
                <div>Deadline: {viewingContract.deadlineDate}</div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-1">Service Description</h4>
                <p className="text-slate-400">{viewingContract.serviceDescription}</p>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-1">Payment & Milestone Terms</h4>
                <p className="text-slate-400">{viewingContract.paymentTerms}</p>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-1">Dispute Instructions</h4>
                <p className="text-slate-400">{viewingContract.disputeInstructions}</p>
              </div>

              {/* Milestones list */}
              <div>
                <h4 className="font-semibold text-white mb-2">Milestone Schedule</h4>
                <div className="space-y-2">
                  {viewingContract.milestones.map((m, idx) => (
                    <div key={idx} className="p-3 rounded bg-[#0B0E14] border border-white/5 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">{m.title}</div>
                        <div className="text-[11px] text-slate-500">{m.description}</div>
                      </div>
                      <div className="font-mono text-[#D4AF37] tabular-nums">
                        {m.amount.toLocaleString()} {viewingContract.currency}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded bg-white/5 border border-white/10 font-mono text-[11px] text-slate-400 truncate">
                Contract Hash: sha256:{viewingContract.contractHash}
              </div>
            </div>

            {signMessage && (
              <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300">
                {signMessage}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setViewingContract(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
              {!viewingContract.clientSignedAt ? (
                <button
                  type="button"
                  onClick={handleSignContract}
                  className="px-5 py-2 text-xs font-semibold text-[#0B0E14] bg-[#D4AF37] hover:bg-[#e0bc46] rounded-md transition-colors"
                >
                  Countersign Contract
                </button>
              ) : (
                <div className="text-xs text-[#D4AF37] font-semibold">
                  Signed on {new Date(viewingContract.clientSignedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Invoice */}
      {showNewInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121620] border border-white/15 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">Generate Structured Invoice</h3>
              <button onClick={() => setShowNewInvoiceModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Buyer / Client Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Okafor"
                  value={newInvBuyerName}
                  onChange={(e) => setNewInvBuyerName(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Buyer Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. d.okafor@company.com"
                  value={newInvBuyerEmail}
                  onChange={(e) => setNewInvBuyerEmail(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Line Item Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Custom AI Assistant Workflow Setup"
                  value={newInvItemDesc}
                  onChange={(e) => setNewInvItemDesc(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Unit Price</label>
                  <input
                    type="number"
                    required
                    value={newInvItemPrice}
                    onChange={(e) => setNewInvItemPrice(Number(e.target.value))}
                    className="w-full bg-[#0B0E14] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Currency</label>
                  <select
                    value={newInvCurrency}
                    onChange={(e) => setNewInvCurrency(e.target.value)}
                    className="w-full bg-[#0B0E14] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="NGN">NGN (₦)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowNewInvoiceModal(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-[#0B0E14] bg-[#D4AF37] rounded"
                >
                  Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Contract */}
      {showNewContractModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121620] border border-white/15 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">Draft Commercial Contract</h3>
              <button onClick={() => setShowNewContractModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateContract} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Agreement Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Services Agreement"
                  value={contractTitle}
                  onChange={(e) => setContractTitle(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Client Entity Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Commodities Hub"
                  value={contractClientName}
                  onChange={(e) => setContractClientName(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Client Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. legal@apexcommodities.ng"
                  value={contractClientEmail}
                  onChange={(e) => setContractClientEmail(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Scope of Work</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe agreed deliverables, technical specifications, and timeline..."
                  value={contractServiceDesc}
                  onChange={(e) => setContractServiceDesc(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Total Contract Value (NGN)</label>
                <input
                  type="number"
                  required
                  value={contractTotalValue}
                  onChange={(e) => setContractTotalValue(Number(e.target.value))}
                  className="w-full bg-[#0B0E14] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowNewContractModal(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-[#0B0E14] bg-[#D4AF37] rounded"
                >
                  Create Contract Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Legal & Governance Notice */}
      <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          Commercial invoices and cryptographic contracts are software utilities subject to our{' '}
          <a href="/terms" className="text-[#D4AF37] hover:underline font-medium">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-[#D4AF37] hover:underline font-medium">
            Privacy Policy
          </a>
          .
        </div>
        <div className="text-[11px] text-slate-500">Does Not Constitute Formal Legal Advice · Non-Custodial</div>
      </div>
    </div>
  );
};
