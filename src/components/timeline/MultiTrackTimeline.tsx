import React, { useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, Music, Sparkles, Layers, MessageSquare, ZoomIn, ZoomOut, Film } from 'lucide-react';
import { Project, Scene, Character } from '../../types/cartoon';

interface MultiTrackTimelineProps {
  project: Project;
  currentTime: number;
  isPlaying: boolean;
  onSeek: (time: number) => void;
  onTogglePlay: () => void;
  onRestart: () => void;
}

export const MultiTrackTimeline: React.FC<MultiTrackTimelineProps> = ({
  project,
  currentTime,
  isPlaying,
  onSeek,
  onTogglePlay,
  onRestart,
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = React.useState(30); // pixels per second

  // Calculate total project duration
  const totalDuration = Math.max(1, project.scenes.reduce((acc, s) => acc + s.duration, 0));

  // Compute start and end times for each scene
  const sceneTimeRanges: { scene: Scene; start: number; end: number }[] = [];
  let accumTime = 0;
  project.scenes.forEach(s => {
    sceneTimeRanges.push({
      scene: s,
      start: accumTime,
      end: accumTime + s.duration,
    });
    accumTime += s.duration;
  });

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left + timelineRef.current.scrollLeft;
    const seekTime = Math.max(0, Math.min(totalDuration, clickX / zoomLevel));
    onSeek(seekTime);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  const totalWidth = Math.max(800, totalDuration * zoomLevel);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 flex flex-col gap-4 shadow-2xl">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        {/* Playback Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onRestart}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            title="Rewind to start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePlay}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-purple-500/30 transition active:scale-95"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
            <span>{isPlaying ? 'Pause Timeline' : 'Play Timeline'}</span>
          </button>

          {/* Time Counter */}
          <div className="bg-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-800 font-mono text-xs font-bold text-purple-300">
            <span>{formatTime(currentTime)}</span>
            <span className="text-slate-500"> / </span>
            <span className="text-slate-400">{formatTime(totalDuration)}</span>
          </div>
        </div>

        {/* Zoom & Track Info */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomLevel(prev => Math.max(15, prev - 5))}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-900 rounded-lg border border-slate-800"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[11px] text-slate-400 font-mono px-1">{zoomLevel}px/s</span>
          <button
            onClick={() => setZoomLevel(prev => Math.min(60, prev + 5))}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-900 rounded-lg border border-slate-800"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Timeline Layout */}
      <div className="grid grid-cols-12 gap-0 border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-900/40">
        {/* Track Headers (Left 2 cols) */}
        <div className="col-span-3 sm:col-span-2 border-r border-slate-800/80 bg-slate-950/80 divide-y divide-slate-800/60 text-xs font-semibold select-none">
          <div className="h-8 px-3 flex items-center text-slate-400 text-[10px] uppercase tracking-wider">Tracks</div>
          <div className="h-14 px-3 flex items-center gap-2 text-purple-300">
            <Film className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Scenes</span>
          </div>
          {project.characters.map((c) => (
            <div key={c.id} className="h-12 px-3 flex items-center gap-2 text-pink-300">
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{c.name}</span>
            </div>
          ))}
          <div className="h-10 px-3 flex items-center gap-2 text-amber-300">
            <Volume2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Sound FX</span>
          </div>
          <div className="h-10 px-3 flex items-center gap-2 text-emerald-300">
            <Music className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">BGM Music</span>
          </div>
        </div>

        {/* Scrollable Tracks Canvas (Right 10 cols) */}
        <div
          ref={timelineRef}
          onClick={handleTimelineClick}
          className="col-span-9 sm:col-span-10 overflow-x-auto relative cursor-pointer select-none divide-y divide-slate-800/60 bg-slate-950/40"
        >
          {/* Playhead Red Needle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 pointer-events-none transition-all duration-75 shadow-[0_0_10px_rgba(239,68,68,0.8)]"
            style={{ left: `${currentTime * zoomLevel}px` }}
          >
            <div className="w-3 h-3 bg-red-500 rotate-45 -translate-x-1.5 -translate-y-1 shadow-md" />
          </div>

          {/* Time Ruler (Height 8 = 32px) */}
          <div className="h-8 relative bg-slate-900/60" style={{ width: `${totalWidth}px` }}>
            {Array.from({ length: Math.ceil(totalDuration) + 1 }).map((_, sec) => (
              <div
                key={sec}
                className="absolute top-0 bottom-0 border-l border-slate-800/60 text-[9px] font-mono text-slate-500 pl-1 pt-1"
                style={{ left: `${sec * zoomLevel}px` }}
              >
                {sec % 5 === 0 ? `${sec}s` : '•'}
              </div>
            ))}
          </div>

          {/* Track 1: Scenes & Visuals (Height 14 = 56px) */}
          <div className="h-14 relative bg-slate-900/20" style={{ width: `${totalWidth}px` }}>
            {sceneTimeRanges.map(({ scene, start, end }) => {
              const width = (end - start) * zoomLevel;
              const left = start * zoomLevel;
              const isCurrent = currentTime >= start && currentTime < end;

              return (
                <div
                  key={scene.id}
                  className={`absolute top-1 bottom-1 rounded-xl px-2 py-1 border flex flex-col justify-between overflow-hidden transition ${
                    isCurrent
                      ? 'bg-purple-900/50 border-purple-400 shadow-md shadow-purple-500/20'
                      : 'bg-purple-950/30 border-purple-500/30 hover:bg-purple-900/30'
                  }`}
                  style={{ left: `${left}px`, width: `${width}px` }}
                >
                  <div className="text-[11px] font-bold text-white truncate flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-purple-600 text-[9px] flex items-center justify-center shrink-0">
                      {scene.sceneNumber}
                    </span>
                    <span>{scene.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] text-purple-300">
                    <span className="bg-purple-900/80 px-1 rounded">{scene.cameraAngle}</span>
                    <span className="bg-indigo-900/80 px-1 rounded">{scene.transition}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Track 2+: Character Dialogues (Height 12 = 48px each) */}
          {project.characters.map((char) => (
            <div key={char.id} className="h-12 relative bg-slate-900/10" style={{ width: `${totalWidth}px` }}>
              {sceneTimeRanges.map(({ scene, start }) => {
                return scene.dialogues
                  .filter(d => d.characterId === char.id)
                  .map(dlg => {
                    const dlgLeft = (start + dlg.startTime) * zoomLevel;
                    const dlgWidth = Math.max(60, dlg.duration * zoomLevel);
                    const isSpeaking = currentTime >= start + dlg.startTime && currentTime < start + dlg.startTime + dlg.duration;

                    return (
                      <div
                        key={dlg.id}
                        className={`absolute top-1 bottom-1 rounded-xl px-2 py-0.5 border flex items-center gap-1.5 overflow-hidden transition ${
                          isSpeaking
                            ? 'bg-pink-600/60 border-pink-400 shadow-lg shadow-pink-500/30 scale-102'
                            : 'bg-pink-950/40 border-pink-500/30 hover:bg-pink-900/30'
                        }`}
                        style={{ left: `${dlgLeft}px`, width: `${dlgWidth}px` }}
                      >
                        <span className="text-[10px] capitalize px-1 rounded bg-pink-900/80 text-pink-200 font-bold shrink-0">
                          {dlg.emotion}
                        </span>
                        <span className="text-[10px] text-slate-200 truncate">{dlg.text}</span>
                      </div>
                    );
                  });
              })}
            </div>
          ))}

          {/* Track SFX (Height 10 = 40px) */}
          <div className="h-10 relative bg-slate-900/20" style={{ width: `${totalWidth}px` }}>
            {sceneTimeRanges.map(({ scene, start }) => {
              if (scene.sfx === 'none') return null;
              const sfxPos = (start + (scene.sfxTime || 1.0)) * zoomLevel;
              return (
                <div
                  key={`sfx_${scene.id}`}
                  className="absolute top-1.5 px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 rounded-lg text-[10px] font-bold text-amber-300 flex items-center gap-1 shadow-sm"
                  style={{ left: `${sfxPos}px` }}
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span className="capitalize">{scene.sfx}</span>
                </div>
              );
            })}
          </div>

          {/* Track BGM (Height 10 = 40px) */}
          <div className="h-10 relative bg-slate-900/30" style={{ width: `${totalWidth}px` }}>
            <div
              className="absolute top-1.5 bottom-1.5 left-0 right-0 rounded-xl bg-emerald-950/40 border border-emerald-500/30 px-3 flex items-center justify-between text-emerald-300 text-[10px] font-bold"
              style={{ width: `${totalDuration * zoomLevel}px` }}
            >
              <div className="flex items-center gap-1.5">
                <Music className="w-3 h-3" />
                <span className="capitalize">BGM Loop: {project.bgm}</span>
              </div>
              <div className="opacity-60 font-mono text-[9px]">Continuous procedural synth track</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
