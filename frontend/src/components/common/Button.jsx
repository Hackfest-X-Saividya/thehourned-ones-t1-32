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
      'bg-[#60A5FA] hover:bg-[#3B82F6] text-[#0B1120] font-semibold focus:ring-[#60A5FA] shadow-sm active:scale-[0.98]',
    secondary:
      'bg-[#172337] hover:bg-[#203049] text-[#E5EDF7] border border-[#29374B] hover:border-[#3B4D68] focus:ring-[#60A5FA]',
    emerald:
      'bg-[#2DD4BF] hover:bg-[#14B8A6] text-[#0B1120] font-semibold focus:ring-[#2DD4BF] shadow-sm active:scale-[0.98]',
    teal:
      'bg-[#2DD4BF] hover:bg-[#14B8A6] text-[#0B1120] font-semibold focus:ring-[#2DD4BF] shadow-sm active:scale-[0.98]',
    outline:
      'bg-transparent hover:bg-[#172337] text-[#E5EDF7] border border-[#29374B] hover:border-[#3B4D68] focus:ring-[#60A5FA]',
    danger:
      'bg-[#F87171] hover:bg-[#EF4444] text-[#0B1120] font-medium focus:ring-[#F87171]',
    ghost:
      'bg-transparent hover:bg-[#172337] text-[#A2B1C5] hover:text-[#E5EDF7] focus:ring-[#60A5FA]'
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

