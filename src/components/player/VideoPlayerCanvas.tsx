import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Play, Pause, RotateCcw, Maximize2, Volume2, VolumeX, Sparkles, Smartphone, Monitor, Square } from 'lucide-react';
import { Project, Scene, Character, AspectRatio, CharacterEmotion } from '../../types/cartoon';
import { getBackgroundSvgUrl } from '../../services/backgroundGenerator';
import { soundSynthesizer } from '../../services/soundSynthesizer';
import { speechSynthesizer } from '../../services/speechSynthesizer';

export interface VideoPlayerRef {
  getCanvas: () => HTMLCanvasElement | null;
  seekTo: (time: number) => void;
  play: () => void;
  pause: () => void;
}

interface VideoPlayerProps {
  project: Project;
  currentTime: number;
  isPlaying: boolean;
  onTimeUpdate: (time: number) => void;
  onTogglePlay: () => void;
  onRestart: () => void;
  aspectRatio?: AspectRatio;
  onAspectRatioChange?: (ratio: AspectRatio) => void;
}

export const VideoPlayerCanvas = forwardRef<VideoPlayerRef, VideoPlayerProps>(({
  project,
  currentTime,
  isPlaying,
  onTimeUpdate,
  onTogglePlay,
  onRestart,
  aspectRatio = '16:9',
  onAspectRatioChange,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [activeDialogue, setActiveDialogue] = useState<{ char: Character; text: string; emotion: CharacterEmotion } | null>(null);

  // Asset image cache to avoid re-creating images on every animation frame
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());

  // Track SFX trigger history to prevent multi-triggering per second
  const lastSfxTriggered = useRef<string | null>(null);
  const lastSpokenDlgId = useRef<string | null>(null);

  const totalDuration = Math.max(1, project.scenes.reduce((acc, s) => acc + s.duration, 0));

  // Determine current scene from currentTime
  let accum = 0;
  let currentSceneIndex = 0;
  let sceneRelativeTime = 0;

  for (let i = 0; i < project.scenes.length; i++) {
    const s = project.scenes[i];
    if (currentTime >= accum && currentTime < accum + s.duration) {
      currentSceneIndex = i;
      sceneRelativeTime = currentTime - accum;
      break;
    }
    accum += s.duration;
  }
  if (currentTime >= totalDuration) {
    currentSceneIndex = project.scenes.length - 1;
    sceneRelativeTime = project.scenes[currentSceneIndex]?.duration || 0;
  }

  const currentScene = project.scenes[currentSceneIndex] || project.scenes[0];

  // Helper to load/get image from cache
  const getImage = (url: string): HTMLImageElement | null => {
    if (!url) return null;
    if (imageCache.current.has(url)) {
      const img = imageCache.current.get(url)!;
      return img.complete ? img : null;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    imageCache.current.set(url, img);
    return null;
  };

  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
    seekTo: (time: number) => onTimeUpdate(time),
    play: () => { if (!isPlaying) onTogglePlay(); },
    pause: () => { if (isPlaying) onTogglePlay(); },
  }));

  // Handle BGM playback sync
  useEffect(() => {
    if (isPlaying && !isMuted) {
      soundSynthesizer.startBGM(project.bgm, project.bgmVolume || 0.3);
    } else {
      soundSynthesizer.stopBGM();
    }
    return () => {
      soundSynthesizer.stopBGM();
    };
  }, [isPlaying, isMuted, project.bgm, project.bgmVolume]);

  // Handle Playhead progression & audio synchronization
  useEffect(() => {
    let animFrame: number;
    let lastTimestamp = performance.now();

    const loop = (now: number) => {
      const delta = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      if (isPlaying) {
        let newTime = currentTime + delta;
        if (newTime >= totalDuration) {
          newTime = 0;
          lastSfxTriggered.current = null;
          lastSpokenDlgId.current = null;
        }
        onTimeUpdate(newTime);
      }

      animFrame = requestAnimationFrame(loop);
    };

    animFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying, currentTime, totalDuration, onTimeUpdate]);

  // Handle SFX & Dialogue Speech triggers
  useEffect(() => {
    if (!isPlaying || isMuted || !currentScene) return;

    // Check SFX
    const sfxMarker = currentScene.sfxTime || 1.0;
    const sfxKey = `${currentScene.id}_${currentScene.sfx}`;
    if (
      currentScene.sfx !== 'none' &&
      Math.abs(sceneRelativeTime - sfxMarker) < 0.25 &&
      lastSfxTriggered.current !== sfxKey
    ) {
      lastSfxTriggered.current = sfxKey;
      soundSynthesizer.playSFX(currentScene.sfx);
    }

    // Check Dialogue Speech
    let foundDlg: { char: Character; text: string; emotion: CharacterEmotion } | null = null;
    currentScene.dialogues.forEach(dlg => {
      if (sceneRelativeTime >= dlg.startTime && sceneRelativeTime < dlg.startTime + dlg.duration) {
        const char = project.characters.find(c => c.id === dlg.characterId) || project.characters[0];
        if (char) {
          foundDlg = { char, text: dlg.text, emotion: dlg.emotion };
          if (lastSpokenDlgId.current !== dlg.id) {
            lastSpokenDlgId.current = dlg.id;
            speechSynthesizer.speakDialogue(dlg.text, char, dlg.emotion);
          }
        }
      }
    });
    setActiveDialogue(foundDlg);
  }, [isPlaying, isMuted, currentScene, sceneRelativeTime, project.characters]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentScene) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear Canvas
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Background with Camera Pan / Zoom
    const bgUrl = getBackgroundSvgUrl(currentScene.backgroundUrl || 'space-station');
    const bgImg = getImage(bgUrl);

    ctx.save();

    // Camera movements
    const sceneProgress = Math.min(1, Math.max(0, sceneRelativeTime / currentScene.duration));
    if (currentScene.cameraAngle === 'dynamic-pan') {
      const zoom = 1.05 + Math.sin(sceneProgress * Math.PI) * 0.1;
      const panX = (sceneProgress - 0.5) * 40;
      ctx.translate(width / 2, height / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-width / 2 + panX, -height / 2);
    } else if (currentScene.cameraAngle === 'close-up') {
      ctx.translate(width / 2, height / 2);
      ctx.scale(1.18, 1.18);
      ctx.translate(-width / 2, -height / 2);
    } else if (currentScene.cameraAngle === 'dutch-angle') {
      ctx.translate(width / 2, height / 2);
      ctx.rotate(0.04 * Math.sin(sceneProgress * Math.PI));
      ctx.translate(-width / 2, -height / 2);
    }

    if (bgImg) {
      ctx.drawImage(bgImg, 0, 0, width, height);
    } else {
      // Fallback cartoon gradient background
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(1, '#3b0764');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }
    ctx.restore();

    // 2. Draw Dynamic Particle Layers
    const particles = currentScene.particleEffect || 'stars';
    const nowSec = performance.now() / 1000;

    if (particles === 'stars') {
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 20; i++) {
        const px = ((i * 137.5) % width);
        const py = ((i * 293.7 + nowSec * 20) % height);
        const size = 2 + Math.sin(nowSec * 4 + i) * 1.5;
        ctx.beginPath();
        ctx.arc(px, py, Math.max(0.5, size), 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (particles === 'speed-lines') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 12; i++) {
        const lx = ((i * 160 + nowSec * 600) % (width + 300)) - 100;
        const ly = 100 + (i * 70) % (height - 200);
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx - 80, ly);
        ctx.stroke();
      }
    } else if (particles === 'hearts') {
      ctx.fillStyle = '#f43f5e';
      ctx.font = '24px sans-serif';
      for (let i = 0; i < 8; i++) {
        const hx = ((i * 240 + Math.sin(nowSec + i) * 40) % width);
        const hy = height - ((nowSec * 60 + i * 120) % height);
        ctx.fillText('💖', hx, hy);
      }
    }

    // 3. Draw Cartoon Characters with Dynamic Animation & Talking Lip-Sync
    const charIds = currentScene.characters.length > 0
      ? currentScene.characters
      : project.characters.map(c => c.id);

    charIds.forEach((cId, idx) => {
      const char = project.characters.find(c => c.id === cId);
      if (!char) return;

      const isSpeaking = activeDialogue?.char.id === char.id;
      const currentEmotion = isSpeaking ? (activeDialogue?.emotion || 'happy') : 'happy';
      const avatarSvg = char.emotions[currentEmotion] || char.avatarUrl || '';
      const charImg = getImage(avatarSvg);

      // Character positioning
      const totalChars = charIds.length;
      let targetX = width / 2;
      if (totalChars === 2) {
        targetX = idx === 0 ? width * 0.28 : width * 0.72;
      } else if (totalChars >= 3) {
        targetX = (width * 0.2) + (idx * (width * 0.6 / (totalChars - 1)));
      }

      const baseY = height * 0.62;
      // Idle float + speaking bounce
      const idleFloat = Math.sin(nowSec * 3 + idx * 2) * 5;
      const talkBounce = isSpeaking ? Math.abs(Math.sin(nowSec * 12)) * 14 : 0;
      const charY = baseY - idleFloat - talkBounce;

      const charSize = Math.min(width, height) * 0.42;

      ctx.save();
      ctx.translate(targetX, charY);

      // Shadow under character
      ctx.beginPath();
      ctx.ellipse(0, charSize * 0.48, charSize * 0.35, 12, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fill();

      // Speaking glowing outline
      if (isSpeaking) {
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 24;
      }

      if (charImg) {
        ctx.drawImage(charImg, -charSize / 2, -charSize / 2, charSize, charSize);
      }

      // Name Tag over Character
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = isSpeaking ? '#ec4899' : 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      const tagText = char.name;
      ctx.font = 'bold 16px sans-serif';
      const textWidth = ctx.measureText(tagText).width;
      const pillW = textWidth + 24;
      const pillH = 28;
      const pillY = -charSize / 2 - 25;

      ctx.beginPath();
      ctx.roundRect(-pillW / 2, pillY, pillW, pillH, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isSpeaking ? '#f472b6' : '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tagText, 0, pillY + pillH / 2);

      ctx.restore();
    });

    // 4. Draw Animated TikTok/Netflix Style Subtitles
    if (activeDialogue) {
      ctx.save();
      const subY = height * 0.85;
      const text = activeDialogue.text;

      ctx.font = 'bold 22px sans-serif';
      const measure = ctx.measureText(text);
      const boxW = Math.min(width * 0.9, measure.width + 48);
      const boxH = 54;

      // Glow background box
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 3;
      ctx.shadowColor = 'rgba(168, 85, 247, 0.6)';
      ctx.shadowBlur = 18;

      ctx.beginPath();
      ctx.roundRect((width - boxW) / 2, subY - boxH / 2, boxW, boxH, 20);
      ctx.fill();
      ctx.stroke();

      // Dialogue text with emotion highlight
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, width / 2, subY);

      ctx.restore();
    }

    // 5. Draw Scene Transition Overlay (Fade / Wipe)
    if (sceneRelativeTime < 0.4 && currentScene.transition === 'fade') {
      const alpha = 1 - (sceneRelativeTime / 0.4);
      ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
      ctx.fillRect(0, 0, width, height);
    }
  }, [currentTime, currentScene, activeDialogue, sceneRelativeTime, project.characters]);

  // Aspect ratio canvas dimensions
  const getCanvasDimensions = () => {
    switch (aspectRatio) {
      case '9:16':
        return { width: 720, height: 1280 };
      case '1:1':
        return { width: 1080, height: 1080 };
      case '16:9':
      default:
        return { width: 1280, height: 720 };
    }
  };

  const { width: canvasWidth, height: canvasHeight } = getCanvasDimensions();

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-5xl mx-auto p-4 select-none">
      {/* Aspect Ratio & Stage Toolbar */}
      <div className="flex items-center justify-between w-full bg-slate-900/80 px-4 py-2 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Aspect Ratio:</span>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onAspectRatioChange?.('16:9')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                aspectRatio === '16:9' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>16:9 Landscape</span>
            </button>
            <button
              onClick={() => onAspectRatioChange?.('9:16')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                aspectRatio === '9:16' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>9:16 Shorts/Reels</span>
            </button>
            <button
              onClick={() => onAspectRatioChange?.('1:1')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                aspectRatio === '1:1' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Square className="w-3.5 h-3.5" />
              <span>1:1 Square</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-xl border transition ${
              isMuted ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Video Viewport Canvas */}
      <div
        ref={containerRef}
        className="relative bg-slate-950 rounded-3xl overflow-hidden border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20 flex items-center justify-center max-w-full"
        style={{
          aspectRatio: aspectRatio === '16:9' ? '16/9' : aspectRatio === '9:16' ? '9/16' : '1/1',
          maxHeight: '65vh',
        }}
      >
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="w-full h-full object-contain"
        />

        {/* Floating Controls Overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-slate-950/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 opacity-90 hover:opacity-100 transition">
          <div className="flex items-center gap-3">
            <button
              onClick={onRestart}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Restart Video"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onTogglePlay}
              className="w-9 h-9 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 transition active:scale-95"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
            </button>

            <div className="text-xs font-mono font-bold text-purple-300">
              {currentTime.toFixed(1)}s / {totalDuration.toFixed(1)}s
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-lg bg-purple-900/60 text-purple-200 border border-purple-500/40 font-bold">
              Scene {currentScene.sceneNumber}: {currentScene.title}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

VideoPlayerCanvas.displayName = 'VideoPlayerCanvas';
