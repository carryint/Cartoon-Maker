import { useState, useRef } from 'react';
import {
  Clapperboard,
  CheckCircle2,
  RefreshCw,
  Play,
  ArrowRight,
  Sparkles,
  Camera,
  Sun,
  Volume2,
} from 'lucide-react';
import { Project, Scene } from '../../types/lilo';
import { drawLocationEnvironment } from '../../core/engines/locationEngine';
import { drawRiggedCharacter } from '../../core/engines/characterEngine';

interface Props {
  project: Project;
  onUpdateScenes: (scenes: Scene[]) => void;
  onProceedToTimeline: () => void;
  onProceedToRender: () => void;
}

function StoryboardCardPreview({ scene, project }: { scene: Scene; project: Project }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useState(() => {
    let animId: number;
    const render = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const loc = project.locations.find((l) => l.id === scene.locationId);
          const chars = project.characters.filter((c) => scene.characterIds.includes(c.id));

          drawLocationEnvironment(
            ctx,
            canvas.width,
            canvas.height,
            loc,
            scene.lighting,
            scene.weather,
            performance.now() / 1000
          );

          const charW = Math.min(canvas.width * 0.26, canvas.height * 0.6);
          const charH = charW * 1.3;
          const spacing = canvas.width / (Math.max(1, chars.length) + 1);

          chars.forEach((c, idx) => {
            const cx = spacing * (idx + 1) - charW / 2;
            const cy = canvas.height * 0.52 - charH * 0.5;
            drawRiggedCharacter(ctx, c, cx, cy, charW, charH, {
              time: performance.now() / 1000,
              isTalking: false,
              emotion: 'happy',
              pose: 'standing',
            });
          });
        }
      }
      animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  });

  return (
    <div className="relative h-44 bg-slate-950 overflow-hidden border-b border-slate-800">
      <canvas ref={canvasRef} width={360} height={180} className="w-full h-full object-cover" />
      <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[11px] font-bold text-amber-300">
        <Camera size={11} />
        <span className="capitalize">{scene.camera.shot} Shot</span>
      </div>
      <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[11px] text-slate-300">
        <Sun size={11} className="text-amber-400" />
        <span className="capitalize">{scene.lighting.replace('-', ' ')}</span>
      </div>
    </div>
  );
}

export default function StoryboardStudio({
  project,
  onUpdateScenes,
  onProceedToTimeline,
  onProceedToRender,
}: Props) {
  const handleToggleApproval = (sceneId: string) => {
    onUpdateScenes(
      project.scenes.map((s) => (s.id === sceneId ? { ...s, isApproved: !s.isApproved } : s))
    );
  };

  const handleApproveAll = () => {
    onUpdateScenes(project.scenes.map((s) => ({ ...s, isApproved: true })));
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Clapperboard size={26} className="text-purple-400" />
            <span>Storyboard & Scene Director</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Review visual staging, approve scene keyframes, and inspect camera directions before final 4K rendering.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleApproveAll}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
          >
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>Approve All Scenes</span>
          </button>

          <button
            onClick={onProceedToTimeline}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <span>Multi-Track Timeline</span>
          </button>

          <button
            onClick={onProceedToRender}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-slate-950 text-xs shadow-lg shadow-amber-400/20 transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}
          >
            <span>Proceed to 4K Render</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Storyboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {project.scenes.map((scene) => {
          const loc = project.locations.find((l) => l.id === scene.locationId);
          return (
            <div
              key={scene.id}
              className={`bg-slate-900 border rounded-3xl overflow-hidden transition-all duration-300 shadow-xl flex flex-col justify-between ${
                scene.isApproved ? 'border-emerald-500/40 hover:border-emerald-500/70' : 'border-amber-500/40'
              }`}
            >
              <div>
                <StoryboardCardPreview scene={scene} project={project} />

                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-amber-400">Scene {scene.sceneNumber}</span>
                      <h4 className="text-lg font-bold text-white leading-tight">{scene.title}</h4>
                      <div className="text-xs text-slate-400 mt-0.5">Location: {loc?.name || 'Location'}</div>
                    </div>

                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {Math.round(scene.duration)}s
                    </span>
                  </div>

                  {/* Dialogue list preview */}
                  <div className="p-3 bg-slate-800/60 rounded-xl space-y-1 text-xs">
                    {scene.dialogues.map((d) => {
                      const speaker = project.characters.find((c) => c.id === d.characterId);
                      return (
                        <div key={d.id} className="truncate">
                          <span className="font-bold" style={{ color: speaker?.primaryColor || '#fbbf24' }}>
                            {speaker?.name || 'Character'}:
                          </span>{' '}
                          <span className="text-slate-300">{d.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Approval Gate Footer */}
              <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => handleToggleApproval(scene.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    scene.isApproved
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-400 text-slate-950 font-bold'
                  }`}
                >
                  <CheckCircle2 size={13} />
                  <span>{scene.isApproved ? 'Approved for Render' : 'Click to Approve'}</span>
                </button>
              </div>
            </div>
          );
        })}

        {project.scenes.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-500">
            <Clapperboard size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-base text-slate-400 font-semibold">No Storyboard Scenes Available</p>
            <p className="text-xs text-slate-500 mt-1">
              Go to Script Studio to write and analyze your screenplay, or use One-Click Cartoon Mode.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
