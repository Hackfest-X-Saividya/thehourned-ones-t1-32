import React from 'react';
import { useSession } from '../../context/SessionContext';
import { Shield, FileText, CheckCircle2, UserCheck, AlertCircle } from 'lucide-react';
import Badge from '../common/Badge';

export default function SessionBanner() {
  const { sessionId, caseNumber, caseInfo, finalizedSketch } = useSession();

  return (
    <div className="bg-[#0B1120] border-b border-[#29374B] px-4 sm:px-6 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Case & Session details */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 font-mono">
            <span className="text-[#77879D]">Case:</span>
            <span className="font-semibold text-[#60A5FA] bg-[#172337] border border-[#29374B] px-2 py-0.5 rounded">
              {caseNumber}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 font-mono text-[#A2B1C5]">
            <span className="text-[#77879D]">Session:</span>
            <span>{sessionId}</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[#A2B1C5]">
            <span className="text-[#29374B]">•</span>
            <span>{caseInfo.incidentType}</span>
            <span className="text-[#29374B]">•</span>
            <span className="text-[#77879D] font-mono">{caseInfo.witnessCode}</span>
          </div>
        </div>

        {/* Right: Finalized Composite Indicator */}
        <div className="flex items-center gap-3">
          {finalizedSketch ? (
            <div className="flex items-center gap-2 bg-[#111B2B] border border-[#29374B] rounded px-2.5 py-1">
              <img
                src={finalizedSketch.imageUrl}
                alt="Active Target Composite"
                className="w-5 h-5 rounded-full object-cover border border-[#2DD4BF]/60"
              />
              <span className="text-[11px] text-[#A2B1C5] font-mono">
                Locked: <span className="text-[#E5EDF7] font-semibold">{finalizedSketch.imageId}</span> (v{finalizedSketch.iteration})
              </span>
              <CheckCircle2 size={13} className="text-[#2DD4BF] shrink-0 ml-1" />
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[#FBBF24] text-[11px]">
              <AlertCircle size={13} />
              <span>No composite finalized yet</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

