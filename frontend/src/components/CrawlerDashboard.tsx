import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, CheckCircle, AlertTriangle, Play, ShieldAlert } from 'lucide-react';
import { CrawlerSource } from '../types/index.js';

export const CrawlerDashboard: React.FC = () => {
  const [sources, setSources] = useState<CrawlerSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchStatuses = () => {
    setLoading(true);
    fetch('/api/admin/crawlers')
      .then((res) => res.json())
      .then((data) => {
        setSources(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load crawler statuses:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  const handleRunNow = async () => {
    setTriggering(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/crawlers/run', { method: 'POST' });
      const data = await res.json();
      setMessage(data.message || 'Scrapers triggered successfully');
      setTimeout(() => {
        fetchStatuses();
        setTriggering(false);
      }, 3000);
    } catch (err: any) {
      setMessage('Failed to trigger scrapers: ' + err.message);
      setTriggering(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              Scraper & Data Pipeline Monitor
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time telemetry, anti-rot heartbeat monitors, and scraper execution status across all ingestion pipelines.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchStatuses}
            disabled={loading}
            className="p-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold flex items-center space-x-1 transition"
            title="Refresh Status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          <button
            onClick={handleRunNow}
            disabled={triggering}
            className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition"
          >
            <Play className={`w-3.5 h-3.5 ${triggering ? 'animate-pulse' : ''}`} />
            <span>{triggering ? 'Crawling...' : 'Run Pipeline Now'}</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
          {message}
        </div>
      )}

      {/* Crawlers Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-y border-slate-200">
            <tr>
              <th className="py-3 px-4">Pipeline Source</th>
              <th className="py-3 px-4">Engine</th>
              <th className="py-3 px-4">Schedule</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Extracted</th>
              <th className="py-3 px-4">Last Execution</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {sources.map((src) => (
              <tr key={src.id} className="hover:bg-slate-50/70 transition">
                <td className="py-3.5 px-4 font-bold text-slate-900">
                  <div>{src.name}</div>
                  <a
                    href={src.baseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-slate-400 hover:text-emerald-600 truncate block max-w-xs font-normal"
                  >
                    {src.baseUrl}
                  </a>
                </td>
                <td className="py-3.5 px-4">
                  <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                    {src.parserType}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                  {src.scheduleCron}
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      src.status === 'HEALTHY'
                        ? 'bg-emerald-100 text-emerald-800'
                        : src.status === 'DEGRADED'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {src.status === 'HEALTHY' ? (
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                    )}
                    <span>{src.status}</span>
                  </span>
                </td>
                <td className="py-3.5 px-4 font-bold text-slate-800">
                  {src.itemsFound} items
                </td>
                <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                  {src.lastRunAt
                    ? new Date(src.lastRunAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                    : 'Never'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resilience Advisory */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start space-x-3 text-xs text-slate-600">
        <ShieldAlert className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold text-slate-800 block mb-0.5">Scraper Resilience Architecture</span>
          All scrapers implement DOM content-hashing (SHA-256) to eliminate duplicate storage, automatic exponential-backoff retries, and fallback datasets when government commission firewalls throttle requests.
        </div>
      </div>
    </div>
  );
};
