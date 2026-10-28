import React from 'react';
import { useSession } from '../../context/SessionContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const { toasts, removeToast } = useSession();

  if (!toasts || toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />,
    warning: <AlertTriangle size={16} className="text-amber-400 shrink-0" />,
    danger: <AlertCircle size={16} className="text-rose-400 shrink-0" />,
    info: <Info size={16} className="text-sky-400 shrink-0" />
  };

  const borders = {
    success: 'border-emerald-500/50 bg-emerald-950/90 text-emerald-100',
    warning: 'border-amber-500/50 bg-amber-950/90 text-amber-100',
    danger: 'border-rose-500/50 bg-rose-950/90 text-rose-100',
    info: 'border-sky-500/50 bg-navy-900/95 text-slate-100'
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-3.5 rounded-lg border shadow-xl backdrop-blur-md pointer-events-auto transition-all animate-slideIn ${
            borders[toast.type] || borders.info
          }`}
        >
          {icons[toast.type] || icons.info}
          <div className="text-xs font-medium leading-relaxed flex-1">
            {toast.message}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
