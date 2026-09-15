import React, { useState } from 'react';
import { Plus, Trash2, Copy, ArrowLeft, ArrowRight, Volume2, Film, Sparkles, Trees, Play } from 'lucide-react';
import { Project, Scene, DialogueLine, CameraAngle, TransitionType, SFXType, CharacterEmotion } from '../../types/cartoon';
import { BACKGROUND_PRESETS, getBackgroundSvgUrl } from '../../services/backgroundGenerator';
import { soundSynthesizer } from '../../services/soundSynthesizer';
import { speechSynthesizer } from '../../services/speechSynthesizer';

interface StoryboardDirectorProps {
  project: Project;
  onUpdateProject: (updater: (prev: Project) => Project) => void;
  onPreviewScene: (sceneIndex: number) => void;
}

const CAMERA_ANGLES: { id: CameraAngle; label: string }[] = [
  { id: 'wide-shot', label: 'Wide Shot (Forest Stage)' },
  { id: 'medium-shot', label: 'Medium Shot (Waist Up)' },
  { id: 'close-up', label: 'Close-Up (Expressive Face)' },
  { id: 'dynamic-pan', label: 'Dynamic Pan (Action Exploration)' },
  { id: 'dutch-angle', label: 'Dutch Angle (Dramatic Angle)' },
];

const TRANSITIONS: { id: TransitionType; label: string }[] = [
  { id: 'fade', label: 'Fade Transition' },
  { id: 'zoom-in', label: 'Zoom In' },
  { id: 'slide-left', label: 'Slide Left' },
  { id: 'bounce-cut', label: 'Cartoon Bounce Cut' },
  { id: 'comic-wipe', label: 'Comic Book Wipe' },
];

const SFX_OPTIONS: { id: SFXType; label: string; icon: string }[] = [
  { id: 'none', label: 'No Sound FX', icon: '🔇' },
  { id: 'nature-birds', label: 'Forest Birds Chirping', icon: '🐦' },
  { id: 'river-stream', label: 'Gentle River Stream', icon: '🌊' },
  { id: 'cat-meow', label: 'Mozz Kitten Meow', icon: '🐱' },
  { id: 'cat-purr', label: 'Mozz Gentle Purr', icon: '🐾' },
  { id: 'sparkle', label: 'Magic Nature Sparkle', icon: '✨' },
  { id: 'fanfare', label: 'Celebration Fanfare', icon: '🎺' },
  { id: 'boing', label: 'Cartoon Boing', icon: '🌀' },
  { id: 'pop', label: 'Bubble Pop', icon: '🫧' },
  { id: 'whoosh', label: 'Speed Whoosh', icon: '💨' },
  { id: 'thunder', label: 'Forest Thunder', icon: '⛈️' },
];

const PARTICLE_OPTIONS = [
  { id: 'none', label: 'No Particles' },
  { id: 'leaves', label: 'Falling Forest Leaves 🍃' },
  { id: 'butterflies', label: 'Dancing Butterflies 🦋' },
  { id: 'stars', label: 'Twinkling Sunbeams & Stars ✨' },
  { id: 'hearts', label: 'Heartfelt Love & Joy 💕' },
  { id: 'bubbles', label: 'Stream Bubbles 🫧' },
  { id: 'rain', label: 'Gentle Forest Rain 🌧️' },
];

