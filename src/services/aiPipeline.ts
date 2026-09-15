import { Project, Character, Scene, ArtStyle, AISettings, CharacterEmotion, CameraAngle, TransitionType, SFXType } from '../types/cartoon';
import { generateCharacterEmotions } from './avatarGenerator';
import { BACKGROUND_PRESETS } from './backgroundGenerator';

interface ScriptGenerationOptions {
  prompt: string;
  artStyle: ArtStyle;
  genre: string;
  targetSceneCount: number;
  aiSettings: AISettings;
}

/**
 * Intelligent Script Breakdown & Story Engine
 */
export async function generateCartoonProject(options: ScriptGenerationOptions): Promise<Project> {
  const { prompt, artStyle, genre, targetSceneCount, aiSettings } = options;

  // If Gemini API key is provided and selected, call Gemini API
  if (aiSettings.provider === 'gemini' && aiSettings.geminiApiKey) {
    try {
      return await generateWithGemini(prompt, artStyle, targetSceneCount, aiSettings.geminiApiKey);
    } catch (e) {
      console.warn('Gemini API call failed, falling back to smart engine:', e);
    }
  }

  // If OpenAI API key is provided and selected, call OpenAI API
  if (aiSettings.provider === 'openai' && aiSettings.openaiApiKey) {
    try {
      return await generateWithOpenAI(prompt, artStyle, targetSceneCount, aiSettings.openaiApiKey);
    } catch (e) {
      console.warn('OpenAI API call failed, falling back to smart engine:', e);
    }
  }

  // Smart Offline / Instant Procedural Engine
  return generateProceduralProject(prompt, artStyle, genre, targetSceneCount);
}

/**
 * Procedural AI Generator with rich creative story architectures
 */
