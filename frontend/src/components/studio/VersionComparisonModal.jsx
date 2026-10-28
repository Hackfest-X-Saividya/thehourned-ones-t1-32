import React from 'react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import { ArrowRightLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function VersionComparisonModal({
  isOpen,
  onClose,
  initialSketch,
  currentSketch
}) {
  if (!initialSketch || !currentSketch) return null;

  const featureKeys = [
    { key: 'faceShape', label: 'Face Shape' },
    { key: 'jawline', label: 'Jawline' },
    { key: 'eyes', label: 'Eyes' },
    { key: 'nose', label: 'Nose Profile' },
    { key: 'facialHair', label: 'Facial Hair' },
    { key: 'marks', label: 'Distinguishing Marks' },
    { key: 'ageRange', label: 'Age Estimate' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Forensic Version Evolution & Trait Delta Comparison"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Side by side image cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Version A: Initial Root Composite */}
          <div className="bg-[#0B1120] border border-[#29374B] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-semibold text-[#60A5FA]">
                  {initialSketch.imageId}
                </span>
                <span className="ml-2 text-[10px] font-mono bg-[#172337] text-[#A2B1C5] border border-[#29374B] px-1.5 py-0.5 rounded">
                  v{initialSketch.iteration || 1} [BASE]
                </span>
              </div>
              <span className="text-[10px] text-[#77879D] font-mono">
                Seed: {initialSketch.seed}
              </span>
            </div>

            <img
              src={initialSketch.imageUrl}
              alt={initialSketch.imageId}
              className="w-full h-64 object-cover rounded-lg border border-[#29374B]"
            />

            <div className="text-[11px] text-[#77879D] italic">
              "{initialSketch.prompt.slice(0, 80)}..."
            </div>
          </div>

          {/* Version B: Selected Refined Composite */}
          <div className="bg-[#0B1120] border-2 border-[#60A5FA]/60 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-semibold text-[#60A5FA]">
                  {currentSketch.imageId}
                </span>
                <span className="ml-2 text-[10px] font-mono bg-[#172337] text-[#60A5FA] border border-[#29374B] px-1.5 py-0.5 rounded">
                  v{currentSketch.iteration} [CURRENT]
                </span>
              </div>
              <span className="text-[10px] text-[#77879D] font-mono">
                Parent: {currentSketch.parentId || 'None'}
              </span>
            </div>

            <img
              src={currentSketch.imageUrl}
              alt={currentSketch.imageId}
              className="w-full h-64 object-cover rounded-lg border border-[#29374B]"
            />

            <div className="text-[11px] text-[#E5EDF7]">
              {currentSketch.changeDescription || 'Refined composite version'}
            </div>
          </div>
        </div>

        {/* Anatomical Feature Delta Table */}
        <div className="bg-[#0B1120] border border-[#29374B] rounded-xl overflow-hidden">
          <div className="bg-[#111B2B] px-4 py-2.5 border-b border-[#29374B] text-xs font-semibold text-[#E5EDF7] flex items-center gap-2">
            <ArrowRightLeft size={14} className="text-[#60A5FA]" />
            <span>Feature-by-Feature Anatomical Progression</span>
          </div>

          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#111B2B]/70 text-[#77879D] border-b border-[#29374B] text-[11px] uppercase tracking-wide">
                <th className="py-2.5 px-4 font-medium">Anatomical Trait</th>
                <th className="py-2.5 px-4 font-medium">Initial Version (v1)</th>
                <th className="py-2.5 px-4 font-medium">Refined Version (v{currentSketch.iteration})</th>
                <th className="py-2.5 px-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#29374B]/70">
              {featureKeys.map(({ key, label }) => {
                const valA = initialSketch.features?.[key] || 'Standard';
                const valB = currentSketch.features?.[key] || 'Standard';
                const hasChanged = valA !== valB;

                return (
                  <tr key={key} className={hasChanged ? 'bg-[#60A5FA]/10' : 'hover:bg-[#172337]/40'}>
                    <td className="py-2 px-4 font-semibold text-[#E5EDF7]">{label}</td>
                    <td className="py-2 px-4 text-[#A2B1C5] font-mono">{valA}</td>
                    <td className={`py-2 px-4 font-mono font-medium ${hasChanged ? 'text-[#60A5FA]' : 'text-[#A2B1C5]'}`}>
                      {valB}
                    </td>
                    <td className="py-2 px-4">
                      {hasChanged ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/60 text-[#60A5FA] border border-blue-800/60">
                          MODIFIED
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#172337] text-[#77879D] border border-[#29374B]">
                          UNCHANGED
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}

