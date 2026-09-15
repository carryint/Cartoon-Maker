import { SFXType, BGMGenre } from '../types/cartoon';

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private bgmGain: GainNode | null = null;
  private isBgmPlaying = false;
  private bgmInterval: number | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Play procedural Cartoon & Nature Sound Effects
   */
  public playSFX(type: SFXType, volume: number = 0.8): void {
    if (type === 'none') return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      switch (type) {
        case 'nature-birds': {
          // Cheerful chirping forest birds
          const birds = [2200, 2600, 3100, 2800];
          birds.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            const t = now + idx * 0.12;
            osc.frequency.setValueAtTime(freq, t);
            osc.frequency.exponentialRampToValueAtTime(freq + 400, t + 0.04);
            osc.frequency.exponentialRampToValueAtTime(freq - 200, t + 0.09);

            gain.gain.setValueAtTime(volume * 0.35, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.1);
          });
          break;
        }

        case 'river-stream': {
          // Gentle babbling water stream
          const bufferSize = ctx.sampleRate * 0.8;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(450, now);
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(volume * 0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          noise.start(now);
          break;
        }

        case 'cat-meow': {
          // Cute cartoon kitten meow
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(550, now);
          osc.frequency.exponentialRampToValueAtTime(850, now + 0.18);
          osc.frequency.exponentialRampToValueAtTime(420, now + 0.45);

          gain.gain.setValueAtTime(0.01, now);
          gain.gain.linearRampToValueAtTime(volume * 0.5, now + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.45);
          break;
        }

        case 'cat-purr': {
          // Gentle purr
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(32, now);
          gain.gain.setValueAtTime(volume * 0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.6);
          break;
        }

        case 'boing': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.exponentialRampToValueAtTime(700, now + 0.18);
          osc.frequency.exponentialRampToValueAtTime(300, now + 0.35);
          osc.frequency.exponentialRampToValueAtTime(500, now + 0.5);

          gain.gain.setValueAtTime(volume, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.55);
          break;
        }

        case 'whoosh': {
          const bufferSize = ctx.sampleRate * 0.3;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(300, now);
          filter.frequency.exponentialRampToValueAtTime(2500, now + 0.15);
          filter.frequency.exponentialRampToValueAtTime(200, now + 0.3);
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.01, now);
          gain.gain.linearRampToValueAtTime(volume * 0.8, now + 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          noise.start(now);
          break;
        }

        case 'pop': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.exponentialRampToValueAtTime(1200, now + 0.04);
          osc.frequency.exponentialRampToValueAtTime(200, now + 0.09);

          gain.gain.setValueAtTime(volume, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.1);
          break;
        }

        case 'laser': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(1800, now);
          osc.frequency.exponentialRampToValueAtTime(100, now + 0.25);

          gain.gain.setValueAtTime(volume * 0.7, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.25);
          break;
        }

        case 'fanfare': {
          const freqs = [523.25, 659.25, 783.99, 1046.5];
          freqs.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.06);

            gain.gain.setValueAtTime(volume * 0.25, now + idx * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.06);
            osc.stop(now + 0.8);
          });
          break;
        }

        case 'sparkle': {
          const notes = [1046.5, 1318.5, 1567.98, 2093.0];
          notes.forEach((f, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, now + i * 0.08);
            gain.gain.setValueAtTime(volume * 0.25, now + i * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.08);
            osc.stop(now + i * 0.08 + 0.3);
          });
          break;
        }

        case 'punch': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(180, now);
          osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
          gain.gain.setValueAtTime(volume, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.2);
          break;
        }

        case 'thunder': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(60, now);
          osc.frequency.linearRampToValueAtTime(30, now + 0.8);
          gain.gain.setValueAtTime(volume * 0.6, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.8);
          break;
        }

        default:
          break;
      }
    } catch (e) {
      console.warn('SFX audio play error:', e);
    }
  }

  /**
   * Play procedural Cartoon Background Music loop
   */
  public startBGM(genre: BGMGenre, volume: number = 0.35): void {
    this.stopBGM();
    if (genre === 'none') return;

    try {
      const ctx = this.getContext();
      this.isBgmPlaying = true;

      this.bgmGain = ctx.createGain();
      this.bgmGain.gain.setValueAtTime(volume, ctx.currentTime);
      this.bgmGain.connect(ctx.destination);

      let step = 0;
      const chords: Record<BGMGenre, number[][]> = {
        'lilo-forest-morning': [
          [261.63, 329.63, 392.0, 523.25], // C major harp
          [349.23, 440.0, 523.25, 659.25], // F major7
          [293.66, 369.99, 440.0, 587.33], // D minor7
          [392.0, 493.88, 587.33, 783.99], // G major
        ],
        'playful-adventure': [
          [261.63, 329.63, 392.0],
          [349.23, 440.0, 523.25],
          [392.0, 493.88, 587.33],
          [261.63, 329.63, 392.0],
        ],
        'comedy-mischief': [
          [293.66, 349.23, 440.0],
          [329.63, 392.0, 493.88],
          [349.23, 440.0, 523.25],
          [440.0, 554.37, 659.25],
        ],
        'epic-heroic': [
          [220.0, 261.63, 329.63],
          [349.23, 440.0, 523.25],
          [261.63, 329.63, 392.0],
          [392.0, 493.88, 587.33],
        ],
        'spooky-mystery': [
          [220.0, 261.63, 311.13],
          [233.08, 277.18, 349.23],
          [196.0, 246.94, 293.66],
          [220.0, 261.63, 329.63],
        ],
        'chill-lofi': [
          [261.63, 329.63, 392.0, 493.88],
          [220.0, 261.63, 329.63, 392.0],
          [293.66, 349.23, 440.0, 523.25],
          [392.0, 493.88, 587.33, 698.46],
        ],
        'action-rush': [
          [164.81, 196.0, 246.94],
          [174.61, 220.0, 261.63],
          [196.0, 246.94, 293.66],
          [164.81, 196.0, 246.94],
        ],
        'none': [],
      };

      const pattern = chords[genre] || chords['lilo-forest-morning'];

      const playChord = () => {
        if (!this.isBgmPlaying || !this.bgmGain) return;
        const currentChord = pattern[step % pattern.length];
        const now = ctx.currentTime;

        currentChord.forEach((f) => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          osc.type = genre === 'lilo-forest-morning' ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(f, now);

          noteGain.gain.setValueAtTime(0.07, now);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

          osc.connect(noteGain);
          noteGain.connect(this.bgmGain!);
          osc.start(now);
          osc.stop(now + 0.68);
        });

        step++;
      };

      playChord();
      this.bgmInterval = window.setInterval(playChord, 600);
    } catch (e) {
      console.warn('BGM start error:', e);
    }
  }

  public stopBGM(): void {
    this.isBgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    if (this.bgmGain) {
      try {
        this.bgmGain.disconnect();
      } catch {
        // ignore
      }
      this.bgmGain = null;
    }
  }

  public setBgmVolume(volume: number): void {
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
  }

  public duckBgm(isDucking: boolean, baseVolume: number = 0.35): void {
    if (!this.bgmGain || !this.ctx) return;
    const target = isDucking ? baseVolume * 0.25 : baseVolume;
    this.bgmGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.bgmGain.gain.linearRampToValueAtTime(target, this.ctx.currentTime + 0.2);
  }
}

export const soundSynthesizer = new SoundSynthesizer();
