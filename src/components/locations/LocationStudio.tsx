import { useState, useRef } from 'react';
import { MapPin, Plus, Lock, Unlock, Trash2, Sun, CloudRain, Moon, Sparkles } from 'lucide-react';
import { LocationDNA } from '../../types/lilo';
import { drawLocationEnvironment } from '../../core/engines/locationEngine';

interface Props {
  locations: LocationDNA[];
  onUpdateLocations: (locs: LocationDNA[]) => void;
}

function LiveLocationCanvas({ location }: { location: LocationDNA }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useState(() => {
    let animId: number;
    const render = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawLocationEnvironment(
            ctx,
            canvas.width,
            canvas.height,
            location,
            location.defaultLighting,
            location.defaultWeather,
            performance.now() / 1000
          );
        }
      }
      animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  });

  return (
    <div className="relative h-48 bg-slate-950 overflow-hidden border-b border-slate-800">
      <canvas ref={canvasRef} width={400} height={200} className="w-full h-full object-cover" />

      {location.isLocked && (
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
          <Lock size={11} />
          <span>Locked World</span>
        </div>
      )}

      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-[11px] text-slate-300">
        <span className="capitalize">{location.type}</span> • <span className="capitalize">{location.defaultLighting.replace('-', ' ')}</span>
      </div>
    </div>
  );
}

export default function LocationStudio({ locations, onUpdateLocations }: Props) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<any>('forest');
  const [description, setDescription] = useState('');
  const [lighting, setLighting] = useState<any>('morning-sunlight');
  const [weather, setWeather] = useState<any>('sunny');

  const handleCreate = () => {
    if (!name.trim()) return;

    const newLoc: LocationDNA = {
      id: `loc_${Date.now()}`,
      name: name.trim(),
      type,
      description: description.trim() || `An original storybook cartoon location in ${name}`,
      architecture: 'Storybook cartoon architecture',
      terrain: 'Natural cartoon ground',
      vegetation: 'Vibrant flowers and trees',
      colorPalette: ['#166534', '#38bdf8', '#facc15'],
      defaultLighting: lighting,
      defaultWeather: weather,
      backgroundElements: ['swaying-trees', 'flying-butterflies'],
      isLocked: true,
      version: 1,
    };

    onUpdateLocations([...locations, newLoc]);
    setShowAddModal(false);
    setName('');
    setDescription('');
  };

  const handleToggleLock = (id: string) => {
    onUpdateLocations(locations.map((l) => (l.id === id ? { ...l, isLocked: !l.isLocked } : l)));
  };

  const handleDelete = (id: string) => {
    onUpdateLocations(locations.filter((l) => l.id !== id));
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <MapPin size={26} className="text-emerald-400" />
            <span>Location Studio & Environment DNA</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Create recurring, consistent cartoon worlds. When a character returns to this place, the visual identity is
            permanently preserved.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-slate-950 text-sm shadow-lg shadow-amber-400/20 transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}
        >
          <Plus size={18} />
          <span>Create Original Location</span>
        </button>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((loc) => (
          <div
            key={loc.id}
            className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-emerald-500/40 transition-all duration-300 shadow-xl flex flex-col justify-between"
          >
            <div>
              <LiveLocationCanvas location={loc} />

              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">{loc.name}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1 line-clamp-2">{loc.description}</p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleLock(loc.id)}
                      className={`p-2 rounded-xl border transition-colors ${
                        loc.isLocked
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                      title={loc.isLocked ? 'Location Locked' : 'Unlock Location'}
                    >
                      {loc.isLocked ? <Lock size={15} /> : <Unlock size={15} />}
                    </button>
                    <button
                      onClick={() => handleDelete(loc.id)}
                      className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/40 transition-colors"
                      title="Delete Location"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Location Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xl font-bold text-white">Create Original Location</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white text-lg">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Location Name *
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Whispering Forest, Sunny Meadow, Treehouse"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Environment Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400"
                >
                  <option value="cottage">Cozy Storybook Cottage</option>
                  <option value="forest">Enchanted Pine Forest</option>
                  <option value="lake">Magic Glowing Lake / River</option>
                  <option value="beach">Sunny Sandy Beach</option>
                  <option value="village">Friendly Cartoon Village</option>
                  <option value="bedroom">Cozy Child Bedroom</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the architectural elements, colors, vegetation, and mood..."
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Default Lighting
                  </label>
                  <select
                    value={lighting}
                    onChange={(e) => setLighting(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-1.5 text-white text-xs"
                  >
                    <option value="morning-sunlight">Morning Sunlight</option>
                    <option value="golden-hour">Golden Hour</option>
                    <option value="warm-sunset">Warm Sunset</option>
                    <option value="moonlit-night">Moonlit Night</option>
                    <option value="mystical-glow">Mystical Glow</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Default Weather
                  </label>
                  <select
                    value={weather}
                    onChange={(e) => setWeather(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-1.5 text-white text-xs"
                  >
                    <option value="sunny">Sunny</option>
                    <option value="partly-cloudy">Partly Cloudy</option>
                    <option value="rainy">Rainy</option>
                    <option value="windy">Windy</option>
                  </select>
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
                  Save Location DNA
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
