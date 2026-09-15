import React, { useState } from 'react';
import { Plus, Trash2, Volume2, Sparkles, RefreshCw, Palette, User, Smile, Sliders } from 'lucide-react';
import { Project, Character, ArtStyle, CharacterEmotion } from '../../types/cartoon';
import { generateCharacterEmotions, generateProceduralAvatar } from '../../services/avatarGenerator';
import { speechSynthesizer } from '../../services/speechSynthesizer';

interface CharacterStudioProps {
  project: Project;
  onUpdateProject: (updater: (prev: Project) => Project) => void;
}

const ART_STYLES: { id: ArtStyle; label: string; desc: string }[] = [
  { id: 'pixar-3d', label: 'Pixar 3D', desc: 'Glossy 3D animated CGI movie look' },
  { id: 'classic-2d', label: 'Classic 2D Toon', desc: 'Hand-drawn Saturday morning cartoon' },
  { id: 'anime-chibi', label: 'Anime Chibi', desc: 'Cute expressive eyes and pastel shades' },
  { id: 'claymation', label: 'Claymation', desc: 'Plasticine stop-motion tactile texture' },
  { id: 'comic-book', label: 'Comic Book', desc: 'Bold ink lines and dynamic halftone dots' },
  { id: 'cyberpunk-toon', label: 'Cyberpunk Toon', desc: 'Glowing neon lights and futuristic gear' },
];

const EMOTIONS_LIST: CharacterEmotion[] = [
  'happy',
  'excited',
  'surprised',
  'cool',
  'thinking',
  'neutral',
  'angry',
  'sad',
  'scared',
];

