import { Sparkles, Film, Play, ArrowRight, ShieldCheck, Users, MapPin, FileText } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStartOneClick: () => void;
  onLoadDemo: () => void;
}

export default function FirstRunWizard({ isOpen, onClose, onStartOneClick, onLoadDemo }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center space-y-3 relative z-10">
          <div
            className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-xl shadow-amber-400/25 mx-auto"
            style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}
          >
            <Film size={32} className="text-slate-950" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
            <Sparkles size={13} />
            <span>Welcome to LiLo Cartoon Maker</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Create Characters. Tell Stories. Bring Them to Life.
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
            Your all-in-one AI Animation Studio. Build recurring original children's cartoon series with consistent
            characters, expressive voices, multi-layered worlds, and 4K rendering.
          </p>
        </div>

        {/* Feature pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10">
          <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-1 text-center">
            <Users size={20} className="text-pink-400 mx-auto mb-1" />
            <div className="font-bold text-white text-xs">Character DNA</div>
            <p className="text-[11px] text-slate-400">Consistent recurring characters across all episodes.</p>
          </div>

          <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-1 text-center">
            <MapPin size={20} className="text-emerald-400 mx-auto mb-1" />
            <div className="font-bold text-white text-xs">Persistent Worlds</div>
            <p className="text-[11px] text-slate-400">Locked location geometries, weather & lighting.</p>
          </div>

          <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-1 text-center">
            <FileText size={20} className="text-amber-400 mx-auto mb-1" />
            <div className="font-bold text-white text-xs">AI Director</div>
            <p className="text-[11px] text-slate-400">Automated screenplay analysis, lip-sync & 4K render.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 relative z-10">
          <button
            onClick={() => {
              onClose();
              onStartOneClick();
            }}
            className="flex-1 py-3.5 rounded-2xl font-extrabold text-slate-950 text-sm shadow-xl shadow-amber-400/25 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}
          >
            <Sparkles size={16} />
            <span>✨ CREATE MY FIRST CARTOON</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onLoadDemo();
            }}
            className="py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <Play size={14} className="text-emerald-400" />
            <span>Explore Demo Episode</span>
          </button>
        </div>
      </div>
    </div>
  );
}
