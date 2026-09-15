import { Character, CharacterEmotion, SupportedLanguage, VoicePersona } from '../types/cartoon';
import { soundSynthesizer } from './soundSynthesizer';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en-US', name: 'English (US)', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ml-IN', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'ar-SA', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'es-ES', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de-DE', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'zh-CN', name: 'Mandarin Chinese', nativeName: '中文', flag: '🇨🇳' },
];

export interface VoicePersonaDefinition {
  id: VoicePersona;
  name: string;
  description: string;
  defaultPitch: number;
  defaultRate: number;
  suggestedGender: 'child' | 'female' | 'male' | 'creature' | 'robot';
  icon: string;
  isLockedLiLo?: boolean;
  isLockedMozz?: boolean;
}

export const VOICE_PERSONAS: VoicePersonaDefinition[] = [
  {
    id: 'baby-toddler-girl',
    name: 'Cute Toddler Girl (LiLo Signature)',
    description: 'High-pitched, soft, sweet, energetic baby/toddler voice with clear childlike innocence and warmth.',
    defaultPitch: 1.45,
    defaultRate: 0.95,
    suggestedGender: 'child',
    icon: '🌸',
    isLockedLiLo: true,
  },
  {
    id: 'playful-cat',
    name: 'Playful Cat (Mozz Signature)',
    description: 'Expressive cat persona with procedural meows, purrs, squeaks, and animated cheerful cadence.',
    defaultPitch: 1.55,
    defaultRate: 1.15,
    suggestedGender: 'creature',
    icon: '🐱',
    isLockedMozz: true,
  },
  {
    id: 'sweet-girl',
    name: 'Sweet Girl',
    description: 'Gentle, friendly, and kind young girl voice, perfect for storybook narrators and forest helpers.',
    defaultPitch: 1.35,
    defaultRate: 1.0,
    suggestedGender: 'child',
    icon: '🎀',
  },
  {
    id: 'energetic-girl',
    name: 'Energetic Girl',
    description: 'Bubbly, fast-paced, enthusiastic girl voice full of curiosity and excitement.',
    defaultPitch: 1.4,
    defaultRate: 1.1,
    suggestedGender: 'child',
    icon: '⚡',
  },
  {
    id: 'gentle-girl',
    name: 'Gentle & Soothing',
    description: 'Calm, tender, and empathetic voice suited for comforting animals in need.',
    defaultPitch: 1.2,
    defaultRate: 0.9,
    suggestedGender: 'female',
    icon: '🕊️',
  },
  {
    id: 'funny-boy',
    name: 'Funny & Quirky Boy',
    description: 'Playful, animated, and comical boy voice with bouncy cadence and laughs.',
    defaultPitch: 1.25,
    defaultRate: 1.1,
    suggestedGender: 'child',
    icon: '🎈',
  },
  {
    id: 'young-boy',
    name: 'Young Adventurer Boy',
    description: 'Brave, cheerful young boy ready to lead forest expeditions.',
    defaultPitch: 1.15,
    defaultRate: 1.0,
    suggestedGender: 'child',
    icon: '🧭',
  },
  {
    id: 'friendly-adult',
    name: 'Friendly Adult / Guide',
    description: 'Warm, reassuring parent or park ranger voice that offers guidance and safety.',
    defaultPitch: 1.0,
    defaultRate: 0.95,
    suggestedGender: 'female',
    icon: '🏡',
  },
  {
    id: 'wise-elderly',
    name: 'Wise Forest Elder',
    description: 'Slow, deep, calm elder or ancient creature sharing ecological wisdom.',
    defaultPitch: 0.75,
    defaultRate: 0.85,
    suggestedGender: 'male',
    icon: '🦉',
  },
  {
    id: 'chirpy-creature',
    name: 'Chirpy Songbird / Tiny Animal',
    description: 'Ultra high-pitched, lively sound for birds, butterflies, bees, and squirrels.',
    defaultPitch: 1.65,
    defaultRate: 1.2,
    suggestedGender: 'creature',
    icon: '🐦',
  },
  {
    id: 'deep-creature',
    name: 'Deep Forest Creature',
    description: 'Resonant, gentle giant voice for big turtles, friendly bears, or ancient oaks.',
    defaultPitch: 0.65,
    defaultRate: 0.85,
    suggestedGender: 'creature',
    icon: '🐢',
  },
];

