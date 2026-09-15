import { Project, Scene, AnimalFriend, AISettings, CameraAngle, TransitionType, SFXType } from '../types/cartoon';
import { LILO_CHARACTER, MOZZ_CHARACTER, ANIMAL_FRIENDS } from '../data/liloMozzDefaults';

interface GenerateEpisodeOptions {
  prompt: string;
  durationMinutes: number; // 2 to 20 minutes
  selectedAnimal?: AnimalFriend;
  selectedOutfitLiLo?: string;
  selectedOutfitMozz?: string;
  aiSettings: AISettings;
}

export async function generateLiLoMozzEpisode(options: GenerateEpisodeOptions): Promise<Project> {
  const { prompt, durationMinutes, selectedAnimal, selectedOutfitLiLo, selectedOutfitMozz, aiSettings } = options;
  const minutes = Math.max(2, Math.min(20, durationMinutes || 3));

  // Determine animal friend
  const animal = selectedAnimal || ANIMAL_FRIENDS.find(a => 
    prompt.toLowerCase().includes(a.species.toLowerCase()) || prompt.toLowerCase().includes(a.name.toLowerCase())
  ) || ANIMAL_FRIENDS[Math.floor(Math.random() * ANIMAL_FRIENDS.length)];

  // If Gemini or OpenAI API keys are provided and active, call live AI with LiLo & Mozz system prompt
  if (aiSettings.provider === 'gemini' && aiSettings.geminiApiKey) {
    try {
      return await generateLiLoWithGemini(prompt, minutes, animal, aiSettings.geminiApiKey);
    } catch (e) {
      console.warn('Gemini episode generation failed, falling back to smart procedural engine:', e);
    }
  }

  if (aiSettings.provider === 'openai' && aiSettings.openaiApiKey) {
    try {
      return await generateLiLoWithOpenAI(prompt, minutes, animal, aiSettings.openaiApiKey);
    } catch (e) {
      console.warn('OpenAI episode generation failed, falling back to smart procedural engine:', e);
    }
  }

  // Smart Procedural Story Generator for LiLo & Mozz
  return generateProceduralLiLoEpisode(prompt, minutes, animal, selectedOutfitLiLo, selectedOutfitMozz);
}

/**
 * Procedural LiLo & Mozz Episode Generator
 * Calculates scene count based on duration (e.g. 2 min = 8 scenes, 5 min = 18 scenes, 10 min = 35 scenes, 20 min = 65 scenes)
 */
