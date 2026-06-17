import { TransportMode, DietType, WasteLevel } from '../data/emissionFactors';

/**
 * Details representing transport activity.
 */
export interface TransportDetails {
  readonly mode: TransportMode;
  readonly distance: number;
}

/**
 * Details representing energy usage (electricity and LPG).
 */
export interface EnergyDetails {
  readonly electricity: number; // in kWh
  readonly lpg: number; // refills count
}

/**
 * Details representing food diet type.
 */
export interface FoodDetails {
  readonly dietType: DietType;
}

/**
 * Details representing waste level and segregation.
 */
export interface WasteDetails {
  readonly level: WasteLevel;
  readonly segregated: boolean;
}

/**
 * Supported activity categories.
 */
export type ActivityCategory = 'transport' | 'energy' | 'food' | 'waste';

/**
 * Activity log entry.
 */
export interface Activity {
  readonly id: string;
  readonly date: string; // YYYY-MM-DD
  readonly category: ActivityCategory;
  readonly details: TransportDetails | EnergyDetails | FoodDetails | WasteDetails;
  readonly emissions: number; // calculated kg CO2e
}

/**
 * Achievement badge representation.
 */
export interface Achievement {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly unlockedAt: string | null; // ISO date string or null if locked
  readonly icon: string;
}

/**
 * Actionable recommendations to reduce footprint.
 */
export interface Recommendation {
  readonly id: string;
  readonly title: string;
  readonly category: ActivityCategory;
  readonly description: string;
  readonly savings: number; // estimated weekly kg CO2e saved
  readonly actionableText: string;
}
