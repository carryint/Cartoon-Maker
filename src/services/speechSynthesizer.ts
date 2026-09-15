import { Character, CharacterEmotion } from '../types/cartoon';

export interface VoiceOption {
  id: string;
  name: string;
  lang: string;
  gender: 'male' | 'female' | 'robot' | 'child' | 'creature';
}

class SpeechSynthesizer {
  private voices: SpeechSynthesisVoice[] = [];
  private isLoaded = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
      window.speechSynthesis.onvoiceschanged = () => this.initVoices();
    }
  }

  private initVoices(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.voices = window.speechSynthesis.getVoices();
    this.isLoaded = this.voices.length > 0;
  }

  public getAvailableVoices(): VoiceOption[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    const list = window.speechSynthesis.getVoices();
    return list.map(v => {
      let gender: 'male' | 'female' | 'robot' | 'child' | 'creature' = 'female';
      const n = v.name.toLowerCase();
      if (n.includes('male') || n.includes('david') || n.includes('george') || n.includes('mark') || n.includes('james')) {
        gender = 'male';
      } else if (n.includes('robot') || n.includes('whisper')) {
        gender = 'robot';
      } else if (n.includes('kid') || n.includes('child')) {
        gender = 'child';
      }
      return {
        id: v.voiceURI || v.name,
        name: v.name,
        lang: v.lang,
        gender,
      };
    });
  }

  /**
   * Speak a dialogue line with emotion, pitch, speed, and talking callbacks
   */
  public speakDialogue(
    text: string,
    character: Character,
    emotion: CharacterEmotion,
    onStart?: () => void,
    onEnd?: () => void,
    onBoundary?: (charIndex: number) => void
  ): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        onStart?.();
        setTimeout(() => {
          onEnd?.();
          resolve();
        }, Math.max(1000, text.length * 70));
        return;
      }

      window.speechSynthesis.cancel(); // Stop any pending speech

      const utterance = new SpeechSynthesisUtterance(text);

      // Emotion tweaks to pitch and rate
      let pitchModifier = 1.0;
      let rateModifier = 1.0;

      switch (emotion) {
        case 'excited':
          pitchModifier = 1.25;
          rateModifier = 1.15;
          break;
        case 'surprised':
          pitchModifier = 1.35;
          rateModifier = 1.1;
          break;
        case 'angry':
          pitchModifier = 0.9;
          rateModifier = 1.2;
          break;
        case 'sad':
          pitchModifier = 0.8;
          rateModifier = 0.8;
          break;
        case 'scared':
          pitchModifier = 1.4;
          rateModifier = 1.25;
          break;
        case 'cool':
          pitchModifier = 0.92;
          rateModifier = 0.95;
          break;
        case 'thinking':
          pitchModifier = 1.0;
          rateModifier = 0.85;
          break;
        default:
          break;
      }

      utterance.pitch = Math.min(2.0, Math.max(0.2, character.voicePitch * pitchModifier));
      utterance.rate = Math.min(2.0, Math.max(0.5, character.voiceRate * rateModifier));

      // Select matching voice
      if (this.voices.length > 0) {
        const matchingVoice = this.voices.find(v => {
          const vName = v.name.toLowerCase();
          if (character.voiceGender === 'male') return vName.includes('male') || vName.includes('david') || vName.includes('guy');
          if (character.voiceGender === 'female') return vName.includes('female') || vName.includes('zira') || vName.includes('jenny');
          if (character.voiceGender === 'robot') return vName.includes('bot') || vName.includes('synth');
          return true;
        }) || this.voices[0];

        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }
      }

      utterance.onstart = () => {
        onStart?.();
      };

      utterance.onboundary = (e) => {
        onBoundary?.(e.charIndex);
      };

      utterance.onend = () => {
        onEnd?.();
        resolve();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis error:', e);
        onEnd?.();
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  public stopSpeaking(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const speechSynthesizer = new SpeechSynthesizer();
