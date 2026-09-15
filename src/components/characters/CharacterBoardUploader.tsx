import { useState, useCallback, useRef } from 'react';
import { Upload, User, Trash2, Wand2, Lock, RefreshCw, Plus } from 'lucide-react';
import { Character } from '../../types/studio';
import { SUPPORTED_LANGUAGES } from '../../data/defaults';
import { fileToDataUrl, parseCharacterFromText, extractColorsFromImage } from '../../services/characterBoardParser';
import { autoAssignVoiceProfile } from '../../services/voiceEngine';

interface Props {
  characters: Character[];
  onUpdate: (chars: Character[]) => void;
}

function CharacterCard({ char, onEdit, onDelete }: {
  char: Character;
  onEdit: (c: Character) => void;
  onDelete: (id: string) => void;
}) {
  const roleColors: Record<string, string> = {
    protagonist: 'text-amber-400 bg-amber-400/10',
    sidekick: 'text-blue-400 bg-blue-400/10',
    antagonist: 'text-red-400 bg-red-400/10',
    narrator: 'text-purple-400 bg-purple-400/10',
    animal: 'text-green-400 bg-green-400/10',
    guest: 'text-slate-400 bg-slate-400/10',
  };

  return (
    <div className="relative bg-slate-800/80 border border-slate-700 rounded-2xl overflow-hidden group hover:border-amber-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-400/10">
      {/* Character Image */}
      <div className="relative h-48 bg-slate-900 flex items-center justify-center overflow-hidden">
        {char.boardImageUrl ? (
          <img
            src={char.boardImageUrl}
            alt={char.name}
            className="w-full h-full object-contain"
            style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))' }}
          />
        ) : (
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl"
            style={{ background: `linear-gradient(135deg,${char.colorPrimary},${char.colorSecondary})` }}>
            <User size={40} className="text-white" />
          </div>
        )}
        {/* Color dots */}
        <div className="absolute bottom-2 right-2 flex gap-1">
          <div className="w-4 h-4 rounded-full border border-white/30" style={{ background: char.colorPrimary }} />
          <div className="w-4 h-4 rounded-full border border-white/30" style={{ background: char.colorSecondary }} />
        </div>
        {char.isLocked && (
          <div className="absolute top-2 left-2 bg-amber-400 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Lock size={10} /> Default
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-white text-lg">{char.name}</h3>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${roleColors[char.role] || 'text-slate-400'}`}>
              {char.role}
            </span>
          </div>
          {!char.isLocked && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onEdit(char)} className="p-1.5 rounded-lg bg-slate-700 hover:bg-amber-400/20 hover:text-amber-400 transition-colors" title="Edit">
                <RefreshCw size={14} />
              </button>
              <button onClick={() => onDelete(char.id)} className="p-1.5 rounded-lg bg-slate-700 hover:bg-red-400/20 hover:text-red-400 transition-colors" title="Remove">
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
        <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">{char.description}</p>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <span>🎙️ Pitch {char.voiceProfile.pitch.toFixed(1)}</span>
          <span>·</span>
          <span>Rate {char.voiceProfile.rate.toFixed(1)}</span>
          <span>·</span>
          <span className="capitalize">{char.voiceProfile.gender}</span>
        </div>
      </div>
    </div>
  );
}

interface AddCharForm {
  name: string;
  role: Character['role'];
  description: string;
  imageUrl: string;
  imageFile: File | null;
  lang: string;
  pitch: number;
  rate: number;
  gender: Character['voiceProfile']['gender'];
}

const EMPTY_FORM: AddCharForm = {
  name: '',
  role: 'guest',
  description: '',
  imageUrl: '',
  imageFile: null,
  lang: 'en-US',
  pitch: 1.0,
  rate: 1.0,
  gender: 'female',
};