function generateProceduralProject(
  prompt: string,
  artStyle: ArtStyle,
  genre: string,
  sceneCount: number
): Project {
  const projectId = 'proj_' + Math.random().toString(36).substring(2, 9);
  const cleanPrompt = prompt.trim() || 'A magical adventure with two funny cartoon friends discovering an ancient gadget';

  // Derive characters
  const char1Id = 'char_1';
  const char2Id = 'char_2';

  const char1Seed = Math.floor(Math.random() * 9000) + 1000;
  const char2Seed = Math.floor(Math.random() * 9000) + 1000;

  let char1Name = 'Pip';
  let char2Name = 'Nova';
  let char1Tagline = 'The energetic and curious explorer';
  let char2Tagline = 'The clever tech genius with witty remarks';

  if (cleanPrompt.toLowerCase().includes('detective') || genre.includes('comedy')) {
    char1Name = 'Detective Barnaby';
    char2Name = 'Pip the Rookie';
    char1Tagline = 'A serious detective with an appetite for donuts';
    char2Tagline = 'An eager sidekick who solves clues by accident';
  } else if (cleanPrompt.toLowerCase().includes('space') || cleanPrompt.toLowerCase().includes('galaxy')) {
    char1Name = 'Captain Cosmo';
    char2Name = 'Circuit the Bot';
    char1Tagline = 'Fearless galactic pilot';
    char2Tagline = 'A sarcastic high-tech robot companion';
  } else if (cleanPrompt.toLowerCase().includes('dragon') || cleanPrompt.toLowerCase().includes('magic')) {
    char1Name = 'Sparky the Dragon';
    char2Name = 'Elia the Apprentice';
    char1Tagline = 'A tiny dragon who loves baking sweet pastries';
    char2Tagline = 'A bubbly wizard apprentice always casting sparkles';
  }

  const char1Emotions = generateCharacterEmotions(char1Name, artStyle, '#8b5cf6', '#ec4899', char1Seed);
  const char2Emotions = generateCharacterEmotions(char2Name, artStyle, '#06b6d4', '#f59e0b', char2Seed);

  const characters: Character[] = [
    {
      id: char1Id,
      name: char1Name,
      tagline: char1Tagline,
      artStyle,
      primaryColor: '#8b5cf6',
      secondaryColor: '#ec4899',
      voiceGender: 'male',
      voicePitch: 1.15,
      voiceRate: 1.05,
      avatarPrompt: `${char1Name}, ${char1Tagline}`,
      avatarSeed: char1Seed,
      avatarUrl: char1Emotions['happy'],
      personality: 'Upbeat, daring, enthusiastic, quick to jump into action.',
      emotions: char1Emotions,
    },
    {
      id: char2Id,
      name: char2Name,
      tagline: char2Tagline,
      artStyle,
      primaryColor: '#06b6d4',
      secondaryColor: '#f59e0b',
      voiceGender: 'female',
      voicePitch: 0.95,
      voiceRate: 1.0,
      avatarPrompt: `${char2Name}, ${char2Tagline}`,
      avatarSeed: char2Seed,
      avatarUrl: char2Emotions['cool'],
      personality: 'Analytical, sarcastic, loyal, always equipped with gadgets.',
      emotions: char2Emotions,
    },
  ];

  // Generate scenes
  const bgKeys = BACKGROUND_PRESETS.map(b => b.id);
  const scenes: Scene[] = [];
  const actualCount = Math.max(2, Math.min(sceneCount, 6));

  const cameraAngles: CameraAngle[] = ['wide-shot', 'medium-shot', 'close-up', 'dynamic-pan', 'dutch-angle'];
  const transitions: TransitionType[] = ['fade', 'slide-left', 'zoom-in', 'bounce-cut', 'comic-wipe'];
  const sfxList: SFXType[] = ['boing', 'whoosh', 'pop', 'laser', 'fanfare', 'sparkle'];

  for (let i = 0; i < actualCount; i++) {
    const sceneId = `scene_${i + 1}`;
    const bgPreset = bgKeys[i % bgKeys.length];
    
    let title = `Scene ${i + 1}: The Discovery`;
    let visualPrompt = `Vibrant cartoon setting showing ${char1Name} and ${char2Name} examining a mysterious glowing item`;
    let dialogues = [
      {
        id: `dlg_${i}_1`,
        characterId: char1Id,
        text: i === 0 
          ? `Hey ${char2Name}! Look at what I just found over here!`
          : `Wait, what happens if we press this giant shiny button?`,
        emotion: (i === 0 ? 'excited' : 'surprised') as CharacterEmotion,
        startTime: 0.5,
        duration: 2.8,
      },
      {
        id: `dlg_${i}_2`,
        characterId: char2Id,
        text: i === 0 
          ? `Pip, don't touch anything until I run a diagnostic scan!`
          : `Don't touch it! It's radiating pure cartoon energy!`,
        emotion: (i === 0 ? 'thinking' : 'scared') as CharacterEmotion,
        startTime: 3.5,
        duration: 3.2,
      },
    ];

    if (i === 1) {
      title = `Scene 2: Chaos Unfolds`;
      visualPrompt = `Dynamic action angle with particle effects and cartoon commotion`;
    } else if (i === actualCount - 1) {
      title = `Scene ${actualCount}: The Victory Celebration`;
      visualPrompt = `Cheerful ending shot with celebratory sparkles and victory smiles`;
      dialogues = [
        {
          id: `dlg_${i}_1`,
          characterId: char1Id,
          text: `We actually pulled it off! Best cartoon adventure ever!`,
          emotion: 'happy',
          startTime: 0.5,
          duration: 3.0,
        },
        {
          id: `dlg_${i}_2`,
          characterId: char2Id,
          text: `And the best part? Nobody got turned into a giant marshmallow!`,
          emotion: 'cool',
          startTime: 3.8,
          duration: 3.4,
        },
      ];
    }

    scenes.push({
      id: sceneId,
      sceneNumber: i + 1,
      title,
      visualPrompt,
      backgroundUrl: bgPreset,
      cameraAngle: cameraAngles[i % cameraAngles.length],
      transition: transitions[i % transitions.length],
      duration: 7.5,
      characters: [char1Id, char2Id],
      dialogues,
      sfx: sfxList[i % sfxList.length],
      sfxTime: 2.0,
      particleEffect: i === 0 ? 'stars' : i === 1 ? 'speed-lines' : 'hearts',
    });
  }

  return {
    id: projectId,
    title: cleanPrompt.slice(0, 45) || 'The Great Cartoon Adventure',
    synopsis: cleanPrompt,
    artStyle,
    aspectRatio: '16:9',
    fps: 30,
    bgm: 'playful-adventure',
    bgmVolume: 0.35,
    characters,
    scenes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Call Gemini 1.5/2.0 API for custom script generation
 */
async function generateWithGemini(
  prompt: string,
  artStyle: ArtStyle,
  sceneCount: number,
  apiKey: string
): Promise<Project> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const systemPrompt = `You are an expert Cartoon Director and Screenplay Writer.
Generate a complete JSON cartoon project with ${sceneCount} scenes based on the user's prompt.
The JSON MUST strictly follow this TypeScript structure:
{
  "title": string,
  "synopsis": string,
  "characters": [
    { "name": string, "tagline": string, "personality": string, "voiceGender": "male"|"female"|"robot"|"child"|"creature" }
  ],
  "scenes": [
    {
      "sceneNumber": number,
      "title": string,
      "visualPrompt": string,
      "backgroundCategory": "sci-fi"|"nature"|"urban"|"fantasy"|"indoor",
      "cameraAngle": "wide-shot"|"medium-shot"|"close-up"|"dynamic-pan"|"dutch-angle",
      "transition": "fade"|"zoom-in"|"slide-left"|"bounce-cut"|"comic-wipe",
      "duration": number,
      "sfx": "boing"|"whoosh"|"pop"|"laser"|"fanfare"|"punch"|"sparkle"|"none",
      "particleEffect": "stars"|"bubbles"|"dust"|"speed-lines"|"hearts"|"none",
      "dialogues": [
        { "characterName": string, "text": string, "emotion": "happy"|"excited"|"surprised"|"angry"|"sad"|"thinking"|"cool"|"scared", "startTime": number, "duration": number }
      ]
    }
  ]
}
Return ONLY valid JSON without markdown wrapping.`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: `${systemPrompt}\n\nUser Concept: ${prompt}\nArt Style: ${artStyle}` }]
      }]
    })
  });

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('Empty response from Gemini');

  const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleanJson);

  // Transform into full Project
  return parseStructuredScriptToProject(parsed, artStyle, prompt);
}

