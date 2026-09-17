import { Scene, CharacterDNA, LocationDNA, DialogueLine, EmotionType, CameraShotType, LightingMood, WeatherType, ContinuityState } from '../../types/lilo';

// ============================================================
//  Script Engine — Structured Screenplay Parser & Analyzer
// ============================================================

export function parseScriptToScenes(
  rawScript: string,
  characters: CharacterDNA[],
  locations: LocationDNA[]
): Scene[] {
  if (!rawScript.trim()) return [];

  // Split on SCENE headers or --- dividers
  const rawChunks = rawScript.split(/(?=SCENE\s+\d+|^---\s*$)/mi).filter(c => c.trim().length > 5);
  const scenes: Scene[] = [];

  let previousSummary = '';

  for (let index = 0; index < rawChunks.length; index++) {
    const chunk = rawChunks[index];
    const lines = chunk.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) continue;

    const sceneNumber = index + 1;
    let title = `Scene ${sceneNumber}`;
    let description = '';
    let locationId = locations[0]?.id || 'loc_cottage';
    let cameraShot: CameraShotType = 'medium';
    let lighting: LightingMood = 'morning-sunlight';
    let weather: WeatherType = 'sunny';
    let musicMood: any = 'happy';

    // Parse header line
    const headerMatch = lines[0].match(/^SCENE\s+(\d+)\s*[—\-–:]\s*(.*)/i);
    if (headerMatch) {
      title = headerMatch[2].trim();
    }

    const dialogues: DialogueLine[] = [];
    const charIdsInScene = new Set<string>();
    let currentOffset = 1.0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const lower = line.toLowerCase();
      if (lower.startsWith('setting:') || lower.startsWith('location:')) {
        description = line.replace(/^(setting|location):/i, '').trim();
        // Match location
        const matchedLoc = locations.find(loc => 
          description.toLowerCase().includes(loc.name.toLowerCase()) ||
          description.toLowerCase().includes(loc.type.toLowerCase())
        );
        if (matchedLoc) locationId = matchedLoc.id;
      } else if (lower.startsWith('camera:')) {
        const cam = lower.replace(/^camera:/i, '');
        if (cam.includes('wide')) cameraShot = 'wide';
        else if (cam.includes('close')) cameraShot = 'close-up';
        else if (cam.includes('aerial')) cameraShot = 'aerial';
        else if (cam.includes('track')) cameraShot = 'tracking';
        else cameraShot = 'medium';
      } else if (lower.startsWith('lighting:') || lower.startsWith('light:')) {
        if (lower.includes('sunset')) lighting = 'warm-sunset';
        else if (lower.includes('night') || lower.includes('moon')) lighting = 'moonlit-night';
        else if (lower.includes('gold')) lighting = 'golden-hour';
        else if (lower.includes('magic') || lower.includes('glow')) lighting = 'mystical-glow';
        else lighting = 'morning-sunlight';
      } else if (lower.startsWith('weather:')) {
        if (lower.includes('rain')) weather = 'rainy';
        else if (lower.includes('wind')) weather = 'windy';
        else if (lower.includes('cloud')) weather = 'partly-cloudy';
        else weather = 'sunny';
      } else if (lower.startsWith('music:') || lower.startsWith('mood:')) {
        if (lower.includes('adventure')) musicMood = 'adventure';
        else if (lower.includes('magic')) musicMood = 'magical';
        else if (lower.includes('calm')) musicMood = 'calm';
        else if (lower.includes('suspense')) musicMood = 'suspense';
        else musicMood = 'happy';
      } else {
        // Dialogue detection: NAME: (emotion) dialogue text
        const dialMatch = line.match(/^([A-Z0-9\s']+?)\s*:\s*(?:\(([^)]*)\)\s*)?(.*)/i);
        if (dialMatch) {
          const rawCharName = dialMatch[1].trim();
          const rawEmotion = (dialMatch[2] || 'happy').toLowerCase();
          const text = dialMatch[3].trim();

          if (text) {
            const matchedChar = characters.find(c => 
              c.name.toLowerCase() === rawCharName.toLowerCase() ||
              rawCharName.toLowerCase().includes(c.name.toLowerCase())
            );

            const charId = matchedChar?.id || `char_${rawCharName.toLowerCase()}`;
            charIdsInScene.add(charId);

            let emotion: EmotionType = 'happy';
            if (rawEmotion.includes('excite')) emotion = 'excited';
            else if (rawEmotion.includes('sad')) emotion = 'sad';
            else if (rawEmotion.includes('scare')) emotion = 'scared';
            else if (rawEmotion.includes('think') || rawEmotion.includes('curious')) emotion = 'curious';
            else if (rawEmotion.includes('laugh')) emotion = 'laughing';

            const estimatedDuration = Math.max(2.0, text.length * 0.065);

            dialogues.push({
              id: `dial_${sceneNumber}_${dialogues.length + 1}`,
              characterId: charId,
              text,
              emotion,
              startOffset: currentOffset,
              duration: estimatedDuration,
              phonemes: [
                { time: 0, viseme: 'open' },
                { time: estimatedDuration * 0.5, viseme: 'smile' },
                { time: estimatedDuration, viseme: 'closed' },
              ]
            });

            currentOffset += estimatedDuration + 0.6;
          }
        }
      }
    }

    const totalDuration = Math.max(6, currentOffset + 1.5);
    const continuity: ContinuityState = {
      heldProps: {},
      characterOutfits: {},
      currentWeather: weather,
      currentLighting: lighting,
      timeOfDay: lighting === 'moonlit-night' ? 'Night' : lighting === 'warm-sunset' ? 'Sunset' : 'Morning',
      previousSceneSummary: previousSummary,
    };

    previousSummary = `${title}: ${dialogues.length} dialogues in ${locationId}`;

    scenes.push({
      id: `scene_${sceneNumber}`,
      sceneNumber,
      title,
      description: description || `Episode scene at ${title}`,
      locationId,
      characterIds: Array.from(charIdsInScene),
      camera: {
        shot: cameraShot,
        movement: cameraShot === 'tracking' ? 'Slow horizontal pan' : 'Static with subtle breathing zoom',
      },
      lighting,
      weather,
      duration: totalDuration,
      dialogues,
      actions: Array.from(charIdsInScene).map((cId, idx) => ({
        id: `act_${sceneNumber}_${idx}`,
        characterId: cId,
        action: 'standing',
        startOffset: 0,
        duration: totalDuration,
      })),
      soundEffects: [
        {
          id: `sfx_${sceneNumber}_1`,
          name: locationId.includes('forest') ? 'birds-chirping' : 'room-ambience',
          category: 'nature',
          startTime: 0.5,
          duration: totalDuration,
          volume: 0.25,
          pan: 0,
          loop: true,
        }
      ],
      music: {
        id: `mus_${sceneNumber}`,
        title: `${musicMood.toUpperCase()} Theme`,
        mood: musicMood,
        volume: 0.35,
        duckAmount: 0.15,
        fadeInSec: 0.5,
        fadeOutSec: 0.5,
      },
      transition: index === rawChunks.length - 1 ? 'fade-to-black' : 'dissolve',
      continuity,
      isApproved: true,
    });
  }

  return scenes;
}
