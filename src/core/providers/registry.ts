import { AIProviderConfig } from '../../types/lilo';

export const DEFAULT_PROVIDERS: AIProviderConfig[] = [
  {
    id: 'local-browser',
    name: 'LiLo Local Free Engine (Browser Native)',
    type: ['text', 'voice', 'music', 'sound', 'image', 'video'],
    modelName: 'Browser Canvas 3D + WebSpeech + WebAudio',
    capabilities: {
      supportsText: true,
      supportsImage: true,
      supportsImageReference: true,
      supportsCharacterReference: true,
      supportsVideo: true,
      supportsVoice: true,
      supportsMusic: true,
      supportsSound: true,
      supportsLipSync: true,
      supports4K: true,
      isLocalOnly: true,
    },
    estimatedCostPerUnit: 0,
    isEnabled: true,
  },
  {
    id: 'google-gemini',
    name: 'Google Gemini (Script & Vision)',
    type: ['text', 'image'],
    modelName: 'gemini-1.5-pro / gemini-1.5-flash',
    capabilities: {
      supportsText: true,
      supportsImage: true,
      supportsImageReference: true,
      supportsCharacterReference: true,
      supportsVideo: false,
      supportsVoice: false,
      supportsMusic: false,
      supportsSound: false,
      supportsLipSync: false,
      supports4K: false,
      isLocalOnly: false,
    },
    estimatedCostPerUnit: 0.002,
    isEnabled: false,
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs (Ultra-Realistic Kids Voices)',
    type: ['voice'],
    modelName: 'eleven_multilingual_v2',
    capabilities: {
      supportsText: false,
      supportsImage: false,
      supportsImageReference: false,
      supportsCharacterReference: false,
      supportsVideo: false,
      supportsVoice: true,
      supportsMusic: false,
      supportsSound: false,
      supportsLipSync: true,
      supports4K: false,
      isLocalOnly: false,
    },
    estimatedCostPerUnit: 0.015,
    isEnabled: false,
  },
  {
    id: 'stability-ai',
    name: 'Stability AI (Stable Animation & Diffusers)',
    type: ['image', 'video'],
    modelName: 'stable-diffusion-3.5',
    capabilities: {
      supportsText: false,
      supportsImage: true,
      supportsImageReference: true,
      supportsCharacterReference: true,
      supportsVideo: true,
      supportsVoice: false,
      supportsMusic: false,
      supportsSound: false,
      supportsLipSync: false,
      supports4K: true,
      isLocalOnly: false,
    },
    estimatedCostPerUnit: 0.03,
    isEnabled: false,
  },
];

class AIProviderRegistry {
  private providers: Map<string, AIProviderConfig> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('lilo_provider_configs_v1');
      if (stored) {
        const parsed: AIProviderConfig[] = JSON.parse(stored);
        parsed.forEach(p => this.providers.set(p.id, p));
        return;
      }
    } catch {}
    DEFAULT_PROVIDERS.forEach(p => this.providers.set(p.id, p));
  }

  saveToStorage() {
    try {
      localStorage.setItem('lilo_provider_configs_v1', JSON.stringify(Array.from(this.providers.values())));
    } catch {}
  }

  getAll(): AIProviderConfig[] {
    return Array.from(this.providers.values());
  }

  get(id: string): AIProviderConfig | undefined {
    return this.providers.get(id);
  }

  update(config: AIProviderConfig) {
    this.providers.set(config.id, config);
    this.saveToStorage();
  }

  getActiveFor(type: 'text' | 'image' | 'video' | 'voice' | 'music' | 'sound'): AIProviderConfig {
    const list = Array.from(this.providers.values()).filter(p => p.isEnabled && p.type.includes(type));
    // Prefer configured external if enabled, otherwise fallback to local-browser
    const external = list.find(p => !p.capabilities.isLocalOnly && p.apiKey);
    return external || this.providers.get('local-browser') || DEFAULT_PROVIDERS[0];
  }
}

export const providerRegistry = new AIProviderRegistry();
