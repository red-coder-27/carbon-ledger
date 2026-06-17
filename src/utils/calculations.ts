import { EMISSION_FACTORS, TransportMode, DietType, WasteLevel } from '../data/emissionFactors';
import { ActivityCategory, TransportDetails, EnergyDetails, FoodDetails, WasteDetails } from '../types';

/**
 * Calculates transport emissions in kg CO2e.
 * @param {TransportMode} mode - The mode of transport used
 * @param {number} distance - Distance travelled in kilometres
 * @returns {number} Emission in kg CO₂e
 * @example
 * calculateTransportEmissions('car-petrol', 15) // returns 2.88
 */
export function calculateTransportEmissions(mode: TransportMode, distance: number): number {
  // SECURITY: Prevent negative distance values from causing negative emission calculation results
  if (distance < 0) return 0;
  
  const factor = EMISSION_FACTORS.transport[mode] ?? 0;
  return Number((distance * factor).toFixed(3));
}

/**
 * Calculates energy emissions in kg CO2e.
 * @param {number} electricity - Electricity consumption in kWh
 * @param {number} lpg - LPG cylinder refills count
 * @returns {number} Emission in kg CO₂e
 * @example
 * calculateEnergyEmissions(100, 1) // returns 113
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
 * Calculates food emissions in kg CO2e based on diet type.
 * @param {DietType} dietType - The diet pattern followed for a day
 * @returns {number} Emission in kg CO₂e
 * @example
 * calculateFoodEmissions('vegan') // returns 1.5
 */
export function calculateFoodEmissions(dietType: DietType): number {
  const factor = EMISSION_FACTORS.diet[dietType] ?? 0;
  return Number(factor.toFixed(3));
}

/**
 * Calculates waste emissions in kg CO2e.
 * @param {WasteLevel} level - The volume of waste (low, medium, high)
 * @param {boolean} segregated - Whether the waste was segregated or not
 * @returns {number} Emission in kg CO₂e
 * @example
 * calculateWasteEmissions('low', true) // returns 0.5
 */
export function calculateWasteEmissions(level: WasteLevel, segregated: boolean): number {
  const key = `${level}-${segregated ? 'segregated' : 'mixed'}` as keyof typeof EMISSION_FACTORS.waste;
  const factor = EMISSION_FACTORS.waste[key] ?? 0;
  return Number(factor.toFixed(3));
}

/**
 * Routes and calculates emissions for any activity based on its category.
 * @param {ActivityCategory} category - The activity category (transport, energy, food, waste)
 * @param {TransportDetails | EnergyDetails | FoodDetails | WasteDetails} details - The specific details of the activity
 * @returns {number} Emission in kg CO₂e
 * @example
 * calculateActivityEmissions('food', { dietType: 'vegan' }) // returns 1.5
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

interface EmissionsSummary {
  readonly transport: number;
  readonly energy: number;
  readonly food: number;
  readonly waste: number;
  readonly total: number;
}

/**
 * Aggregates a list of activities to get a category-wise breakdown and overall total.
 * @param {Array<{ category: ActivityCategory; emissions: number }>} activities - The logged activities list
 * @returns {EmissionsSummary} The breakdown and total carbon footprint
 * @example
 * aggregateEmissions([{ category: 'food', emissions: 1.5 }]) // returns { transport: 0, energy: 0, food: 1.5, waste: 0, total: 1.5 }
 */
export function aggregateEmissions(
  activities: { readonly category: ActivityCategory; readonly emissions: number }[]
): EmissionsSummary {
  const summary = {
    transport: 0,
    energy: 0,
    food: 0,
    waste: 0,
    total: 0
  };

  activities.forEach(activity => {
    if (activity.category in summary) {
      summary[activity.category] = Number((summary[activity.category] + activity.emissions).toFixed(3));
      summary.total = Number((summary.total + activity.emissions).toFixed(3));
    }
  });

  return summary;
}
