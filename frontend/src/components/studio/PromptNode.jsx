import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Mic, Volume2, Sparkles, Languages, Check, RefreshCw, AudioWaveform } from 'lucide-react';
import { startVoiceRecognition, speakText, isSpeechRecognitionSupported, isSpeechSynthesisSupported } from '../../utils/speech';

export default function PromptNode({ data }) {
  const {
    prompt = '',
    onPromptChange,
    language = 'en-IN',
    onLanguageChange,
    onTriggerExtraction,
    isProcessing = false
  } = data;

  const [isRecording, setIsRecording] = useState(false);
  const [recognitionController, setRecognitionController] = useState(null);

  const sttSupported = isSpeechRecognitionSupported();
  const ttsSupported = isSpeechSynthesisSupported();

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
    speakText(prompt, language);
  };

  return (
    <div className="w-80 bg-navy-900 border-2 border-sky-500/70 rounded-xl shadow-2xl overflow-hidden backdrop-blur-md">
      {/* Node Header */}
      <div className="bg-navy-950/90 px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between">
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

      <div className="p-3.5 space-y-3 text-xs">
        {/* Language Selection */}
        <div>
          <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1">
            <Languages size={13} className="text-sky-400" />
            Interview Language:
          </label>
          <select
            value={language}
            onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
            className="w-full bg-navy-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-400"
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
            onChange={(e) => onPromptChange && onPromptChange(e.target.value)}
            placeholder="Describe suspect jawline, eyes, nose, facial hair, distinguishing scars..."
            className="w-full bg-navy-950 border border-slate-700 rounded p-2 text-xs text-slate-100 focus:outline-none focus:border-sky-400 resize-none font-sans"
          />
        </div>

        {/* Voice & Speech Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleVoice}
            disabled={!sttSupported}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded border text-[11px] font-medium transition-all ${
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
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded border border-slate-700 bg-navy-950 hover:bg-slate-800 text-slate-300 text-[11px] font-medium transition-all disabled:opacity-40"
            title="Read statement aloud"
          >
            <Volume2 size={13} className="text-sky-400" />
            <span>Read Aloud</span>
          </button>
        </div>

        {/* Run Extraction Button */}
        <button
          type="button"
          onClick={() => onTriggerExtraction && onTriggerExtraction()}
          disabled={isProcessing || !prompt.trim()}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded bg-sky-500 hover:bg-sky-400 text-navy-950 font-bold text-xs shadow-md transition-all disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <RefreshCw size={13} className="animate-spin" />
              <span>Analyzing Witness Prompt...</span>
            </>
          ) : (
            <>
              <Sparkles size={13} />
              <span>Extract Features & Generate</span>
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
