import { Project, CharacterDNA, LocationDNA, PropDNA } from '../types/lilo';

export const DEMO_CHARACTERS: CharacterDNA[] = [
  {
    id: 'char_lilo',
    name: 'LiLo',
    role: 'protagonist',
    personality: ['Curious', 'Joyful', 'Kind-hearted', 'Nature-lover'],
    appearance: {
      age: 6,
      species: 'human',
      skinTone: '#fed7aa',
      hairStyle: 'Twin pigtails with floral ties',
      hairColor: '#78350f',
      eyeColor: '#0284c7',
      eyeShape: 'Big round expressive',
      bodyType: 'Toddler',
      heightRatio: 1.0,
      distinctiveFeatures: ['Rosy cheeks', 'Warm smile'],
    },
    clothing: {
      outfitName: 'Denim Adventure Pinafore',
      topColor: '#ec4899',
      bottomColor: '#1e40af',
      footwear: 'Red rainboots',
      accessories: ['Yellow flower clip'],
    },
    voiceProfile: {
      id: 'voice_lilo',
      name: 'LiLo (Playful Child)',
      category: 'child-girl',
      lang: 'en-US',
      pitch: 1.45,
      rate: 0.95,
      provider: 'local-speech',
      isLocked: true,
    },
    references: {
      expressions: {},
      poses: {},
    },
    primaryColor: '#ec4899',
    secondaryColor: '#3b82f6',
    isLocked: true,
    version: 1,
    negativeConstraints: ['adult proportions', 'dark tone'],
  },
  {
    id: 'char_toto',
    name: 'Toto',
    role: 'sidekick',
    personality: ['Inventive', 'Brave', 'Helpful', 'Energetic'],
    appearance: {
      age: 7,
      species: 'human',
      skinTone: '#fde047',
      hairStyle: 'Messy spiky brown hair',
      hairColor: '#451a03',
      eyeColor: '#15803d',
      eyeShape: 'Friendly oval',
      bodyType: 'Boy',
      heightRatio: 1.08,
      distinctiveFeatures: ['Bandage on knee', 'Bright eyes'],
    },
    clothing: {
      outfitName: 'Explorer Green Tee',
      topColor: '#16a34a',
      bottomColor: '#713f12',
      footwear: 'Brown sneakers',
      accessories: ['Explorer backpack'],
    },
    voiceProfile: {
      id: 'voice_toto',
      name: 'Toto (Enthusiastic Boy)',
      category: 'child-boy',
      lang: 'en-US',
      pitch: 1.15,
      rate: 1.05,
      provider: 'local-speech',
      isLocked: true,
    },
    references: {
      expressions: {},
      poses: {},
    },
    primaryColor: '#16a34a',
    secondaryColor: '#f59e0b',
    isLocked: true,
    version: 1,
    negativeConstraints: [],
  },
  {
    id: 'char_milo',
    name: 'Milo',
    role: 'animal',
    personality: ['Loyal', 'Playful', 'Bouncy', 'Cute'],
    appearance: {
      age: 2,
      species: 'animal',
      skinTone: '#fbbf24',
      hairStyle: 'Fluffy golden puppy coat',
      hairColor: '#f59e0b',
      eyeColor: '#1e293b',
      eyeShape: 'Puppy dog eyes',
      bodyType: 'Golden Puppy',
      heightRatio: 0.65,
      distinctiveFeatures: ['Wagging tail', 'Floppy ears'],
    },
    clothing: {
      outfitName: 'Turquoise Bell Collar',
      topColor: '#06b6d4',
      bottomColor: '#0891b2',
      footwear: '',
      accessories: ['Golden bell'],
    },
    voiceProfile: {
      id: 'voice_milo',
      name: 'Milo (Playful Puppy)',
      category: 'creature',
      lang: 'en-US',
      pitch: 1.6,
      rate: 1.2,
      provider: 'local-speech',
      isLocked: true,
    },
    references: {
      expressions: {},
      poses: {},
    },
    primaryColor: '#f59e0b',
    secondaryColor: '#06b6d4',
    isLocked: true,
    version: 1,
    negativeConstraints: [],
  },
];

