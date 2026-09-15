import { Project } from '../types/studio';

// ============================================================
//  Defaults — empty project, no pre-loaded characters
// ============================================================

export const DEFAULT_PROJECT: Project = {
  id: `project_${Date.now()}`,
  title: 'New Episode',
  description: 'A new AI-generated video.',
  rawScript: '',
  characters: [],   // <-- always starts empty
  scenes: [],
  resolution: '4K',
  aspectRatio: '16:9',
  fps: 30,
  language: 'en-US',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English', flag: '🇺🇸' },
  { code: 'ml-IN', name: 'Malayalam', flag: '🇮🇳' },
  { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' },
  { code: 'ta-IN', name: 'Tamil', flag: '🇮🇳' },
  { code: 'ar-SA', name: 'Arabic', flag: '🇸🇦' },
  { code: 'es-ES', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
  { code: 'de-DE', name: 'German', flag: '🇩🇪' },
  { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
  { code: 'zh-CN', name: 'Mandarin', flag: '🇨🇳' },
];
