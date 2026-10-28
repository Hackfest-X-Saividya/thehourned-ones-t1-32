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
          <div className="bg-navy-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-sky-400">
                  {initialSketch.imageId}
                </span>
                <span className="ml-2 text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                  v{initialSketch.iteration || 1} [BASE]
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                Seed: {initialSketch.seed}
              </span>
            </div>

            <img
              src={initialSketch.imageUrl}
              alt={initialSketch.imageId}
              className="w-full h-64 object-cover rounded-lg border border-slate-800"
            />

            <div className="text-[11px] text-slate-400 italic">
              "{initialSketch.prompt.slice(0, 80)}..."
            </div>
          </div>

          {/* Version B: Selected Refined Composite */}
          <div className="bg-navy-950 border-2 border-sky-500/60 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-sky-300">
                  {currentSketch.imageId}
                </span>
                <span className="ml-2 text-[10px] font-mono bg-sky-950 text-sky-300 border border-sky-700 px-1.5 py-0.5 rounded">
                  v{currentSketch.iteration} [CURRENT]
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Parent: {currentSketch.parentId || 'None'}
              </span>
            </div>

            <img
              src={currentSketch.imageUrl}
              alt={currentSketch.imageId}
              className="w-full h-64 object-cover rounded-lg border border-slate-700"
            />

            <div className="text-[11px] text-sky-200">
              {currentSketch.changeDescription || 'Refined composite version'}
            </div>
          </div>
        </div>

        {/* Anatomical Feature Delta Table */}
        <div className="bg-navy-950 border border-slate-800 rounded-xl overflow-hidden">
          <div className="bg-slate-900/80 px-4 py-2.5 border-b border-slate-800 text-xs font-bold uppercase text-slate-300 flex items-center gap-2">
            <ArrowRightLeft size={14} className="text-sky-400" />
            <span>Feature-by-Feature Anatomical Progression</span>
          </div>

          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/90 text-slate-400 border-b border-slate-800 text-[11px] uppercase">
                <th className="py-2.5 px-4 font-medium">Anatomical Trait</th>
                <th className="py-2.5 px-4 font-medium">Initial Version (v1)</th>
                <th className="py-2.5 px-4 font-medium">Refined Version (v{currentSketch.iteration})</th>
                <th className="py-2.5 px-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {featureKeys.map(({ key, label }) => {
                const valA = initialSketch.features?.[key] || 'Standard';
                const valB = currentSketch.features?.[key] || 'Standard';
                const hasChanged = valA !== valB;

                return (
                  <tr key={key} className={hasChanged ? 'bg-sky-950/20' : 'hover:bg-slate-900/40'}>
                    <td className="py-2 px-4 font-semibold text-slate-300">{label}</td>
                    <td className="py-2 px-4 text-slate-400 font-mono">{valA}</td>
                    <td className={`py-2 px-4 font-mono font-medium ${hasChanged ? 'text-sky-300' : 'text-slate-400'}`}>
                      {valB}
                    </td>
                    <td className="py-2 px-4">
                      {hasChanged ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                          MODIFIED
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-500">
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
