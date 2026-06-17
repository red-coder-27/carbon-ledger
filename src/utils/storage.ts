import { Activity } from '../types';
import { activityListSchema, achievementsStateSchema } from './validation';
import { MAX_STORAGE_BYTES, STORAGE_VERSION, MAX_ENTRIES_PER_DATE } from '../constants';

const VERSION_KEY = 'carbon_ledger_version' as const;
const ACTIVITIES_KEY = 'carbon_ledger_activities' as const;
const ACHIEVEMENTS_KEY = 'carbon_ledger_achievements' as const;

/**
 * Calculates the total size of a string in bytes.
 * 
 * Uses TextEncoder to read the byte length of the UTF-8 serialized string.
 *
 * @param {string} str - The string to measure
 * @returns {number} The size of the string in bytes
 *
 * @example
 * getByteLength("hello")
 * // returns 5
 */
function getByteLength(str: string): number {
  return new TextEncoder().encode(str).length;
}

/**
 * Initializes and verifies storage version integrity.
 * 
 * If a database version mismatch is found, it clears old state to prevent
 * schema mismatch errors on load.
 *
 * @returns {void}
 */
function checkVersionIntegrity(): void {
  try {
    const currentVersion = localStorage.getItem(VERSION_KEY);
    if (currentVersion !== STORAGE_VERSION) {
      localStorage.removeItem(ACTIVITIES_KEY);
      localStorage.removeItem(ACHIEVEMENTS_KEY);
      localStorage.setItem(VERSION_KEY, STORAGE_VERSION);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[storage/checkVersionIntegrity]', message);
  }
}

/**
 * Safely fetches activities from localStorage, validating them via Zod.
 * 
 * Returns an empty array if data is missing, corrupted, or invalid.
 *
 * @returns {readonly Activity[]} List of validated activity entries
 *
 * @example
 * getSavedActivities()
 * // returns Activity[]
 */
export function getSavedActivities(): readonly Activity[] {
  checkVersionIntegrity();
  try {
    const raw = localStorage.getItem(ACTIVITIES_KEY);
    if (!raw) return [];
    
    const parsed: unknown = JSON.parse(raw);
    const result = activityListSchema.safeParse(parsed);
    
    if (result.success) {
      return result.data as readonly Activity[];
    } else {
      console.warn('[storage/getSavedActivities] Invalid activity log data found in localStorage. Resetting to empty.', result.error);
      return [];
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[storage/getSavedActivities]', message);
    return [];
  }
}

/**
 * Saves activities to localStorage after validating and enforcing quota and rate limits.
 * 
 * Throws an error before storage write if the rate limit of 50 entries per date is exceeded.
 *
 * @param {readonly Activity[]} activities - Array of activity entries to store
 * @returns {void}
 */
export function saveActivities(activities: readonly Activity[]): void {
  checkVersionIntegrity();

  // SECURITY: Rate limit check — maximum 50 entries per single calendar date
  const dateCounts: Record<string, number> = {};
  for (const act of activities) {
    dateCounts[act.date] = (dateCounts[act.date] || 0) + 1;
    if (dateCounts[act.date] > MAX_ENTRIES_PER_DATE) {
      throw new Error("Daily entry limit reached");
    }
  }

  try {
    const validated = activityListSchema.parse(activities);
    const serialized = JSON.stringify(validated);
    
    if (getByteLength(serialized) > MAX_STORAGE_BYTES) {
      throw new Error("Storage quota exceeded");
    }
    
    localStorage.setItem(ACTIVITIES_KEY, serialized);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[storage/saveActivities]', message);
  }
}

/**
 * Safely gets unlocked achievements state from localStorage.
 * 
 * Returns a mapping of achievementId to the unlock date string (or null if locked).
 *
 * @returns {Readonly<Record<string, string | null>>} The parsed achievements state map
 *
 * @example
 * getSavedAchievements()
 * // returns { first_entry: "2026-06-18" }
 */
export function getSavedAchievements(): Readonly<Record<string, string | null>> {
  checkVersionIntegrity();
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);
    const result = achievementsStateSchema.safeParse(parsed);

    if (result.success) {
      return result.data;
    } else {
      console.warn('[storage/getSavedAchievements] Invalid achievements data found in localStorage. Resetting.', result.error);
      return {};
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[storage/getSavedAchievements]', message);
    return {};
  }
}

/**
 * Saves achievements state to localStorage.
 *
 * Checks storage quota limits before saving.
 *
 * @param {Readonly<Record<string, string | null>>} state - The achievements unlocked state map
 * @returns {void}
 */
export function saveAchievements(state: Readonly<Record<string, string | null>>): void {
  checkVersionIntegrity();
  try {
    const validated = achievementsStateSchema.parse(state);
    const serialized = JSON.stringify(validated);

    if (getByteLength(serialized) > MAX_STORAGE_BYTES) {
      throw new Error("Storage quota exceeded");
    }

    localStorage.setItem(ACHIEVEMENTS_KEY, serialized);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[storage/saveAchievements]', message);
  }
}

/**
 * Clears all Carbon Ledger data from localStorage.
 *
 * @returns {void}
 */
export function clearAllData(): void {
  try {
    localStorage.removeItem(ACTIVITIES_KEY);
    localStorage.removeItem(ACHIEVEMENTS_KEY);
    localStorage.removeItem(VERSION_KEY);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[storage/clearAllData]', message);
  }
}
