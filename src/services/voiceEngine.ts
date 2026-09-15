import { Character } from '../types/studio';

// ============================================================
//  Voice Engine
//  Assigns voices to characters and speaks dialogue via Web Speech API
// ============================================================

export interface SpeechOptions {
  text: string;
  lang: string;
  pitch: number;
  rate: number;
  volume: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
}

let currentUtterance: SpeechSynthesisUtterance | null = null;

/**
 * Speak text using Web Speech API with voice profile
 */
export function speakLine(options: SpeechOptions): void {
  cancelSpeech();
  const utterance = new SpeechSynthesisUtterance(options.text);
  utterance.lang = options.lang || 'en-US';
  utterance.pitch = options.pitch ?? 1.0;
  utterance.rate = options.rate ?? 1.0;
  utterance.volume = options.volume ?? 1.0;

  // Pick a voice that matches the language
  const voices = window.speechSynthesis.getVoices();
  const match = voices.find(v => v.lang.startsWith(options.lang.split('-')[0]) && v.localService)
    ?? voices.find(v => v.lang.startsWith(options.lang.split('-')[0]))
    ?? voices.find(v => v.default);
  if (match) utterance.voice = match;

  utterance.onstart = options.onStart ?? null;
  utterance.onend = options.onEnd ?? null;
  utterance.onerror = options.onError ?? null;

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function cancelSpeech(): void {
  window.speechSynthesis.cancel();
  currentUtterance = null;
}

export function isSpeaking(): boolean {
  return window.speechSynthesis.speaking;
}

/**
 * Returns the estimated duration in seconds for a line of text
 */
export function estimateDuration(text: string, rate: number): number {
  const wordsPerMinute = 150 * (rate || 1.0);
  const words = text.trim().split(/\s+/).length;
  return Math.max(1.5, (words / wordsPerMinute) * 60 + 0.5);
}

/**
 * Auto-assigns a fitting voice profile for a character
 * based on their description, role, and gender
 */
export function autoAssignVoiceProfile(character: Character): Character['voiceProfile'] {
  const desc = (character.description + ' ' + character.name).toLowerCase();
  const profile = { ...character.voiceProfile };

  if (desc.includes('toddler') || desc.includes('baby') || desc.includes('little girl') || desc.includes('child')) {
    return { lang: profile.lang || 'en-US', pitch: 1.45, rate: 0.92, gender: 'child' };
  }
  if (desc.includes('cat') || desc.includes('animal') || desc.includes('dog') || desc.includes('creature')) {
    return { lang: profile.lang || 'en-US', pitch: 1.6, rate: 1.2, gender: 'creature' };
  }
  if (desc.includes('old man') || desc.includes('grandfather') || desc.includes('elder man')) {
    return { lang: profile.lang || 'en-US', pitch: 0.7, rate: 0.85, gender: 'male' };
  }
  if (desc.includes('boy') || desc.includes('man') || desc.includes('father') || desc.includes('grandfather')) {
    return { lang: profile.lang || 'en-US', pitch: 0.9, rate: 1.0, gender: 'male' };
  }
  if (desc.includes('girl') || desc.includes('woman') || desc.includes('mother') || desc.includes('lady')) {
    return { lang: profile.lang || 'en-US', pitch: 1.2, rate: 1.0, gender: 'female' };
  }
  return profile;
}

/**
 * Gets all available browser speech voices, grouped by language
 */
export function getAvailableVoices(): Record<string, SpeechSynthesisVoice[]> {
  const voices = window.speechSynthesis.getVoices();
  const groups: Record<string, SpeechSynthesisVoice[]> = {};
  for (const v of voices) {
    const lang = v.lang.split('-')[0];
    if (!groups[lang]) groups[lang] = [];
    groups[lang].push(v);
  }
  return groups;
}

/**
 * Play meow/cat sound via oscillator for Mozz-type characters
 */
export function playCatSound(ctx: AudioContext, pitch = 1.0): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(550 * pitch, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(350 * pitch, ctx.currentTime + 0.3);
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
  osc.start();
  osc.stop(ctx.currentTime + 0.4);
}
