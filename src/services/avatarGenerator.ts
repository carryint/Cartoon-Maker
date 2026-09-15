import { ArtStyle, CharacterEmotion } from '../types/cartoon';

// Color palettes for different styles
const STYLE_PALETTES: Record<ArtStyle, { skin: string[]; hair: string[]; outfit: string[]; bg: string }> = {
  'pixar-3d': {
    skin: ['#f8c79c', '#e09f67', '#8d5524', '#ffd1b3', '#c68642'],
    hair: ['#4a2c11', '#1a1a1a', '#c98a4b', '#d83e23', '#2b4d82'],
    outfit: ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'],
    bg: '#ede9fe',
  },
  'classic-2d': {
    skin: ['#ffe0bd', '#f1c27d', '#8d5524', '#ffcd94', '#ffd59e'],
    hair: ['#222222', '#ff5722', '#ffeb3b', '#795548', '#00bcd4'],
    outfit: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#6366f1'],
    bg: '#fef08a',
  },
  'anime-chibi': {
    skin: ['#fff0e6', '#ffe4d6', '#fddbb0', '#faebd7'],
    hair: ['#f43f5e', '#a855f7', '#06b6d4', '#eab308', '#ec4899', '#3b82f6'],
    outfit: ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f43f5e'],
    bg: '#fce7f3',
  },
  'claymation': {
    skin: ['#e4a87a', '#c27d49', '#995d30', '#f1b58a'],
    hair: ['#5a3d28', '#8b4513', '#d2691e', '#2f4f4f'],
    outfit: ['#d97706', '#059669', '#dc2626', '#2563eb', '#7c3aed'],
    bg: '#fed7aa',
  },
  'comic-book': {
    skin: ['#fed7aa', '#fcd34d', '#fbcfe8', '#cbd5e1'],
    hair: ['#1e293b', '#dc2626', '#2563eb', '#ca8a04'],
    outfit: ['#dc2626', '#2563eb', '#eab308', '#16a34a', '#0f172a'],
    bg: '#fef08a',
  },
  'cyberpunk-toon': {
    skin: ['#e2e8f0', '#94a3b8', '#fbcfe8', '#67e8f9'],
    hair: ['#06b6d4', '#f43f5e', '#a855f7', '#22c55e', '#eab308'],
    outfit: ['#0f172a', '#1e1b4b', '#312e81', '#09090b', '#18181b'],
    bg: '#0f172a',
  },
};

/**
 * Generate a procedural SVG cartoon avatar tailored to style, personality, colors, and emotion.
 */