export default function CharacterBoardUploader({ characters, onUpdate }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editChar, setEditChar] = useState<Character | null>(null);
  const [form, setForm] = useState<AddCharForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setLoading(true);
    const url = await fileToDataUrl(file);
    const colors = await extractColorsFromImage(url);
    setForm(prev => ({
      ...prev,
      imageUrl: url,
      imageFile: file,
      name: prev.name || file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
    }));
    setLoading(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const autoFill = () => {
    if (!form.description && !form.name) return;
    const tempChar: Character = {
      id: 'temp', name: form.name, role: form.role, description: form.description,
      boardImageUrl: form.imageUrl, colorPrimary: '#8b5cf6', colorSecondary: '#06b6d4',
      voiceProfile: { lang: form.lang, pitch: form.pitch, rate: form.rate, gender: form.gender },
    };
    const vp = autoAssignVoiceProfile(tempChar);
    setForm(prev => ({ ...prev, pitch: vp.pitch, rate: vp.rate, gender: vp.gender }));
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    const id = editChar?.id || `char_${Date.now()}`;
    const newChar: Character = {
      id,
      name: form.name.trim(),
      role: form.role,
      description: form.description.trim(),
      boardImageUrl: form.imageUrl,
      colorPrimary: '#8b5cf6',
      colorSecondary: '#06b6d4',
      voiceProfile: { lang: form.lang, pitch: form.pitch, rate: form.rate, gender: form.gender },
    };
    if (editChar) {
      onUpdate(characters.map(c => c.id === editChar.id ? newChar : c));
    } else {
      onUpdate([...characters, newChar]);
    }
    setShowForm(false);
    setEditChar(null);
    setForm(EMPTY_FORM);
  };

  const handleEdit = (char: Character) => {
    setEditChar(char);
    setForm({
      name: char.name, role: char.role, description: char.description,
      imageUrl: char.boardImageUrl, imageFile: null,
      lang: char.voiceProfile.lang, pitch: char.voiceProfile.pitch,
      rate: char.voiceProfile.rate, gender: char.voiceProfile.gender,
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Character Boards</h2>
          <p className="text-slate-400 text-sm mt-1">Upload your character reference images. The AI will use these to animate your characters in the video.</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditChar(null); setForm(EMPTY_FORM); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-slate-900 transition-all hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}
        >
          <Plus size={18} /> Add Character
        </button>
      </div>

      {/* Characters Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {characters.map(char => (
          <CharacterCard key={char.id} char={char} onEdit={handleEdit} onDelete={(id) => onUpdate(characters.filter(c => c.id !== id))} />
        ))}
        {characters.length === 0 && (
          <div className="col-span-full text-center py-16 text-slate-500">
            <User size={48} className="mx-auto mb-4 opacity-30" />
            <p>No characters yet. Add your first character above.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white">{editChar ? 'Edit Character' : 'Add New Character'}</h3>

            {/* Image Drop Zone */}
            <div
              className={`relative border-2 border-dashed rounded-xl transition-colors cursor-pointer ${dragOver ? 'border-amber-400 bg-amber-400/10' : 'border-slate-600 hover:border-slate-500'}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              {form.imageUrl ? (
                <img src={form.imageUrl} alt="preview" className="w-full h-44 object-contain rounded-xl" />
              ) : (
                <div className="py-10 flex flex-col items-center gap-3 text-slate-400">
                  {loading ? <RefreshCw size={36} className="animate-spin" /> : <Upload size={36} />}
                  <div className="text-sm text-center">
                    <span className="text-amber-400 font-semibold">Click or drag</span> to upload character board image
                    <div className="text-xs text-slate-500 mt-1">PNG, JPG, WebP — any size</div>
                  </div>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
            </div>

            {/* Name & Role */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Character Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. LiLo"
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Role</label>
                <select
                  value={form.role}
                  onChange={e => setForm(p => ({ ...p, role: e.target.value as Character['role'] }))}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400"
                >
                  {(['protagonist', 'sidekick', 'animal', 'narrator', 'antagonist', 'guest'] as const).map(r => (
                    <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-slate-400">Description / Personality</label>
                <button onClick={autoFill} className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors">
                  <Wand2 size={12} /> Auto-assign voice
                </button>
              </div>
              <textarea
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Describe the character's appearance, personality, age, and role in the story..."
                rows={3}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            {/* Voice Settings */}
            <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Voice Profile</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Language</label>
                  <select
                    value={form.lang}
                    onChange={e => setForm(p => ({ ...p, lang: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    {SUPPORTED_LANGUAGES.map(l => (
                      <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Gender</label>
                  <select
                    value={form.gender}
                    onChange={e => setForm(p => ({ ...p, gender: e.target.value as Character['voiceProfile']['gender'] }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    {(['female', 'male', 'child', 'creature'] as const).map(g => (
                      <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Pitch: {form.pitch.toFixed(2)}</label>
                  <input type="range" min="0.5" max="2" step="0.05" value={form.pitch}
                    onChange={e => setForm(p => ({ ...p, pitch: parseFloat(e.target.value) }))}
                    className="w-full accent-amber-400" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Rate: {form.rate.toFixed(2)}</label>
                  <input type="range" min="0.5" max="2" step="0.05" value={form.rate}
                    onChange={e => setForm(p => ({ ...p, rate: parseFloat(e.target.value) }))}
                    className="w-full accent-amber-400" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setShowForm(false); setEditChar(null); }}
                className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:border-slate-400 transition-colors text-sm font-medium">
                Cancel
              </button>
              <button onClick={handleSave}
                disabled={!form.name.trim()}
                className="flex-1 py-2.5 rounded-xl font-semibold text-slate-900 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}>
                {editChar ? 'Save Changes' : 'Add Character'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
