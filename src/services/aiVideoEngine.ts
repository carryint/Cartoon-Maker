import { Project, Scene, Character, GenerationJob, DialogueLine } from '../types/studio';
import { parseScript } from './scriptParser';
import { speakLine, cancelSpeech, estimateDuration, playCatSound } from './voiceEngine';
import { drawBackground, drawCharacter } from './backgroundEngine';

// ============================================================
//  AI Video Engine
//  Orchestrates the full generation pipeline:
//  Script parsing → scene preparation → canvas rendering → recording
// ============================================================

const STORAGE_KEY = 'aivideo_project_v1';

export function saveProject(project: Project): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
  } catch (e) {
    console.warn('Could not save project to localStorage:', e);
  }
}

export function loadProject(): Project | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearProject(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Parses the script and prepares scene data.
 * Updates the project in place and returns the updated project.
 */
export function prepareProject(project: Project, onLog: (msg: string) => void): Project {
  onLog('🔍 Parsing script into scenes...');
  const scenes = parseScript(project.rawScript, project.characters);
  onLog(`✅ Found ${scenes.length} scenes with ${scenes.reduce((n, s) => n + s.dialogues.length, 0)} dialogue lines.`);

  // Estimate total duration
  const totalSec = scenes.reduce((s, sc) => s + sc.duration, 0);
  onLog(`⏱️ Estimated total video duration: ${Math.round(totalSec)}s (~${(totalSec / 60).toFixed(1)} min)`);

  const updated: Project = {
    ...project,
    scenes,
    updatedAt: new Date().toISOString(),
  };
  saveProject(updated);
  return updated;
}

// -------------------------------------------------------
//  Canvas Renderer & MediaRecorder-based export
// -------------------------------------------------------

export interface RenderOptions {
  canvas: HTMLCanvasElement;
  project: Project;
  resolution: '4K' | '1080p' | '720p';
  fps: number;
  language: string;
  onProgress: (job: Partial<GenerationJob>) => void;
  onDone: (videoUrl: string) => void;
  onError: (msg: string) => void;
  signal?: AbortSignal;
}

const RESOLUTION_MAP = {
  '4K': { w: 3840, h: 2160 },
  '1080p': { w: 1920, h: 1080 },
  '720p': { w: 1280, h: 720 },
};

export async function renderVideo(opts: RenderOptions): Promise<void> {
  const { canvas, project, resolution, fps, onProgress, onDone, onError, signal } = opts;
  const { w, h } = RESOLUTION_MAP[resolution] || RESOLUTION_MAP['1080p'];

  // Set canvas to target resolution
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) { onError('Canvas context unavailable'); return; }

  // Pre-load character images
  onProgress({ status: 'generating', currentStep: 'Loading character images...', progress: 5 });
  const charImages: Record<string, HTMLImageElement> = {};
  for (const char of project.characters) {
    if (char.boardImageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = char.spriteUrl || char.boardImageUrl;
      });
      charImages[char.id] = img;
    }
  }

  // Set up MediaRecorder to capture canvas stream
  let stream: MediaStream;
  let recorder: MediaRecorder;
  const chunks: Blob[] = [];
  try {
    stream = canvas.captureStream(fps);
    recorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm',
      videoBitsPerSecond: resolution === '4K' ? 40_000_000 : resolution === '1080p' ? 20_000_000 : 10_000_000,
    });
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.start(200);
  } catch (e) {
    onError(`MediaRecorder failed: ${e instanceof Error ? e.message : String(e)}`);
    return;
  }

  // Render each scene
  let audioCtx: AudioContext | null = null;
  try { audioCtx = new AudioContext(); } catch { /* no audio */ }

  const totalScenes = project.scenes.length;
  let renderedScenes = 0;

  for (const scene of project.scenes) {
    if (signal?.aborted) break;

    onProgress({
      status: 'rendering',
      currentStep: `Rendering Scene ${scene.sceneNumber}: "${scene.title}"`,
      progress: 10 + (renderedScenes / totalScenes) * 85,
    });

    const sceneDuration = scene.duration; // seconds
    const frameCount = Math.round(sceneDuration * fps);
    const msPerFrame = 1000 / fps;

    // Play dialogues with timing
    let dialogueQueue = [...scene.dialogues].sort((a, b) => a.startOffset - b.startOffset);
    const sceneStartMs = performance.now();

    for (let f = 0; f < frameCount; f++) {
      if (signal?.aborted) break;

      const t = f / fps; // seconds into scene
      const wallMs = performance.now() - sceneStartMs;

      // Speak dialogues at correct offsets
      for (let i = dialogueQueue.length - 1; i >= 0; i--) {
        const dl = dialogueQueue[i];
        if (t >= dl.startOffset) {
          dialogueQueue.splice(i, 1);
          const char = project.characters.find(c => c.id === dl.characterId);
          if (char) {
            if (char.voiceProfile.gender === 'creature' && audioCtx) {
              playCatSound(audioCtx, char.voiceProfile.pitch);
            }
            speakLine({
              text: dl.text,
              lang: char.voiceProfile.lang || project.language || 'en-US',
              pitch: char.voiceProfile.pitch,
              rate: char.voiceProfile.rate,
              volume: 0.9,
            });
          }
        }
      }

      // Render frame
      renderSceneFrame(ctx, w, h, scene, project.characters, charImages, t, scene.dialogues);

      // Throttle to maintain fps
      const expectedMs = ((f + 1) / fps) * 1000;
      const actualMs = performance.now() - sceneStartMs;
      if (actualMs < expectedMs) {
        await sleep(expectedMs - actualMs);
      }
    }

    cancelSpeech();
    renderedScenes++;
  }

  // Stop recording and build final video blob
  onProgress({ status: 'rendering', currentStep: 'Finalizing video...', progress: 96 });
  await new Promise<void>((resolve) => {
    recorder.onstop = () => resolve();
    recorder.stop();
  });

  const blob = new Blob(chunks, { type: 'video/webm' });
  const url = URL.createObjectURL(blob);

  onProgress({ status: 'done', currentStep: 'Video ready!', progress: 100, videoUrl: url });
  onDone(url);
}

function renderSceneFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scene: Scene,
  characters: Character[],
  charImages: Record<string, HTMLImageElement>,
  time: number,
  dialogues: DialogueLine[]
): void {
  // Background
  drawBackground(ctx, w, h, scene.background.type, time);

  // Characters — lay out side by side
  const sceneChars = characters.filter(c => scene.characterIds.includes(c.id));
  const charW = Math.min(w * 0.3, h * 0.7);
  const charH = charW * 1.3;
  const spacing = w / (sceneChars.length + 1);

  const activeDial = dialogues.find(d => d.startOffset <= time && time <= d.startOffset + d.duration + 0.5);

  for (let i = 0; i < sceneChars.length; i++) {
    const char = sceneChars[i];
    const cx = spacing * (i + 1) - charW / 2;
    const cy = h * 0.6 - charH;
    const img = charImages[char.id];
    const isTalking = activeDial?.characterId === char.id;
    const emotion = activeDial?.characterId === char.id ? (activeDial.emotion || 'neutral') : 'neutral';

    if (img && img.complete && img.naturalWidth > 0) {
      drawCharacter(ctx, img, cx, cy, charW, charH, time, isTalking, emotion);
    } else {
      // Fallback placeholder
      drawCharacterPlaceholder(ctx, char, cx, cy, charW, charH, time, isTalking);
    }
  }

  // Dialogue bubble
  if (activeDial) {
    const char = characters.find(c => c.id === activeDial.characterId);
    drawDialogueBubble(ctx, activeDial.text, char, w, h);
  }

  // Scene title card (first 2 seconds)
  if (time < 2) {
    const alpha = Math.min(1, Math.max(0, time < 1.5 ? time / 0.5 : (2 - time) / 0.5));
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, h * 0.04, w, h * 0.1);
    ctx.fillStyle = '#FFD700';
    ctx.font = `bold ${h * 0.055}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`Scene ${scene.sceneNumber}: ${scene.title}`, w / 2, h * 0.1);
    ctx.restore();
  }
}

function drawCharacterPlaceholder(
  ctx: CanvasRenderingContext2D,
  char: Character,
  x: number,
  y: number,
  w: number,
  h: number,
  time: number,
  isTalking: boolean
): void {
  ctx.save();
  const bob = isTalking ? Math.sin(time * 12) * 4 : Math.sin(time * 1.5) * 3;

  // Body
  ctx.fillStyle = char.colorPrimary || '#8b5cf6';
  ctx.beginPath();
  ctx.roundRect(x + w * 0.1, y + h * 0.3 + bob, w * 0.8, h * 0.65, 20);
  ctx.fill();

  // Head
  ctx.fillStyle = '#FFE0B2';
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h * 0.22 + bob, w * 0.26, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  const eyeY = y + h * 0.19 + bob;
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(x + w * 0.38, eyeY, w * 0.04, 0, Math.PI * 2);
  ctx.arc(x + w * 0.62, eyeY, w * 0.04, 0, Math.PI * 2);
  ctx.fill();

  // Smile / talking mouth
  ctx.strokeStyle = '#333';
  ctx.lineWidth = w * 0.03;
  ctx.beginPath();
  if (isTalking) {
    ctx.arc(x + w / 2, y + h * 0.26 + bob, w * 0.1, 0, Math.PI);
  } else {
    ctx.arc(x + w / 2, y + h * 0.24 + bob, w * 0.1, 0.1, Math.PI - 0.1);
  }
  ctx.stroke();

  // Name tag
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(x + w * 0.05, y + h * 0.92, w * 0.9, h * 0.08);
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${w * 0.12}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillText(char.name, x + w / 2, y + h * 0.98);

  ctx.restore();
}

function drawDialogueBubble(
  ctx: CanvasRenderingContext2D,
  text: string,
  char: Character | undefined,
  w: number,
  h: number
): void {
  const maxW = w * 0.7;
  const padding = h * 0.025;
  const fontSize = h * 0.032;
  ctx.font = `${fontSize}px Arial, sans-serif`;

  // Word wrap
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxW - padding * 2) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);

  const bubbleH = lines.length * (fontSize + 6) + padding * 2;
  const bubbleW = Math.min(maxW, Math.max(...lines.map(l => ctx.measureText(l).width)) + padding * 2);
  const bubbleX = (w - bubbleW) / 2;
  const bubbleY = h * 0.72;

  // Shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetY = 5;

  // Bubble background
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.beginPath();
  ctx.roundRect(bubbleX, bubbleY, bubbleW, bubbleH, 16);
  ctx.fill();

  // Colored border from character
  ctx.strokeStyle = char?.colorPrimary || '#8b5cf6';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.restore();

  // Character name
  if (char) {
    ctx.fillStyle = char.colorPrimary || '#8b5cf6';
    ctx.font = `bold ${fontSize * 0.85}px Arial`;
    ctx.textAlign = 'left';
    ctx.fillText(char.name.toUpperCase(), bubbleX + padding, bubbleY - 6);
  }

  // Text
  ctx.fillStyle = '#1a1a2e';
  ctx.font = `${fontSize}px Arial, sans-serif`;
  ctx.textAlign = 'left';
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], bubbleX + padding, bubbleY + padding + fontSize + i * (fontSize + 6));
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, Math.max(0, ms)));
}
