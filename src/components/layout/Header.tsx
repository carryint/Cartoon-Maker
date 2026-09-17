import { Film, Sparkles, ShieldCheck, Settings, Play, SlidersHorizontal, RefreshCw, FolderDown, RotateCcw } from 'lucide-react';
import { Project } from '../../types/lilo';

interface Props {
  project: Project;
  currentTab: string;
  onTabChange: (tab: string) => void;
  isProMode: boolean;
  onToggleProMode: () => void;
  onOpenOneClick: () => void;
  onOpenProviders: () => void;
  onLoadDemo: () => void;
  onResetProject: () => void;
}

export default function Header({
  project,
  isProMode,
  onToggleProMode,
  onOpenOneClick,
  onOpenProviders,
  onLoadDemo,
  onResetProject,
}: Props) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 h-16 flex items-center justify-between">
      {/* Brand & Series Title */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-400/20"
          style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}
        >
          <Film size={22} className="text-slate-950" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white text-base tracking-tight">LiLo Cartoon Maker</span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
              AI Orchestrator
            </span>
          </div>
          <div className="text-xs text-slate-400 truncate max-w-[240px] sm:max-w-xs">
            {project.seriesName} • {project.title}
          </div>
        </div>
      </div>

      {/* Center / Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* One-Click Cartoon CTA */}
        <button
          onClick={onOpenOneClick}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-slate-950 text-xs shadow-md transition-all hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}
          title="Create a complete cartoon episode in one click"
        >
          <Sparkles size={14} />
          <span className="hidden sm:inline">One-Click Cartoon</span>
          <span className="sm:hidden">Auto</span>
        </button>

        {/* Load Demo Button */}
        <button
          onClick={onLoadDemo}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
          title="Load demo: LiLo and the Magic Lake"
        >
          <Play size={13} className="text-emerald-400" />
          <span>Demo Episode</span>
        </button>

        {/* Child-Safe Badge */}
        <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>Child-Safe ON</span>
        </div>

        {/* Mode Switcher: Simple vs Pro */}
        <button
          onClick={onToggleProMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
            isProMode
              ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-sm'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Pro Mode / Simple Mode"
        >
          <SlidersHorizontal size={13} />
          <span>{isProMode ? 'PRO MODE' : 'SIMPLE'}</span>
        </button>

        {/* Providers Settings */}
        <button
          onClick={onOpenProviders}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 transition-colors text-slate-300"
          title="AI Providers & API Keys"
        >
          <Settings size={16} />
        </button>

        {/* Reset Project */}
        <button
          onClick={onResetProject}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-red-500/50 hover:text-red-400 transition-colors text-slate-400"
          title="Reset / Start Fresh"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </header>
  );
}