function generateProceduralLiLoEpisode(
  prompt: string,
  minutes: number,
  animal: AnimalFriend,
  liloOutfit: string = 'casual-dress',
  mozzOutfit: string = 'regular-look'
): Project {
  const targetSeconds = minutes * 60;
  const avgSceneDuration = 8.5; // seconds per scene
  const sceneCount = Math.max(6, Math.round(targetSeconds / avgSceneDuration));

  const lilo = { ...LILO_CHARACTER, selectedOutfit: liloOutfit };
  const mozz = { ...MOZZ_CHARACTER, selectedOutfit: mozzOutfit };

  const cleanPrompt = prompt.trim() || `LiLo and Mozz help ${animal.name} (${animal.species}) resolve their challenge in the lush woods`;
  const episodeTitle = `LiLo & Mozz: The Adventure of ${animal.name}`;
  const forestTip = `Forest Tip: ${animal.lesson}`;

  const scenes: Scene[] = [];

  const cameraAngles: CameraAngle[] = ['wide-shot', 'medium-shot', 'close-up', 'dynamic-pan', 'medium-shot'];
  const transitions: TransitionType[] = ['fade', 'zoom-in', 'slide-left', 'bounce-cut', 'comic-wipe'];
  const backgrounds = ['forest-cottage', 'enchanted-forest', 'forest-cottage', 'enchanted-forest'];

  // 4 Narrative Milestones
  const act1Count = Math.max(1, Math.floor(sceneCount * 0.25)); // Morning Exploration
  const act2Count = Math.max(2, Math.floor(sceneCount * 0.35)); // Animal Encounter & Challenge
  const act3Count = Math.max(2, Math.floor(sceneCount * 0.25)); // Teamwork & Nature Rescue
  const act4Count = Math.max(1, sceneCount - (act1Count + act2Count + act3Count)); // Celebration & Forest Tip

  let currentIdx = 1;

  // ACT 1: Morning Exploration
  for (let i = 0; i < act1Count; i++) {
    const sId = `scene_${currentIdx}`;
    scenes.push({
      id: sId,
      sceneNumber: currentIdx,
      act: 'Act 1: Morning Exploration',
      title: i === 0 ? 'Sunrise at the Forest Cottage' : 'Exploring the Whispering Trails',
      visualPrompt: i === 0 
        ? 'Sunbeams filtering through tall pines onto the cozy red-roof cottage while LiLo greets the morning'
        : 'LiLo and Mozz following a stone pathway lined with wildflowers and dew drops',
      backgroundUrl: 'forest-cottage',
      cameraAngle: cameraAngles[i % cameraAngles.length],
      transition: i === 0 ? 'fade' : transitions[i % transitions.length],
      duration: avgSceneDuration,
      characters: ['char_lilo', 'char_mozz'],
      dialogues: [
        {
          id: `dlg_${currentIdx}_1`,
          characterId: 'char_lilo',
          text: i === 0 
            ? 'Wake up, Mozz! The forest is calling, and there are so many new friends to discover today!'
            : 'Look at the green moss on the stones, Mozz! It feels as soft as a velvet cushion!',
          emotion: i === 0 ? 'excited' : 'happy',
          startTime: 0.5,
          duration: 3.6,
        },
        {
          id: `dlg_${currentIdx}_2`,
          characterId: 'char_mozz',
          text: i === 0 
            ? 'Meow-purr! I already have my little explorer paws ready! Let\'s go!'
            : 'Purr! And look at that shiny beetle climbing up the oak bark! Nature is amazing!',
          emotion: 'happy',
          startTime: 4.3,
          duration: 3.5,
        }
      ],
      sfx: 'nature-birds',
      sfxTime: 1.0,
      particleEffect: 'leaves',
      forestLessonNote: 'Observing the harmony of the morning forest ecosystem.',
    });
    currentIdx++;
  }

  // ACT 2: Animal Friend in Need
  for (let i = 0; i < act2Count; i++) {
    const sId = `scene_${currentIdx}`;
    scenes.push({
      id: sId,
      sceneNumber: currentIdx,
      act: 'Act 2: Animal Friend in Need',
      title: i === 0 ? `Encountering ${animal.name}` : `Understanding the Forest Challenge`,
      visualPrompt: `LiLo kneeling gently beside ${animal.name} (${animal.species}) while Mozz investigates with curiosity`,
      backgroundUrl: 'enchanted-forest',
      cameraAngle: i === 0 ? 'close-up' : 'medium-shot',
      transition: transitions[i % transitions.length],
      duration: avgSceneDuration,
      characters: ['char_lilo', 'char_mozz'],
      dialogues: [
        {
          id: `dlg_${currentIdx}_1`,
          characterId: 'char_lilo',
          text: i === 0 
            ? `Oh Mozz, look over here! It's ${animal.name}! Something is troubling our little friend.`
            : `They told us: "${animal.problem}" We have to help them safely!`,
          emotion: i === 0 ? 'surprised' : 'thinking',
          startTime: 0.5,
          duration: 3.8,
        },
        {
          id: `dlg_${currentIdx}_2`,
          characterId: 'char_mozz',
          text: i === 0 
            ? `Meow! Don't worry ${animal.name}, LiLo and Mozz are on the rescue team!`
            : `Let's use our teamwork! I'll scout the path ahead with my cat eyes!`,
          emotion: 'excited',
          startTime: 4.5,
          duration: 3.5,
        }
      ],
      sfx: 'sparkle',
      sfxTime: 1.5,
      particleEffect: 'butterflies',
      forestLessonNote: animal.problem,
    });
    currentIdx++;
  }

  // ACT 3: Nature Solution & Rescue
  for (let i = 0; i < act3Count; i++) {
    const sId = `scene_${currentIdx}`;
    scenes.push({
      id: sId,
      sceneNumber: currentIdx,
      act: 'Act 3: Nature Solution & Rescue',
      title: i === 0 ? 'Working Together for Nature' : 'The Safe Forest Reunion',
      visualPrompt: `LiLo and Mozz clearing debris, planting flowers, and guiding ${animal.name} to safety`,
      backgroundUrl: 'enchanted-forest',
      cameraAngle: 'dynamic-pan',
      transition: transitions[i % transitions.length],
      duration: avgSceneDuration,
      characters: ['char_lilo', 'char_mozz'],
      dialogues: [
        {
          id: `dlg_${currentIdx}_1`,
          characterId: 'char_lilo',
          text: i === 0 
            ? 'If we gently move these fallen twigs and collect the litter, the pathway will be safe again!'
            : `Hurray! ${animal.name} is safely back with their forest family!`,
          emotion: i === 0 ? 'thinking' : 'excited',
          startTime: 0.6,
          duration: 3.6,
        },
        {
          id: `dlg_${currentIdx}_2`,
          characterId: 'char_mozz',
          text: i === 0 
            ? 'Look how clear and sparkling the water looks now! High paw, LiLo!'
            : 'Purr-purr! The whole forest is chirping with gratitude!',
          emotion: 'happy',
          startTime: 4.4,
          duration: 3.5,
        }
      ],
      sfx: 'fanfare',
      sfxTime: 2.0,
      particleEffect: 'stars',
      forestLessonNote: 'Responsible environmental stewardship.',
    });
    currentIdx++;
  }

  // ACT 4: Forest Tip & Celebration
  for (let i = 0; i < act4Count; i++) {
    const sId = `scene_${currentIdx}`;
    const isFinal = (i === act4Count - 1);
    scenes.push({
      id: sId,
      sceneNumber: currentIdx,
      act: 'Act 4: Forest Tip & Celebration',
      title: isFinal ? 'LiLo\'s Forest Tip for Children' : 'Celebration at Sunset',
      visualPrompt: isFinal 
        ? 'LiLo looking warmly into the camera with Mozz waving a little paw among colorful butterflies'
        : 'Golden sunset glow over the forest cottage as all animal friends rejoice together',
      backgroundUrl: 'forest-cottage',
      cameraAngle: isFinal ? 'medium-shot' : 'wide-shot',
      transition: isFinal ? 'comic-wipe' : 'zoom-in',
      duration: isFinal ? 10.0 : avgSceneDuration,
      characters: ['char_lilo', 'char_mozz'],
      dialogues: [
        {
          id: `dlg_${currentIdx}_1`,
          characterId: 'char_lilo',
          text: isFinal 
            ? `Here is today\'s Forest Tip: ${animal.lesson}`
            : 'Every plant, stream, and animal is connected in our wonderful forest home!',
          emotion: isFinal ? 'winking' : 'happy',
          startTime: 0.5,
          duration: 4.5,
        },
        {
          id: `dlg_${currentIdx}_2`,
          characterId: 'char_mozz',
          text: isFinal 
            ? 'Together, we can keep the earth green and kind! See you on our next LiLo & Mozz adventure!'
            : 'Meow! Best adventure ever! Who wants to celebrate with a delicious berry treat?',
          emotion: 'excited',
          startTime: 5.2,
          duration: 4.0,
        }
      ],
      sfx: 'sparkle',
      sfxTime: 1.0,
      particleEffect: 'hearts',
      forestLessonNote: forestTip,
    });
    currentIdx++;
  }

  return {
    id: `lilo_ep_${Date.now()}`,
    title: episodeTitle,
    synopsis: cleanPrompt,
    targetDurationMinutes: minutes,
    forestTip,
    animalFriend: animal,
    artStyle: 'pixar-3d',
    aspectRatio: '16:9',
    fps: 30,
    bgm: 'lilo-forest-morning',
    bgmVolume: 0.35,
    characters: [lilo, mozz],
    scenes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

async function generateLiLoWithGemini(
  prompt: string,
  minutes: number,
  animal: AnimalFriend,
  apiKey: string
): Promise<Project> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const sceneCount = Math.max(6, Math.min(60, Math.round((minutes * 60) / 8.5)));

  const systemPrompt = `You are the Lead Writer & Director for "LiLo & Mozz", a heartwarming children's cartoon.
Main characters:
- LiLo: Curious, joyful, and kind toddler girl who explores the forest.
- Mozz: Playful, loyal ginger tabby cat with turquoise bowtie who adds humor.
Themes: Protecting nature, wildlife rescue, biodiversity, clean rivers, reducing waste.
The episode MUST conclude with LiLo's signature "Forest Tip" for kids.

Generate exactly ${sceneCount} scenes in structured JSON:
{
  "title": string,
  "synopsis": string,
  "forestTip": string,
  "scenes": [
    {
      "sceneNumber": number,
      "act": "Act 1: Morning Exploration"|"Act 2: Animal Friend in Need"|"Act 3: Nature Solution & Rescue"|"Act 4: Forest Tip & Celebration",
      "title": string,
      "visualPrompt": string,
      "cameraAngle": "wide-shot"|"medium-shot"|"close-up"|"dynamic-pan"|"dutch-angle",
      "transition": "fade"|"zoom-in"|"slide-left"|"bounce-cut"|"comic-wipe",
      "duration": number,
      "sfx": "nature-birds"|"river-stream"|"cat-meow"|"fanfare"|"sparkle"|"pop",
      "particleEffect": "leaves"|"butterflies"|"stars"|"hearts",
      "dialogues": [
        { "characterName": "LiLo"|"Mozz", "text": string, "emotion": "happy"|"excited"|"surprised"|"winking"|"thinking", "startTime": number, "duration": number }
      ]
    }
  ]
}
Return valid JSON only.`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: `${systemPrompt}\n\nEpisode Concept: ${prompt}\nAnimal Friend: ${animal.name} (${animal.species})\nTarget Duration: ${minutes} minutes` }]
      }]
    })
  });

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('Empty Gemini response');

  const clean = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(clean);

  return transformParsedToLiLoProject(parsed, minutes, animal, prompt);
}

