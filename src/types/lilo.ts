// ============================================================
//  LiLo Cartoon Maker — Master Platform Types
//  Comprehensive normalized data models for production
// ============================================================

export type VisualStyle = 'storybook-3d' | 'classic-2d' | 'claymation' | 'papercraft' | 'anime-chibi' | 'watercolor';
export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5';
export type Resolution = '720p' | '1080p' | '4K';
export type FrameRate = 24 | 30 | 60;
export type SupportedLanguage = 'en-US' | 'ml-IN' | 'hi-IN' | 'ta-IN' | 'te-IN' | 'kn-IN' | 'ar-SA' | 'es-ES' | 'fr-FR' | 'de-DE' | 'ja-JP';

export type CharacterRole = 'protagonist' | 'sidekick' | 'antagonist' | 'mentor' | 'animal' | 'narrator' | 'guest';
export type EmotionType = 'neutral' | 'happy' | 'excited' | 'sad' | 'scared' | 'angry' | 'surprised' | 'curious' | 'confused' | 'calm' | 'sleepy' | 'laughing' | 'crying';
export type PoseType = 'standing' | 'sitting' | 'walking' | 'running' | 'waving' | 'pointing' | 'jumping' | 'thinking' | 'dancing' | 'talking';
export type CameraShotType = 'wide' | 'medium' | 'close-up' | 'extreme-close-up' | 'two-shot' | 'tracking' | 'pan-left' | 'pan-right' | 'tilt-up' | 'tilt-down' | 'zoom-in' | 'zoom-out' | 'aerial';
export type LightingMood = 'morning-sunlight' | 'golden-hour' | 'soft-overcast' | 'warm-sunset' | 'moonlit-night' | 'mystical-glow' | 'stormy-dark' | 'cozy-indoor';
export type WeatherType = 'sunny' | 'partly-cloudy' | 'rainy' | 'windy' | 'misty' | 'snowy' | 'starry';

// ------------------------------------------------------------
//  Voice & Audio
// ------------------------------------------------------------
export interface VoiceProfile {
  id: string;
  name: string;
  category: 'baby' | 'child-girl' | 'child-boy' | 'adult-woman' | 'adult-man' | 'elder-woman' | 'elder-man' | 'creature' | 'robot' | 'narrator';
  lang: SupportedLanguage;
  pitch: number; // 0.5 - 2.0
  rate: number;  // 0.5 - 2.0
  provider: 'local-speech' | 'elevenlabs' | 'openai' | 'azure';
  externalVoiceId?: string;
  isLocked?: boolean;
}

export interface SoundEffectCue {
  id: string;
  name: string;
  category: 'footsteps' | 'nature' | 'creature' | 'object' | 'magic' | 'ui' | 'ambient';
  startTime: number; // seconds
  duration: number;
  volume: number; // 0 - 1
  pan: number; // -1 to 1
  loop?: boolean;
}

export interface MusicTrackCue {
  id: string;
  title: string;
  mood: 'adventure' | 'happy' | 'magical' | 'funny' | 'calm' | 'suspense' | 'emotional' | 'celebration';
  volume: number; // 0 - 1
  duckAmount: number; // volume drop during dialogue, e.g. 0.3
  fadeInSec: number;
  fadeOutSec: number;
}

// ------------------------------------------------------------
//  Character DNA & Reference Sheets
// ------------------------------------------------------------
export interface CharacterAppearance {
  age: number;
  species: 'human' | 'animal' | 'robot' | 'magical-creature';
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  eyeShape: string;
  bodyType: string;
  heightRatio: number; // 0.5 - 1.5
  distinctiveFeatures: string[];
}

export interface CharacterClothing {
  outfitName: string;
  topColor: string;
  bottomColor: string;
  footwear: string;
  accessories: string[];
}

export interface CharacterReferenceSheet {
  frontUrl?: string;
  sideUrl?: string;
  threeQuarterUrl?: string;
  backUrl?: string;
  closeUpUrl?: string;
  expressions: Record<string, string>; // emotion -> imageUrl
  poses: Record<string, string>;       // pose -> imageUrl
}

export interface CharacterDNA {
  id: string;
  name: string;
  role: CharacterRole;
  personality: string[];
  appearance: CharacterAppearance;
  clothing: CharacterClothing;
  voiceProfile: VoiceProfile;
  references: CharacterReferenceSheet;
  primaryColor: string;
  secondaryColor: string;
  isLocked: boolean;
  version: number;
  negativeConstraints: string[];
}

// ------------------------------------------------------------
//  Location DNA & Props
// ------------------------------------------------------------
export interface LocationDNA {
  id: string;
  name: string;
  type: 'cottage' | 'bedroom' | 'kitchen' | 'school' | 'village' | 'forest' | 'jungle' | 'mountain' | 'lake' | 'river' | 'beach' | 'ocean' | 'farm' | 'park' | 'magic-realm' | 'custom';
  description: string;
  architecture: string;
  terrain: string;
  vegetation: string;
  colorPalette: string[];
  defaultLighting: LightingMood;
  defaultWeather: WeatherType;
  referenceImageUrl?: string;
  backgroundElements: string[]; // e.g. 'flowing-water', 'swaying-trees', 'fireflies'
  isLocked: boolean;
  version: number;
}

