/**
 * Multilingual Speech-to-Text (STT) and Text-to-Speech (TTS) utilities.
 * Supports English (en-IN), Hindi (hi-IN), and Kannada (kn-IN).
 */

export function isSpeechRecognitionSupported() {
  return typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
}

export function isSpeechSynthesisSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

let activeRecognition = null;

/**
 * Starts speech recognition with the given language code.
 * @param {string} lang - 'en-IN' | 'hi-IN' | 'kn-IN'
 * @param {function} onResult - Callback with transcribed text
 * @param {function} onError - Error callback
 * @param {function} onEnd - End of speech session callback
 * @returns {object} Recognition controller with abort()
 */
export function startVoiceRecognition(lang = 'en-IN', onResult, onError, onEnd) {
  if (!isSpeechRecognitionSupported()) {
    if (onError) onError(new Error('Speech recognition is not supported in this browser. Please use Chrome, Edge, or a compatible browser.'));
    return null;
  }

  // Abort any existing instance
  if (activeRecognition) {
    try {
      activeRecognition.abort();
    } catch {
      // Ignore
    }
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.lang = lang;
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    if (event.results && event.results[0] && event.results[0][0]) {
      const transcript = event.results[0][0].transcript;
      if (onResult) onResult(transcript);
    }
  };

  recognition.onerror = (event) => {
    if (onError) onError(event.error || new Error('Voice recognition error'));
  };

  recognition.onend = () => {
    activeRecognition = null;
    if (onEnd) onEnd();
  };

  try {
    recognition.start();
    activeRecognition = recognition;
  } catch (err) {
    if (onError) onError(err);
  }

  return {
    abort: () => {
      try {
        recognition.abort();
      } catch {
        // Ignore
      }
    }
  };
}

/**
 * Reads aloud the given text using the browser's SpeechSynthesis API.
 * @param {string} text - Text to read aloud
 * @param {string} lang - 'en-IN' | 'hi-IN' | 'kn-IN'
 * @param {function} onComplete - Completion callback
 */
export function speakText(text, lang = 'en-IN', onComplete) {
  if (!isSpeechSynthesisSupported()) {
    console.warn('Speech synthesis not supported');
    return;
  }

  window.speechSynthesis.cancel(); // Stop any currently active speech

  if (!text || text.trim().length === 0) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  // Attempt to select a voice matching the language
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find((v) => v.lang === lang || v.lang.startsWith(lang.slice(0, 2)));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  if (onComplete) {
    utterance.onend = () => onComplete();
    utterance.onerror = () => onComplete();
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}
