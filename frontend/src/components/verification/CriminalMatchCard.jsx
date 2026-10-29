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
import { getEvaluatedSketchForRecord } from '../../services/evaluatedSketches';

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
    score >= 75 ? '#2DD4BF' : score >= 50 ? '#FBBF24' : '#77879D';

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
          stroke="#172337"
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
        <span className="text-[7px] font-mono text-[#77879D] uppercase tracking-tighter mt-0.5">
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
  const recordSketch = getEvaluatedSketchForRecord(suspect);
  return (
    <div
      className={`bg-[#111B2B] border rounded-xl p-4 sm:p-5 transition-all shadow-sm ${
        isHighMatch
          ? 'border-[#2DD4BF]/60 ring-1 ring-[#2DD4BF]/20 shadow-lg shadow-teal-950/20'
          : isPartialMatch
          ? 'border-[#FBBF24]/50 shadow-md shadow-amber-950/10'
          : 'border-[#29374B]'
      }`}
    >
      <div className="flex flex-col md:flex-row gap-4 items-start">
        {/* Locally bundled synthetic graphite sketch for the evaluated record */}
        <div className="relative shrink-0 w-28 h-36 sm:w-32 sm:h-40 rounded-lg overflow-hidden border border-[#29374B] bg-[#0B1120] shadow-md">
          <img
            src={recordSketch.src}
            alt={`Synthetic forensic-style reference sketch ${recordSketch.id}`}
            className="w-full h-full object-contain"
            loading="lazy"
          />
          <span className="absolute top-1 left-1 bg-[#0B1120]/90 text-[8px] font-mono text-[#A2B1C5] px-1.5 py-0.5 rounded border border-[#29374B]">
            DEMO SKETCH
          </span>
          <span className="absolute bottom-1 left-1 bg-[#0B1120]/90 text-[8px] font-mono text-[#A2B1C5] px-1.5 py-0.5 rounded border border-[#29374B]">
            {recordSketch.id} ({suspect.gender}, {suspect.age}y)
          </span>
        </div>

        {/* Information Panel */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Header Row: Identity, FIR, Jurisdiction and Offender Status */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#29374B] pb-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#E5EDF7] tracking-wide">
                  {suspect.fullName}
                </h3>
                {suspect.alias && (
                  <span className="text-xs text-[#77879D] font-mono italic">
                    (alias "{suspect.alias}")
                  </span>
                )}
              </div>
              <div className="text-[11px] font-mono text-[#A2B1C5] flex items-center gap-2 mt-0.5">
                <span className="text-[#60A5FA] font-semibold">{suspect.firNumber}</span>
                <span className="text-[#77879D]">•</span>
                <span>{suspect.jurisdiction}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                  suspect.status === 'ACTIVE_WARRANT'
                    ? 'bg-rose-950/80 text-[#F87171] border-rose-700'
                    : suspect.status === 'ON_BAIL'
                    ? 'bg-amber-950/80 text-[#FBBF24] border-amber-700'
                    : 'bg-[#172337] text-[#A2B1C5] border-[#29374B]'
                }`}
              >
                {suspect.status ? suspect.status.replace('_', ' ') : 'REGISTERED OFFENDER'}
              </span>
              <CircularMatchGauge score={suspect.combinedScore} size={56} />
            </div>
          </div>

          {/* Dual Score Breakdown Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono pt-1">
            <div className="bg-[#0B1120] p-2 rounded-lg border border-[#29374B]">
              <div className="flex justify-between text-[#77879D] mb-1">
                <span>Biometric Vector (60% wt):</span>
                <span className="text-[#60A5FA] font-bold">{suspect.vectorSimilarity}%</span>
              </div>
              <div className="w-full bg-[#172337] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#60A5FA] h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(suspect.vectorSimilarity, 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-[#0B1120] p-2 rounded-lg border border-[#29374B]">
              <div className="flex justify-between text-[#77879D] mb-1">
                <span>Feature Alignment (40% wt):</span>
                <span className="text-[#2DD4BF] font-bold">
                  {suspect.featureScore}% ({suspect.matchedTraits?.length || 0}/6)
                </span>
              </div>
              <div className="w-full bg-[#172337] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#2DD4BF] h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(suspect.featureScore, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Feature Comparison Pills */}
          <div>
            <div className="text-[11px] font-medium text-[#A2B1C5] mb-1.5">
              Anatomical Trait Comparison Breakdown:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(suspect.features || {}).map(([key, val]) => {
                const isMatch = suspect.matchedTraits?.includes(key);
                return (
                  <span
                    key={key}
                    className={`inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                      isMatch
                        ? 'bg-teal-950/40 border-teal-800/50 text-[#2DD4BF]'
                        : 'bg-[#0B1120] border-[#29374B]/60 text-[#77879D]'
                    }`}
                  >
                    {isMatch ? (
                      <CheckCircle2 size={11} className="text-[#2DD4BF] shrink-0" />
                    ) : (
                      <XCircle size={11} className="text-[#77879D] shrink-0" />
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
          <div className="pt-2.5 border-t border-[#29374B] flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="text-[11px] text-[#A2B1C5] flex items-center gap-1.5">
              <FileText size={13} className="text-[#77879D] shrink-0" />
              <span>Prior Record: {suspect.priorOffenses}</span>
            </div>

            <button
              type="button"
              onClick={() => onInspectComparison && onInspectComparison(suspect)}
              className="text-xs font-medium text-[#60A5FA] hover:text-[#93C5FD] flex items-center gap-1.5 transition-colors"
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
