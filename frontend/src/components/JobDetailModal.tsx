import React, { useEffect } from 'react';
import {
  X, Calendar, FileText, ExternalLink, Bookmark, CheckCircle,
  ShieldAlert, Users, GraduationCap, IndianRupee, MapPin, Clock,
} from 'lucide-react';
import { Job } from '../types/index.js';
import { calculateUrgency, formatSalary, CATEGORY_LABELS, EDUCATION_LABELS, translations } from '../utils/index.js';
import { useAuth } from '../context/AuthContext.js';

interface JobDetailModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  isSaved?: boolean;
  onToggleSave: (jobId: string) => void;
  onUpdateStatus?: (jobId: string, status: string) => void;
}

const DetailItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}> = ({ icon, label, value, accent }) => (
  <div
    className="flex flex-col gap-1 p-3 rounded-xl"
    style={{ background: 'rgba(99,162,255,0.05)', border: '1px solid rgba(99,162,255,0.1)' }}
  >
    <span style={{ color: accent }}>{icon}</span>
    <span className="text-[11px] font-medium" style={{ color: '#475569' }}>{label}</span>
    <span className="text-xs font-bold" style={{ color: '#e2e8f0' }}>{value}</span>
  </div>
);

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  isOpen,
  onClose,
  isSaved = false,
  onToggleSave,
  onUpdateStatus,
}) => {
  const { language } = useAuth();
  const t = translations[language];

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen || !job) return null;

  const urgency = calculateUrgency(job.deadline);
  const categoryMeta = CATEGORY_LABELS[job.category] || { en: job.category, hi: job.category, color: '' };
  const educationMeta = EDUCATION_LABELS[job.minEducation] || { en: job.minEducation, hi: job.minEducation };
  const isUrgent = urgency.level === 'red';

  return (
    <div
      className="modal-overlay animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-content max-w-2xl animate-fade-in-up">
        {/* ── HEADER ── */}
        <div
          className="p-5 flex items-start justify-between gap-4 sticky top-0 z-10"
          style={{
            borderBottom: '1px solid rgba(99,162,255,0.1)',
            background: 'rgba(4,13,26,0.95)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg"
                style={{ background: 'rgba(59,130,246,0.15)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.3)' }}
              >
                {language === 'hi' ? categoryMeta.hi : categoryMeta.en}
              </span>
              <span
                className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg"
                style={{ background: 'rgba(99,162,255,0.1)', color: '#93c5fd', border: '1px solid rgba(99,162,255,0.2)' }}
              >
                {job.organization.shortName}
              </span>
              {job.notificationNumber && (
                <span className="text-[10px] font-mono" style={{ color: '#334155' }}>{job.notificationNumber}</span>
              )}
              <div
                className={`chip text-[11px] ${isUrgent ? 'chip-red pulse-urgent' : urgency.level === 'amber' ? 'chip-amber pulse-amber' : 'chip-slate'}`}
              >
                <Clock className="w-3 h-3" />
                {urgency.label}
              </div>
            </div>
            <h2
              className="text-base sm:text-lg font-black leading-snug"
              style={{ color: '#f0f9ff' }}
            >
              {job.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl transition flex-shrink-0"
            style={{ color: '#475569', border: '1px solid rgba(99,162,255,0.12)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── BODY ── */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* Important Dates */}
          <div
            className="rounded-2xl p-4"
            style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}
          >
            <h4
              className="text-[11px] font-bold uppercase tracking-wider mb-3 flex items-center gap-2"
              style={{ color: '#10b981' }}
            >
              <Calendar className="w-3.5 h-3.5" />
              Key Timeline & Dates
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                className="p-3 rounded-xl"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(99,162,255,0.1)' }}
              >
                <span className="text-[11px] block font-medium mb-1" style={{ color: '#475569' }}>Notification Released</span>
                <span className="text-xs font-bold" style={{ color: '#94a3b8' }}>
                  {new Date(job.postDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>

              <div
                className={`p-3 rounded-xl ${isUrgent ? 'pulse-urgent' : ''}`}
                style={{
                  background: isUrgent ? 'rgba(239,68,68,0.1)' : 'rgba(0,0,0,0.3)',
                  border: `1px solid ${isUrgent ? 'rgba(239,68,68,0.3)' : 'rgba(99,162,255,0.1)'}`,
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-[11px] font-bold"
                    style={{ color: isUrgent ? '#fca5a5' : '#475569' }}
                  >
                    Application Deadline
                  </span>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                    style={{
                      background: isUrgent ? 'rgba(239,68,68,0.2)' : 'rgba(99,162,255,0.1)',
                      color: isUrgent ? '#fca5a5' : '#94a3b8',
                    }}
                  >
                    {urgency.label}
                  </span>
                </div>
                <span
                  className="text-xs font-extrabold"
                  style={{ color: isUrgent ? '#ef4444' : '#94a3b8' }}
                >
                  {new Date(job.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>

              <div
                className="p-3 rounded-xl"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(99,162,255,0.1)' }}
              >
                <span className="text-[11px] block font-medium mb-1" style={{ color: '#475569' }}>Exam Date</span>
                <span className="text-xs font-bold" style={{ color: '#94a3b8' }}>
                  {job.examDate
                    ? new Date(job.examDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'To be announced'}
                </span>
              </div>
            </div>
          </div>

          {/* Eligibility grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <DetailItem
              icon={<GraduationCap className="w-4 h-4" />}
              label="Qualification"
              value={language === 'hi' ? educationMeta.hi : educationMeta.en}
              accent="#10b981"
            />
            <DetailItem
              icon={<Users className="w-4 h-4" />}
              label="Total Vacancies"
              value={job.totalVacancies ? job.totalVacancies.toLocaleString('en-IN') : 'Refer Notice'}
              accent="#3b82f6"
            />
            <DetailItem
              icon={<IndianRupee className="w-4 h-4" />}
              label="Pay Scale"
              value={formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
              accent="#f59e0b"
            />
            <DetailItem
              icon={<MapPin className="w-4 h-4" />}
              label="Location"
              value={job.location?.isAllIndia ? 'All India' : job.location?.stateName || 'All India'}
              accent="#ef4444"
            />
          </div>

          {/* Summary */}
          <div>
            <h4
              className="text-[11px] font-bold uppercase tracking-wider mb-2.5"
              style={{ color: '#475569' }}
            >
              Recruitment Summary & Scope
            </h4>
            <div
              className="p-4 rounded-xl text-xs leading-relaxed space-y-2"
              style={{ background: 'rgba(99,162,255,0.04)', border: '1px solid rgba(99,162,255,0.1)' }}
            >
              <p style={{ color: '#94a3b8' }}>{job.rawContentSummary}</p>
              <p className="text-[11px] leading-relaxed" style={{ color: '#475569' }}>
                Candidates must verify domicile qualifications, category relaxations (SC/ST/OBC/EWS/PwBD), and syllabus guidelines from the official gazette attachment.
              </p>
            </div>
          </div>

          {/* Safety warning */}
          <div
            className="flex items-start gap-3 p-4 rounded-xl"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
          >
            <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
            <div>
              <span className="text-xs font-bold block mb-1" style={{ color: '#fcd34d' }}>Official Source Advisory</span>
              <p className="text-xs leading-relaxed" style={{ color: '#78716c' }}>
                Never fill application forms or pay fees on unofficial aggregator websites. JobAlert routes you strictly to verified official government portals.
              </p>
            </div>
          </div>
        </div>

        {/* ── ACTION FOOTER ── */}
        <div
          className="p-5 flex flex-wrap items-center justify-between gap-3"
          style={{ borderTop: '1px solid rgba(99,162,255,0.1)', background: 'rgba(0,0,0,0.3)' }}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleSave(job.id)}
              className="btn-ghost text-xs gap-1.5"
              style={isSaved ? {
                background: 'rgba(16,185,129,0.12)',
                borderColor: 'rgba(16,185,129,0.3)',
                color: '#34d399',
              } : {}}
            >
              <Bookmark
                className="w-4 h-4"
                style={{ fill: isSaved ? '#10b981' : 'none', color: isSaved ? '#10b981' : 'inherit' }}
              />
              {isSaved ? t.saved : t.saveJob}
            </button>

            {onUpdateStatus && (
              <button
                onClick={() => onUpdateStatus(job.id, 'APPLIED')}
                className="btn-ghost text-xs gap-1.5"
                style={{ color: '#93c5fd', borderColor: 'rgba(59,130,246,0.3)' }}
              >
                <CheckCircle className="w-4 h-4" />
                {t.markApplied}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {job.officialPdfUrl && (
              <a
                href={job.officialPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost text-xs gap-1.5"
              >
                <FileText className="w-4 h-4" style={{ color: '#fca5a5' }} />
                {t.viewPdf}
              </a>
            )}
            <a
              href={job.officialSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-xs"
            >
              {t.applyNow}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
