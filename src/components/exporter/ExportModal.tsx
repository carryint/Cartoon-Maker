import React, { useState } from 'react';
import { X, Download, FileCode, Film, CheckCircle2, RefreshCw, Copy, Terminal, Sparkles } from 'lucide-react';

import confetti from 'canvas-confetti';
import { Project } from '../../types/cartoon';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onImportProject: (imported: Project) => void;
  getCanvas: () => HTMLCanvasElement | null;
  onSeek: (time: number) => void;
  onPlay: () => void;
  onPause: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
  onImportProject,
  getCanvas,
  onSeek,
  onPlay,
  onPause,
}) => {
  const [activeTab, setActiveTab] = useState<'video' | 'subtitles' | 'project' | 'deploy'>('video');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [copiedCmd, setCopiedCmd] = useState(false);

  if (!isOpen) return null;

  const totalDuration = Math.max(1, project.scenes.reduce((acc, s) => acc + s.duration, 0));

  /**
   * Record Canvas to WebM / MP4 video using HTML5 Canvas Stream & MediaRecorder
   */
  const handleStartVideoExport = async () => {
    const canvas = getCanvas();
    if (!canvas) {
      alert('Video player canvas not ready. Please try again.');
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
        videoBitsPerSecond: 6000000,
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        setIsRecording(false);
        setRecordingProgress(100);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      };

      // Rewind and start playback
      onSeek(0);
      mediaRecorder.start();
      onPlay();

      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const progress = Math.min(99, Math.round((elapsed / totalDuration) * 100));
        setRecordingProgress(progress);

        if (elapsed >= totalDuration) {
          clearInterval(interval);
          onPause();
          mediaRecorder.stop();
        }
      }, 200);
    } catch (e) {
      console.error('Recording error:', e);
      setIsRecording(false);
      alert('Failed to record canvas. Your browser might restrict stream recording.');
    }
  };

  /**
   * Generate .SRT SubRip Subtitle file
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

        srtText += `${counter}\n`;
        srtText += `${formatSRTTime(start)} --> ${formatSRTTime(end)}\n`;
        srtText += `[${char?.name || 'Character'}]: ${dlg.text}\n\n`;
        counter++;
      });
      accumTime += scene.duration;
    });

    const blob = new Blob([srtText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.title.replace(/\s+/g, '_')}_subtitles.srt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Download Project JSON file
   */
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const link = document.createElement('a');
    link.href = dataStr;
    link.download = `${project.title.replace(/\s+/g, '_')}.cartoon.json`;
    link.click();
  };

  /**
   * Import Project JSON file
   */
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported.characters && imported.scenes) {
          onImportProject(imported);
          onClose();
        } else {
          alert('Invalid cartoon project file format.');
        }
      } catch {
        alert('Failed to parse project JSON.');
      }
    };
    reader.readAsText(file);
  };

  const gitPushCommand = `git remote add origin https://github.com/carryint/Cartoon-Maker.git
git branch -M main
git add .
git commit -m "feat: AI Cartoon Maker Platform"
git push -u origin main`;

  const copyGitCommands = () => {
    navigator.clipboard.writeText(gitPushCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-purple-500/30 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white">Export & Deploy Studio</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 px-6 pt-3 gap-2 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 text-xs font-bold transition ${
              activeTab === 'video'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Render Video (MP4/WebM)</span>
          </button>

          <button
            onClick={() => setActiveTab('subtitles')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 text-xs font-bold transition ${
              activeTab === 'subtitles'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Captions (.SRT)</span>
          </button>

          <button
            onClick={() => setActiveTab('project')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 text-xs font-bold transition ${
              activeTab === 'project'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Project File</span>
          </button>

          <button
            onClick={() => setActiveTab('deploy')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 text-xs font-bold transition ${
              activeTab === 'deploy'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>Deploy to GitHub</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'video' && (
            <div className="flex flex-col gap-5">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-sm">{project.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {project.scenes.length} Scenes • {totalDuration.toFixed(1)}s Runtime • {project.aspectRatio}
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
                  HD Quality
                </div>
              </div>

              {isRecording ? (
                <div className="flex flex-col items-center gap-4 py-6">
                  <div className="w-12 h-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
                  <div className="text-center">
                    <div className="font-bold text-white text-base">Rendering Cartoon Video...</div>
                    <div className="text-xs text-purple-300 font-mono mt-1">{recordingProgress}% Completed</div>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-pink-500 h-full transition-all duration-200"
                      style={{ width: `${recordingProgress}%` }}
                    />
                  </div>
                </div>
              ) : recordedVideoUrl ? (
                <div className="flex flex-col items-center gap-4 bg-purple-950/30 border border-purple-500/40 p-5 rounded-2xl">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  <div className="text-center">
                    <div className="font-bold text-white text-base">Video Rendered Successfully!</div>
                    <div className="text-xs text-slate-300 mt-1">Your cartoon video is ready for download.</div>
                  </div>

                  <div className="flex items-center gap-3 mt-2">
                    <a
                      href={recordedVideoUrl}
                      download={`${project.title.replace(/\s+/g, '_')}_cartoon.webm`}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/25 transition"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Video File</span>
                    </a>

                    <button
                      onClick={handleStartVideoExport}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl text-xs transition"
                    >
                      Re-render
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Render your animated cartoon project in high resolution. The rendering engine captures real-time character lip-sync animations, camera pans, particle layers, and background music directly into a shareable video format.
                  </p>

                  <button
                    onClick={handleStartVideoExport}
                    className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-purple-500/30 flex items-center justify-center gap-2 transition active:scale-98 text-sm"
                  >
                    <Film className="w-4 h-4" />
                    <span>Start Video Capture & Export</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'subtitles' && (
            <div className="flex flex-col gap-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Subtitle Preview (.SRT)</h4>
                <div className="max-h-48 overflow-y-auto font-mono text-[11px] text-purple-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                  {project.scenes.map((s, sIdx) => (
                    <div key={s.id} className="mb-2">
                      <span className="text-slate-500"># Scene {s.sceneNumber}: {s.title}</span>
                      {s.dialogues.map((d, dIdx) => (
                        <div key={d.id} className="text-slate-300">
                          {sIdx + 1}.{dIdx + 1}: {d.text}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleDownloadSRT}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 text-xs transition"
              >
                <Download className="w-4 h-4" />
                <span>Download .SRT Subtitle File</span>
              </button>
            </div>
          )}

          {activeTab === 'project' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col gap-3">
                <h4 className="font-bold text-white text-sm">Save Project File</h4>
                <p className="text-xs text-slate-400">
                  Save all character expression sheets, dialogue scripts, and scene timings to a <code>.json</code> file.
                </p>
                <button
                  onClick={handleExportJSON}
                  className="mt-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition border border-slate-700"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .JSON Project</span>
                </button>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col gap-3">
                <h4 className="font-bold text-white text-sm">Load Project File</h4>
                <p className="text-xs text-slate-400">
                  Open an existing cartoon project file from your computer.
                </p>
                <label className="mt-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white rounded-xl text-xs font-bold transition border border-purple-500/40 cursor-pointer">
                  <FileCode className="w-4 h-4" />
                  <span>Choose .JSON File</span>
                  <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'deploy' && (
            <div className="flex flex-col gap-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Terminal className="w-4 h-4 text-purple-400" />
                    <span>Push to GitHub Repository</span>
                  </div>
                  <button
                    onClick={copyGitCommands}
                    className="flex items-center gap-1 text-[11px] font-bold text-purple-400 hover:text-purple-300"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedCmd ? 'Copied!' : 'Copy Commands'}</span>
                  </button>
                </div>

                <pre className="font-mono text-xs text-slate-300 bg-slate-900 p-3 rounded-xl overflow-x-auto border border-slate-800 leading-relaxed select-all">
                  {gitPushCommand}
                </pre>
              </div>

              <div className="text-xs text-slate-400">
                <span>Target Repository: </span>
                <a
                  href="https://github.com/carryint/Cartoon-Maker"
                  target="_blank"
                  rel="noreferrer"
                  className="text-purple-400 hover:underline font-semibold"
                >
                  https://github.com/carryint/Cartoon-Maker.git
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
