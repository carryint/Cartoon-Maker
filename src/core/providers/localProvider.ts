import { VoiceGenerationRequest, MusicGenerationRequest, SoundGenerationRequest, ProviderResponse } from './types';

// ============================================================
//  Local / Free Engine (Browser Native)
//  Uses Web Audio API, Web Speech API, and procedural generators
// ============================================================

class LocalBrowserProvider {
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // 1. Web Speech API Speech Synthesis
  async speak(req: VoiceGenerationRequest): Promise<ProviderResponse<{ audioPlayed: boolean }>> {
    const startTime = performance.now();
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        return resolve({
          success: false,
          error: 'Web Speech API is not supported in this browser.',
          estimatedCost: 0,
          providerName: 'Local Web Speech API',
          durationMs: performance.now() - startTime,
        });
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(req.text);
      utterance.lang = req.lang || 'en-US';
      utterance.pitch = Math.max(0.5, Math.min(2.0, req.pitch || 1.0));
      utterance.rate = Math.max(0.5, Math.min(2.0, req.rate || 1.0));

      const voices = window.speechSynthesis.getVoices();
      const langPrefix = req.lang.split('-')[0];
      const matchedVoice = voices.find(v => v.lang.startsWith(langPrefix) && (v.localService || v.name.includes('Natural'))) ||
                           voices.find(v => v.lang.startsWith(langPrefix)) ||
                           voices.find(v => v.default);
      if (matchedVoice) utterance.voice = matchedVoice;

      utterance.onend = () => {
        resolve({
          success: true,
          data: { audioPlayed: true },
          estimatedCost: 0,
          providerName: 'Local Web Speech API (Free)',
          durationMs: performance.now() - startTime,
        });
      };

      utterance.onerror = (e) => {
        resolve({
          success: true, // gracefully resolve so generation doesn't crash
          data: { audioPlayed: false },
          error: e.error,
          estimatedCost: 0,
          providerName: 'Local Web Speech API',
          durationMs: performance.now() - startTime,
        });
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  // 2. Procedural Web Audio Music Synthesizer (Chords & Melodies for Children)
  playProceduralMusic(mood: string, durationSec: number = 8, volume: number = 0.3): () => void {
    const ctx = this.getAudioContext();
    const gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);

    const isMagical = mood === 'magical' || mood === 'mystery';
    const isHappy = mood === 'happy' || mood === 'adventure' || mood === 'celebration';
    const baseFreq = isMagical ? 440 : isHappy ? 523.25 : 392.00; // A4, C5, G4
    const notes = isMagical ? [0, 3, 7, 10, 12, 15] : [0, 4, 7, 9, 12, 16]; // minor pentatonic / major pentatonic

    const oscillators: OscillatorNode[] = [];
    const noteCount = Math.floor(durationSec * 2.5);
    const stepTime = durationSec / noteCount;

    for (let i = 0; i < noteCount; i++) {
      const noteIdx = notes[i % notes.length];
      const freq = baseFreq * Math.pow(2, noteIdx / 12);

      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = isMagical ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * stepTime);

      noteGain.gain.setValueAtTime(0, ctx.currentTime + i * stepTime);
      noteGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + i * stepTime + 0.05);
      noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (i + 1) * stepTime);

      osc.connect(noteGain);
      noteGain.connect(gainNode);

      osc.start(ctx.currentTime + i * stepTime);
      osc.stop(ctx.currentTime + (i + 1) * stepTime);
      oscillators.push(osc);
    }

    return () => {
      try {
        gainNode.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        setTimeout(() => {
          oscillators.forEach(o => {
            try { o.stop(); o.disconnect(); } catch {}
          });
          gainNode.disconnect();
        }, 250);
      } catch {}
    };
  }

  // 3. Web Audio SFX Generator
  playProceduralSound(name: string): void {
    const ctx = this.getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (name.includes('footstep') || name.includes('walk') || name.includes('step')) {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (name.includes('magic') || name.includes('sparkle') || name.includes('bell')) {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.3);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (name.includes('bark') || name.includes('dog') || name.includes('animal')) {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.18);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else {
      // Default warm chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.25);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  }
}

export const localProvider = new LocalBrowserProvider();
