import React, { useState, useEffect } from 'react';
import { GitBranch, Sparkles, X, SlidersHorizontal, RefreshCw, Mic, MicOff } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { startVoiceRecognition, isSpeechRecognitionSupported } from '../../utils/speech';

export default function RefinementDrawer({
  isOpen,
  onClose,
  parentSketch,
  onSubmitRefinement,
  isSubmitting = false,
  language = 'en-IN'
}) {
  if (!parentSketch) return null;

  const [jawline, setJawline] = useState(parentSketch.features?.jawline || 'Sharp Square');
  const [eyes, setEyes] = useState(parentSketch.features?.eyes || 'Deep-set Almond');
  const [nose, setNose] = useState(parentSketch.features?.nose || 'Straight Narrow Bridge');
  const [facialHair, setFacialHair] = useState(parentSketch.features?.facialHair || '3-Day Heavy Stubble');
  const [marks, setMarks] = useState(parentSketch.features?.marks || 'Scar on Left Eyebrow');
  const [additionalNote, setAdditionalNote] = useState('');
  const [targetedRegions, setTargetedRegions] = useState(['jawline', 'eyes', 'nose']);

  const [isRecording, setIsRecording] = useState(false);
  const [recognitionController, setRecognitionController] = useState(null);
  const sttSupported = isSpeechRecognitionSupported();

  // Reset or abort recognition when modal closes or parentSketch changes
  useEffect(() => {
    if (!isOpen && recognitionController) {
      recognitionController.abort();
      setIsRecording(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (parentSketch) {
      setJawline(parentSketch.features?.jawline || 'Sharp Square');
      setEyes(parentSketch.features?.eyes || 'Deep-set Almond');
      setNose(parentSketch.features?.nose || 'Straight Narrow Bridge');
      setFacialHair(parentSketch.features?.facialHair || '3-Day Heavy Stubble');
      setMarks(parentSketch.features?.marks || 'Scar on Left Eyebrow');
      setAdditionalNote('');
      setTargetedRegions(['jawline', 'eyes']);
      setIsRecording(false);
    }
  }, [parentSketch]);

  const toggleRegion = (region) => {
    setTargetedRegions((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]
    );
  };

  const handleToggleVoice = () => {
    if (isRecording) {
      if (recognitionController) recognitionController.abort();
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    const ctrl = startVoiceRecognition(
      language || 'en-IN',
      (transcribed) => {
        setAdditionalNote((prev) => (prev ? `${prev} ${transcribed}` : transcribed));
        setIsRecording(false);
      },
      (err) => {
        console.warn('Voice recognition note:', err);
        setIsRecording(false);
      },
      () => {
        setIsRecording(false);
      }
    );
    setRecognitionController(ctrl);
  };

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
      onSubmitRefinement(parentSketch, adjustments, additionalNote, targetedRegions);
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
        <div className="flex items-center gap-3 p-3 bg-[#0B1120] rounded-lg border border-[#29374B]">
          <img
            src={parentSketch.imageUrl}
            alt={parentSketch.imageId}
            className="w-16 h-16 rounded object-cover border border-[#29374B] shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="font-mono text-[#60A5FA] font-semibold flex items-center gap-1.5 flex-wrap">
              <span>Parent Node: {parentSketch.imageId}</span>
              <span className="text-[10px] bg-[#172337] text-[#A2B1C5] border border-[#29374B] px-1.5 py-0.2 rounded">
                v{parentSketch.iteration || 1}
              </span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700 px-1.5 py-0.2 rounded">
                512×512 Mask Active
              </span>
            </div>
            <div className="text-[11px] text-[#A2B1C5] line-clamp-2 mt-1">
              "{parentSketch.prompt}"
            </div>
          </div>
        </div>

        {/* Anatomical Landmark Regions Inpainting Targeting */}
        <div className="bg-navy-950/70 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-slate-300">
              Targeted Inpainting Mask Regions:
            </label>
            <span className="text-[9px] font-mono text-emerald-400">
              Accurate Image-Sized Raster Mask
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'jawline', label: 'Jawline' },
              { id: 'eyes', label: 'Eyes' },
              { id: 'eyebrows', label: 'Eyebrows' },
              { id: 'nose', label: 'Nose' },
              { id: 'mouth', label: 'Mouth / Lips' },
              { id: 'facialHair', label: 'Facial Hair' },
              { id: 'marks', label: 'Marks & Scars' }
            ].map((reg) => {
              const isSelected = targetedRegions.includes(reg.id);
              return (
                <button
                  key={reg.id}
                  type="button"
                  onClick={() => toggleRegion(reg.id)}
                  className={`px-2 py-1 rounded text-[10px] font-mono border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-500/20 border-sky-400 text-sky-200 font-bold'
                      : 'bg-navy-950 border-slate-850 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isSelected ? `✓ ${reg.label}` : reg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Feature Specific Adjustment Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Jawline */}
          <div>
            <label className="block text-[11px] font-medium text-[#A2B1C5] mb-1">
              Jawline & Chin Geometry
            </label>
            <select
              value={jawline}
              onChange={(e) => setJawline(e.target.value)}
              className="w-full bg-[#0B1120] border border-[#29374B] rounded px-2.5 py-1.5 text-xs text-[#E5EDF7] focus:outline-none focus:border-[#60A5FA]"
            >
              <option value="Sharp Square">Sharp Square</option>
              <option value="Heavy Chiseled">Heavy Chiseled</option>
              <option value="Soft Rounded">Soft Rounded</option>
              <option value="Pointed V-Shape">Pointed V-Shape</option>
            </select>
          </div>

          {/* Eye Morphology */}
          <div>
            <label className="block text-[11px] font-medium text-[#A2B1C5] mb-1">
              Eye Shape & Brow Angle
            </label>
            <select
              value={eyes}
              onChange={(e) => setEyes(e.target.value)}
              className="w-full bg-[#0B1120] border border-[#29374B] rounded px-2.5 py-1.5 text-xs text-[#E5EDF7] focus:outline-none focus:border-[#60A5FA]"
            >
              <option value="Deep-set Almond">Deep-set Almond</option>
              <option value="Narrow Hooded">Narrow Hooded</option>
              <option value="Wide Round">Wide Round</option>
              <option value="Asymmetric Piercing">Asymmetric Piercing</option>
            </select>
          </div>

          {/* Nasal Bridge */}
          <div>
            <label className="block text-[11px] font-medium text-[#A2B1C5] mb-1">
              Nasal Bridge & Tip
            </label>
            <select
              value={nose}
              onChange={(e) => setNose(e.target.value)}
              className="w-full bg-[#0B1120] border border-[#29374B] rounded px-2.5 py-1.5 text-xs text-[#E5EDF7] focus:outline-none focus:border-[#60A5FA]"
            >
              <option value="Straight Narrow Bridge">Straight Narrow Bridge</option>
              <option value="Broad Bridge">Broad Bridge</option>
              <option value="Bulbous Tip">Bulbous Tip</option>
              <option value="Aquiline / Hooked">Aquiline / Hooked</option>
            </select>
          </div>

          {/* Facial Hair */}
          <div>
            <label className="block text-[11px] font-medium text-[#A2B1C5] mb-1">
              Facial Hair / Stubble
            </label>
            <select
              value={facialHair}
              onChange={(e) => setFacialHair(e.target.value)}
              className="w-full bg-[#0B1120] border border-[#29374B] rounded px-2.5 py-1.5 text-xs text-[#E5EDF7] focus:outline-none focus:border-[#60A5FA]"
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
          <label className="block text-[11px] font-medium text-[#A2B1C5] mb-1">
            Distinguishing Marks, Scars & Tattoos
          </label>
          <select
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
            className="w-full bg-[#0B1120] border border-[#29374B] rounded px-2.5 py-1.5 text-xs text-[#E5EDF7] focus:outline-none focus:border-[#60A5FA]"
          >
            <option value="Scar on Left Eyebrow">Vertical Scar on Left Eyebrow</option>
            <option value="Mole on Right Cheek">Mole on Right Cheek</option>
            <option value="Burn Mark on Neck">Burn Mark on Neck</option>
            <option value="Laceration near Lip">Laceration near Lip</option>
            <option value="None">No Distinct Marks</option>
          </select>
        </div>

        {/* Natural Language Freeform Adjustment with Verbal Voice Mic Option */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-medium text-[#A2B1C5] flex items-center gap-1.5">
              <span>Witness Refinement Feedback</span>
              <span className="text-[10px] text-[#77879D] font-mono">(Type or speak)</span>
            </label>

            {/* Mic Toggle Button */}
            <button
              type="button"
              onClick={handleToggleVoice}
              disabled={!sttSupported}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-medium transition-all ${
                isRecording
                  ? 'bg-rose-950/90 border-[#F87171] text-[#F87171] animate-pulse shadow-sm shadow-rose-500/20'
                  : 'bg-[#172337] hover:bg-[#203049] border-[#29374B] text-[#60A5FA] hover:text-[#93C5FD]'
              } disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer`}
              title={sttSupported ? 'Click to verbally dictate witness feedback' : 'Voice input not supported in this browser'}
            >
              <Mic size={12} className={isRecording ? 'text-[#F87171] animate-bounce' : 'text-[#60A5FA]'} />
              <span>{isRecording ? 'Listening... (Speak now)' : 'Voice Input (STT)'}</span>
            </button>
          </div>

          <div className="relative">
            <textarea
              rows={3}
              value={additionalNote}
              onChange={(e) => setAdditionalNote(e.target.value)}
              placeholder="e.g. Eyebrows slightly thicker, jaw angle slightly wider, tired look under eyes, scar darker..."
              className="w-full bg-[#0B1120] border border-[#29374B] rounded p-2.5 pr-10 text-xs text-[#E5EDF7] placeholder:text-[#77879D] resize-none focus:outline-none focus:border-[#60A5FA] leading-relaxed font-sans"
            />
            {/* Embedded Mic Shortcut Button inside Textarea */}
            <button
              type="button"
              onClick={handleToggleVoice}
              disabled={!sttSupported}
              className={`absolute right-2.5 top-2.5 p-1.5 rounded transition-all cursor-pointer ${
                isRecording
                  ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                  : 'text-[#77879D] hover:text-[#60A5FA] hover:bg-[#172337]'
              } disabled:opacity-30`}
              title={isRecording ? 'Click to stop listening' : 'Click to dictate feedback with microphone'}
            >
              <Mic size={14} />
            </button>
          </div>

          {isRecording && (
            <p className="text-[10px] text-[#F87171] font-mono mt-1 flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F87171]" />
              Microphone listening for witness statement... Speak adjustments aloud.
            </p>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-[#29374B]">
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

