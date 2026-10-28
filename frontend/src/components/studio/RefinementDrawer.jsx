import React, { useState, useEffect } from 'react';
import { GitBranch, Sparkles, X, SlidersHorizontal, RefreshCw, Mic, MicOff, Languages } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { startVoiceRecognition, isSpeechRecognitionSupported, SUPPORTED_LANGUAGES } from '../../utils/speech';
import { translateWithGemini } from '../../services/geminiService';

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

  // Multilingual STT & Gemini 3.5 Live Preview state
  const [refineLanguage, setRefineLanguage] = useState(language || 'en-IN');
  const [originalVoiceNote, setOriginalVoiceNote] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [geminiModel, setGeminiModel] = useState('gemini-3.5-live-preview');

  const [isRecording, setIsRecording] = useState(false);
  const [recognitionController, setRecognitionController] = useState(null);
  const sttSupported = isSpeechRecognitionSupported();

  // Synchronize language when prop changes
  useEffect(() => {
    if (language) {
      setRefineLanguage(language);
    }
  }, [language]);

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
      setOriginalVoiceNote(null);
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
      refineLanguage || 'en-IN',
      async (transcribed) => {
        setIsRecording(false);
        setOriginalVoiceNote(transcribed);

        setIsTranslating(true);
        try {
          const res = await translateWithGemini({
            text: transcribed,
            sourceLanguage: refineLanguage,
            context: 'refinement'
          });
          const updated = res.englishPrompt;
          setAdditionalNote((prev) => (prev ? `${prev}, ${updated}` : updated));
          if (res.modelUsed) setGeminiModel(res.modelUsed);
        } catch (err) {
          console.error('Gemini refinement translation failed:', err);
          setAdditionalNote((prev) => (prev ? `${prev} ${transcribed}` : transcribed));
        } finally {
          setIsTranslating(false);
        }
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

  const handleManualTranslate = async () => {
    if (!additionalNote.trim() || isTranslating) return;
    setIsTranslating(true);
    try {
      const res = await translateWithGemini({
        text: additionalNote,
        sourceLanguage: refineLanguage,
        context: 'refinement'
      });
      setOriginalVoiceNote(additionalNote);
      setAdditionalNote(res.englishPrompt);
      if (res.modelUsed) setGeminiModel(res.modelUsed);
    } catch (err) {
      console.warn('Refinement translation error:', err);
    } finally {
      setIsTranslating(false);
    }
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
        <div className="flex items-center gap-3 p-3 bg-navy-950 rounded-lg border border-slate-800">
          <img
            src={parentSketch.imageUrl}
            alt={parentSketch.imageId}
            className="w-16 h-16 rounded object-cover border border-slate-700 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="font-mono text-sky-400 font-bold flex items-center gap-1.5 flex-wrap">
              <span>Parent Node: {parentSketch.imageId}</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded">
                v{parentSketch.iteration || 1}
              </span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700 px-1.5 py-0.2 rounded">
                512×512 Mask Active
              </span>
            </div>
            <div className="text-[11px] text-slate-400 line-clamp-2 mt-1">
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

        {/* Natural Language Freeform Adjustment with Multilingual STT & Gemini 3.5 Live Preview */}
        <div className="space-y-1.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
              <span>Witness Refinement Feedback</span>
              <span className="text-[10px] text-slate-500 font-mono">(Type or speak)</span>
            </label>

            {/* Language Selector & Mic Controls */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <div className="flex items-center gap-1 bg-navy-950 border border-slate-700 rounded px-1.5 py-0.5">
                <Languages size={11} className="text-sky-400" />
                <select
                  value={refineLanguage}
                  onChange={(e) => setRefineLanguage(e.target.value)}
                  className="bg-transparent text-[10px] text-slate-200 focus:outline-none cursor-pointer"
                  title="Interview Language for Refinement Voice Input"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-navy-900 text-slate-100">
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              {additionalNote.trim() && (
                <button
                  type="button"
                  onClick={handleManualTranslate}
                  disabled={isTranslating}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-950/60 border border-cyan-700/60 px-1.5 py-0.5 rounded transition-all cursor-pointer disabled:opacity-50"
                  title="Translate feedback into English forensic prompt via Gemini 3.5 Live Preview"
                >
                  <Sparkles size={10} className={isTranslating ? 'animate-spin' : ''} />
                  <span>Translate</span>
                </button>
              )}

              {/* Mic Toggle Button */}
              <button
                type="button"
                onClick={handleToggleVoice}
                disabled={!sttSupported || isTranslating}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-medium transition-all ${
                  isRecording
                    ? 'bg-rose-950/90 border-rose-500 text-rose-300 animate-pulse shadow-sm shadow-rose-500/20'
                    : 'bg-navy-950 hover:bg-slate-800 border-slate-700 text-sky-400 hover:text-sky-300'
                } disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer`}
                title={sttSupported ? `Click to dictate in ${SUPPORTED_LANGUAGES.find(l => l.code === refineLanguage)?.name || 'selected language'}` : 'Voice input not supported in this browser'}
              >
                <Mic size={12} className={isRecording ? 'text-rose-400 animate-bounce' : 'text-sky-400'} />
                <span>{isRecording ? 'Listening...' : 'Voice Input (STT)'}</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <textarea
              rows={3}
              value={additionalNote}
              onChange={(e) => setAdditionalNote(e.target.value)}
              placeholder="e.g. Eyebrows slightly thicker, jaw angle slightly wider, tired look under eyes, scar darker..."
              className="w-full bg-navy-950 border border-slate-700 rounded p-2.5 pr-10 text-xs text-slate-100 resize-none focus:outline-none focus:border-sky-400 leading-relaxed font-sans"
            />
            {/* Embedded Mic Shortcut Button inside Textarea */}
            <button
              type="button"
              onClick={handleToggleVoice}
              disabled={!sttSupported || isTranslating}
              className={`absolute right-2.5 top-2.5 p-1.5 rounded transition-all cursor-pointer ${
                isRecording
                  ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                  : 'text-slate-400 hover:text-sky-400 hover:bg-slate-800'
              } disabled:opacity-30`}
              title={isRecording ? 'Click to stop listening' : 'Click to dictate feedback with microphone'}
            >
              <Mic size={14} />
            </button>
          </div>

          {/* Gemini 3.5 Live Preview Translation Shimmer */}
          {isTranslating && (
            <div className="flex items-center gap-1.5 p-1.5 bg-cyan-950/80 border border-cyan-500/50 rounded text-[10px] text-cyan-300 animate-pulse">
              <Sparkles size={11} className="text-cyan-400 shrink-0 animate-spin" />
              <span>Gemini 3.5 Live Preview: Translating refinement to English prompt...</span>
            </div>
          )}

          {/* Bilingual Spoken Transcript Card */}
          {originalVoiceNote && !isTranslating && (
            <div className="p-1.5 bg-navy-950/90 border border-slate-800 rounded text-[10px] space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1 font-semibold text-slate-300">
                  <Languages size={10} className="text-sky-400" />
                  Spoken ({SUPPORTED_LANGUAGES.find((l) => l.code === refineLanguage)?.name || refineLanguage}):
                </span>
                <span className="font-mono text-[9px] text-cyan-400 flex items-center gap-1 bg-cyan-950/70 border border-cyan-800/80 px-1 py-0.2 rounded">
                  <Sparkles size={8} /> Gemini 3.5 English Directives
                </span>
              </div>
              <p className="text-slate-300 italic line-clamp-2 bg-slate-900/60 p-1 rounded border border-slate-800/60">
                "{originalVoiceNote}"
              </p>
            </div>
          )}

          {isRecording && (
            <p className="text-[10px] text-rose-400 font-mono mt-1 flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              Microphone listening in {SUPPORTED_LANGUAGES.find((l) => l.code === refineLanguage)?.name || 'selected language'}... Speak adjustments aloud.
            </p>
          )}
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
