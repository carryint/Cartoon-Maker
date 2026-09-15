import React, { useState } from 'react';
import { Plus, Trash2, Volume2, Sparkles, RefreshCw, Palette, User, Smile, Sliders, Image, Eye, Shirt, Globe2, Wand2, ShieldCheck, Heart } from 'lucide-react';
import { Project, Character, ArtStyle, CharacterEmotion, SupportedLanguage, VoicePersona } from '../../types/cartoon';
import { generateCharacterEmotions } from '../../services/avatarGenerator';
import { speechSynthesizer, SUPPORTED_LANGUAGES, VOICE_PERSONAS } from '../../services/speechSynthesizer';
import { LILO_CHARACTER_BOARD, MOZZ_CHARACTER_BOARD } from '../../data/liloMozzDefaults';

interface CharacterStudioProps {
  project: Project;
  onUpdateProject: (updater: (prev: Project) => Project) => void;
}

const EMOTIONS_LIST: CharacterEmotion[] = [
  'happy',
  'excited',
  'surprised',
  'winking',
  'thinking',
  'neutral',
  'angry',
  'sad',
  'scared',
];

export const CharacterStudio: React.FC<CharacterStudioProps> = ({ project, onUpdateProject }) => {
  const [selectedCharId, setSelectedCharId] = useState<string>(
    project.characters[0]?.id || 'char_lilo'
  );
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [previewEmotion, setPreviewEmotion] = useState<CharacterEmotion>('happy');
  const [showFullBoard, setShowFullBoard] = useState(false);
  const [selectedTestLang, setSelectedTestLang] = useState<SupportedLanguage>('en-US');

  const selectedChar = project.characters.find(c => c.id === selectedCharId) || project.characters[0];

  const updateSelectedChar = (fields: Partial<Character>) => {
    if (!selectedChar) return;
    onUpdateProject(prev => ({
      ...prev,
      characters: prev.characters.map(c => {
        if (c.id !== selectedChar.id) return c;
        const updated = { ...c, ...fields };

        if (fields.avatarSeed || fields.primaryColor || fields.secondaryColor || fields.name) {
          if (!updated.customAvatarUrl) {
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
        }

        return updated;
      })
    }));
  };

  /**
   * Automatically auto-assign voice persona and acoustic parameters
   */
  const handleAutoAssignVoice = () => {
    if (!selectedChar) return;
    const assignment = speechSynthesizer.autoAssignVoicePersona(selectedChar);
    updateSelectedChar({
      voicePersona: assignment.persona,
      voicePitch: assignment.pitch,
      voiceRate: assignment.rate,
      voiceGender: assignment.gender,
    });
  };

  /**
   * Test Voice in the active character language with persona tone
   */
  const handleTestVoice = (emotion: CharacterEmotion = previewEmotion, lang: SupportedLanguage = selectedChar.language || selectedTestLang) => {
    if (!selectedChar) return;
    setIsPlayingVoice(true);

    const phrase = speechSynthesizer.getLocalizedSamplePhrase(selectedChar, lang);
    const charWithLang: Character = {
      ...selectedChar,
      language: lang,
    };

    speechSynthesizer.speakDialogue(
      phrase,
      charWithLang,
      emotion,
      () => setIsPlayingVoice(true),
      () => setIsPlayingVoice(false)
    );
  };

  const boardInfo = selectedChar.id === 'char_lilo' 
    ? LILO_CHARACTER_BOARD 
    : selectedChar.id === 'char_mozz' 
    ? MOZZ_CHARACTER_BOARD 
    : selectedChar.characterBoard;

  const currentPersona = VOICE_PERSONAS.find(p => p.id === selectedChar.voicePersona) || 
    (selectedChar.id === 'char_lilo' ? VOICE_PERSONAS[0] : selectedChar.id === 'char_mozz' ? VOICE_PERSONAS[1] : VOICE_PERSONAS[2]);

  if (!selectedChar) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-7xl mx-auto">
      {/* Left Sidebar: Character Vault & Selection */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white">Character Vault</h2>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
            LiLo & Mozz Official
          </span>
        </div>

        {/* Character List */}
        <div className="flex flex-col gap-2.5">
          {project.characters.map((char) => {
            const isSelected = char.id === selectedChar.id;
            const isLilo = char.id === 'char_lilo';
            const isMozz = char.id === 'char_mozz';
            return (
              <div
                key={char.id}
                onClick={() => {
                  setSelectedCharId(char.id);
                  if (char.language) setSelectedTestLang(char.language);
                }}
                className={`p-3 rounded-2xl cursor-pointer transition flex items-center justify-between gap-3 border ${
                  isSelected
                    ? 'bg-purple-950/60 border-purple-500/80 shadow-xl shadow-purple-500/20 ring-1 ring-purple-500'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-slate-950 p-1 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                    <img
                      src={char.avatarUrl || char.emotions['happy']}
                      alt={char.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-1.5">
                      <span>{char.name}</span>
                      {isLilo && <span className="text-xs">🌸</span>}
                      {isMozz && <span className="text-xs">🐱</span>}
                    </div>
                    <div className="text-xs text-slate-400 line-clamp-1">{char.tagline}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-medium">
                        {isLilo ? 'Baby Girl Voice' : isMozz ? 'Cat Sounds' : char.voicePersona || 'Sweet Girl'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" title="Active character" />
              </div>
            );
          })}
        </div>

        {/* Character Board Card Quick Trigger */}
        {boardInfo && (
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4 text-pink-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Official Model Sheet</h3>
              </div>
              <button
                onClick={() => setShowFullBoard(!showFullBoard)}
                className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showFullBoard ? 'Hide Board' : 'View Full Board'}</span>
              </button>
            </div>

            <div
              onClick={() => setShowFullBoard(!showFullBoard)}
              className="w-full h-32 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 cursor-pointer relative group"
            >
              <img
                src={boardInfo.boardImageUrl}
                alt={`${selectedChar.name} Character Board`}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-white font-bold transition backdrop-blur-xs">
                Click to inspect Character Board
              </div>
            </div>

            {/* Color Palette Swatches */}
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block mb-1.5">Official Color Palette:</span>
              <div className="flex items-center gap-1.5">
                {boardInfo.colorPalette.map((color, idx) => (
                  <div
                    key={idx}
                    className="w-6 h-6 rounded-full border border-white/20 shadow-sm"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Character Editor, Outfits & Full Board View */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Full Character Board Modal / Expanded View */}
        {showFullBoard && boardInfo && (
          <div className="bg-slate-900 border-2 border-purple-500/50 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>{selectedChar.name} — Official Production Character Board</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Full model sheet with outfits, facial expressions, and camera turnaround angles.
                </p>
              </div>
              <button
                onClick={() => setShowFullBoard(false)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-white font-bold rounded-xl"
              >
                Close View
              </button>
            </div>

            <div className="w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
              <img
                src={boardInfo.boardImageUrl}
                alt="Character Board"
                className="w-full h-auto object-contain max-h-[70vh]"
              />
            </div>
          </div>
        )}

        {/* Top Character Inspector Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Big Character Portrait */}
            <div className="md:col-span-4 flex flex-col items-center gap-3">
              <div className="w-48 h-48 rounded-2xl bg-gradient-to-b from-purple-950/40 via-slate-950 to-slate-950 p-2 border-2 border-purple-500/40 shadow-xl shadow-purple-500/20 flex items-center justify-center relative group">
                <img
                  src={selectedChar.avatarUrl || selectedChar.customAvatarUrl}
                  alt={selectedChar.name}
                  className={`w-full h-full object-contain transition duration-300 ${
                    isPlayingVoice ? 'scale-105 animate-bounce' : ''
                  }`}
                />
                <div className="absolute bottom-2 right-2 bg-slate-900/90 text-purple-300 text-[10px] px-2.5 py-0.5 rounded-full border border-purple-500/30 capitalize font-medium">
                  {previewEmotion}
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 w-full">
                <button
                  onClick={() => handleTestVoice(previewEmotion, selectedChar.language || selectedTestLang)}
                  disabled={isPlayingVoice}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-500/30 transition disabled:opacity-50"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isPlayingVoice ? 'Speaking Voice Line...' : 'Test Voice in Language'}</span>
                </button>
              </div>
            </div>

            {/* Character Info & Personality */}
            <div className="md:col-span-8 flex flex-col gap-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1 block">Character Name</label>
                  <input
                    type="text"
                    value={selectedChar.name}
                    onChange={(e) => updateSelectedChar({ name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3 py-2 text-sm text-white outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1 block">Role / Tagline</label>
                  <input
                    type="text"
                    value={selectedChar.tagline}
                    onChange={(e) => updateSelectedChar({ tagline: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3 py-2 text-sm text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Personality & Nature Lore</label>
                <textarea
                  rows={2}
                  value={selectedChar.personality}
                  onChange={(e) => updateSelectedChar({ personality: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none resize-none"
                />
              </div>

              {/* Character Language & Auto-Assign Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                    <Globe2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Character Spoken Language</span>
                  </label>
                  <select
                    value={selectedChar.language || project.language || 'en-US'}
                    onChange={(e) => {
                      const lang = e.target.value as SupportedLanguage;
                      updateSelectedChar({ language: lang });
                      setSelectedTestLang(lang);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.flag} {l.name} ({l.nativeName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <button
                    onClick={handleAutoAssignVoice}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-purple-300 hover:text-white rounded-xl text-xs font-bold transition border border-slate-700"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Auto-Assign Voice Profile</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Voice Persona & Acoustical Identity Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-pink-400" />
              <h3 className="text-sm font-bold text-white">Voice Persona & Character Sound Profile</h3>
            </div>
            {selectedChar.id === 'char_lilo' ? (
              <span className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                Permanent LiLo Cute Baby Girl Voice
              </span>
            ) : selectedChar.id === 'char_mozz' ? (
              <span className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-bold border border-orange-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                Permanent Mozz Playful Cat Sound Voice
              </span>
            ) : null}
          </div>

          {/* Voice Personas Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
            {VOICE_PERSONAS.map((vp) => {
              const isSelected = (selectedChar.voicePersona || 'sweet-girl') === vp.id;
              return (
                <button
                  key={vp.id}
                  onClick={() => {
                    updateSelectedChar({
                      voicePersona: vp.id,
                      voicePitch: vp.defaultPitch,
                      voiceRate: vp.defaultRate,
                      voiceGender: vp.suggestedGender,
                    });
                  }}
                  className={`p-2.5 rounded-xl text-left border transition flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-purple-950/60 border-purple-500 text-white font-bold ring-2 ring-purple-500/30'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{vp.icon}</span>
                    <span className="text-xs font-bold line-clamp-1">{vp.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                    {vp.description}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Voice Synthesizer Fine Tuning */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Voice Pitch (Tone)</span>
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
                <span>Speaking Speed (Cadence)</span>
                <span className="font-mono text-pink-400">{selectedChar.voiceRate.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.4"
                step="0.05"
                value={selectedChar.voiceRate}
                onChange={(e) => updateSelectedChar({ voiceRate: parseFloat(e.target.value) })}
                className="w-full accent-pink-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Outfit Selection Sheet */}
        {boardInfo?.outfits && boardInfo.outfits.length > 0 && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shirt className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Outfits & Wardrobe Presets</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {boardInfo.outfits.map((outfit) => {
                const isSelected = (selectedChar.selectedOutfit || boardInfo.outfits[0].id) === outfit.id;
                return (
                  <button
                    key={outfit.id}
                    onClick={() => updateSelectedChar({ selectedOutfit: outfit.id })}
                    className={`p-3 rounded-2xl text-left border transition flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-purple-950/60 border-purple-500 text-white font-bold ring-2 ring-purple-500/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-xs font-bold">{outfit.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal line-clamp-2">
                      {outfit.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Expressions Matrix */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Smile className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Facial Expressions & Emotion Modulation</h3>
            </div>
            <span className="text-xs text-slate-400">Click to preview emotion & voice tone in {selectedChar.language || selectedTestLang}</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2.5">
            {EMOTIONS_LIST.map((emo) => {
              const isActive = previewEmotion === emo;
              const imgUrl = selectedChar.emotions[emo] || selectedChar.avatarUrl;
              return (
                <button
                  key={emo}
                  onClick={() => {
                    setPreviewEmotion(emo);
                    handleTestVoice(emo, selectedChar.language || selectedTestLang);
                  }}
                  className={`p-2 rounded-xl flex flex-col items-center gap-1.5 transition border ${
                    isActive
                      ? 'bg-purple-950/60 border-purple-500 shadow-md shadow-purple-500/30 ring-1 ring-purple-500'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg bg-slate-900 p-0.5 border border-slate-800 overflow-hidden flex items-center justify-center">
                    <img src={imgUrl} alt={emo} className="w-full h-full object-contain" />
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
