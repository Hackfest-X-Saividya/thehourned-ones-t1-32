import React from 'react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import { ArrowRightLeft, CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { getMugshotFallback } from '../../services/mockCriminalDb';

export default function FeatureComparisonModal({
  isOpen,
  onClose,
  finalizedSketch,
  suspectRecord
}) {
  if (!finalizedSketch || !suspectRecord) return null;

  const featureKeys = [
    { key: 'faceShape', label: 'Face Shape / Contour' },
    { key: 'jawline', label: 'Jawline & Angle' },
    { key: 'eyes', label: 'Eye Morphology' },
    { key: 'nose', label: 'Nasal Bridge' },
    { key: 'facialHair', label: 'Facial Hair' },
    { key: 'marks', label: 'Distinguishing Marks' },
    { key: 'ageRange', label: 'Age Estimate' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Forensic Feature Alignment: Query Composite vs ${suspectRecord.fullName}`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-5 text-xs">
        {/* Synthetic Demonstration Notice */}
        <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/80 text-[11px] text-amber-200 flex items-start gap-2.5">
          <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong>SYNTHETIC DEMONSTRATION RECORD:</strong> This criminal profile, mugshot, FIR
            number, and similarity score are synthetic demonstration data for hackathon evaluation.
            Similarity scores assist investigative leads and do not constitute legal proof of
            identity or criminality.
          </div>
        </div>

        {/* Side-by-Side Images */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Query Sketch */}
          <div className="bg-navy-950 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-sky-400">
                QUERY: {finalizedSketch.imageId}
              </span>
              <span className="text-[10px] font-mono bg-sky-950 text-sky-300 border border-sky-800 px-1.5 py-0.5 rounded">
                Witness Composite
              </span>
            </div>
            <img
              src={finalizedSketch.imageUrl}
              alt={finalizedSketch.imageId}
              className="w-full h-56 object-cover rounded-lg border border-slate-700"
            />
          </div>

          {/* Stored Criminal Record */}
          <div className="bg-navy-950 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-white">
                RECORD: {suspectRecord.fullName}
              </span>
              <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                {suspectRecord.firNumber}
              </span>
            </div>
            <img
              src={suspectRecord.mugshotUrl}
              alt={suspectRecord.fullName}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = getMugshotFallback(suspectRecord.gender, suspectRecord.suspectId);
              }}
              className="w-full h-56 object-cover rounded-lg border border-slate-700 bg-navy-950"
            />
          </div>
        </div>

        {/* Feature Comparison Matrix */}
        <div className="bg-navy-950 rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800 text-[11px] uppercase text-slate-400">
                <th className="py-2.5 px-4 font-medium">Anatomical Attribute</th>
                <th className="py-2.5 px-4 font-medium">Witness Composite Trait</th>
                <th className="py-2.5 px-4 font-medium">Criminal Record Trait</th>
                <th className="py-2.5 px-4 font-medium">Alignment Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {featureKeys.map(({ key, label }) => {
                const sketchVal = finalizedSketch.features?.[key] || 'Standard';
                const recordVal = suspectRecord.features?.[key] || 'Standard';
                const isMatch = suspectRecord.matchedTraits?.includes(key);

                return (
                  <tr key={key} className={isMatch ? 'bg-emerald-950/20' : 'hover:bg-slate-900/40'}>
                    <td className="py-2.5 px-4 font-semibold text-slate-300">{label}</td>
                    <td className="py-2.5 px-4 text-sky-300 font-mono">{sketchVal}</td>
                    <td className="py-2.5 px-4 text-slate-300 font-mono">{recordVal}</td>
                    <td className="py-2.5 px-4">
                      {isMatch ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded">
                          <CheckCircle2 size={11} /> MATCH
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-500 bg-navy-950 px-2 py-0.5 rounded border border-slate-850">
                          <XCircle size={11} /> MISMATCH
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        <div className="p-3 bg-navy-950 rounded-lg border border-slate-800 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
          <div>
            <span className="text-slate-400">Biometric Vector Similarity: </span>
            <strong className="text-sky-400">{suspectRecord.vectorSimilarity}%</strong>
            <span className="text-slate-500 mx-2">|</span>
            <span className="text-slate-400">Trait Alignment: </span>
            <strong className="text-emerald-400">{suspectRecord.featureScore}%</strong>
          </div>
          <div className="text-sm">
            <span className="text-slate-400">Combined Weighted Score: </span>
            <strong
              className={
                suspectRecord.combinedScore >= 75 ? 'text-emerald-400 font-bold' : 'text-amber-400'
              }
            >
              {suspectRecord.combinedScore}%
            </strong>
          </div>
        </div>
      </div>
    </Modal>
  );
}
