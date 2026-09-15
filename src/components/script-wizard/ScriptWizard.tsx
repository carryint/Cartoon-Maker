import React, { useState } from 'react';
import { Sparkles, Wand2, FileText, Film, RefreshCw, Layers, CheckCircle2, MessageSquare, Clock, Trees } from 'lucide-react';
import { Project, AISettings, AnimalFriend } from '../../types/cartoon';
import { generateLiLoMozzEpisode } from '../../services/liloMozzEngine';
import { parseUserScreenplay } from '../../services/aiPipeline';
import { ANIMAL_FRIENDS } from '../../data/liloMozzDefaults';

interface ScriptWizardProps {
  project: Project;
  onUpdateProject: (updater: (prev: Project) => Project) => void;
  aiSettings: AISettings;
  onNavigateToStoryboard: () => void;
}

const EPISODE_DURATIONS = [
  { minutes: 2, label: '2 Minutes', desc: 'Mini Web Episode (~10 scenes)' },
  { minutes: 3, label: '3 Minutes', desc: 'Quick Cartoon Adventure (~15 scenes)' },
  { minutes: 5, label: '5 Minutes', desc: 'Standard TV Episode (~25 scenes)' },
  { minutes: 10, label: '10 Minutes', desc: 'Extended Nature Arc (~45 scenes)' },
  { minutes: 15, label: '15 Minutes', desc: 'Full Forest Adventure (~65 scenes)' },
  { minutes: 20, label: '20 Minutes', desc: 'Feature Cartoon Special (~85 scenes)' },
];

const LILO_INSPIRATIONS = [
  {
    title: '🐦 The Lost Forest Songbird',
    prompt: 'LiLo and Mozz find a little blue songbird who lost its way home after a storm. They follow bird chirps and clear away fallen branches to reunite the bird family in the great ancient oak.',
    animal: ANIMAL_FRIENDS[0],
    duration: 3,
  },
  {
    title: '🐢 Toby the River Turtle & The Clean Stream',
    prompt: 'LiLo and Mozz discover baby river turtles struggling to reach the water due to dropped plastic wrappers and litter. LiLo cleans up the stream and teaches children why freshwater ecosystems matter.',
    animal: ANIMAL_FRIENDS[1],
    duration: 5,
  },
  {
    title: '🦋 Bella the Butterfly\'s Wildflower Meadow',
    prompt: 'A golden monarch butterfly needs to find blooming wildflower nectar before autumn. LiLo and Mozz plant seed bombs and restore the colorful garden clearing.',
    animal: ANIMAL_FRIENDS[2],
    duration: 5,
  },
  {
    title: '🐿️ Sammy the Squirrel\'s Acorn Mystery',
    prompt: 'Sammy the squirrel forgot where his winter acorns were buried. While searching, LiLo learns how squirrels accidentally plant thousands of new oak saplings every year.',
    animal: ANIMAL_FRIENDS[3],
    duration: 5,
  },
  {
    title: '🦌 Barnaby the Baby Deer & The Forest Trail',
    prompt: 'LiLo and Mozz meet a gentle fawn near the blueberry thicket and guide it back safely to the mother deer while keeping the quiet woods peaceful.',
    animal: ANIMAL_FRIENDS[4],
    duration: 5,
  },
];

