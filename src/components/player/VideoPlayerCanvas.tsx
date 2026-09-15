import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Smartphone, Monitor, Square, SkipForward, SkipBack, Sparkles } from 'lucide-react';
import { Project, Scene, Character, AspectRatio, CharacterEmotion } from '../../types/cartoon';
import { getBackgroundSvgUrl } from '../../services/backgroundGenerator';
import { soundSynthesizer } from '../../services/soundSynthesizer';
import { speechSynthesizer } from '../../services/speechSynthesizer';
import { LivingAnimationEngine, CharacterChoreography } from '../../services/livingAnimationEngine';
import { LivingBackgroundEngine } from '../../services/livingBackgroundEngine';

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

  // BGM playback sync
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

  // Main animation timer with speed scaling
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

    // Trigger SFX
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

    // Trigger Dialogue Speech
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

  // Canvas Compositor Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentScene) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const nowTime = currentTime;

    ctx.clearRect(0, 0, width, height);

    // 1. Dynamic Camera Directing based on Scene
    ctx.save();
    const sceneProgress = Math.min(1, Math.max(0, sceneRelativeTime / currentScene.duration));
    if (currentScene.cameraAngle === 'dynamic-pan') {
      const zoom = 1.05 + Math.sin(sceneProgress * Math.PI) * 0.08;
      const panX = (sceneProgress - 0.5) * (width * 0.05);
      ctx.translate(width / 2, height / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-width / 2 + panX, -height / 2);
    } else if (currentScene.cameraAngle === 'close-up') {
      ctx.translate(width / 2, height / 2);
      ctx.scale(1.18, 1.18);
      ctx.translate(-width / 2, -height / 2);
    } else if (currentScene.cameraAngle === 'wide-shot') {
      const slowDrift = Math.sin(sceneProgress * Math.PI) * (width * 0.02);
      ctx.translate(slowDrift, 0);
    }

    // 2. Render Living Multi-Layer Forest Environment
    const bgUrl = getBackgroundSvgUrl(currentScene.backgroundUrl || 'forest-cottage');
    const bgImg = getImage(bgUrl);
    const envType = currentScene.backgroundUrl?.includes('stream') 
      ? 'river-stream' 
      : currentScene.backgroundUrl?.includes('cottage') 
      ? 'forest-cottage' 
      : 'forest-cottage';

    LivingBackgroundEngine.renderLivingForest(ctx, bgImg, width, height, nowTime, envType);
    ctx.restore();

    // 3. Script-Driven Scene Choreography for Characters
    const sceneTitle = currentScene.title.toLowerCase();
    const isForestTipScene = currentScene.act?.includes('Forest Tip') || sceneTitle.includes('tip') || sceneTitle.includes('celebration');
    const isExplorationScene = currentScene.act?.includes('Exploration') || sceneTitle.includes('morning') || sceneTitle.includes('path');
    const isEncounterScene = currentScene.act?.includes('Need') || sceneTitle.includes('meeting') || sceneTitle.includes('lost');

    // LiLo Choreography
    const liloSpeaking = activeDialogue?.char.id === 'char_lilo' || activeDialogue?.char.name.toLowerCase().includes('lilo') || false;
    let liloAction: CharacterChoreography['action'] = isForestTipScene ? 'waving' : isExplorationScene ? 'walking' : isEncounterScene ? 'crouching' : liloSpeaking ? 'talking' : 'idle';
    let liloFacing: 'right' | 'left' = 'right';

    // Walk across path calculation in exploration scenes
    let liloX = width * 0.34;
    if (isExplorationScene) {
      liloX = width * 0.22 + (sceneProgress * width * 0.22);
    } else if (isForestTipScene) {
      liloX = width * 0.40;
    }

    const liloY = height * 0.63;
    const liloSize = Math.min(width, height) * 0.45;
    const liloChar = project.characters.find(c => c.id === 'char_lilo') || project.characters[0];
    const liloImg = getImage(liloChar?.customAvatarUrl || liloChar?.avatarUrl || '/assets/lilo_mozz/lilo_sprite.png');

    LivingAnimationEngine.drawMovingLiLo(
      ctx,
      liloImg,
      liloX,
      liloY,
      liloSize,
      nowTime,
      liloSpeaking,
      activeDialogue?.emotion || 'happy',
      { action: liloAction, facing: liloFacing, targetX: 0.35, stageY: 0.65 }
    );

    // Mozz Choreography
    const mozzSpeaking = activeDialogue?.char.id === 'char_mozz' || activeDialogue?.char.name.toLowerCase().includes('mozz') || false;
    let mozzAction: CharacterChoreography['action'] = isForestTipScene ? 'excited-jump' : isExplorationScene ? 'walking' : mozzSpeaking ? 'talking' : 'idle';
    let mozzFacing: 'right' | 'left' = isForestTipScene ? 'right' : 'left';

    let mozzX = width * 0.68;
    if (isExplorationScene) {
      mozzX = width * 0.55 + (sceneProgress * width * 0.2);
      mozzFacing = 'right';
    } else if (isForestTipScene) {
      mozzX = width * 0.66;
    }

    const mozzY = height * 0.67;
    const mozzSize = Math.min(width, height) * 0.38;
    const mozzChar = project.characters.find(c => c.id === 'char_mozz') || project.characters[1] || project.characters[0];
    const mozzImg = getImage(mozzChar?.customAvatarUrl || mozzChar?.avatarUrl || '/assets/lilo_mozz/mozz_portrait.jpg');

    LivingAnimationEngine.drawMovingMozz(
      ctx,
      mozzImg,
      mozzX,
      mozzY,
      mozzSize,
      nowTime,
      mozzSpeaking,
      activeDialogue?.emotion || 'happy',
      { action: mozzAction, facing: mozzFacing, targetX: 0.68, stageY: 0.67 }
    );

    // 4. Animal Friend Overlay (if in scene)
    if (project.animalFriend && isEncounterScene) {
      ctx.save();
      const animalX = width * 0.52;
      const animalY = height * 0.72 + Math.sin(nowTime * 4) * 4;
      ctx.font = '54px sans-serif';
      ctx.fillText(project.animalFriend.icon, animalX, animalY);

      // Animal Speech / Glow
      ctx.beginPath();
      ctx.arc(animalX + 25, animalY - 20, 36, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(254, 240, 138, 0.25)';
      ctx.fill();
      ctx.restore();
    }

    // 5. Living Subtitles Overlay
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

    // 6. Act Watermark & Forest Tip Badge
    if (isForestTipScene) {
      ctx.save();
      ctx.fillStyle = 'rgba(16, 185, 129, 0.9)';
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(width * 0.04, height * 0.06, 260, 44, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('🌿 LiLo\'s Forest Tip for Kids', width * 0.04 + 16, height * 0.06 + 22);
      ctx.restore();
    }

    // 7. Scene Fade In
    if (sceneRelativeTime < 0.4 && currentScene.transition === 'fade') {
      const alpha = 1 - (sceneRelativeTime / 0.4);
      ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
      ctx.fillRect(0, 0, width, height);
    }
  }, [currentTime, currentScene, activeDialogue, sceneRelativeTime, project.characters, project.animalFriend]);

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
      {/* Top Toolbar */}
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

        {/* Speed & Live Status */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-[10px] text-emerald-400 px-1 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Live View</span>
            </span>
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
        className="relative bg-slate-950 rounded-3xl overflow-hidden border-2 border-emerald-500/40 shadow-2xl shadow-emerald-500/20 flex items-center justify-center max-w-full"
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
            <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-200 border border-emerald-500/40 font-bold truncate max-w-[220px] sm:max-w-xs">
              #{currentScene.sceneNumber}: {currentScene.title}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

VideoPlayerCanvas.displayName = 'VideoPlayerCanvas';
