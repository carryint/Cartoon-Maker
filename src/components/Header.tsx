import React, { useState, useEffect } from 'react';
import { Play, Download, Sparkles, FolderOpen, Plus, Settings, Film, Users, BookOpen, Clock, HardDrive, Check, Trash2 } from 'lucide-react';
import { Project } from '../types/cartoon';
import { STARTER_TEMPLATES } from '../data/templates';
import { storageService, SavedProjectMeta } from '../services/storageService';

interface HeaderProps {
  project: Project;
  onUpdateProject: (updater: (prev: Project) => Project) => void;
  activeTab: 'script' | 'characters' | 'storyboard' | 'timeline' | 'preview';
  setActiveTab: (tab: 'script' | 'characters' | 'storyboard' | 'timeline' | 'preview') => void;
  onOpenSettings: () => void;
  onOpenExport: () => void;
  onNewProject: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  onUpdateProject,
  activeTab,
  setActiveTab,
  onOpenSettings,
  onOpenExport,
  onNewProject,
}) => {
  const [savedProjects, setSavedProjects] = useState<SavedProjectMeta[]>([]);
  const [showProjectsMenu, setShowProjectsMenu] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>('Saved');

  // Refresh saved projects list
  const refreshList = () => {
    setSavedProjects(storageService.getSavedProjects());
  };

  useEffect(() => {
    refreshList();
  }, [project.id]);

  // Flash saved indicator on changes
  useEffect(() => {
    setSaveStatus('Saving...');
    const t = setTimeout(() => {
      setSaveStatus('Saved in LocalStorage');
    }, 400);
    return () => clearTimeout(t);
  }, [project]);

  const handleLoadSavedProject = (id: string) => {
    const loaded = storageService.loadProjectById(id);
    if (loaded) {
      onUpdateProject(() => loaded);
      setShowProjectsMenu(false);
    }
  };

  const handleDeleteSavedProject = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    storageService.deleteProjectById(id);
    refreshList();
  };

  return (
    <header className="bg-slate-900/90 border-b border-purple-500/20 backdrop-blur-md sticky top-0 z-40 px-4 py-2.5 flex items-center justify-between gap-4 select-none">
      {/* Left: Brand Logo & Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 p-0.5 shadow-lg shadow-purple-500/30 flex items-center justify-center shrink-0">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={project.title}
              onChange={(e) => onUpdateProject(prev => ({ ...prev, title: e.target.value }))}
              className="font-bold text-white bg-transparent hover:bg-slate-800/60 focus:bg-slate-800 px-2 py-0.5 rounded outline-none border border-transparent focus:border-purple-500/50 text-base max-w-[200px] sm:max-w-xs transition"
              title="Click to rename project"
            />
            <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium uppercase tracking-wider">
              {project.artStyle}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 px-2 flex items-center gap-2">
            <span className="flex items-center gap-1 text-emerald-400 font-mono">
              <HardDrive className="w-3 h-3 text-emerald-400" />
              <span>{saveStatus}</span>
            </span>
            <span>•</span>
            <span>{project.scenes.length} Scenes</span>
          </div>
        </div>
      </div>

      {/* Middle: Studio Navigation Tabs */}
      <nav className="hidden lg:flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTab('script')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
            activeTab === 'script'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Script & Story AI</span>
        </button>

        <button
          onClick={() => setActiveTab('characters')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
            activeTab === 'characters'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Characters</span>
        </button>

        <button
          onClick={() => setActiveTab('storyboard')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
            activeTab === 'storyboard'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>Storyboard</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
            activeTab === 'timeline'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Multi-Track Timeline</span>
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
            activeTab === 'preview'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>Live Player</span>
        </button>
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* LocalStorage Projects dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              refreshList();
              setShowProjectsMenu(!showProjectsMenu);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800/80 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-700/60 transition"
            title="Manage LocalStorage projects"
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Projects</span>
          </button>

          {showProjectsMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 flex flex-col gap-1.5">
              <div className="flex items-center justify-between px-2 py-1 border-b border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  LocalStorage Vault
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">Auto-Sync On</span>
              </div>

              <div className="max-h-56 overflow-y-auto flex flex-col gap-1">
                {savedProjects.map((p) => {
                  const isCurrent = p.id === project.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleLoadSavedProject(p.id)}
                      className={`p-2 rounded-xl text-left transition flex items-center justify-between gap-2 cursor-pointer border ${
                        isCurrent
                          ? 'bg-purple-950/60 border-purple-500 text-white'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex flex-col gap-0.5 overflow-hidden">
                        <span className="font-bold text-xs truncate">{p.title}</span>
                        <span className="text-[10px] text-slate-400">
                          {p.sceneCount} scenes • {p.artStyle}
                        </span>
                      </div>

                      {savedProjects.length > 1 && (
                        <button
                          onClick={(e) => handleDeleteSavedProject(e, p.id)}
                          className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg shrink-0"
                          title="Delete from local storage"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-slate-800 pt-1.5 flex flex-col gap-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                  Presets
                </div>
                {STARTER_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => {
                      onUpdateProject(() => tmpl);
                      setShowProjectsMenu(false);
                    }}
                    className="w-full text-left px-2 py-1 text-xs rounded-lg hover:bg-purple-600/20 hover:text-purple-300 text-slate-400 transition"
                  >
                    Load preset: {tmpl.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* New Project */}
        <button
          onClick={onNewProject}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800/80 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-700/60 transition"
          title="Create fresh cartoon project"
        >
          <Plus className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">New</span>
        </button>

        {/* AI Settings */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg border border-transparent hover:border-slate-700 transition"
          title="AI Keys & Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Export / Render Video */}
        <button
          onClick={onOpenExport}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white rounded-lg shadow-lg shadow-purple-500/25 transition active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Video</span>
        </button>

        {/* GitHub link */}
        <a
          href="https://github.com/carryint/Cartoon-Maker"
          target="_blank"
          rel="noreferrer"
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          title="View on GitHub repository carryint/Cartoon-Maker"
        >
          <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
        </a>
      </div>
    </header>
  );
};
