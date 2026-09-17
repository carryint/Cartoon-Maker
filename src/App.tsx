import { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import MainDashboard from './components/dashboard/MainDashboard';
import FirstRunWizard from './components/dashboard/FirstRunWizard';
import OneClickModal from './components/dashboard/OneClickModal';
import CharacterStudio from './components/characters/CharacterStudio';
import LocationStudio from './components/locations/LocationStudio';
import PropStudio from './components/props/PropStudio';
import ScriptStudio from './components/script/ScriptStudio';
import StoryboardStudio from './components/storyboard/StoryboardStudio';
import AIDirectorStudio from './components/director/AIDirectorStudio';
import MultiTrackTimeline from './components/timeline/MultiTrackTimeline';
import VideoPlayerStudio from './components/render/VideoPlayerStudio';
import QualityControlView from './components/qc/QualityControlModal';
import ProviderSettingsModal from './components/providers/ProviderSettingsModal';

import { Project, CharacterDNA, LocationDNA, PropDNA, Scene } from './types/lilo';
import { DEMO_PROJECT } from './data/demoProject';
import { loadActiveProject, saveActiveProject } from './core/engines/storageEngine';
import { parseScriptToScenes } from './core/engines/scriptEngine';
import { runQualityControlChecks } from './core/engines/qualityEngine';

export default function App() {
  const [project, setProject] = useState<Project>(() => {
    const saved = loadActiveProject();
    if (saved && saved.characters && saved.characters.length > 0) {
      return saved;
    }
    // Initialize demo episode by default
    const initial = { ...DEMO_PROJECT };
    const scenes = parseScriptToScenes(initial.rawScript, initial.characters, initial.locations);
    initial.scenes = scenes;
    initial.storyboard = scenes.map((s) => ({
      sceneId: s.id,
      sceneNumber: s.sceneNumber,
      title: s.title,
      description: s.description,
      characterNames: s.characterIds.map((cId) => initial.characters.find((c) => c.id === cId)?.name || 'Character'),
      locationName: initial.locations.find((l) => l.id === s.locationId)?.name || 'Location',
      dialogueCount: s.dialogues.length,
      duration: s.duration,
      camera: s.camera.shot,
      isApproved: true,
    }));
    initial.qualityReport = runQualityControlChecks(initial);
    return initial;
  });

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isProMode, setIsProMode] = useState<boolean>(false);
  const [showOneClick, setShowOneClick] = useState<boolean>(false);
  const [showProviders, setShowProviders] = useState<boolean>(false);
  const [showFirstRun, setShowFirstRun] = useState<boolean>(() => {
    return !localStorage.getItem('lilo_first_run_seen_v1');
  });

  // Save changes to storage
  useEffect(() => {
    saveActiveProject(project);
  }, [project]);

  const updateProject = (updates: Partial<Project>) => {
    setProject((prev) => {
      const updated = { ...prev, ...updates };
      updated.qualityReport = runQualityControlChecks(updated);
      return updated;
    });
  };

  const handleUpdateCharacters = (chars: CharacterDNA[]) => {
    updateProject({ characters: chars });
  };

  const handleUpdateLocations = (locs: LocationDNA[]) => {
    updateProject({ locations: locs });
  };

  const handleUpdateProps = (props: PropDNA[]) => {
    updateProject({ props });
  };

  const handleUpdateScenes = (scenes: Scene[]) => {
    updateProject({ scenes });
  };

  const handleLoadDemo = () => {
    const demo = { ...DEMO_PROJECT };
    const scenes = parseScriptToScenes(demo.rawScript, demo.characters, demo.locations);
    demo.scenes = scenes;
    demo.storyboard = scenes.map((s) => ({
      sceneId: s.id,
      sceneNumber: s.sceneNumber,
      title: s.title,
      description: s.description,
      characterNames: s.characterIds.map((cId) => demo.characters.find((c) => c.id === cId)?.name || 'Character'),
      locationName: demo.locations.find((l) => l.id === s.locationId)?.name || 'Location',
      dialogueCount: s.dialogues.length,
      duration: s.duration,
      camera: s.camera.shot,
      isApproved: true,
    }));
    demo.qualityReport = runQualityControlChecks(demo);
    setProject(demo);
    setCurrentTab('dashboard');
  };

  const handleResetProject = () => {
    if (window.confirm('Start fresh? This will clear all characters, scenes, and settings.')) {
      const emptyProject: Project = {
        id: `project_${Date.now()}`,
        seriesName: 'Original Cartoon Series',
        title: 'Episode 1',
        episodeNumber: 1,
        tagline: 'An original story for kids',
        description: 'Create your cartoon from scratch.',
        targetAudience: 'early-childhood-5-7',
        language: 'en-US',
        visualStyle: 'storybook-3d',
        aspectRatio: '16:9',
        resolution: '1080p',
        fps: 30,
        isChildSafeMode: true,
        rawScript: '',
        characters: [],
        locations: [],
        props: [],
        scenes: [],
        storyboard: [],
        activeProviderId: 'local-browser',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProject(emptyProject);
      setCurrentTab('characters');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Studio Header */}
      <Header
        project={project}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        isProMode={isProMode}
        onToggleProMode={() => setIsProMode(!isProMode)}
        onOpenOneClick={() => setShowOneClick(true)}
        onOpenProviders={() => setShowProviders(true)}
        onLoadDemo={handleLoadDemo}
        onResetProject={handleResetProject}
      />

      {/* Main Studio Body */}
      <div className="flex-1 flex">
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          characterCount={project.characters.length}
          locationCount={project.locations.length}
          sceneCount={project.scenes.length}
          qcScore={project.qualityReport?.overallScore}
        />

        {/* Tab Content Canvas */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
          {currentTab === 'dashboard' && (
            <MainDashboard
              project={project}
              onSelectTab={setCurrentTab}
              onOpenOneClick={() => setShowOneClick(true)}
              onLoadDemo={handleLoadDemo}
            />
          )}

          {currentTab === 'characters' && (
            <CharacterStudio
              characters={project.characters}
              onUpdateCharacters={handleUpdateCharacters}
            />
          )}

          {currentTab === 'locations' && (
            <LocationStudio
              locations={project.locations}
              onUpdateLocations={handleUpdateLocations}
            />
          )}

          {currentTab === 'props' && (
            <PropStudio
              propsList={project.props}
              onUpdateProps={handleUpdateProps}
            />
          )}

          {currentTab === 'script' && (
            <ScriptStudio
              project={project}
              onUpdateProject={updateProject}
              onProceedToStoryboard={() => setCurrentTab('storyboard')}
            />
          )}

          {currentTab === 'storyboard' && (
            <StoryboardStudio
              project={project}
              onUpdateScenes={handleUpdateScenes}
              onProceedToTimeline={() => setCurrentTab('timeline')}
              onProceedToRender={() => setCurrentTab('render')}
            />
          )}

          {currentTab === 'director' && (
            <AIDirectorStudio
              project={project}
              onProceedToStoryboard={() => setCurrentTab('storyboard')}
              onProceedToRender={() => setCurrentTab('render')}
            />
          )}

          {currentTab === 'timeline' && (
            <MultiTrackTimeline
              project={project}
              onProceedToRender={() => setCurrentTab('render')}
            />
          )}

          {currentTab === 'render' && (
            <VideoPlayerStudio
              project={project}
              onUpdateProject={updateProject}
            />
          )}

          {currentTab === 'qc' && (
            <QualityControlView
              project={project}
              onUpdateProject={updateProject}
            />
          )}

          {currentTab === 'providers' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">AI Provider Configuration</h2>
              <p className="text-slate-400 text-sm">Configure external AI models or use the built-in free local engine.</p>
              <button
                onClick={() => setShowProviders(true)}
                className="px-6 py-3 rounded-2xl font-bold text-slate-950 text-sm"
                style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}
              >
                Open Provider Registry Settings
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Modals & Wizards */}
      <FirstRunWizard
        isOpen={showFirstRun}
        onClose={() => {
          localStorage.setItem('lilo_first_run_seen_v1', 'true');
          setShowFirstRun(false);
        }}
        onStartOneClick={() => setShowOneClick(true)}
        onLoadDemo={handleLoadDemo}
      />

      <OneClickModal
        isOpen={showOneClick}
        onClose={() => setShowOneClick(false)}
        project={project}
        onSaveProject={(p) => setProject(p)}
        onProceedToRender={() => setCurrentTab('render')}
      />

      <ProviderSettingsModal
        isOpen={showProviders}
        onClose={() => setShowProviders(false)}
      />
    </div>
  );
}
