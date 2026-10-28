import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = '',
  type = 'button'
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-950 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:
      'bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold focus:ring-sky-400 shadow-sm active:scale-[0.98]',
    secondary:
      'bg-navy-800 hover:bg-navy-700 text-slate-100 border border-slate-700 hover:border-slate-600 focus:ring-sky-500',
    emerald:
      'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold focus:ring-emerald-400 shadow-sm active:scale-[0.98]',
    outline:
      'bg-transparent hover:bg-slate-800/60 text-slate-200 border border-slate-700 hover:border-slate-500 focus:ring-sky-500',
    danger:
      'bg-rose-600 hover:bg-rose-500 text-white font-medium focus:ring-rose-400',
    ghost:
      'bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-slate-100 focus:ring-slate-500'
  };

  const sizes = {
    xs: 'text-xs px-2.5 py-1 gap-1',
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin text-current" />
      ) : Icon ? (
        <Icon size={16} className="shrink-0" />
      ) : null}
      {children}
    </button>
  );
}
