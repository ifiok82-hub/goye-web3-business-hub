import React, { useState, useEffect } from 'react';
import { generateQrDataUrl } from '../utils/qrCode';
import {
  ShieldCheck,
  Search,
  ExternalLink,
  QrCode,
  Building2,
  FileCheck2,
  Phone,
  Mail,
  MapPin,
  Bot,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  X,
} from 'lucide-react';

interface Business {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  country: string;
  state: string;
  address: string;
  website: string;
  phone: string;
  email: string;
  socials: {
    x?: string;
    linkedin?: string;
    whatsapp?: string;
  };
  services: string[];
  products: string[];
  registrationInfo: string;
  documents: Array<{ name: string; type: string; uploadedAt: string; verified: boolean }>;
  paymentMethods: string[];
  verificationLevel: number;
  verificationHistory: Array<{
    level: number;
    label: string;
    timestamp: string;
    status: string;
    notes: string;
  }>;
  aiAssistantConfig: {
    enabled: boolean;
    name: string;
  };
  createdAt: string;
}

interface BusinessIdViewProps {
  onOpenCreateBusiness: () => void;
  onOpenAiAssistant: (businessId: string) => void;
}

export const BusinessIdView: React.FC<BusinessIdViewProps> = ({
  onOpenCreateBusiness,
  onOpenAiAssistant,
}) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  // Modal states
  const [activeBusiness, setActiveBusiness] = useState<Business | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Document upload modal state
  const [showDocUploadModal, setShowDocUploadModal] = useState(false);
  const [uploadDocName, setUploadDocName] = useState('');
  const [uploadDocType, setUploadDocType] = useState('CAC_INCORPORATION');
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      let url = '/api/business?';
      if (selectedCategory !== 'All') url += `category=${encodeURIComponent(selectedCategory)}&`;
      if (selectedLevel) url += `minLevel=${selectedLevel}&`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;

      const res = await fetch(url);
      const data = await res.json();
      setBusinesses(data.businesses || []);
    } catch (err) {
      console.error('Failed to load businesses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [selectedCategory, selectedLevel]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBusinesses();
  };

  const handleViewProfile = async (b: Business) => {
    setActiveBusiness(b);
    const verificationUrl = `${window.location.origin}/verify/business/${b.id}`;
    const qrUrl = await generateQrDataUrl(verificationUrl);
    setQrCodeDataUrl(qrUrl);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmitDocuments = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBusiness || !uploadDocName) return;

    try {
      const res = await fetch(`/api/business/${activeBusiness.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName: uploadDocName,
          documentType: uploadDocType,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUploadStatus('Document submitted. Verification updated to Level 2 (Documents Submitted).');
        setActiveBusiness(data.business);
        fetchBusinesses();
        setTimeout(() => {
          setShowDocUploadModal(false);
          setUploadStatus(null);
          setUploadDocName('');
        }, 1800);
      }
    } catch (err) {
      setUploadStatus('Failed to submit document. Please retry.');
    }
  };

  const verificationLevels = [
    { level: 1, label: 'Level 1: Registered Profile', desc: 'Basic business record created and unique ID assigned.' },
    { level: 2, label: 'Level 2: Documents Submitted', desc: 'CAC/TIN/Official identity files queued for review.' },
    { level: 3, label: 'Level 3: GOYE Reviewed', desc: 'Documentation & operating presence audited by compliance staff.' },
    { level: 4, label: 'Level 4: Identity Confirmed', desc: 'Director biometric identity and corporate validity verified.' },
    { level: 5, label: 'Level 5: Payment Enabled', desc: 'Direct merchant payment verification active across all gateways.' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
            <span>Official Identity Protocol</span>
            <span aria-hidden="true">·</span>
            <span>Cryptographic Registry</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            GOYE Business ID Registry
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Every registered enterprise receives a tamper-evident digital identity (e.g.{' '}
            <span className="font-mono text-slate-300">GOYE-BIZ-2026-000001</span>) with transparent verification history and scannable QR verification.
          </p>
        </div>

        <button
          onClick={onOpenCreateBusiness}
          className="px-5 py-2.5 text-xs font-semibold text-[#0B0E14] bg-[#D4AF37] hover:bg-[#e0bc46] rounded-md transition-colors shadow-sm whitespace-nowrap shrink-0"
        >
          Register New Business Profile
        </button>
      </div>

      {/* 5 Transparent Verification Levels Explanation Strip */}
      <div className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/10 pb-3">
          <span className="font-semibold text-white">Transparent Verification Hierarchy</span>
          <span>No unverified claims or false certifications</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {verificationLevels.map((lvl) => {
            const isFilterActive = selectedLevel === lvl.level;
            return (
              <button
                key={lvl.level}
                onClick={() => setSelectedLevel(isFilterActive ? null : lvl.level)}
                className={`text-left p-3 rounded-lg border transition-all ${
                  isFilterActive
                    ? 'bg-[#123B72]/40 border-[#D4AF37] ring-1 ring-[#D4AF37]'
                    : 'bg-[#0B0E14]/60 border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono text-[#D4AF37] pb-1">
                  <span>LEVEL {lvl.level}</span>
                  {isFilterActive && <Check className="w-3.5 h-3.5 text-[#D4AF37]" />}
                </div>
                <div className="text-xs font-semibold text-white">{lvl.label.replace(`Level ${lvl.level}: `, '')}</div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">{lvl.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by ID, business name, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#121620] border border-white/10 text-white text-xs rounded-md pl-9 pr-4 py-2.5 focus:outline-none focus:border-[#D4AF37]"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 text-xs text-slate-400">
          <span className="whitespace-nowrap shrink-0">Filter:</span>
          {['All', 'Software & Digital Infrastructure', 'Education & Training', 'Logistics & Supply Chain'].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-white text-slate-950 font-semibold'
                    : 'bg-[#121620] text-slate-300 hover:text-white border border-white/10'
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>
      </div>

      {/* Business Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-sm text-slate-500 font-mono">
          Loading verified business registry...
        </div>
      ) : businesses.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <Building2 className="w-8 h-8 text-slate-500 mx-auto" />
          <div className="text-sm font-semibold text-white">No businesses found matching this query</div>
          <p className="text-xs text-slate-400">
            Try adjusting your search query or reset your level filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedLevel(null);
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/15 rounded-md"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((b) => (
            <div
              key={b.id}
              className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-5 flex flex-col justify-between hover:border-[#D4AF37]/50 transition-colors"
            >
              <div className="space-y-3">
                {/* Header line: unboxed metadata */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-mono text-slate-400">
                    <span>{b.id}</span>
                    <button
                      onClick={() => handleCopy(b.id, b.id)}
                      className="hover:text-white"
                      title="Copy Business ID"
                    >
                      {copiedId === b.id ? (
                        <Check className="w-3 h-3 text-[#D4AF37]" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-500" />
                      )}
                    </button>
                  </div>
                  <div className="text-xs font-semibold text-[#D4AF37]">
                    Level {b.verificationLevel} Confirmed
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">{b.name}</h3>
                  <p className="text-xs text-[#D4AF37] font-medium mt-0.5">{b.tagline}</p>
                </div>

                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                  {b.description}
                </p>

                <div className="space-y-1.5 pt-2 text-xs text-slate-400 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">
                      {b.state}, {b.country}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{b.registrationInfo}</span>
                  </div>
                </div>

                {/* Services preview */}
                <div className="pt-2">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Verified Services
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-300">
                    {b.services.slice(0, 3).map((s, idx) => (
                      <span key={idx} className="bg-white/5 px-2 py-0.5 rounded text-slate-300">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/10 flex items-center gap-2">
                <button
                  onClick={() => handleViewProfile(b)}
                  className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/15 rounded-md transition-colors text-center"
                >
                  View Profile & QR
                </button>
                <button
                  onClick={() => onOpenAiAssistant(b.id)}
                  className="px-3 py-2 text-xs font-medium text-[#D4AF37] bg-[#123B72]/30 hover:bg-[#123B72]/50 border border-[#D4AF37]/30 rounded-md transition-colors flex items-center gap-1.5"
                  title="Ask Business AI Assistant"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>AI Inquire</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Single Business Profile Full Modal */}
      {activeBusiness && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121620] border border-white/15 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
                  <span>{activeBusiness.id}</span>
                  <span className="text-[#D4AF37] font-sans font-semibold">
                    Level {activeBusiness.verificationLevel}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {activeBusiness.name}
                </h2>
                <p className="text-xs text-[#D4AF37]">{activeBusiness.tagline}</p>
              </div>
              <button
                onClick={() => setActiveBusiness(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* QR Code Verification Card */}
            <div className="p-4 rounded-lg bg-[#0B0E14] border border-white/10 flex flex-col sm:flex-row items-center gap-5">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="Verifiable QR Code"
                  className="w-32 h-32 rounded bg-white p-1 shrink-0"
                />
              ) : (
                <div className="w-32 h-32 rounded bg-white/5 flex items-center justify-center shrink-0">
                  <QrCode className="w-8 h-8 text-slate-500" />
                </div>
              )}
              <div className="space-y-1.5 text-center sm:text-left text-xs text-slate-400">
                <div className="font-semibold text-white">Official Registry Verification QR Code</div>
                <p className="text-[11px] leading-relaxed">
                  Points directly to the official server verification endpoint <code className="text-[#D4AF37] font-mono">/verify/business/{activeBusiness.id}</code>. Publicly confirms registered status and verification level.
                </p>
                <div className="font-mono text-[11px] text-slate-500 truncate max-w-xs">
                  Reference: VRF-BIZ-{activeBusiness.id.replace(/[^0-9]/g, '')}
                </div>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.download = `${activeBusiness.id}-qr-badge.png`;
                    link.href = qrCodeDataUrl;
                    link.click();
                  }}
                  className="inline-block mt-1 text-xs font-medium text-[#D4AF37] hover:underline"
                >
                  Download Official QR Badge
                </button>
              </div>
            </div>

            {/* Verification History Audit Trail */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Official Verification Audit Trail
              </h4>
              <div className="space-y-2">
                {activeBusiness.verificationHistory.map((h, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-[#0B0E14]/60 border border-white/5 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Level {h.level}: {h.label}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{h.notes}</p>
                    </div>
                    <span className="font-mono text-[10px] text-slate-500 shrink-0">
                      {new Date(h.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact & Direct Handoff */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300 pt-2 border-t border-white/10">
              <div className="space-y-1">
                <span className="text-slate-500">Corporate Email:</span>
                <div className="font-mono text-white">{activeBusiness.email}</div>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500">Official Phone:</span>
                <div className="font-mono text-white">{activeBusiness.phone || 'Upon inquiry'}</div>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500">Operating Address:</span>
                <div className="text-white">{activeBusiness.address}</div>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500">Settlement Options:</span>
                <div className="text-[#D4AF37]">{activeBusiness.paymentMethods.join(', ')}</div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setShowDocUploadModal(true)}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white border border-white/15 rounded-md flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Submit Verification Documents</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const id = activeBusiness.id;
                    setActiveBusiness(null);
                    onOpenAiAssistant(id);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-[#0B0E14] bg-[#D4AF37] hover:bg-[#e0bc46] rounded-md transition-colors flex items-center gap-1.5"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Launch AI Assistant</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Upload Sub-Modal */}
      {showDocUploadModal && activeBusiness && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121620] border border-white/15 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">Submit Documentation</h3>
              <button onClick={() => setShowDocUploadModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload compliance documents to advance to <strong className="text-white">Level 2: Documents Submitted</strong>. Documents are audited by GOYE compliance reviewers.
            </p>

            <form onSubmit={handleSubmitDocuments} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Document Filename / Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CAC_Certificate_RC_1984203.pdf"
                  value={uploadDocName}
                  onChange={(e) => setUploadDocName(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-white/10 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Document Category
                </label>
                <select
                  value={uploadDocType}
                  onChange={(e) => setUploadDocType(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-white/10 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="CAC_INCORPORATION">CAC Certificate of Incorporation</option>
                  <option value="TIN_TAX_CERT">Tax Identification Certificate (TIN)</option>
                  <option value="DIRECTOR_GOVT_ID">Director NIN / National Passport</option>
                  <option value="OPERATIONAL_PERMIT">Sector Regulatory Operating Permit</option>
                </select>
              </div>

              {uploadStatus && (
                <div className="p-2.5 rounded bg-[#123B72]/30 border border-[#D4AF37]/30 text-xs text-[#D4AF37]">
                  {uploadStatus}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDocUploadModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-[#0B0E14] bg-[#D4AF37] hover:bg-[#e0bc46] rounded-md transition-colors"
                >
                  Queue for Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
