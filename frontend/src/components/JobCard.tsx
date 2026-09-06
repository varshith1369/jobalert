import React, { useState } from 'react';
import {
  Clock, FileText, Bookmark, GraduationCap,
  MapPin, IndianRupee, Users, ChevronRight, Star,
} from 'lucide-react';
import { Job } from '../types/index.js';
import { calculateUrgency, formatSalary, CATEGORY_LABELS, EDUCATION_LABELS, translations } from '../utils/index.js';
import { useAuth } from '../context/AuthContext.js';

interface JobCardProps {
  job: Job;
  isSaved?: boolean;
  isNew?: boolean;
  onToggleSave: (jobId: string) => void;
  onSelectJob: (job: Job) => void;
  animationDelay?: number;
}

const CATEGORY_CHIP_STYLE: Record<string, string> = {
  CENTRAL_GOVT: 'chip chip-blue',
  STATE_GOVT: 'chip chip-purple',
  BANKING: 'chip chip-green',
  DEFENCE: 'chip chip-amber',
  PSU: 'chip chip-slate',
  RAILWAY: 'chip chip-blue',
  TEACHING: 'chip chip-purple',
  PRIVATE: 'chip chip-slate',
};

export const JobCard: React.FC<JobCardProps> = ({
  job,
  isSaved = false,
  isNew = false,
  onToggleSave,
  onSelectJob,
  animationDelay = 0,
}) => {
  const { language } = useAuth();
  const t = translations[language];
  const urgency = calculateUrgency(job.deadline);
  const categoryMeta = CATEGORY_LABELS[job.category] || { en: job.category, hi: job.category, color: '' };
  const educationMeta = EDUCATION_LABELS[job.minEducation] || { en: job.minEducation, hi: job.minEducation };
  const [saveAnimating, setSaveAnimating] = useState(false);

  const chipClass = CATEGORY_CHIP_STYLE[job.category] || 'chip chip-slate';

  const isUrgent = urgency.level === 'red';
  const isClosingSoon = urgency.level === 'amber';

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaveAnimating(true);
    onToggleSave(job.id);
    setTimeout(() => setSaveAnimating(false), 600);
  };

  const deadlineDate = new Date(job.deadline);
  const deadlineStr = deadlineDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div
      className={`job-card card-enter ${isUrgent ? 'job-card-urgent' : ''}`}
      style={{ animationDelay: `${animationDelay}ms` }}
      onClick={() => onSelectJob(job)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelectJob(job)}
    >
      {/* NEW badge overlay */}
      {isNew && (
        <div
          className="absolute top-3 right-3 new-flash text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider z-10"
          style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}
        >
          NEW
        </div>
      )}

      {/* ── TOP: Category + Org + Urgency ── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={chipClass}>
            {language === 'hi' ? categoryMeta.hi : categoryMeta.en}
          </span>
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded-md"
            style={{ background: 'rgba(99,162,255,0.1)', color: '#93c5fd', border: '1px solid rgba(99,162,255,0.2)' }}
          >
            {job.organization.shortName}
          </span>
          {job.notificationNumber && (
            <span className="text-[10px] font-medium hidden sm:inline" style={{ color: '#475569' }}>
              {job.notificationNumber}
            </span>
          )}
        </div>

        {/* Urgency countdown badge */}
        <div
          className={`chip whitespace-nowrap flex-shrink-0 ${
            isUrgent ? 'chip-red pulse-urgent' : isClosingSoon ? 'chip-amber pulse-amber' : urgency.level === 'green' ? 'chip-green' : 'chip-slate'
          }`}
          style={{ fontSize: 11 }}
        >
          <Clock className="w-3 h-3" />
          {urgency.label}
        </div>
      </div>

      {/* ── TITLE ── */}
      <div>
        <h3
          className="text-sm font-bold line-clamp-2 transition-colors duration-200"
          style={{ color: '#e2e8f0', lineHeight: 1.45 }}
        >
          {job.title}
        </h3>
        {job.rawContentSummary && (
          <p className="text-xs mt-1.5 line-clamp-2 leading-relaxed" style={{ color: '#475569' }}>
            {job.rawContentSummary}
          </p>
        )}
      </div>

      {/* ── METADATA GRID ── */}
      <div
        className="grid grid-cols-2 gap-x-4 gap-y-2"
        style={{ background: 'rgba(99,162,255,0.04)', border: '1px solid rgba(99,162,255,0.08)', borderRadius: 10, padding: '10px 12px' }}
      >
        <div className="flex items-center gap-1.5 text-xs" style={{ color: '#94a3b8' }}>
          <GraduationCap className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#34d399' }} />
          <span className="truncate">{language === 'hi' ? educationMeta.hi : educationMeta.en}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs" style={{ color: '#94a3b8' }}>
          <Users className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#93c5fd' }} />
          <span className="font-semibold" style={{ color: '#c7d2fe' }}>
            {job.totalVacancies ? `${job.totalVacancies.toLocaleString('en-IN')} Posts` : 'See Notice'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs" style={{ color: '#94a3b8' }}>
          <IndianRupee className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#fcd34d' }} />
          <span className="truncate">{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs" style={{ color: '#94a3b8' }}>
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#fca5a5' }} />
          <span className="truncate">
            {job.location?.isAllIndia ? 'All India' : job.location?.stateName || 'All India'}
          </span>
        </div>
      </div>

      {/* ── DEADLINE ROW ── */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium" style={{ color: '#475569' }}>
          Last Date:{' '}
          <span
            className="font-bold"
            style={{ color: isUrgent ? '#fca5a5' : isClosingSoon ? '#fcd34d' : '#94a3b8' }}
          >
            {deadlineStr}
          </span>
        </span>
        {job.totalVacancies && job.totalVacancies > 1000 && (
          <span
            className="vacancy-badge"
          >
            <Star className="w-2.5 h-2.5" />
            {(job.totalVacancies / 1000).toFixed(1)}k Posts
          </span>
        )}
      </div>

      {/* ── ACTION FOOTER ── */}
      <div
        className="flex items-center justify-between gap-2 pt-3"
        style={{ borderTop: '1px solid rgba(99,162,255,0.08)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          {job.officialPdfUrl && (
            <a
              href={job.officialPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost text-xs py-1.5 px-2.5"
              title="Download Official PDF"
            >
              <FileText className="w-3.5 h-3.5" style={{ color: '#fca5a5' }} />
              <span className="hidden sm:inline">PDF</span>
            </a>
          )}

          <button
            onClick={handleSave}
            className="btn-ghost text-xs py-1.5 px-2.5"
            title={isSaved ? 'Remove from saved' : 'Save this notification'}
            style={{
              transition: 'all 0.2s ease',
              ...(isSaved ? {
                background: 'rgba(16,185,129,0.12)',
                borderColor: 'rgba(16,185,129,0.3)',
                color: '#34d399',
              } : {}),
              transform: saveAnimating ? 'scale(0.9)' : 'scale(1)',
            }}
          >
            <Bookmark
              className="w-3.5 h-3.5 transition-all duration-200"
              style={{
                fill: isSaved ? '#10b981' : 'none',
                color: isSaved ? '#10b981' : 'inherit',
                transform: saveAnimating && !isSaved ? 'scale(1.3)' : 'scale(1)',
              }}
            />
            <span className="hidden sm:inline">{isSaved ? t.saved : t.saveJob}</span>
          </button>
        </div>

        <a
          href={job.officialSourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary text-xs py-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <span>{t.applyNow}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
