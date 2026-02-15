
import { Profession, GameClass, ResourceFamily } from './types';

type ProfessionTemplate = Omit<Profession, 'level' | 'xp' | 'maxXp' | 'traits'>;

let professionTemplates: ProfessionTemplate[] = [];
let classes: GameClass[] = [];
let initialized = false;

/**
 * Initializes the data by fetching from JSON files.
 */
export async function initGalaxyData(): Promise<void> {
  if (initialized) return;
  
  try {
    const [profRes, classRes] = await Promise.all([
      fetch('./professions.json'),
      fetch('./classes.json')
    ]);

    if (!profRes.ok || !classRes.ok) {
      throw new Error("Failed to load galaxy data files.");
    }

    professionTemplates = await profRes.json();
    classes = await classRes.json();
    initialized = true;
  } catch (error) {
    console.error("Initialization error in galaxyProfessions:", error);
  }
}

/**
 * Gets all profession templates.
 */
export function getProfessionTemplates(): ProfessionTemplate[] {
  return professionTemplates;
}

/**
 * Gets a profession template by its unique ID.
 */
export function getProfessionById(id: string): ProfessionTemplate | undefined {
  return professionTemplates.find(p => p.id === id);
}

/**
 * Gets profession templates belonging to a specific resource family.
 */
export function getProfessionsByFamily(family: ResourceFamily): ProfessionTemplate[] {
  return professionTemplates.filter(p => p.family === family);
}

/**
 * Gets profession templates belonging to a specific role.
 */
export function getProfessionsByRole(role: string): ProfessionTemplate[] {
  return professionTemplates.filter(p => p.role === role);
}

/**
 * Gets all available game classes.
 */
export function getClasses(): GameClass[] {
  return classes;
}

/**
 * Gets a specific class by its ID.
 */
export function getClassById(id: string): GameClass | undefined {
  return classes.find(c => c.id === id);
}