export const DEMO_LOCATIONS: LocationDNA[] = [
  {
    id: 'loc_cottage',
    name: "LiLo's Cozy Cottage",
    type: 'cottage',
    description: 'A charming storybook cottage nestled beside wildflower gardens with morning sunlight.',
    architecture: 'Timber frame with rounded stone chimney',
    terrain: 'Lush grassy yard with stepping stones',
    vegetation: 'Sunflowers, lavender, and blooming daisies',
    colorPalette: ['#fef08a', '#86efac', '#f472b6', '#38bdf8'],
    defaultLighting: 'morning-sunlight',
    defaultWeather: 'sunny',
    backgroundElements: ['swaying-flowers', 'singing-birds'],
    isLocked: true,
    version: 1,
  },
  {
    id: 'loc_forest',
    name: 'Whispering Pine Forest',
    type: 'forest',
    description: 'A magical woodland with tall ancient pine trees, sunbeams filtering through leaves, and stone paths.',
    architecture: 'Natural tree hollows and stone arches',
    terrain: 'Soft moss-covered ground with wild berries',
    vegetation: 'Tall pine trees and fern clusters',
    colorPalette: ['#166534', '#15803d', '#78350f', '#facc15'],
    defaultLighting: 'golden-hour',
    defaultWeather: 'sunny',
    backgroundElements: ['swaying-trees', 'flying-butterflies'],
    isLocked: true,
    version: 1,
  },
  {
    id: 'loc_lake',
    name: 'The Magic Glowing Lake',
    type: 'lake',
    description: 'A tranquil enchanted lake surrounded by weeping willows and sparkling crystal-clear blue water.',
    architecture: 'Wooden dock and smooth skipping stones',
    terrain: 'Sparkling sand shore and lily pad groves',
    vegetation: 'Water lilies and weeping willows',
    colorPalette: ['#0284c7', '#38bdf8', '#a855f7', '#fef08a'],
    defaultLighting: 'mystical-glow',
    defaultWeather: 'sunny',
    backgroundElements: ['rippling-water', 'fireflies'],
    isLocked: true,
    version: 1,
  },
];

export const DEMO_PROPS: PropDNA[] = [
  {
    id: 'prop_map',
    name: 'Ancient Treasure Map',
    category: 'tool',
    description: 'A hand-drawn scroll showing secret paths through the forest to the Magic Lake.',
    color: '#fde047',
    scale: 0.8,
  },
  {
    id: 'prop_compass',
    name: 'Golden Acorn Compass',
    category: 'magic-item',
    description: 'A shiny brass compass with a spinning glowing needle.',
    color: '#eab308',
    scale: 0.6,
  },
];

export const DEMO_PROJECT: Project = {
  id: 'project_lilo_magic_lake',
  seriesName: 'LiLo & Friends',
  title: 'LiLo and the Magic Lake',
  episodeNumber: 1,
  tagline: 'An original adventure in the enchanted forest!',
  description: 'LiLo, Toto, and their puppy Milo set off on an exciting journey through the Whispering Pine Forest to discover the legendary Magic Glowing Lake and help a little turtle find its way home.',
  targetAudience: 'early-childhood-5-7',
  language: 'en-US',
  visualStyle: 'storybook-3d',
  aspectRatio: '16:9',
  resolution: '1080p',
  fps: 30,
  isChildSafeMode: true,
  rawScript: `SCENE 1 — MORNING AT LILO'S COTTAGE
Setting: LiLo's Cozy Cottage
Camera: Wide shot with golden morning sunlight
Lighting: morning-sunlight
Music: happy

LILO: (excited) Good morning, world! Look at that bright blue sky, Toto!
TOTO: (happy) Today is the perfect day for an adventure to the Magic Lake!
MILO: (excited) Woof woof! Let's go explore!

---

SCENE 2 — THROUGH THE WHISPERING FOREST
Setting: Whispering Pine Forest
Camera: Tracking shot following our friends down the sunlit path
Lighting: golden-hour
Music: adventure

TOTO: (curious) Look at these ancient tall trees! The path leads right through the grove.
LILO: (joyful) Listen to the birds singing! The forest is full of friendly surprises.
MILO: (happy) Arf arf! I smell water lilies just ahead!

---

SCENE 3 — DISCOVERING THE MAGIC LAKE
Setting: The Magic Glowing Lake
Camera: Close-up on the sparkling water, then pull back to wide
Lighting: mystical-glow
Music: magical

LILO: (surprised) Wow! Look how the lake glows with magical golden light!
TOTO: (excited) We made it, LiLo! Look at the friendly fish jumping!
LILO: (tender) Nature is truly magical when we take care of it together!`,
  characters: DEMO_CHARACTERS,
  locations: DEMO_LOCATIONS,
  props: DEMO_PROPS,
  scenes: [],
  storyboard: [],
  activeProviderId: 'local-browser',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
