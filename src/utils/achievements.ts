import { Activity, TransportDetails, WasteDetails } from '../types';
import { NATIONAL_AVERAGE_WEEKLY_CO2 } from '../data/emissionFactors';

/**
 * Interface representing a badge achievement.
 */
export interface Badge {
  /** The unique string key for the achievement badge */
  readonly id: string;
  /** Title of the achievement badge (e.g. 'First Entry') */
  readonly title: string;
  /** Description explaining the user requirement to unlock this badge */
  readonly description: string;
  /** Name of the icon representing this badge */
  readonly icon: string;
}

/**
 * Immutable list of all possible achievements in the platform.
 */
export const ACHIEVEMENTS_LIST: readonly Badge[] = Object.freeze([
  {
    id: 'first_entry',
    title: 'First Entry',
    description: 'Logged your first activity in the field journal.',
    icon: 'BookOpen'
  },
  {
    id: 'week_streak',
    title: 'Week Streak',
    description: 'Logged activities on 7 consecutive days.',
    icon: 'Flame'
  },
  {
    id: 'green_commuter',
    title: 'Green Commuter',
    description: 'Logged 5 zero or low-emission transport entries (EV, bus, train, walk, bike).',
    icon: 'Compass'
  },
  {
    id: 'below_average',
    title: 'Below Average',
    description: 'Kept your weekly total footprint below the national average baseline.',
    icon: 'ChevronDown'
  },
  {
    id: 'waste_warrior',
    title: 'Waste Warrior',
    description: 'Segregated or recycled waste 5 times.',
    icon: 'Recycle'
  }
] as const);

/**
 * Audits all logged activities and returns an updated achievements map (id -> unlockDate or null).
 * 
 * Verifies rules for each badge:
 * 1. First Entry: unlocks upon logging any activity.
 * 2. Week Streak: checks for 7 consecutive calendar days of logging.
 * 3. Green Commuter: counts 5 zero/low-emission transport logs.
 * 4. Below Average: weekly emissions under India's average (minimum 3 active logging days).
 * 5. Waste Warrior: counts 5 segregated/recycled waste log entries.
 *
 * @param {readonly Activity[]} activities - The full user activity log array
 * @param {Readonly<Record<string, string | null>>} currentState - The current unlocked state map of achievements
 * @returns {Record<string, string | null>} The updated achievements state map with new unlocks (preserves existing unlock dates)
 *
 * @example
 * checkAchievements([], {})
 * // returns {}
 *
 * @example
 * checkAchievements([
 *   { id: '1', date: '2026-06-15', category: 'food', details: { dietType: 'vegan' }, emissions: 1.5 }
 * ], {})
 * // returns { 'first_entry': '2026-06-18' } (assuming today is 2026-06-18)
 */
export function checkAchievements(
  activities: readonly Activity[],
  currentState: Readonly<Record<string, string | null>>
): Record<string, string | null> {
  const updatedState: Record<string, string | null> = { ...currentState };
  const todayStr = new Date().toISOString().split('T')[0];

  if (activities.length === 0) {
    return updatedState;
  }

  // Helper to unlock a badge if not already unlocked
  const unlock = (id: string): void => {
    if (!updatedState[id]) {
      updatedState[id] = todayStr;
    }
  };

  // 1. First Entry
  unlock('first_entry');

  // 2. Week Streak: Logged on 7 consecutive days
  const uniqueDates = Array.from(new Set(activities.map((a: Activity): string => a.date))).sort();
  let maxStreak = 0;
  let currentStreak = 0;
  let prevTime: number | null = null;

  for (const dateStr of uniqueDates) {
    const time = new Date(dateStr).getTime();
    if (prevTime === null) {
      currentStreak = 1;
    } else {
      const diffDays = Math.round((time - prevTime) / (24 * 60 * 60 * 1000));
      if (diffDays === 1) {
        currentStreak += 1;
      } else if (diffDays > 1) {
        currentStreak = 1;
      }
    }
    maxStreak = Math.max(maxStreak, currentStreak);
    prevTime = time;
  }

  if (maxStreak >= 7) {
    unlock('week_streak');
  }

  // 3. Green Commuter: 5 zero/low-emission transport entries
  const greenModes = ['car-ev', 'bus', 'train-metro', 'bicycle', 'walking'];
  const greenCommuteCount = activities.filter((a: Activity): boolean => {
    if (a.category !== 'transport') return false;
    const details = a.details as TransportDetails;
    return details && greenModes.includes(details.mode);
  }).length;

  if (greenCommuteCount >= 5) {
    unlock('green_commuter');
  }

  // 4. Below Average: weekly total under the national average
  // To avoid triggering this on an empty/near-empty profile,
  // we require at least 3 active logging days in the last 7 calendar days of their activities.
  const dates = activities.map((a: Activity): number => new Date(a.date).getTime());
  const latestTimestamp = Math.max(...dates);
  const oneWeekAgo = latestTimestamp - 7 * 24 * 60 * 60 * 1000;
  const recentActs = activities.filter((a: Activity): boolean => new Date(a.date).getTime() >= oneWeekAgo);
  
  const uniqueRecentDays = new Set(recentActs.map((a: Activity): string => a.date)).size;
  const recentTotal = recentActs.reduce((sum: number, act: Activity): number => sum + act.emissions, 0);

  if (uniqueRecentDays >= 3 && recentTotal < NATIONAL_AVERAGE_WEEKLY_CO2) {
    unlock('below_average');
  }

  // 5. Waste Warrior: segregated waste 5 times
  const segregatedCount = activities.filter((a: Activity): boolean => {
    if (a.category !== 'waste') return false;
    const details = a.details as WasteDetails;
    return details && details.segregated === true;
  }).length;

  if (segregatedCount >= 5) {
    unlock('waste_warrior');
  }

  return updatedState;
}
