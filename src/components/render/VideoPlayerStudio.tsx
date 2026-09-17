import { useState, useRef } from 'react';
import {
  PlaySquare,
  Play,
  Pause,
  Download,
  Sparkles,
  FileText,
  Share2,
  CheckCircle2,
  Loader2,
  Tv,
  Smartphone,
  Square,
  Copy,
} from 'lucide-react';
import { Project, Resolution, AspectRatio } from '../../types/lilo';
import { renderProjectToVideo, generateSrtSubtitles, generateYouTubeMetadata } from '../../core/engines/renderEngine';

interface Props {
  project: Project;
  onUpdateProject: (updated: Partial<Project>) => void;
}

export default function VideoPlayerStudio({ project, onUpdateProject }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [resolution, setResolution] = useState<Resolution>(project.resolution || '1080p');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(project.aspectRatio || '16:9');
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState<any>(null);
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState('');

  const ytMeta = generateYouTubeMetadata(project);

  const handleStartRender = async () => {
    if (!canvasRef.current || project.scenes.length === 0) return;
    setIsRendering(true);
    setVideoBlobUrl(null);

    try {
      const url = await renderProjectToVideo(
        canvasRef.current,
        project,
        resolution,
        aspectRatio,
        (p) => setRenderProgress(p)
      );
      setVideoBlobUrl(url);
    } catch (err) {
      console.error('Render error:', err);
    } finally {
      setIsRendering(false);
    }
  };

  const handleDownloadVideo = () => {
    if (!videoBlobUrl) return;
    const a = document.createElement('a');
    a.href = videoBlobUrl;
    a.download = `${project.title.replace(/\s+/g, '_')}_${resolution}.webm`;
    a.click();
  };

  const handleDownloadSrt = () => {
    const srt = generateSrtSubtitles(project);
    const blob = new Blob([srt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, '_')}_subtitles.srt`;
    a.click();
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <PlaySquare size={26} className="text-amber-400" />
            <span>4K Render Engine & Social Studio</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Composites scene environments, animated 3D character puppets, synchronized voices, and music into a final
            video.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleStartRender}
            disabled={isRendering || project.scenes.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-slate-950 text-sm shadow-xl shadow-amber-400/25 transition-all hover:scale-105 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}
          >
            {isRendering ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            <span>{isRendering ? 'Rendering Episode...' : `Render ${resolution} Video`}</span>
          </button>

          {videoBlobUrl && (
            <button
              onClick={handleDownloadVideo}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow transition-all"
            >
              <Download size={14} />
              <span>Download Video</span>
            </button>
          )}
        </div>
      </div>

      {/* Render Options Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-4">
        {/* Aspect Ratio */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase">Format:</span>
          <div className="flex gap-1.5 bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setAspectRatio('16:9')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                aspectRatio === '16:9' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tv size={14} />
              <span>16:9 YouTube</span>
            </button>
            <button
              onClick={() => setAspectRatio('9:16')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                aspectRatio === '9:16' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone size={14} />
              <span>9:16 Shorts / Reels</span>
            </button>
            <button
              onClick={() => setAspectRatio('1:1')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                aspectRatio === '1:1' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Square size={14} />
              <span>1:1 Square</span>
            </button>
          </div>
        </div>

        {/* Resolution */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase">Quality:</span>
          <div className="flex gap-1.5 bg-slate-800 p-1 rounded-xl">
            {(['720p', '1080p', '4K'] as Resolution[]).map((res) => (
              <button
                key={res}
                onClick={() => setResolution(res)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  resolution === res ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                {res}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas Player Stage */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden relative shadow-2xl flex items-center justify-center min-h-[420px]">
        <canvas
          ref={canvasRef}
          className="max-h-[540px] max-w-full object-contain"
          style={{ display: videoBlobUrl ? 'none' : 'block' }}
        />

        {videoBlobUrl ? (
          <video src={videoBlobUrl} controls autoPlay className="max-h-[540px] max-w-full rounded-2xl" />
        ) : (
          !isRendering && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 space-y-3 p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-3xl">
                🎬
              </div>
              <h4 className="text-lg font-bold text-slate-300">Ready to Render Video</h4>
              <p className="text-xs text-slate-500 max-w-md">
                Click "Render {resolution} Video" above. LiLo will render scene-by-scene with animated character rigs,
                speech synthesis, and background music.
              </p>
            </div>
          )
        )}

        {/* Render Progress Overlay */}
        {isRendering && renderProgress && (
          <div className="absolute inset-x-4 bottom-4 p-4 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
              <span>{renderProgress.stepDescription}</span>
              <span className="text-amber-400">{renderProgress.percent}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${renderProgress.percent}%`,
                  background: 'linear-gradient(90deg,#fbbf24,#f59e0b,#10b981)',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Subtitles & YouTube Social Package */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subtitles (SRT / VTT) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={20} className="text-emerald-400" />
              <h3 className="text-base font-bold text-white">Subtitles & Captions</h3>
            </div>
            <button
              onClick={handleDownloadSrt}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5"
            >
              <Download size={13} />
              <span>Export .SRT</span>
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Automatically synchronized subtitle timestamps generated from voice synthesis durations.
          </p>
        </div>

        {/* YouTube Social Metadata Package */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Share2 size={20} className="text-pink-400" />
              <h3 className="text-base font-bold text-white">YouTube & Social Package</h3>
            </div>
            <button
              onClick={() => handleCopyText(ytMeta.description, 'yt_desc')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-pink-300 border border-pink-500/30 flex items-center gap-1.5"
            >
              <Copy size={13} />
              <span>{copiedKey === 'yt_desc' ? 'Copied!' : 'Copy Description'}</span>
            </button>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl text-xs font-mono text-slate-300 space-y-1">
            <div className="text-amber-400 font-bold truncate">{ytMeta.title}</div>
            <div className="text-slate-500 text-[11px] truncate">Chapters: {project.scenes.length} scenes mapped</div>
          </div>
        </div>
      </div>
    </div>
  );
}
