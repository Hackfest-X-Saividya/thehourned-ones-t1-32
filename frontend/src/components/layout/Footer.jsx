import React from 'react';
import { ShieldAlert, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy-950 border-t border-slate-900 py-4 px-4 sm:px-6 text-[11px] text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert size={14} className="text-amber-500/80 shrink-0" />
          <span>
            <strong>FORENSIC INVESTIGATIVE ASSISTANCE PROTOCOL:</strong> Synthesized composites and feature similarity matches are non-conclusive investigative aids, not verified proof of identity or criminality.
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-slate-600">
          <span>SEC-BUILD: v2.4-HACKFEST</span>
          <span>•</span>
          <span>SHA-256 LEDGER ACTIVE</span>
        </div>
      </div>
    </footer>
  );
}
