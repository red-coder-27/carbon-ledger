import { 
  NATIONAL_AVERAGE_DAILY_CO2 as DAILY_CO2,
  NATIONAL_AVERAGE_MONTHLY_CO2 as MONTHLY_CO2,
  NATIONAL_AVERAGE_WEEKLY_CO2 as WEEKLY_CO2
} from '../constants';

/**
 * Emission factors dataset for Carbon Ledger (measured in kg CO₂e per unit).
 * Sourced from India-specific grid-adjusted databases and IPCC guidelines.
 * 
 * Sourced details:
 * - Electricity emission factor of 0.71 kg CO₂e/kWh accounts for heavy coal reliance.
 * - LPG cylinder refill factor of 42.0 kg CO₂e represents standard 14.2kg cylinders.
 * - Transport factors account for vehicle efficiency, fuel emission rates, and grid averages.
 * - Waste factors account for low/medium/high volumes combined with segregation offsets.
 */
export const EMISSION_FACTORS = Object.freeze({
  transport: Object.freeze({
    'car-petrol': 0.192,
    'car-diesel': 0.171,
    'car-ev': 0.085,
    'two-wheeler': 0.072,
    bus: 0.105,
    'train-metro': 0.041,
    'flight-domestic': 0.255,
    'flight-international': 0.195,
    bicycle: 0.0,
    walking: 0.0
  }),
  energy: Object.freeze({
    electricity: 0.71,
    lpg: 42.0
  }),
  diet: Object.freeze({
    vegan: 1.5,
    vegetarian: 1.7,
    eggetarian: 2.1,
    'non-veg-moderate': 3.3,
    'non-veg-heavy': 5.6
  }),
  waste: Object.freeze({
    'low-segregated': 0.5,
    'low-mixed': 0.9,
    'medium-segregated': 1.0,
    'medium-mixed': 1.8,
    'high-segregated': 1.6,
    'high-mixed': 2.9
  })
} as const);

/**
 * Supported transportation modes.
 */
export type TransportMode = keyof typeof EMISSION_FACTORS.transport;

/**
 * Supported dietary pattern types.
 */
export type DietType = keyof typeof EMISSION_FACTORS.diet;

/**
 * Supported waste volume options.
 */
export type WasteLevel = 'low' | 'medium' | 'high';

/**
 * National average monthly carbon footprint of an Indian citizen (kg CO₂e).
 */
export const NATIONAL_AVERAGE_MONTHLY_CO2: number = MONTHLY_CO2;

/**
 * National average weekly carbon footprint of an Indian citizen (kg CO₂e).
 */
export const NATIONAL_AVERAGE_WEEKLY_CO2: number = WEEKLY_CO2;

/**
 * National average daily carbon footprint of an Indian citizen (kg CO₂e).
 */
export const NATIONAL_AVERAGE_DAILY_CO2: number = DAILY_CO2;
