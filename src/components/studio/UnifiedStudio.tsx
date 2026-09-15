import React, { useState, useRef } from 'react';
import { Play, Pause, RotateCcw, Download, Sparkles, Wand2, FileText, Film, Clock, Trees, Eye, Volume2, CheckCircle2, RefreshCw, Layers, Plus, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Project, Scene, DialogueLine, AISettings, AnimalFriend, AspectRatio } from '../../types/cartoon';
import { ANIMAL_FRIENDS } from '../../data/liloMozzDefaults';
import { generateLiLoMozzEpisode } from '../../services/liloMozzEngine';
import { parseUserScreenplay } from '../../services/aiPipeline';
import { VideoPlayerCanvas, VideoPlayerRef } from '../player/VideoPlayerCanvas';
import { MultiTrackTimeline } from '../timeline/MultiTrackTimeline';
import { CharacterStudio } from '../character-studio/CharacterStudio';
import { speechSynthesizer } from '../../services/speechSynthesizer';

interface UnifiedStudioProps {
  project: Project;
  onUpdateProject: (updater: (prev: Project) => Project) => void;
  aiSettings: AISettings;
}

const EPISODE_DURATIONS = [
  { minutes: 2, label: '2 Min', desc: 'Mini (~10 scenes)' },
  { minutes: 3, label: '3 Min', desc: 'Quick (~15 scenes)' },
  { minutes: 5, label: '5 Min', desc: 'Standard (~25 scenes)' },
  { minutes: 10, label: '10 Min', desc: 'Extended (~45 scenes)' },
  { minutes: 20, label: '20 Min', desc: 'Feature (~85 scenes)' },
];

