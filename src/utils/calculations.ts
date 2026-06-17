import { EMISSION_FACTORS, TransportMode, DietType, WasteLevel } from '../data/emissionFactors';
import { ActivityCategory, TransportDetails, EnergyDetails, FoodDetails, WasteDetails } from '../types';

/**
 * Summary of carbon emissions aggregated across all categories.
 */
export interface EmissionsSummary {
  /** Aggregated emissions from all transportation activities (in kg CO₂e) */
  readonly transport: number;
  /** Aggregated emissions from all household energy consumption (in kg CO₂e) */
  readonly energy: number;
  /** Aggregated emissions from dietary choices (in kg CO₂e) */
  readonly food: number;
  /** Aggregated emissions from household waste generation (in kg CO₂e) */
  readonly waste: number;
  /** Overall total of carbon emissions across all categories combined (in kg CO₂e) */
  readonly total: number;
}

/**
 * Calculates the carbon emission (in kg CO₂e) for a transport activity.
 * 
 * Sourced factors are multiplied by distance. Negative distance inputs
 * are bounded to 0 to prevent calculating invalid negative emissions.
 *
 * @param {TransportMode} mode - The mode of travel utilized (e.g. 'car-petrol', 'bus')
 * @param {number} distance - The total travel distance in kilometres
 * @returns {number} The calculated emissions in kg CO₂e, rounded to 3 decimal places
 *
 * @example
 * calculateTransportEmissions('car-petrol', 100)
 * // returns 19.2
 *
 * @example
 * calculateTransportEmissions('walking', 5)
 * // returns 0
 */
export function calculateTransportEmissions(mode: TransportMode, distance: number): number {
  // SECURITY: Prevent negative distance values from causing negative emission calculation results
  if (distance < 0) return 0;
  
  const factor = EMISSION_FACTORS.transport[mode] ?? 0;
  return Number((distance * factor).toFixed(3));
}

/**
 * Calculates carbon emissions (in kg CO₂e) from domestic energy consumption.
 * 
 * Binds both inputs to non-negative values to prevent invalid inputs from leading to negative calculations.
 *
 * @param {number} electricity - The electricity consumption in kilowatt-hours (kWh)
 * @param {number} lpg - The quantity of LPG cylinder refills used
 * @returns {number} The calculated total energy emissions in kg CO₂e, rounded to 3 decimal places
 *
 * @example
 * calculateEnergyEmissions(10, 1)
 * // returns 49.1
 *
 * @example
 * calculateEnergyEmissions(0, 0)
 * // returns 0
 */
export function calculateEnergyEmissions(electricity: number, lpg: number): number {
  // SECURITY: Bounds checks prevent negative numbers from injecting negative emissions
  const electricityKwh = Math.max(0, electricity);
  const lpgRefills = Math.max(0, lpg);
  
  const electricityEmissions = electricityKwh * EMISSION_FACTORS.energy.electricity;
  const lpgEmissions = lpgRefills * EMISSION_FACTORS.energy.lpg;
  
  return Number((electricityEmissions + lpgEmissions).toFixed(3));
}

/**
 * Calculates carbon emissions (in kg CO₂e) for daily diet choices.
 *
 * Sourced from average daily dietary footprint factors (e.g. vegan vs non-veg-heavy).
 *
 * @param {DietType} dietType - The dietary classification followed for the day
 * @returns {number} The daily dietary footprint in kg CO₂e, rounded to 3 decimal places
 *
 * @example
 * calculateFoodEmissions('vegan')
 * // returns 1.5
 *
 * @example
 * calculateFoodEmissions('non-veg-heavy')
 * // returns 5.6
 */
export function calculateFoodEmissions(dietType: DietType): number {
  const factor = EMISSION_FACTORS.diet[dietType] ?? 0;
  return Number(factor.toFixed(3));
}

/**
 * Calculates carbon emissions (in kg CO₂e) for daily waste generation.
 * 
 * Computes footprint based on volume scale and practice of waste segregation/recycling.
 *
 * @param {WasteLevel} level - The volume of waste generated ('low', 'medium', or 'high')
 * @param {boolean} segregated - True if waste was segregated/recycled, false otherwise
 * @returns {number} The daily waste footprint in kg CO₂e, rounded to 3 decimal places
 *
 * @example
 * calculateWasteEmissions('low', true)
 * // returns 0.5
 *
 * @example
 * calculateWasteEmissions('high', false)
 * // returns 2.9
 */
export function calculateWasteEmissions(level: WasteLevel, segregated: boolean): number {
  const key = `${level}-${segregated ? 'segregated' : 'mixed'}` as keyof typeof EMISSION_FACTORS.waste;
  const factor = EMISSION_FACTORS.waste[key] ?? 0;
  return Number(factor.toFixed(3));
}

/**
 * Helper router function that directs emission calculations based on activity category.
 * 
 * Verifies payload integrity, checking for null or undefined details parameters.
 *
 * @param {ActivityCategory} category - The activity category logged
 * @param {TransportDetails | EnergyDetails | FoodDetails | WasteDetails | null | undefined} details - Specific fields of the activity
 * @returns {number} The derived emissions in kg CO₂e, or 0 if inputs are empty
 *
 * @example
 * calculateActivityEmissions('food', { dietType: 'vegan' })
 * // returns 1.5
 *
 * @example
 * calculateActivityEmissions('transport', null)
 * // returns 0
 */
export function calculateActivityEmissions(
  category: ActivityCategory,
  details: TransportDetails | EnergyDetails | FoodDetails | WasteDetails | null | undefined
): number {
  // SECURITY: Check for undefined or null inputs to prevent execution errors on malformed payloads
  if (!details) return 0;
  
  switch (category) {
    case 'transport': {
      const d = details as TransportDetails;
      return calculateTransportEmissions(d.mode, d.distance);
    }
    case 'energy': {
      const d = details as EnergyDetails;
      return calculateEnergyEmissions(d.electricity, d.lpg);
    }
    case 'food': {
      const d = details as FoodDetails;
      return calculateFoodEmissions(d.dietType);
    }
    case 'waste': {
      const d = details as WasteDetails;
      return calculateWasteEmissions(d.level, d.segregated);
    }
    default:
      return 0;
  }
}

/**
 * Aggregates a list of activity entries to compute a category breakdown and grand total.
 *
 * Iterates through the entries and maps them to the respective fields in the summary.
 *
 * @param {readonly { readonly category: ActivityCategory; readonly emissions: number }[]} activities - List of activity emissions items
 * @returns {EmissionsSummary} Aggregated emissions breakdown and overall footprint sum
 *
 * @example
 * aggregateEmissions([{ category: 'food', emissions: 1.5 }, { category: 'transport', emissions: 12.0 }])
 * // returns { transport: 12.0, energy: 0, food: 1.5, waste: 0, total: 13.5 }
 */
export function aggregateEmissions(
  activities: readonly { readonly category: ActivityCategory; readonly emissions: number }[]
): EmissionsSummary {
  const summary = {
    transport: 0,
    energy: 0,
    food: 0,
    waste: 0,
    total: 0
  };

  activities.forEach((activity: { readonly category: ActivityCategory; readonly emissions: number }): void => {
    if (activity.category in summary) {
      summary[activity.category] = Number((summary[activity.category] + activity.emissions).toFixed(3));
      summary.total = Number((summary.total + activity.emissions).toFixed(3));
    }
  });

  return summary;
}
