import { AIProviderConfig, CharacterDNA, LocationDNA, Scene, SupportedLanguage } from '../../types/lilo';

export interface TextGenerationRequest {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  jsonSchema?: object;
}

export interface ImageGenerationRequest {
  prompt: string;
  negativePrompt?: string;
  referenceImageUrl?: string;
  characterRef?: CharacterDNA;
  locationRef?: LocationDNA;
  aspectRatio?: string;
  resolution?: string;
}

export interface VoiceGenerationRequest {
  text: string;
  lang: SupportedLanguage;
  pitch: number;
  rate: number;
  voiceCategory?: string;
  externalVoiceId?: string;
}

export interface MusicGenerationRequest {
  mood: string;
  durationSec: number;
  targetAudience?: string;
}

export interface SoundGenerationRequest {
  cueName: string;
  category: string;
  durationSec: number;
}

export interface ProviderResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  estimatedCost: number;
  providerName: string;
  durationMs: number;
}