export const UnifiedStudio: React.FC<UnifiedStudioProps> = ({
  project,
  onUpdateProject,
  aiSettings,
}) => {
  // Navigation tabs
  const [studioTab, setStudioTab] = useState<'create' | 'characters' | 'timeline'>('create');
  const [scriptMode, setScriptMode] = useState<'ai-prompt' | 'screenplay'>('ai-prompt');
  
  // Prompt & Generation state
  const [promptText, setPromptText] = useState(project.synopsis || '');
  const [selectedDuration, setSelectedDuration] = useState<number>(project.targetDurationMinutes || 3);
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalFriend>(project.animalFriend || ANIMAL_FRIENDS[0]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Video Player & Export state
  const playerRef = useRef<VideoPlayerRef>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(project.aspectRatio || '16:9');
  
  // Download Video state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);

  // Screenplay text draft
  const [screenplayDraft, setScreenplayDraft] = useState(() => {
    return project.scenes.map(s => {
      const charMap = new Map(project.characters.map(c => [c.id, c.name]));
      const dlgLines = s.dialogues.map(d => {
        const charName = charMap.get(d.characterId) || 'CHARACTER';
        return `${charName.toUpperCase()} (${d.emotion}): ${d.text}`;
      }).join('\n');
      return `[SCENE ${s.sceneNumber}: ${s.title.toUpperCase()}]\n${dlgLines}`;
    }).join('\n\n');
  });

  const totalDuration = Math.max(1, project.scenes.reduce((acc, s) => acc + s.duration, 0));

  /**
   * 1-Click Generate Episode Video
   */
  const handleGenerateEpisode = async () => {
    setIsGenerating(true);
    try {
      const newProject = await generateLiLoMozzEpisode({
        prompt: promptText || `LiLo and Mozz help ${selectedAnimal.name} in the forest`,
        durationMinutes: selectedDuration,
        selectedAnimal,
        selectedOutfitLiLo: project.characters.find(c => c.id === 'char_lilo')?.selectedOutfit,
        selectedOutfitMozz: project.characters.find(c => c.id === 'char_mozz')?.selectedOutfit,
        aiSettings,
      });

      onUpdateProject(() => newProject);
      setCurrentTime(0);
      setIsPlaying(true);

      // Update screenplay draft
      const charMap = new Map(newProject.characters.map(c => [c.id, c.name]));
      const draft = newProject.scenes.map(s => {
        const dlgLines = s.dialogues.map(d => {
          const charName = charMap.get(d.characterId) || 'CHARACTER';
          return `${charName.toUpperCase()} (${d.emotion}): ${d.text}`;
        }).join('\n');
        return `[SCENE ${s.sceneNumber}: ${s.title.toUpperCase()}]\n${dlgLines}`;
      }).join('\n\n');
      setScreenplayDraft(draft);
    } catch (e) {
      console.error('Generation error:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Parse Screenplay script directly into video
   */
  const handleParseScreenplay = () => {
    const updated = parseUserScreenplay(screenplayDraft, project.artStyle);
    onUpdateProject(prev => ({
      ...prev,
      scenes: updated.scenes,
      title: updated.title || prev.title,
    }));
    setCurrentTime(0);
    setIsPlaying(true);
  };

  /**
   * In-Browser High-Definition Video Downloader
   */
  const handleDownloadVideo = async () => {
    const canvas = playerRef.current?.getCanvas();
    if (!canvas) {
      alert('Video canvas is initializing. Please wait a moment.');
      return;
    }

    setIsRecording(true);
    setRecordingProgress(0);
    setRecordedVideoUrl(null);

    try {
      const stream = canvas.captureStream(30);
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : 'video/mp4';

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 8000000,
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        setIsRecording(false);
        setRecordingProgress(100);

        // Trigger automatic download
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_cartoon.webm`;
        a.click();

        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      };

      // Rewind and start playback
      setCurrentTime(0);
      mediaRecorder.start();
      setIsPlaying(true);

      const startTime = Date.now();
      const recInterval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const progress = Math.min(99, Math.round((elapsed / totalDuration) * 100));
        setRecordingProgress(progress);

        if (elapsed >= totalDuration) {
          clearInterval(recInterval);
          setIsPlaying(false);
          mediaRecorder.stop();
        }
      }, 200);
    } catch (e) {
      console.error('Recording error:', e);
      setIsRecording(false);
      alert('Failed to record video stream.');
    }
  };

  /**
   * Download Subtitles (.SRT)
   */
  const handleDownloadSRT = () => {
    let srtText = '';
    let counter = 1;
    let accumTime = 0;

    const formatSRTTime = (seconds: number) => {
      const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
      const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
      const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
      const ms = Math.floor((seconds % 1) * 1000).toString().padStart(3, '0');
      return `${hrs}:${mins}:${secs},${ms}`;
    };

    project.scenes.forEach(scene => {
      scene.dialogues.forEach(dlg => {
        const char = project.characters.find(c => c.id === dlg.characterId);
        const start = accumTime + dlg.startTime;
        const end = start + dlg.duration;
        srtText += `${counter}\n${formatSRTTime(start)} --> ${formatSRTTime(end)}\n[${char?.name || 'LiLo'}]: ${dlg.text}\n\n`;
        counter++;
      });
      accumTime += scene.duration;
    });

    const blob = new Blob([srtText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_subtitles.srt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 sm:p-6 flex flex-col gap-5">
      {/* Studio Navigation Bar */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-2 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStudioTab('create')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              studioTab === 'create'
                ? 'bg-gradient-to-r from-emerald-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Cartoon Video Studio</span>
          </button>

          <button
            onClick={() => setStudioTab('characters')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              studioTab === 'characters'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Character Boards & Vault</span>
          </button>

          <button
            onClick={() => setStudioTab('timeline')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              studioTab === 'timeline'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Multi-Track Timeline</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadVideo}
            disabled={isRecording}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/25 transition active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isRecording ? `Recording (${recordingProgress}%)` : 'Download Video'}</span>
          </button>
        </div>
      </div>

      {/* Mode: Character Studio */}
      {studioTab === 'characters' && (
        <CharacterStudio project={project} onUpdateProject={onUpdateProject} />
      )}

      {/* Mode: Timeline */}
      {studioTab === 'timeline' && (
        <div className="flex flex-col gap-6">
          <VideoPlayerCanvas
            ref={playerRef}
            project={project}
            currentTime={currentTime}
            isPlaying={isPlaying}
            onTimeUpdate={setCurrentTime}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onRestart={() => setCurrentTime(0)}
            aspectRatio={aspectRatio}
            onAspectRatioChange={setAspectRatio}
          />

          <MultiTrackTimeline
            project={project}
            currentTime={currentTime}
            isPlaying={isPlaying}
            onSeek={setCurrentTime}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onRestart={() => setCurrentTime(0)}
          />
        </div>
      )}

      {/* Mode: Main Unified Studio (Split Script + Live Theater) */}
      {studioTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT PANEL: Script, Screenplay & Scene Director (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4 bg-slate-900/85 border border-slate-800 rounded-3xl p-5 shadow-2xl">
            {/* Header & Toggle */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Trees className="w-4 h-4" />
                <span>LiLo & Mozz Script Director</span>
              </div>

              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setScriptMode('ai-prompt')}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    scriptMode === 'ai-prompt' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Story Prompt
                </button>
                <button
                  onClick={() => setScriptMode('screenplay')}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    scriptMode === 'screenplay' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Screenplay Text
                </button>
              </div>
            </div>

            {/* Input Box */}
            {scriptMode === 'ai-prompt' ? (
              <div className="flex flex-col gap-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                    Episode Premise & Forest Story:
                  </label>
                  <textarea
                    rows={4}
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder="e.g. LiLo and Mozz wake up and set off into the forest where they find a baby river turtle stuck between pebbles near the stream..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-2xl p-3 text-xs text-white placeholder:text-slate-500 outline-none resize-none leading-relaxed transition"
                  />
                </div>

                {/* Duration Pills */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Episode Duration:
                    </label>
                    <span className="text-xs font-bold text-emerald-400">{selectedDuration} Minutes</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {EPISODE_DURATIONS.map((dur) => (
                      <button
                        key={dur.minutes}
                        type="button"
                        onClick={() => setSelectedDuration(dur.minutes)}
                        className={`py-2 px-1 rounded-xl text-center border transition flex flex-col items-center gap-0.5 ${
                          selectedDuration === dur.minutes
                            ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200 font-bold ring-2 ring-emerald-500/40'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="text-xs font-bold">{dur.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Animal Friend Picker */}
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 block">
                    Featured Wildlife Friend:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {ANIMAL_FRIENDS.map((af) => (
                      <button
                        key={af.name}
                        type="button"
                        onClick={() => setSelectedAnimal(af)}
                        className={`p-2 rounded-xl text-left border transition flex items-center gap-2 ${
                          selectedAnimal.name === af.name
                            ? 'bg-purple-950/60 border-purple-500 text-white font-bold ring-2 ring-purple-500/30'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="text-lg">{af.icon}</span>
                        <span className="text-[11px] truncate font-medium">{af.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Big Generate Button */}
                <button
                  onClick={handleGenerateEpisode}
                  disabled={isGenerating}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-purple-600 to-pink-600 hover:from-emerald-500 hover:to-pink-500 text-white font-black rounded-2xl shadow-xl shadow-purple-500/30 flex items-center justify-center gap-2 transition active:scale-98 disabled:opacity-50 text-sm"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Generating {selectedDuration}-Min Cartoon Video...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      <span>🎬 Generate {selectedDuration}-Minute Cartoon Video</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Screenplay Mode */
              <div className="flex flex-col gap-3">
                <textarea
                  rows={14}
                  value={screenplayDraft}
                  onChange={(e) => setScreenplayDraft(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-2xl p-3 font-mono text-xs text-emerald-200 outline-none resize-none leading-relaxed"
                />

                <button
                  onClick={handleParseScreenplay}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-purple-600 hover:from-emerald-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs shadow-lg transition"
                >
                  Apply Screenplay & Render Video
                </button>
              </div>
            )}

            {/* Generated Storyboard Scenes List */}
            <div className="border-t border-slate-800 pt-3 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  Scenes List ({project.scenes.length} Scenes • {(totalDuration / 60).toFixed(1)} Min)
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">Live Sync</span>
              </div>

              <div className="max-h-60 overflow-y-auto flex flex-col gap-2">
                {project.scenes.map((s, idx) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      let target = 0;
                      for (let i = 0; i < idx; i++) target += project.scenes[i].duration;
                      setCurrentTime(target);
                      setIsPlaying(true);
                    }}
                    className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/60 cursor-pointer transition flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span className="w-6 h-6 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0">
                        {s.sceneNumber}
                      </span>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-white truncate">{s.title}</div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {s.dialogues.length} dialogues • {s.duration}s
                        </div>
                      </div>
                    </div>

                    <Play className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Live Moving Cartoon Theater & Video Downloader (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Live Canvas Video Player */}
            <VideoPlayerCanvas
              ref={playerRef}
              project={project}
              currentTime={currentTime}
              isPlaying={isPlaying}
              onTimeUpdate={setCurrentTime}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onRestart={() => setCurrentTime(0)}
              aspectRatio={aspectRatio}
              onAspectRatioChange={setAspectRatio}
            />

            {/* Video Download Card */}
            <div className="bg-slate-900/85 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Download className="w-5 h-5 text-emerald-400" />
                    <span>Download Cartoon Video</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Export high-definition animated cartoon video with voiceovers, nature sounds, and live effects.
                  </p>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  HD 1080p
                </div>
              </div>

              {isRecording ? (
                <div className="flex flex-col items-center gap-3 py-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div className="w-10 h-10 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
                  <div className="text-center">
                    <div className="font-bold text-white text-sm">Rendering Cartoon Video in Progress...</div>
                    <div className="text-xs text-emerald-300 font-mono mt-0.5">{recordingProgress}% Completed</div>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-200"
                      style={{ width: `${recordingProgress}%` }}
                    />
                  </div>
                </div>
              ) : recordedVideoUrl ? (
                <div className="flex items-center justify-between bg-emerald-950/40 border border-emerald-500/40 p-4 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white text-xs">Video Render Complete!</div>
                      <div className="text-[10px] text-slate-300">File is ready for download or sharing.</div>
                    </div>
                  </div>

                  <a
                    href={recordedVideoUrl}
                    download={`${project.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_cartoon.webm`}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg transition flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File</span>
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleDownloadVideo}
                    className="py-3.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 text-xs transition active:scale-98"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Video (MP4 / WebM)</span>
                  </button>

                  <button
                    onClick={handleDownloadSRT}
                    className="py-3.5 px-4 bg-slate-950 hover:bg-slate-800 text-slate-200 font-bold rounded-2xl border border-slate-800 flex items-center justify-center gap-2 text-xs transition"
                  >
                    <FileText className="w-4 h-4 text-purple-400" />
                    <span>Download Subtitles (.SRT)</span>
                  </button>
                </div>
              )}

              {/* LiLo's Forest Tip Card */}
              {project.forestTip && (
                <div className="bg-emerald-950/30 border border-emerald-500/30 p-3.5 rounded-2xl flex items-center gap-3">
                  <span className="text-2xl shrink-0">🌿</span>
                  <div className="text-xs">
                    <span className="font-bold text-emerald-300 block">Episode Forest Tip:</span>
                    <span className="text-slate-200">{project.forestTip}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
