import {
  LayoutDashboard,
  Users,
  MapPin,
  Package,
  FileText,
  Clapperboard,
  Sparkles,
  Sliders,
  PlaySquare,
  CheckCircle2,
  Cpu,
} from 'lucide-react';

interface Props {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  characterCount: number;
  locationCount: number;
  sceneCount: number;
  qcScore?: number;
}

export default function Sidebar({
  currentTab,
  onSelectTab,
  characterCount,
  locationCount,
  sceneCount,
  qcScore = 100,
}: Props) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'characters', label: 'Characters', icon: Users, badge: characterCount },
    { id: 'locations', label: 'Locations', icon: MapPin, badge: locationCount },
    { id: 'props', label: 'Props', icon: Package },
    { id: 'script', label: 'Script Studio', icon: FileText },
    { id: 'storyboard', label: 'Storyboard', icon: Clapperboard, badge: sceneCount },
    { id: 'director', label: 'AI Director', icon: Sparkles },
    { id: 'timeline', label: 'Timeline', icon: Sliders },
    { id: 'render', label: 'Render & Export', icon: PlaySquare },
    {
      id: 'qc',
      label: 'Quality Control',
      icon: CheckCircle2,
      badgeText: `${qcScore}%`,
      badgeColor: qcScore > 85 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400',
    },
    { id: 'providers', label: 'AI Providers', icon: Cpu },
  ];

  return (
    <aside className="w-64 bg-slate-900/70 border-r border-slate-800 p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
          Production Orchestrator
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                isActive
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={isActive ? 'text-slate-950' : 'text-slate-400'} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
              {item.badgeText && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${item.badgeColor}`}>
                  {item.badgeText}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Production Tip / Status Footer */}
      <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-2xl text-xs space-y-1">
        <div className="text-amber-400 font-bold flex items-center gap-1.5">
          <Sparkles size={13} />
          <span>Original Creation Mode</span>
        </div>
        <p className="text-slate-400 leading-relaxed text-[11px]">
          All characters, voices, and scenes are 100% original and ready for distribution.
        </p>
      </div>
    </aside>
  );
}
