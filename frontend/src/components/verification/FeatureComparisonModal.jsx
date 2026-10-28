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
      <div className="space-y-4 text-xs">
        {/* Synthetic Demonstration Notice */}
        <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/50 text-[11px] text-[#FBBF24] flex items-start gap-2.5">
          <AlertTriangle size={16} className="text-[#FBBF24] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold">SYNTHETIC DEMONSTRATION RECORD:</strong> This criminal profile, mugshot, FIR
            number, and similarity score are synthetic demonstration data for hackathon evaluation.
            Similarity scores assist investigative leads and do not constitute legal proof of
            identity or criminality.
          </div>
        </div>

        {/* Side-by-Side Images */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Query Sketch */}
          <div className="bg-[#0B1120] p-3.5 rounded-xl border border-[#29374B] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-semibold text-[#60A5FA]">
                QUERY: {finalizedSketch.imageId}
              </span>
              <span className="text-[10px] font-mono bg-blue-950/60 text-[#60A5FA] border border-blue-800/60 px-1.5 py-0.5 rounded">
                Witness Composite
              </span>
            </div>
            <img
              src={finalizedSketch.imageUrl}
              alt={finalizedSketch.imageId}
              className="w-full h-56 object-cover rounded-lg border border-[#29374B]"
            />
          </div>

          {/* Stored Criminal Record */}
          <div className="bg-[#0B1120] p-3.5 rounded-xl border border-[#29374B] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-semibold text-[#E5EDF7]">
                RECORD: {suspectRecord.fullName}
              </span>
              <span className="text-[10px] font-mono bg-[#172337] text-[#A2B1C5] border border-[#29374B] px-1.5 py-0.5 rounded">
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
              className="w-full h-56 object-cover rounded-lg border border-[#29374B]"
            />
          </div>
        </div>

        {/* Feature Comparison Matrix */}
        <div className="bg-[#0B1120] rounded-xl border border-[#29374B] overflow-hidden">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#111B2B] border-b border-[#29374B] text-[11px] font-medium text-[#77879D]">
                <th className="py-2.5 px-4">Anatomical Attribute</th>
                <th className="py-2.5 px-4">Witness Composite Trait</th>
                <th className="py-2.5 px-4">Criminal Record Trait</th>
                <th className="py-2.5 px-4">Alignment Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#29374B]">
              {featureKeys.map(({ key, label }) => {
                const sketchVal = finalizedSketch.features?.[key] || 'Standard';
                const recordVal = suspectRecord.features?.[key] || 'Standard';
                const isMatch = suspectRecord.matchedTraits?.includes(key);

                return (
                  <tr key={key} className={isMatch ? 'bg-teal-950/20' : 'hover:bg-[#111B2B]/40'}>
                    <td className="py-2.5 px-4 font-medium text-[#A2B1C5]">{label}</td>
                    <td className="py-2.5 px-4 text-[#60A5FA] font-mono">{sketchVal}</td>
                    <td className="py-2.5 px-4 text-[#E5EDF7] font-mono">{recordVal}</td>
                    <td className="py-2.5 px-4">
                      {isMatch ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-[#2DD4BF] font-semibold bg-teal-950/60 border border-teal-800/60 px-2 py-0.5 rounded">
                          <CheckCircle2 size={11} /> MATCH
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-[#77879D] bg-[#111B2B] px-2 py-0.5 rounded border border-[#29374B]">
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
        <div className="p-3.5 bg-[#0B1120] rounded-xl border border-[#29374B] flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
          <div>
            <span className="text-[#77879D]">Biometric Vector Similarity: </span>
            <strong className="text-[#60A5FA]">{suspectRecord.vectorSimilarity}%</strong>
            <span className="text-[#29374B] mx-2">|</span>
            <span className="text-[#77879D]">Trait Alignment: </span>
            <strong className="text-[#2DD4BF]">{suspectRecord.featureScore}%</strong>
          </div>
          <div className="text-sm">
            <span className="text-[#77879D]">Combined Weighted Score: </span>
            <strong
              className={
                suspectRecord.combinedScore >= 75 ? 'text-[#2DD4BF] font-bold' : 'text-[#FBBF24] font-semibold'
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

