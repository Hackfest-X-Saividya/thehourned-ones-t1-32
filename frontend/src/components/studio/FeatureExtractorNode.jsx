import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { ShieldCheck, Cpu, CheckCircle2, Sliders } from 'lucide-react';

export default function FeatureExtractorNode({ data }) {
  const {
    features = {
      faceShape: 'Angular Oval',
      jawline: 'Sharp Square',
      eyes: 'Deep-set Almond',
      nose: 'Straight Narrow Bridge',
      facialHair: '3-Day Heavy Stubble',
      marks: 'Scar on Left Eyebrow',
      ageRange: '28-35'
    },
    status = 'EXTRACTED',
    confidence = 94.8
  } = data;

  const featureItems = [
    { label: 'Jawline', value: features.jawline || 'Sharp Square' },
    { label: 'Eyes', value: features.eyes || 'Deep-set Almond' },
    { label: 'Nose', value: features.nose || 'Straight Narrow Bridge' },
    { label: 'Facial Hair', value: features.facialHair || '3-Day Heavy Stubble' },
    { label: 'Marks', value: features.marks || 'Scar on Left Eyebrow' },
    { label: 'Age Est.', value: features.ageRange || '28-35' }
  ];

  return (
    <div className="w-80 bg-navy-900 border-2 border-emerald-500/70 rounded-xl shadow-2xl overflow-hidden backdrop-blur-md">
      {/* Input Handle from PromptNode */}
      <Handle
        type="target"
        position={Position.Left}
        id="feature-in"
        className="!w-3 !h-3 !bg-emerald-400 !border-2 !border-navy-950"
      />

      {/* Node Header */}
      <div className="bg-navy-950/90 px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
            Node 2: Feature Extractor
          </h3>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-1.5 py-0.5 rounded flex items-center gap-1">
          <CheckCircle2 size={10} />
          {confidence}% CONF.
        </span>
      </div>

      <div className="p-3.5 space-y-2.5 text-xs">
        <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between pb-1 border-b border-slate-800">
          <span>PARSED ANATOMICAL ATTRIBUTES</span>
          <span className="text-emerald-400">GUARDRAIL VERIFIED</span>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 gap-1.5">
          {featureItems.map((item) => (
            <div
              key={item.label}
              className="bg-navy-950/90 border border-slate-800 rounded p-1.5 text-[11px]"
            >
              <div className="text-[10px] text-slate-400 font-mono">{item.label}</div>
              <div className="text-slate-100 font-semibold truncate" title={item.value}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-950/70 rounded p-2 border border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Cpu size={12} className="text-emerald-400" />
            <span>Cloudflare AI Worker Pipeline</span>
          </div>
          <span className="text-emerald-300">READY</span>
        </div>
      </div>

      {/* Output Handle to CandidateSketchNode(s) */}
      <Handle
        type="source"
        position={Position.Right}
        id="feature-out"
        className="!w-3 !h-3 !bg-emerald-400 !border-2 !border-navy-950"
      />
    </div>
  );
}
