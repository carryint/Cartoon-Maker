import { ArtStyle } from '../types/cartoon';

export interface BackgroundPreset {
  id: string;
  name: string;
  category: 'sci-fi' | 'nature' | 'urban' | 'fantasy' | 'indoor';
  description: string;
  svgData: string;
}

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: 'forest-cottage',
    name: "LiLo's Forest Cottage",
    category: 'nature',
    description: 'A cozy fairy-tale cottage surrounded by sunlit trees, blooming wildflowers, stone pathway, and dancing butterflies.',
    svgData: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
      <image href="/assets/lilo_mozz/forest_cottage_bg.jpg" width="1920" height="1080" preserveAspectRatio="xMidYMid slice"/>
    </svg>`,
  },
  {
    id: 'enchanted-forest',
    name: 'Enchanted Wildflower Woods',
    category: 'nature',
    description: 'Vibrant fairy-tale forest with whimsical glowing mushrooms, sunbeams, and oversized colorful trees.',
    svgData: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
      <image href="/assets/lilo_mozz/forest_cottage_bg.jpg" width="1920" height="1080" preserveAspectRatio="xMidYMid slice"/>
    </svg>`,
  },
  {
    id: 'space-station',
    name: 'Cosmic Starship Deck',
    category: 'sci-fi',
    description: 'A glowing cartoon spaceship bridge looking out into a vibrant purple nebula and twinkling stars.',
    svgData: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
      <defs>
        <linearGradient id="spaceBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#090514"/>
          <stop offset="50%" stop-color="#1f1035"/>
          <stop offset="100%" stop-color="#3b1d60"/>
        </linearGradient>
        <radialGradient id="nebula" cx="65%" cy="35%" r="50%">
          <stop offset="0%" stop-color="#ec4899" stop-opacity="0.8"/>
          <stop offset="50%" stop-color="#8b5cf6" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#3b1d60" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="planet" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#38bdf8"/>
          <stop offset="70%" stop-color="#0284c7"/>
          <stop offset="100%" stop-color="#0369a1"/>
        </radialGradient>
      </defs>
      <!-- Deep Space Background -->
      <rect width="1920" height="1080" fill="url(#spaceBg)"/>
      <rect width="1920" height="1080" fill="url(#nebula)"/>
      
      <!-- Stars -->
      <g fill="#ffffff" opacity="0.9">
        <circle cx="200" cy="150" r="3"/><circle cx="450" cy="80" r="2"/><circle cx="850" cy="220" r="4"/><circle cx="1200" cy="110" r="2.5"/><circle cx="1550" cy="260" r="3.5"/><circle cx="1780" cy="90" r="2"/><circle cx="300" cy="400" r="3"/><circle cx="650" cy="350" r="2"/><circle cx="1400" cy="420" r="3.5"/><circle cx="950" cy="90" r="4"/>
        <polygon points="1200,110 1205,115 1200,120 1195,115" fill="#fef08a"/>
        <polygon points="450,80 454,85 450,90 446,85" fill="#f43f5e"/>
      </g>
      
      <!-- Distant Ringed Planet -->
      <g transform="translate(1300, 250)">
        <ellipse cx="100" cy="100" rx="140" ry="30" fill="none" stroke="#f472b6" stroke-width="16" opacity="0.7" transform="rotate(-25 100 100)"/>
        <circle cx="100" cy="100" r="85" fill="url(#planet)"/>
        <ellipse cx="100" cy="100" rx="140" ry="30" fill="none" stroke="#fbcfe8" stroke-width="8" opacity="0.9" transform="rotate(-25 100 100)" stroke-dasharray="200 400"/>
      </g>

      <!-- Spaceship Window Frame & Console Deck -->
      <path d="M 0 0 L 300 0 L 380 720 L 0 780 Z" fill="#1e1b4b" stroke="#6366f1" stroke-width="6"/>
      <path d="M 1920 0 L 1620 0 L 1540 720 L 1920 780 Z" fill="#1e1b4b" stroke="#6366f1" stroke-width="6"/>
      <path d="M 0 0 L 1920 0 L 1920 120 L 0 120 Z" fill="#1e1b4b" opacity="0.8"/>

      <!-- Floor Deck -->
      <path d="M 0 780 L 380 720 L 1540 720 L 1920 780 L 1920 1080 L 0 1080 Z" fill="#0f172a" stroke="#4338ca" stroke-width="6"/>
      
      <!-- Neon Grid on Floor -->
      <line x1="960" y1="720" x2="960" y2="1080" stroke="#06b6d4" stroke-width="4" opacity="0.6"/>
      <line x1="700" y1="720" x2="480" y2="1080" stroke="#06b6d4" stroke-width="3" opacity="0.4"/>
      <line x1="1220" y1="720" x2="1440" y2="1080" stroke="#06b6d4" stroke-width="3" opacity="0.4"/>
      <line x1="200" y1="880" x2="1720" y2="880" stroke="#a855f7" stroke-width="3" opacity="0.5"/>
      <line x1="100" y1="980" x2="1820" y2="980" stroke="#a855f7" stroke-width="4" opacity="0.7"/>

      <!-- Glowing Hologram Displays -->
      <rect x="220" y="320" width="130" height="220" rx="10" fill="#06b6d4" opacity="0.25" stroke="#22d3ee" stroke-width="3"/>
      <rect x="1570" y="320" width="130" height="220" rx="10" fill="#ec4899" opacity="0.25" stroke="#f472b6" stroke-width="3"/>
    </svg>`,
  },
  {
    id: 'enchanted-forest',
    name: 'Enchanted Magical Forest',
    category: 'nature',
    description: 'Vibrant fairy-tale forest with whimsical glowing mushrooms, sunbeams, and oversized colorful trees.',
    svgData: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
      <defs>
        <linearGradient id="skyForest" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#bae6fd"/>
          <stop offset="60%" stop-color="#fef08a"/>
          <stop offset="100%" stop-color="#86efac"/>
        </linearGradient>
        <radialGradient id="sunbeam" cx="50%" cy="0%" r="90%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6"/>
          <stop offset="60%" stop-color="#fef08a" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="#fef08a" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1920" height="1080" fill="url(#skyForest)"/>
      <rect width="1920" height="1080" fill="url(#sunbeam)"/>

      <!-- Distant Hills -->
      <path d="M 0 600 Q 400 450 960 550 Q 1450 480 1920 620 L 1920 1080 L 0 1080 Z" fill="#34d399" opacity="0.7"/>
      <path d="M 0 680 Q 500 560 1100 660 Q 1600 580 1920 700 L 1920 1080 L 0 1080 Z" fill="#10b981"/>

      <!-- Cartoon Giant Trees -->
      <!-- Left Tree -->
      <path d="M 120 1080 L 220 500 Q 240 450 320 400 L 350 440 L 260 530 L 290 1080 Z" fill="#78350f" stroke="#451a03" stroke-width="6"/>
      <circle cx="200" cy="380" r="160" fill="#22c55e" stroke="#15803d" stroke-width="8"/>
      <circle cx="320" cy="320" r="140" fill="#4ade80" stroke="#15803d" stroke-width="8"/>
      <circle cx="100" cy="320" r="120" fill="#16a34a" stroke="#15803d" stroke-width="8"/>
      <circle cx="220" cy="220" r="110" fill="#86efac" stroke="#15803d" stroke-width="6"/>

      <!-- Right Tree -->
      <path d="M 1700 1080 L 1650 480 Q 1620 430 1520 380 L 1500 420 L 1610 510 L 1550 1080 Z" fill="#78350f" stroke="#451a03" stroke-width="6"/>
      <circle cx="1680" cy="340" r="170" fill="#16a34a" stroke="#15803d" stroke-width="8"/>
      <circle cx="1520" cy="300" r="130" fill="#22c55e" stroke="#15803d" stroke-width="8"/>
      <circle cx="1620" cy="200" r="120" fill="#4ade80" stroke="#15803d" stroke-width="6"/>

      <!-- Magical Giant Mushrooms -->
      <g transform="translate(420, 720)">
        <path d="M 60 220 L 70 90 Q 75 80 90 90 L 100 220 Z" fill="#fef08a" stroke="#ca8a04" stroke-width="4"/>
        <path d="M 10 100 Q 80 0 150 100 Q 80 120 10 100 Z" fill="#f43f5e" stroke="#be123c" stroke-width="5"/>
        <circle cx="50" cy="65" r="12" fill="#ffffff"/>
        <circle cx="95" cy="45" r="15" fill="#ffffff"/>
        <circle cx="125" cy="80" r="10" fill="#ffffff"/>
      </g>

      <g transform="translate(1350, 750) scale(0.85)">
        <path d="M 60 220 L 70 90 Q 75 80 90 90 L 100 220 Z" fill="#fef08a" stroke="#ca8a04" stroke-width="4"/>
        <path d="M 10 100 Q 80 0 150 100 Q 80 120 10 100 Z" fill="#a855f7" stroke="#7e22ce" stroke-width="5"/>
        <circle cx="50" cy="65" r="12" fill="#ffffff"/>
        <circle cx="95" cy="45" r="15" fill="#ffffff"/>
        <circle cx="125" cy="80" r="10" fill="#ffffff"/>
      </g>

      <!-- Foreground Lush Grass Floor -->
      <path d="M 0 880 Q 480 820 960 860 Q 1440 820 1920 880 L 1920 1080 L 0 1080 Z" fill="#15803d" stroke="#14532d" stroke-width="8"/>
      <g fill="#facc15">
        <circle cx="280" cy="940" r="8"/><circle cx="650" cy="960" r="10"/><circle cx="1150" cy="920" r="9"/><circle cx="1520" cy="950" r="8"/>
      </g>
    </svg>`,
  },
  {
    id: 'cartoon-city',
    name: 'Superhero Cartoon Metropolis',
    category: 'urban',
    description: 'Dynamic comic-style city rooftop with skyscraper silhouettes, billboards, and warm sunset glow.',
    svgData: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
      <defs>
        <linearGradient id="sunsetSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#312e81"/>
          <stop offset="40%" stop-color="#be185d"/>
          <stop offset="75%" stop-color="#f97316"/>
          <stop offset="100%" stop-color="#fde047"/>
        </linearGradient>
      </defs>
      <rect width="1920" height="1080" fill="url(#sunsetSky)"/>
      <circle cx="960" cy="650" r="180" fill="#fef08a" opacity="0.6"/>

      <!-- Distant Skyline -->
      <g fill="#1e1b4b" stroke="#0f172a" stroke-width="3">
        <rect x="100" y="450" width="160" height="400"/>
        <rect x="300" y="380" width="190" height="500"/>
        <polygon points="395,280 340,380 450,380" fill="#1e1b4b"/>
        <rect x="530" y="480" width="140" height="400"/>
        <rect x="710" y="320" width="220" height="550"/>
        <rect x="980" y="400" width="180" height="500"/>
        <rect x="1200" y="300" width="250" height="600"/>
        <line x1="1325" y1="180" x2="1325" y2="300" stroke="#1e1b4b" stroke-width="6"/>
        <rect x="1500" y="420" width="180" height="500"/>
        <rect x="1720" y="350" width="160" height="600"/>
      </g>

      <!-- Skyscraper Windows (Lit) -->
      <g fill="#fef08a" opacity="0.75">
        <rect x="130" y="480" width="15" height="20"/><rect x="160" y="480" width="15" height="20"/><rect x="210" y="480" width="15" height="20"/>
        <rect x="330" y="410" width="20" height="25"/><rect x="380" y="410" width="20" height="25"/><rect x="430" y="410" width="20" height="25"/>
        <rect x="740" y="360" width="25" height="30"/><rect x="800" y="360" width="25" height="30"/><rect x="860" y="360" width="25" height="30"/>
        <rect x="1240" y="340" width="25" height="30"/><rect x="1320" y="340" width="25" height="30"/><rect x="1400" y="340" width="25" height="30"/>
      </g>

      <!-- Rooftop Foreground -->
      <rect x="0" y="780" width="1920" height="300" fill="#0f172a" stroke="#020617" stroke-width="8"/>
      <!-- Rooftop Ledge -->
      <rect x="0" y="740" width="1920" height="50" fill="#334155" stroke="#1e293b" stroke-width="6"/>
      
      <!-- Water Tower & Air Conditioning Vent -->
      <rect x="200" y="600" width="140" height="140" fill="#b45309" stroke="#78350f" stroke-width="6"/>
      <polygon points="180,600 270,520 360,600" fill="#d97706" stroke="#78350f" stroke-width="5"/>
      <rect x="1550" y="650" width="180" height="100" fill="#64748b" stroke="#334155" stroke-width="5"/>
      <ellipse cx="1640" cy="700" rx="35" ry="35" fill="#1e293b"/>
    </svg>`,
  },
  {
    id: 'cozy-bakery',
    name: 'Cozy Cartoon Kitchen & Bakery',
    category: 'indoor',
    description: 'A warm pastel cartoon bakery kitchen with shelves of pastries, steaming kettles, and checkered tiles.',
    svgData: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
      <defs>
        <linearGradient id="wallWarm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffedd5"/>
          <stop offset="100%" stop-color="#fed7aa"/>
        </linearGradient>
      </defs>
      <!-- Wall -->
      <rect width="1920" height="750" fill="url(#wallWarm)"/>
      <!-- Window -->
      <rect x="760" y="100" width="400" height="320" rx="200" fill="#bae6fd" stroke="#92400e" stroke-width="12"/>
      <line x1="960" y1="100" x2="960" y2="420" stroke="#92400e" stroke-width="8"/>
      <line x1="760" y1="260" x2="1160" y2="260" stroke="#92400e" stroke-width="8"/>

      <!-- Wooden Shelves -->
      <rect x="150" y="240" width="450" height="24" rx="6" fill="#b45309" stroke="#78350f" stroke-width="4"/>
      <!-- Jars & Pies on Shelf -->
      <rect x="200" y="160" width="50" height="80" rx="10" fill="#f43f5e" stroke="#9f1239" stroke-width="4"/>
      <rect x="280" y="170" width="60" height="70" rx="10" fill="#38bdf8" stroke="#0284c7" stroke-width="4"/>
      <ellipse cx="450" cy="220" rx="45" ry="20" fill="#d97706" stroke="#92400e" stroke-width="4"/>

      <!-- Right Shelf -->
      <rect x="1320" y="240" width="450" height="24" rx="6" fill="#b45309" stroke="#78350f" stroke-width="4"/>
      <ellipse cx="1450" cy="220" rx="40" ry="18" fill="#ec4899" stroke="#be185d" stroke-width="4"/>
      <rect x="1600" y="150" width="65" height="90" rx="10" fill="#10b981" stroke="#047857" stroke-width="4"/>

      <!-- Kitchen Counter -->
      <rect x="0" y="620" width="1920" height="140" fill="#f59e0b" stroke="#b45309" stroke-width="8"/>
      <rect x="0" y="600" width="1920" height="30" fill="#fef3c7" stroke="#b45309" stroke-width="6"/>

      <!-- Tiled Floor -->
      <rect x="0" y="750" width="1920" height="330" fill="#fed7aa" stroke="#ca8a04" stroke-width="6"/>
      <!-- Tiles pattern -->
      <g stroke="#ea580c" stroke-width="2" opacity="0.35">
        <line x1="0" y1="830" x2="1920" y2="830"/>
        <line x1="0" y1="910" x2="1920" y2="910"/>
        <line x1="0" y1="990" x2="1920" y2="990"/>
        <line x1="200" y1="750" x2="200" y2="1080"/>
        <line x1="500" y1="750" x2="500" y2="1080"/>
        <line x1="800" y1="750" x2="800" y2="1080"/>
        <line x1="1100" y1="750" x2="1100" y2="1080"/>
        <line x1="1400" y1="750" x2="1400" y2="1080"/>
        <line x1="1700" y1="750" x2="1700" y2="1080"/>
      </g>
    </svg>`,
  },
  {
    id: 'cyberpunk-alley',
    name: 'Cyberpunk Neon Street',
    category: 'sci-fi',
    description: 'Neon glowing futuristic alley with holographic signboards, raining neon reflections, and high-tech vibes.',
    svgData: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
      <defs>
        <linearGradient id="cyberSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#05050f"/>
          <stop offset="60%" stop-color="#180a2a"/>
          <stop offset="100%" stop-color="#2d063a"/>
        </linearGradient>
      </defs>
      <rect width="1920" height="1080" fill="url(#cyberSky)"/>

      <!-- Neon Signs -->
      <g transform="translate(250, 150)">
        <rect x="0" y="0" width="160" height="350" rx="10" fill="#09090b" stroke="#ec4899" stroke-width="6"/>
        <text x="80" y="80" fill="#f43f5e" font-size="44" font-family="sans-serif" font-weight="900" text-anchor="middle">AI</text>
        <text x="80" y="160" fill="#06b6d4" font-size="44" font-family="sans-serif" font-weight="900" text-anchor="middle">TOON</text>
        <text x="80" y="240" fill="#eab308" font-size="44" font-family="sans-serif" font-weight="900" text-anchor="middle">BAR</text>
      </g>

      <g transform="translate(1500, 180)">
        <rect x="0" y="0" width="180" height="280" rx="10" fill="#09090b" stroke="#06b6d4" stroke-width="6"/>
        <text x="90" y="100" fill="#22d3ee" font-size="38" font-family="sans-serif" font-weight="900" text-anchor="middle">CYBER</text>
        <text x="90" y="180" fill="#a855f7" font-size="38" font-family="sans-serif" font-weight="900" text-anchor="middle">CLUB</text>
      </g>

      <!-- Wet Asphalt Ground with Neon Reflection -->
      <polygon points="0,1080 0,650 1920,650 1920,1080" fill="#09090b"/>
      <ellipse cx="330" cy="850" rx="200" ry="30" fill="#f43f5e" opacity="0.35"/>
      <ellipse cx="1590" cy="880" rx="220" ry="35" fill="#06b6d4" opacity="0.35"/>
      <ellipse cx="960" cy="950" rx="400" ry="40" fill="#a855f7" opacity="0.25"/>

      <!-- Rain Lines -->
      <g stroke="#38bdf8" stroke-width="2" opacity="0.4" stroke-dasharray="10 20">
        <line x1="200" y1="0" x2="100" y2="1080"/>
        <line x1="600" y1="0" x2="500" y2="1080"/>
        <line x1="1000" y1="0" x2="900" y2="1080"/>
        <line x1="1400" y1="0" x2="1300" y2="1080"/>
        <line x1="1800" y1="0" x2="1700" y2="1080"/>
      </g>
    </svg>`,
  },
];

/**
 * Get background SVG data URL or generate dynamic AI background.
 */
export function getBackgroundSvgUrl(presetId: string): string {
  const preset = BACKGROUND_PRESETS.find(p => p.id === presetId) || BACKGROUND_PRESETS[0];
  return `data:image/svg+xml;utf8,${encodeURIComponent(preset.svgData)}`;
}

/**
 * Generates an AI prompt for Pollinations or DALL-E image generation.
 */
export function buildImagePrompt(scenePrompt: string, style: ArtStyle): string {
  const styleKeywords: Record<ArtStyle, string> = {
    'pixar-3d': '3D Pixar animation style, Disney RenderMan lighting, vibrant colors, cinematic masterpiece, cute expressive cartoon, highly detailed',
    'classic-2d': 'Classic 2D animation cel art, clean crisp cartoon line art, Studio Ghibli / Looney Tunes aesthetic, expressive and vibrant',
    'anime-chibi': 'High-end Japanese anime chibi style, Kyoto Animation aesthetic, big expressive cute eyes, clean pastel rendering, 4k anime background',
    'claymation': 'Aardman claymation style, stop-motion plasticine texture, studio miniature lighting, tactile cute cartoon clay figures',
    'comic-book': 'Dynamic Marvel/DC cartoon comic book style, bold ink lines, Ben-Day dot shading, dramatic cinematic lighting, action-packed',
    'cyberpunk-toon': 'Futuristic cyberpunk cartoon aesthetic, glowing neon lights, holographic reflections, stylized anime sci-fi scene',
  };

  return `${scenePrompt}, ${styleKeywords[style]}, masterpiece, 8k resolution, cinematic composition, award winning cartoon animation`;
}
