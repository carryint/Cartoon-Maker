import { useState } from 'react';
import { Package, Plus, Trash2 } from 'lucide-react';
import { PropDNA } from '../../types/lilo';

interface Props {
  propsList: PropDNA[];
  onUpdateProps: (props: PropDNA[]) => void;
}

export default function PropStudio({ propsList, onUpdateProps }: Props) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<any>('toy');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#fde047');

  const handleCreate = () => {
    if (!name.trim()) return;

    const newProp: PropDNA = {
      id: `prop_${Date.now()}`,
      name: name.trim(),
      category,
      description: description.trim() || `A reusable cartoon prop (${name})`,
      color,
      scale: 1.0,
    };

    onUpdateProps([...propsList, newProp]);
    setShowAddModal(false);
    setName('');
    setDescription('');
  };

  const handleDelete = (id: string) => {
    onUpdateProps(propsList.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Package size={26} className="text-blue-400" />
            <span>Prop Studio & Object Library</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Manage reusable cartoon items (maps, toys, food, backpacks, compasses) tracked across scenes by the Continuity
            Engine.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-slate-950 text-sm shadow-lg shadow-amber-400/20 transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}
        >
          <Plus size={18} />
          <span>Add Cartoon Prop</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {propsList.map((p) => (
          <div
            key={p.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-blue-500/40 transition-all shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border border-white/20 shadow"
                  style={{ background: p.color }}
                >
                  📦
                </div>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <h4 className="font-bold text-white text-base">{p.name}</h4>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 capitalize inline-block mt-1">
                {p.category}
              </span>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{p.description}</p>
            </div>
          </div>
        ))}

        {propsList.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            <Package size={40} className="mx-auto mb-2 opacity-30" />
            <p>No props in library. Add props to track continuity across scenes.</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Add Reusable Prop</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">Prop Name *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Magic Compass, Flower Basket"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400"
                >
                  <option value="toy">Toy / Play Item</option>
                  <option value="tool">Tool / Equipment</option>
                  <option value="food">Food / Snack</option>
                  <option value="magic-item">Magic Item</option>
                  <option value="book">Book / Scroll / Map</option>
                  <option value="vehicle">Vehicle / Boat</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">Color</label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full h-9 rounded-xl bg-slate-800 border border-slate-700 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details of what the prop looks like and how characters hold it..."
                  rows={2}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!name.trim()}
                  className="flex-1 py-2.5 rounded-xl font-bold text-slate-950 text-xs transition-all disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}
                >
                  Save Prop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
