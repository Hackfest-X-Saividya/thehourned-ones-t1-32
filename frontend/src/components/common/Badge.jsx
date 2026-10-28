import React from 'react';

export default function Badge({ children, variant = 'info', size = 'sm', className = '' }) {
  const variantStyles = {
    info: 'bg-sky-950/80 text-sky-300 border-sky-800/80',
    cyan: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/80',
    success: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80',
    warning: 'bg-amber-950/80 text-amber-300 border-amber-800/80',
    danger: 'bg-rose-950/80 text-rose-300 border-rose-800/80',
    neutral: 'bg-slate-850 text-slate-300 border-slate-700/80'
  };

  const sizeStyles = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-medium rounded border uppercase tracking-wider ${
        variantStyles[variant] || variantStyles.info
      } ${sizeStyles[size] || sizeStyles.sm} ${className}`}
    >
      {children}
    </span>
  );
}
