import React from 'react';
import {
  User,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  ArrowRightLeft,
  MapPin,
  FileText,
  Sparkles,
  Fingerprint,
  Sliders
} from 'lucide-react';
import Badge from '../common/Badge';
import { getMugshotFallback } from '../../services/mockCriminalDb';

/**
 * Circular SVG Radial Progress Gauge for overall combined match percentage.
 */
function CircularMatchGauge({ score, size = 68 }) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score || 0));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  const color =
    score >= 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#64748B';

  return (
    <div
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
      title={`Dual-Metric Combined Match Score: ${score}%`}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1E293B"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xs font-extrabold font-mono leading-none" style={{ color }}>
          {score}%
        </span>
        <span className="text-[7px] font-mono text-slate-400 uppercase tracking-tighter mt-0.5">
          MATCH
        </span>
      </div>
    </div>
  );
}

export default function CriminalMatchCard({ suspect, queryFeatures, onInspectComparison }) {
  const isHighMatch = suspect.combinedScore >= 75.0;
  const isPartialMatch = suspect.combinedScore >= 50.0 && suspect.combinedScore < 75.0;

  const featureLabels = [
    { key: 'faceShape', label: 'Face Shape' },
    { key: 'jawline', label: 'Jawline' },
    { key: 'eyes', label: 'Eyes' },
    { key: 'nose', label: 'Nose' },
    { key: 'facialHair', label: 'Facial Hair' },
    { key: 'marks', label: 'Marks & Scars' }
  ];

  const matchedCount = suspect.matchedTraits?.length || 0;

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
      <div className="flex flex-col md:flex-row gap-4 items-start">
        {/* Mugshot Image Container with Forensic Framing */}
        <div className="relative shrink-0 w-28 h-28 sm:w-32 sm:h-32 rounded-lg overflow-hidden border border-slate-700 bg-navy-950 shadow-md">
          <img
            src={suspect.mugshotUrl}
            alt={suspect.fullName}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = getMugshotFallback(suspect.gender, suspect.suspectId);
            }}
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-1.5 left-1.5 bg-navy-950/90 backdrop-blur-sm text-[9px] font-mono text-slate-300 px-1.5 py-0.5 rounded border border-slate-800">
            {suspect.gender}, {suspect.age}y
          </span>
        </div>

        {/* Information Panel */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Header Row: Identity, FIR, Jurisdiction and Offender Status */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
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

            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                  suspect.status === 'ACTIVE_WARRANT'
                    ? 'bg-rose-950/80 text-rose-300 border-rose-700'
                    : suspect.status === 'ON_BAIL'
                    ? 'bg-amber-950/80 text-amber-300 border-amber-700'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {suspect.status ? suspect.status.replace('_', ' ') : 'REGISTERED OFFENDER'}
              </span>
            </div>
          </div>

          {/* Body Section: Matching Features on LEFT, Graphical Percentage Representation on RIGHT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
            {/* LEFT SECTION OF INFORMATION PANEL: All features matching with selected version aligned left */}
            <div className="lg:col-span-7 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1 font-semibold text-slate-300">
                  <CheckCircle2 size={11} className="text-emerald-400" />
                  MATCHING TRAITS WITH SELECTED COMPOSITE:
                </span>
                <span className="text-emerald-400 font-bold">
                  {matchedCount} of 6 Matched
                </span>
              </div>

              {/* Left-Aligned Structured Trait Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px] font-mono">
                {featureLabels.map(({ key, label }) => {
                  const val = suspect.features?.[key] || 'Standard';
                  const isMatch = suspect.matchedTraits?.includes(key);

                  return (
                    <div
                      key={key}
                      className={`px-2 py-1.5 rounded border flex items-center justify-between gap-1.5 transition-colors ${
                        isMatch
                          ? 'bg-emerald-950/70 border-emerald-500/70 text-emerald-200 shadow-sm'
                          : 'bg-navy-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        {isMatch ? (
                          <CheckCircle2 size={11} className="text-emerald-400 shrink-0" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0" />
                        )}
                        <span className="text-[10px] text-slate-400">{label}:</span>
                        <span className={`truncate font-semibold ${isMatch ? 'text-emerald-300' : 'text-slate-300'}`} title={val}>
                          {val}
                        </span>
                      </div>
                      {isMatch && (
                        <span className="text-[8px] uppercase tracking-tighter px-1 rounded bg-emerald-900/80 text-emerald-300 border border-emerald-600/60 shrink-0">
                          Match
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT SECTION OF INFORMATION PANEL: Graphical Percentage Gauge and Dual Metrics */}
            <div className="lg:col-span-5 bg-navy-950 p-2.5 rounded-lg border border-slate-800 flex flex-col justify-between space-y-2">
              <div className="flex items-center gap-3">
                {/* Graphical Circular Progress Meter */}
                <CircularMatchGauge score={suspect.combinedScore} size={64} />

                {/* Graphical Metric Mini-Meters */}
                <div className="flex-1 space-y-1.5 min-w-0">
                  <div>
                    <div className="flex justify-between text-[9px] font-mono text-slate-400 mb-0.5">
                      <span>Biometric Vector (60%):</span>
                      <span className="text-sky-400 font-bold">{suspect.vectorSimilarity}%</span>
                    </div>
                    <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-gradient-to-r from-sky-500 to-sky-300 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(suspect.vectorSimilarity, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[9px] font-mono text-slate-400 mb-0.5">
                      <span>Feature Align (40%):</span>
                      <span className="text-emerald-400 font-bold">{suspect.featureScore}%</span>
                    </div>
                    <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(suspect.featureScore, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Match Verdict Pill */}
              <div className="text-center pt-1 border-t border-slate-850">
                <span
                  className={`text-[9.5px] font-mono font-bold uppercase tracking-wider ${
                    isHighMatch
                      ? 'text-emerald-400'
                      : isPartialMatch
                      ? 'text-amber-400'
                      : 'text-slate-400'
                  }`}
                >
                  {isHighMatch ? '✓ EXISTING RECORD FOUND' : isPartialMatch ? '• PARTIAL ALIGNMENT' : '• LOW SIMILARITY'}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Row: Prior Record and Side-by-Side Action Button */}
          <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 min-w-0 truncate">
              <FileText size={12} className="text-slate-500 shrink-0" />
              <span className="truncate">Prior Record: {suspect.priorOffenses}</span>
            </div>

            <button
              type="button"
              onClick={() => onInspectComparison && onInspectComparison(suspect)}
              className="px-2.5 py-1 rounded bg-sky-500/10 hover:bg-sky-500 hover:text-navy-950 border border-sky-500/30 text-sky-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              <ArrowRightLeft size={12} />
              <span>Side-by-Side Comparison</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
