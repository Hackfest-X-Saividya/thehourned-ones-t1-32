import React from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  CheckCircle2,
  GitBranch,
  ArrowRightLeft,
  Download,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  AlertTriangle
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
      className={`w-72 bg-navy-900 rounded-xl shadow-2xl overflow-hidden backdrop-blur-md transition-all ${
        isFinalized
          ? 'border-2 border-emerald-400 ring-4 ring-emerald-500/30 shadow-2xl shadow-emerald-500/20'
          : sketch.isMock
            ? 'border border-amber-600/60 hover:border-amber-400/80'
            : 'border border-slate-700/80 hover:border-sky-500/60'
      }`}
    >
      {/* Target Handle from Extractor or Parent Sketch */}
      <Handle
        type="target"
        position={Position.Left}
        id={`sketch-in-${sketch.imageId}`}
        className="!w-3 !h-3 !bg-sky-400 !border-2 !border-navy-950"
      />

      {/* Node Header */}
      <div className={`px-3 py-2 border-b flex items-center justify-between ${isFinalized ? 'bg-emerald-950/80 border-emerald-700/80' : sketch.isMock ? 'bg-amber-950/40 border-amber-900/50' : 'bg-navy-950/90 border-slate-800'}`}>
        <div className="flex items-center gap-1.5 truncate pr-1">
          <span className="text-xs font-bold text-white font-mono truncate">
            {sketch.label || sketch.imageId}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-sky-950 text-sky-300 border border-sky-800 rounded shrink-0">
            v{sketch.iteration || 1}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {sketch.isMock ? (
            <span
              className="text-[9px] font-mono font-bold text-amber-300 flex items-center gap-1 bg-amber-950/90 border border-amber-500/70 px-1.5 py-0.5 rounded shadow"
              title={sketch.mockReason || 'Simulated SVG Preview (Worker API Fallback)'}
            >
              <AlertTriangle size={10} className="text-amber-400" /> MOCK DATA
            </span>
          ) : (
            <span
              className="text-[9px] font-mono font-bold text-emerald-300 flex items-center gap-1 bg-emerald-950/90 border border-emerald-500/70 px-1.5 py-0.5 rounded shadow"
              title="Cloudflare Worker AI Composite"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> WORKER AI
            </span>
          )}

          {isFinalized && (
            <span className="text-[10px] font-mono font-bold text-emerald-300 flex items-center gap-1 bg-emerald-900/90 border border-emerald-500 px-1.5 py-0.5 rounded shadow">
              <CheckCircle2 size={11} className="stroke-[2.5]" /> SELECTED
            </span>
          )}
        </div>
      </div>

      {/* Sketch Image Display */}
      <div className="relative group bg-navy-950">
        <img
          src={sketch.imageUrl}
          alt={`Forensic Sketch ${sketch.imageId}`}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <div className="absolute bottom-2 left-2 right-2 bg-navy-950/90 backdrop-blur-sm px-2 py-1 rounded border border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-300">
          <span>{sketch.parentId ? `Parent: ${sketch.parentId}` : 'Stage 1 Candidate'}</span>
          <span className={sketch.imageType === 'normal' ? 'text-cyan-300 font-medium' : 'text-sky-300 font-medium'}>
            {sketch.imageType === 'normal' ? 'Realistic Portrait' : 'Pencil Sketch'}
          </span>
        </div>

        {isFinalized && (
          <div className="absolute top-2 left-2 bg-emerald-950/90 backdrop-blur-sm border border-emerald-500/60 text-emerald-200 text-[9px] font-mono px-1.5 py-0.5 rounded font-bold shadow">
            ACTIVE TARGET
          </div>
        )}

        {sketch.isMock && (
          <div className="absolute top-2 right-2 bg-amber-950/90 backdrop-blur-sm border border-amber-500/70 text-amber-200 text-[9px] font-mono px-1.5 py-0.5 rounded font-bold shadow flex items-center gap-1">
            <AlertTriangle size={9} className="text-amber-400" /> FALLBACK
          </div>
        )}
      </div>

      {/* Node Info & Change summary */}
      <div className="p-3 space-y-2 text-xs">
        <div className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed" title={sketch.prompt}>
          {sketch.changeDescription || sketch.prompt}
        </div>

        {/* Feature summary pills */}
        <div className="flex flex-wrap gap-1 text-[10px] font-mono text-slate-400">
          <span className="bg-navy-950 px-1.5 py-0.5 rounded border border-slate-800">
            {sketch.features?.jawline || 'Jaw: Std'}
          </span>
          <span className="bg-navy-950 px-1.5 py-0.5 rounded border border-slate-800">
            {sketch.features?.eyes || 'Eyes: Std'}
          </span>
          {sketch.confidenceScore && (
            <span className="bg-navy-950 text-emerald-400 px-1.5 py-0.5 rounded border border-slate-800 font-bold">
              {sketch.confidenceScore}% conf
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          {/* Base Selection Button */}
          <button
            type="button"
            onClick={() => onFinalize && onFinalize(sketch)}
            className={`w-full py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              isFinalized
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-extrabold cursor-default'
                : 'bg-navy-800 hover:bg-slate-700 text-slate-100 border border-slate-700 hover:border-slate-500'
            }`}
          >
            <CheckCircle2 size={12} className={isFinalized ? 'stroke-[2.5]' : ''} />
            <span>{isFinalized ? 'Active Base' : 'Select as Base'}</span>
          </button>

          {/* Refine / Branch Button */}
          <button
            type="button"
            onClick={() => onRefine && onRefine(sketch)}
            className="w-full py-1.5 px-2 rounded-lg bg-navy-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-medium flex items-center justify-center gap-1 transition-all cursor-pointer"
          >
            <GitBranch size={12} className="text-sky-400" />
            <span>Refine</span>
          </button>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
          <button
            type="button"
            onClick={() => onCompare && onCompare(sketch)}
            className="text-slate-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
          >
            <ArrowRightLeft size={11} />
            <span>Compare v1</span>
          </button>

          <button
            type="button"
            onClick={() => onDownloadPng && onDownloadPng(sketch)}
            className="text-slate-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
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
        id={`sketch-out-${sketch.imageId}`}
        className="!w-3 !h-3 !bg-sky-400 !border-2 !border-navy-950"
      />
    </div>
  );
}
