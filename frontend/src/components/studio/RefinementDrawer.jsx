import React, { useState } from 'react';
import { GitBranch, Sparkles, X, SlidersHorizontal, RefreshCw } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';

export default function RefinementDrawer({
  isOpen,
  onClose,
  parentSketch,
  onSubmitRefinement,
  isSubmitting = false
}) {
  if (!parentSketch) return null;

  const [jawline, setJawline] = useState(parentSketch.features?.jawline || 'Sharp Square');
  const [eyes, setEyes] = useState(parentSketch.features?.eyes || 'Deep-set Almond');
  const [nose, setNose] = useState(parentSketch.features?.nose || 'Straight Narrow Bridge');
  const [facialHair, setFacialHair] = useState(parentSketch.features?.facialHair || '3-Day Heavy Stubble');
  const [marks, setMarks] = useState(parentSketch.features?.marks || 'Scar on Left Eyebrow');
  const [additionalNote, setAdditionalNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const adjustments = {
      jawline,
      eyes,
      nose,
      facialHair,
      marks
    };
    if (onSubmitRefinement) {
      onSubmitRefinement(parentSketch, adjustments, additionalNote);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Branch & Refine Composite — v${(parentSketch.iteration || 1) + 1} from ${parentSketch.imageId}`}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Parent Preview Header */}
        <div className="flex items-center gap-3 p-3 bg-navy-950 rounded-lg border border-slate-800">
          <img
            src={parentSketch.imageUrl}
            alt={parentSketch.imageId}
            className="w-16 h-16 rounded object-cover border border-slate-700 shrink-0"
          />
          <div>
            <div className="font-mono text-sky-400 font-bold flex items-center gap-1.5">
              <span>Parent Node: {parentSketch.imageId}</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded">
                v{parentSketch.iteration || 1}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 line-clamp-2 mt-1">
              "{parentSketch.prompt}"
            </div>
          </div>
        </div>

        {/* Feature Specific Adjustment Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Jawline */}
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Jawline & Chin Geometry
            </label>
            <select
              value={jawline}
              onChange={(e) => setJawline(e.target.value)}
              className="w-full bg-navy-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100"
            >
              <option value="Sharp Square">Sharp Square</option>
              <option value="Heavy Chiseled">Heavy Chiseled</option>
              <option value="Soft Rounded">Soft Rounded</option>
              <option value="Pointed V-Shape">Pointed V-Shape</option>
            </select>
          </div>

          {/* Eye Morphology */}
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Eye Shape & Brow Angle
            </label>
            <select
              value={eyes}
              onChange={(e) => setEyes(e.target.value)}
              className="w-full bg-navy-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100"
            >
              <option value="Deep-set Almond">Deep-set Almond</option>
              <option value="Narrow Hooded">Narrow Hooded</option>
              <option value="Wide Round">Wide Round</option>
              <option value="Asymmetric Piercing">Asymmetric Piercing</option>
            </select>
          </div>

          {/* Nasal Bridge */}
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Nasal Bridge & Tip
            </label>
            <select
              value={nose}
              onChange={(e) => setNose(e.target.value)}
              className="w-full bg-navy-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100"
            >
              <option value="Straight Narrow Bridge">Straight Narrow Bridge</option>
              <option value="Broad Bridge">Broad Bridge</option>
              <option value="Bulbous Tip">Bulbous Tip</option>
              <option value="Aquiline / Hooked">Aquiline / Hooked</option>
            </select>
          </div>

          {/* Facial Hair */}
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Facial Hair / Stubble
            </label>
            <select
              value={facialHair}
              onChange={(e) => setFacialHair(e.target.value)}
              className="w-full bg-navy-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100"
            >
              <option value="3-Day Heavy Stubble">3-Day Heavy Stubble</option>
              <option value="Full Dense Beard">Full Dense Beard</option>
              <option value="Thick Horseshoe Mustache">Thick Horseshoe Mustache</option>
              <option value="Clean Shaven">Clean Shaven</option>
              <option value="Faded Goatee">Faded Goatee</option>
            </select>
          </div>
        </div>

        {/* Distinguishing Marks */}
        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1">
            Distinguishing Marks, Scars & Tattoos
          </label>
          <select
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
            className="w-full bg-navy-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100"
          >
            <option value="Scar on Left Eyebrow">Vertical Scar on Left Eyebrow</option>
            <option value="Mole on Right Cheek">Mole on Right Cheek</option>
            <option value="Burn Mark on Neck">Burn Mark on Neck</option>
            <option value="Laceration near Lip">Laceration near Lip</option>
            <option value="None">No Distinct Marks</option>
          </select>
        </div>

        {/* Natural Language Freeform Adjustment */}
        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1">
            Witness Refinement Feedback
          </label>
          <textarea
            rows={2}
            value={additionalNote}
            onChange={(e) => setAdditionalNote(e.target.value)}
            placeholder="e.g. Eyebrows slightly thicker, jaw angle slightly wider, tired look under eyes..."
            className="w-full bg-navy-950 border border-slate-700 rounded p-2 text-xs text-slate-100 resize-none"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            icon={Sparkles}
          >
            Generate Child Node v{(parentSketch.iteration || 1) + 1}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
