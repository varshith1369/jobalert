import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ExternalLink } from 'lucide-react';
import { CalendarEvent } from '../types/index.js';

export const ExamCalendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/calendar')
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load calendar events:', err);
        setLoading(false);
      });
  }, []);

  const filteredEvents = events.filter((ev) => {
    if (selectedFilter === 'ALL') return true;
    return ev.eventType === selectedFilter;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
      {/* Header & Type Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 text-emerald-600" />
            <span>National & State Exam Calendar</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track notification releases, last application deadlines, and scheduled exam dates in one synchronized timeline.
          </p>
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setSelectedFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedFilter === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => setSelectedFilter('DEADLINE')}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedFilter === 'DEADLINE' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Deadlines
          </button>
          <button
            onClick={() => setSelectedFilter('EXAM')}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedFilter === 'EXAM' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Exam Dates
          </button>
        </div>
      </div>

      {/* Events List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading exam schedule...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400">No scheduled exam events found.</div>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((ev) => {
            const eventDate = new Date(ev.date);
            const isDeadline = ev.eventType === 'DEADLINE';
            const isExam = ev.eventType === 'EXAM';

            return (
              <div
                key={ev.id}
                className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isDeadline
                    ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
                    : isExam
                    ? 'bg-blue-50/40 border-blue-200 hover:border-blue-300'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  {/* Date Block */}
                  <div
                    className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold text-center shrink-0 border ${
                      isDeadline
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : isExam
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-extrabold tracking-wider leading-none">
                      {eventDate.toLocaleDateString('en-IN', { month: 'short' })}
                    </span>
                    <span className="text-base leading-none font-black mt-0.5">
                      {eventDate.getDate()}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-[11px] font-extrabold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">
                        {ev.orgShortName}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isDeadline
                            ? 'bg-rose-200 text-rose-800'
                            : isExam
                            ? 'bg-blue-200 text-blue-800'
                            : 'bg-emerald-200 text-emerald-800'
                        }`}
                      >
                        {ev.eventType}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{ev.title}</h4>
                    <span className="text-[11px] text-slate-500">
                      Scheduled for {eventDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                <a
                  href={ev.officialSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center space-x-1.5 text-xs font-bold px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm transition shrink-0"
                >
                  <span>Official Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
