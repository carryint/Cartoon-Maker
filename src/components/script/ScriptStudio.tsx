import { useState } from 'react';
import { FileText, Wand2, Sparkles, CheckCircle2, List, Clock, Video } from 'lucide-react';
import { Project, Scene } from '../../types/lilo';
import { parseScriptToScenes } from '../../core/engines/scriptEngine';
import { runQualityControlChecks } from '../../core/engines/qualityEngine';

interface Props {
  project: Project;
  onUpdateProject: (updated: Partial<Project>) => void;
  onProceedToStoryboard: () => void;
}

export default function ScriptStudio({ project, onUpdateProject, onProceedToStoryboard }: Props) {
  const [scriptText, setScriptText] = useState(project.rawScript);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyzeScript = async () => {
    if (!scriptText.trim()) return;
    setIsAnalyzing(true);
    await new Promise((r) => setTimeout(r, 600));

    const parsedScenes = parseScriptToScenes(scriptText, project.characters, project.locations);
    const updatedStoryboard = parsedScenes.map((s) => ({
      sceneId: s.id,
      sceneNumber: s.sceneNumber,
      title: s.title,
      description: s.description,
      characterNames: s.characterIds.map((cId) => project.characters.find((c) => c.id === cId)?.name || 'Character'),
      locationName: project.locations.find((l) => l.id === s.locationId)?.name || 'Location',
      dialogueCount: s.dialogues.length,
      duration: s.duration,
      camera: s.camera.shot,
      isApproved: true,
    }));

    const qc = runQualityControlChecks({ ...project, rawScript: scriptText, scenes: parsedScenes });

    onUpdateProject({
      rawScript: scriptText,
      scenes: parsedScenes,
      storyboard: updatedStoryboard,
      qualityReport: qc,
    });

    setIsAnalyzing(false);
  };

  const totalDuration = project.scenes.reduce((sum, s) => sum + s.duration, 0);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <FileText size={26} className="text-amber-400" />
            <span>Script Studio & AI Screenplay Analyzer</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Write your cartoon screenplay. The AI Analyzer automatically breaks it down into structured scenes,
            dialogue tracks, camera cues, and lighting moods.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAnalyzeScript}
            disabled={!scriptText.trim() || isAnalyzing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-slate-950 text-sm shadow-lg shadow-amber-400/20 transition-all hover:scale-105 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}
          >
            <Wand2 size={16} className={isAnalyzing ? 'animate-spin' : ''} />
            <span>{isAnalyzing ? 'Analyzing Script...' : 'Analyze & Build Scenes'}</span>
          </button>

          {project.scenes.length > 0 && (
            <button
              onClick={onProceedToStoryboard}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-semibold transition-colors"
            >
              <span>View Storyboard ({project.scenes.length})</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Screenplay Editor */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-bold uppercase tracking-wider">Screenplay Editor</span>
            <span>{scriptText.split('\n').length} lines</span>
          </div>

          <textarea
            value={scriptText}
            onChange={(e) => setScriptText(e.target.value)}
            rows={16}
            placeholder={`SCENE 1 — MORNING AT THE COTTAGE\nSetting: LiLo's Cozy Cottage\nCamera: Wide shot with golden morning sunlight\nLighting: morning-sunlight\nMusic: happy\n\nLILO: (excited) Good morning, world! Look at the sunny sky!\nTOTO: (happy) Let's go explore the Magic Lake!`}
            className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400/60 rounded-2xl p-5 text-white font-mono text-sm leading-relaxed resize-none focus:outline-none transition-colors"
          />

          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl text-xs text-slate-400 space-y-2">
            <div className="font-bold text-amber-400 uppercase tracking-wider">Script Format Quick Reference:</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div>
                <span className="text-white font-mono">SCENE 1 — TITLE</span>
                <br />
                Starts a new scene.
              </div>
              <div>
                <span className="text-white font-mono">Setting: Location</span>
                <br />
                Matches Location DNA.
              </div>
              <div>
                <span className="text-white font-mono">NAME: (emotion) text</span>
                <br />
                Dialogue & voice actor cue.
              </div>
            </div>
          </div>
        </div>

        {/* Structured Scene Breakdown Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-bold uppercase tracking-wider">Structured Breakdown</span>
            <span>{project.scenes.length} Scenes</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 max-h-[540px] overflow-y-auto">
            {project.scenes.map((scene) => (
              <div key={scene.id} className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">
                    Scene {scene.sceneNumber}: {scene.title}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30">
                    {Math.round(scene.duration)}s
                  </span>
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span className="capitalize">{scene.camera.shot}</span> •{' '}
                  <span className="capitalize">{scene.lighting.replace('-', ' ')}</span>
                </div>

                <div className="text-xs text-slate-300 space-y-1 pt-1 border-t border-slate-700/60">
                  {scene.dialogues.map((d) => {
                    const speaker = project.characters.find((c) => c.id === d.characterId);
                    return (
                      <div key={d.id} className="truncate">
                        <span className="font-bold" style={{ color: speaker?.primaryColor || '#fbbf24' }}>
                          {speaker?.name || 'Character'}:
                        </span>{' '}
                        <span className="italic text-slate-400">({d.emotion})</span> {d.text}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {project.scenes.length === 0 && (
              <div className="py-12 text-center text-slate-500">
                <List size={36} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs">Click "Analyze & Build Scenes" to generate structured production scenes.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
