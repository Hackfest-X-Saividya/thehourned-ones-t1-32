import React from 'react';
import { useSession } from '../../context/SessionContext';
import { Images, CheckCircle2, X, Download, ArrowRight, ExternalLink } from 'lucide-react';
import Badge from '../common/Badge';

export default function SessionGalleryDrawer({
  isOpen,
  onClose,
  onSelectSketch,
  onDownloadPng
}) {
  const { sessionImages, finalizedSketch, finalizeSketch } = useSession();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-96 bg-navy-900 border-l border-slate-800 shadow-2xl flex flex-col backdrop-blur-md animate-slideLeft">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-navy-950/80">
        <div className="flex items-center gap-2">
          <Images size={16} className="text-sky-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">
            Session Iteration Archive ({sessionImages.length})
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
          aria-label="Close session gallery"
        >
          <X size={16} />
        </button>
      </div>

      {/* Gallery List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {sessionImages.map((sketch) => {
          const isFinalized = finalizedSketch?.imageId === sketch.imageId;

          return (
            <div
              key={sketch.imageId}
              className={`p-3 rounded-xl bg-navy-950 border transition-all ${
                isFinalized
                  ? 'border-emerald-500/80 ring-1 ring-emerald-500/40 shadow-lg'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex gap-3">
                <img
                  src={sketch.imageUrl}
                  alt={sketch.imageId}
                  className="w-20 h-20 rounded-lg object-cover border border-slate-800 shrink-0"
                />

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-sky-400">
                        {sketch.imageId}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-900 text-slate-400 rounded border border-slate-800">
                        v{sketch.iteration}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                      {sketch.changeDescription || sketch.prompt}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-2 pt-1 border-t border-slate-850">
                    {isFinalized ? (
                      <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={11} /> TARGET ACTIVE
                      </span>
                    ) : (
                      <button
                        onClick={() => finalizeSketch(sketch)}
                        className="text-[10px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                      >
                        Set as Finalized
                      </button>
                    )}

                    <button
                      onClick={() => onDownloadPng && onDownloadPng(sketch)}
                      className="ml-auto text-slate-400 hover:text-slate-200 text-[10px] flex items-center gap-1"
                      title="Download PNG"
                    >
                      <Download size={11} />
                      <span>PNG</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
