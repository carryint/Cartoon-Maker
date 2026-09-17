import { useState, useRef } from 'react';
import {
  Users,
  Plus,
  Lock,
  Unlock,
  Volume2,
  Sparkles,
  Trash2,
  RefreshCw,
  Eye,
  Activity,
  CheckCircle2,
  Smile,
} from 'lucide-react';
import { CharacterDNA, VoiceProfile } from '../../types/lilo';
import { drawRiggedCharacter } from '../../core/engines/characterEngine';
import { synthesizeDialogueSpeech } from '../../core/engines/audioEngine';

interface Props {
  characters: CharacterDNA[];
  onUpdateCharacters: (chars: CharacterDNA[]) => void;
}

function LiveCharacterCanvas({ char }: { char: CharacterDNA }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [emotion, setEmotion] = useState<any>('happy');

  const handleTestVoice = () => {
    setIsSpeaking(true);
    synthesizeDialogueSpeech(
      `Hello! I am ${char.name}. Welcome to our animated story!`,
      char.voiceProfile,
      'en-US'
    ).then(() => {
      setTimeout(() => setIsSpeaking(false), 2400);
    });
  };

  // Render loop
  useState(() => {
    let animId: number;
    const render = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          // Soft stage backdrop
          const bg = ctx.createRadialGradient(150, 100, 10, 150, 100, 160);
          bg.addColorStop(0, 'rgba(30, 41, 59, 0.4)');
          bg.addColorStop(1, 'rgba(15, 23, 42, 0.9)');
          ctx.fillStyle = bg;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          drawRiggedCharacter(ctx, char, 60, 20, 180, 220, {
            time: performance.now() / 1000,
            isTalking: isSpeaking,
            emotion,
            pose: isSpeaking ? 'talking' : 'standing',
          });
        }
      }
      animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  });

  return (
    <div className="relative h-64 bg-slate-950 flex flex-col items-center justify-center overflow-hidden border-b border-slate-800">
      <canvas ref={canvasRef} width={300} height={260} className="w-full h-full object-contain" />

      {/* Badges */}
      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
        <Activity size={12} className="animate-pulse text-emerald-400" />
        <span>Live 3D/2D Rig</span>
      </div>

      {char.isLocked && (
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[11px] font-bold">
          <Lock size={11} />
          <span>Locked DNA</span>
        </div>
      )}

      {/* Control Overlay */}
      <div className="absolute bottom-2 inset-x-2 flex items-center justify-between px-2 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800 text-xs">
        <button
          onClick={handleTestVoice}
          disabled={isSpeaking}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all ${
            isSpeaking ? 'bg-amber-400 text-slate-950 animate-pulse' : 'text-amber-300 hover:bg-amber-400/20'
          }`}
        >
          <Volume2 size={13} />
          <span>{isSpeaking ? 'Speaking...' : 'Test Voice'}</span>
        </button>

        <div className="flex items-center gap-1">
          {(['happy', 'excited', 'curious'] as const).map((emo) => (
            <button
              key={emo}
              onClick={() => setEmotion(emo)}
              className={`px-1.5 py-0.5 rounded text-[11px] transition-colors ${
                emotion === emo ? 'bg-slate-700 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {emo === 'happy' ? '😊' : emo === 'excited' ? '⚡' : '💡'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CharacterStudio({ characters, onUpdateCharacters }: Props) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<any>('protagonist');
  const [age, setAge] = useState(6);
  const [skinTone, setSkinTone] = useState('#fed7aa');
  const [topColor, setTopColor] = useState('#ec4899');
  const [bottomColor, setBottomColor] = useState('#1e40af');
  const [pitch, setPitch] = useState(1.4);
  const [rate, setRate] = useState(1.0);
  const [voiceCategory, setVoiceCategory] = useState<any>('child-girl');
  const [customImgUrl, setCustomImgUrl] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return;

    const newChar: CharacterDNA = {
      id: `char_${Date.now()}`,
      name: name.trim(),
      role,
      personality: ['Playful', 'Curious'],
      appearance: {
        age,
        species: 'human',
        skinTone,
        hairStyle: 'Cartoon style',
        hairColor: '#78350f',
        eyeColor: '#0284c7',
        eyeShape: 'Round expressive',
        bodyType: 'Child',
        heightRatio: 1.0,
        distinctiveFeatures: [],
      },
      clothing: {
        outfitName: 'Signature Look',
        topColor,
        bottomColor,
        footwear: 'Shoes',
        accessories: [],
      },
      voiceProfile: {
        id: `voice_${Date.now()}`,
        name: `${name} Voice`,
        category: voiceCategory,
        lang: 'en-US',
        pitch,
        rate,
        provider: 'local-speech',
        isLocked: true,
      },
      references: {
        frontUrl: customImgUrl || undefined,
        expressions: {},
        poses: {},
      },
      primaryColor: topColor,
      secondaryColor: bottomColor,
      isLocked: true,
      version: 1,
      negativeConstraints: [],
    };

    onUpdateCharacters([...characters, newChar]);
    setShowAddModal(false);
    setName('');
    setCustomImgUrl('');
  };

  const handleToggleLock = (id: string) => {
    onUpdateCharacters(
      characters.map((c) => (c.id === id ? { ...c, isLocked: !c.isLocked } : c))
    );
  };

  const handleDelete = (id: string) => {
    onUpdateCharacters(characters.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Users size={26} className="text-pink-400" />
            <span>Character Studio & DNA Engine</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Build original children's cartoon characters with consistent visual identity, 2.5D/3D rigs, and locked voice
            profiles.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-slate-950 text-sm shadow-lg shadow-amber-400/20 transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}
        >
          <Plus size={18} />
          <span>Create Original Character</span>
        </button>
      </div>

      {/* Characters List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {characters.map((char) => (
          <div
            key={char.id}
            className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-pink-500/40 transition-all duration-300 shadow-xl flex flex-col justify-between"
          >
            <div>
              <LiveCharacterCanvas char={char} />

              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">{char.name}</h3>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 capitalize inline-block mt-1">
                      {char.role} • Age {char.appearance.age}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleLock(char.id)}
                      className={`p-2 rounded-xl border transition-colors ${
                        char.isLocked
                          ? 'bg-amber-400/20 border-amber-400/40 text-amber-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                      title={char.isLocked ? 'Character Locked' : 'Unlock Character'}
                    >
                      {char.isLocked ? <Lock size={15} /> : <Unlock size={15} />}
                    </button>
                    <button
                      onClick={() => handleDelete(char.id)}
                      className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/40 transition-colors"
                      title="Delete Character"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-slate-500">Outfit:</span> {char.clothing.outfitName}
                  </div>
                  <div>
                    <span className="text-slate-500">Voice:</span> {char.voiceProfile.category}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Character Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xl font-bold text-white">Create Original Cartoon Character</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white text-lg">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Character Name *
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Maya, Benny, Sparky"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Story Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400"
                  >
                    <option value="protagonist">Protagonist (Hero)</option>
                    <option value="sidekick">Sidekick / Best Friend</option>
                    <option value="animal">Animal Companion</option>
                    <option value="mentor">Wise Mentor / Teacher</option>
                    <option value="narrator">Narrator</option>
                    <option value="guest">Guest Character</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Age: {age}
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="15"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full accent-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Top Color
                  </label>
                  <input
                    type="color"
                    value={topColor}
                    onChange={(e) => setTopColor(e.target.value)}
                    className="w-full h-9 rounded-xl bg-slate-800 border border-slate-700 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Pants/Skirt
                  </label>
                  <input
                    type="color"
                    value={bottomColor}
                    onChange={(e) => setBottomColor(e.target.value)}
                    className="w-full h-9 rounded-xl bg-slate-800 border border-slate-700 cursor-pointer"
                  />
                </div>
              </div>

              {/* Optional Custom Reference Image */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Reference Image URL / 3D Board (Optional)
                </label>
                <input
                  value={customImgUrl}
                  onChange={(e) => setCustomImgUrl(e.target.value)}
                  placeholder="Paste image URL (PNG/JPG) or leave empty for procedural 3D rig"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Voice Settings */}
              <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-2xl space-y-3">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Volume2 size={14} />
                  <span>Voice Actor Settings</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Voice Persona</label>
                    <select
                      value={voiceCategory}
                      onChange={(e) => setVoiceCategory(e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-2 py-1.5 text-white text-xs"
                    >
                      <option value="child-girl">Child Girl (Soft & Energetic)</option>
                      <option value="child-boy">Child Boy (Enthusiastic)</option>
                      <option value="baby">Toddler / Baby</option>
                      <option value="creature">Animal / Puppy Sounds</option>
                      <option value="adult-woman">Adult Woman (Mother/Teacher)</option>
                      <option value="adult-man">Adult Man (Father/Guide)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Voice Pitch: {pitch.toFixed(2)}</label>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.05"
                      value={pitch}
                      onChange={(e) => setPitch(parseFloat(e.target.value))}
                      className="w-full accent-amber-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 font-semibold text-sm hover:border-slate-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!name.trim()}
                  className="flex-1 py-3 rounded-xl font-bold text-slate-950 text-sm transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40 shadow-lg shadow-amber-400/20"
                  style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}
                >
                  Save Character DNA
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
