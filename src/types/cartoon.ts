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
  | 'winking'
  | 'thinking' 
  | 'angry' 
  | 'sad' 
  | 'scared' 
  | 'cool';

export type SFXType = 
  | 'nature-birds'
  | 'river-stream'
  | 'cat-meow'
  | 'cat-purr'
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
  | 'footsteps'
  | 'none';

export type BGMGenre = 
  | 'lilo-forest-morning'
  | 'playful-adventure' 
  | 'comedy-mischief' 
  | 'epic-heroic' 
  | 'spooky-mystery' 
  | 'chill-lofi' 
  | 'action-rush' 
  | 'none';

export type AspectRatio = '16:9' | '9:16' | '1:1';

export interface CharacterOutfit {
  id: string;
  name: string;
  description: string;
  thumbnailUrl?: string;
}

export interface CharacterBoard {
  boardImageUrl: string;
  closeUpImageUrl?: string;
  colorPalette: string[];
  personalityTraits: string[];
  outfits: CharacterOutfit[];
  angles: string[];
}

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
  selectedOutfit?: string;
  characterBoard?: CharacterBoard;
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
  act?: 'Act 1: Morning Exploration' | 'Act 2: Animal Friend in Need' | 'Act 3: Nature Solution & Rescue' | 'Act 4: Forest Tip & Celebration';
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
  particleEffect?: 'stars' | 'bubbles' | 'dust' | 'speed-lines' | 'hearts' | 'rain' | 'leaves' | 'butterflies' | 'none';
  forestLessonNote?: string;
  customNotes?: string;
}

export interface AnimalFriend {
  name: string;
  species: string;
  problem: string;
  lesson: string;
  icon: string;
}

export interface Project {
  id: string;
  title: string;
  synopsis: string;
  targetDurationMinutes?: number; // 2 to 20
  forestTip?: string; // Signature Forest Tip
  animalFriend?: AnimalFriend;
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
