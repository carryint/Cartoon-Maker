import {
  Sparkles,
  Users,
  MapPin,
  FileText,
  Clapperboard,
  Sliders,
  PlaySquare,
  CheckCircle2,
  Play,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Project } from '../../types/lilo';

interface Props {
  project: Project;
  onSelectTab: (tab: string) => void;
  onOpenOneClick: () => void;
  onLoadDemo: () => void;
}

export default function MainDashboard({
  project,
  onSelectTab,
  onOpenOneClick,
  onLoadDemo,
}: Props) {
  const qcScore = project.qualityReport?.overallScore ?? 100;

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
            <Sparkles size={14} />
            <span>AI Cartoon Production Platform</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Create Characters. Tell Stories. Bring Them to Life.
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Build original children's cartoon episodes with consistent characters, dynamic voice acting, cinematic
            lighting, multi-track audio, and 4K rendering.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenOneClick}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-slate-950 text-sm shadow-xl shadow-amber-400/25 transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}
            >
              <Zap size={18} />
              <span>One-Click Cartoon Mode</span>
            </button>

            <button
              onClick={onLoadDemo}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 text-sm font-semibold transition-colors"
            >
              <Play size={16} className="text-emerald-400" />
              <span>Load "LiLo & the Magic Lake" Demo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Production Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => onSelectTab('characters')}
          className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 hover:border-amber-400/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Characters</span>
            <Users size={18} className="text-pink-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-extrabold text-white">{project.characters.length}</div>
          <div className="text-xs text-slate-400 mt-1">Consistent 3D & 2D rigs</div>
        </div>

        <div
          onClick={() => onSelectTab('locations')}
          className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 hover:border-amber-400/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Locations</span>
            <MapPin size={18} className="text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-extrabold text-white">{project.locations.length}</div>
          <div className="text-xs text-slate-400 mt-1">Multi-layer environments</div>
        </div>

        <div
          onClick={() => onSelectTab('storyboard')}
          className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 hover:border-amber-400/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Scenes</span>
            <Clapperboard size={18} className="text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-extrabold text-white">{project.scenes.length}</div>
          <div className="text-xs text-slate-400 mt-1">
            {Math.round(project.scenes.reduce((sum, s) => sum + s.duration, 0))}s Total Runtime
          </div>
        </div>

        <div
          onClick={() => onSelectTab('qc')}
          className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 hover:border-amber-400/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">QC Health</span>
            <CheckCircle2 size={18} className="text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-extrabold text-white">{qcScore}%</div>
          <div className="text-xs text-slate-400 mt-1">Continuity & Voice verified</div>
        </div>
      </div>

      {/* Production Studios Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>Production Studios</span>
          <span className="text-xs text-slate-400 font-normal">Modular creation workspaces</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Character Studio */}
          <div
            onClick={() => onSelectTab('characters')}
            className="bg-slate-900 border border-slate-800 hover:border-pink-500/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/10 cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">Character Studio</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Design Character DNA, generate reference sheets (front, side, expressions, poses), assign voice
                identities, and lock character models.
              </p>
            </div>
            <div className="mt-5 flex items-center justify-between text-xs font-semibold text-pink-400 pt-3 border-t border-slate-800">
              <span>{project.characters.length} characters in cast</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Location Studio */}
          <div
            onClick={() => onSelectTab('locations')}
            className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <MapPin size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">Location Studio</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Build persistent worlds (Cottage, Forest, Glowing Lake, Beach) with dynamic weather, time-of-day lighting,
                and background animations.
              </p>
            </div>
            <div className="mt-5 flex items-center justify-between text-xs font-semibold text-emerald-400 pt-3 border-t border-slate-800">
              <span>{project.locations.length} locations configured</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Script Studio */}
          <div
            onClick={() => onSelectTab('script')}
            className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <FileText size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">Script Studio</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Write or paste dialogue & actions. The AI Analyzer extracts scenes, emotions, camera cues, and sound
                instructions with JSON schema validation.
              </p>
            </div>
            <div className="mt-5 flex items-center justify-between text-xs font-semibold text-amber-400 pt-3 border-t border-slate-800">
              <span>{project.rawScript ? `${project.rawScript.split('\n').length} script lines` : 'Write screenplay'}</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Storyboard & AI Director */}
          <div
            onClick={() => onSelectTab('storyboard')}
            className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <Clapperboard size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">Storyboard & AI Director</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Visual card-based scene director with human approval gates, individual element regeneration, camera
                angles, and timing adjustments.
              </p>
            </div>
            <div className="mt-5 flex items-center justify-between text-xs font-semibold text-purple-400 pt-3 border-t border-slate-800">
              <span>{project.scenes.length} scenes storyboarded</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Multi-Track Timeline */}
          <div
            onClick={() => onSelectTab('timeline')}
            className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <Sliders size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">Multi-Track Timeline</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sequence Video, Characters, Dialogue, BGM Music, and Sound Effects on independent synchronized tracks
                with automated audio ducking.
              </p>
            </div>
            <div className="mt-5 flex items-center justify-between text-xs font-semibold text-blue-400 pt-3 border-t border-slate-800">
              <span>Multi-track mixer active</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 4K Render & Social Export */}
          <div
            onClick={() => onSelectTab('render')}
            className="bg-slate-900 border border-slate-800 hover:border-amber-400/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-amber-400/10 cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-slate-950 font-bold group-hover:scale-110 transition-transform shadow-md"
                style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}
              >
                <PlaySquare size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">4K Render & Export</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Preview your animation in real time and export 4K/1080p MP4/WebM videos, vertical 9:16 YouTube Shorts,
                and multi-language SRT subtitles.
              </p>
            </div>
            <div className="mt-5 flex items-center justify-between text-xs font-semibold text-amber-400 pt-3 border-t border-slate-800">
              <span>Render & Watch</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
