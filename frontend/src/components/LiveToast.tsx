import React, { useEffect, useState, useCallback, useRef } from 'react';
import { X, Bell, AlertCircle, Briefcase } from 'lucide-react';

export interface ToastData {
  id: string;
  type: 'new_job' | 'urgent' | 'info';
  title: string;
  subtitle: string;
  exiting?: boolean;
}

interface ToastItemProps {
  toast: ToastData;
  onClose: (id: string) => void;
}

const ICONS = {
  new_job: <Briefcase className="w-4 h-4 text-emerald-400" />,
  urgent: <AlertCircle className="w-4 h-4 text-rose-400" />,
  info: <Bell className="w-4 h-4 text-blue-400" />,
};

const BORDER_COLORS = {
  new_job: '#10b981',
  urgent: '#ef4444',
  info: '#3b82f6',
};

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Slight delay before making visible to allow entrance animation
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => onClose(toast.id), 5500);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  return (
    <div
      className={`toast transition-all duration-300 ${toast.type === 'urgent' ? 'toast-urgent' : toast.type === 'new_job' ? 'toast-new' : 'toast-info'}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(-16px) scale(0.95)',
        transition: 'opacity 0.35s cubic-bezier(0.34,1.56,0.64,1), transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        borderLeftColor: BORDER_COLORS[toast.type],
      }}
    >
      <div
        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: toast.type === 'urgent' ? 'rgba(239,68,68,0.15)' : toast.type === 'new_job' ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)' }}
      >
        {ICONS[toast.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white leading-tight">{toast.title}</p>
        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{toast.subtitle}</p>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 p-1 rounded-md hover:bg-white/10 transition text-slate-500 hover:text-white"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

// Global toast hook
let _addToast: ((t: Omit<ToastData, 'id'>) => void) | null = null;

export const addToast = (toast: Omit<ToastData, 'id'>) => {
  if (_addToast) _addToast(toast);
};

export const LiveToastSystem: React.FC = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const toastsRef = useRef(toasts);
  toastsRef.current = toasts;

  const add = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    setToasts(prev => {
      // Max 4 toasts at once
      const next = prev.length >= 4 ? prev.slice(1) : prev;
      return [...next, { ...toast, id }];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    _addToast = add;
    return () => { _addToast = null; };
  }, [add]);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onClose={remove} />
      ))}
    </div>
  );
};
