import React, { useState } from 'react';
import { Bookmark, CheckCircle, ExternalLink, Trash2, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { Job } from '../types/index.js';
import { calculateUrgency, formatSalary, CATEGORY_LABELS } from '../utils/index.js';
import { useAuth } from '../context/AuthContext.js';

interface TrackerViewProps {
  savedJobIds: string[];
  appliedJobIds: string[];
  allJobs: Job[];
  onToggleSave: (jobId: string) => void;
  onToggleApplied: (jobId: string) => void;
  onSelectJob: (job: Job) => void;
  onBrowseFeed: () => void;
  onOpenAuth: () => void;
}

export const TrackerView: React.FC<TrackerViewProps> = ({
  savedJobIds,
  appliedJobIds,
  allJobs,
  onToggleSave,
  onToggleApplied,
  onSelectJob,
  onBrowseFeed,
  onOpenAuth,
}) => {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'saved' | 'applied'>('saved');

  // Filter jobs based on tracked lists
  const savedJobs = allJobs.filter((j) => savedJobIds.includes(j.id));
  const appliedJobs = allJobs.filter((j) => appliedJobIds.includes(j.id));
  const displayedJobs = activeSubTab === 'saved' ? savedJobs : appliedJobs;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900">Application Pipeline Tracker</h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {savedJobIds.length + appliedJobIds.length} Tracked
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Keep track of vacancies you have saved and job applications you have submitted to official portals.
          </p>
        </div>

        {!user && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center space-x-3 text-xs text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Saved locally. Sign in to sync across phone & desktop.</span>
            <button
              onClick={onOpenAuth}
              className="font-bold underline text-amber-900 hover:text-amber-700 whitespace-nowrap"
            >
              Sign In
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-3 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSubTab('saved')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
            activeSubTab === 'saved'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved For Later</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${activeSubTab === 'saved' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
            {savedJobs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('applied')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
            activeSubTab === 'applied'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>Submitted / Applied</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${activeSubTab === 'applied' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
            {appliedJobs.length}
          </span>
        </button>
      </div>

      {/* List / Empty State */}
      {displayedJobs.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            {activeSubTab === 'saved' ? <Bookmark className="w-7 h-7" /> : <CheckCircle className="w-7 h-7" />}
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {activeSubTab === 'saved' ? 'No saved notifications yet' : 'No applications logged yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            {activeSubTab === 'saved'
              ? 'Click the bookmark icon on any exam or job notification card to save it here for fast access.'
              : 'Once you submit your application form on the official commission portal, mark it as applied here to track your exam schedule.'}
          </p>
          <button
            onClick={onBrowseFeed}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
          >
            <span>Browse Active Notifications</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedJobs.map((job) => {
            const urgency = calculateUrgency(job.deadline);
            const categoryMeta = CATEGORY_LABELS[job.category] || { en: job.category, hi: job.category, color: 'bg-slate-100 text-slate-800' };
            const isApplied = appliedJobIds.includes(job.id);

            return (
              <div
                key={job.id}
                className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${categoryMeta.color}`}>
                      {job.organization.shortName}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded flex items-center space-x-1 ${
                        urgency.level === 'red'
                          ? 'bg-rose-100 text-rose-800 animate-pulse'
                          : urgency.level === 'amber'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      <span>{urgency.label}</span>
                    </span>
                  </div>

                  <h3
                    onClick={() => onSelectJob(job)}
                    className="font-bold text-sm text-slate-900 hover:text-emerald-600 cursor-pointer line-clamp-2 leading-snug mb-2"
                  >
                    {job.title}
                  </h3>

                  <div className="text-xs text-slate-500 mb-3 space-y-1">
                    <div>Vacancies: <strong className="text-slate-800">{job.totalVacancies?.toLocaleString() || 'N/A'}</strong></div>
                    <div>Pay Scale: <strong className="text-slate-800">{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</strong></div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onToggleApplied(job.id)}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition ${
                      isApplied
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <CheckCircle className={`w-3.5 h-3.5 ${isApplied ? 'text-emerald-700' : 'text-slate-500'}`} />
                    <span>{isApplied ? 'Applied ✓' : 'Mark Applied'}</span>
                  </button>

                  <a
                    href={job.officialSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs transition"
                    title="Apply on Official Site"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => onToggleSave(job.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs transition"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
