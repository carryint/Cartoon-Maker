import { useState } from 'react';
import { Sliders, Play, Pause, Volume2, VolumeX, Eye, Lock, Sparkles, Clock } from 'lucide-react';
import { Project } from '../../types/lilo';

interface Props {
  project: Project;
  onProceedToRender: () => void;
}

export default function MultiTrackTimeline({ project, onProceedToRender }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const totalDuration = Math.max(10, project.scenes.reduce((sum, s) => sum + s.duration, 0));
  const timeScale = 18; // pixels per second

  const tracks = [
    {
      id: 'track_video',
      label: '🎬 Video / Scenes',
      color: '#a855f7',
      clips: project.scenes.map((s, idx) => {
        const start = project.scenes.slice(0, idx).reduce((sum, sc) => sum + sc.duration, 0);
        return { id: s.id, title: `Scene ${s.sceneNumber}: ${s.title}`, start, duration: s.duration, color: '#9333ea' };
      }),
    },
    {
      id: 'track_dialogue',
      label: '🎙️ Voice & Dialogue',
      color: '#ec4899',
      clips: project.scenes.flatMap((s, sIdx) => {
        const sceneStart = project.scenes.slice(0, sIdx).reduce((sum, sc) => sum + sc.duration, 0);
        return s.dialogues.map((d) => {
          const speaker = project.characters.find((c) => c.id === d.characterId);
          return {
            id: d.id,
            title: `${speaker?.name || 'Char'}: "${d.text.slice(0, 18)}..."`,
            start: sceneStart + d.startOffset,
            duration: d.duration,
            color: '#db2777',
          };
        });
      }),
    },
    {
      id: 'track_music',
      label: '🎵 BGM Music (Auto-Duck)',
      color: '#3b82f6',
      clips: project.scenes.map((s, idx) => {
        const start = project.scenes.slice(0, idx).reduce((sum, sc) => sum + sc.duration, 0);
        return { id: `bgm_${s.id}`, title: `${s.music.title} (${s.music.mood})`, start, duration: s.duration, color: '#2563eb' };
      }),
    },
    {
      id: 'track_sfx',
      label: '🔊 Sound Effects (SFX)',
      color: '#10b981',
      clips: project.scenes.flatMap((s, sIdx) => {
        const sceneStart = project.scenes.slice(0, sIdx).reduce((sum, sc) => sum + sc.duration, 0);
        return s.soundEffects.map((sfx) => ({
          id: sfx.id,
          title: `SFX: ${sfx.name}`,
          start: sceneStart + sfx.startTime,
          duration: sfx.duration,
          color: '#059669',
        }));
      }),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Sliders size={26} className="text-blue-400" />
            <span>Multi-Track Production Timeline</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Sequenced timeline with automated audio ducking, synchronized dialogues, camera cues, and sound effects.
          </p>
        </div>

        <button
          onClick={onProceedToRender}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-slate-950 text-sm shadow-lg shadow-amber-400/20 transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}
        >
          <Play size={16} />
          <span>Launch 4K Player & Renderer</span>
        </button>
      </div>

      {/* Timeline Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition-all shadow"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <div className="text-xs font-mono text-slate-300">
              <span className="font-bold text-amber-400">{currentTime.toFixed(1)}s</span> / {totalDuration.toFixed(1)}s
            </div>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-3">
            <span>Audio Ducking: <strong className="text-emerald-400">Active</strong></span>
            <span>FPS: <strong className="text-white">{project.fps || 30}</strong></span>
            <span>Resolution: <strong className="text-white">{project.resolution || '1080p'}</strong></span>
          </div>
        </div>

        {/* Timeline Tracks Grid */}
        <div className="space-y-3 overflow-x-auto py-2">
          {/* Time Ruler */}
          <div className="flex items-center">
            <div className="w-48 flex-shrink-0 text-xs text-slate-500 font-bold">TRACKS</div>
            <div className="relative h-6 flex-1 min-w-[600px] border-b border-slate-800 text-[10px] font-mono text-slate-500">
              {Array.from({ length: Math.ceil(totalDuration / 5) + 1 }).map((_, i) => (
                <div key={i} className="absolute" style={{ left: `${i * 5 * timeScale}px` }}>
                  <span>{i * 5}s</span>
                  <div className="h-2 border-l border-slate-700 mt-1" />
                </div>
              ))}
            </div>
          </div>

          {/* Tracks */}
          {tracks.map((track) => (
            <div key={track.id} className="flex items-center group">
              <div className="w-48 flex-shrink-0 flex items-center justify-between pr-4">
                <span className="text-xs font-bold text-slate-300 truncate">{track.label}</span>
              </div>

              <div
                className="relative h-12 flex-1 min-w-[600px] bg-slate-950/80 border border-slate-800/80 rounded-xl overflow-hidden cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  setCurrentTime(Math.max(0, Math.min(totalDuration, clickX / timeScale)));
                }}
              >
                {track.clips.map((clip) => (
                  <div
                    key={clip.id}
                    className="absolute top-1 bottom-1 rounded-lg px-2 flex items-center text-[11px] font-semibold text-white truncate shadow border border-white/20"
                    style={{
                      left: `${clip.start * timeScale}px`,
                      width: `${Math.max(24, clip.duration * timeScale)}px`,
                      background: clip.color,
                    }}
                    title={`${clip.title} (${Math.round(clip.duration)}s)`}
                  >
                    <span className="truncate">{clip.title}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
