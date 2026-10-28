import React from 'react';
import { User, ShieldAlert, CheckCircle2, XCircle, ArrowRightLeft, MapPin, FileText } from 'lucide-react';
import Badge from '../common/Badge';

export default function CriminalMatchCard({ suspect, onInspectComparison }) {
  const isHighMatch = suspect.combinedScore >= 75.0;
  const isPartialMatch = suspect.combinedScore >= 50.0 && suspect.combinedScore < 75.0;

  const statusVariants = {
    ACTIVE_WARRANT: 'danger',
    ON_BAIL: 'warning',
    INVESTIGATION_PENDING: 'info'
  };

  return (
    <div
      className={`bg-navy-900 border rounded-xl p-4 sm:p-5 transition-all ${
        isHighMatch
          ? 'border-emerald-500/80 ring-1 ring-emerald-500/30 shadow-lg shadow-emerald-950/20'
          : isPartialMatch
          ? 'border-amber-500/50'
          : 'border-slate-800'
      }`}
    >
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        {/* Mugshot Image */}
        <div className="relative shrink-0">
          <img
            src={suspect.mugshotUrl}
            alt={suspect.fullName}
            className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-lg border border-slate-700 bg-navy-950"
          />
          <span className="absolute bottom-1.5 left-1.5 bg-navy-950/90 backdrop-blur-sm text-[9px] font-mono text-slate-300 px-1.5 py-0.5 rounded border border-slate-800">
            {suspect.gender}, {suspect.age}y
          </span>
        </div>

        {/* Suspect Meta & Criminal History */}
        <div className="flex-1 min-w-0 space-y-2.5">
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  {suspect.fullName}
                </h3>
                {suspect.alias && (
                  <span className="text-xs text-slate-400 font-mono italic">
                    (alias "{suspect.alias}")
                  </span>
                )}
              </div>
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                <span className="text-sky-400 font-semibold">{suspect.firNumber}</span>
                <span>•</span>
                <span>{suspect.jurisdiction}</span>
              </div>
            </div>

            {/* Overall Score Pill */}
            <div className="text-right">
              <span
                className={`inline-block font-mono font-bold text-xs px-2.5 py-1 rounded border ${
                  isHighMatch
                    ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500'
                    : isPartialMatch
                    ? 'bg-amber-950/90 text-amber-300 border-amber-500'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {suspect.combinedScore}% Combined Match
              </span>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                {isHighMatch ? 'EXISTING RECORD FOUND' : isPartialMatch ? 'PARTIAL ALIGNMENT' : 'LOW ALIGNMENT'}
              </div>
            </div>
          </div>

          {/* Dual Score Breakdown Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono pt-1">
            <div className="bg-navy-950 p-2 rounded border border-slate-800">
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Biometric Vector (60% wt):</span>
                <span className="text-sky-400 font-bold">{suspect.vectorSimilarity}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-sky-400 h-full rounded-full"
                  style={{ width: `${Math.min(suspect.vectorSimilarity, 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-navy-950 p-2 rounded border border-slate-800">
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Feature Alignment (40% wt):</span>
                <span className="text-emerald-400 font-bold">
                  {suspect.featureScore}% ({suspect.matchedTraits.length}/6)
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full"
                  style={{ width: `${Math.min(suspect.featureScore, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Feature Comparison Pills */}
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">
              Anatomical Trait Comparison Breakdown:
            </div>
            <div className="flex flex-wrap gap-1">
              {Object.entries(suspect.features).map(([key, val]) => {
                const isMatch = suspect.matchedTraits.includes(key);
                return (
                  <span
                    key={key}
                    className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border ${
                      isMatch
                        ? 'bg-emerald-950/70 border-emerald-600/80 text-emerald-300'
                        : 'bg-navy-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    {isMatch ? (
                      <CheckCircle2 size={10} className="text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle size={10} className="text-slate-600 shrink-0" />
                    )}
                    <span>
                      {key}: {val}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Offenses and Location Footer */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <FileText size={12} className="text-slate-500 shrink-0" />
              <span>Prior Record: {suspect.priorOffenses}</span>
            </div>

            <button
              onClick={() => onInspectComparison && onInspectComparison(suspect)}
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
            >
              <ArrowRightLeft size={13} />
              <span>Side-by-Side Comparison</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
