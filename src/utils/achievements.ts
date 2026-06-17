import { Activity, TransportDetails, WasteDetails } from '../types';
import { NATIONAL_AVERAGE_WEEKLY_CO2 } from '../data/emissionFactors';

/**
 * Interface representing a badge achievement.
 */
export interface Badge {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
}

/**
 * List of all achievements in the platform.
 */
export const ACHIEVEMENTS_LIST: readonly Badge[] = [
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
] as const;

/**
 * Checks all activities and returns an updated achievements map (id -> unlockDate or null).
 * It preserves existing unlock dates so achievements aren't "re-earned" with newer dates.
 * @param {Activity[]} activities - The full user activity log
 * @param {Record<string, string | null>} currentState - The current unlocked state of achievements
 * @returns {Record<string, string | null>} The updated achievements state map
 * @example
 * checkAchievements([], {}) // returns {}
 */
export function checkAchievements(
  activities: Activity[],
  currentState: Record<string, string | null>
): Record<string, string | null> {
  const updatedState = { ...currentState };
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
  const uniqueDates = Array.from(new Set(activities.map(a => a.date))).sort();
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
  const greenCommuteCount = activities.filter(a => {
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
  const dates = activities.map(a => new Date(a.date).getTime());
  const latestTimestamp = Math.max(...dates);
  const oneWeekAgo = latestTimestamp - 7 * 24 * 60 * 60 * 1000;
  const recentActs = activities.filter(a => new Date(a.date).getTime() >= oneWeekAgo);
  
  const uniqueRecentDays = new Set(recentActs.map(a => a.date)).size;
  const recentTotal = recentActs.reduce((sum, act) => sum + act.emissions, 0);

  if (uniqueRecentDays >= 3 && recentTotal < NATIONAL_AVERAGE_WEEKLY_CO2) {
    unlock('below_average');
  }

  // 5. Waste Warrior: segregated waste 5 times
  const segregatedCount = activities.filter(a => {
    if (a.category !== 'waste') return false;
    const details = a.details as WasteDetails;
    return details && details.segregated === true;
  }).length;

  if (segregatedCount >= 5) {
    unlock('waste_warrior');
  }

  return updatedState;
}
