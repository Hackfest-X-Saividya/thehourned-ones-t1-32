import React from 'react';
import { useSession } from '../../context/SessionContext';
import { Images, CheckCircle2, X, Download, ArrowRight, ExternalLink, Eye } from 'lucide-react';
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
    <div className="fixed inset-y-0 right-0 z-50 w-96 bg-[#111B2B] border-l border-[#29374B] shadow-2xl flex flex-col backdrop-blur-md animate-slideLeft">
      {/* Header */}
      <div className="p-4 border-b border-[#29374B] flex items-center justify-between bg-[#0B1120]/80">
        <div className="flex items-center gap-2">
          <Images size={16} className="text-[#60A5FA]" />
          <h2 className="text-xs font-semibold tracking-wide text-[#E5EDF7]">
            Session Iteration Archive ({sessionImages.length})
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-[#A2B1C5] hover:text-white rounded hover:bg-[#172337]"
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
              className={`p-3 rounded-xl bg-[#0B1120] border transition-all ${
                isFinalized
                  ? 'border-[#2DD4BF] ring-1 ring-[#2DD4BF]/40 shadow-lg'
                  : 'border-[#29374B] hover:border-[#60A5FA]/60'
              }`}
            >
              <div className="flex gap-3">
                <img
                  src={sketch.imageUrl}
                  alt={sketch.imageId}
                  className="w-20 h-20 rounded-lg object-cover border border-[#29374B] shrink-0"
                />

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-[#60A5FA]">
                        {sketch.imageId}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#172337] text-[#A2B1C5] rounded border border-[#29374B]">
                        v{sketch.iteration}
                      </span>
                    </div>

                    <div className="text-[10px] text-[#A2B1C5] line-clamp-2 mt-1 leading-snug">
                      {sketch.changeDescription || sketch.prompt}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 mt-2 pt-1 border-t border-[#29374B]/70">
                    <button
                      onClick={() => {
                        if (onSelectSketch) onSelectSketch(sketch);
                      }}
                      className="text-[10px] font-medium text-[#60A5FA] hover:text-white flex items-center gap-1 bg-[#172337] hover:bg-[#203049] px-2 py-0.5 rounded border border-[#29374B]"
                      title="Focus on canvas"
                    >
                      <Eye size={11} className="text-[#60A5FA]" />
                      <span>Canvas</span>
                    </button>

                    {isFinalized ? (
                      <span className="text-[10px] font-mono font-bold text-[#2DD4BF] flex items-center gap-1">
                        <CheckCircle2 size={11} /> TARGET ACTIVE
                      </span>
                    ) : (
                      <button
                        onClick={() => finalizeSketch(sketch)}
                        className="text-[10px] font-bold text-[#2DD4BF] hover:text-[#14B8A6] flex items-center gap-1"
                      >
                        Set as Finalized
                      </button>
                    )}

                    <button
                      onClick={() => onDownloadPng && onDownloadPng(sketch)}
                      className="ml-auto text-[#77879D] hover:text-[#E5EDF7] text-[10px] flex items-center gap-1"
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

