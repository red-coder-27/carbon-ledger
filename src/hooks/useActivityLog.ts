import { useState, useMemo } from 'react';
import { Activity } from '../types';
import { getSavedActivities, saveActivities, getSavedAchievements, saveAchievements } from '../utils/storage';
import { checkAchievements } from '../utils/achievements';

/**
 * Return type definition for the useActivityLog hook.
 */
export interface UseActivityLogReturn {
  /** Readonly list of user logged activities */
  readonly activities: readonly Activity[];
  /** Readonly state map of user collectible achievements */
  readonly achievements: Readonly<Record<string, string | null>>;
  /** Callback function to record a new entry in the ledger */
  readonly handleAddActivity: (newActivity: Activity) => void;
  /** Callback function to delete an entry from the ledger by its ID */
  readonly handleDeleteActivity: (id: string) => void;
  /** Pre-calculated count of unlocked achievements */
  readonly unlockedCount: number;
}

/**
 * Custom hook managing activities ledger and achievement badges lifecycle.
 * 
 * Handles reading/writing from safe local storage, validating, re-calculating streak/milestone
 * achievements on adding or deleting logs.
 *
 * @returns {UseActivityLogReturn} Object containing activities state, achievements state, and mutators
 */
export function useActivityLog(): UseActivityLogReturn {
  const [activities, setActivities] = useState<readonly Activity[]>((): readonly Activity[] => getSavedActivities());
  const [achievements, setAchievements] = useState<Readonly<Record<string, string | null>>>(
    (): Readonly<Record<string, string | null>> => getSavedAchievements()
  );

  const handleAddActivity = (newActivity: Activity): void => {
    setActivities((prev: readonly Activity[]): readonly Activity[] => {
      const updated = [...prev, newActivity];
      saveActivities(updated);

      setAchievements((currentAchievements: Readonly<Record<string, string | null>>): Readonly<Record<string, string | null>> => {
        const nextAchievements = checkAchievements(updated, currentAchievements);
        saveAchievements(nextAchievements);
        return nextAchievements;
      });

      return updated;
    });
  };

  const handleDeleteActivity = (id: string): void => {
    setActivities((prev: readonly Activity[]): readonly Activity[] => {
      const updated = prev.filter((act: Activity): boolean => act.id !== id);
      saveActivities(updated);

      setAchievements((): Readonly<Record<string, string | null>> => {
        const freshAchievements = checkAchievements(updated, {});
        saveAchievements(freshAchievements);
        return freshAchievements;
      });

      return updated;
    });
  };

  const unlockedCount = useMemo((): number => {
    return Object.values(achievements).filter(Boolean).length;
  }, [achievements]);

  return {
    activities,
    achievements,
    handleAddActivity,
    handleDeleteActivity,
    unlockedCount
  };
}
