import React, { useState } from 'react';
import { Sparkles, Wand2, FileText, Play, Film, RefreshCw, Layers, CheckCircle2, MessageSquare } from 'lucide-react';
import { Project, ArtStyle, AISettings } from '../../types/cartoon';
import { generateCartoonProject, parseUserScreenplay } from '../../services/aiPipeline';

interface ScriptWizardProps {
  project: Project;
  onUpdateProject: (updater: (prev: Project) => Project) => void;
  aiSettings: AISettings;
  onNavigateToStoryboard: () => void;
}

const INSPIRATION_IDEAS = [
  {
    title: '🚀 Space Snack Mission',
    prompt: 'Two space adventurers discover a giant asteroid made entirely of glowing donuts with zero-gravity sprinkles.',
    genre: 'sci-fi comedy',
  },
  {
    title: '🔍 Detective Duck & The Missing Donut',
    prompt: 'A witty trench-coat detective duck investigates the mysterious disappearance of the golden bakery croissant.',
    genre: 'mystery comedy',
  },
  {
    title: '🧁 Tiny Dragon Pastry Academy',
    prompt: 'A baby fire dragon joins a prestigious pastry school and learns to caramelize crème brûlée with tiny flame burps.',
    genre: 'fantasy cute',
  },
  {
    title: '🦸‍♂️ Superhero Sloth Saves The Day',
    prompt: 'A super-slow sloth hero accidentally foils a supervillain bank robbery by moving so slowly lasers miss him.',
    genre: 'action comedy',
  },
  {
    title: '🎮 Cyberpunk Arcade Escape',
    prompt: 'Two retro video game sprites wake up in a neon futuristic metropolis and must defeat the glitch boss.',
    genre: 'cyberpunk anime',
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
  const [selectedGenre, setSelectedGenre] = useState('comedy-adventure');
  const [sceneCount, setSceneCount] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [screenplayDraft, setScreenplayDraft] = useState(() => {
    // Generate readable screenplay text from current project
    return project.scenes.map(s => {
      const charMap = new Map(project.characters.map(c => [c.id, c.name]));
      const dlgLines = s.dialogues.map(d => {
        const charName = charMap.get(d.characterId) || 'CHARACTER';
        return `${charName.toUpperCase()} (${d.emotion}): ${d.text}`;
      }).join('\n');
      return `[SCENE ${s.sceneNumber}: ${s.title.toUpperCase()}]\n${dlgLines}`;
    }).join('\n\n');
  });

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const newProject = await generateCartoonProject({
        prompt: promptText || 'Two cartoon pals embark on an unexpected adventure',
        artStyle: project.artStyle,
        genre: selectedGenre,
        targetSceneCount: sceneCount,
        aiSettings,
      });

      onUpdateProject(() => newProject);
      // Update screenplay draft
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
      console.error('Generation error:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleParseScreenplay = () => {
    const updated = parseUserScreenplay(screenplayDraft, project.artStyle);
    onUpdateProject(prev => ({
      ...prev,
      characters: updated.characters,
      scenes: updated.scenes,
      title: updated.title || prev.title,
    }));
    onNavigateToStoryboard();
  };

  const totalWords = project.scenes.reduce((acc, s) => {
    return acc + s.dialogues.reduce((dAcc, d) => dAcc + d.text.split(/\s+/).length, 0);
  }, 0);

  const totalRuntime = project.scenes.reduce((acc, s) => acc + s.duration, 0);

  return (
    <div className="max-w-7xl mx-auto p-6 flex flex-col gap-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-pink-900/40 border border-purple-500/30 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>AI Story & Screenplay Engine</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white m-0 tracking-tight">
              Turn Any Concept into a Full Animated Cartoon
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Write a story idea or screenplay. The AI engine writes dynamic dialogues, plans camera framing, assigns character emotion states, and creates animated scenes automatically.
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
              <span>AI Story Generator</span>
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

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-white">{project.scenes.length}</div>
            <div className="text-xs text-slate-400">Total Scenes</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-white">{totalWords}</div>
            <div className="text-xs text-slate-400">Dialogue Words</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-white">{totalRuntime.toFixed(1)}s</div>
            <div className="text-xs text-slate-400">Est. Duration</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-white capitalize">{project.artStyle}</div>
            <div className="text-xs text-slate-400">Art Style</div>
          </div>
        </div>
      </div>

      {/* Main Mode View */}
      {activeMode === 'ai-prompt' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Prompt & Config (Left 8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
            <div>
              <label className="text-sm font-bold text-white mb-1.5 flex items-center justify-between">
                <span>Story Concept / Scenario Prompt</span>
                <span className="text-xs text-purple-400 font-normal">Supports full story premises</span>
              </label>
              <textarea
                rows={4}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Describe your cartoon idea... e.g. A tiny dragon and a clumsy wizard open a magical taco truck on Mars..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-2xl p-4 text-sm text-white placeholder:text-slate-500 outline-none resize-none transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Story Genre</label>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                >
                  <option value="comedy-adventure">Comedy & Adventure</option>
                  <option value="sci-fi-futuristic">Sci-Fi & Space Exploration</option>
                  <option value="mystery-detective">Mystery & Whodunnit</option>
                  <option value="magical-fantasy">Magical Fantasy</option>
                  <option value="educational-kids">Educational & Wholesome</option>
                  <option value="action-superhero">Action Superhero</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span className="font-semibold">Target Scene Count</span>
                  <span className="font-bold text-purple-400">{sceneCount} Scenes</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="6"
                  value={sceneCount}
                  onChange={(e) => setSceneCount(parseInt(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer mt-2"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="mt-2 w-full py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2 transition active:scale-98 disabled:opacity-50 text-sm"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Directing & Generating Cartoon Scenes...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  <span>Generate Full Cartoon Storyboard</span>
                </>
              )}
            </button>
          </div>

          {/* Inspiration Ideas (Right 4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              Quick Inspiration Prompts
            </h3>
            {INSPIRATION_IDEAS.map((idea, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setPromptText(idea.prompt);
                  setSelectedGenre(idea.genre);
                }}
                className="bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/50 p-3.5 rounded-2xl cursor-pointer transition flex flex-col gap-1 group"
              >
                <div className="font-bold text-xs text-purple-300 group-hover:text-purple-200">{idea.title}</div>
                <div className="text-xs text-slate-400 line-clamp-2">{idea.prompt}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Screenplay Editor Mode */
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Screenplay Script Editor</h3>
              <p className="text-xs text-slate-400">
                Format: <code className="text-purple-300">[SCENE 1: TITLE]</code> followed by <code className="text-pink-300">CHARACTER (emotion): dialogue text</code>
              </p>
            </div>
            <button
              onClick={handleParseScreenplay}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-500/25 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Apply & Convert to Storyboard</span>
            </button>
          </div>

          <textarea
            rows={14}
            value={screenplayDraft}
            onChange={(e) => setScreenplayDraft(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-2xl p-4 font-mono text-xs text-purple-200 outline-none resize-none leading-relaxed"
          />
        </div>
      )}
    </div>
  );
};
