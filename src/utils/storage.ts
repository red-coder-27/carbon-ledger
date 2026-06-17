import { Activity } from '../types';
import { activityListSchema, achievementsStateSchema } from './validation';

const ACTIVITIES_KEY = 'carbon_ledger_activities';
const ACHIEVEMENTS_KEY = 'carbon_ledger_achievements';

/**
 * Safely fetches activities from localStorage, validating them via Zod.
 * Returns an empty array if data is missing, corrupted, or invalid.
 */
export function getSavedActivities(): Activity[] {
  try {
    const raw = localStorage.getItem(ACTIVITIES_KEY);
    if (!raw) return [];
    
    const parsed = JSON.parse(raw);
    const result = activityListSchema.safeParse(parsed);
    
    if (result.success) {
      return result.data as Activity[];
    } else {
      console.warn('Invalid activity log data found in localStorage. Resetting to empty.', result.error);
      return [];
    }
  } catch (error) {
    console.error('Failed to parse activities from localStorage. Resetting to empty.', error);
    return [];
  }
}

/**
 * Saves activities to localStorage.
 */
export function saveActivities(activities: Activity[]): void {
  try {
    const validated = activityListSchema.parse(activities);
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(validated));
  } catch (error) {
    console.error('Failed to save activities to localStorage.', error);
  }
}

/**
 * Safely gets unlocked achievements state from localStorage.
 * Mapping of achievementId -> unlock date string (or null if locked).
 */
export function getSavedAchievements(): Record<string, string | null> {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    const result = achievementsStateSchema.safeParse(parsed);

    if (result.success) {
      return result.data;
    } else {
      console.warn('Invalid achievements data found in localStorage. Resetting.', result.error);
      return {};
    }
  } catch (error) {
    console.error('Failed to parse achievements from localStorage.', error);
    return {};
  }
}

/**
 * Saves achievements state to localStorage.
 */
export function saveAchievements(state: Record<string, string | null>): void {
  try {
    const validated = achievementsStateSchema.parse(state);
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(validated));
  } catch (error) {
    console.error('Failed to save achievements to localStorage.', error);
  }
}

/**
 * Clears all Carbon Ledger data from localStorage.
 */
export function clearAllData(): void {
  try {
    localStorage.removeItem(ACTIVITIES_KEY);
    localStorage.removeItem(ACHIEVEMENTS_KEY);
  } catch (error) {
    console.error('Failed to clear localStorage data.', error);
  }
}
