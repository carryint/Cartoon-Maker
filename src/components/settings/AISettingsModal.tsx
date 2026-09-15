import React from 'react';
import { X, Key, Sparkles, Check, Cpu, ShieldCheck } from 'lucide-react';
import { AISettings } from '../../types/cartoon';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AISettings;
  onUpdateSettings: (newSettings: AISettings) => void;
}

export const AISettingsModal: React.FC<AISettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-purple-500/30 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white">AI Engine & API Configuration</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-5 max-h-[80vh] overflow-y-auto">
          {/* Provider Selection */}
          <div>
            <label className="text-xs font-bold text-white uppercase tracking-wider mb-2 block">
              Default AI Story & Visual Engine
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => onUpdateSettings({ ...settings, provider: 'offline-smart' })}
                className={`p-3 rounded-2xl text-left border transition flex flex-col gap-1 ${
                  settings.provider === 'offline-smart'
                    ? 'bg-purple-950/60 border-purple-500 text-white font-bold ring-2 ring-purple-500/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs">⚡ Smart Engine (Zero-Key)</span>
                  {settings.provider === 'offline-smart' && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </div>
                <span className="text-[10px] text-slate-400 font-normal">
                  Instant procedural generation, works 100% free with no API keys needed.
                </span>
              </button>

              <button
                onClick={() => onUpdateSettings({ ...settings, provider: 'gemini' })}
                className={`p-3 rounded-2xl text-left border transition flex flex-col gap-1 ${
                  settings.provider === 'gemini'
                    ? 'bg-purple-950/60 border-purple-500 text-white font-bold ring-2 ring-purple-500/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs">✨ Google Gemini AI</span>
                  {settings.provider === 'gemini' && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </div>
                <span className="text-[10px] text-slate-400 font-normal">
                  Uses Gemini 1.5 Flash / 2.0 for screenplays and creative comedy writing.
                </span>
              </button>

              <button
                onClick={() => onUpdateSettings({ ...settings, provider: 'openai' })}
                className={`p-3 rounded-2xl text-left border transition flex flex-col gap-1 ${
                  settings.provider === 'openai'
                    ? 'bg-purple-950/60 border-purple-500 text-white font-bold ring-2 ring-purple-500/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs">🤖 OpenAI GPT-4o</span>
                  {settings.provider === 'openai' && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </div>
                <span className="text-[10px] text-slate-400 font-normal">
                  Uses GPT-4o Mini for screenplay structuring and character dialogue.
                </span>
              </button>

              <button
                onClick={() => onUpdateSettings({ ...settings, provider: 'pollinations-free' })}
                className={`p-3 rounded-2xl text-left border transition flex flex-col gap-1 ${
                  settings.provider === 'pollinations-free'
                    ? 'bg-purple-950/60 border-purple-500 text-white font-bold ring-2 ring-purple-500/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs">🎨 Pollinations AI (Free)</span>
                  {settings.provider === 'pollinations-free' && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </div>
                <span className="text-[10px] text-slate-400 font-normal">
                  Free public text and image generation without login.
                </span>
              </button>
            </div>
          </div>

          {/* API Keys Inputs */}
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Google Gemini API Key</label>
              <input
                type="password"
                value={settings.geminiApiKey}
                onChange={(e) => onUpdateSettings({ ...settings, geminiApiKey: e.target.value })}
                placeholder="AIzaSy..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">OpenAI API Key</label>
              <input
                type="password"
                value={settings.openaiApiKey}
                onChange={(e) => onUpdateSettings({ ...settings, openaiApiKey: e.target.value })}
                placeholder="sk-proj-..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">ElevenLabs TTS API Key (Optional)</label>
              <input
                type="password"
                value={settings.elevenLabsApiKey}
                onChange={(e) => onUpdateSettings({ ...settings, elevenLabsApiKey: e.target.value })}
                placeholder="xi-api-key..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none font-mono"
              />
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3 text-xs text-slate-400">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>All API keys are securely stored only inside your browser local storage and never sent to third-party databases.</span>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-purple-500/25 transition"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
