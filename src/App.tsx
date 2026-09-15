import React, { useState, useEffect } from 'react';
import { Project, AISettings } from './types/cartoon';
import { LILO_DEFAULT_PROJECT } from './data/liloMozzDefaults';
import { storageService } from './services/storageService';
import { Header } from './components/Header';
import { UnifiedStudio } from './components/studio/UnifiedStudio';
import { AISettingsModal } from './components/settings/AISettingsModal';
import { ExportModal } from './components/exporter/ExportModal';

export const App: React.FC = () => {
  // Global Project State synced with LocalStorage
  const [project, setProject] = useState<Project>(() => {
    return storageService.getActiveProject();
  });

  // AI Settings State synced with LocalStorage
  const [aiSettings, setAiSettings] = useState<AISettings>(() => {
    return storageService.getAISettings();
  });

  const [activeTab, setActiveTab] = useState<'script' | 'characters' | 'storyboard' | 'timeline' | 'preview'>('preview');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

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
    if (confirm('Create a new LiLo & Mozz cartoon episode? Make sure to save or export your current cartoon if needed.')) {
      const newP: Project = {
        ...LILO_DEFAULT_PROJECT,
        id: 'lilo_ep_' + Date.now(),
        title: 'LiLo & Mozz: New Forest Adventure',
        synopsis: 'LiLo and Mozz set off into the forest to help a new animal friend',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProject(newP);
    }
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

      {/* Unified Master Studio View */}
      <main className="flex-1 pb-16">
        <UnifiedStudio
          project={project}
          onUpdateProject={handleUpdateProject}
          aiSettings={aiSettings}
        />
      </main>

      {/* Export / Render Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        project={project}
        onImportProject={(imported) => setProject(imported)}
        getCanvas={() => document.querySelector('canvas')}
        onSeek={() => {}}
        onPlay={() => {}}
        onPause={() => {}}
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
