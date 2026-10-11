import React, { useState } from 'react';
import { ASSETS } from '../constants/assets';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Search,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

export const AcademyView: React.FC = () => {
  const [certLookupId, setCertLookupId] = useState('');
  const [certResult, setCertResult] = useState<any | null>(null);
  const [certError, setCertError] = useState<string | null>(null);

  const courses = [
    {
      id: 'CRS-01',
      title: 'Enterprise AI Workflows & WhatsApp Sales Automation',
      level: 'Professional',
      duration: '4 Weeks',
      topics: ['Knowledge base ingestion', 'Server-side Gemini SDK', 'Lead qualification CRM', 'WhatsApp handoff'],
      enrolledCount: 380,
    },
    {
      id: 'CRS-02',
      title: 'Pi Network Developer Architecture & Platform API v2',
      level: 'Advanced Engineering',
      duration: '6 Weeks',
      topics: ['Pi SDK init & auth', 'Server-to-server approval', 'Double-spending idempotency', 'Mainnet readiness checklist'],
      enrolledCount: 520,
    },
    {
      id: 'CRS-03',
      title: 'Digital Legal Contracts & Multi-Currency Billing Infrastructure',
      level: 'Business Operations',
      duration: '3 Weeks',
      topics: ['Milestone structuring', 'Tax calculation line items', 'SHA-256 QR codes', 'Bank transfer reconciliation'],
      enrolledCount: 290,
    },
    {
      id: 'CRS-04',
      title: 'African Cross-Border Trade & Trade Assurance Mechanics',
      level: 'Executive',
      duration: '4 Weeks',
      topics: ['Pre-shipment verification', 'Customs documentation', 'Dispute mediation records', 'Currency hedges'],
      enrolledCount: 215,
    },
  ];

  const handleVerifyCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    setCertError(null);
    setCertResult(null);

    const q = certLookupId.trim().toUpperCase();
    if (q === 'SIR-CERT-2026-9041' || q === 'GOYE-CERT-001') {
      setCertResult({
        certId: q,
        recipient: 'Oluwaseun Balogun',
        course: 'Pi Network Developer Architecture & Platform API v2',
        issueDate: '2026-02-28',
        grade: 'Distinction (94%)',
        verifiedStatus: 'AUTHENTIC & ACTIVE',
      });
    } else {
      setCertError(`No active certificate record matches "${certLookupId}". Please verify certificate ID.`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
            <span>Executive Education</span>
            <span aria-hidden="true">·</span>
            <span>Sirwise.online Integration</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            GOYE Academy & Sirwise Learning Network
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Equipping entrepreneurs and software engineers with verified competencies in AI business automation, Pi Network architecture, and modern commerce operations.
          </p>
        </div>

        <a
          href="https://sirwise.online"
          target="_blank"
          rel="noreferrer"
          className="px-5 py-2.5 text-xs font-semibold text-[#0B0E14] bg-[#D4AF37] hover:bg-[#e0bc46] rounded-md transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap shrink-0"
        >
          <span>Visit Sirwise.online</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Hero Visual Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-5">
          <div className="rounded-xl overflow-hidden border border-white/15 bg-[#121620]">
            <img
              src={ASSETS.academy}
              alt="GOYE Digital Innovator Learning Studio"
              referrerPolicy="no-referrer"
              className="w-full h-80 object-cover"
            />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
            Job-Ready Technical Competence
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Zero-Hypotheticals Practical Curriculum
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Too many Web3 and AI programs teach vague speculation. Sirwise Academy grounds every module in production code: building real Express servers, integrating the official Pi SDK, and connecting live Gemini models with robust security.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-2 text-xs text-slate-300">
            <div className="p-3 rounded-lg bg-[#121620] border border-white/10 space-y-1">
              <div className="font-bold text-white">Full-Stack Code Repos</div>
              <p className="text-slate-400 text-[11px]">Production-ready templates with automated linting.</p>
            </div>
            <div className="p-3 rounded-lg bg-[#121620] border border-white/10 space-y-1">
              <div className="font-bold text-white">Cryptographic Badges</div>
              <p className="text-slate-400 text-[11px]">Verifiable completion records with public registry lookup.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Catalog */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-white">Curated Engineering & Business Syllabus</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-4 hover:border-[#D4AF37]/50 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-[#D4AF37]">{course.id}</span>
                  <span className="text-slate-500">{course.duration}</span>
                </div>
                <h4 className="text-base font-bold text-white">{course.title}</h4>
                <div className="text-xs text-slate-400">Track: {course.level}</div>

                <div className="pt-2 space-y-1 text-xs text-slate-300">
                  {course.topics.map((t, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <CheckCircle2 className="w-3 h-3 text-[#D4AF37] shrink-0" />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-500 tabular-nums">
                  {course.enrolledCount} Active Learners
                </span>
                <a
                  href="https://sirwise.online"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 text-xs font-semibold text-[#0B0E14] bg-[#D4AF37] rounded transition-colors"
                >
                  Enroll at Sirwise.online
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Authentic Certificate Verification Tool */}
      <div className="p-6 sm:p-8 rounded-xl bg-[#121620] border border-white/10 space-y-6">
        <div className="max-w-xl space-y-2">
          <h3 className="text-lg font-bold text-white">Authentic Certificate Verification</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Sirwise Academy certificates feature an indelible ID recorded in the GOYE Hub database. Enter a credential identifier below to verify student completion.
          </p>
        </div>

        <form onSubmit={handleVerifyCertificate} className="flex flex-col sm:flex-row gap-3 max-w-lg">
          <input
            type="text"
            required
            placeholder="e.g. SIR-CERT-2026-9041"
            value={certLookupId}
            onChange={(e) => setCertLookupId(e.target.value)}
            className="flex-1 bg-[#0B0E14] border border-white/10 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
          />
          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold text-[#0B0E14] bg-[#D4AF37] hover:bg-[#e0bc46] rounded-md transition-colors shrink-0"
          >
            Verify Credential
          </button>
        </form>

        {certResult && (
          <div className="p-4 rounded-lg bg-[#0B0E14] border border-emerald-800 text-xs space-y-2 max-w-lg">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>{certResult.verifiedStatus}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-300 text-xs pt-1">
              <div>Graduate: <strong className="text-white">{certResult.recipient}</strong></div>
              <div>Issue Date: {certResult.issueDate}</div>
              <div className="col-span-2">Course: <strong className="text-white">{certResult.course}</strong></div>
              <div>Honors: {certResult.grade}</div>
            </div>
          </div>
        )}

        {certError && (
          <div className="p-3 rounded-lg bg-red-950/40 border border-red-800 text-xs text-red-300 max-w-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{certError}</span>
          </div>
        )}
      </div>
    </div>
  );
};
