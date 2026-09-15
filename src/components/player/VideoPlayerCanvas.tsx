import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Smartphone, Monitor, Square, FastForward, SkipForward, SkipBack } from 'lucide-react';
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
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [activeDialogue, setActiveDialogue] = useState<{ char: Character; text: string; emotion: CharacterEmotion } | null>(null);

  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const lastSfxTriggered = useRef<string | null>(null);
  const lastSpokenDlgId = useRef<string | null>(null);

  const totalDuration = Math.max(1, project.scenes.reduce((acc, s) => acc + s.duration, 0));

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

  // BGM sync
  useEffect(() => {
    if (isPlaying && !isMuted) {
      soundSynthesizer.startBGM(project.bgm, project.bgmVolume || 0.35);
    } else {
      soundSynthesizer.stopBGM();
    }
    return () => {
      soundSynthesizer.stopBGM();
    };
  }, [isPlaying, isMuted, project.bgm, project.bgmVolume]);

  // Main Playback Loop with playback speed multiplier
  useEffect(() => {
    let animFrame: number;
    let lastTimestamp = performance.now();

    const loop = (now: number) => {
      const delta = ((now - lastTimestamp) / 1000) * playbackRate;
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
  }, [isPlaying, currentTime, totalDuration, onTimeUpdate, playbackRate]);

  // SFX & Speech triggers
  useEffect(() => {
    if (!isPlaying || isMuted || !currentScene) return;

    // SFX
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

    // Dialogue Speech
    let foundDlg: { char: Character; text: string; emotion: CharacterEmotion } | null = null;
    currentScene.dialogues.forEach(dlg => {
      if (sceneRelativeTime >= dlg.startTime && sceneRelativeTime < dlg.startTime + dlg.duration) {
        const char = project.characters.find(c => c.id === dlg.characterId) || project.characters[0];
        if (char) {
          foundDlg = { char, text: dlg.text, emotion: dlg.emotion };
          if (lastSpokenDlgId.current !== dlg.id && playbackRate === 1.0) {
            lastSpokenDlgId.current = dlg.id;
            speechSynthesizer.speakDialogue(dlg.text, char, dlg.emotion);
          }
        }
      }
    });
    setActiveDialogue(foundDlg);
  }, [isPlaying, isMuted, currentScene, sceneRelativeTime, project.characters, playbackRate]);

  // Canvas Compositor Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentScene) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // 1. Background
    const bgUrl = getBackgroundSvgUrl(currentScene.backgroundUrl || 'forest-cottage');
    const bgImg = getImage(bgUrl);

    ctx.save();
    const sceneProgress = Math.min(1, Math.max(0, sceneRelativeTime / currentScene.duration));
    if (currentScene.cameraAngle === 'dynamic-pan') {
      const zoom = 1.04 + Math.sin(sceneProgress * Math.PI) * 0.08;
      const panX = (sceneProgress - 0.5) * 35;
      ctx.translate(width / 2, height / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-width / 2 + panX, -height / 2);
    } else if (currentScene.cameraAngle === 'close-up') {
      ctx.translate(width / 2, height / 2);
      ctx.scale(1.15, 1.15);
      ctx.translate(-width / 2, -height / 2);
    }

    if (bgImg) {
      ctx.drawImage(bgImg, 0, 0, width, height);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#064e3b');
      grad.addColorStop(1, '#022c22');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }
    ctx.restore();

    // 2. Dynamic Forest Particles
    const particles = currentScene.particleEffect || 'leaves';
    const nowSec = performance.now() / 1000;

    if (particles === 'leaves') {
      ctx.fillStyle = '#f59e0b';
      ctx.font = '22px sans-serif';
      for (let i = 0; i < 10; i++) {
        const lx = ((i * 180 + Math.sin(nowSec + i) * 60) % width);
        const ly = ((nowSec * 50 + i * 110) % height);
        ctx.fillText('🍃', lx, ly);
      }
    } else if (particles === 'butterflies') {
      ctx.font = '24px sans-serif';
      for (let i = 0; i < 6; i++) {
        const bx = ((i * 280 + Math.sin(nowSec * 2 + i) * 80) % width);
        const by = height * 0.4 + Math.sin(nowSec * 3 + i) * 60;
        ctx.fillText('🦋', bx, by);
      }
    } else if (particles === 'stars') {
      ctx.fillStyle = '#fef08a';
      for (let i = 0; i < 18; i++) {
        const px = ((i * 140) % width);
        const py = ((i * 290 + nowSec * 25) % height);
        const size = 2 + Math.sin(nowSec * 4 + i) * 1.5;
        ctx.beginPath();
        ctx.arc(px, py, Math.max(0.5, size), 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (particles === 'hearts') {
      ctx.font = '24px sans-serif';
      for (let i = 0; i < 8; i++) {
        const hx = ((i * 240 + Math.sin(nowSec + i) * 40) % width);
        const hy = height - ((nowSec * 60 + i * 120) % height);
        ctx.fillText('💖', hx, hy);
      }
    }

    // 3. Render LiLo and Mozz character models
    const charIds = currentScene.characters.length > 0
      ? currentScene.characters
      : ['char_lilo', 'char_mozz'];

    charIds.forEach((cId, idx) => {
      const char = project.characters.find(c => c.id === cId) || (cId === 'char_lilo' ? project.characters[0] : project.characters[1]);
      if (!char) return;

      const isSpeaking = activeDialogue?.char.id === char.id;
      const charImgUrl = char.avatarUrl || char.customAvatarUrl || '';
      const charImg = getImage(charImgUrl);

      // Positions: LiLo on the Left (0.35), Mozz on the Right (0.68)
      let targetX = idx === 0 ? width * 0.35 : width * 0.68;
      if (charIds.length === 1) targetX = width * 0.5;

      const baseY = height * 0.64;
      const idleFloat = Math.sin(nowSec * 3.5 + idx * 2) * 5;
      const talkBounce = isSpeaking ? Math.abs(Math.sin(nowSec * 12)) * 15 : 0;
      const charY = baseY - idleFloat - talkBounce;

      // Character size (Mozz cat is slightly smaller for realistic proportion)
      const isCat = char.id === 'char_mozz' || char.name.toLowerCase().includes('mozz');
      const scaleMultiplier = isCat ? 0.38 : 0.46;
      const charSize = Math.min(width, height) * scaleMultiplier;

      ctx.save();
      ctx.translate(targetX, charY);

      // Soft shadow
      ctx.beginPath();
      ctx.ellipse(0, charSize * 0.48, charSize * 0.35, 12, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fill();

      if (isSpeaking) {
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 24;
      }

      if (charImg) {
        ctx.drawImage(charImg, -charSize / 2, -charSize / 2, charSize, charSize);
      }

      // Name Badge
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = isSpeaking ? '#ec4899' : 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      const tagText = `${char.name} ${isCat ? '🐾' : '🌸'}`;
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

    // 4. Subtitles Overlay (LiLo & Mozz style)
    if (activeDialogue) {
      ctx.save();
      const subY = height * 0.86;
      const text = `"${activeDialogue.text}"`;

      ctx.font = 'bold 22px sans-serif';
      const measure = ctx.measureText(text);
      const boxW = Math.min(width * 0.9, measure.width + 56);
      const boxH = 56;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.strokeStyle = activeDialogue.char.id === 'char_lilo' ? '#ec4899' : '#06b6d4';
      ctx.lineWidth = 3;
      ctx.shadowColor = activeDialogue.char.id === 'char_lilo' ? 'rgba(236, 72, 153, 0.5)' : 'rgba(6, 182, 212, 0.5)';
      ctx.shadowBlur = 18;

      ctx.beginPath();
      ctx.roundRect((width - boxW) / 2, subY - boxH / 2, boxW, boxH, 20);
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, width / 2, subY);

      ctx.restore();
    }

    // 5. Scene Fade Transition
    if (sceneRelativeTime < 0.4 && currentScene.transition === 'fade') {
      const alpha = 1 - (sceneRelativeTime / 0.4);
      ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
      ctx.fillRect(0, 0, width, height);
    }
  }, [currentTime, currentScene, activeDialogue, sceneRelativeTime, project.characters]);

  const handleNextScene = () => {
    let target = 0;
    for (let i = 0; i <= currentSceneIndex; i++) {
      target += project.scenes[i].duration;
    }
    if (target < totalDuration) {
      onTimeUpdate(target);
    }
  };

  const handlePrevScene = () => {
    let target = 0;
    for (let i = 0; i < Math.max(0, currentSceneIndex - 1); i++) {
      target += project.scenes[i].duration;
    }
    onTimeUpdate(target);
  };

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

  const formatMinSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-5xl mx-auto p-4 select-none">
      {/* Aspect Ratio & Playback Controls Bar */}
      <div className="flex flex-wrap items-center justify-between w-full bg-slate-900/80 px-4 py-2.5 rounded-2xl border border-slate-800 backdrop-blur-md gap-3">
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
              <span>16:9 TV/YouTube</span>
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

        {/* Speed Multipliers & Audio */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-[10px] text-slate-400 px-1 font-bold">Speed:</span>
            {[1.0, 2.0, 4.0].map((rate) => (
              <button
                key={rate}
                onClick={() => setPlaybackRate(rate)}
                className={`px-2 py-0.5 rounded-md font-mono text-[11px] transition ${
                  playbackRate === rate ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-xl border transition ${
              isMuted ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Video Viewport Canvas */}
      <div
        ref={containerRef}
        className="relative bg-slate-950 rounded-3xl overflow-hidden border-2 border-emerald-500/30 shadow-2xl shadow-emerald-500/20 flex items-center justify-center max-w-full"
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

        {/* Overlay Navigation Controls */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-slate-950/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 opacity-90 hover:opacity-100 transition">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handlePrevScene}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Previous Scene"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={onRestart}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Restart"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onTogglePlay}
              className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-600 via-purple-600 to-pink-600 hover:from-emerald-500 hover:to-pink-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 transition active:scale-95"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
            </button>

            <button
              onClick={handleNextScene}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Next Scene"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <div className="text-xs font-mono font-bold text-emerald-300">
              {formatMinSec(currentTime)} / {formatMinSec(totalDuration)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-200 border border-emerald-500/40 font-bold truncate max-w-[200px] sm:max-w-xs">
              #{currentScene.sceneNumber}: {currentScene.title}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

VideoPlayerCanvas.displayName = 'VideoPlayerCanvas';
