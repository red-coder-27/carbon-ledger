import { Activity } from '../types';
import { activityListSchema, achievementsStateSchema } from './validation';

// SECURITY: Schema version check to prevent loading corrupted/outdated schemas
const STORAGE_VERSION = '1.0.0';
const VERSION_KEY = 'carbon_ledger_version';

const ACTIVITIES_KEY = 'carbon_ledger_activities';
const ACHIEVEMENTS_KEY = 'carbon_ledger_achievements';

// SECURITY: Size limit set to 4MB to prevent Denial of Service (DoS) by local storage exhaustion
const MAX_STORAGE_BYTES = 4 * 1024 * 1024;

/**
 * Calculates the total size of a string in bytes.
 * @param {string} str - The string to measure
 * @returns {number} The size in bytes
 */
function getByteLength(str: string): number {
  return new TextEncoder().encode(str).length;
}

/**
 * Initializes and verifies storage version integrity.
 * @returns {void}
 */
function checkVersionIntegrity(): void {
  try {
    const currentVersion = localStorage.getItem(VERSION_KEY);
    if (currentVersion !== STORAGE_VERSION) {
      // SECURITY: If version mismatch, clear storage to prevent loading incompatible schema shapes
      localStorage.removeItem(ACTIVITIES_KEY);
      localStorage.removeItem(ACHIEVEMENTS_KEY);
      localStorage.setItem(VERSION_KEY, STORAGE_VERSION);
    }
  } catch (error) {
    console.error('Failed version check', error);
  }
}

/**
 * Safely fetches activities from localStorage, validating them via Zod.
 * Returns an empty array if data is missing, corrupted, or invalid.
 * @returns {Activity[]} List of validated activity entries
 */
export function getSavedActivities(): Activity[] {
  checkVersionIntegrity();
  try {
    const raw = localStorage.getItem(ACTIVITIES_KEY);
    if (!raw) return [];
    
    // SECURITY: Parse and validate structure via Zod to strip unexpected fields and enforce type safety
    const parsed: unknown = JSON.parse(raw);
    const result = activityListSchema.safeParse(parsed);
    
    if (result.success) {
      return result.data as Activity[];
    } else {
      console.warn('Invalid activity log data found in localStorage. Resetting to empty.', result.error);
      return [];
    }
  } catch (error) {
    // SECURITY: JSON.parse error handler to prevent app crash on corrupted local storage state
    console.error('Failed to parse activities from localStorage. Resetting to empty.', error);
    return [];
  }
}

/**
 * Saves activities to localStorage.
 * @param {Activity[]} activities - Array of activity entries to store
 * @returns {void}
 * @throws {Error} Throws rate limit or quota exceeded errors
 */
export function saveActivities(activities: Activity[]): void {
  checkVersionIntegrity();

  // SECURITY: Rate limit check — maximum 50 entries per single calendar date
  const dateCounts: Record<string, number> = {};
  for (const act of activities) {
    dateCounts[act.date] = (dateCounts[act.date] || 0) + 1;
    if (dateCounts[act.date] > 50) {
      throw new Error("Daily entry limit reached");
    }
  }

  try {
    // SECURITY: Zod parse ensures only valid schema data is written
    const validated = activityListSchema.parse(activities);
    const serialized = JSON.stringify(validated);
    
    // SECURITY: Size check — prevent write if it exceeds the 4MB limit
    if (getByteLength(serialized) > MAX_STORAGE_BYTES) {
      throw new Error("Storage quota exceeded");
    }
    
    localStorage.setItem(ACTIVITIES_KEY, serialized);
  } catch (error) {
    console.error('Failed to save activities to localStorage.', error);
    throw error;
  }
}

/**
 * Safely gets unlocked achievements state from localStorage.
 * Mapping of achievementId -> unlock date string (or null if locked).
 * @returns {Record<string, string | null>} The parsed achievements state
 */
export function getSavedAchievements(): Record<string, string | null> {
  checkVersionIntegrity();
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);
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
 * @param {Record<string, string | null>} state - The achievements unlocked state map
 * @returns {void}
 */
export function saveAchievements(state: Record<string, string | null>): void {
  checkVersionIntegrity();
  try {
    const validated = achievementsStateSchema.parse(state);
    const serialized = JSON.stringify(validated);

    // SECURITY: Quota check
    if (getByteLength(serialized) > MAX_STORAGE_BYTES) {
      throw new Error("Storage quota exceeded");
    }

    localStorage.setItem(ACHIEVEMENTS_KEY, serialized);
  } catch (error) {
    console.error('Failed to save achievements to localStorage.', error);
  }
}

/**
 * Clears all Carbon Ledger data from localStorage.
 * @returns {void}
 */
export function clearAllData(): void {
  try {
    localStorage.removeItem(ACTIVITIES_KEY);
    localStorage.removeItem(ACHIEVEMENTS_KEY);
    localStorage.removeItem(VERSION_KEY);
  } catch (error) {
    console.error('Failed to clear localStorage data.', error);
  }
}
