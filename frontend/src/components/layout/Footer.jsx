import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0B1120] border-t border-[#29374B] py-3.5 px-4 sm:px-6 text-[11px] text-[#77879D]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert size={14} className="text-[#FBBF24]/90 shrink-0" />
          <span>
            <strong className="text-[#A2B1C5] font-semibold">Investigative Assistance Notice:</strong> Synthesized composites and feature similarity matches are non-conclusive investigative aids, not verified proof of identity or criminality.
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[#77879D]">
          <span>BUILD: v2.4</span>
          <span>•</span>
          <span>SHA-256 LEDGER ACTIVE</span>
        </div>
      </div>
    </footer>
  );
}
