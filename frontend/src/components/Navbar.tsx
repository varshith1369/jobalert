import React, { useState, useEffect, useRef } from 'react';
import {
  Bell, Search, Globe, ShieldCheck, User as UserIcon, LogOut,
  Sparkles, Calendar, Bookmark, LayoutDashboard, Activity, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { translations } from '../utils/index.js';
import { JobStats } from '../types/index.js';

interface NavbarProps {
  stats: JobStats | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeTab: 'feed' | 'calendar' | 'tracker' | 'crawlers';
  onTabChange: (tab: 'feed' | 'calendar' | 'tracker' | 'crawlers') => void;
  onOpenAuth: () => void;
  newJobsFlash?: boolean;
}

interface TickerItem {
  label: string;
  value: string | number;
  color: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  stats,
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  onOpenAuth,
  newJobsFlash = false,
}) => {
  const { user, logout, language, setLanguage } = useAuth();
  const t = translations[language];
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileSearchOpen) searchRef.current?.focus();
  }, [mobileSearchOpen]);

  const handleTogglePush = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications.');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setPushSubscribed(true);
      new Notification('JobAlert India 🔔', {
        body: 'Real-time job alerts enabled! You\'ll be notified of new vacancies instantly.',
        icon: '/favicon.ico',
      });
    }
  };

  // Ticker items
  const tickerItems: TickerItem[] = [
    { label: '🟢 Active Vacancies', value: `${stats?.totalActive ?? '—'}`, color: '#34d399' },
    { label: '✨ New Today', value: `+${stats?.newToday ?? 0}`, color: '#6ee7b7' },
    { label: '🚨 Closing < 24h', value: stats?.closing24h ?? 0, color: '#fca5a5' },
    { label: '⏰ Closing < 3 Days', value: stats?.closing3d ?? 0, color: '#fcd34d' },
    { label: '✅ Official Govt Sources', value: '100%', color: '#93c5fd' },
    { label: '🏛️ Central Govt', value: 'UPSC • SSC • PSC', color: '#c4b5fd' },
    { label: '🏦 Banking Sector', value: 'IBPS • SBI • RRB', color: '#6ee7b7' },
    { label: '🛡️ Defence', value: 'Army • Navy • IAF', color: '#fcd34d' },
  ];

  // Duplicate ticker for seamless loop
  const doubledTicker = [...tickerItems, ...tickerItems];

  const tabs = [
    { id: 'feed' as const, label: 'All Notifications', icon: <LayoutDashboard className="w-4 h-4" />, badge: newJobsFlash ? 'NEW' : null },
    { id: 'calendar' as const, label: t.examCalendar, icon: <Calendar className="w-4 h-4" />, badge: null },
    { id: 'tracker' as const, label: t.myTracker, icon: <Bookmark className="w-4 h-4" />, badge: null },
    { id: 'crawlers' as const, label: t.crawlerMonitor, icon: <Activity className="w-4 h-4" />, badge: null },
  ];

  return (
    <header
      className="sticky top-0 z-40 header-glass"
      style={{ boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.4)' : 'none', transition: 'box-shadow 0.3s ease' }}
    >
      {/* ══ LIVE TICKER BAR ══ */}
      <div
        className="ticker-wrapper"
        style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(99,162,255,0.08)', height: '32px', display: 'flex', alignItems: 'center' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, padding: '0 12px', gap: 8, background: 'rgba(16,185,129,0.15)', borderRight: '1px solid rgba(16,185,129,0.2)', height: '100%' }}>
          <span className="live-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block', flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>LIVE</span>
        </div>
        <div style={{ flex: 1, overflow: 'hidden', maskImage: 'linear-gradient(90deg, transparent 0%, black 3%, black 97%, transparent 100%)' }}>
          <div className="ticker-track" style={{ gap: '48px' }}>
            {doubledTicker.map((item, idx) => (
              <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', color: '#94a3b8' }}>
                <span style={{ color: item.color, fontWeight: 700 }}>{item.value}</span>
                <span>{item.label}</span>
                <span style={{ color: 'rgba(99,162,255,0.3)', margin: '0 8px' }}>•</span>
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, padding: '0 12px', gap: 6 }}>
          <ShieldCheck style={{ width: 13, height: 13, color: '#10b981' }} />
          <span style={{ fontSize: 10, fontWeight: 600, color: '#6ee7b7', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Official Sources Only</span>
        </div>
      </div>

      {/* ══ MAIN NAV ROW ══ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3" style={{ height: 64 }}>
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
            onClick={() => onTabChange('feed')}
          >
            <div
              className="gradient-animate rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg"
              style={{
                width: 40, height: 40,
                background: 'linear-gradient(135deg, #10b981, #059669, #3b82f6)',
                boxShadow: '0 4px 16px rgba(16,185,129,0.35)',
                transition: 'box-shadow 0.2s ease, transform 0.2s ease',
              }}
            >
              JA
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold text-white tracking-tight">JobAlert</span>
                <span
                  className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider"
                  style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}
                >
                  India
                </span>
              </div>
              <p className="text-[10px] font-medium" style={{ color: '#64748b' }}>{t.tagline}</p>
            </div>
          </div>

          {/* Desktop Search */}
          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: '#475569' }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="search-input"
                style={{ paddingLeft: '2.25rem' }}
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-white/10 transition"
                >
                  <X className="w-3.5 h-3.5" style={{ color: '#64748b' }} />
                </button>
              )}
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Mobile search toggle */}
            <button
              className="sm:hidden btn-ghost p-2"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            >
              {mobileSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            </button>

            {/* Language switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="btn-ghost hidden sm:flex gap-1.5 text-xs"
              title="Toggle Hindi / English"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'हिंदी' : 'EN'}</span>
            </button>

            {/* Bell push */}
            <button
              onClick={handleTogglePush}
              className="relative btn-ghost p-2"
              title={pushSubscribed ? t.pushActive : t.turnOnPush}
            >
              <Bell
                className="w-4 h-4"
                style={{ color: pushSubscribed ? '#10b981' : '#64748b', fill: pushSubscribed ? '#10b981' : 'none' }}
              />
              {!pushSubscribed && (
                <span
                  className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full animate-pulse"
                  style={{ background: '#ef4444' }}
                />
              )}
            </button>

            {/* Auth */}
            {user ? (
              <div className="flex items-center gap-2 pl-3" style={{ borderLeft: '1px solid rgba(99,162,255,0.12)' }}>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white' }}
                >
                  {(user.fullName || user.email)[0].toUpperCase()}
                </div>
                <div className="hidden md:block text-right">
                  <div className="text-xs font-semibold" style={{ color: '#f0f9ff' }}>{user.fullName || user.email.split('@')[0]}</div>
                  <div className="text-[10px] font-medium" style={{ color: '#10b981' }}>Aspirant</div>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg transition hover:bg-rose-500/10"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" style={{ color: '#64748b' }} />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="btn-primary text-xs"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search Expanded */}
        {mobileSearchOpen && (
          <div className="sm:hidden pb-3 animate-fade-in">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#475569' }} />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="search-input"
                style={{ paddingLeft: '2.25rem' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ══ TAB BAR ══ */}
      <div
        style={{ borderTop: '1px solid rgba(99,162,255,0.07)', background: 'rgba(0,0,0,0.2)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto" style={{ paddingTop: 6, paddingBottom: 6 }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className="new-flash text-[10px] font-black px-1.5 py-0.5 rounded-md ml-1 uppercase tracking-wider"
                    style={{ background: 'rgba(16,185,129,0.25)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
            <div className="ml-auto flex-shrink-0">
              <span
                className="text-[10px] font-medium hidden md:inline-flex items-center gap-1.5"
                style={{ color: '#475569' }}
              >
                <Sparkles className="w-3 h-3" style={{ color: '#10b981' }} />
                Auto-refreshes every 60s
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
