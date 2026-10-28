import React from 'react';
import { useSession } from '../../context/SessionContext';
import { Shield, FileText, CheckCircle2, UserCheck, AlertCircle } from 'lucide-react';
import Badge from '../common/Badge';

import { createMockCandidatePreview } from '../../services/api';

export default function SessionBanner() {
  const { sessionId, caseNumber, caseInfo, finalizedSketch } = useSession();

  return (
    <div className="bg-navy-900/60 border-b border-slate-800/80 px-4 sm:px-6 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Case & Session details */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-slate-400">ACTIVE CASE:</span>
            <span className="font-bold text-sky-400 bg-sky-950/70 border border-sky-800/60 px-2 py-0.5 rounded">
              {caseNumber}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 font-mono text-slate-300">
            <span className="text-slate-500">SESSION:</span>
            <span>{sessionId}</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-slate-400">
            <span className="text-slate-600">•</span>
            <span>{caseInfo.incidentType}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300 font-mono">{caseInfo.witnessCode}</span>
          </div>
        </div>

        {/* Right: Finalized Composite Indicator */}
        <div className="flex items-center gap-3">
          {finalizedSketch ? (
            <div className="flex items-center gap-2 bg-navy-950/80 border border-slate-800 rounded px-2.5 py-1">
              <img
                src={finalizedSketch.imageUrl || createMockCandidatePreview('sketch', finalizedSketch.seed || 1042)}
                alt="Active Target Composite"
                className="w-5 h-5 rounded-full object-cover border border-sky-500/50"
                onError={(e) => {
                  e.currentTarget.src = createMockCandidatePreview('sketch', finalizedSketch.seed || 1042);
                }}
              />
              <span className="text-[11px] text-slate-300 font-mono">
                Locked: <span className="text-sky-300 font-semibold">{finalizedSketch.imageId}</span> (v{finalizedSketch.iteration})
              </span>
              <CheckCircle2 size={13} className="text-emerald-400 shrink-0 ml-1" />
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-amber-400 text-[11px]">
              <AlertCircle size={13} />
              <span>No composite finalized yet</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
