import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Building2,
  FileText,
  Clock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface VerifyRecordViewProps {
  initialType?: 'business' | 'invoice' | 'contract';
  initialId?: string;
  onNavigateHome?: () => void;
}

export const VerifyRecordView: React.FC<VerifyRecordViewProps> = ({
  initialType = 'business',
  initialId = 'GOYE-BIZ-2026-000001',
}) => {
  const [recordType, setRecordType] = useState<'business' | 'invoice' | 'contract'>(initialType);
  const [lookupId, setLookupId] = useState<string>(initialId);
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [errorResult, setErrorResult] = useState<any | null>(null);

  const performVerification = async (type: string, id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setErrorResult(null);
    setVerificationResult(null);

    try {
      const res = await fetch(`/api/verify/${type}/${encodeURIComponent(id.trim())}`);
      const data = await res.json();

      if (res.ok && data.found) {
        setVerificationResult(data);
      } else {
        setErrorResult(data);
      }
    } catch (err) {
      setErrorResult({
        found: false,
        referenceId: id,
        status: 'NETWORK ERROR',
        message: 'Could not contact GOYE verification server. Please retry.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      performVerification(recordType, initialId);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performVerification(recordType, lookupId);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header Banner */}
      <div className="space-y-3 text-center sm:text-left border-b border-white/10 pb-6">
        <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Official Public Verification</span>
          <span aria-hidden="true">·</span>
          <span>Server-Authenticated Registry</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Verify Official GOYE Records
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
          Enter any GOYE Business ID, Invoice Reference, or Contract ID to verify its authentic existence, current verification level, and official status.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-4">
        {/* Record Type Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Record Type:</span>
          {(['business', 'invoice', 'contract'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setRecordType(type);
                if (type === 'business' && !lookupId.startsWith('GOYE-BIZ')) setLookupId('GOYE-BIZ-2026-000001');
                if (type === 'invoice' && !lookupId.startsWith('INV-')) setLookupId('INV-2026-0104');
                if (type === 'contract' && !lookupId.startsWith('CTR-')) setLookupId('CTR-2026-0089');
              }}
              className={`px-3 py-1.5 rounded-md capitalize transition-colors ${
                recordType === type
                  ? 'bg-white text-slate-950 font-bold'
                  : 'bg-[#0B0E14] text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              required
              placeholder={
                recordType === 'business'
                  ? 'e.g. GOYE-BIZ-2026-000001'
                  : recordType === 'invoice'
                  ? 'e.g. INV-2026-0104'
                  : 'e.g. CTR-2026-0089'
              }
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
              className="w-full bg-[#0B0E14] border border-white/10 rounded-md pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 text-xs font-semibold text-[#0B0E14] bg-[#D4AF37] hover:bg-[#e0bc46] disabled:opacity-50 rounded-md transition-colors whitespace-nowrap shrink-0 shadow-sm"
          >
            {loading ? 'Verifying...' : 'Verify Record'}
          </button>
        </form>
      </div>

      {/* Verification Result Card */}
      {verificationResult && (
        <div className="p-6 sm:p-8 rounded-xl bg-[#121620] border border-emerald-800/60 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-700 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Authentic Record Found
                </div>
                <div className="text-base sm:text-lg font-bold text-white">
                  {verificationResult.businessName || verificationResult.title || verificationResult.sellerName}
                </div>
              </div>
            </div>
            <div className="font-mono text-xs text-[#D4AF37] bg-white/5 px-3 py-1.5 rounded border border-white/10">
              {verificationResult.referenceId}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs text-slate-300">
            <div className="p-3.5 rounded bg-[#0B0E14] border border-white/5 space-y-1">
              <span className="text-slate-500 uppercase tracking-wider text-[10px]">Record Classification</span>
              <div className="font-semibold text-white">{verificationResult.recordType}</div>
            </div>

            <div className="p-3.5 rounded bg-[#0B0E14] border border-white/5 space-y-1">
              <span className="text-slate-500 uppercase tracking-wider text-[10px]">Official Status</span>
              <div className="font-semibold text-[#D4AF37]">
                {verificationResult.verificationStatusLabel || verificationResult.status}
              </div>
            </div>

            <div className="p-3.5 rounded bg-[#0B0E14] border border-white/5 space-y-1">
              <span className="text-slate-500 uppercase tracking-wider text-[10px]">Registry Issuer</span>
              <div className="font-semibold text-white">{verificationResult.officialIssuer}</div>
            </div>

            {verificationResult.registeredDate && (
              <div className="p-3.5 rounded bg-[#0B0E14] border border-white/5 space-y-1">
                <span className="text-slate-500 uppercase tracking-wider text-[10px]">Registration Timestamp</span>
                <div className="font-mono text-slate-300">
                  {new Date(verificationResult.registeredDate).toLocaleDateString()}
                </div>
              </div>
            )}

            {verificationResult.lastVerifiedAt && (
              <div className="p-3.5 rounded bg-[#0B0E14] border border-white/5 space-y-1">
                <span className="text-slate-500 uppercase tracking-wider text-[10px]">Last Audit Verification</span>
                <div className="font-mono text-slate-300">
                  {new Date(verificationResult.lastVerifiedAt).toLocaleString()}
                </div>
              </div>
            )}

            {verificationResult.total && (
              <div className="p-3.5 rounded bg-[#0B0E14] border border-white/5 space-y-1">
                <span className="text-slate-500 uppercase tracking-wider text-[10px]">Invoice Total</span>
                <div className="font-mono text-white font-bold tabular-nums">{verificationResult.total}</div>
              </div>
            )}

            {verificationResult.contractHash && (
              <div className="p-3.5 rounded bg-[#0B0E14] border border-white/5 space-y-1 sm:col-span-2">
                <span className="text-slate-500 uppercase tracking-wider text-[10px]">Audit Hash</span>
                <div className="font-mono text-[11px] text-slate-400 truncate">{verificationResult.contractHash}</div>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-500 border-t border-white/5 pt-3 leading-relaxed">
            Note: This verification record is served directly from the GOYE Hub persistent database. Personal contact details and private banking information are withheld to protect participant privacy.
          </div>
        </div>
      )}

      {/* Error / Not Found Result */}
      {errorResult && (
        <div className="p-6 sm:p-8 rounded-xl bg-[#121620] border border-red-900/60 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-950/80 border border-red-800 flex items-center justify-center text-red-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-red-400 uppercase tracking-wider">
                Record Not Found
              </div>
              <div className="text-base font-bold text-white font-mono">
                {errorResult.referenceId}
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {errorResult.message || 'No record matches this identifier in the GOYE Hub registry. Please confirm the reference code with the issuing party.'}
          </p>
        </div>
      )}
    </div>
  );
};
