import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../../context/SessionContext';
import { UserCheck, Sliders, ExternalLink, Hash, ShieldCheck } from 'lucide-react';
import Badge from '../common/Badge';

export default function FinalizedSuspectPanel() {
  const navigate = useNavigate();
  const { finalizedSketch, sessionId, caseNumber } = useSession();

  if (!finalizedSketch) {
    return (
      <div className="bg-navy-900 border border-slate-800 rounded-xl p-5 text-center text-xs text-slate-400">
        No finalized suspect composite found for this session.
        <button
          onClick={() => navigate('/')}
          className="mt-3 block mx-auto text-sky-400 hover:underline font-medium"
        >
          Return to Studio to finalize a sketch →
        </button>
      </div>
    );
  }

  const features = finalizedSketch.features || {};

  const featureLabels = [
    { key: 'faceShape', label: 'Face Contour' },
    { key: 'jawline', label: 'Jaw & Gonial Angle' },
    { key: 'eyes', label: 'Eye Morphology' },
    { key: 'nose', label: 'Nasal Bridge' },
    { key: 'facialHair', label: 'Facial Hair' },
    { key: 'marks', label: 'Marks / Scars' },
    { key: 'ageRange', label: 'Estimated Age' }
  ];

  return (
    <div className="bg-navy-900 border border-slate-800 rounded-xl p-5 space-y-4">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <UserCheck size={16} className="text-sky-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">
            Query Composite Input
          </h2>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
          LOCKED FOR VERIFICATION
        </span>
      </div>

      {/* Portrait & Core Meta */}
      <div className="space-y-3">
        <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-navy-950">
          <img
            src={finalizedSketch.imageUrl}
            alt={finalizedSketch.imageId}
            className="w-full h-64 object-cover"
          />
          <div className="absolute top-2 right-2 bg-navy-950/90 backdrop-blur-md px-2 py-0.5 rounded border border-slate-800 text-[10px] font-mono text-emerald-400">
            v{finalizedSketch.iteration} Active
          </div>
        </div>

        <div className="bg-navy-950 p-2.5 rounded border border-slate-800 text-[11px] font-mono space-y-1">
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-500">Image ID:</span>
            <span className="text-sky-400 font-bold">{finalizedSketch.imageId}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-500">Case FIR:</span>
            <span>{caseNumber}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 pt-1 border-t border-slate-850 truncate">
            <Hash size={11} className="shrink-0 text-sky-400" />
            <span className="truncate" title={finalizedSketch.imageHash}>
              {finalizedSketch.imageHash ? `${finalizedSketch.imageHash.slice(0, 24)}...` : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Extracted Anatomical Attributes */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center justify-between">
          <span>Target Anatomical Traits</span>
          <span className="text-[10px] font-mono text-emerald-400">7 ATTRIBUTES</span>
        </div>

        <div className="space-y-1.5 text-xs">
          {featureLabels.map(({ key, label }) => (
            <div
              key={key}
              className="flex items-center justify-between bg-navy-950 px-3 py-1.5 rounded border border-slate-800"
            >
              <span className="text-slate-400 text-[11px]">{label}:</span>
              <span className="text-slate-100 font-semibold text-[11px]">
                {features[key] || 'Standard'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => navigate('/')}
        className="w-full py-2 rounded bg-navy-950 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
      >
        <span>Change Composite in Studio</span>
        <ExternalLink size={13} />
      </button>
    </div>
  );
}
