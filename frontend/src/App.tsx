import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Navbar } from './components/Navbar.js';
import { FilterSidebar } from './components/FilterSidebar.js';
import { JobCard } from './components/JobCard.js';
import { JobDetailModal } from './components/JobDetailModal.js';
import { ExamCalendar } from './components/ExamCalendar.js';
import { UserOnboarding } from './components/UserOnboarding.js';
import { CrawlerDashboard } from './components/CrawlerDashboard.js';
import { AuthModal } from './components/AuthModal.js';
import { TrackerView } from './components/TrackerView.js';
import { LiveToastSystem, addToast } from './components/LiveToast.js';
import { Job, JobStats, Location } from './types/index.js';
import { useAuth } from './context/AuthContext.js';
import {
  AlertCircle, RotateCcw, Zap, TrendingUp, Users, Clock,
  SlidersHorizontal, Mail, RefreshCw, CheckCircle2,
} from 'lucide-react';

const POLL_INTERVAL_MS = 60_000; // 60 seconds

// ── Stat Card Component ─────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent: string;
  sub?: string;
  animate?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, accent, sub, animate }) => (
  <div
    className="stat-card animate-fade-in-up"
    style={{ animationDelay: '0.05s' }}
  >
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#475569' }}>{label}</span>
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}
      >
        <span style={{ color: accent }}>{icon}</span>
      </div>
    </div>
    <div
      className={`text-2xl font-black ${animate ? 'count-up' : ''}`}
      style={{ color: accent }}
    >
      {value}
    </div>
    {sub && (
      <p className="text-[11px] mt-0.5" style={{ color: '#475569' }}>{sub}</p>
    )}
  </div>
);

// ── Loading Skeleton ────────────────────────────────────────────────────────
const SkeletonCard: React.FC<{ delay?: number }> = ({ delay = 0 }) => (
  <div
    className="rounded-2xl animate-shimmer"
    style={{ height: 220, animationDelay: `${delay}ms` }}
  />
);

// ── Quick Filter Chip ───────────────────────────────────────────────────────
interface QuickFilterChipProps {
  label: string;
  emoji: string;
  active: boolean;
  onClick: () => void;
  chipStyle?: 'red' | 'amber' | 'green' | 'blue' | 'purple';
}

const QuickFilterChip: React.FC<QuickFilterChipProps> = ({ label, emoji, active, onClick, chipStyle = 'blue' }) => {
  const styles = {
    red: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', color: '#fca5a5', activeBg: 'rgba(239,68,68,0.25)', activeBorder: 'rgba(239,68,68,0.5)' },
    amber: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', color: '#fcd34d', activeBg: 'rgba(245,158,11,0.25)', activeBorder: 'rgba(245,158,11,0.5)' },
    green: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', color: '#6ee7b7', activeBg: 'rgba(16,185,129,0.25)', activeBorder: 'rgba(16,185,129,0.5)' },
    blue: { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', color: '#93c5fd', activeBg: 'rgba(59,130,246,0.25)', activeBorder: 'rgba(59,130,246,0.5)' },
    purple: { bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.3)', color: '#c4b5fd', activeBg: 'rgba(139,92,246,0.25)', activeBorder: 'rgba(139,92,246,0.5)' },
  };
  const s = styles[chipStyle];

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap"
      style={{
        background: active ? s.activeBg : s.bg,
        border: `1px solid ${active ? s.activeBorder : s.border}`,
        color: s.color,
        boxShadow: active ? `0 0 16px ${s.activeBg}` : 'none',
        transform: active ? 'translateY(-1px)' : 'none',
      }}
    >
      <span>{emoji}</span>
      <span>{label}</span>
      {active && <CheckCircle2 className="w-3 h-3 ml-0.5" />}
    </button>
  );
};

