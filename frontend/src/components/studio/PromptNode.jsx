import React, { useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Mic, Volume2, Sparkles, Languages, Check, RefreshCw, AudioWaveform, Layers, Square } from 'lucide-react';
import { startVoiceRecognition, speakText, stopSpeaking, isSpeechRecognitionSupported, isSpeechSynthesisSupported } from '../../utils/speech';

export default function PromptNode({ data }) {
  const {
    prompt: initialPrompt = '',
    onPromptChange,
    language: initialLanguage = 'en-IN',
    onLanguageChange,
    numCandidates: initialNumCandidates = 3,
    onNumCandidatesChange,
    onTriggerExtraction,
    isProcessing = false
  } = data || {};

  // Local state for immediate, responsive user typing and interaction
  const [prompt, setPrompt] = useState(initialPrompt);
  const [language, setLanguage] = useState(initialLanguage);
  const [numCandidates, setNumCandidates] = useState(initialNumCandidates);

  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognitionController, setRecognitionController] = useState(null);

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

  const handleToggleVoice = () => {
    if (isRecording) {
      if (recognitionController) recognitionController.abort();
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    const ctrl = startVoiceRecognition(
      language,
      (transcribed) => {
        const updated = prompt ? `${prompt} ${transcribed}` : transcribed;
        setPrompt(updated);
        if (onPromptChange) onPromptChange(updated);
        setIsRecording(false);
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
      onTriggerExtraction({ prompt, language, numCandidates });
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
          MULTILINGUAL
        </span>
      </div>

      {/* Form Content - Marked nodrag nopan nowheel to prevent canvas event capture */}
      <div className="p-3.5 space-y-3 text-xs nodrag nopan nowheel">
        {/* Language Selection */}
        <div>
          <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1">
            <Languages size={13} className="text-sky-400" />
            Interview Language:
          </label>
          <select
            value={language}
            onChange={handleLanguageChange}
            className="nodrag w-full bg-navy-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-400 cursor-pointer"
          >
            <option value="en-IN">English (India) - en-IN</option>
            <option value="hi-IN">Hindi (हिन्दी) - hi-IN</option>
            <option value="kn-IN">Kannada (ಕನ್ನಡ) - kn-IN</option>
          </select>
        </div>

        {/* Prompt Input Area */}
        <div>
          <label className="text-[11px] font-medium text-slate-400 block mb-1">
            Witness Descriptive Recall:
          </label>
          <textarea
            rows={3}
            value={prompt}
            onChange={handlePromptChange}
            placeholder="Describe suspect jawline, eyes, nose, facial hair, distinguishing scars..."
            className="nodrag nowheel w-full bg-navy-950 border border-slate-700 rounded p-2 text-xs text-slate-100 focus:outline-none focus:border-sky-400 resize-none font-sans min-h-[72px]"
          />
        </div>

        {/* Voice & Speech Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleVoice}
            disabled={!sttSupported}
            className={`nodrag flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded border text-[11px] font-medium transition-all ${
              isRecording
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-navy-950 hover:bg-slate-800 border-slate-700 text-slate-300'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            title={sttSupported ? 'Voice Input' : 'Voice input not supported in this browser'}
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
            } disabled:opacity-40`}
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

        {/* Stage 1 Candidate Variations Selector */}
        <div className="bg-navy-950/80 p-2.5 rounded-lg border border-slate-800 space-y-1.5 nodrag">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
              <Layers size={13} className="text-sky-400" />
              Stage 1 Candidate Variations:
            </label>
            <span className="text-[10px] text-sky-400 font-mono font-bold bg-sky-950/90 px-1.5 py-0.5 rounded border border-sky-800/80">
              {numCandidates} {numCandidates === 1 ? 'Variation' : 'Variations'}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[1, 2, 3, 4].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => handleNumCandidatesChange(count)}
                className={`nodrag py-1 text-xs font-mono font-bold rounded border transition-all ${
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
            Generate {numCandidates} variation{numCandidates > 1 ? 's' : ''} to select the base composite for refinement.
          </p>
        </div>

        {/* Run Extraction Button */}
        <button
          type="button"
          onClick={handleTrigger}
          disabled={isProcessing || !prompt.trim()}
          className="nodrag w-full flex items-center justify-center gap-2 py-2 px-3 rounded bg-sky-500 hover:bg-sky-400 text-navy-950 font-bold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <RefreshCw size={13} className="animate-spin" />
              <span>Generating {numCandidates} Candidates...</span>
            </>
          ) : (
            <>
              <Sparkles size={13} />
              <span>Extract & Generate ({numCandidates} {numCandidates === 1 ? 'Variation' : 'Variations'})</span>
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
