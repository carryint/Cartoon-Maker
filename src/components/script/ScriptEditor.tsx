import { useState, useRef, useEffect } from 'react';
import { Wand2, FileText, List, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { Scene, Character } from '../../types/studio';
import { parseScript, summarizeScenes } from '../../services/scriptParser';

interface Props {
  rawScript: string;
  characters: Character[];
  scenes: Scene[];
  onScriptChange: (script: string) => void;
  onParse: (scenes: Scene[]) => void;
}

const SCRIPT_PLACEHOLDER = `SCENE 1 — TITLE OF YOUR SCENE
Setting: Describe the setting, time of day, location, mood.
Camera: Wide / Medium / Close-up / Aerial

CHARACTER_NAME: (emotion) Dialogue text goes here...
CHARACTER_NAME: (emotion) Another line of dialogue...

---

SCENE 2 — NEXT SCENE TITLE
Setting: Describe this scene.
Camera: Medium

CHARACTER_NAME: (happy) More dialogue here.`;

export default function ScriptEditor({ rawScript, characters, scenes, onScriptChange, onParse }: Props) {
  const [isParsed, setIsParsed] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [expandedScene, setExpandedScene] = useState<string | null>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setIsParsed(scenes.length > 0);
  }, [scenes]);

  const handleParse = () => {
    if (!rawScript.trim()) return;
    const parsed = parseScript(rawScript, characters);
    onParse(parsed);
    setIsParsed(true);
    setShowBreakdown(true);
  };

  const totalDuration = scenes.reduce((s, sc) => s + sc.duration, 0);
  const totalDialogues = scenes.reduce((s, sc) => s + sc.dialogues.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Script Editor</h2>
          <p className="text-slate-400 text-sm mt-1">Write or paste your screenplay below. The AI will parse it into scenes automatically.</p>
        </div>
        <button
          onClick={handleParse}
          disabled={!rawScript.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-slate-900 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}
        >
          <Wand2 size={18} /> Parse Script
        </button>
      </div>

      {/* Script Textarea */}
      <div className="relative">
        <div className="absolute top-3 right-3 flex items-center gap-2 text-xs text-slate-500">
          <FileText size={12} />
          {rawScript.split('\n').length} lines
        </div>
        <textarea
          ref={textRef}
          value={rawScript}
          onChange={e => { onScriptChange(e.target.value); setIsParsed(false); }}
          placeholder={SCRIPT_PLACEHOLDER}
          className="w-full h-80 bg-slate-900 border border-slate-700 rounded-2xl px-5 py-4 text-slate-200 text-sm font-mono leading-relaxed resize-none focus:outline-none focus:border-amber-400/60 transition-colors placeholder-slate-600"
        />
      </div>

      {/* Format Guide */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Script Format Guide</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-400">
          <div>
            <div className="text-amber-400 font-mono mb-1">SCENE N — TITLE</div>
            <div>Starts a new scene. N is the scene number.</div>
          </div>
          <div>
            <div className="text-amber-400 font-mono mb-1">Setting: description</div>
            <div>Background, location, and mood of the scene.</div>
          </div>
          <div>
            <div className="text-amber-400 font-mono mb-1">NAME: (emotion) text</div>
            <div>Dialogue line. Emotion is optional: happy, sad, excited, thinking…</div>
          </div>
        </div>
        <div className="mt-3 text-xs text-slate-500">Use <span className="font-mono text-slate-400">---</span> to separate scenes. Camera: wide / medium / close-up / aerial.</div>
      </div>

      {/* Parsed Scene Breakdown */}
      {isParsed && scenes.length > 0 && (
        <div className="bg-slate-800/50 border border-emerald-500/30 rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-800/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <List size={18} className="text-emerald-400" />
              <span className="font-semibold text-white">Scene Breakdown</span>
              <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full">{scenes.length} scenes</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Clock size={12} /> {Math.round(totalDuration)}s (~{(totalDuration / 60).toFixed(1)} min)</span>
                <span>{totalDialogues} dialogues</span>
              </div>
              {showBreakdown ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </div>
          </button>

          {showBreakdown && (
            <div className="border-t border-slate-700 divide-y divide-slate-700/50">
              {scenes.map((scene, idx) => (
                <div key={scene.id} className="px-5 py-3">
                  <button
                    onClick={() => setExpandedScene(expandedScene === scene.id ? null : scene.id)}
                    className="w-full flex items-center gap-3 text-left"
                  >
                    <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-amber-400 flex-shrink-0">
                      {scene.sceneNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm truncate">{scene.title}</div>
                      <div className="text-xs text-slate-500 truncate">{scene.background.type.replace(/-/g, ' ')} · {scene.cameraShot} · {Math.round(scene.duration)}s</div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 flex-shrink-0">
                      <span>{scene.dialogues.length} lines</span>
                      {expandedScene === scene.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </button>

                  {expandedScene === scene.id && (
                    <div className="mt-3 ml-10 space-y-2">
                      <p className="text-xs text-slate-400">{scene.description}</p>
                      {scene.dialogues.map(dial => {
                        const char = characters.find(c => c.id === dial.characterId);
                        return (
                          <div key={dial.id} className="flex gap-2 text-xs">
                            <span className="font-semibold text-amber-400 flex-shrink-0" style={{ color: char?.colorPrimary }}>
                              {char?.name || 'Unknown'}:
                            </span>
                            <span className="text-slate-300">
                              <span className="text-slate-500 italic">({dial.emotion}) </span>{dial.text}
                            </span>
                          </div>
                        );
                      })}
                      {scene.sfx && (
                        <div className="text-xs text-slate-500">🔊 SFX: {scene.sfx}</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
