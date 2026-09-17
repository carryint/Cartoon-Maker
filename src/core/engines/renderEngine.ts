import { Project, Scene, Resolution, AspectRatio } from '../../types/lilo';
import { drawLocationEnvironment } from './locationEngine';
import { drawRiggedCharacter } from './characterEngine';
import { synthesizeDialogueSpeech, playSceneSoundEffect, playSceneBgm } from './audioEngine';

// ============================================================
//  Render Engine — 4K/1080p Canvas Compositor & Exporter
// ============================================================

export interface RenderProgressCallback {
  (progress: {
    status: 'rendering' | 'completed' | 'error';
    currentScene: number;
    totalScenes: number;
    percent: number;
    stepDescription: string;
    videoBlobUrl?: string;
  }): void;
}

const RESOLUTION_DIMS: Record<Resolution, { width: number; height: number }> = {
  '4K': { width: 3840, height: 2160 },
  '1080p': { width: 1920, height: 1080 },
  '720p': { width: 1280, height: 720 },
};

export async function renderProjectToVideo(
  canvas: HTMLCanvasElement,
  project: Project,
  resolution: Resolution = '1080p',
  aspectRatio: AspectRatio = '16:9',
  onProgress: RenderProgressCallback
): Promise<string> {
  const baseDims = RESOLUTION_DIMS[resolution] || RESOLUTION_DIMS['1080p'];
  let renderWidth = baseDims.width;
  let renderHeight = baseDims.height;

  if (aspectRatio === '9:16') {
    // Vertical shorts
    renderWidth = baseDims.height * (9 / 16);
    renderHeight = baseDims.height;
  } else if (aspectRatio === '1:1') {
    renderWidth = baseDims.height;
    renderHeight = baseDims.height;
  }

  canvas.width = renderWidth;
  canvas.height = renderHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  // MediaRecorder setup
  let stream: MediaStream;
  let recorder: MediaRecorder;
  const recordedChunks: Blob[] = [];

  try {
    stream = canvas.captureStream(project.fps || 30);
    const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
      ? 'video/webm;codecs=vp9' 
      : 'video/webm';
    
    recorder = new MediaRecorder(stream, {
      mimeType: mime,
      videoBitsPerSecond: resolution === '4K' ? 40_000_000 : 18_000_000,
    });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.push(e.data);
    };

    recorder.start(200);
  } catch (err) {
    onProgress({
      status: 'error',
      currentScene: 0,
      totalScenes: project.scenes.length,
      percent: 0,
      stepDescription: `Recorder error: ${err instanceof Error ? err.message : String(err)}`,
    });
    throw err;
  }

  const totalScenes = project.scenes.length;
  const fps = project.fps || 30;

  for (let sIdx = 0; sIdx < totalScenes; sIdx++) {
    const scene = project.scenes[sIdx];
    const location = project.locations.find(l => l.id === scene.locationId);
    const sceneChars = project.characters.filter(c => scene.characterIds.includes(c.id));

    onProgress({
      status: 'rendering',
      currentScene: sIdx + 1,
      totalScenes,
      percent: Math.round((sIdx / totalScenes) * 90),
      stepDescription: `Rendering Scene ${scene.sceneNumber}: "${scene.title}" (${resolution})`,
    });

    // Start scene BGM
    const stopBgm = playSceneBgm(scene.music.mood, scene.duration, scene.music.volume);

    // Play initial scene SFX
    if (scene.soundEffects.length > 0) {
      playSceneSoundEffect(scene.soundEffects[0].name);
    }

    const totalFrames = Math.round(scene.duration * fps);
    let spokenDialogueIds = new Set<string>();

    for (let f = 0; f < totalFrames; f++) {
      const timeInSec = f / fps;

      // 1. Check dialogue triggering
      const currentDialogue = scene.dialogues.find(
        d => timeInSec >= d.startOffset && timeInSec <= (d.startOffset + d.duration + 0.3)
      );

      if (currentDialogue && !spokenDialogueIds.has(currentDialogue.id)) {
        spokenDialogueIds.add(currentDialogue.id);
        const speaker = sceneChars.find(c => c.id === currentDialogue.characterId);
        if (speaker) {
          synthesizeDialogueSpeech(currentDialogue.text, speaker.voiceProfile, project.language);
        }
      }

      // 2. Draw Environment
      drawLocationEnvironment(ctx, renderWidth, renderHeight, location, scene.lighting, scene.weather, timeInSec);

      // 3. Draw Scene Characters
      const charWidth = Math.min(renderWidth * 0.28, renderHeight * 0.55);
      const charHeight = charWidth * 1.35;
      const count = Math.max(1, sceneChars.length);
      const spacing = renderWidth / (count + 1);

      sceneChars.forEach((char, cIdx) => {
        const cx = spacing * (cIdx + 1) - charWidth / 2;
        const cy = renderHeight * 0.52 - charHeight * 0.5;
        const isSpeaking = currentDialogue?.characterId === char.id;

        drawRiggedCharacter(ctx, char, cx, cy, charWidth, charHeight, {
          time: timeInSec,
          isTalking: isSpeaking,
          emotion: isSpeaking ? (currentDialogue?.emotion || 'happy') : 'happy',
          pose: isSpeaking ? 'talking' : 'standing',
        });
      });

      // 4. Subtitle / Dialogue Bubble
      if (currentDialogue) {
        drawDialogueOverlay(ctx, currentDialogue.text, sceneChars.find(c => c.id === currentDialogue.characterId), renderWidth, renderHeight);
      }

      // 5. Scene Title Splash (first 2 seconds)
      if (timeInSec < 2) {
        drawSceneTitleSplash(ctx, scene, renderWidth, renderHeight, timeInSec);
      }

      // Frame throttle for smooth rendering
      await new Promise(r => setTimeout(r, Math.floor(1000 / fps)));
    }

    stopBgm();
  }

  // Stop recording
  onProgress({
    status: 'rendering',
    currentScene: totalScenes,
    totalScenes,
    percent: 96,
    stepDescription: 'Encoding and finalizing multi-track video file...',
  });

  await new Promise<void>((resolve) => {
    recorder.onstop = () => resolve();
    recorder.stop();
  });

  const blob = new Blob(recordedChunks, { type: 'video/webm' });
  const videoUrl = URL.createObjectURL(blob);

  onProgress({
    status: 'completed',
    currentScene: totalScenes,
    totalScenes,
    percent: 100,
    stepDescription: `Cartoon render complete! (${resolution} ${aspectRatio})`,
    videoBlobUrl: videoUrl,
  });

  return videoUrl;
}