// ── Main App ────────────────────────────────────────────────────────────────
export const App: React.FC = () => {
  const { token } = useAuth();

  // Global State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<JobStats | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newJobIds, setNewJobIds] = useState<Set<string>>(new Set());
  const [newJobsFlash, setNewJobsFlash] = useState(false);

  // Tabs & Views
  const [activeTab, setActiveTab] = useState<'feed' | 'calendar' | 'tracker' | 'crawlers'>('feed');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [digestPreviewOpen, setDigestPreviewOpen] = useState(false);
  const [digestHtml, setDigestHtml] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedEducation, setSelectedEducation] = useState('ALL');
  const [selectedState, setSelectedState] = useState('ALL');
  const [closingSoon, setClosingSoon] = useState<'24h' | '3d' | '7d' | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'deadline' | 'newest' | 'vacancies'>('deadline');

  // Refs to keep poll callback stable
  const jobsRef = useRef(jobs);
  jobsRef.current = jobs;

  // Tracked Jobs
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('jobalert_saved') || '[]'); } catch { return []; }
  });
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('jobalert_applied') || '[]'); } catch { return []; }
  });

  useEffect(() => { localStorage.setItem('jobalert_saved', JSON.stringify(savedJobIds)); }, [savedJobIds]);
  useEffect(() => { localStorage.setItem('jobalert_applied', JSON.stringify(appliedJobIds)); }, [appliedJobIds]);

  // Onboarding check
  useEffect(() => {
    if (!localStorage.getItem('jobalert_onboarded')) setIsOnboardingOpen(true);
  }, []);

  // ── Fetch stats & filters ──
  const fetchStatsAndFilters = useCallback(async (showToast = false) => {
    try {
      const [statsRes, filtersRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/filters'),
      ]);
      const statsData = await statsRes.json();
      const filtersData = await filtersRes.json();

      setStats(prev => {
        if (showToast && prev && statsData.totalActive > (prev.totalActive ?? 0)) {
          const added = statsData.totalActive - prev.totalActive;
          addToast({
            type: 'new_job',
            title: `${added} New Recruitment${added > 1 ? 's' : ''} Added!`,
            subtitle: 'Fresh official notifications are now available in your feed.',
          });
          setNewJobsFlash(true);
          setTimeout(() => setNewJobsFlash(false), 5000);
        }
        return statsData;
      });
      if (filtersData.locations) setLocations(filtersData.locations);
    } catch (e) {
      console.error('Stats/filters error:', e);
    }
  }, []);

  useEffect(() => {
    fetchStatsAndFilters(false);
  }, [fetchStatsAndFilters]);

  // ── User interactions sync ──
  useEffect(() => {
    if (!token) return;
    fetch('/api/user/interactions', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then((interactions: any[]) => {
        if (Array.isArray(interactions)) {
          const saved = interactions.filter(i => i.isSaved || i.status === 'SAVED').map(i => i.jobId);
          const applied = interactions.filter(i => i.status === 'APPLIED').map(i => i.jobId);
          setSavedJobIds(prev => Array.from(new Set([...prev, ...saved])));
          setAppliedJobIds(prev => Array.from(new Set([...prev, ...applied])));
        }
      })
      .catch(e => console.error('Interactions load error:', e));
  }, [token]);

  // ── Fetch jobs ──
  const fetchJobs = useCallback(async (isPoll = false) => {
    if (!isPoll) setLoading(true);
    if (isPoll) setIsRefreshing(true);

    const params = new URLSearchParams();
    if (selectedCategory && selectedCategory !== 'ALL') params.append('category', selectedCategory);
    if (selectedEducation && selectedEducation !== 'ALL') params.append('education', selectedEducation);
    if (selectedState && selectedState !== 'ALL') params.append('state', selectedState);
    if (closingSoon) params.append('closingSoon', closingSoon);
    if (searchQuery.trim()) params.append('search', searchQuery.trim());

    try {
      const res = await fetch(`/api/jobs?${params.toString()}`);
      const data = await res.json();
      const incomingJobs: Job[] = data.jobs || [];

      if (isPoll) {
        // Find newly added jobs
        const existingIds = new Set(jobsRef.current.map(j => j.id));
        const freshIds = new Set(incomingJobs.filter(j => !existingIds.has(j.id)).map(j => j.id));
        if (freshIds.size > 0) {
          setNewJobIds(freshIds);
          setNewJobsFlash(true);
          setTimeout(() => setNewJobsFlash(false), 5000);
          addToast({
            type: 'new_job',
            title: `${freshIds.size} New Job${freshIds.size > 1 ? 's' : ''} Found!`,
            subtitle: `New official vacancies have been added to your feed.`,
          });
          // Clear "new" badges after 10 seconds
          setTimeout(() => setNewJobIds(new Set()), 10000);
        }

        // Notify about urgent deadlines closing soon (only once per session)
        const urgentNew = incomingJobs.filter(j => {
          const diff = new Date(j.deadline).getTime() - Date.now();
          return diff > 0 && diff < 86400000 && !existingIds.has(j.id);
        });
        if (urgentNew.length > 0) {
          addToast({
            type: 'urgent',
            title: '🚨 Urgent! Deadline within 24h',
            subtitle: urgentNew.map(j => j.organization.shortName).join(', ') + ' — Apply immediately!',
          });
        }
      }

      setJobs(incomingJobs);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedCategory, selectedEducation, selectedState, closingSoon, searchQuery]);

  // On filter change — fresh fetch
  useEffect(() => {
    fetchJobs(false);
  }, [selectedCategory, selectedEducation, selectedState, closingSoon, searchQuery]);

  // ── Real-time polling every 60s ──
  useEffect(() => {
    const id = setInterval(async () => {
      await fetchJobs(true);
      await fetchStatsAndFilters(true);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchJobs, fetchStatsAndFilters]);

  // ── Show urgent notification on initial load if any urgent jobs ──
  useEffect(() => {
    if (!loading && jobs.length > 0) {
      const urgentJobs = jobs.filter(j => {
        const diff = new Date(j.deadline).getTime() - Date.now();
        return diff > 0 && diff < 86400000;
      });
      if (urgentJobs.length > 0) {
        setTimeout(() => {
          addToast({
            type: 'urgent',
            title: `🚨 ${urgentJobs.length} Application${urgentJobs.length > 1 ? 's' : ''} Closing Today`,
            subtitle: urgentJobs.slice(0, 2).map(j => j.title).join(' • '),
          });
        }, 1500);
      }
    }
  }, [loading]);

  // ── Sort ──
  const sortedJobs = useMemo(() => {
    const list = [...jobs];
    if (sortBy === 'deadline') return list.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    if (sortBy === 'newest') return list.sort((a, b) => new Date(b.postDate).getTime() - new Date(a.postDate).getTime());
    if (sortBy === 'vacancies') return list.sort((a, b) => (b.totalVacancies || 0) - (a.totalVacancies || 0));
    return list;
  }, [jobs, sortBy]);

  // ── Save / Applied handlers ──
  const handleToggleSave = async (jobId: string) => {
    const nextSaved = savedJobIds.includes(jobId)
      ? savedJobIds.filter(id => id !== jobId)
      : [...savedJobIds, jobId];
    setSavedJobIds(nextSaved);
    if (token) {
      try {
        await fetch('/api/user/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ jobId }),
        });
      } catch {}
    }
  };

  const handleToggleApplied = async (jobId: string) => {
    const isCurrent = appliedJobIds.includes(jobId);
    setAppliedJobIds(isCurrent ? appliedJobIds.filter(id => id !== jobId) : [...appliedJobIds, jobId]);
    if (token) {
      try {
        await fetch('/api/user/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ jobId, status: isCurrent ? 'SAVED' : 'APPLIED' }),
        });
      } catch {}
    }
  };

  const handleResetFilters = () => {
    setSelectedCategory('ALL');
    setSelectedEducation('ALL');
    setSelectedState('ALL');
    setClosingSoon(undefined);
    setSearchQuery('');
  };

  const handleApplyOnboarding = (prefs: { education: string; categories: string[]; state: string }) => {
    localStorage.setItem('jobalert_onboarded', 'true');
    if (prefs.education) setSelectedEducation(prefs.education);
    if (prefs.categories.length > 0) setSelectedCategory(prefs.categories[0]);
    if (prefs.state) setSelectedState(prefs.state);
  };

  const handlePreviewEmailDigest = async () => {
    if (!token) { setIsAuthOpen(true); return; }
    try {
      const res = await fetch('/api/user/email-digest-preview', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.html) { setDigestHtml(data.html); setDigestPreviewOpen(true); }
    } catch { alert('Failed to generate email digest preview'); }
  };

  const hasActiveFilters = selectedCategory !== 'ALL' || selectedEducation !== 'ALL' ||
    selectedState !== 'ALL' || !!closingSoon || !!searchQuery;

  const timeAgo = () => {
    const secs = Math.floor((Date.now() - lastRefreshed.getTime()) / 1000);
    if (secs < 60) return 'just now';
    return `${Math.floor(secs / 60)}m ago`;
  };

  return (
    <div
      className="min-h-screen grid-bg flex flex-col"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Live Toast Notification System */}
      <LiveToastSystem />

      {/* Top Navigation */}
      <Navbar
        stats={stats}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        newJobsFlash={newJobsFlash}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ══ VIEW 1: Live Feed ══ */}
        {activeTab === 'feed' && (
          <div className="space-y-6">

            {/* Live Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up">
              <StatCard
                label="Active Vacancies"
                value={stats?.totalActive ?? '—'}
                icon={<Zap className="w-4 h-4" />}
                accent="#10b981"
                sub="Across all sectors"
                animate={!loading}
              />
              <StatCard
                label="New Today"
                value={stats?.newToday ? `+${stats.newToday}` : '—'}
                icon={<TrendingUp className="w-4 h-4" />}
                accent="#3b82f6"
                sub="Fresh notifications"
                animate={!loading}
              />
              <StatCard
                label="Urgent (< 24h)"
                value={stats?.closing24h ?? '—'}
                icon={<Clock className="w-4 h-4" />}
                accent="#ef4444"
                sub="Apply immediately"
                animate={!loading}
              />
              <StatCard
                label="Shown in Feed"
                value={sortedJobs.length}
                icon={<Users className="w-4 h-4" />}
                accent="#a78bfa"
                sub="After your filters"
                animate={!loading}
              />
            </div>

            {/* Quick Filter Bar + Sort */}
            <div
              className="glass rounded-2xl p-4"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <QuickFilterChip
                    emoji="🚨"
                    label="Closing < 24h"
                    active={closingSoon === '24h'}
                    onClick={() => setClosingSoon(closingSoon === '24h' ? undefined : '24h')}
                    chipStyle="red"
                  />
                  <QuickFilterChip
                    emoji="⏰"
                    label="Closing < 3 Days"
                    active={closingSoon === '3d'}
                    onClick={() => setClosingSoon(closingSoon === '3d' ? undefined : '3d')}
                    chipStyle="amber"
                  />
                  <QuickFilterChip
                    emoji="🏛️"
                    label="Central Govt"
                    active={selectedCategory === 'CENTRAL_GOVT'}
                    onClick={() => setSelectedCategory(selectedCategory === 'CENTRAL_GOVT' ? 'ALL' : 'CENTRAL_GOVT')}
                    chipStyle="blue"
                  />
                  <QuickFilterChip
                    emoji="🏦"
                    label="Banking"
                    active={selectedCategory === 'BANKING'}
                    onClick={() => setSelectedCategory(selectedCategory === 'BANKING' ? 'ALL' : 'BANKING')}
                    chipStyle="green"
                  />
                  <QuickFilterChip
                    emoji="🛡️"
                    label="Defence"
                    active={selectedCategory === 'DEFENCE'}
                    onClick={() => setSelectedCategory(selectedCategory === 'DEFENCE' ? 'ALL' : 'DEFENCE')}
                    chipStyle="purple"
                  />
                </div>

                <div className="flex items-center gap-3">
                  {/* Mobile filter toggle */}
                  <button
                    onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                    className="lg:hidden btn-ghost text-xs gap-1.5"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    Filters
                    {hasActiveFilters && (
                      <span className="w-2 h-2 rounded-full" style={{ background: '#10b981' }} />
                    )}
                  </button>

                  {/* Sort select */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold hidden md:block" style={{ color: '#64748b' }}>Sort:</span>
                    <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
                      <option value="deadline">Urgent First</option>
                      <option value="newest">Newest First</option>
                      <option value="vacancies">Most Vacancies</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Layout: Sidebar + Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
              {/* Sidebar */}
              <div className={`lg:block ${mobileFilterOpen ? 'block' : 'hidden'} lg:col-span-1`}>
                <FilterSidebar
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  selectedEducation={selectedEducation}
                  onSelectEducation={setSelectedEducation}
                  selectedState={selectedState}
                  onSelectState={setSelectedState}
                  closingSoon={closingSoon}
                  onSelectClosingSoon={setClosingSoon}
                  locations={locations}
                  onReset={handleResetFilters}
                />
              </div>

              {/* Feed Column */}
              <div className="lg:col-span-3 space-y-4">
                {/* Result header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <p className="text-sm" style={{ color: '#64748b' }}>
                      <strong style={{ color: '#e2e8f0' }}>{sortedJobs.length}</strong>
                      {' '}official recruitment notices
                      {selectedCategory !== 'ALL' && (
                        <span className="ml-1 font-semibold" style={{ color: '#34d399' }}>• {selectedCategory}</span>
                      )}
                      {closingSoon && (
                        <span className="ml-1 font-bold" style={{ color: '#fca5a5' }}>• Urgent</span>
                      )}
                    </p>
                    {/* Live refresh indicator */}
                    <div
                      className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium"
                      style={{ color: '#334155' }}
                    >
                      {isRefreshing ? (
                        <RefreshCw className="w-3 h-3 animate-spin" style={{ color: '#10b981' }} />
                      ) : (
                        <span
                          className="w-1.5 h-1.5 rounded-full live-dot"
                          style={{ background: '#10b981', display: 'inline-block' }}
                        />
                      )}
                      Updated {timeAgo()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fetchJobs(false)}
                      className="btn-ghost text-xs py-1.5 gap-1"
                      disabled={loading || isRefreshing}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                      <span className="hidden sm:inline">Refresh</span>
                    </button>
                    {hasActiveFilters && (
                      <button
                        onClick={handleResetFilters}
                        className="btn-ghost text-xs py-1.5 gap-1"
                        style={{ color: '#34d399', borderColor: 'rgba(16,185,129,0.25)' }}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Clear</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Cards */}
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[0, 80, 160, 240, 320, 400].map(delay => (
                      <SkeletonCard key={delay} delay={delay} />
                    ))}
                  </div>
                ) : sortedJobs.length === 0 ? (
                  <div
                    className="glass rounded-2xl p-16 text-center animate-fade-in"
                    style={{ border: '1px dashed rgba(99,162,255,0.15)' }}
                  >
                    <div
                      className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                      style={{ background: 'rgba(99,162,255,0.08)', border: '1px solid rgba(99,162,255,0.12)' }}
                    >
                      <AlertCircle className="w-8 h-8" style={{ color: '#334155' }} />
                    </div>
                    <h3 className="text-base font-bold mb-2" style={{ color: '#e2e8f0' }}>
                      No recruitment alerts match these filters
                    </h3>
                    <p className="text-sm mb-6" style={{ color: '#475569' }}>
                      Try widening your qualification or location filters to see more central and state exams.
                    </p>
                    <button onClick={handleResetFilters} className="btn-primary">
                      <RotateCcw className="w-4 h-4" />
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sortedJobs.map((job, idx) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        isSaved={savedJobIds.includes(job.id)}
                        isNew={newJobIds.has(job.id)}
                        onToggleSave={handleToggleSave}
                        onSelectJob={setSelectedJob}
                        animationDelay={Math.min(idx * 60, 400)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══ VIEW 2: Exam Calendar ══ */}
        {activeTab === 'calendar' && <ExamCalendar />}

        {/* ══ VIEW 3: Tracker ══ */}
        {activeTab === 'tracker' && (
          <div className="space-y-6">
            <TrackerView
              savedJobIds={savedJobIds}
              appliedJobIds={appliedJobIds}
              allJobs={jobs}
              onToggleSave={handleToggleSave}
              onToggleApplied={handleToggleApplied}
              onSelectJob={setSelectedJob}
              onBrowseFeed={() => setActiveTab('feed')}
              onOpenAuth={() => setIsAuthOpen(true)}
            />

            {/* Email Digest Banner */}
            <div
              className="glass rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(59,130,246,0.08))',
                border: '1px solid rgba(16,185,129,0.2)',
              }}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="w-5 h-5" style={{ color: '#10b981' }} />
                  <h3 className="font-bold text-sm" style={{ color: '#e2e8f0' }}>Automated Morning Email Digest</h3>
                </div>
                <p className="text-xs" style={{ color: '#64748b' }}>
                  JobAlert compiles new openings matching your background and sends a curated daily digest with official PDF links.
                </p>
              </div>
              <button
                onClick={handlePreviewEmailDigest}
                className="btn-primary whitespace-nowrap"
              >
                Preview HTML Digest
              </button>
            </div>
          </div>
        )}

        {/* ══ VIEW 4: Crawler Monitor ══ */}
        {activeTab === 'crawlers' && <CrawlerDashboard />}
      </main>

      {/* ══ FOOTER ══ */}
      <footer
        className="mt-16 py-8"
        style={{ background: 'rgba(0,0,0,0.4)', borderTop: '1px solid rgba(99,162,255,0.08)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black"
                style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)', color: 'white' }}
              >
                JA
              </div>
              <span className="font-extrabold" style={{ color: '#e2e8f0' }}>JobAlert India</span>
            </div>
            <p className="text-xs" style={{ color: '#334155' }}>
              Independent aggregator of official Indian Central & State Government, Banking & Defence notifications.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {(['feed', 'calendar', 'tracker', 'crawlers'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="text-xs font-semibold transition"
                style={{ color: activeTab === tab ? '#10b981' : '#475569' }}
              >
                {tab === 'feed' ? 'All Jobs' : tab === 'calendar' ? 'Exam Calendar' : tab === 'tracker' ? 'My Applications' : 'Scraper Status'}
              </button>
            ))}
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="text-xs font-semibold transition"
              style={{ color: '#475569' }}
            >
              Preferences
            </button>
          </div>
        </div>
      </footer>

      {/* ══ MODALS ══ */}
      <JobDetailModal
        job={selectedJob}
        isOpen={Boolean(selectedJob)}
        onClose={() => setSelectedJob(null)}
        isSaved={selectedJob ? savedJobIds.includes(selectedJob.id) : false}
        onToggleSave={handleToggleSave}
        onUpdateStatus={(jobId, status) => {
          if (status === 'APPLIED') {
            if (!appliedJobIds.includes(jobId)) setAppliedJobIds([...appliedJobIds, jobId]);
          } else {
            setAppliedJobIds(appliedJobIds.filter(id => id !== jobId));
          }
        }}
      />

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      <UserOnboarding
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        locations={locations}
        onApplyPreferences={handleApplyOnboarding}
      />

      {/* Email Digest Preview Modal */}
      {digestPreviewOpen && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content max-w-2xl animate-fade-in-up">
            <div
              className="p-4 flex items-center justify-between"
              style={{ borderBottom: '1px solid rgba(99,162,255,0.1)', background: 'rgba(0,0,0,0.2)' }}
            >
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5" style={{ color: '#10b981' }} />
                <span className="text-sm font-bold" style={{ color: '#e2e8f0' }}>HTML Email Digest Preview</span>
              </div>
              <button
                onClick={() => setDigestPreviewOpen(false)}
                className="btn-ghost text-xs py-1.5"
              >
                Close
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {digestHtml ? (
                <div
                  dangerouslySetInnerHTML={{ __html: digestHtml }}
                  style={{ background: 'white', borderRadius: 8, padding: 16, color: '#0f172a' }}
                />
              ) : (
                <div className="animate-shimmer h-32 rounded-xl" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
