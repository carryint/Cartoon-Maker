import { Project, AISettings } from '../types/cartoon';
import { LILO_DEFAULT_PROJECT } from '../data/liloMozzDefaults';

const ACTIVE_PROJECT_KEY = 'cartoon_maker_lilo_active_project_v2';
const SAVED_PROJECTS_KEY = 'cartoon_maker_lilo_saved_projects_v2';
const SETTINGS_KEY = 'cartoon_maker_ai_settings';

export interface SavedProjectMeta {
  id: string;
  title: string;
  synopsis: string;
  sceneCount: number;
  characterCount: number;
  updatedAt: string;
  artStyle: string;
}

export const storageService = {
  /**
   * Get active working project from localStorage
   */
  getActiveProject(): Project {
    try {
      const saved = localStorage.getItem(ACTIVE_PROJECT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.characters && parsed.scenes && (parsed.id?.includes('lilo') || parsed.title?.includes('LiLo') || parsed.characters.some((c: any) => c.name === 'LiLo'))) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading active project from localStorage:', e);
    }
    return LILO_DEFAULT_PROJECT;
  },

  /**
   * Save active working project to localStorage
   */
  saveActiveProject(project: Project): void {
    try {
      localStorage.setItem(ACTIVE_PROJECT_KEY, JSON.stringify(project));
      this.upsertSavedProjectMeta(project);
    } catch (e) {
      console.warn('Error saving active project to localStorage:', e);
    }
  },

  /**
   * Get list of all saved projects from localStorage
   */
  getSavedProjects(): SavedProjectMeta[] {
    try {
      const listStr = localStorage.getItem(SAVED_PROJECTS_KEY);
      if (listStr) {
        return JSON.parse(listStr);
      }
    } catch (e) {
      console.warn('Error reading saved projects list:', e);
    }
    return [
      {
        id: LILO_DEFAULT_PROJECT.id,
        title: LILO_DEFAULT_PROJECT.title,
        synopsis: LILO_DEFAULT_PROJECT.synopsis,
        sceneCount: LILO_DEFAULT_PROJECT.scenes.length,
        characterCount: LILO_DEFAULT_PROJECT.characters.length,
        updatedAt: LILO_DEFAULT_PROJECT.updatedAt,
        artStyle: LILO_DEFAULT_PROJECT.artStyle,
      }
    ];
  },

  /**
   * Upsert project metadata into saved list
   */
  upsertSavedProjectMeta(project: Project): void {
    try {
      const list = this.getSavedProjects();
      const meta: SavedProjectMeta = {
        id: project.id,
        title: project.title,
        synopsis: project.synopsis,
        sceneCount: project.scenes.length,
        characterCount: project.characters.length,
        updatedAt: project.updatedAt || new Date().toISOString(),
        artStyle: project.artStyle,
      };

      const existingIdx = list.findIndex(p => p.id === project.id);
      if (existingIdx >= 0) {
        list[existingIdx] = meta;
      } else {
        list.unshift(meta);
      }

      localStorage.setItem(SAVED_PROJECTS_KEY, JSON.stringify(list));
      localStorage.setItem(`cartoon_project_${project.id}`, JSON.stringify(project));
    } catch (e) {
      console.warn('Error upserting saved project meta:', e);
    }
  },

  /**
   * Load a specific project by ID from localStorage
   */
  loadProjectById(id: string): Project | null {
    try {
      const data = localStorage.getItem(`cartoon_project_${id}`);
      if (data) {
        return JSON.parse(data);
      }
      if (id === LILO_DEFAULT_PROJECT.id) return LILO_DEFAULT_PROJECT;
    } catch (e) {
      console.warn('Error loading project by ID:', e);
    }
    return null;
  },

  /**
   * Delete a saved project from localStorage
   */
  deleteProjectById(id: string): void {
    try {
      const list = this.getSavedProjects().filter(p => p.id !== id);
      localStorage.setItem(SAVED_PROJECTS_KEY, JSON.stringify(list));
      localStorage.removeItem(`cartoon_project_${id}`);
    } catch (e) {
      console.warn('Error deleting project from localStorage:', e);
    }
  },

  /**
   * AI Settings storage
   */
  getAISettings(): AISettings {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return {
      provider: 'offline-smart',
      geminiApiKey: '',
      openaiApiKey: '',
      elevenLabsApiKey: '',
      imageQuality: 'hd',
      autoGenerateVoices: true,
      autoGenerateVisuals: true,
    };
  },

  saveAISettings(settings: AISettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Error saving AI settings:', e);
    }
  }
};
