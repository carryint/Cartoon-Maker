// ============================================================
//  AI Video Generation Studio — Core Types
// ============================================================

export type CharacterRole = 'protagonist' | 'sidekick' | 'antagonist' | 'narrator' | 'animal' | 'guest';
export type SceneAction = 'idle' | 'walk' | 'talk' | 'wave' | 'emote' | 'exit' | 'enter';
export type CameraShot = 'wide' | 'medium' | 'close-up' | 'aerial' | 'pan-left' | 'pan-right';
export type Transition = 'cut' | 'fade' | 'dissolve' | 'wipe' | 'zoom-in' | 'zoom-out';
export type Emotion = 'neutral' | 'happy' | 'excited' | 'sad' | 'scared' | 'angry' | 'surprised' | 'thinking' | 'tender';

export interface VoiceProfile {
  lang: string;            // BCP-47 e.g. 'en-US', 'ml-IN', 'hi-IN'
  pitch: number;           // 0.5 – 2.0
  rate: number;            // 0.5 – 2.0
  gender: 'male' | 'female' | 'child' | 'creature';
}

export interface Character {
  id: string;
  name: string;
  role: CharacterRole;
  description: string;           // Personality / backstory extracted from board
  boardImageUrl: string;         // Uploaded character board image URL
  boardImageFile?: File;
  spriteUrl?: string;            // Generated or uploaded sprite
  colorPrimary: string;
  colorSecondary: string;
  voiceProfile: VoiceProfile;
  outfits?: string[];
  isLocked?: boolean;            // LiLo / Mozz are locked defaults
}

export interface DialogueLine {
  id: string;
  characterId: string;
  text: string;
  emotion: Emotion;
  startOffset: number;   // seconds from scene start
  duration: number;      // estimated speech duration in seconds
}

export interface SceneBackground {
  type: 'forest-cottage' | 'forest-path' | 'river-stream' | 'open-meadow' | 'sunset-hill' | 'night-sky' | 'indoor-room' | 'custom';
  description: string;   // Detailed description for AI generation
  generatedUrl?: string; // URL of AI-generated or cached background
}

export interface Scene {
  id: string;
  sceneNumber: number;
  title: string;
  description: string;           // Full scene description from script
  background: SceneBackground;
  cameraShot: CameraShot;
  transition: Transition;
  duration: number;              // seconds
  characterIds: string[];        // which characters appear
  dialogues: DialogueLine[];
  action?: string;               // Director's action note
  sfx?: string;                  // Sound effect description
  mood?: string;                 // Music mood for BGM
}

export interface GenerationJob {
  id: string;
  status: 'idle' | 'parsing' | 'generating' | 'rendering' | 'done' | 'error';
  currentStep: string;
  progress: number;              // 0–100
  logs: string[];
  videoUrl?: string;
  error?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  rawScript: string;
  characters: Character[];
  scenes: Scene[];
  resolution: '4K' | '1080p' | '720p';
  aspectRatio: '16:9' | '9:16' | '1:1';
  fps: 24 | 30 | 60;
  language: string;             // BCP-47 episode language
  createdAt: string;
  updatedAt: string;
}
