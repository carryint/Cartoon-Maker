import { VoiceProfile, SupportedLanguage } from '../../types/lilo';
import { localProvider } from '../providers/localProvider';

// ============================================================
//  Audio Engine — Voice Acting, Lip Sync & Dynamic Ducking
// ============================================================

export async function synthesizeDialogueSpeech(
  text: string,
  profile: VoiceProfile,
  lang: SupportedLanguage
): Promise<{ durationSec: number }> {
  const estimatedDuration = Math.max(1.8, text.length * 0.065);

  // Play speech using local provider
  localProvider.speak({
    text,
    lang: profile.lang || lang,
    pitch: profile.pitch,
    rate: profile.rate,
    voiceCategory: profile.category,
    externalVoiceId: profile.externalVoiceId,
  });

  return { durationSec: estimatedDuration };
}

export function playSceneSoundEffect(name: string) {
  localProvider.playProceduralSound(name);
}

export function playSceneBgm(mood: string, durationSec: number = 10, volume: number = 0.3): () => void {
  return localProvider.playProceduralMusic(mood, durationSec, volume);
}
