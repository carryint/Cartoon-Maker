import { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, Square, Download, Maximize2, Loader2, Zap, Settings2 } from 'lucide-react';
import { Project, GenerationJob } from '../../types/studio';
import { renderVideo, prepareProject } from '../../services/aiVideoEngine';
import { SUPPORTED_LANGUAGES } from '../../data/defaults';

interface Props {
  project: Project;
  onProjectUpdate: (p: Project) => void;
}

function GenerationLog({ logs }: { logs: string[] }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);

  return (
    <div className="bg-slate-950 rounded-xl p-4 h-40 overflow-y-auto font-mono text-xs space-y-1">
      {logs.length === 0 && <div className="text-slate-600">AI generation log will appear here...</div>}
      {logs.map((log, i) => (
        <div key={i} className="text-emerald-400 leading-relaxed">{log}</div>
      ))}
      <div ref={endRef} />
    </div>
  );
}

const RESOLUTION_LABELS = {
  '4K': '3840 × 2160 (4K Ultra HD)',
  '1080p': '1920 × 1080 (Full HD)',
  '720p': '1280 × 720 (HD)',
};

export default function VideoDirector({ project, onProjectUpdate }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [job, setJob] = useState<GenerationJob>({
    id: 'job_0', status: 'idle', currentStep: '', progress: 0, logs: [],
  });
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [resolution, setResolution] = useState<'4K' | '1080p' | '720p'>(project.resolution || '4K');
  const [language, setLanguage] = useState(project.language || 'en-US');
  const [fps, setFps] = useState<24 | 30 | 60>(project.fps || 30);
  const [showSettings, setShowSettings] = useState(false);

  const addLog = useCallback((msg: string) => {
    setJob(prev => ({ ...prev, logs: [...prev.logs, msg] }));
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!canvasRef.current) return;
    if (project.characters.length === 0) { addLog('❌ Add at least one character first.'); return; }
    if (!project.rawScript.trim()) { addLog('❌ Write your script first.'); return; }

    setVideoUrl(null);
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    // Prepare project (parse scenes)
    setJob({ id: `job_${Date.now()}`, status: 'parsing', currentStep: 'Parsing script...', progress: 2, logs: [] });
    const prepared = prepareProject(
      { ...project, resolution, language, fps },
      (msg) => setJob(prev => ({ ...prev, logs: [...prev.logs, msg] }))
    );
    onProjectUpdate(prepared);

    if (prepared.scenes.length === 0) {
      setJob(prev => ({ ...prev, status: 'error', currentStep: 'No scenes found in script.', logs: [...prev.logs, '❌ Script parsing found 0 scenes. Check your formatting.'] }));
      return;
    }

    addLog(`🎬 Starting ${resolution} render at ${fps}fps — ${prepared.scenes.length} scenes...`);

    await renderVideo({
      canvas: canvasRef.current,
      project: prepared,
      resolution,
      fps,
      language,
      signal: abortRef.current.signal,
      onProgress: (partial) => setJob(prev => ({ ...prev, ...partial })),
      onDone: (url) => {
        setVideoUrl(url);
        addLog(`✅ Video ready! ${resolution} · ${prepared.scenes.length} scenes`);
        setJob(prev => ({ ...prev, status: 'done', progress: 100, currentStep: 'Video ready!' }));
      },
      onError: (msg) => {
        addLog(`❌ Error: ${msg}`);
        setJob(prev => ({ ...prev, status: 'error', currentStep: msg }));
      },
    });
  }, [project, resolution, language, fps, onProjectUpdate, addLog]);

  const handleStop = () => {
    abortRef.current?.abort();
    setJob(prev => ({ ...prev, status: 'idle', currentStep: 'Stopped.' }));
  };

  const handleDownload = () => {
    if (!videoUrl) return;
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `${project.title.replace(/\s+/g, '_')}_${resolution}.webm`;
    a.click();
  };

  const isRunning = job.status === 'parsing' || job.status === 'generating' || job.status === 'rendering';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">AI Video Generator</h2>
          <p className="text-slate-400 text-sm mt-1">Generate your animated 4K video from characters and script.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowSettings(!showSettings)}
            className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-500 transition-colors text-slate-300">
            <Settings2 size={18} />
          </button>
          {!isRunning ? (
            <button
              onClick={handleGenerate}
              disabled={project.characters.length === 0 || !project.rawScript.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-slate-900 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}
            >
              <Zap size={18} /> Generate {resolution} Video
            </button>
          ) : (
            <button onClick={handleStop}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-colors text-sm">
              <Square size={16} /> Stop
            </button>
          )}
          {videoUrl && (
            <button onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30 transition-colors text-sm">
              <Download size={16} /> Download
            </button>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Resolution</label>
            <select value={resolution} onChange={e => setResolution(e.target.value as typeof resolution)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400">
              {(['4K', '1080p', '720p'] as const).map(r => (
                <option key={r} value={r}>{RESOLUTION_LABELS[r]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Frame Rate</label>
            <select value={fps} onChange={e => setFps(Number(e.target.value) as typeof fps)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400">
              <option value={24}>24 fps (Film)</option>
              <option value={30}>30 fps (Standard)</option>
              <option value={60}>60 fps (Smooth)</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Episode Language</label>
            <select value={language} onChange={e => setLanguage(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400">
              {SUPPORTED_LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Canvas Preview */}
      <div className="relative bg-black rounded-2xl overflow-hidden border border-slate-700"
        style={{ aspectRatio: '16/9' }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain"
          style={{ display: videoUrl ? 'none' : 'block' }}
        />
        {videoUrl ? (
          <video src={videoUrl} controls className="w-full h-full" autoPlay />
        ) : (
          !isRunning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600">
              <div className="text-6xl mb-4">🎬</div>
              <div className="text-lg font-semibold">Preview will appear here</div>
              <div className="text-sm mt-1">Click "Generate Video" to start rendering</div>
            </div>
          )
        )}
        {isRunning && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-end justify-end p-4 gap-2">
            <div className="bg-black/70 backdrop-blur rounded-xl px-4 py-2 flex items-center gap-2 text-sm text-white">
              <Loader2 size={16} className="animate-spin text-amber-400" />
              {job.currentStep}
            </div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {isRunning && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>{job.currentStep}</span>
            <span>{Math.round(job.progress)}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: `${job.progress}%`,
                background: 'linear-gradient(90deg,#fbbf24,#f59e0b,#10b981)',
              }}
            />
          </div>
        </div>
      )}

      {/* Generation Log */}
      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">AI Generation Log</div>
        <GenerationLog logs={job.logs} />
      </div>

      {/* Scene summary */}
      {project.scenes.length > 0 && (
        <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Prepared Scenes</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">{project.scenes.length}</div>
              <div className="text-xs text-slate-500">Scenes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{project.scenes.reduce((s, sc) => s + sc.dialogues.length, 0)}</div>
              <div className="text-xs text-slate-500">Dialogues</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">{project.characters.length}</div>
              <div className="text-xs text-slate-500">Characters</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {Math.round(project.scenes.reduce((s, sc) => s + sc.duration, 0))}s
              </div>
              <div className="text-xs text-slate-500">Est. Duration</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
