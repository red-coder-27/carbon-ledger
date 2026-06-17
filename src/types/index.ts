import { TransportMode, DietType, WasteLevel } from '../data/emissionFactors';

export interface TransportDetails {
  mode: TransportMode;
  distance: number;
}

export interface EnergyDetails {
  electricity: number; // in kWh
  lpg: number; // refills count
}

export interface FoodDetails {
  dietType: DietType;
}

export interface WasteDetails {
  level: WasteLevel;
  segregated: boolean;
}

export type ActivityCategory = 'transport' | 'energy' | 'food' | 'waste';

export interface Activity {
  id: string;
  date: string; // YYYY-MM-DD
  category: ActivityCategory;
  details: TransportDetails | EnergyDetails | FoodDetails | WasteDetails;
  emissions: number; // calculated kg CO2e
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt: string | null; // ISO date string or null if locked
  icon: string;
}

export interface Recommendation {
  id: string;
  title: string;
  category: ActivityCategory;
  description: string;
  savings: number; // estimated weekly kg CO2e saved
  actionableText: string;
}
