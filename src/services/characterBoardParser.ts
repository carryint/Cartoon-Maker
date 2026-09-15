import { Character } from '../types/studio';

// ============================================================
//  Character Board Parser
//  Extracts Character metadata from uploaded image + optional text
// ============================================================

export interface ParsedCharacterData {
  name: string;
  role: Character['role'];
  description: string;
  colorPrimary: string;
  colorSecondary: string;
  voiceProfile: Character['voiceProfile'];
}

/**
 * Parses raw script text description (extracted from a character board form)
 * into a structured Character object.
 */
export function parseCharacterFromText(
  text: string,
  imageUrl: string,
  id: string
): Character {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // Extract name: first line or "Name: X"
  let name = 'Unknown Character';
  let role: Character['role'] = 'guest';
  let description = text;
  let colorPrimary = '#8b5cf6';
  let colorSecondary = '#06b6d4';

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.startsWith('name:')) {
      name = line.replace(/^name:/i, '').trim();
    } else if (lower.startsWith('role:')) {
      const r = line.replace(/^role:/i, '').trim().toLowerCase();
      if (r.includes('protagonist') || r.includes('main') || r.includes('hero')) role = 'protagonist';
      else if (r.includes('sidekick') || r.includes('friend') || r.includes('companion')) role = 'sidekick';
      else if (r.includes('animal') || r.includes('cat') || r.includes('dog')) role = 'animal';
      else if (r.includes('narrator')) role = 'narrator';
      else if (r.includes('villain') || r.includes('antagonist')) role = 'antagonist';
    } else if (lower.startsWith('color:') || lower.startsWith('primary color:')) {
      const colorMatch = line.match(/#[0-9a-fA-F]{3,6}/);
      if (colorMatch) colorPrimary = colorMatch[0];
    }
  }

  // Auto-detect voice profile from description
  const lowerText = text.toLowerCase();
  let voiceGender: Character['voiceProfile']['gender'] = 'female';
  let pitch = 1.0;
  let rate = 1.0;

  if (lowerText.includes('toddler') || lowerText.includes('baby') || lowerText.includes('little girl') || lowerText.includes('child')) {
    voiceGender = 'child';
    pitch = 1.4;
    rate = 0.95;
  } else if (lowerText.includes('cat') || lowerText.includes('animal') || lowerText.includes('creature')) {
    voiceGender = 'creature';
    pitch = 1.5;
    rate = 1.1;
  } else if (lowerText.includes('old man') || lowerText.includes('elder') || lowerText.includes('grandfather')) {
    voiceGender = 'male';
    pitch = 0.7;
    rate = 0.85;
  } else if (lowerText.includes('boy') || lowerText.includes('man') || lowerText.includes('male')) {
    voiceGender = 'male';
    pitch = 0.95;
    rate = 1.0;
  }

  return {
    id,
    name: name || 'New Character',
    role,
    description,
    boardImageUrl: imageUrl,
    colorPrimary,
    colorSecondary,
    voiceProfile: {
      lang: 'en-US',
      pitch,
      rate,
      gender: voiceGender,
    },
  };
}

/**
 * Reads a dropped/uploaded File object and returns a data URL for preview
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Extracts dominant colors from an image element using canvas sampling
 */
export async function extractColorsFromImage(imageUrl: string): Promise<{ primary: string; secondary: string }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 10;
        canvas.height = 10;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve({ primary: '#8b5cf6', secondary: '#06b6d4' });
        ctx.drawImage(img, 0, 0, 10, 10);
        const data = ctx.getImageData(0, 0, 10, 10).data;
        // Sample two patches: top-left and bottom-right
        const r1 = data[0], g1 = data[1], b1 = data[2];
        const r2 = data[data.length - 4], g2 = data[data.length - 3], b2 = data[data.length - 2];
        const toHex = (r: number, g: number, b: number) =>
          '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
        resolve({ primary: toHex(r1, g1, b1), secondary: toHex(r2, g2, b2) });
      } catch {
        resolve({ primary: '#8b5cf6', secondary: '#06b6d4' });
      }
    };
    img.onerror = () => resolve({ primary: '#8b5cf6', secondary: '#06b6d4' });
    img.src = imageUrl;
  });
}
