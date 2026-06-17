import { TransportMode, DietType, WasteLevel } from '../data/emissionFactors';

/**
 * Details representing transport activity.
 * Tracks the mode of travel and distance in km.
 */
export interface TransportDetails {
  /** The mode of transport utilized (e.g. car-petrol, walking) */
  readonly mode: TransportMode;
  /** Distance traveled in kilometres */
  readonly distance: number;
}

/**
 * Details representing energy usage (electricity and LPG).
 * Tracks electricity consumption in kWh and cylinder refill counts.
 */
export interface EnergyDetails {
  /** Electricity consumed in kilowatt-hours (kWh) */
  readonly electricity: number;
  /** Number of LPG refill cylinders received today */
  readonly lpg: number;
}

/**
 * Details representing food diet type.
 * Tracks the daily dietary classification (e.g. vegan, vegetarian).
 */
export interface FoodDetails {
  /** The dietary choice for the day */
  readonly dietType: DietType;
}

/**
 * Details representing waste level and segregation.
 * Tracks the volume level of waste and whether segregation was practiced.
 */
export interface WasteDetails {
  /** The volume category of waste produced */
  readonly level: WasteLevel;
  /** True if waste was segregated/recycled, otherwise false */
  readonly segregated: boolean;
}

/**
 * Supported activity categories in Carbon Ledger.
 */
export type ActivityCategory = 'transport' | 'energy' | 'food' | 'waste';

/**
 * Activity log entry representation.
 * Stores calculated emissions and sub-details of a recorded daily entry.
 */
export interface Activity {
  /** Unique UUID generated for the entry */
  readonly id: string;
  /** ISO date string formatted as YYYY-MM-DD */
  readonly date: string;
  /** Category of environmental activity logged */
  readonly category: ActivityCategory;
  /** Detail properties corresponding to the activity category */
  readonly details: TransportDetails | EnergyDetails | FoodDetails | WasteDetails;
  /** Calculated carbon emissions in kg CO₂e */
  readonly emissions: number;
}

/**
 * Achievement badge representation.
 * Models the status and description of collectible field badges.
 */
export interface Achievement {
  /** Unique identifier corresponding to the specific badge */
  readonly id: string;
  /** Title of the achievement badge */
  readonly title: string;
  /** Description explaining how to unlock the badge */
  readonly description: string;
  /** ISO date timestamp of unlocking, or null if locked */
  readonly unlockedAt: string | null;
  /** Name of the icon representing this badge */
  readonly icon: string;
}

/**
 * Actionable recommendations to reduce footprint.
 * Suggests category-specific measures to save carbon.
 */
export interface Recommendation {
  /** Unique ID of the recommendation item */
  readonly id: string;
  /** High-level title summarizing the recommendation */
  readonly title: string;
  /** Activity category this recommendation targets */
  readonly category: ActivityCategory;
  /** Human-readable explanation of why this recommendation reduces emissions */
  readonly description: string;
  /** Estimated weekly carbon emissions saved (in kg CO₂e) */
  readonly savings: number;
  /** Specific actionable statement showing next steps */
  readonly actionableText: string;
}
