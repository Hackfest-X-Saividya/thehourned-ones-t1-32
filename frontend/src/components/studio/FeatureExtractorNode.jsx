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
    <div className="w-80 bg-[#111B2B] border border-[#29374B] hover:border-[#2DD4BF]/60 rounded-xl shadow-2xl overflow-hidden backdrop-blur-md transition-colors">
      {/* Input Handle from PromptNode */}
      <Handle
        type="target"
        position={Position.Left}
        id="feature-in"
        className="!w-3 !h-3 !bg-[#2DD4BF] !border-2 !border-[#0B1120]"
      />

      {/* Node Header */}
      <div className="bg-[#0B1120]/80 px-3.5 py-2.5 border-b border-[#29374B] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-[#2DD4BF]" />
          <h3 className="text-xs font-semibold tracking-wide text-[#2DD4BF]">
            Node 2: Feature Extractor
          </h3>
        </div>
        <span className="text-[10px] font-mono text-[#2DD4BF] bg-teal-950/60 border border-teal-800/60 px-1.5 py-0.5 rounded flex items-center gap-1">
          <CheckCircle2 size={10} />
          {confidence}% CONF.
        </span>
      </div>

      <div className="p-3.5 space-y-2.5 text-xs">
        <div className="text-[10px] font-mono text-[#77879D] flex items-center justify-between pb-1 border-b border-[#29374B]">
          <span>PARSED ANATOMICAL ATTRIBUTES</span>
          <span className="text-[#2DD4BF]">GUARDRAIL VERIFIED</span>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 gap-1.5">
          {featureItems.map((item) => (
            <div
              key={item.label}
              className="bg-[#0B1120] border border-[#29374B] rounded p-2 text-[11px]"
            >
              <div className="text-[10px] text-[#77879D] font-mono">{item.label}</div>
              <div className="text-[#E5EDF7] font-semibold truncate" title={item.value}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#172337] rounded p-2 border border-[#29374B] text-[10px] font-mono text-[#A2B1C5] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Cpu size={12} className="text-[#2DD4BF]" />
            <span>Cloudflare AI Worker Pipeline</span>
          </div>
          <span className="text-[#2DD4BF]">READY</span>
        </div>
      </div>

      {/* Output Handle to CandidateSketchNode(s) */}
      <Handle
        type="source"
        position={Position.Right}
        id="feature-out"
        className="!w-3 !h-3 !bg-[#2DD4BF] !border-2 !border-[#0B1120]"
      />
    </div>
  );
}