export function generateProceduralAvatar(
  name: string,
  style: ArtStyle,
  primaryColor: string = '#8b5cf6',
  secondaryColor: string = '#ec4899',
  emotion: CharacterEmotion = 'happy',
  seed: number = 42
): string {
  // Deterministic random numbers from seed
  const s = (offset: number) => {
    const x = Math.sin(seed + offset) * 10000;
    return x - Math.floor(x);
  };

  const skinColors = STYLE_PALETTES[style].skin;
  const hairColors = STYLE_PALETTES[style].hair;

  const skin = skinColors[Math.floor(s(1) * skinColors.length)];
  const hair = hairColors[Math.floor(s(2) * hairColors.length)];
  const headShape = Math.floor(s(3) * 3); // 0 = round, 1 = cute-oval, 2 = chubby-square
  const hairStyle = Math.floor(s(4) * 4); // 0 = spiky, 1 = bob/curly, 2 = ponytail/topknot, 3 = hat/visor
  const eyeStyle = Math.floor(s(5) * 3);

  // Eye emotion adjustments
  let eyeLeft = `<circle cx="75" cy="95" r="9" fill="#1e293b"/><circle cx="78" cy="92" r="3.5" fill="#ffffff"/>`;
  let eyeRight = `<circle cx="125" cy="95" r="9" fill="#1e293b"/><circle cx="128" cy="92" r="3.5" fill="#ffffff"/>`;
  let mouth = `<path d="M 80 130 Q 100 150 120 130" stroke="#1e293b" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  let eyebrows = `<path d="M 65 75 Q 75 70 85 75" stroke="#1e293b" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M 115 75 Q 125 70 135 75" stroke="#1e293b" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  let blush = `<circle cx="62" cy="112" r="10" fill="#f43f5e" opacity="0.35"/><circle cx="138" cy="112" r="10" fill="#f43f5e" opacity="0.35"/>`;

  if (emotion === 'excited' || emotion === 'happy') {
    eyeLeft = `<path d="M 65 95 Q 75 80 85 95" stroke="#1e293b" stroke-width="6" fill="none" stroke-linecap="round"/>`;
    eyeRight = `<path d="M 115 95 Q 125 80 135 95" stroke="#1e293b" stroke-width="6" fill="none" stroke-linecap="round"/>`;
    mouth = `<path d="M 75 125 Q 100 160 125 125 Z" fill="#e11d48" stroke="#1e293b" stroke-width="4"/><path d="M 88 145 Q 100 135 112 145" fill="#fda4af"/>`;
    eyebrows = `<path d="M 65 70 Q 75 62 85 70" stroke="#1e293b" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M 115 70 Q 125 62 135 70" stroke="#1e293b" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  } else if (emotion === 'surprised') {
    eyeLeft = `<circle cx="75" cy="92" r="14" fill="#ffffff" stroke="#1e293b" stroke-width="3"/><circle cx="75" cy="92" r="6" fill="#1e293b"/>`;
    eyeRight = `<circle cx="125" cy="92" r="14" fill="#ffffff" stroke="#1e293b" stroke-width="3"/><circle cx="125" cy="92" r="6" fill="#1e293b"/>`;
    mouth = `<ellipse cx="100" cy="135" rx="14" ry="18" fill="#1e293b"/>`;
    eyebrows = `<path d="M 65 65 Q 75 55 85 65" stroke="#1e293b" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M 115 65 Q 125 55 135 65" stroke="#1e293b" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  } else if (emotion === 'angry') {
    mouth = `<path d="M 80 140 Q 100 125 120 140" stroke="#1e293b" stroke-width="6" fill="none" stroke-linecap="round"/>`;
    eyebrows = `<path d="M 65 72 L 88 84" stroke="#1e293b" stroke-width="5" stroke-linecap="round"/><path d="M 135 72 L 112 84" stroke="#1e293b" stroke-width="5" stroke-linecap="round"/>`;
    blush = `<path d="M 145 65 L 160 50 M 150 50 L 160 65" stroke="#dc2626" stroke-width="3"/>`;
  } else if (emotion === 'sad') {
    mouth = `<path d="M 80 142 Q 100 125 120 142" stroke="#1e293b" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    eyebrows = `<path d="M 65 80 Q 75 88 85 82" stroke="#1e293b" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M 115 82 Q 125 88 135 80" stroke="#1e293b" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    blush = `<path d="M 68 105 Q 65 125 72 135" stroke="#38bdf8" stroke-width="3" fill="none"/>`;
  } else if (emotion === 'thinking') {
    eyeLeft = `<circle cx="75" cy="90" r="8" fill="#1e293b"/>`;
    eyeRight = `<circle cx="125" cy="85" r="9" fill="#1e293b"/>`;
    mouth = `<path d="M 90 135 Q 105 138 115 130" stroke="#1e293b" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    eyebrows = `<path d="M 65 78 L 85 75" stroke="#1e293b" stroke-width="4" stroke-linecap="round"/><path d="M 115 68 Q 125 60 135 70" stroke="#1e293b" stroke-width="4" stroke-linecap="round"/>`;
  } else if (emotion === 'cool') {
    eyeLeft = `<path d="M 55 85 L 95 85 L 85 105 L 65 105 Z" fill="#0f172a"/><line x1="50" y1="88" x2="150" y2="88" stroke="#0f172a" stroke-width="4"/>`;
    eyeRight = `<path d="M 105 85 L 145 85 L 135 105 L 115 105 Z" fill="#0f172a"/>`;
    mouth = `<path d="M 85 132 Q 105 140 120 128" stroke="#1e293b" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    eyebrows = ``;
  }

  // Head SVG geometry
  let headPath = `<rect x="50" y="45" width="100" height="110" rx="45" fill="${skin}" stroke="#1e293b" stroke-width="5"/>`;
  if (headShape === 1) {
    headPath = `<ellipse cx="100" cy="100" rx="55" ry="58" fill="${skin}" stroke="#1e293b" stroke-width="5"/>`;
  } else if (headShape === 2) {
    headPath = `<rect x="45" y="45" width="110" height="105" rx="35" fill="${skin}" stroke="#1e293b" stroke-width="5"/>`;
  }

  // Hair SVG geometry
  let hairPath = `
    <path d="M 40 70 Q 100 15 160 70 Q 165 40 130 25 Q 100 18 70 25 Q 35 40 40 70 Z" fill="${hair}" stroke="#1e293b" stroke-width="4"/>
    <path d="M 40 70 C 35 100 45 120 50 125" stroke="#1e293b" stroke-width="5" fill="none"/>
    <path d="M 160 70 C 165 100 155 120 150 125" stroke="#1e293b" stroke-width="5" fill="none"/>
  `;
  if (hairStyle === 0) {
    // Spiky
    hairPath = `
      <polygon points="45,65 60,20 80,50 100,10 120,50 140,20 155,65 100,45" fill="${hair}" stroke="#1e293b" stroke-width="4"/>
    `;
  } else if (hairStyle === 2) {
    // Topknot / Ponytail
    hairPath = `
      <circle cx="100" cy="20" r="22" fill="${hair}" stroke="#1e293b" stroke-width="4"/>
      <path d="M 45 75 Q 100 35 155 75 Q 100 25 45 75 Z" fill="${hair}" stroke="#1e293b" stroke-width="4"/>
    `;
  } else if (hairStyle === 3) {
    // Cap / Visor / Band
    hairPath = `
      <path d="M 40 60 Q 100 30 160 60 L 175 65 L 160 78 L 40 78 Z" fill="${secondaryColor}" stroke="#1e293b" stroke-width="4"/>
      <circle cx="100" cy="45" r="40" fill="${primaryColor}" stroke="#1e293b" stroke-width="4"/>
    `;
  }

  // Outfit / Body
  const bodyPath = `
    <path d="M 45 155 Q 100 140 155 155 L 180 200 L 20 200 Z" fill="${primaryColor}" stroke="#1e293b" stroke-width="5"/>
    <path d="M 85 155 L 100 185 L 115 155" fill="${secondaryColor}" stroke="#1e293b" stroke-width="4"/>
  `;

  // Filter effect for styles
  let filterDef = '';
  if (style === 'pixar-3d') {
    filterDef = `
      <filter id="glow3d" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.25"/>
      </filter>
    `;
  } else if (style === 'cyberpunk-toon') {
    filterDef = `
      <filter id="neon" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="${secondaryColor}" flood-opacity="0.8"/>
      </filter>
    `;
  }

  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
      <defs>
        ${filterDef}
        <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0.3"/>
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="95" fill="url(#bgGrad)" stroke="${primaryColor}" stroke-width="3" stroke-dasharray="4 4"/>
      <g id="character-sprite">
        ${bodyPath}
        ${headPath}
        ${hairPath}
        ${eyebrows}
        ${eyeLeft}
        ${eyeRight}
        ${blush}
        ${mouth}
      </g>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
}

/**
 * Generate full emotion pack for a character.
 */
export function generateCharacterEmotions(
  name: string,
  style: ArtStyle,
  primaryColor: string,
  secondaryColor: string,
  seed: number
): Record<CharacterEmotion, string> {
  const emotions: CharacterEmotion[] = [
    'neutral',
    'happy',
    'excited',
    'surprised',
    'angry',
    'sad',
    'thinking',
    'scared',
    'cool',
  ];

  const result: Partial<Record<CharacterEmotion, string>> = {};
  for (const emotion of emotions) {
    result[emotion] = generateProceduralAvatar(name, style, primaryColor, secondaryColor, emotion, seed);
  }

  return result as Record<CharacterEmotion, string>;
}
