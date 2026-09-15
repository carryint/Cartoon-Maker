import React, { useState } from 'react';
import { Sliders, Volume2, Move, Sparkles, Smile, Video, Check, Layers } from 'lucide-react';
import { PuppetPose } from '../../services/puppetRigEngine';
import { soundSynthesizer } from '../../services/soundSynthesizer';
import { Project } from '../../types/cartoon';

interface PuppetControlBarProps {
  project: Project;
  onPoseChange: (charId: string, pose: PuppetPose) => void;
  isGreenScreen: boolean;
  onToggleGreenScreen: () => void;
  onUpdateProject: (updater: (prev: Project) => Project) => void;
}

const POSE_OPTIONS: { id: PuppetPose; label: string; icon: string }[] = [
  { id: 'idle', label: 'Idle / Breathe', icon: '🌱' },
  { id: 'walk', label: 'Walk Cycle', icon: '🚶' },
  { id: 'run', label: 'Fast Run', icon: '🏃' },
  { id: 'wave', label: 'Wave & Greet', icon: '👋' },
  { id: 'inspect', label: 'Inspect Clue', icon: '🔍' },
  { id: 'jump', label: 'Jump', icon: '🦘' },
  { id: 'celebrate', label: 'Celebration Cheer', icon: '🎉' },
  { id: 'talk', label: 'Talk / Phonemes', icon: '🗣️' },
  { id: 'sit', label: 'Sit Down', icon: '🪑' },
];

export const PuppetControlBar: React.FC<PuppetControlBarProps> = ({
  project,
  onPoseChange,
  isGreenScreen,
  onToggleGreenScreen,
  onUpdateProject,
}) => {
  const [selectedPuppet, setSelectedPuppet] = useState<'char_lilo' | 'char_mozz'>('char_lilo');
  const [currentPose, setCurrentPose] = useState<PuppetPose>('idle');
  const [showMixer, setShowMixer] = useState(false);
  
  // Soundstage track volumes
  const [dialogueVol, setDialogueVol] = useState(1.0);
  const [sfxVol, setSfxVol] = useState(0.8);
  const [bgmVol, setBgmVol] = useState(project.bgmVolume || 0.35);

  const handleSelectPose = (pose: PuppetPose) => {
    setCurrentPose(pose);
    onPoseChange(selectedPuppet, pose);
  };

  const handleBgmVolChange = (val: number) => {
    setBgmVol(val);
    soundSynthesizer.setBgmVolume(val);
    onUpdateProject(prev => ({
      ...prev,
      bgmVolume: val,
    }));
  };

  return (
    <div className="flex flex-col gap-2.5 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl backdrop-blur-md">
      {/* Top Puppet Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
            <Move className="w-3.5 h-3.5 text-purple-400" />
            <span>2.5D Puppet Rig:</span>
          </span>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setSelectedPuppet('char_lilo')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                selectedPuppet === 'char_lilo'
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🌸</span>
              <span>LiLo Puppet</span>
            </button>

            <button
              onClick={() => setSelectedPuppet('char_mozz')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                selectedPuppet === 'char_mozz'
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🐱</span>
              <span>Mozz Cat Puppet</span>
            </button>
          </div>
        </div>

        {/* Soundstage & Green Screen Action Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMixer(!showMixer)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
              showMixer
                ? 'bg-purple-600 text-white border-purple-500'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-purple-300" />
            <span>Soundstage Mixer</span>
          </button>

          <button
            onClick={onToggleGreenScreen}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
              isGreenScreen
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/30'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>{isGreenScreen ? 'Green Screen ON' : 'Green Screen'}</span>
          </button>
        </div>
      </div>

      {/* Quick Pose Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {POSE_OPTIONS.map((p) => {
          const isSelected = currentPose === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handleSelectPose(p.id)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 border ${
                isSelected
                  ? 'bg-purple-950/80 border-purple-500 text-purple-200 font-bold ring-1 ring-purple-500/50'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <span>{p.icon}</span>
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Soundstage Mixer Dropdown Panel */}
      {showMixer && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80 mt-1">
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Track 1: Dialogue & Voices</span>
              <span className="font-mono text-purple-400">{Math.round(dialogueVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={dialogueVol}
              onChange={(e) => setDialogueVol(parseFloat(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Track 2: SFX & Cat Sounds</span>
              <span className="font-mono text-pink-400">{Math.round(sfxVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={sfxVol}
              onChange={(e) => setSfxVol(parseFloat(e.target.value))}
              className="w-full accent-pink-500 cursor-pointer"
            />
          </div>

          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Track 3: Forest BGM (Ducked)</span>
              <span className="font-mono text-emerald-400">{Math.round(bgmVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={bgmVol}
              onChange={(e) => handleBgmVolChange(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