/**
 * Call OpenAI API for script generation
 */
async function generateWithOpenAI(
  prompt: string,
  artStyle: ArtStyle,
  sceneCount: number,
  apiKey: string
): Promise<Project> {
  const url = `https://api.openai.com/v1/chat/completions`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert Cartoon Director. Generate a cartoon script JSON with ${sceneCount} scenes following exact JSON schema: { "title": string, "synopsis": string, "characters": [{"name": string, "tagline": string, "personality": string, "voiceGender": "male"|"female"|"robot"|"child"}], "scenes": [{"sceneNumber": number, "title": string, "visualPrompt": string, "cameraAngle": string, "transition": string, "duration": number, "sfx": string, "particleEffect": string, "dialogues": [{"characterName": string, "text": string, "emotion": string, "startTime": number, "duration": number}]}] }`
        },
        { role: 'user', content: `Concept: ${prompt}, Style: ${artStyle}` }
      ],
      response_format: { type: "json_object" }
    })
  });

  const data = await response.json();
  const rawText = data?.choices?.[0]?.message?.content;
  const parsed = JSON.parse(rawText);
  return parseStructuredScriptToProject(parsed, artStyle, prompt);
}

function parseStructuredScriptToProject(parsed: any, artStyle: ArtStyle, originalPrompt: string): Project {
  const projectId = 'proj_' + Math.random().toString(36).substring(2, 9);
  const characters: Character[] = [];
  const charIdMap: Record<string, string> = {};

  const colors = [
    { primary: '#8b5cf6', secondary: '#ec4899' },
    { primary: '#06b6d4', secondary: '#f59e0b' },
    { primary: '#10b981', secondary: '#6366f1' },
    { primary: '#ef4444', secondary: '#3b82f6' },
  ];

  (parsed.characters || []).forEach((c: any, idx: number) => {
    const id = `char_${idx + 1}`;
    charIdMap[c.name] = id;
    const seed = Math.floor(Math.random() * 8000) + 1000;
    const clr = colors[idx % colors.length];
    const emotions = generateCharacterEmotions(c.name, artStyle, clr.primary, clr.secondary, seed);

    characters.push({
      id,
      name: c.name || `Character ${idx + 1}`,
      tagline: c.tagline || 'Cartoon star',
      artStyle,
      primaryColor: clr.primary,
      secondaryColor: clr.secondary,
      voiceGender: c.voiceGender || (idx % 2 === 0 ? 'male' : 'female'),
      voicePitch: 1.0,
      voiceRate: 1.0,
      avatarPrompt: `${c.name}, ${c.tagline}`,
      avatarSeed: seed,
      avatarUrl: emotions['happy'],
      personality: c.personality || 'Animated and energetic',
      emotions,
    });
  });

  if (characters.length === 0) {
    return generateProceduralProject(originalPrompt, artStyle, 'comedy', 3);
  }

  const bgKeys = BACKGROUND_PRESETS.map(b => b.id);
  const scenes: Scene[] = (parsed.scenes || []).map((s: any, idx: number) => {
    const sceneId = `scene_${idx + 1}`;
    const dialogues = (s.dialogues || []).map((d: any, dIdx: number) => {
      const charId = charIdMap[d.characterName] || characters[0].id;
      return {
        id: `dlg_${idx}_${dIdx}`,
        characterId: charId,
        text: d.text,
        emotion: (d.emotion || 'happy') as CharacterEmotion,
        startTime: d.startTime || (dIdx * 3.0),
        duration: d.duration || 3.0,
      };
    });

    return {
      id: sceneId,
      sceneNumber: s.sceneNumber || idx + 1,
      title: s.title || `Scene ${idx + 1}`,
      visualPrompt: s.visualPrompt || 'Animated cartoon scene',
      backgroundUrl: bgKeys[idx % bgKeys.length],
      cameraAngle: (s.cameraAngle || 'wide-shot') as CameraAngle,
      transition: (s.transition || 'fade') as TransitionType,
      duration: s.duration || 7.0,
      characters: characters.map(c => c.id),
      dialogues,
      sfx: (s.sfx || 'none') as SFXType,
      sfxTime: 1.5,
      particleEffect: s.particleEffect || 'stars',
    };
  });

  return {
    id: projectId,
    title: parsed.title || 'AI Cartoon Masterpiece',
    synopsis: parsed.synopsis || originalPrompt,
    artStyle,
    aspectRatio: '16:9',
    fps: 30,
    bgm: 'playful-adventure',
    bgmVolume: 0.35,
    characters,
    scenes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Parses user raw script text into cartoon scenes and characters
 * Example syntax supported:
 * [SCENE 1: THE LAB]
 * PIP (excited): Look what I made!
 * NOVA (surprised): Is that a portal gun?
 */
export function parseUserScreenplay(scriptText: string, artStyle: ArtStyle): Project {
  const lines = scriptText.split('\n');
  const charactersFound: Set<string> = new Set();
  const rawScenes: { title: string; dialogues: { charName: string; text: string; emotion: CharacterEmotion }[] }[] = [];

  let currentScene = { title: 'Scene 1: Introduction', dialogues: [] as any[] };

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      if (currentScene.dialogues.length > 0) {
        rawScenes.push(currentScene);
      }
      currentScene = { title: trimmed.slice(1, -1), dialogues: [] };
      return;
    }

    // Match dialogue: NAME (emotion): text OR NAME: text
    const match = trimmed.match(/^([A-Za-z0-9_\s]+)(?:\s*\(([a-z]+)\))?\s*:\s*(.+)$/i);
    if (match) {
      const charName = match[1].trim();
      const rawEmotion = (match[2] || 'happy').toLowerCase() as CharacterEmotion;
      const text = match[3].trim();
      charactersFound.add(charName);
      currentScene.dialogues.push({
        charName,
        text,
        emotion: ['neutral', 'happy', 'excited', 'surprised', 'angry', 'sad', 'thinking', 'scared', 'cool'].includes(rawEmotion)
          ? rawEmotion
          : 'happy',
      });
    }
  });

  if (currentScene.dialogues.length > 0) {
    rawScenes.push(currentScene);
  }

  if (rawScenes.length === 0) {
    return generateProceduralProject(scriptText, artStyle, 'custom', 3);
  }

  const parsedObj = {
    title: 'Custom Script Cartoon',
    synopsis: scriptText.slice(0, 100),
    characters: Array.from(charactersFound).map(name => ({
      name,
      tagline: 'Custom character',
      personality: 'Expressive cartoon character',
      voiceGender: 'male',
    })),
    scenes: rawScenes.map((s, idx) => ({
      sceneNumber: idx + 1,
      title: s.title,
      visualPrompt: `Cartoon setting for ${s.title}`,
      cameraAngle: 'wide-shot',
      transition: 'fade',
      duration: Math.max(5, s.dialogues.length * 3.5),
      dialogues: s.dialogues.map((d, dIdx) => ({
        characterName: d.charName,
        text: d.text,
        emotion: d.emotion,
        startTime: dIdx * 3.2,
        duration: 3.0,
      })),
    })),
  };

  return parseStructuredScriptToProject(parsedObj, artStyle, scriptText);
}
