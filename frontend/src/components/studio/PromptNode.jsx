import React, { useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Mic, Volume2, Sparkles, Languages, Check, RefreshCw, AudioWaveform, Layers, Square, PenTool, Camera, ArrowRightLeft } from 'lucide-react';
import { startVoiceRecognition, speakText, stopSpeaking, isSpeechRecognitionSupported, isSpeechSynthesisSupported, SUPPORTED_LANGUAGES } from '../../utils/speech';
import { translateWithGemini } from '../../services/geminiService';

export default function PromptNode({ data }) {
  const {
    prompt: initialPrompt = '',
    onPromptChange,
    language: initialLanguage = 'en-IN',
    onLanguageChange,
    numCandidates: initialNumCandidates = 4,
    onNumCandidatesChange,
    imageType: initialImageType = 'sketch',
    onImageTypeChange,
    onTriggerExtraction,
    isProcessing = false
  } = data || {};

  // Local state for immediate, responsive user typing and interaction
  const [prompt, setPrompt] = useState(initialPrompt);
  const [language, setLanguage] = useState(initialLanguage);
  const [numCandidates, setNumCandidates] = useState(initialNumCandidates);
  const [imageType, setImageType] = useState(initialImageType);

  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognitionController, setRecognitionController] = useState(null);

  // Gemini 3.5 Live Preview Multilingual Translation State
  const [originalTranscript, setOriginalTranscript] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [geminiModel, setGeminiModel] = useState('gemini-3.5-live-preview');

  const sttSupported = isSpeechRecognitionSupported();
  const ttsSupported = isSpeechSynthesisSupported();

  // Keep local state synchronized if parent node data updates externally
  useEffect(() => {
    if (data?.prompt !== undefined && data.prompt !== prompt) {
      setPrompt(data.prompt);
    }
  }, [data?.prompt]);

  useEffect(() => {
    if (data?.language !== undefined && data.language !== language) {
      setLanguage(data.language);
    }
  }, [data?.language]);

  useEffect(() => {
    if (data?.numCandidates !== undefined && data.numCandidates !== numCandidates) {
      setNumCandidates(data.numCandidates);
    }
  }, [data?.numCandidates]);

  useEffect(() => {
    if (data?.imageType !== undefined && data.imageType !== imageType) {
      setImageType(data.imageType);
    }
  }, [data?.imageType]);

  const handlePromptChange = (e) => {
    const val = e.target.value;
    setPrompt(val);
    if (onPromptChange) {
      onPromptChange(val);
    }
  };

  const handleLanguageChange = (e) => {
    const val = e.target.value;
    setLanguage(val);
    if (onLanguageChange) {
      onLanguageChange(val);
    }
  };

  const handleNumCandidatesChange = (count) => {
    setNumCandidates(count);
    if (onNumCandidatesChange) {
      onNumCandidatesChange(count);
    }
  };

  const handleImageTypeChange = (type) => {
    setImageType(type);
    if (onImageTypeChange) {
      onImageTypeChange(type);
    }
  };

  const handleToggleVoice = () => {
    if (isRecording) {
      if (recognitionController) recognitionController.abort();
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    const ctrl = startVoiceRecognition(
      language,
      async (transcribed) => {
        setIsRecording(false);
        setOriginalTranscript(transcribed);

        setIsTranslating(true);
        try {
          const res = await translateWithGemini({
            text: transcribed,
            sourceLanguage: language,
            context: 'initial_statement'
          });
          const updated = res.englishPrompt;
          setPrompt(updated);
          if (res.modelUsed) setGeminiModel(res.modelUsed);
          if (onPromptChange) onPromptChange(updated);
        } catch (err) {
          console.error('Gemini translation error:', err);
          const fallback = prompt ? `${prompt} ${transcribed}` : transcribed;
          setPrompt(fallback);
          if (onPromptChange) onPromptChange(fallback);
        } finally {
          setIsTranslating(false);
        }
      },
      (err) => {
        console.warn('Voice recognition notice:', err);
        setIsRecording(false);
      },
      () => {
        setIsRecording(false);
      }
    );
    setRecognitionController(ctrl);
  };

  const handleManualTranslate = async () => {
    if (!prompt.trim() || isTranslating) return;
    setIsTranslating(true);
    try {
      const res = await translateWithGemini({
        text: prompt,
        sourceLanguage: language,
        context: 'initial_statement'
      });
      setOriginalTranscript(prompt);
      setPrompt(res.englishPrompt);
      if (res.modelUsed) setGeminiModel(res.modelUsed);
      if (onPromptChange) onPromptChange(res.englishPrompt);
    } catch (err) {
      console.warn('Manual translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleReadAloud = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    if (!prompt.trim()) return;

    setIsSpeaking(true);
    speakText(prompt, language, () => {
      setIsSpeaking(false);
    });
  };

  const handleTrigger = () => {
    if (isProcessing || !prompt.trim()) return;
    if (onTriggerExtraction) {
      onTriggerExtraction({ prompt, language, numCandidates, imageType });
    }
  };

  return (
    <div className="w-80 bg-navy-900 border-2 border-sky-500/70 rounded-xl shadow-2xl overflow-hidden backdrop-blur-md">
      {/* Node Header - Drag Handle for the Node */}
      <div className="bg-navy-950/90 px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between cursor-grab active:cursor-grabbing select-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-sky-300">
            Node 1: Witness Statement
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
          STAGE 1 COMPOSITE
        </span>
      </div>

      {/* Form Content - Marked nodrag nopan nowheel to prevent canvas event capture */}
      <div className="p-3.5 space-y-3 text-xs nodrag nopan nowheel">
        {/* Style Selector: Forensic Pencil vs Realistic Portrait */}
        <div className="space-y-1.5 nodrag">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
              <PenTool size={12} className="text-sky-400" />
              Composite Render Style:
            </label>
            <span className="text-[9px] font-mono text-slate-400 uppercase">
              {imageType === 'sketch' ? 'Pencil' : 'Photo'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => handleImageTypeChange('sketch')}
              className={`nodrag flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                imageType === 'sketch'
                  ? 'bg-sky-500/20 border-sky-400 text-sky-200 shadow-sm shadow-sky-500/20 ring-1 ring-sky-400/30'
                  : 'bg-navy-950 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
              }`}
            >
              <PenTool size={12} />
              <span>Forensic Pencil</span>
            </button>
            <button
              type="button"
              onClick={() => handleImageTypeChange('normal')}
              className={`nodrag flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                imageType === 'normal'
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-sm shadow-cyan-500/20 ring-1 ring-cyan-400/30'
                  : 'bg-navy-950 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
              }`}
            >
              <Camera size={12} />
              <span>Realistic Portrait</span>
            </button>
          </div>
        </div>

        {/* Language Selection */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <Languages size={13} className="text-sky-400" />
              Interview Language:
            </label>
            <span className="text-[9px] font-mono text-cyan-400 flex items-center gap-1">
              <Sparkles size={9} /> {geminiModel}
            </span>
          </div>
          <select
            value={language}
            onChange={handleLanguageChange}
            className="nodrag w-full bg-navy-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-400 cursor-pointer"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Prompt Input Area */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-medium text-slate-300">
              Witness Descriptive Recall:
            </label>
            <div className="flex items-center gap-2">
              {prompt.trim() && (
                <button
                  type="button"
                  onClick={handleManualTranslate}
                  disabled={isTranslating}
                  className="nodrag text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-950/60 border border-cyan-700/60 px-1.5 py-0.5 rounded transition-all cursor-pointer disabled:opacity-50"
                  title="Translate and format into English forensic prompt using Gemini 3.5 Live Preview"
                >
                  <Sparkles size={10} className={isTranslating ? 'animate-spin' : ''} />
                  <span>Translate via Gemini</span>
                </button>
              )}
              <span className="text-[10px] font-mono text-slate-500">
                {prompt.length}/1000
              </span>
            </div>
          </div>
          <textarea
            rows={3}
            value={prompt}
            onChange={handlePromptChange}
            placeholder="Describe adult facial features: face shape, hair, eyes, eyebrows, nose, mouth, facial hair, skin tone, marks..."
            className="nodrag nowheel w-full bg-navy-950 border border-slate-700 rounded p-2 text-xs text-slate-100 focus:outline-none focus:border-sky-400 resize-none font-sans min-h-[72px]"
          />
        </div>

        {/* Gemini 3.5 Live Preview Translation Shimmer */}
        {isTranslating && (
          <div className="flex items-center gap-2 p-2 bg-cyan-950/80 border border-cyan-500/50 rounded-lg text-[11px] text-cyan-300 animate-pulse nodrag">
            <Sparkles size={13} className="text-cyan-400 shrink-0 animate-spin" />
            <span className="font-medium">
              Gemini 3.5 Live Preview: Converting {SUPPORTED_LANGUAGES.find((l) => l.code === language)?.name || 'speech'} to English forensic prompt...
            </span>
          </div>
        )}

        {/* Bilingual Spoken Transcript Card */}
        {originalTranscript && !isTranslating && (
          <div className="p-2 bg-navy-950/90 border border-slate-800 rounded-lg text-[11px] space-y-1 nodrag">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-300">
                <Languages size={11} className="text-sky-400" />
                Spoken ({SUPPORTED_LANGUAGES.find((l) => l.code === language)?.name || language}):
              </span>
              <span className="font-mono text-[9px] text-cyan-400 flex items-center gap-1 bg-cyan-950/70 border border-cyan-800/80 px-1.5 py-0.2 rounded">
                <Sparkles size={9} /> Converted to English via Gemini 3.5
              </span>
            </div>
            <p className="text-slate-300 italic text-[11px] line-clamp-2 bg-slate-900/60 p-1.5 rounded border border-slate-800/60">
              "{originalTranscript}"
            </p>
          </div>
        )}

        {/* Voice & Speech Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleVoice}
            disabled={!sttSupported || isTranslating}
            className={`nodrag flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded border text-[11px] font-medium transition-all ${
              isRecording
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-navy-950 hover:bg-slate-800 border-slate-700 text-slate-300'
            } disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer`}
            title={sttSupported ? `Speak in ${SUPPORTED_LANGUAGES.find(l => l.code === language)?.name || 'selected language'} (STT)` : 'Voice input not supported in this browser'}
          >
            <Mic size={13} className={isRecording ? 'text-rose-400' : 'text-slate-400'} />
            <span>{isRecording ? 'Listening...' : 'Voice Input (STT)'}</span>
          </button>

          <button
            type="button"
            onClick={handleReadAloud}
            disabled={!ttsSupported || !prompt.trim()}
            className={`nodrag flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded border text-[11px] font-medium transition-all ${
              isSpeaking
                ? 'bg-sky-950 border-sky-400 text-sky-200'
                : 'border-slate-700 bg-navy-950 hover:bg-slate-800 text-slate-300'
            } disabled:opacity-40 cursor-pointer`}
            title={isSpeaking ? 'Stop reading' : 'Read statement aloud'}
          >
            {isSpeaking ? (
              <>
                <Square size={11} className="text-sky-400 fill-sky-400" />
                <span>Stop Audio</span>
              </>
            ) : (
              <>
                <Volume2 size={13} className="text-sky-400" />
                <span>Read Aloud</span>
              </>
            )}
          </button>
        </div>

        {/* Stage 1 Candidate Variations Selector (Default 4x) */}
        <div className="bg-navy-950/80 p-2.5 rounded-lg border border-slate-800 space-y-1.5 nodrag">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
              <Layers size={13} className="text-sky-400" />
              Candidate Variations:
            </label>
            <span className="text-[10px] text-sky-400 font-mono font-bold bg-sky-950/90 px-1.5 py-0.5 rounded border border-sky-800/80">
              {numCandidates} Variations
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[1, 2, 3, 4].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => handleNumCandidatesChange(count)}
                className={`nodrag py-1 text-xs font-mono font-bold rounded border transition-all cursor-pointer ${
                  numCandidates === count
                    ? 'bg-sky-500 text-navy-950 border-sky-400 shadow-md shadow-sky-500/20'
                    : 'bg-navy-950 text-slate-300 border-slate-700 hover:border-slate-500 hover:text-white'
                }`}
              >
                {count}x
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Synthesizes {numCandidates} diverse facial variations for witness selection.
          </p>
        </div>

        {/* Run Extraction Button */}
        <button
          type="button"
          onClick={handleTrigger}
          disabled={isProcessing || !prompt.trim()}
          className="nodrag w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-navy-950 font-bold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <RefreshCw size={13} className="animate-spin" />
              <span>Generating {numCandidates} Candidates...</span>
            </>
          ) : (
            <>
              <Sparkles size={13} />
              <span>Synthesize {numCandidates} Candidates ({imageType === 'sketch' ? 'Sketch' : 'Photo'})</span>
            </>
          )}
        </button>
      </div>

      {/* Output Handle to Node 2 */}
      <Handle
        type="source"
        position={Position.Right}
        id="prompt-out"
        className="!w-3 !h-3 !bg-sky-400 !border-2 !border-navy-950"
      />
    </div>
  );
}
