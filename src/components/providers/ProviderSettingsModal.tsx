import { useState } from 'react';
import { Cpu, CheckCircle2, ShieldAlert, Key, DollarSign, ExternalLink } from 'lucide-react';
import { AIProviderConfig } from '../../types/lilo';
import { providerRegistry } from '../../core/providers/registry';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProviderSettingsModal({ isOpen, onClose }: Props) {
  const [providers, setProviders] = useState<AIProviderConfig[]>(() => providerRegistry.getAll());
  const [activeKeyInput, setActiveKeyInput] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleToggle = (id: string) => {
    const target = providers.find((p) => p.id === id);
    if (!target) return;
    const updated = { ...target, isEnabled: !target.isEnabled };
    providerRegistry.update(updated);
    setProviders(providerRegistry.getAll());
  };

  const handleSaveKey = (id: string) => {
    const target = providers.find((p) => p.id === id);
    if (!target) return;
    const key = activeKeyInput[id] || '';
    const updated = { ...target, apiKey: key, isEnabled: key.trim().length > 0 };
    providerRegistry.update(updated);
    setProviders(providerRegistry.getAll());
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md shadow-amber-400/20"
              style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}
            >
              <Cpu size={20} className="text-slate-950" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">AI Provider Registry & API Keys</h3>
              <p className="text-xs text-slate-400">
                Configure replaceable AI providers. Local Free Engine is always active as a zero-cost fallback.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 text-lg">
            ✕
          </button>
        </div>

        {/* Providers List */}
        <div className="space-y-4">
          {providers.map((prov) => (
            <div
              key={prov.id}
              className={`p-5 rounded-2xl border transition-all ${
                prov.isEnabled
                  ? 'bg-slate-800/80 border-amber-400/40 shadow-lg shadow-amber-400/5'
                  : 'bg-slate-900/60 border-slate-800 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-base">{prov.name}</h4>
                    {prov.capabilities.isLocalOnly ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        100% Free / Local
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                        Estimated: ${(prov.estimatedCostPerUnit * 10).toFixed(3)}/min
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Model: {prov.modelName}</div>
                </div>

                <button
                  onClick={() => handleToggle(prov.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    prov.isEnabled
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                  }`}
                >
                  {prov.isEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              {/* API Key Input (for non-local providers) */}
              {!prov.capabilities.isLocalOnly && (
                <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center gap-2">
                  <Key size={15} className="text-slate-500" />
                  <input
                    type="password"
                    defaultValue={prov.apiKey || ''}
                    onChange={(e) => setActiveKeyInput({ ...activeKeyInput, [prov.id]: e.target.value })}
                    placeholder={`Enter ${prov.name} API Key`}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                  <button
                    onClick={() => handleSaveKey(prov.id)}
                    className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold"
                  >
                    Save Key
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-slate-950 text-xs shadow-lg shadow-amber-400/20"
            style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
