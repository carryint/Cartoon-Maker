import { Scene, DialogueLine, SceneBackground, Character, Emotion, CameraShot, Transition } from '../types/studio';

// ============================================================
//  Script Parser
//  Converts raw screenplay text → structured Scene[]
// ============================================================

let _sceneCounter = 1;
let _dialogueCounter = 1;

function nextSceneId() { return `scene_${_sceneCounter++}`; }
function nextDialogueId() { return `dial_${_dialogueCounter++}`; }

function detectBackground(description: string): SceneBackground {
  const d = description.toLowerCase();
  let type: SceneBackground['type'] = 'forest-path';

  if (d.includes('cottage') || d.includes('house') || d.includes('home')) type = 'forest-cottage';
  else if (d.includes('river') || d.includes('stream') || d.includes('waterfall')) type = 'river-stream';
  else if (d.includes('meadow') || d.includes('field') || d.includes('flowers')) type = 'open-meadow';
  else if (d.includes('sunset') || d.includes('dusk') || d.includes('evening')) type = 'sunset-hill';
  else if (d.includes('night') || d.includes('stars') || d.includes('moon')) type = 'night-sky';
  else if (d.includes('indoor') || d.includes('room') || d.includes('inside') || d.includes('kitchen')) type = 'indoor-room';

  return { type, description };
}

function detectCamera(text: string): CameraShot {
  const t = text.toLowerCase();
  if (t.includes('close-up') || t.includes('closeup') || t.includes('close up')) return 'close-up';
  if (t.includes('wide shot') || t.includes('wide angle') || t.includes('establishing')) return 'wide';
  if (t.includes('aerial') || t.includes('bird\'s eye') || t.includes('overhead')) return 'aerial';
  if (t.includes('pan left') || t.includes('panning left')) return 'pan-left';
  if (t.includes('pan right') || t.includes('panning right')) return 'pan-right';
  return 'medium';
}

function detectTransition(text: string, nextText?: string): Transition {
  const t = (text + ' ' + (nextText || '')).toLowerCase();
  if (t.includes('fade') || t.includes('fade to black')) return 'fade';
  if (t.includes('dissolve')) return 'dissolve';
  if (t.includes('wipe')) return 'wipe';
  if (t.includes('zoom in') || t.includes('smash cut')) return 'zoom-in';
  if (t.includes('zoom out')) return 'zoom-out';
  return 'cut';
}

function detectEmotion(parenthetical: string): Emotion {
  const p = parenthetical.toLowerCase();
  if (p.includes('happy') || p.includes('joyful') || p.includes('smile')) return 'happy';
  if (p.includes('excited') || p.includes('thrilled') || p.includes('whoa')) return 'excited';
  if (p.includes('sad') || p.includes('cry') || p.includes('tearful')) return 'sad';
  if (p.includes('scared') || p.includes('fear') || p.includes('trembling')) return 'scared';
  if (p.includes('angry') || p.includes('upset') || p.includes('furious')) return 'angry';
  if (p.includes('surprised') || p.includes('shocked') || p.includes('gasp')) return 'surprised';
  if (p.includes('thinking') || p.includes('wonder') || p.includes('curious')) return 'thinking';
  if (p.includes('tender') || p.includes('gentle') || p.includes('caring')) return 'tender';
  return 'neutral';
}

/**
 * Parses raw screenplay text into an array of structured Scene objects.
 * Understands common formats:
 *   SCENE N — TITLE
 *   Setting: ...
 *   Camera: ...
 *   CHARACTER: (emotion) dialogue text
 *   --- (scene divider)
 */
export function parseScript(rawScript: string, characters: Character[]): Scene[] {
  _sceneCounter = 1;
  _dialogueCounter = 1;

  const scenes: Scene[] = [];

  // Split on SCENE headers or --- dividers
  const chunks = rawScript.split(/(?=SCENE\s+\d+|^---\s*$)/mi).filter(c => c.trim().length > 5);

  for (const chunk of chunks) {
    const lines = chunk.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) continue;

    // Scene header
    const headerMatch = lines[0].match(/^SCENE\s+(\d+)\s*[—\-–:]\s*(.*)/i);
    const sceneNumber = headerMatch ? parseInt(headerMatch[1]) : scenes.length + 1;
    const title = headerMatch ? headerMatch[2].trim() : `Scene ${sceneNumber}`;

    let settingDesc = '';
    let cameraHint = '';
    const dialogues: DialogueLine[] = [];
    const charIds = new Set<string>();
    let sfx = '';
    let mood = '';

    let i = 1; // skip header line
    while (i < lines.length) {
      const line = lines[i];
      const lower = line.toLowerCase();

      if (lower.startsWith('setting:')) {
        settingDesc = line.replace(/^setting:/i, '').trim();
      } else if (lower.startsWith('camera:')) {
        cameraHint = line.replace(/^camera:/i, '').trim();
      } else if (lower.startsWith('sfx:') || lower.startsWith('sound:')) {
        sfx = line.replace(/^(sfx|sound):/i, '').trim();
      } else if (lower.startsWith('mood:') || lower.startsWith('music:') || lower.startsWith('bgm:')) {
        mood = line.replace(/^(mood|music|bgm):/i, '').trim();
      } else {
        // Try to match dialogue: CHARACTER: (emotion) text  or  CHARACTER: text
        const dialMatch = line.match(/^([A-Z][A-Z\s']+?)\s*:\s*(?:\(([^)]*)\)\s*)?(.*)/);
        if (dialMatch) {
          const charNameRaw = dialMatch[1].trim();
          const emotion = detectEmotion(dialMatch[2] || '');
          const text = dialMatch[3].trim();

          if (text) {
            // Try to find matching character
            const char = characters.find(c =>
              c.name.toLowerCase() === charNameRaw.toLowerCase() ||
              charNameRaw.toLowerCase().includes(c.name.toLowerCase())
            );

            if (char) charIds.add(char.id);

            const charId = char?.id || `unknown_${charNameRaw.toLowerCase().replace(/\s+/g, '_')}`;
            dialogues.push({
              id: nextDialogueId(),
              characterId: charId,
              text,
              emotion,
              startOffset: dialogues.length === 0 ? 0.5 : dialogues.reduce((s, d) => s + d.duration + 0.3, 0.5),
              duration: Math.max(1.5, text.length * 0.06),
            });
          }
        }
      }

      i++;
    }

    const totalDuration = dialogues.reduce((s, d) => s + d.duration + 0.3, 0) + 2;

    scenes.push({
      id: nextSceneId(),
      sceneNumber,
      title,
      description: settingDesc || title,
      background: detectBackground(settingDesc),
      cameraShot: detectCamera(cameraHint || settingDesc),
      transition: detectTransition(chunk, chunks[scenes.length + 1] || ''),
      duration: Math.max(6, Math.min(totalDuration, 120)),
      characterIds: Array.from(charIds),
      dialogues,
      sfx: sfx || undefined,
      mood: mood || undefined,
    });
  }

  return scenes;
}

/**
 * Renders a human-friendly summary of parsed scenes
 */
export function summarizeScenes(scenes: Scene[]): string {
  return scenes
    .map(s => `Scene ${s.sceneNumber}: "${s.title}" — ${s.dialogues.length} dialogue lines, ${Math.round(s.duration)}s`)
    .join('\n');
}
