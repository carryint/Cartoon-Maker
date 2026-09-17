import { Sparkles, Camera, Sun, Music, Volume2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Project } from '../../types/lilo';

interface Props {
  project: Project;
  onProceedToStoryboard: () => void;
  onProceedToRender: () => void;
}

export default function AIDirectorStudio({ project, onProceedToStoryboard, onProceedToRender }: Props) {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Sparkles size={26} className="text-amber-400" />
            <span>AI Director & Production Orchestration</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Central intelligence orchestrating character kinematics, camera framing, lighting moods, and musical cues.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onProceedToStoryboard}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            Inspect Storyboard
          </button>
          <button
            onClick={onProceedToRender}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-slate-950 text-xs shadow-lg shadow-amber-400/20 transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}
          >
            <span>Launch Render Studio</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Production Directive Cards */}
      <div className="space-y-5">
        {project.scenes.map((scene) => {
          const loc = project.locations.find((l) => l.id === scene.locationId);
          const chars = project.characters.filter((c) => scene.characterIds.includes(c.id));

          return (
            <div
              key={scene.id}
              className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl hover:border-amber-400/30 transition-all"
            >
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Scene {scene.sceneNumber} Production Blueprint
                  </div>
                  <h3 className="text-xl font-bold text-white mt-0.5">{scene.title}</h3>
                  <div className="text-xs text-slate-400 mt-1">
                    Location: <strong>{loc?.name || 'Storybook World'}</strong> • Duration: {Math.round(scene.duration)}s
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                    {scene.camera.shot} Shot
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Approved
                  </span>
                </div>
              </div>

              {/* Directing Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {/* Camera & Lighting */}
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
                    <Camera size={14} />
                    <span>Camera & Lighting</span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1">
                    <div>Framing: <strong className="capitalize">{scene.camera.shot}</strong></div>
                    <div>Motion: <span className="text-slate-400">{scene.camera.movement}</span></div>
                    <div>Lighting: <strong className="capitalize">{scene.lighting.replace('-', ' ')}</strong></div>
                  </div>
                </div>

                {/* Audio & Ducking */}
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                    <Music size={14} />
                    <span>Music & SFX Directives</span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1">
                    <div>BGM Mood: <strong className="capitalize">{scene.music.mood}</strong></div>
                    <div>Audio Ducking: <strong className="text-emerald-400">Active ({Math.round(scene.music.duckAmount * 100)}%)</strong></div>
                    <div>SFX Cues: <span className="text-slate-400">{scene.soundEffects.length} cues</span></div>
                  </div>
                </div>

                {/* Cast & Dialogue */}
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-pink-400">
                    <Volume2 size={14} />
                    <span>Cast & Lip Sync</span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1">
                    <div>Actors on Stage: <strong>{chars.length} characters</strong></div>
                    <div>Dialogue Lines: <strong>{scene.dialogues.length} lines</strong></div>
                    <div>Lip Sync Visemes: <strong className="text-emerald-400">Auto-mapped</strong></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
