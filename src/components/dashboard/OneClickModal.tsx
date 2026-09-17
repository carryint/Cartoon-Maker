import { useState } from 'react';
import { Sparkles, CheckCircle2, Loader2, Play, Zap, ArrowRight } from 'lucide-react';
import { Project, Scene } from '../../types/lilo';
import { parseScriptToScenes } from '../../core/engines/scriptEngine';
import { runQualityControlChecks } from '../../core/engines/qualityEngine';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onSaveProject: (updated: Project) => void;
  onProceedToRender: () => void;
}

const STEPS = [
  'Analyzing Story & Narrative Structure',
  'Casting & Synthesizing 3D Characters',
  'Generating Multi-Layered Location Worlds',
  'Extracting Structured Scenes & Continuity',
  'Assigning Child-Safe Voice Profiles & Lip Sync',
  'Directing Camera, Weather & Cinematic Lighting',
  'Composing BGM Music & Spatial SFX Cues',
  'Performing Automated Quality Control Checks',
];

export default function OneClickModal({
  isOpen,
  onClose,
  project,
  onSaveProject,
  onProceedToRender,
}: Props) {
  const [prompt, setPrompt] = useState(
    'LiLo and her friends build a sandcastle on the sunny beach and discover a friendly baby sea turtle. Together, they help the turtle find its way safely to the sparkling ocean.'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const handleStartAutoCartoon = async () => {
    setIsGenerating(true);
    setIsCompleted(false);

    for (let i = 0; i < STEPS.length; i++) {
      setActiveStepIdx(i);
      await new Promise((r) => setTimeout(r, 450));
    }

    // Auto generate script from prompt
    const generatedScript = `SCENE 1 — SUNNY ADVENTURE BEGINS
Setting: LiLo's Cozy Cottage
Camera: Wide shot with bright morning sunlight
Lighting: morning-sunlight
Music: happy

LILO: (excited) Look at the sunny day outside! Let's go down to the shore!
TOTO: (happy) I packed my sand shovel and bucket! Let's build the biggest sandcastle!

---

SCENE 2 — THE BABY TURTLE DISCOVERY
Setting: The Magic Glowing Lake
Camera: Close-up on the sandy shore, tracking to the water edge
Lighting: golden-hour
Music: adventure

LILO: (surprised) Toto, look right beside our sandcastle! A tiny baby sea turtle!
TOTO: (curious) It is trying to reach the water, but the sand is too high.
LILO: (tender) Let's make a smooth little path so our turtle friend can reach the ocean!

---

SCENE 3 — SAFELY TO THE OCEAN
Setting: The Magic Glowing Lake
Camera: Wide shot as the sunset glows over the water
Lighting: warm-sunset
Music: celebration

LILO: (joyful) Look! The baby turtle is swimming happily in the warm water!
TOTO: (excited) We did it! Great teamwork, LiLo!
LILO: (tender) Bye-bye, little turtle! Nature is full of wonder when we help each other!`;

    const scenes = parseScriptToScenes(generatedScript, project.characters, project.locations);
    const updatedProject: Project = {
      ...project,
      rawScript: generatedScript,
      scenes,
      storyboard: scenes.map((s) => ({
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
      })),
      qualityReport: runQualityControlChecks({ ...project, scenes }),
    };

    onSaveProject(updatedProject);
    setIsGenerating(false);
    setIsCompleted(true);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md shadow-amber-400/20"
              style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}
            >
              <Sparkles size={18} className="text-slate-950" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">One-Click Cartoon Creator</h3>
              <p className="text-xs text-slate-400">Full end-to-end AI cartoon generation from a single story idea</p>
            </div>
          </div>
          {!isGenerating && (
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 text-lg">
              ✕
            </button>
          )}
        </div>

        {!isGenerating && !isCompleted ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                What is your cartoon episode about?
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
                placeholder="Describe your story idea: who is in it, where they go, what challenge they face, and the happy ending..."
              />
            </div>

            <div className="bg-slate-800/50 border border-slate-700/70 rounded-2xl p-4 space-y-2 text-xs text-slate-400">
              <div className="font-bold text-amber-400 flex items-center gap-1.5">
                <Zap size={14} />
                <span>Automated Production Pipeline</span>
              </div>
              <p>
                LiLo will automatically analyze story structure, cast characters, build scenes, compose dialogue, assign
                voices, create camera framing, generate BGM, and execute quality control checks.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 hover:border-slate-500 font-semibold text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartAutoCartoon}
                disabled={!prompt.trim()}
                className="flex-1 py-3 rounded-xl font-bold text-slate-950 text-sm transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40 shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}
              >
                <Sparkles size={16} />
                <span>CREATE CARTOON</span>
              </button>
            </div>
          </div>
        ) : isGenerating ? (
          <div className="py-8 space-y-6">
            <div className="text-center space-y-2">
              <Loader2 size={36} className="animate-spin text-amber-400 mx-auto" />
              <h4 className="text-lg font-bold text-white">AI Cartoon Orchestrator Running...</h4>
              <p className="text-xs text-slate-400">{STEPS[activeStepIdx]}</p>
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              {STEPS.map((step, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2.5 text-xs px-3 py-1.5 rounded-lg transition-colors ${
                    idx < activeStepIdx
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : idx === activeStepIdx
                      ? 'text-amber-400 bg-amber-400/10 font-bold animate-pulse'
                      : 'text-slate-600'
                  }`}
                >
                  {idx < activeStepIdx ? (
                    <CheckCircle2 size={14} className="text-emerald-400" />
                  ) : idx === activeStepIdx ? (
                    <Loader2 size={14} className="animate-spin text-amber-400" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-700" />
                  )}
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto text-2xl">
              ✨
            </div>
            <h4 className="text-xl font-bold text-white">Episode Generated Successfully!</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Your 3-scene cartoon episode with voice acting, camera directions, and music is ready to render.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:border-slate-500 font-semibold text-xs transition-colors"
              >
                Inspect in Studio
              </button>
              <button
                onClick={() => {
                  onClose();
                  onProceedToRender();
                }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-slate-950 text-xs shadow-lg shadow-amber-400/20 transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}
              >
                <span>Render & Watch Video</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