export const CharacterStudio: React.FC<CharacterStudioProps> = ({ project, onUpdateProject }) => {
  const [selectedCharId, setSelectedCharId] = useState<string>(
    project.characters[0]?.id || ''
  );
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [previewEmotion, setPreviewEmotion] = useState<CharacterEmotion>('happy');

  const selectedChar = project.characters.find(c => c.id === selectedCharId) || project.characters[0];

  const updateSelectedChar = (fields: Partial<Character>) => {
    if (!selectedChar) return;
    onUpdateProject(prev => ({
      ...prev,
      characters: prev.characters.map(c => {
        if (c.id !== selectedChar.id) return c;
        const updated = { ...c, ...fields };

        // If artStyle, seed, or colors changed, regenerate emotions
        if (fields.artStyle || fields.avatarSeed || fields.primaryColor || fields.secondaryColor || fields.name) {
          const emotions = generateCharacterEmotions(
            updated.name,
            updated.artStyle,
            updated.primaryColor,
            updated.secondaryColor,
            updated.avatarSeed
          );
          updated.emotions = emotions;
          updated.avatarUrl = emotions[previewEmotion] || emotions['happy'];
        }

        return updated;
      })
    }));
  };

  const handleAddCharacter = () => {
    const newId = 'char_' + Math.random().toString(36).substring(2, 8);
    const seed = Math.floor(Math.random() * 9000) + 1000;
    const colors = [
      { p: '#8b5cf6', s: '#ec4899' },
      { p: '#06b6d4', s: '#f59e0b' },
      { p: '#10b981', s: '#3b82f6' },
      { p: '#f43f5e', s: '#fbbf24' }
    ];
    const picked = colors[project.characters.length % colors.length];
    const name = `Hero ${project.characters.length + 1}`;
    const emotions = generateCharacterEmotions(name, project.artStyle, picked.p, picked.s, seed);

    const newChar: Character = {
      id: newId,
      name,
      tagline: 'Excited newcomer to the cartoon crew',
      artStyle: project.artStyle,
      primaryColor: picked.p,
      secondaryColor: picked.s,
      voiceGender: project.characters.length % 2 === 0 ? 'female' : 'male',
      voicePitch: 1.0,
      voiceRate: 1.0,
      avatarPrompt: name,
      avatarSeed: seed,
      avatarUrl: emotions['happy'],
      personality: 'Curious, lively, and expressive.',
      emotions,
    };

    onUpdateProject(prev => ({
      ...prev,
      characters: [...prev.characters, newChar]
    }));
    setSelectedCharId(newId);
  };

  const handleDeleteCharacter = (id: string) => {
    if (project.characters.length <= 1) return;
    onUpdateProject(prev => ({
      ...prev,
      characters: prev.characters.filter(c => c.id !== id)
    }));
    if (selectedCharId === id) {
      setSelectedCharId(project.characters.find(c => c.id !== id)?.id || '');
    }
  };

  const handleRerollAvatar = () => {
    if (!selectedChar) return;
    const newSeed = Math.floor(Math.random() * 9000) + 1000;
    updateSelectedChar({ avatarSeed: newSeed });
  };

  const handleTestVoice = (emotion: CharacterEmotion = previewEmotion) => {
    if (!selectedChar) return;
    setIsPlayingVoice(true);
    const testPhrases: Record<CharacterEmotion, string> = {
      happy: `Hi there! I am ${selectedChar.name}, ready for another cartoon adventure!`,
      excited: `Woohoo! This is the most incredible cartoon ever created!`,
      surprised: `Whoa! Look at that giant magical portal opening up!`,
      cool: `Stay smooth, everything is under complete control.`,
      thinking: `Hmm, let me analyze the physics of this giant flying taco...`,
      neutral: `Reporting in for scene rehearsal.`,
      angry: `Hey! Who ate my last double-chocolate cartoon cookie?!`,
      sad: `Aww, I guess the spaceship is out of bubblegum fuel...`,
      scared: `Yikes! Did anyone else hear that giant monster roar?!`,
    };

    speechSynthesizer.speakDialogue(
      testPhrases[emotion] || testPhrases.happy,
      selectedChar,
      emotion,
      () => setIsPlayingVoice(true),
      () => setIsPlayingVoice(false)
    );
  };

  if (!selectedChar) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-7xl mx-auto">
      {/* Left Sidebar: Character List */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white">Character Vault</h2>
          </div>
          <button
            onClick={handleAddCharacter}
            className="flex items-center gap-1 px-3 py-1.5 bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white rounded-lg border border-purple-500/40 text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Character</span>
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          {project.characters.map((char) => {
            const isSelected = char.id === selectedChar.id;
            return (
              <div
                key={char.id}
                onClick={() => setSelectedCharId(char.id)}
                className={`p-3 rounded-xl cursor-pointer transition flex items-center justify-between gap-3 border ${
                  isSelected
                    ? 'bg-purple-950/50 border-purple-500/60 shadow-lg shadow-purple-500/20'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 p-1 border border-slate-700 overflow-hidden shrink-0">
                    <img
                      src={char.emotions['happy'] || char.avatarUrl}
                      alt={char.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">{char.name}</div>
                    <div className="text-xs text-slate-400 line-clamp-1">{char.tagline}</div>
                    <div className="text-[10px] text-purple-400 mt-0.5 capitalize">
                      Voice: {char.voiceGender} • {char.artStyle}
                    </div>
                  </div>
                </div>

                {project.characters.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCharacter(char.id);
                    }}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                    title="Delete character"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Global Art Style Selector */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 mt-2">
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-4 h-4 text-pink-400" />
            <h3 className="text-sm font-semibold text-white">Art Style Preset</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {ART_STYLES.map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  onUpdateProject(prev => ({
                    ...prev,
                    artStyle: st.id,
                    characters: prev.characters.map(c => {
                      const emotions = generateCharacterEmotions(c.name, st.id, c.primaryColor, c.secondaryColor, c.avatarSeed);
                      return { ...c, artStyle: st.id, emotions, avatarUrl: emotions['happy'] };
                    })
                  }));
                }}
                className={`p-2 rounded-xl text-left border transition text-xs flex flex-col gap-1 ${
                  project.artStyle === st.id
                    ? 'bg-gradient-to-br from-purple-600/30 to-pink-600/20 border-purple-500 text-white font-semibold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span className="font-bold">{st.label}</span>
                <span className="text-[10px] text-slate-400 line-clamp-1">{st.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Character Editor & Emotion Grid */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Top Card: Live Avatar & Personality */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Big Avatar Preview */}
            <div className="md:col-span-4 flex flex-col items-center gap-3">
              <div className="w-40 h-40 rounded-2xl bg-gradient-to-b from-purple-950/40 to-slate-950 p-2 border-2 border-purple-500/40 shadow-xl shadow-purple-500/20 flex items-center justify-center relative group">
                <img
                  src={selectedChar.emotions[previewEmotion] || selectedChar.avatarUrl}
                  alt={selectedChar.name}
                  className={`w-full h-full object-contain transition duration-300 ${
                    isPlayingVoice ? 'scale-105 animate-bounce' : ''
                  }`}
                />
                <div className="absolute bottom-2 right-2 bg-slate-900/90 text-purple-300 text-[10px] px-2 py-0.5 rounded-full border border-purple-500/30 capitalize font-medium">
                  {previewEmotion}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRerollAvatar}
                  className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
                  title="Randomize character features"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
                  <span>Reroll Look</span>
                </button>

                <button
                  onClick={() => handleTestVoice(previewEmotion)}
                  disabled={isPlayingVoice}
                  className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-purple-500/30 transition disabled:opacity-50"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isPlayingVoice ? 'Speaking...' : 'Test Voice'}</span>
                </button>
              </div>
            </div>

            {/* Character Info & Customization */}
            <div className="md:col-span-8 flex flex-col gap-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1 block">Character Name</label>
                  <input
                    type="text"
                    value={selectedChar.name}
                    onChange={(e) => updateSelectedChar({ name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-lg px-3 py-1.5 text-sm text-white outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1 block">Tagline / Role</label>
                  <input
                    type="text"
                    value={selectedChar.tagline}
                    onChange={(e) => updateSelectedChar({ tagline: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-lg px-3 py-1.5 text-sm text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Personality & Backstory</label>
                <textarea
                  rows={2}
                  value={selectedChar.personality}
                  onChange={(e) => updateSelectedChar({ personality: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none resize-none"
                />
              </div>

              {/* Color Customizer */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1 block">Primary Color</label>
                  <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                    <input
                      type="color"
                      value={selectedChar.primaryColor}
                      onChange={(e) => updateSelectedChar({ primaryColor: e.target.value })}
                      className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
                    />
                    <span className="text-xs font-mono text-slate-300">{selectedChar.primaryColor}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1 block">Secondary Color</label>
                  <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                    <input
                      type="color"
                      value={selectedChar.secondaryColor}
                      onChange={(e) => updateSelectedChar({ secondaryColor: e.target.value })}
                      className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
                    />
                    <span className="text-xs font-mono text-slate-300">{selectedChar.secondaryColor}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Voice Persona Tuning */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">Voice Synthesizer & Persona</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Voice Persona</label>
              <select
                value={selectedChar.voiceGender}
                onChange={(e) => updateSelectedChar({ voiceGender: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-lg px-3 py-1.5 text-xs text-white outline-none capitalize"
              >
                <option value="male">Hero Male</option>
                <option value="female">Heroine Female</option>
                <option value="child">Cute Child / Tiny Creature</option>
                <option value="robot">Sci-Fi Robot / AI</option>
                <option value="creature">Cartoon Creature</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Pitch</span>
                <span className="font-mono text-purple-400">{selectedChar.voicePitch.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.8"
                step="0.05"
                value={selectedChar.voicePitch}
                onChange={(e) => updateSelectedChar({ voicePitch: parseFloat(e.target.value) })}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Speaking Rate</span>
                <span className="font-mono text-pink-400">{selectedChar.voiceRate.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.5"
                step="0.05"
                value={selectedChar.voiceRate}
                onChange={(e) => updateSelectedChar({ voiceRate: parseFloat(e.target.value) })}
                className="w-full accent-pink-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Emotion Matrix & Consistency Sheet */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Smile className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Expression Sheet & Emotion Consistency</h3>
            </div>
            <span className="text-xs text-slate-400">Click an emotion to preview and test voice</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2.5">
            {EMOTIONS_LIST.map((emo) => {
              const isActive = previewEmotion === emo;
              const svg = selectedChar.emotions[emo] || selectedChar.avatarUrl;
              return (
                <button
                  key={emo}
                  onClick={() => {
                    setPreviewEmotion(emo);
                    handleTestVoice(emo);
                  }}
                  className={`p-2 rounded-xl flex flex-col items-center gap-1.5 transition border ${
                    isActive
                      ? 'bg-purple-950/60 border-purple-500 shadow-md shadow-purple-500/30'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg bg-slate-900 p-0.5 border border-slate-800 overflow-hidden">
                    <img src={svg} alt={emo} className="w-full h-full object-contain" />
                  </div>
                  <span className={`text-[10px] capitalize font-medium ${isActive ? 'text-purple-300 font-bold' : 'text-slate-400'}`}>
                    {emo}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
