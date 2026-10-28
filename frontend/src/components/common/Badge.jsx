import React from 'react';

export default function Badge({ children, variant = 'info', size = 'sm', className = '' }) {
  const variantStyles = {
    info: 'bg-blue-950/60 text-[#60A5FA] border-[#29374B]',
    cyan: 'bg-blue-950/60 text-[#60A5FA] border-[#29374B]',
    teal: 'bg-teal-950/60 text-[#2DD4BF] border-teal-800/60',
    success: 'bg-emerald-950/60 text-[#34D399] border-emerald-800/60',
    warning: 'bg-amber-950/60 text-[#FBBF24] border-amber-800/60',
    danger: 'bg-rose-950/60 text-[#F87171] border-rose-800/60',
    neutral: 'bg-[#172337] text-[#A2B1C5] border-[#29374B]'
  };

  const sizeStyles = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-medium rounded border tracking-wide ${
        variantStyles[variant] || variantStyles.info
      } ${sizeStyles[size] || sizeStyles.sm} ${className}`}
    >
      {children}
    </span>
  );
}

