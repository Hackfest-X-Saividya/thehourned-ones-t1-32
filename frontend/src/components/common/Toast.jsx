import React from 'react';
import { useSession } from '../../context/SessionContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const { toasts, removeToast } = useSession();

  if (!toasts || toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle2 size={16} className="text-[#34D399] shrink-0" />,
    warning: <AlertTriangle size={16} className="text-[#FBBF24] shrink-0" />,
    danger: <AlertCircle size={16} className="text-[#F87171] shrink-0" />,
    info: <Info size={16} className="text-[#60A5FA] shrink-0" />
  };

  const borders = {
    success: 'border-[#34D399]/40 bg-[#111B2B]/95 text-[#E5EDF7] shadow-lg shadow-black/40',
    warning: 'border-[#FBBF24]/40 bg-[#111B2B]/95 text-[#E5EDF7] shadow-lg shadow-black/40',
    danger: 'border-[#F87171]/40 bg-[#111B2B]/95 text-[#E5EDF7] shadow-lg shadow-black/40',
    info: 'border-[#29374B] bg-[#111B2B]/95 text-[#E5EDF7] shadow-lg shadow-black/40'
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

