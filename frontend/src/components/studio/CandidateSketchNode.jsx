import React from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  CheckCircle2,
  GitBranch,
  ArrowRightLeft,
  Download,
  ShieldCheck,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export default function CandidateSketchNode({ data }) {
  const {
    sketch,
    isFinalized = false,
    onFinalize,
    onRefine,
    onCompare,
    onDownloadPng
  } = data;

  if (!sketch) return null;

  return (
    <div
      className={`w-72 bg-[#111B2B] rounded-xl shadow-2xl overflow-hidden backdrop-blur-md transition-all ${
        isFinalized
          ? 'border-2 border-[#2DD4BF] ring-2 ring-[#2DD4BF]/20 shadow-lg'
          : 'border border-[#29374B] hover:border-[#60A5FA]/60'
      }`}
    >
      {/* Target Handle from Extractor or Parent Sketch */}
      <Handle
        type="target"
        position={Position.Left}
        id="sketch-in"
        className="!w-3 !h-3 !bg-[#60A5FA] !border-2 !border-[#0B1120]"
      />

      {/* Node Header */}
      <div className="bg-[#0B1120]/80 px-3 py-2 border-b border-[#29374B] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-[#E5EDF7] font-mono">
            {sketch.imageId}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#172337] text-[#60A5FA] border border-[#29374B] rounded">
            v{sketch.iteration || 1}
          </span>
        </div>

        {isFinalized ? (

          <span className="text-[10px] font-mono font-bold text-[#2DD4BF] flex items-center gap-1 bg-teal-950/60 border border-teal-800/60 px-1.5 py-0.5 rounded">
            <CheckCircle2 size={11} /> FINALIZED

          </span>
        ) : (
          <span className="text-[10px] font-mono text-[#77879D]">
            Seed: {sketch.seed}
          </span>
        )}
      </div>

      {/* Sketch Image Display */}
      <div className="relative group bg-[#0B1120]">
        <img
          src={sketch.imageUrl}
          alt={`Forensic Sketch ${sketch.imageId}`}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />

        <div className="absolute bottom-2 left-2 right-2 bg-[#0B1120]/85 backdrop-blur-sm px-2 py-1 rounded border border-[#29374B] flex items-center justify-between text-[10px] font-mono text-[#A2B1C5]">
          <span>{sketch.parentId ? `Parent: ${sketch.parentId}` : 'Root Composite'}</span>
          <span className="text-[#60A5FA]">Charcoal Style</span>

        </div>
      </div>

      {/* Node Info & Change summary */}
      <div className="p-3 space-y-2 text-xs">
        <div className="text-[11px] text-[#A2B1C5] line-clamp-2 leading-relaxed" title={sketch.prompt}>
          {sketch.changeDescription || sketch.prompt}
        </div>

        {/* Feature summary pills */}
        <div className="flex flex-wrap gap-1 text-[10px] font-mono text-[#77879D]">
          <span className="bg-[#0B1120] px-1.5 py-0.5 rounded border border-[#29374B]">
            {sketch.features?.jawline || 'Jaw: Std'}
          </span>
          <span className="bg-[#0B1120] px-1.5 py-0.5 rounded border border-[#29374B]">
            {sketch.features?.eyes || 'Eyes: Std'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          {/* Base Selection Button */}
          <button
            type="button"
            onClick={() => onFinalize && onFinalize(sketch)}
            className={`w-full py-1.5 px-2 rounded text-[11px] font-semibold flex items-center justify-center gap-1 transition-all ${
              isFinalized

                ? 'bg-teal-950/60 border border-[#2DD4BF] text-[#2DD4BF] cursor-default'
                : 'bg-[#2DD4BF] hover:bg-[#14B8A6] text-[#0B1120]'

            }`}
          >
            <CheckCircle2 size={12} />
            <span>{isFinalized ? 'Active Base' : 'Select as Base'}</span>
          </button>

          {/* Refine / Branch Button */}
          <button
            type="button"
            onClick={() => onRefine && onRefine(sketch)}
            className="w-full py-1.5 px-2 rounded bg-[#172337] hover:bg-[#203049] border border-[#29374B] text-[#E5EDF7] text-[11px] font-medium flex items-center justify-center gap-1 transition-all"
          >
            <GitBranch size={12} className="text-[#60A5FA]" />
            <span>Refine</span>
          </button>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-[#29374B] text-[11px]">
          <button
            type="button"
            onClick={() => onCompare && onCompare(sketch)}
            className="text-[#77879D] hover:text-[#60A5FA] flex items-center gap-1 transition-colors"
          >
            <ArrowRightLeft size={11} />
            <span>Compare v1</span>
          </button>

          <button
            type="button"
            onClick={() => onDownloadPng && onDownloadPng(sketch)}
            className="text-[#77879D] hover:text-[#2DD4BF] flex items-center gap-1 transition-colors"
          >
            <Download size={11} />
            <span>PNG</span>
          </button>
        </div>
      </div>

      {/* Source Handle to Child Refinement Sketches */}
      <Handle
        type="source"
        position={Position.Right}
        id="sketch-out"
        className="!w-3 !h-3 !bg-[#60A5FA] !border-2 !border-[#0B1120]"
      />
    </div>
  );
}