export interface VoiceOption {
  id: string;
  name: string;
  lang: string;
  gender: 'male' | 'female' | 'robot' | 'child' | 'creature';
}

class SpeechSynthesizer {
  private voices: SpeechSynthesisVoice[] = [];
  private isLoaded = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
      window.speechSynthesis.onvoiceschanged = () => this.initVoices();
    }
  }

  private initVoices(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.voices = window.speechSynthesis.getVoices();
    this.isLoaded = this.voices.length > 0;
  }

  /**
   * Intelligently auto-assigns a voice persona and default parameters
   * based on character attributes (name, tagline, personality, role).
   */
  public autoAssignVoicePersona(character: Partial<Character>): {
    persona: VoicePersona;
    pitch: number;
    rate: number;
    gender: 'male' | 'female' | 'robot' | 'child' | 'creature';
  } {
    const name = (character.name || '').toLowerCase();
    const role = (character.tagline || '').toLowerCase();
    const personality = (character.personality || '').toLowerCase();
    const fullContext = `${name} ${role} ${personality}`;

    // 1. Permanent LiLo association
    if (name.includes('lilo') || fullContext.includes('baby girl') || fullContext.includes('toddler girl')) {
      return {
        persona: 'baby-toddler-girl',
        pitch: 1.45,
        rate: 0.95,
        gender: 'child',
      };
    }

    // 2. Permanent Mozz cat association
    if (name.includes('mozz') || fullContext.includes('cat') || fullContext.includes('kitten') || fullContext.includes('feline')) {
      return {
        persona: 'playful-cat',
        pitch: 1.55,
        rate: 1.15,
        gender: 'creature',
      };
    }

    // 3. Small birds, insects, squirrels
    if (
      fullContext.includes('bird') ||
      fullContext.includes('robin') ||
      fullContext.includes('pip') ||
      fullContext.includes('butterfly') ||
      fullContext.includes('bee') ||
      fullContext.includes('squirrel') ||
      fullContext.includes('chibi')
    ) {
      return {
        persona: 'chirpy-creature',
        pitch: 1.65,
        rate: 1.2,
        gender: 'creature',
      };
    }

    // 4. Turtles, Bears, Elephants, Ancient Trees
    if (
      fullContext.includes('turtle') ||
      fullContext.includes('toby') ||
      fullContext.includes('bear') ||
      fullContext.includes('ancient') ||
      fullContext.includes('giant')
    ) {
      return {
        persona: 'deep-creature',
        pitch: 0.65,
        rate: 0.85,
        gender: 'creature',
      };
    }

    // 5. Wise elders, owls
    if (fullContext.includes('elder') || fullContext.includes('wise') || fullContext.includes('owl') || fullContext.includes('grandpa')) {
      return {
        persona: 'wise-elderly',
        pitch: 0.75,
        rate: 0.85,
        gender: 'male',
      };
    }

    // 6. Adult / Mother / Ranger / Guide
    if (fullContext.includes('mom') || fullContext.includes('mother') || fullContext.includes('ranger') || fullContext.includes('guide') || fullContext.includes('adult')) {
      return {
        persona: 'friendly-adult',
        pitch: 1.0,
        rate: 0.95,
        gender: 'female',
      };
    }

    // 7. Young boys
    if (fullContext.includes('boy') || fullContext.includes('brother') || fullContext.includes('son') || fullContext.includes('mischievous')) {
      return {
        persona: 'funny-boy',
        pitch: 1.25,
        rate: 1.1,
        gender: 'child',
      };
    }

    // 8. Default female / child sweet girl
    return {
      persona: 'sweet-girl',
      pitch: 1.35,
      rate: 1.0,
      gender: 'child',
    };
  }

  /**
   * Generates a sample preview phrase localized in the requested language
   */
  public getLocalizedSamplePhrase(character: Character, lang: SupportedLanguage = 'en-US'): string {
    const isLilo = character.name.toLowerCase().includes('lilo') || character.voicePersona === 'baby-toddler-girl';
    const isMozz = character.name.toLowerCase().includes('mozz') || character.voicePersona === 'playful-cat';

    const SAMPLES: Record<SupportedLanguage, { lilo: string; mozz: string; generic: string }> = {
      'en-US': {
        lilo: "Good morning! I'm LiLo! Let's explore the forest, protect nature, and make new animal friends!",
        mozz: "Meow-purr! I am Mozz! Sniffing out fresh trails and ready for a grand forest adventure!",
        generic: `Hello! I am ${character.name}, excited to be part of today's forest story!`,
      },
      'ml-IN': {
        lilo: "നമസ്കാരം! ഞാൻ ലിലോ! നമുക്ക് കാട്ടിലേക്ക് പോയി പ്രകൃതിയെ സ്നേഹിക്കാം, പുതിയ കൂട്ടുകാരെ കാണാം!",
        mozz: "മ്യാവൂ! ഞാൻ മോസ്സ്! വരൂ, കാട്ടിലെ മനോഹരമായ വഴികൾ കണ്ടെത്താം!",
        generic: `നമസ്കാരം! ഞാൻ ${character.name}, നമ്മുടെ ഇന്നത്തെ കാട്ടുയാത്രയിൽ പങ്കുചേരാൻ ഞാൻ തയ്യാറാണ്!`,
      },
      'hi-IN': {
        lilo: "नमस्ते! मैं लीलो हूँ! चलो जंगल में नए दोस्तों से मिलते हैं और प्रकृति की रक्षा करते हैं!",
        mozz: "म्याऊँ! मैं मोज़ हूँ! चलो मिलकर नई राहें और रोमांचक रहस्य खोजते हैं!",
        generic: `नमस्ते! मैं ${character.name} हूँ, आज के इस प्यारे सफर के लिए तैयार!`,
      },
      'ta-IN': {
        lilo: "வணக்கம்! நான் லிலோ! வாருங்கள் காட்டிற்கு சென்று புதிய விலங்கு நண்பர்களை சந்திப்போம்!",
        mozz: "மியாவ்! நான் மோஸ்! வாருங்கள் புதிய இடங்களை உற்சாகத்துடன் கண்டுபிடிப்போம்!",
        generic: `வணக்கம்! நான் ${character.name}, இந்த அருமையான பயணத்தில் இணைய தயாராக உள்ளேன்!`,
      },
      'ar-SA': {
        lilo: "مرحباً! أنا ليلو! هيا نذهب إلى الغابة لنحمي الطبيعة ونلتقي بأصدقاء جدد!",
        mozz: "مياو! أنا موز! هيا نستكشف مسارات الغابة الجميلة معاً!",
        generic: `مرحباً! أنا ${character.name}، سعيد جداً بمرافقتكم في هذه المغامرة!`,
      },
      'es-ES': {
        lilo: "¡Hola! ¡Soy LiLo! ¡Vamos al bosque a cuidar la naturaleza y conocer nuevos amigos!",
        mozz: "¡Miau! ¡Soy Mozz! ¡Listo para olfatear nuevos senderos y vivir grandes aventuras!",
        generic: `¡Hola! Soy ${character.name}, ¡listo para explorar el bosque juntos!`,
      },
      'fr-FR': {
        lilo: "Bonjour! Je suis LiLo! Allons dans la forêt protéger la nature et rencontrer de nouveaux amis!",
        mozz: "Miaou! Je suis Mozz! Prêt à renifler de nouvelles pistes et explorer la forêt!",
        generic: `Bonjour! Je suis ${character.name}, enchanté de vous accompagner dans cette aventure!`,
      },
      'de-DE': {
        lilo: "Hallo! Ich bin LiLo! Lass uns in den Wald gehen, die Natur schützen und neue Freunde finden!",
        mozz: "Miau! Ich bin Mozz! Bereit für ein spannendes Waldabenteuer!",
        generic: `Hallo! Ich bin ${character.name}, bereit für unsere Entdeckungsreise!`,
      },
      'ja-JP': {
        lilo: "おはよう！リロだよ！森へ行って、自然を守りながら新しいお友達を作ろう！",
        mozz: "ニャー！モズだよ！森の新しい足跡を探しに出発しよう！",
        generic: `こんにちは！${character.name}です！一緒に冒険しよう！`,
      },
      'zh-CN': {
        lilo: "早上好！我是丽洛！让我们一起去森林探索，保护大自然，结交新朋友！",
        mozz: "喵！我是莫兹！准备好去闻闻森林里的小径，开启冒险啦！",
        generic: `你好！我是${character.name}，很高兴和大家一起开启森林之旅！`,
      },
    };

    const langSet = SAMPLES[lang] || SAMPLES['en-US'];
    if (isLilo) return langSet.lilo;
    if (isMozz) return langSet.mozz;
    return langSet.generic;
  }

  /**
   * Dynamic Script-Aware Emotion Analyzer
   * Evaluates text context, keywords, and scene act to fine-tune emotion and acoustics
   */
  public analyzeScriptEmotion(text: string, act?: string): {
    detectedEmotion: CharacterEmotion;
    pitchMod: number;
    rateMod: number;
    volumeMod: number;
  } {
    const lower = text.toLowerCase();

    // 1. Excited / Joy / Discovery / Celebration
    if (
      lower.includes('look!') ||
      lower.includes('wow') ||
      lower.includes('amazing') ||
      lower.includes('yay') ||
      lower.includes('yippee') ||
      lower.includes('hurray') ||
      lower.includes('beautiful') ||
      lower.includes('found') ||
      lower.includes('safe and sound') ||
      (act && act.includes('Celebration'))
    ) {
      return { detectedEmotion: 'excited', pitchMod: 1.25, rateMod: 1.15, volumeMod: 1.0 };
    }

    // 2. Surprised / Sudden Realization / Questions
    if (
      lower.includes('listen!') ||
      lower.includes('twitch') ||
      lower.includes('what is that') ||
      lower.includes('hear that') ||
      lower.includes('who is') ||
      lower.endsWith('?')
    ) {
      return { detectedEmotion: 'surprised', pitchMod: 1.3, rateMod: 1.1, volumeMod: 1.0 };
    }

    // 3. Gentle / Caring / Tender / Rescue
    if (
      lower.includes('poor') ||
      lower.includes('hurt') ||
      lower.includes('lost') ||
      lower.includes('don\'t worry') ||
      lower.includes('help you') ||
      lower.includes('careful') ||
      lower.includes('softly')
    ) {
      return { detectedEmotion: 'happy', pitchMod: 1.05, rateMod: 0.9, volumeMod: 0.95 };
    }

    // 4. Scared / Danger / Litter Problem
    if (
      lower.includes('stuck') ||
      lower.includes('plastic') ||
      lower.includes('litter') ||
      lower.includes('danger') ||
      lower.includes('trapped') ||
      lower.includes('help!')
    ) {
      return { detectedEmotion: 'scared', pitchMod: 1.35, rateMod: 1.2, volumeMod: 1.0 };
    }

    // 5. Forest Tip / Educational / Winking
    if (
      lower.includes('tip') ||
      lower.includes('remember') ||
      lower.includes('lesson') ||
      lower.includes('protect') ||
      lower.includes('clean') ||
      (act && act.includes('Forest Tip'))
    ) {
      return { detectedEmotion: 'winking', pitchMod: 1.12, rateMod: 0.95, volumeMod: 1.0 };
    }

    // Default cheerful neutral/happy
    return { detectedEmotion: 'happy', pitchMod: 1.0, rateMod: 1.0, volumeMod: 1.0 };
  }

  /**
   * Speak a dialogue line with multi-language matching, persona pitch tuning,
   * script-aware emotion modulation, and Mozz cat sound triggers.
   */
  public speakDialogue(
    text: string,
    character: Character,
    emotion?: CharacterEmotion,
    onStart?: () => void,
    onEnd?: () => void,
    onBoundary?: (charIndex: number) => void
  ): Promise<void> {
    return new Promise((resolve) => {
      // In non-browser / unsupported contexts, provide clean timed resolve
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        onStart?.();
        setTimeout(() => {
          onEnd?.();
          resolve();
        }, Math.max(1200, text.length * 65));
        return;
      }

      window.speechSynthesis.cancel(); // Clear any pending audio queue

      const targetLang = character.language || 'en-US';
      const isMozz = character.name.toLowerCase().includes('mozz') || character.voicePersona === 'playful-cat';

      // 1. Play procedural cat meow if Mozz is speaking
      if (isMozz) {
        soundSynthesizer.playSFX('cat-meow', 0.6);
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = targetLang;

      // 2. Persona Base Parameters
      let basePitch = character.voicePitch || 1.4;
      let baseRate = character.voiceRate || 1.0;

      if (character.voicePersona === 'baby-toddler-girl') {
        basePitch = 1.45;
        baseRate = 0.95;
      } else if (character.voicePersona === 'playful-cat') {
        basePitch = 1.55;
        baseRate = 1.15;
      } else if (character.voicePersona === 'chirpy-creature') {
        basePitch = 1.65;
        baseRate = 1.2;
      } else if (character.voicePersona === 'deep-creature') {
        basePitch = 0.65;
        baseRate = 0.85;
      } else if (character.voicePersona === 'wise-elderly') {
        basePitch = 0.75;
        baseRate = 0.85;
      }

      // 3. Script Emotion Modulation
      const scriptAnalysis = this.analyzeScriptEmotion(text);
      const effectiveEmotion = emotion || scriptAnalysis.detectedEmotion;

      let emotionPitchMod = scriptAnalysis.pitchMod;
      let emotionRateMod = scriptAnalysis.rateMod;

      switch (effectiveEmotion) {
        case 'excited':
          emotionPitchMod = 1.25;
          emotionRateMod = 1.15;
          break;
        case 'surprised':
          emotionPitchMod = 1.35;
          emotionRateMod = 1.1;
          break;
        case 'angry':
          emotionPitchMod = 0.9;
          emotionRateMod = 1.2;
          break;
        case 'sad':
          emotionPitchMod = 0.8;
          emotionRateMod = 0.8;
          break;
        case 'scared':
          emotionPitchMod = 1.4;
          emotionRateMod = 1.25;
          break;
        case 'cool':
          emotionPitchMod = 0.92;
          emotionRateMod = 0.95;
          break;
        case 'thinking':
          emotionPitchMod = 1.05;
          emotionRateMod = 0.88;
          break;
        case 'winking':
          emotionPitchMod = 1.12;
          emotionRateMod = 0.95;
          break;
        default:
          break;
      }

      utterance.pitch = Math.min(2.0, Math.max(0.2, basePitch * emotionPitchMod));
      utterance.rate = Math.min(2.0, Math.max(0.5, baseRate * emotionRateMod));

      // 4. Voice Selection Matching Language & Character Gender
      if (this.voices.length > 0) {
        const langPrefix = targetLang.split('-')[0].toLowerCase();

        // Match by exact language or language prefix
        const langVoices = this.voices.filter(v => 
          v.lang.toLowerCase() === targetLang.toLowerCase() || 
          v.lang.toLowerCase().startsWith(langPrefix)
        );

        const candidatePool = langVoices.length > 0 ? langVoices : this.voices;

        const matchingVoice = candidatePool.find(v => {
          const vName = v.name.toLowerCase();
          if (character.voiceGender === 'male' || character.voicePersona === 'wise-elderly') {
            return vName.includes('male') || vName.includes('david') || vName.includes('guy') || vName.includes('george');
          }
          if (character.voiceGender === 'female' || character.voicePersona === 'baby-toddler-girl' || character.voicePersona === 'sweet-girl') {
            return vName.includes('female') || vName.includes('zira') || vName.includes('jenny') || vName.includes('girl') || vName.includes('kid');
          }
          return true;
        }) || candidatePool[0];

        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }
      }

      utterance.onstart = () => {
        onStart?.();
      };

      utterance.onboundary = (e) => {
        onBoundary?.(e.charIndex);
      };

      utterance.onend = () => {
        onEnd?.();
        resolve();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis playback:', e);
        onEnd?.();
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  public stopSpeaking(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const speechSynthesizer = new SpeechSynthesizer();
