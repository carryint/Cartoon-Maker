import { Project } from '../../types/lilo';

// ============================================================
//  Storage Engine — Project Memory & Local Database
// ============================================================

const ACTIVE_PROJECT_KEY = 'lilo_master_project_v1';
const ALL_PROJECTS_KEY = 'lilo_all_projects_v1';

export function saveActiveProject(project: Project): void {
  try {
    const updated = { ...project, updatedAt: new Date().toISOString() };
    localStorage.setItem(ACTIVE_PROJECT_KEY, JSON.stringify(updated));

    // Also update project in list
    const all = loadAllProjects();
    const existingIdx = all.findIndex(p => p.id === project.id);
    if (existingIdx >= 0) {
      all[existingIdx] = updated;
    } else {
      all.push(updated);
    }
    localStorage.setItem(ALL_PROJECTS_KEY, JSON.stringify(all));
  } catch (err) {
    console.warn('Failed to save project:', err);
  }
}

export function loadActiveProject(): Project | null {
  try {
    const raw = localStorage.getItem(ACTIVE_PROJECT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function loadAllProjects(): Project[] {
  try {
    const raw = localStorage.getItem(ALL_PROJECTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function exportProjectToJson(project: Project): string {
  return JSON.stringify(project, null, 2);
}

export function importProjectFromJson(jsonStr: string): Project {
  const parsed = JSON.parse(jsonStr);
  if (!parsed.id || !parsed.title || !Array.isArray(parsed.characters)) {
    throw new Error('Invalid LiLo project file structure.');
  }
  return parsed;
}
