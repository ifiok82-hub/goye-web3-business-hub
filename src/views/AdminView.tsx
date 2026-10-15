import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Lock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building2,
  RefreshCw,
  Search,
  Check,
  X,
  Server,
  Layers,
  Package,
  ShieldCheck,
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [overview, setOverview] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Verification modal / action
  const [adminProducts, setAdminProducts] = useState<any[]>([]);
  const [verifyingBusinessId, setVerifyingBusinessId] = useState<string | null>(null);
  const [newVerificationLevel, setNewVerificationLevel] = useState<number>(3);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Reconciliation modal / action
  const [reconcilingInvoiceId, setReconcilingInvoiceId] = useState<string | null>(null);
  const [verifiedReferenceInput, setVerifiedReferenceInput] = useState('');
  const [reconciliationNotes, setReconciliationNotes] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminKey.trim()) return;

    setLoading(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/admin/overview', {
        headers: {
          'x-admin-key': adminKey.trim(),
        },
      });

      const data = await res.json();
      if (res.ok) {
        setIsAuthenticated(true);
        setOverview(data);
        // Also fetch 15 products
        fetchAdminProducts(adminKey.trim());
      } else {
        setAuthError(data.error || 'Invalid administrative key.');
      }
    } catch (err) {
      setAuthError('Connection failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminProducts = async (key = adminKey) => {
    try {
      const res = await fetch('/api/admin/products', {
        headers: { 'x-admin-key': key },
      });
      const pData = await res.json();
      if (res.ok) {
        setAdminProducts(pData.products || []);
      }
    } catch (e) {
      // Ignore product fetch errors
    }
  };

  const fetchOverview = async () => {
    if (!adminKey) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/overview', {
        headers: { 'x-admin-key': adminKey },
      });
      const data = await res.json();
      if (res.ok) {
        setOverview(data);
      }
      await fetchAdminProducts();
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProductStatus = async (productId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'archived' : 'active';
    try {
      const res = await fetch(`/api/admin/products/${productId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionSuccess(`Product ${productId} status changed to ${newStatus}.`);
        fetchAdminProducts();
        setTimeout(() => setActionSuccess(null), 3000);
      } else {
        setActionError(data.error || 'Failed to update status.');
      }
    } catch (err) {
      setActionError('Error changing product status.');
    }
  };

  const handleUpdateVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingBusinessId) return;

    try {
      const res = await fetch(`/api/admin/verifications/${verifyingBusinessId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({
          newLevel: newVerificationLevel,
          notes: verificationNotes,
          decision: 'approve',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setActionSuccess(`Business verification advanced to Level ${newVerificationLevel}.`);
        setVerifyingBusinessId(null);
        setVerificationNotes('');
        setActionError(null);
        fetchOverview();
        setTimeout(() => setActionSuccess(null), 3000);
      } else {
        setActionError(data.error || 'Failed to update verification level.');
      }
    } catch (err) {
      setActionError('Failed to update verification level. Connection error.');
    }
  };

  const handleReconcileInvoice = async (decision: 'APPROVE_PAID' | 'REJECT') => {
    if (!reconcilingInvoiceId) return;

    if (decision === 'APPROVE_PAID' && !verifiedReferenceInput.trim()) {
      setActionError('Verified bank/provider transaction reference is required to approve payment.');
      return;
    }

    setActionError(null);
    try {
      const res = await fetch(`/api/admin/invoices/${reconcilingInvoiceId}/reconcile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({
          decision,
          verifiedReference: verifiedReferenceInput.trim(),
          notes: reconciliationNotes.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setActionSuccess(data.message);
        setReconcilingInvoiceId(null);
        setVerifiedReferenceInput('');
        setReconciliationNotes('');
        setActionError(null);
        fetchOverview();
        setTimeout(() => setActionSuccess(null), 3000);
      } else {
        setActionError(data.error || 'Reconciliation failed.');
      }
    } catch (err) {
      setActionError('Reconciliation network error. Please retry.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 space-y-6">
        <div className="p-8 rounded-xl bg-[#121620] border border-white/10 space-y-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#123B72]/40 border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] mx-auto">
            <Lock className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Administrative Console
            </h2>
            <p className="text-xs text-slate-400">
              Server-side authorization is strictly enforced. Enter authorized key to access compliance review and payment reconciliation.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs text-left">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Administrative Secret</label>
              <input
                type="password"
                required
                placeholder="Enter GOYE_ADMIN_SECRET..."
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="w-full bg-[#0B0E14] border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Configured securely in server deployment environment as GOYE_ADMIN_SECRET.
              </span>
            </div>

            {authError && (
              <div className="p-2.5 rounded bg-red-950/40 border border-red-800 text-xs text-red-300 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-xs font-semibold text-[#0B0E14] bg-[#D4AF37] hover:bg-[#e0bc46] disabled:opacity-50 rounded-md transition-colors"
            >
              {loading ? 'Authenticating...' : 'Authorize Admin Session'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Authorized Administrator Session</span>
            <span aria-hidden="true">·</span>
            <span>Server Authenticated</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Governance & Reconciliation Desk
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOverview}
            className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-[#121620] border border-white/10 rounded flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => {
              setIsAuthenticated(false);
              setAdminKey('');
            }}
            className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 bg-red-950/30 border border-red-900 rounded"
          >
            End Session
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 font-medium">
          {actionSuccess}
        </div>
      )}

      {actionError && (
        <div className="p-3 rounded-lg bg-red-950/40 border border-red-800 text-xs text-red-300 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* 1. Database Architecture Status Banner */}
      {overview?.databaseStatus && (
        <div className="p-5 rounded-xl bg-[#121620] border border-white/10 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-white">
              <Server className="w-4 h-4 text-[#D4AF37]" />
              <span>Database Persistence Layer</span>
            </div>
            <span className="font-mono text-[11px] text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded">
              {overview.databaseStatus.adapterType}
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            {overview.databaseStatus.statusReport}
          </p>
          <div className="text-[11px] font-mono text-slate-500 pt-1">
            Storage file: {overview.databaseStatus.dbFilePath}
          </div>
        </div>
      )}

      {/* 2. Payment Reconciliation Queue (Pending / Under Review) */}
      <div className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h2 className="text-base font-bold text-white">Payment Evidence Reconciliation Queue</h2>
            <p className="text-xs text-slate-400">
              Only authorized staff can mark an invoice as PAID upon verified statement credit.
            </p>
          </div>
          <span className="text-xs font-mono text-[#D4AF37]">
            {overview?.invoicesUnderReview?.length || 0} Invoices Queued
          </span>
        </div>

        {overview?.invoicesUnderReview?.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            No invoices currently awaiting payment reconciliation.
          </div>
        ) : (
          <div className="divide-y divide-white/5 text-xs">
            {overview?.invoicesUnderReview?.map((inv: any) => (
              <div key={inv.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="font-bold text-white">{inv.id}</span>
                    <span className="text-amber-400 bg-amber-950/60 border border-amber-800 px-1.5 py-0.2 rounded text-[10px]">
                      {inv.status}
                    </span>
                  </div>
                  <div className="text-slate-300">
                    Buyer: <strong className="text-white">{inv.buyerName}</strong> ({inv.buyerEmail})
                  </div>
                  <div className="text-slate-400">
                    Seller: {inv.sellerName} ({inv.sellerBusinessId})
                  </div>
                  {inv.paymentEvidenceReference && (
                    <div className="text-[#D4AF37] font-mono text-[11px]">
                      Submitted Ref: <strong>{inv.paymentEvidenceReference}</strong> ({inv.paymentEvidenceNotes || 'N/A'})
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="font-mono text-sm font-bold text-white tabular-nums">
                      {inv.total.toLocaleString()} {inv.currency}
                    </div>
                    <div className="text-[10px] text-slate-500">{inv.paymentMethod}</div>
                  </div>

                  <button
                    onClick={() => {
                      setReconcilingInvoiceId(inv.id);
                      setVerifiedReferenceInput(inv.paymentEvidenceReference || '');
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-[#0B0E14] bg-[#D4AF37] hover:bg-[#e0bc46] rounded"
                  >
                    Reconcile Settlement
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Verification Promotion Queue */}
      <div className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h2 className="text-base font-bold text-white">Business Verification Queue</h2>
            <p className="text-xs text-slate-400">
              Audit corporate documentation and assign transparent verification levels (1 to 5).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {overview?.metrics?.totalBusinesses && (
            <div className="p-4 rounded-lg bg-[#0B0E14] border border-white/5 space-y-2">
              <span className="text-slate-400">Pending Review Desks</span>
              <div className="text-xl font-bold text-white font-mono">
                {overview.metrics.pendingVerificationsCount}
              </div>
              <p className="text-[11px] text-slate-500">
                Level 2 businesses requiring documentation audit before advancing to Level 3.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 4. 15-Product Infrastructure Catalog Management */}
      <div className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-[#D4AF37]" />
              <span>15-Product Infrastructure Catalog Management</span>
            </h2>
            <p className="text-xs text-slate-400">
              Audit catalog solutions, pricing models across NGN/USD/Pi, and control publication status.
            </p>
          </div>
          <span className="text-xs font-mono text-[#D4AF37]">
            {adminProducts.length} Solutions Registered
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Product / ID</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Pricing (NGN / USD / Pi)</th>
                <th className="py-2.5 px-3">Seller</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {adminProducts.map((prd: any) => (
                <tr key={prd.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-white max-w-xs">{prd.title}</div>
                    <div className="text-[10px] font-mono text-slate-500">{prd.id}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-[#D4AF37]">
                      {prd.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <div className="text-white font-semibold">₦{prd.priceNGN?.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400">${prd.priceUSD} · {prd.pricePi || (prd.priceNGN / 15000).toFixed(2)} π</div>
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    <div>{prd.sellerBusinessName || prd.businessId}</div>
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Level {prd.sellerVerificationLevel || 4}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        prd.status === 'active'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950/60 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {prd.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleToggleProductStatus(prd.id, prd.status)}
                      className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                        prd.status === 'active'
                          ? 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800'
                          : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {prd.status === 'active' ? 'Archive' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Immutable Audit Logs (Read-Only) */}
      <div className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h2 className="text-base font-bold text-white">Immutable Platform Audit Ledger</h2>
            <p className="text-xs text-slate-400">
              Read-only system audit trail. All actions are permanently logged.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {overview?.metrics?.totalAuditLogs} Records Total
          </span>
        </div>

        <div className="divide-y divide-white/5 max-h-96 overflow-y-auto text-xs">
          {overview?.recentAuditLogs?.map((log: any) => (
            <div key={log.id} className="py-2.5 flex items-start justify-between gap-4 font-mono text-[11px]">
              <div className="space-y-0.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-[#D4AF37] font-bold">{log.eventType}</span>
                  <span className="text-slate-500">[{log.actor}]</span>
                  <span className="text-slate-400">→ {log.entityId}</span>
                </div>
                <div className="text-slate-300 font-sans text-xs">{log.details}</div>
              </div>
              <div className="text-slate-500 text-[10px] shrink-0">
                {new Date(log.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Invoice Reconciliation */}
      {reconcilingInvoiceId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121620] border border-white/15 rounded-xl max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">Reconcile Invoice {reconcilingInvoiceId}</h3>
              <button onClick={() => setReconcilingInvoiceId(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-400 leading-relaxed">
              Verify that the settlement reference corresponds to actual credit on the corporate bank ledger or payment provider.
            </p>

            {actionError && (
              <div className="p-2.5 rounded bg-red-950/40 border border-red-800 text-xs text-red-300 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Confirmed Bank / Gateway Credit Reference *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TXN-BANK-NGN-9842104"
                  value={verifiedReferenceInput}
                  onChange={(e) => setVerifiedReferenceInput(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-white/10 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Reconciliation Audit Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Verified on corporate banking statement credit..."
                  value={reconciliationNotes}
                  onChange={(e) => setReconciliationNotes(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => handleReconcileInvoice('REJECT')}
                className="px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/40 border border-red-900 rounded"
              >
                Reject Evidence
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReconcilingInvoiceId(null)}
                  className="px-3 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleReconcileInvoice('APPROVE_PAID')}
                  className="px-4 py-2 font-semibold text-[#0B0E14] bg-[#D4AF37] hover:bg-[#e0bc46] rounded"
                >
                  Approve as PAID
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