export interface PropDNA {
  id: string;
  name: string;
  category: 'toy' | 'tool' | 'food' | 'nature' | 'vehicle' | 'book' | 'accessory' | 'magic-item';
  description: string;
  color: string;
  scale: number;
  referenceImageUrl?: string;
}

// ------------------------------------------------------------
//  Script & Scene Models (Schema-validated)
// ------------------------------------------------------------
export interface DialogueLine {
  id: string;
  characterId: string;
  text: string;
  emotion: EmotionType;
  startOffset: number; // relative to scene start
  duration: number;
  audioUrl?: string;
  phonemes?: Array<{ time: number; viseme: string }>;
}

export interface SceneActionCue {
  id: string;
  characterId: string;
  action: PoseType;
  startOffset: number;
  duration: number;
  targetLocation?: { x: number; y: number };
}

export interface ContinuityState {
  heldProps: Record<string, string>; // charId -> propId
  characterOutfits: Record<string, string>; // charId -> outfitName
  currentWeather: WeatherType;
  currentLighting: LightingMood;
  timeOfDay: string;
  previousSceneSummary: string;
}

export interface Scene {
  id: string;
  sceneNumber: number;
  title: string;
  description: string;
  locationId: string;
  characterIds: string[];
  camera: {
    shot: CameraShotType;
    movement: string;
  };
  lighting: LightingMood;
  weather: WeatherType;
  duration: number; // seconds
  dialogues: DialogueLine[];
  actions: SceneActionCue[];
  soundEffects: SoundEffectCue[];
  music: MusicTrackCue;
  transition: 'cut' | 'fade-to-black' | 'dissolve' | 'wipe-left' | 'zoom-transition';
  continuity: ContinuityState;
  renderedVideoUrl?: string;
  thumbnailUrl?: string;
  isApproved?: boolean;
}

export interface StoryboardCard {
  sceneId: string;
  sceneNumber: number;
  title: string;
  description: string;
  thumbnailUrl?: string;
  characterNames: string[];
  locationName: string;
  dialogueCount: number;
  duration: number;
  camera: CameraShotType;
  isApproved: boolean;
}

// ------------------------------------------------------------
//  Timeline & Multi-Track Sequencing
// ------------------------------------------------------------
export type TrackType = 'video' | 'character' | 'dialogue' | 'narration' | 'music' | 'sfx' | 'captions';

export interface TimelineClip {
  id: string;
  trackId: string;
  title: string;
  startTime: number;
  duration: number;
  color: string;
  data: any;
  isMuted?: boolean;
}

export interface TimelineTrack {
  id: string;
  type: TrackType;
  label: string;
  color: string;
  isMuted: boolean;
  isLocked: boolean;
  clips: TimelineClip[];
}

// ------------------------------------------------------------
//  Quality Control & Continuity Checks
// ------------------------------------------------------------
export interface QualityIssue {
  id: string;
  sceneId: string;
  type: 'character-mismatch' | 'outfit-conflict' | 'location-mismatch' | 'audio-clipping' | 'continuity-break' | 'timing-gap';
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  suggestedFix: string;
  isResolved: boolean;
}

export interface QualityReport {
  overallScore: number; // 0 - 100
  passedChecks: number;
  totalChecks: number;
  issues: QualityIssue[];
}

// ------------------------------------------------------------
//  AI Provider Framework
// ------------------------------------------------------------
export type ProviderType = 'text' | 'image' | 'video' | 'voice' | 'music' | 'sound';

export interface ProviderCapability {
  supportsText: boolean;
  supportsImage: boolean;
  supportsImageReference: boolean;
  supportsCharacterReference: boolean;
  supportsVideo: boolean;
  supportsVoice: boolean;
  supportsMusic: boolean;
  supportsSound: boolean;
  supportsLipSync: boolean;
  supports4K: boolean;
  isLocalOnly: boolean;
}

export interface AIProviderConfig {
  id: string;
  name: string;
  type: ProviderType[];
  apiKey?: string;
  endpointUrl?: string;
  modelName: string;
  capabilities: ProviderCapability;
  estimatedCostPerUnit: number; // in USD
  isEnabled: boolean;
}

export interface AIJobProgress {
  jobId: string;
  stepName: string;
  percent: number;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  logs: string[];
  error?: string;
}

// ------------------------------------------------------------
//  Master Project & Series Entity
// ------------------------------------------------------------
export interface Project {
  id: string;
  seriesName: string;
  title: string;
  episodeNumber: number;
  tagline: string;
  description: string;
  targetAudience: 'preschool-2-4' | 'early-childhood-5-7' | 'kids-8-12';
  language: SupportedLanguage;
  visualStyle: VisualStyle;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  fps: FrameRate;
  isChildSafeMode: boolean;
  rawScript: string;
  characters: CharacterDNA[];
  locations: LocationDNA[];
  props: PropDNA[];
  scenes: Scene[];
  storyboard: StoryboardCard[];
  qualityReport?: QualityReport;
  activeProviderId: string;
  createdAt: string;
  updatedAt: string;
}