export const StoryboardDirector: React.FC<StoryboardDirectorProps> = ({
  project,
  onUpdateProject,
  onPreviewScene,
}) => {
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);

  const activeScene = project.scenes[activeSceneIndex] || project.scenes[0];

  const updateScene = (sceneId: string, fields: Partial<Scene>) => {
    onUpdateProject(prev => ({
      ...prev,
      scenes: prev.scenes.map(s => s.id === sceneId ? { ...s, ...fields } : s)
    }));
  };

  const handleAddScene = () => {
    const newIndex = project.scenes.length + 1;
    const newScene: Scene = {
      id: 'scene_' + Math.random().toString(36).substring(2, 8),
      sceneNumber: newIndex,
      act: 'Act 2: Animal Friend in Need',
      title: `Scene ${newIndex}: Forest Discovery`,
      visualPrompt: 'LiLo and Mozz exploring along the lush green moss path',
      backgroundUrl: 'forest-cottage',
      cameraAngle: 'medium-shot',
      transition: 'fade',
      duration: 8.5,
      characters: ['char_lilo', 'char_mozz'],
      dialogues: [
        {
          id: 'dlg_' + Math.random().toString(36).substring(2, 8),
          characterId: 'char_lilo',
          text: 'Look over here, Mozz! The forest has another wonderful surprise!',
          emotion: 'excited',
          startTime: 0.5,
          duration: 3.5,
        }
      ],
      sfx: 'nature-birds',
      sfxTime: 1.0,
      particleEffect: 'leaves',
    };

    onUpdateProject(prev => ({
      ...prev,
      scenes: [...prev.scenes, newScene]
    }));
    setActiveSceneIndex(project.scenes.length);
  };

  const handleDeleteScene = (sceneId: string) => {
    if (project.scenes.length <= 1) return;
    onUpdateProject(prev => {
      const remaining = prev.scenes.filter(s => s.id !== sceneId);
      return {
        ...prev,
        scenes: remaining.map((s, idx) => ({ ...s, sceneNumber: idx + 1 }))
      };
    });
    setActiveSceneIndex(Math.max(0, activeSceneIndex - 1));
  };

  const handleDuplicateScene = (scene: Scene) => {
    const dup: Scene = {
      ...scene,
      id: 'scene_' + Math.random().toString(36).substring(2, 8),
      sceneNumber: project.scenes.length + 1,
      title: `${scene.title} (Copy)`,
      dialogues: scene.dialogues.map(d => ({
        ...d,
        id: 'dlg_' + Math.random().toString(36).substring(2, 8)
      }))
    };

    onUpdateProject(prev => ({
      ...prev,
      scenes: [...prev.scenes, dup]
    }));
  };

  const handleMoveScene = (index: number, direction: 'left' | 'right') => {
    const newIdx = direction === 'left' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= project.scenes.length) return;

    onUpdateProject(prev => {
      const copy = [...prev.scenes];
      const temp = copy[index];
      copy[index] = copy[newIdx];
      copy[newIdx] = temp;
      return {
        ...prev,
        scenes: copy.map((s, i) => ({ ...s, sceneNumber: i + 1 }))
      };
    });
    setActiveSceneIndex(newIdx);
  };

  const handleAddDialogueLine = (sceneId: string) => {
    const newDlg: DialogueLine = {
      id: 'dlg_' + Math.random().toString(36).substring(2, 8),
      characterId: activeScene.dialogues.length % 2 === 0 ? 'char_lilo' : 'char_mozz',
      text: 'What should we do next to help the forest?',
      emotion: 'happy',
      startTime: (activeScene.dialogues.length * 3.6),
      duration: 3.5,
    };

    updateScene(sceneId, {
      dialogues: [...activeScene.dialogues, newDlg],
      duration: Math.max(activeScene.duration, (activeScene.dialogues.length + 1) * 4.0)
    });
  };

  const handlePlayDialogue = (dlg: DialogueLine) => {
    const char = project.characters.find(c => c.id === dlg.characterId) || project.characters[0];
    if (!char) return;
    speechSynthesizer.speakDialogue(dlg.text, char, dlg.emotion);
  };

  if (!activeScene) return null;

  return (
    <div className="max-w-7xl mx-auto p-6 flex flex-col gap-6">
      {/* Top Scene Filmstrip Navigator */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white">LiLo & Mozz Episode Storyboard</h2>
          </div>
          <button
            onClick={handleAddScene}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-purple-600 hover:from-emerald-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-500/25 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Scene</span>
          </button>
        </div>

        {/* Filmstrip cards */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {project.scenes.map((scene, idx) => {
            const isSelected = idx === activeSceneIndex;
            const bgSvg = getBackgroundSvgUrl(scene.backgroundUrl || 'forest-cottage');

            return (
              <div
                key={scene.id}
                onClick={() => setActiveSceneIndex(idx)}
                className={`w-48 shrink-0 rounded-2xl p-2.5 cursor-pointer border transition flex flex-col gap-2 relative group ${
                  isSelected
                    ? 'bg-purple-950/60 border-purple-500 shadow-xl shadow-purple-500/25 ring-2 ring-purple-500/30'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="w-full h-24 rounded-xl overflow-hidden bg-slate-950 relative">
                  <img src={bgSvg} alt={scene.title} className="w-full h-full object-cover" />
                  <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/70 text-[10px] font-bold text-emerald-300">
                    #{scene.sceneNumber}
                  </div>
                  <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/70 text-[10px] text-slate-300">
                    {scene.duration}s
                  </div>
                </div>

                <div className="flex flex-col gap-0.5">
                  <div className="text-xs font-bold text-white truncate">{scene.title}</div>
                  <div className="text-[10px] text-purple-300 truncate">
                    {scene.act || `Scene ${scene.sceneNumber}`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Selected Scene Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Scene Visuals & Story Act (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-5">
          {/* Scene Header & Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                {activeScene.sceneNumber}
              </span>
              <input
                type="text"
                value={activeScene.title}
                onChange={(e) => updateScene(activeScene.id, { title: e.target.value })}
                className="font-bold text-white bg-transparent border-b border-slate-700 focus:border-purple-500 px-1 py-0.5 text-sm outline-none"
              />
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handleMoveScene(activeSceneIndex, 'left')}
                disabled={activeSceneIndex === 0}
                className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800"
                title="Move scene left"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleMoveScene(activeSceneIndex, 'right')}
                disabled={activeSceneIndex === project.scenes.length - 1}
                className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800"
                title="Move scene right"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDuplicateScene(activeScene)}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                title="Duplicate scene"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              {project.scenes.length > 1 && (
                <button
                  onClick={() => handleDeleteScene(activeScene.id)}
                  className="p-1 text-slate-400 hover:text-red-400 rounded hover:bg-red-500/10"
                  title="Delete scene"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Act Badge Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1 block">Story Act</label>
            <select
              value={activeScene.act || 'Act 1: Morning Exploration'}
              onChange={(e) => updateScene(activeScene.id, { act: e.target.value as any })}
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-2.5 py-1.5 text-xs text-emerald-300 font-bold outline-none"
            >
              <option value="Act 1: Morning Exploration">Act 1: Morning Exploration</option>
              <option value="Act 2: Animal Friend in Need">Act 2: Animal Friend in Need</option>
              <option value="Act 3: Nature Solution & Rescue">Act 3: Nature Solution & Rescue</option>
              <option value="Act 4: Forest Tip & Celebration">Act 4: Forest Tip & Celebration</option>
            </select>
          </div>

          {/* Background Visual Box */}
          <div className="w-full h-44 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 relative group">
            <img
              src={getBackgroundSvgUrl(activeScene.backgroundUrl || 'forest-cottage')}
              alt={activeScene.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition backdrop-blur-xs">
              <button
                onClick={() => onPreviewScene(activeSceneIndex)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Play Scene</span>
              </button>
            </div>
          </div>

          {/* Camera & Transitions */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Camera Shot</label>
              <select
                value={activeScene.cameraAngle}
                onChange={(e) => updateScene(activeScene.id, { cameraAngle: e.target.value as CameraAngle })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
              >
                {CAMERA_ANGLES.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Transition</label>
              <select
                value={activeScene.transition}
                onChange={(e) => updateScene(activeScene.id, { transition: e.target.value as TransitionType })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
              >
                {TRANSITIONS.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* SFX & Particles */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-400">Nature / Cartoon SFX</label>
                {activeScene.sfx !== 'none' && (
                  <button
                    onClick={() => soundSynthesizer.playSFX(activeScene.sfx)}
                    className="text-[10px] text-purple-400 hover:text-purple-300 font-bold"
                  >
                    Test SFX
                  </button>
                )}
              </div>
              <select
                value={activeScene.sfx}
                onChange={(e) => updateScene(activeScene.id, { sfx: e.target.value as SFXType })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
              >
                {SFX_OPTIONS.map(s => (
                  <option key={s.id} value={s.id}>{s.icon} {s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Forest Atmosphere</label>
              <select
                value={activeScene.particleEffect || 'leaves'}
                onChange={(e) => updateScene(activeScene.id, { particleEffect: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
              >
                {PARTICLE_OPTIONS.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Duration Slider */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Scene Duration</span>
              <span className="font-bold text-emerald-400">{activeScene.duration}s</span>
            </div>
            <input
              type="range"
              min="4"
              max="20"
              step="0.5"
              value={activeScene.duration}
              onChange={(e) => updateScene(activeScene.id, { duration: parseFloat(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Right Column: LiLo & Mozz Dialogue Scripting (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Scene Dialogues (LiLo & Mozz)</span>
            </h3>
            <button
              onClick={() => handleAddDialogueLine(activeScene.id)}
              className="flex items-center gap-1 px-3 py-1 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 hover:text-white rounded-lg border border-emerald-500/40 text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Dialogue Line</span>
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {activeScene.dialogues.map((dlg, dIdx) => {
              const char = project.characters.find(c => c.id === dlg.characterId) || project.characters[0];
              const avatarImg = char?.avatarUrl || char?.customAvatarUrl;

              return (
                <div
                  key={dlg.id}
                  className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition hover:border-slate-700"
                >
                  {/* Avatar thumbnail */}
                  <div className="w-12 h-12 rounded-xl bg-slate-900 p-1 border border-slate-800 shrink-0 overflow-hidden flex items-center justify-center">
                    {avatarImg && <img src={avatarImg} alt={char?.name} className="w-full h-full object-contain" />}
                  </div>

                  {/* Character Selector & Emotion */}
                  <div className="flex flex-col gap-1.5 shrink-0 w-36">
                    <select
                      value={dlg.characterId}
                      onChange={(e) => {
                        const newDlgs = [...activeScene.dialogues];
                        newDlgs[dIdx] = { ...dlg, characterId: e.target.value };
                        updateScene(activeScene.id, { dialogues: newDlgs });
                      }}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white font-bold outline-none"
                    >
                      {project.characters.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>

                    <select
                      value={dlg.emotion}
                      onChange={(e) => {
                        const newDlgs = [...activeScene.dialogues];
                        newDlgs[dIdx] = { ...dlg, emotion: e.target.value as CharacterEmotion };
                        updateScene(activeScene.id, { dialogues: newDlgs });
                      }}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-purple-300 font-medium outline-none capitalize"
                    >
                      {['happy', 'excited', 'surprised', 'winking', 'thinking', 'neutral', 'angry', 'sad', 'scared'].map(emo => (
                        <option key={emo} value={emo}>{emo}</option>
                      ))}
                    </select>
                  </div>

                  {/* Dialogue text */}
                  <div className="flex-1 w-full">
                    <textarea
                      rows={2}
                      value={dlg.text}
                      onChange={(e) => {
                        const newDlgs = [...activeScene.dialogues];
                        newDlgs[dIdx] = { ...dlg, text: e.target.value };
                        updateScene(activeScene.id, { dialogues: newDlgs });
                      }}
                      className="w-full bg-slate-900/80 border border-slate-800 focus:border-purple-500 rounded-xl p-2.5 text-xs text-white outline-none resize-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handlePlayDialogue(dlg)}
                      className="p-2 text-purple-400 hover:text-white hover:bg-purple-600/30 rounded-xl transition border border-purple-500/20"
                      title="Preview character voice line"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    {activeScene.dialogues.length > 1 && (
                      <button
                        onClick={() => {
                          const newDlgs = activeScene.dialogues.filter(d => d.id !== dlg.id);
                          updateScene(activeScene.id, { dialogues: newDlgs });
                        }}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition"
                        title="Delete dialogue line"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
