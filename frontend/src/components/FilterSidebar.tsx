import React from 'react';
import { Filter, RotateCcw, Clock, ShieldCheck, AlertTriangle, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { translations, CATEGORY_LABELS, EDUCATION_LABELS } from '../utils/index.js';
import { Location } from '../types/index.js';

interface FilterSidebarProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedEducation: string;
  onSelectEducation: (edu: string) => void;
  selectedState: string;
  onSelectState: (st: string) => void;
  closingSoon: '24h' | '3d' | '7d' | undefined;
  onSelectClosingSoon: (cs: '24h' | '3d' | '7d' | undefined) => void;
  locations: Location[];
  onReset: () => void;
}

const SectionLabel: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <div className="flex items-center gap-2 mb-2.5">
    <span style={{ color: '#475569' }}>{icon}</span>
    <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#475569' }}>{label}</span>
  </div>
);

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedEducation,
  onSelectEducation,
  selectedState,
  onSelectState,
  closingSoon,
  onSelectClosingSoon,
  locations,
  onReset,
}) => {
  const { language } = useAuth();
  const t = translations[language];

  const hasActiveFilters = selectedCategory !== 'ALL' || selectedEducation !== 'ALL' ||
    selectedState !== 'ALL' || !!closingSoon;

  return (
    <aside
      className="glass rounded-2xl overflow-hidden animate-fade-in-up"
      style={{ animationDelay: '0ms' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4"
        style={{ borderBottom: '1px solid rgba(99,162,255,0.08)', background: 'rgba(0,0,0,0.2)' }}
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" style={{ color: '#10b981' }} />
          <span className="text-sm font-bold" style={{ color: '#e2e8f0' }}>Filters</span>
          {hasActiveFilters && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
              style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}
            >
              Active
            </span>
          )}
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs font-medium transition"
          style={{ color: '#475569' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#10b981')}
          onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
        >
          <RotateCcw className="w-3 h-3" />
          {t.resetFilters}
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* 1. Urgency Quick-Filter */}
        <div>
          <SectionLabel icon={<Clock className="w-3.5 h-3.5" />} label={t.filterByDeadline} />
          <div className="space-y-1.5">
            {/* 24h */}
            <button
              onClick={() => onSelectClosingSoon(closingSoon === '24h' ? undefined : '24h')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200"
              style={
                closingSoon === '24h'
                  ? { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', color: '#fca5a5' }
                  : { background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.12)', color: '#94a3b8' }
              }
            >
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5" style={{ color: '#ef4444' }} />
                {t.closingSoon24}
              </span>
              <span
                className="text-[10px] font-black px-1.5 py-0.5 rounded-md animate-pulse"
                style={{ background: 'rgba(239,68,68,0.2)', color: '#fca5a5' }}
              >
                Urgent
              </span>
            </button>

            {/* 3d */}
            <button
              onClick={() => onSelectClosingSoon(closingSoon === '3d' ? undefined : '3d')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200"
              style={
                closingSoon === '3d'
                  ? { background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.35)', color: '#fcd34d' }
                  : { background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.12)', color: '#94a3b8' }
              }
            >
              <span className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />
                {t.closingSoon3d}
              </span>
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                style={{ background: 'rgba(245,158,11,0.2)', color: '#fcd34d' }}
              >
                3 Days
              </span>
            </button>

            {/* 7d */}
            <button
              onClick={() => onSelectClosingSoon(closingSoon === '7d' ? undefined : '7d')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200"
              style={
                closingSoon === '7d'
                  ? { background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }
                  : { background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.1)', color: '#94a3b8' }
              }
            >
              <span>{t.closingSoon7d}</span>
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                style={{ background: 'rgba(16,185,129,0.15)', color: '#6ee7b7' }}
              >
                7 Days
              </span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="divider" />

        {/* 2. Category */}
        <div>
          <SectionLabel icon={<span style={{ fontSize: 13 }}>🏛️</span>} label="Job Category" />
          <div className="space-y-0.5">
            <button
              onClick={() => onSelectCategory('ALL')}
              className={`filter-option ${selectedCategory === 'ALL' ? 'selected' : ''}`}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: selectedCategory === 'ALL' ? '#10b981' : '#334155' }} />
              <span>{t.allCategories}</span>
            </button>
            {Object.entries(CATEGORY_LABELS).map(([code, meta]) => (
              <button
                key={code}
                onClick={() => onSelectCategory(code)}
                className={`filter-option ${selectedCategory === code ? 'selected' : ''}`}
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: selectedCategory === code ? '#10b981' : '#334155' }} />
                <span>{language === 'hi' ? meta.hi : meta.en}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="divider" />

        {/* 3. Education */}
        <div>
          <SectionLabel icon={<span style={{ fontSize: 13 }}>🎓</span>} label="Min Qualification" />
          <div className="space-y-0.5">
            <button
              onClick={() => onSelectEducation('ALL')}
              className={`filter-option ${selectedEducation === 'ALL' ? 'selected' : ''}`}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: selectedEducation === 'ALL' ? '#10b981' : '#334155' }} />
              <span>{t.allQualifications}</span>
            </button>
            {Object.entries(EDUCATION_LABELS).map(([code, meta]) => (
              <button
                key={code}
                onClick={() => onSelectEducation(code)}
                className={`filter-option ${selectedEducation === code ? 'selected' : ''}`}
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: selectedEducation === code ? '#10b981' : '#334155' }} />
                <span>{language === 'hi' ? meta.hi : meta.en}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="divider" />

        {/* 4. State */}
        <div>
          <SectionLabel icon={<span style={{ fontSize: 13 }}>📍</span>} label="Location / State" />
          <select
            value={selectedState}
            onChange={(e) => onSelectState(e.target.value)}
            className="w-full"
          >
            <option value="ALL">{t.allStates}</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.stateCode}>
                {loc.stateName} {loc.isAllIndia ? '(National)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="divider" />

        {/* Trust notice */}
        <div
          className="flex items-start gap-2.5 p-3 rounded-xl"
          style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}
        >
          <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#10b981' }} />
          <div>
            <p className="text-xs font-bold" style={{ color: '#34d399' }}>Official Source Guarantee</p>
            <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: '#475569' }}>
              All apply links point to verified government & company career portals only.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
