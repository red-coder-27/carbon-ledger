import { EMISSION_FACTORS, TransportMode, DietType, WasteLevel } from '../data/emissionFactors';
import { ActivityCategory } from '../types';

/**
 * Calculates transport emissions in kg CO2e.
 * Formula: distance (km) * emission factor (kg CO2e / km)
 */
export function calculateTransportEmissions(mode: TransportMode, distance: number): number {
  if (distance < 0) return 0;
  const factor = EMISSION_FACTORS.transport[mode] ?? 0;
  return Number((distance * factor).toFixed(3));
}

/**
 * Calculates energy emissions in kg CO2e.
 * Formula: (electricity kWh * 0.71) + (LPG refills * 42)
 */
export function calculateEnergyEmissions(electricity: number, lpg: number): number {
  const electricityKwh = Math.max(0, electricity);
  const lpgRefills = Math.max(0, lpg);
  
  const electricityEmissions = electricityKwh * EMISSION_FACTORS.energy.electricity;
  const lpgEmissions = lpgRefills * EMISSION_FACTORS.energy.lpg;
  
  return Number((electricityEmissions + lpgEmissions).toFixed(3));
}

/**
 * Calculates food emissions in kg CO2e.
 * Diet factors are per-day.
 */
export function calculateFoodEmissions(dietType: DietType): number {
  const factor = EMISSION_FACTORS.diet[dietType] ?? 0;
  return Number(factor.toFixed(3));
}

/**
 * Calculates waste emissions in kg CO2e.
 * Factors are per-day based on waste level and segregation.
 */
export function calculateWasteEmissions(level: WasteLevel, segregated: boolean): number {
  const key = `${level}-${segregated ? 'segregated' : 'mixed'}` as keyof typeof EMISSION_FACTORS.waste;
  const factor = EMISSION_FACTORS.waste[key] ?? 0;
  return Number(factor.toFixed(3));
}

/**
 * Routes and calculates emissions for any activity based on its category and details.
 */
export function calculateActivityEmissions(category: ActivityCategory, details: any): number {
  if (!details) return 0;
  
  switch (category) {
    case 'transport':
      return calculateTransportEmissions(details.mode, details.distance);
    case 'energy':
      return calculateEnergyEmissions(details.electricity, details.lpg);
    case 'food':
      return calculateFoodEmissions(details.dietType);
    case 'waste':
      return calculateWasteEmissions(details.level, details.segregated);
    default:
      return 0;
  }
}

/**
 * Aggregates a list of activities to get a category-wise breakdown and overall total.
 */
export function aggregateEmissions(activities: { category: ActivityCategory; emissions: number }[]) {
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
