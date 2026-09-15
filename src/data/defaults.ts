import { Character, Project } from '../types/studio';

// ============================================================
//  LiLo & Mozz — Default Example Characters (pre-loaded)
// ============================================================

export const LILO_DEFAULT: Character = {
  id: 'char_lilo',
  name: 'LiLo',
  role: 'protagonist',
  description: 'LiLo is a joyful, compassionate, and endlessly curious toddler girl who loves exploring the forest with her cat friend Mozz. She has warm brown hair in pigtails with flower clips, rosy cheeks, and always wears her signature denim pinafore. She helps animals and protects nature.',
  boardImageUrl: '/assets/lilo_mozz/lilo_character_board.jpg',
  spriteUrl: '/assets/lilo_mozz/lilo_sprite.png',
  colorPrimary: '#ec4899',
  colorSecondary: '#3b82f6',
  voiceProfile: {
    lang: 'en-US',
    pitch: 1.45,
    rate: 0.95,
    gender: 'child',
  },
  outfits: ['Denim Pinafore', 'Floral Dress', 'Yellow Overalls', 'Hoodie & Jeans'],
  isLocked: true,
};

export const MOZZ_DEFAULT: Character = {
  id: 'char_mozz',
  name: 'Mozz',
  role: 'sidekick',
  description: 'Mozz is LiLo\'s playful ginger tabby cat companion. He has a turquoise bowtie collar with a little bell, bright emerald slit-pupil eyes, and a long multicolored tail. He communicates through expressive meows, purrs, and cat sounds, occasionally speaking in broken sentences.',
  boardImageUrl: '/assets/lilo_mozz/mozz_character_board.jpg',
  spriteUrl: '/assets/lilo_mozz/mozz_portrait.jpg',
  colorPrimary: '#f97316',
  colorSecondary: '#06b6d4',
  voiceProfile: {
    lang: 'en-US',
    pitch: 1.55,
    rate: 1.15,
    gender: 'creature',
  },
  outfits: ['Regular Look', 'Explorer Outfit', 'Sleepy Pajamas', 'Party Hat'],
  isLocked: true,
};

export const DEFAULT_PROJECT: Project = {
  id: 'project_lilo_ep1',
  title: 'LiLo & Mozz — New Episode',
  description: 'A new forest adventure for LiLo and Mozz.',
  rawScript: `SCENE 1 — MORNING AT THE FOREST COTTAGE
Setting: A cozy fairy-tale cottage in the sunlit forest. Birds are singing. Morning dew on flowers.
Camera: Wide shot of cottage exterior, slow zoom in.

LILO: (excited) Good morning, Mozz! Look at the golden sunshine through the tall trees!
MOZZ: (happy) Meow-purr! The forest smells like wild berries today!
LILO: I wonder what adventure is waiting for us today. Let's go explore!

---

SCENE 2 — INTO THE FOREST PATH
Setting: A winding stone path through tall oak trees, wildflowers on both sides.
Camera: Medium shot, following LiLo and Mozz as they walk.

LILO: (thinking) Listen... do you hear that, Mozz? Something is crying near the old oak tree.
MOZZ: (alert) Meow! My cat ears are twitching — someone needs our help!
LILO: Let's run! Every second counts when a friend is in need!

---

SCENE 3 — MEETING THE ANIMAL FRIEND
Setting: Near a sparkling river, a small turtle is stuck between plastic bottles.
Camera: Close-up on the turtle, then pull back to show LiLo and Mozz arriving.

LILO: (tender) Oh, poor little turtle! Don't worry, we'll get you free!
MOZZ: (concerned) Meow-mew... look at all this plastic rubbish in the river!
LILO: Let's clean it all up. The forest animals depend on a clean river.

---

SCENE 4 — LILO'S FOREST TIP
Setting: LiLo and Mozz stand in a sunny meadow, looking at the camera warmly.
Camera: Medium shot, warm golden light, butterflies around them.

LILO: (winking) Today's Forest Tip: Always pick up litter you find in parks and forests. Even one piece of plastic can hurt a river animal!
MOZZ: (excited) Meow! Every small act of kindness keeps our forest beautiful!
LILO: See you tomorrow for our next adventure! Bye-bye! 🌿`,
  characters: [LILO_DEFAULT, MOZZ_DEFAULT],
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