function drawDialogueOverlay(ctx: CanvasRenderingContext2D, text: string, char: any, width: number, height: number) {
  const bubbleY = height * 0.78;
  const bubbleH = height * 0.14;
  const padding = width * 0.04;

  ctx.save();
  // Translucent backdrop
  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.beginPath();
  ctx.roundRect(padding, bubbleY, width - padding * 2, bubbleH, 20);
  ctx.fill();

  // Character accent border
  ctx.strokeStyle = char?.primaryColor || '#fbbf24';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Speaker name
  ctx.fillStyle = char?.primaryColor || '#fbbf24';
  ctx.font = `bold ${Math.round(height * 0.034)}px sans-serif`;
  ctx.fillText(char?.name ? char.name.toUpperCase() : 'CHARACTER', padding + 24, bubbleY + height * 0.042);

  // Dialogue text
  ctx.fillStyle = '#f8fafc';
  ctx.font = `${Math.round(height * 0.038)}px sans-serif`;
  ctx.fillText(text, padding + 24, bubbleY + height * 0.095);

  ctx.restore();
}

function drawSceneTitleSplash(ctx: CanvasRenderingContext2D, scene: Scene, width: number, height: number, time: number) {
  const alpha = time < 1.5 ? 1 : Math.max(0, (2 - time) / 0.5);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
  ctx.fillRect(0, height * 0.05, width, height * 0.1);

  ctx.fillStyle = '#fbbf24';
  ctx.font = `bold ${Math.round(height * 0.05)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(`Scene ${scene.sceneNumber}: ${scene.title}`, width / 2, height * 0.115);
  ctx.restore();
}

// ------------------------------------------------------------
//  Subtitle & Social Generator
// ------------------------------------------------------------
export function generateSrtSubtitles(project: Project): string {
  let srtContent = '';
  let counter = 1;
  let runningTime = 0;

  project.scenes.forEach(scene => {
    scene.dialogues.forEach(dial => {
      const char = project.characters.find(c => c.id === dial.characterId);
      const start = runningTime + dial.startOffset;
      const end = start + dial.duration;

      const formatTime = (sec: number) => {
        const h = String(Math.floor(sec / 3600)).padStart(2, '0');
        const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
        const s = String(Math.floor(sec % 60)).padStart(2, '0');
        const ms = String(Math.floor((sec % 1) * 1000)).padStart(3, '0');
        return `${h}:${m}:${s},${ms}`;
      };

      srtContent += `${counter}\n`;
      srtContent += `${formatTime(start)} --> ${formatTime(end)}\n`;
      srtContent += `${char ? char.name + ': ' : ''}${dial.text}\n\n`;
      counter++;
    });
    runningTime += scene.duration;
  });

  return srtContent;
}

export function generateYouTubeMetadata(project: Project) {
  let totalTime = 0;
  const chapters = project.scenes.map(s => {
    const mins = Math.floor(totalTime / 60);
    const secs = Math.floor(totalTime % 60);
    const stamp = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    totalTime += s.duration;
    return `${stamp} - Scene ${s.sceneNumber}: ${s.title}`;
  }).join('\n');

  return {
    title: `${project.seriesName || 'LiLo'} | ${project.title} (Children's Cartoon)`,
    description: `${project.description || 'An original animated adventure for kids!'}\n\n🌟 TIMESTAMPS / CHAPTERS:\n${chapters}\n\n🎨 Created with LiLo Cartoon Maker — AI Animation Platform.\n#KidsCartoon #Animation #LiLo #StoryTime`,
    tags: ['children cartoon', 'animation', 'kids stories', 'original cartoon', 'family friendly', 'cartoon maker'],
  };
}
