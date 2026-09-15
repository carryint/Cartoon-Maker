import React, { useState, useEffect, useRef } from 'react';
import { Project, AISettings, AspectRatio } from './types/cartoon';
import { STARTER_TEMPLATES } from './data/templates';
import { storageService } from './services/storageService';
import { Header } from './components/Header';
import { ScriptWizard } from './components/script-wizard/ScriptWizard';
import { CharacterStudio } from './components/character-studio/CharacterStudio';
import { StoryboardDirector } from './components/storyboard/StoryboardDirector';
import { MultiTrackTimeline } from './components/timeline/MultiTrackTimeline';
import { VideoPlayerCanvas, VideoPlayerRef } from './components/player/VideoPlayerCanvas';
import { ExportModal } from './components/exporter/ExportModal';
import { AISettingsModal } from './components/settings/AISettingsModal';

export const App: React.FC = () => {
  // Global Project State synced with LocalStorage
  const [project, setProject] = useState<Project>(() => {
    return storageService.getActiveProject();
  });

  // AI Settings State synced with LocalStorage
  const [aiSettings, setAiSettings] = useState<AISettings>(() => {
    return storageService.getAISettings();
  });

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'script' | 'characters' | 'storyboard' | 'timeline' | 'preview'>('storyboard');

  // Playback & Timeline State
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(project.aspectRatio || '16:9');

  // Modal States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Video Player Ref
  const playerRef = useRef<VideoPlayerRef>(null);

  // Save project to localStorage on any modification
  useEffect(() => {
    storageService.saveActiveProject(project);
  }, [project]);

  // Save settings to localStorage on any modification
  useEffect(() => {
    storageService.saveAISettings(aiSettings);
  }, [aiSettings]);

  const handleUpdateProject = (updater: (prev: Project) => Project) => {
    setProject(prev => {
      const updated = updater(prev);
      return { ...updated, updatedAt: new Date().toISOString() };
    });
  };

  const handleNewProject = () => {
    if (confirm('Create a new blank cartoon project? Make sure to save or export your current cartoon if needed.')) {
      const newP: Project = {
        ...STARTER_TEMPLATES[0],
        id: 'proj_' + Math.random().toString(36).substring(2, 9),
        title: 'My New AI Cartoon',
        synopsis: 'A brand new animated cartoon story',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProject(newP);
      setCurrentTime(0);
      setIsPlaying(false);
      setActiveTab('script');
    }
  };

  const handlePreviewScene = (sceneIndex: number) => {
    let targetTime = 0;
    for (let i = 0; i < sceneIndex; i++) {
      targetTime += project.scenes[i].duration;
    }
    setCurrentTime(targetTime);
    setIsPlaying(true);
    setActiveTab('preview');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      {/* Top Header with LocalStorage status */}
      <Header
        project={project}
        onUpdateProject={handleUpdateProject}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onNewProject={handleNewProject}
      />

      {/* Main Studio Viewport */}
      <main className="flex-1 pb-16">
        {activeTab === 'script' && (
          <ScriptWizard
            project={project}
            onUpdateProject={handleUpdateProject}
            aiSettings={aiSettings}
            onNavigateToStoryboard={() => setActiveTab('storyboard')}
          />
        )}

        {activeTab === 'characters' && (
          <CharacterStudio
            project={project}
            onUpdateProject={handleUpdateProject}
          />
        )}

        {activeTab === 'storyboard' && (
          <StoryboardDirector
            project={project}
            onUpdateProject={handleUpdateProject}
            onPreviewScene={handlePreviewScene}
          />
        )}

        {activeTab === 'timeline' && (
          <div className="max-w-7xl mx-auto p-6 flex flex-col gap-6">
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

        {activeTab === 'preview' && (
          <div className="max-w-7xl mx-auto p-6 flex flex-col gap-6">
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
      </main>

      {/* Export / Render Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        project={project}
        onImportProject={(imported) => setProject(imported)}
        getCanvas={() => playerRef.current?.getCanvas() || null}
        onSeek={(time) => setCurrentTime(time)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* AI Settings Modal */}
      <AISettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={aiSettings}
        onUpdateSettings={setAiSettings}
      />
    </div>
  );
};

export default App;
