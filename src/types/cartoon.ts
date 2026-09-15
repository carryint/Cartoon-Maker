export type ArtStyle = 
  | 'pixar-3d' 
  | 'classic-2d' 
  | 'anime-chibi' 
  | 'claymation' 
  | 'comic-book' 
  | 'cyberpunk-toon';

export type CameraAngle = 
  | 'wide-shot' 
  | 'medium-shot' 
  | 'close-up' 
  | 'dynamic-pan' 
  | 'dutch-angle' 
  | 'aerial-view';

export type TransitionType = 
  | 'fade' 
  | 'zoom-in' 
  | 'slide-left' 
  | 'bounce-cut' 
  | 'comic-wipe' 
  | 'flash';

export type CharacterEmotion = 
  | 'neutral' 
  | 'happy' 
  | 'excited' 
  | 'surprised' 
  | 'angry' 
  | 'sad' 
  | 'thinking' 
  | 'scared' 
  | 'cool';

export type SFXType = 
  | 'boing' 
  | 'whoosh' 
  | 'pop' 
  | 'laser' 
  | 'fanfare' 
  | 'laugh' 
  | 'giggle' 
  | 'punch' 
  | 'thunder' 
  | 'sparkle' 
  | 'none';

export type BGMGenre = 
  | 'playful-adventure' 
  | 'comedy-mischief' 
  | 'epic-heroic' 
  | 'spooky-mystery' 
  | 'chill-lofi' 
  | 'action-rush' 
  | 'none';

export type AspectRatio = '16:9' | '9:16' | '1:1';

export interface Character {
  id: string;
  name: string;
  tagline: string;
  artStyle: ArtStyle;
  primaryColor: string;
  secondaryColor: string;
  voiceGender: 'male' | 'female' | 'robot' | 'child' | 'creature';
  voicePitch: number; // 0.5 to 1.8
  voiceRate: number;  // 0.7 to 1.4
  avatarPrompt: string;
  avatarSeed: number;
  customAvatarUrl?: string;
  avatarUrl?: string;
  personality: string;
  emotions: Record<CharacterEmotion, string>; // emotion -> avatar image URL / SVG data
}

export interface DialogueLine {
  id: string;
  characterId: string;
  text: string;
  emotion: CharacterEmotion;
  startTime: number; // relative to scene start (seconds)
  duration: number; // in seconds
  audioUrl?: string;
}

export interface Scene {
  id: string;
  sceneNumber: number;
  title: string;
  visualPrompt: string;
  backgroundUrl?: string;
  backgroundColor?: string;
  cameraAngle: CameraAngle;
  transition: TransitionType;
  duration: number; // in seconds
  characters: string[]; // character IDs present in this scene
  dialogues: DialogueLine[];
  sfx: SFXType;
  sfxTime?: number;
  particleEffect?: 'stars' | 'bubbles' | 'dust' | 'speed-lines' | 'hearts' | 'rain' | 'none';
  customNotes?: string;
}

export interface Project {
  id: string;
  title: string;
  synopsis: string;
  artStyle: ArtStyle;
  aspectRatio: AspectRatio;
  fps: number;
  bgm: BGMGenre;
  bgmVolume: number;
  characters: Character[];
  scenes: Scene[];
  createdAt: string;
  updatedAt: string;
}

export interface AISettings {
  provider: 'gemini' | 'openai' | 'pollinations-free' | 'offline-smart';
  geminiApiKey: string;
  openaiApiKey: string;
  elevenLabsApiKey: string;
  imageQuality: 'fast' | 'hd' | 'ultra';
  autoGenerateVoices: boolean;
  autoGenerateVisuals: boolean;
}