export const ScriptWizard: React.FC<ScriptWizardProps> = ({
  project,
  onUpdateProject,
  aiSettings,
  onNavigateToStoryboard,
}) => {
  const [activeMode, setActiveMode] = useState<'ai-prompt' | 'screenplay-editor'>('ai-prompt');
  const [promptText, setPromptText] = useState(project.synopsis || '');
  const [selectedDuration, setSelectedDuration] = useState<number>(project.targetDurationMinutes || 3);
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalFriend>(project.animalFriend || ANIMAL_FRIENDS[0]);
  const [isGenerating, setIsGenerating] = useState(false);

  const [screenplayDraft, setScreenplayDraft] = useState(() => {
    return project.scenes.map(s => {
      const charMap = new Map(project.characters.map(c => [c.id, c.name]));
      const dlgLines = s.dialogues.map(d => {
        const charName = charMap.get(d.characterId) || 'CHARACTER';
        return `${charName.toUpperCase()} (${d.emotion}): ${d.text}`;
      }).join('\n');
      return `[SCENE ${s.sceneNumber}: ${s.title.toUpperCase()}]\n${dlgLines}`;
    }).join('\n\n');
  });

  const handleGenerateEpisode = async () => {
    setIsGenerating(true);
    try {
      const newProject = await generateLiLoMozzEpisode({
        prompt: promptText || `LiLo and Mozz help ${selectedAnimal.name} in the forest`,
        durationMinutes: selectedDuration,
        selectedAnimal,
        selectedOutfitLiLo: project.characters.find(c => c.id === 'char_lilo')?.selectedOutfit,
        selectedOutfitMozz: project.characters.find(c => c.id === 'char_mozz')?.selectedOutfit,
        aiSettings,
      });

      onUpdateProject(() => newProject);

      // Update draft
      const charMap = new Map(newProject.characters.map(c => [c.id, c.name]));
      const draft = newProject.scenes.map(s => {
        const dlgLines = s.dialogues.map(d => {
          const charName = charMap.get(d.characterId) || 'CHARACTER';
          return `${charName.toUpperCase()} (${d.emotion}): ${d.text}`;
        }).join('\n');
        return `[SCENE ${s.sceneNumber}: ${s.title.toUpperCase()}]\n${dlgLines}`;
      }).join('\n\n');
      setScreenplayDraft(draft);

      onNavigateToStoryboard();
    } catch (e) {
      console.error('Episode generation error:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleParseScreenplay = () => {
    const updated = parseUserScreenplay(screenplayDraft, project.artStyle);
    onUpdateProject(prev => ({
      ...prev,
      scenes: updated.scenes,
      title: updated.title || prev.title,
    }));
    onNavigateToStoryboard();
  };

  const totalRuntime = project.scenes.reduce((acc, s) => acc + s.duration, 0);

  return (
    <div className="max-w-7xl mx-auto p-6 flex flex-col gap-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-purple-950/60 to-pink-950/60 border border-emerald-500/30 rounded-3xl p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Trees className="w-4 h-4 text-emerald-400" />
              <span>LiLo & Mozz Episode Generator (2 to 20 Minutes)</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Create New LiLo & Mozz Forest Adventures
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Input any script or story prompt. The engine automatically designs 4-act narrative arcs, dialogues with LiLo and Mozz, animal rescues, and concluding "Forest Tips".
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800 shrink-0">
            <button
              onClick={() => setActiveMode('ai-prompt')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeMode === 'ai-prompt'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Episode Generator</span>
            </button>

            <button
              onClick={() => setActiveMode('screenplay-editor')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeMode === 'screenplay-editor'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Screenplay Editor</span>
            </button>
          </div>
        </div>
      </div>

      {/* Episode Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-white">{project.scenes.length} Scenes</div>
            <div className="text-xs text-slate-400">Total Scene Count</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-white">{(totalRuntime / 60).toFixed(1)} Min</div>
            <div className="text-xs text-slate-400">Episode Runtime ({totalRuntime.toFixed(0)}s)</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-white">{project.animalFriend?.name || 'Forest Friend'}</div>
            <div className="text-xs text-slate-400">{project.animalFriend?.species || 'Animal Hero'}</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Trees className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-white">Forest Tip</div>
            <div className="text-xs text-slate-400 truncate max-w-[120px]">{project.forestTip || 'Nature Care'}</div>
          </div>
        </div>
      </div>

      {/* Main Generator Mode */}
      {activeMode === 'ai-prompt' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form & Controls (Left 8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
            <div>
              <label className="text-sm font-bold text-white mb-1.5 flex items-center justify-between">
                <span>Episode Story Premise & New Scenes</span>
                <span className="text-xs text-purple-400">LiLo & Mozz Adventure Mode</span>
              </label>
              <textarea
                rows={4}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Describe today's forest adventure... e.g. LiLo and Mozz wake up and hear a tiny frog calling near the mossy pond. The stream is blocked by twigs, so they build a mini water channel..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-2xl p-4 text-sm text-white placeholder:text-slate-500 outline-none resize-none transition"
              />
            </div>

            {/* Target Episode Duration (2 to 20 Min) */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 block">
                Target Episode Duration (2 to 20 Minutes)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {EPISODE_DURATIONS.map((dur) => (
                  <button
                    key={dur.minutes}
                    type="button"
                    onClick={() => setSelectedDuration(dur.minutes)}
                    className={`p-3 rounded-2xl text-left border transition flex flex-col gap-0.5 ${
                      selectedDuration === dur.minutes
                        ? 'bg-purple-950/60 border-purple-500 text-white font-bold ring-2 ring-purple-500/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-xs font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      <span>{dur.label}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">{dur.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Animal Friend Selector */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 block">
                Featured Animal Friend
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ANIMAL_FRIENDS.map((af) => (
                  <button
                    key={af.name}
                    type="button"
                    onClick={() => setSelectedAnimal(af)}
                    className={`p-3 rounded-2xl text-left border transition flex items-center gap-3 ${
                      selectedAnimal.name === af.name
                        ? 'bg-emerald-950/50 border-emerald-500 text-white font-bold ring-2 ring-emerald-500/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-2xl">{af.icon}</span>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold truncate">{af.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{af.species}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateEpisode}
              disabled={isGenerating}
              className="mt-2 w-full py-4 bg-gradient-to-r from-emerald-600 via-purple-600 to-pink-600 hover:from-emerald-500 hover:to-pink-500 text-white font-black rounded-2xl shadow-xl shadow-purple-500/30 flex items-center justify-center gap-2 transition active:scale-98 disabled:opacity-50 text-sm"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Directing {selectedDuration}-Minute LiLo & Mozz Episode...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  <span>Generate Full {selectedDuration}-Min Cartoon Episode</span>
                </>
              )}
            </button>
          </div>

          {/* Preset Inspirations (Right 4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              LiLo & Mozz Story Presets
            </h3>
            {LILO_INSPIRATIONS.map((ins, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setPromptText(ins.prompt);
                  setSelectedAnimal(ins.animal);
                  setSelectedDuration(ins.duration);
                }}
                className="bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 p-3.5 rounded-2xl cursor-pointer transition flex flex-col gap-1 group"
              >
                <div className="font-bold text-xs text-emerald-300 group-hover:text-emerald-200">{ins.title}</div>
                <div className="text-xs text-slate-400 line-clamp-2">{ins.prompt}</div>
                <div className="text-[10px] text-purple-300 font-mono mt-1">Duration: {ins.duration} Min</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Screenplay Mode */
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Screenplay Script Editor</h3>
              <p className="text-xs text-slate-400">
                Format: <code className="text-purple-300">[SCENE 1: TITLE]</code> followed by <code className="text-pink-300">LILO (excited): ...</code> or <code className="text-amber-300">MOZZ (happy): ...</code>
              </p>
            </div>
            <button
              onClick={handleParseScreenplay}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-purple-600 hover:from-emerald-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Convert Script to Video Storyboard</span>
            </button>
          </div>

          <textarea
            rows={16}
            value={screenplayDraft}
            onChange={(e) => setScreenplayDraft(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-2xl p-4 font-mono text-xs text-emerald-200 outline-none resize-none leading-relaxed"
          />
        </div>
      )}
    </div>
  );
};
