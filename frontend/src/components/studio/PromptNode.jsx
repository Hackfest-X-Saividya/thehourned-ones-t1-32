import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Handle, Position } from '@xyflow/react';
import {
  Mic,
  Volume2,
  Sparkles,
  Languages,
  Check,
  RefreshCw,
  AudioWaveform,
  Layers,
  Square,
  PenTool,
  Camera,
  ArrowRightLeft,
  ScanFace
} from 'lucide-react';
import {
  startVoiceRecognition,
  speakText,
  stopSpeaking,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  SUPPORTED_LANGUAGES
} from '../../utils/speech';
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
    if (onPromptChange) onPromptChange(val);
  };

  const handleLanguageChange = (e) => {
    const val = e.target.value;
    setLanguage(val);
    if (onLanguageChange) onLanguageChange(val);
  };

  const handleImageTypeChange = (selectedType) => {
    setImageType(selectedType);
    if (onImageTypeChange) onImageTypeChange(selectedType);
  };

  const handleNumCandidatesChange = (val) => {
    setNumCandidates(val);
    if (onNumCandidatesChange) onNumCandidatesChange(val);
  };

  const handleToggleVoice = () => {
    if (isRecording) {
import {
  Mic,
  Volume2,
  Sparkles,
  Languages,
  Check,
  RefreshCw,
  AudioWaveform,
  Layers,
  Square,
  PenTool,
  Camera,
  ArrowRightLeft,
  ScanFace
} from 'lucide-react';
import {
  startVoiceRecognition,
  speakText,
  stopSpeaking,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  SUPPORTED_LANGUAGES
} from '../../utils/speech';
import { translateWithGemini } from '../../services/geminiService';
      }
      setIsRecording(false);
    } else {
      setIsRecording(true);
      const controller = startVoiceRecognition(
        language,
        (transcript, isFinal) => {
          if (isFinal) {
            setPrompt((prev) => {
              const updated = prev ? `${prev} ${transcript}` : transcript;
              if (onPromptChange) onPromptChange(updated);
              return updated;
            });
            setIsRecording(false);
          }
        },
        (error) => {
          console.error('[PromptNode] STT Error:', error);
          setIsRecording(false);
        }
      );
      setRecognitionController(controller);
    }
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
    } else {
      if (!prompt.trim()) return;
      setIsSpeaking(true);
      speakText(
        prompt,
        language,
        () => setIsSpeaking(false),
        (err) => {
          console.error('[PromptNode] TTS Error:', err);
          setIsSpeaking(false);
        }
      );
    }
  };

  const handleTrigger = () => {
    if (onTriggerExtraction) {
      onTriggerExtraction({
        prompt,
        language,
        numCandidates,
        imageType
      });
    }
  };

  return (
    <div className="w-80 bg-[#111B2B] rounded-xl border border-[#29374B] shadow-2xl overflow-hidden backdrop-blur-md">
      {/* Node Header */}
      <div className="bg-[#0B1120]/80 px-3.5 py-2.5 border-b border-[#29374B] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#60A5FA] animate-pulse" />
          <h3 className="text-xs font-semibold tracking-wide text-[#60A5FA]">
            Node 1: Witness Statement
          </h3>
        </div>
        <span className="text-[10px] font-mono text-[#A2B1C5] bg-[#172337] border border-[#29374B] px-1.5 py-0.5 rounded">
          STAGE 1 COMPOSITE
        </span>
      </div>

      {/* Form Content - Marked nodrag nopan nowheel to prevent canvas event capture */}
      <div className="p-3.5 space-y-3 text-xs nodrag nopan nowheel">
        {/* Style Selector: Forensic Pencil vs Realistic Portrait */}
        <div className="space-y-1.5 nodrag">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-medium text-[#A2B1C5] flex items-center gap-1">
              <PenTool size={11} className="text-[#60A5FA]" />
              Synthesis Style Mode:
            </label>
            <span className="text-[10px] font-mono text-[#60A5FA]">
              {imageType === 'sketch' ? 'SDXL Charcoal' : 'SDXL Lightning'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 p-0.5 bg-[#0B1120] rounded-lg border border-[#29374B]">
            <button
              type="button"
              onClick={() => handleImageTypeChange('sketch')}
              className={`nodrag py-1.5 px-2 rounded-md text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                imageType === 'sketch'
                  ? 'bg-[#172337] text-[#60A5FA] border border-[#60A5FA]/40 shadow-sm'
                  : 'text-[#77879D] hover:text-[#E5EDF7]'
              }`}
            >
              <PenTool size={12} />
              <span>Forensic Sketch</span>
            </button>

            <button
              type="button"
              onClick={() => handleImageTypeChange('normal')}
              className={`nodrag py-1.5 px-2 rounded-md text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                imageType === 'normal'
                  ? 'bg-teal-950 text-teal-300 border border-teal-500/50 shadow-sm'
                  : 'text-[#77879D] hover:text-[#E5EDF7]'
              }`}
            >
              <Camera size={12} />
              <span>Realistic Photo</span>
            </button>
          </div>
        </div>

        {/* Language Selection */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-medium text-[#A2B1C5] flex items-center gap-1.5">
              <Languages size={13} className="text-[#60A5FA]" />
              Interview Language:
            </label>
            <span className="text-[9px] font-mono text-cyan-400 flex items-center gap-1">
              <Sparkles size={9} /> {geminiModel}
            </span>
          </div>
          <select
            value={language}
            onChange={handleLanguageChange}
            className="nodrag bg-[#172337] text-slate-200 border border-[#29374B] rounded px-2 py-0.5 text-xs focus:outline-none focus:border-[#60A5FA]"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
          </div>
          <select
            value={language}
            onChange={handleLanguageChange}
            className="nodrag bg-[#172337] text-slate-200 border border-[#29374B] rounded px-2 py-0.5 text-xs focus:outline-none focus:border-[#60A5FA]"
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
import {
  Mic,
  Volume2,
  Sparkles,
  Languages,
  Check,
  RefreshCw,
  AudioWaveform,
  Layers,
  Square,
  PenTool,
  Camera,
  ArrowRightLeft,
  ScanFace
} from 'lucide-react';
import {
  startVoiceRecognition,
  speakText,
  stopSpeaking,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  SUPPORTED_LANGUAGES
} from '../../utils/speech';
import { translateWithGemini } from '../../services/geminiService';
          </div>
          <textarea
            rows={3}
            value={prompt}
            onChange={handlePromptChange}
            placeholder="Describe adult facial features: face shape, hair, eyes, eyebrows, nose, mouth, facial hair, skin tone, marks..."
            className="nodrag nowheel w-full bg-[#0B1120] border border-[#29374B] rounded p-2 text-xs text-[#E5EDF7] placeholder:text-[#77879D] focus:outline-none focus:border-[#60A5FA] resize-none font-sans min-h-[72px]"
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
                ? 'bg-rose-950/80 border-[#F87171] text-[#F87171] animate-pulse'
                : 'bg-[#172337] hover:bg-[#203049] border-[#29374B] text-[#A2B1C5] hover:text-[#E5EDF7]'
            } disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer`}
            title={sttSupported ? `Speak in ${SUPPORTED_LANGUAGES.find(l => l.code === language)?.name || 'selected language'} (STT)` : 'Voice input not supported in this browser'}
          >
            <Mic size={13} className={isRecording ? 'text-[#F87171]' : 'text-[#A2B1C5]'} />
            <span>{isRecording ? 'Listening...' : 'Voice Input (STT)'}</span>
          </button>

          <button
            type="button"
            onClick={handleReadAloud}
            disabled={!ttsSupported || !prompt.trim()}
            className={`nodrag flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded border text-[11px] font-medium transition-all ${
              isSpeaking
                ? 'bg-blue-950/80 border-[#60A5FA] text-[#60A5FA]'
                : 'border-[#29374B] bg-[#172337] hover:bg-[#203049] text-[#A2B1C5] hover:text-[#E5EDF7]'
            } disabled:opacity-40 cursor-pointer`}
            title={isSpeaking ? 'Stop reading' : 'Read statement aloud'}
          >
            {isSpeaking ? (
              <>
                <Square size={11} className="text-[#60A5FA] fill-[#60A5FA]" />
                <span>Stop Audio</span>
              </>
            ) : (
              <>
                <Volume2 size={13} className="text-[#A2B1C5]" />
                <span>Read Aloud</span>
              </>
            )}
          </button>
        </div>

        {/* Candidate Variations Selector */}
        <div className="bg-[#0B1120] p-2 rounded-lg border border-[#29374B] space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#A2B1C5] flex items-center gap-1">
              <Layers size={11} className="text-[#60A5FA]" /> Candidate Variations:
            </span>
            <span className="font-mono text-[#60A5FA] font-bold">{numCandidates} Sketches</span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {[1, 2, 3, 4].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => handleNumCandidatesChange(count)}
                className={`py-1 text-center font-mono text-[11px] rounded border transition-all ${
                  numCandidates === count
                    ? 'bg-[#172337] border-[#60A5FA] text-[#60A5FA] font-bold shadow-sm'
                    : 'bg-[#111B2B] border-[#29374B] text-[#77879D] hover:text-[#E5EDF7]'
                }`}
              >
                {count}x
              </button>
            ))}
          </div>
          <p className="text-[10px] text-[#77879D] leading-tight">
            Synthesizes {numCandidates} diverse facial variations for witness selection.
          </p>
        </div>

        {/* Run Extraction Button */}
        <button
          type="button"
          onClick={handleTrigger}
          disabled={isProcessing || !prompt.trim()}
          className="nodrag w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-[#60A5FA] hover:bg-[#3B82F6] text-[#0B1120] font-bold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
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
        className="!w-3 !h-3 !bg-[#60A5FA] !border-2 !border-[#0B1120]"
      />
    </div>
  );
}