async function generateLiLoWithOpenAI(
  prompt: string,
  minutes: number,
  animal: AnimalFriend,
  apiKey: string
): Promise<Project> {
  const url = 'https://api.openai.com/v1/chat/completions';
  const sceneCount = Math.max(6, Math.min(60, Math.round((minutes * 60) / 8.5)));

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
          content: `You are the writer for the LiLo & Mozz cartoon series. Generate a ${sceneCount}-scene episode in JSON format following the schema: { "title": string, "synopsis": string, "forestTip": string, "scenes": [{"sceneNumber": number, "act": string, "title": string, "visualPrompt": string, "cameraAngle": string, "transition": string, "duration": number, "sfx": string, "particleEffect": string, "dialogues": [{"characterName": "LiLo"|"Mozz", "text": string, "emotion": string, "startTime": number, "duration": number}]}] }`
        },
        { role: 'user', content: `Concept: ${prompt}, Animal: ${animal.name}, Duration: ${minutes} min` }
      ],
      response_format: { type: 'json_object' }
    })
  });

  const data = await response.json();
  const rawText = data?.choices?.[0]?.message?.content;
  const parsed = JSON.parse(rawText);
  return transformParsedToLiLoProject(parsed, minutes, animal, prompt);
}

function transformParsedToLiLoProject(parsed: any, minutes: number, animal: AnimalFriend, prompt: string): Project {
  const scenes: Scene[] = (parsed.scenes || []).map((s: any, idx: number) => ({
    id: `scene_${idx + 1}`,
    sceneNumber: s.sceneNumber || idx + 1,
    act: s.act || 'Act 1: Morning Exploration',
    title: s.title || `Scene ${idx + 1}`,
    visualPrompt: s.visualPrompt || 'LiLo and Mozz exploring the green forest',
    backgroundUrl: idx % 2 === 0 ? 'forest-cottage' : 'enchanted-forest',
    cameraAngle: s.cameraAngle || 'medium-shot',
    transition: s.transition || 'fade',
    duration: s.duration || 8.5,
    characters: ['char_lilo', 'char_mozz'],
    dialogues: (s.dialogues || []).map((d: any, dIdx: number) => ({
      id: `dlg_${idx}_${dIdx}`,
      characterId: d.characterName?.toLowerCase().includes('mozz') ? 'char_mozz' : 'char_lilo',
      text: d.text,
      emotion: d.emotion || 'happy',
      startTime: d.startTime || (dIdx * 3.8),
      duration: d.duration || 3.5,
    })),
    sfx: s.sfx || 'nature-birds',
    sfxTime: 1.0,
    particleEffect: s.particleEffect || 'leaves',
    forestLessonNote: s.forestLessonNote,
  }));

  return {
    id: `lilo_ep_${Date.now()}`,
    title: parsed.title || `LiLo & Mozz: The Adventure of ${animal.name}`,
    synopsis: parsed.synopsis || prompt,
    targetDurationMinutes: minutes,
    forestTip: parsed.forestTip || `Forest Tip: ${animal.lesson}`,
    animalFriend: animal,
    artStyle: 'pixar-3d',
    aspectRatio: '16:9',
    fps: 30,
    bgm: 'lilo-forest-morning',
    bgmVolume: 0.35,
    characters: [LILO_CHARACTER, MOZZ_CHARACTER],
    scenes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
