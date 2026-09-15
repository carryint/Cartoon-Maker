import { useState, useCallback } from 'react';
import { Film, Sparkles, ChevronRight, ChevronLeft, ExternalLink, RotateCcw } from 'lucide-react';
import StepIndicator from './components/wizard/StepIndicator';
import CharacterBoardUploader from './components/characters/CharacterBoardUploader';
import ScriptEditor from './components/script/ScriptEditor';
import VideoDirector from './components/director/VideoDirector';
import { Project, Character, Scene } from './types/studio';
import { DEFAULT_PROJECT } from './data/defaults';
import { loadProject, saveProject, clearProject } from './services/aiVideoEngine';

function App() {
  const [step, setStep] = useState(1);
  const [project, setProject] = useState<Project>(() => loadProject() ?? DEFAULT_PROJECT);

  const updateProject = useCallback((updates: Partial<Project>) => {
    setProject(prev => {
      const updated = { ...prev, ...updates, updatedAt: new Date().toISOString() };
      saveProject(updated);
      return updated;
    });
  }, []);

  const handleCharactersUpdate = (chars: Character[]) => updateProject({ characters: chars });
  const handleScriptChange = (script: string) => updateProject({ rawScript: script, scenes: [] });
  const handleParse = (scenes: Scene[]) => updateProject({ scenes });
  const handleProjectUpdate = (p: Project) => { setProject(p); saveProject(p); };

  const canGoNext = () => {
    if (step === 1) return project.characters.length > 0;
    if (step === 2) return project.rawScript.trim().length > 20;
    return true;
  };

  const resetProject = () => {
    if (window.confirm('Start fresh? This will clear all current data.')) {
      clearProject();
      setProject(DEFAULT_PROJECT);
      setStep(1);
    }
  };

  return (
    <div className="min-h-screen bg-studio-dark text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}>
              <Film size={20} className="text-slate-900" />
            </div>
            <div>
              <div className="font-bold text-white text-sm leading-tight">AI Video Studio</div>
              <div className="text-xs text-slate-500 leading-tight">{project.title}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-xs text-slate-500 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
              <Sparkles size={10} className="inline mr-1 text-amber-400" />
              Powered by AI
            </span>
            <a
              href="https://github.com/carryint/Cartoon-Maker"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 transition-colors"
              title="View on GitHub"
            >
              <ExternalLink size={16} className="text-slate-300" />
            </a>
            <button onClick={resetProject}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-red-500/50 hover:text-red-400 transition-colors"
              title="Reset Project">
              <RotateCcw size={16} className="text-slate-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Step Indicator */}
        <StepIndicator currentStep={step} />

        {/* Project Title Input */}
        {step === 1 && (
          <div className="mb-8">
            <label className="text-xs text-slate-400 mb-1.5 block">Project / Episode Title</label>
            <input
              value={project.title}
              onChange={e => updateProject({ title: e.target.value })}
              placeholder="e.g. LiLo & Mozz — The Lost Turtle"
              className="w-full max-w-lg bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400/70 transition-colors"
            />
          </div>
        )}

        {/* Step Content */}
        <div className="min-h-[500px]">
          {step === 1 && (
            <CharacterBoardUploader
              characters={project.characters}
              onUpdate={handleCharactersUpdate}
            />
          )}
          {step === 2 && (
            <ScriptEditor
              rawScript={project.rawScript}
              characters={project.characters}
              scenes={project.scenes}
              onScriptChange={handleScriptChange}
              onParse={handleParse}
            />
          )}
          {step === 3 && (
            <VideoDirector
              project={project}
              onProjectUpdate={handleProjectUpdate}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-800">
          <button
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm font-medium"
          >
            <ChevronLeft size={16} /> Back
          </button>

          <div className="text-xs text-slate-600">{step} of 3</div>

          {step < 3 ? (
            <button
              onClick={() => setStep(s => Math.min(3, s + 1))}
              disabled={!canGoNext()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-slate-900 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}
            >
              {step === 1 ? 'Write Script' : 'Generate Video'}
              <ChevronRight size={16} />
            </button>
          ) : (
            <div className="w-28" />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-20 py-6 text-center text-xs text-slate-600">
        AI Video Studio · Built with React + Vite · Canvas-based 4K rendering · Web Speech API
      </footer>
    </div>
  );
}

export default App;
