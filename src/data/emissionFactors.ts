/**
 * Emission factors for Carbon Ledger (kg CO2e per unit).
 * 
 * Assumptions and Sources:
 * - Transport factors: IPCC & India-specific grid-adjusted estimates for road and rail, domestic/international aviation estimates.
 * - Electricity: India grid average emissions factor (approx 0.71 kg CO2e/kWh), which incorporates high coal dependencies.
 * - LPG: Standard domestic LPG cylinder refill (14.2 kg LPG) results in ~42 kg CO2e.
 * - Diet: Day-level averages based on EAT-Lancet and local Indian context footprint models.
 * - Waste: Waste-to-landfill models accounting for anaerobic decomposition (methane emissions) with a mitigation offset for segregation/recycling.
 * 
 * Note: These factors are for personal awareness and education purposes, not for formal regulatory or corporate ESG accounting.
 */
export const EMISSION_FACTORS = {
  transport: {
    'car-petrol': 0.192,         // kg CO2e per km
    'car-diesel': 0.171,         // kg CO2e per km
    'car-ev': 0.085,             // kg CO2e per km (India grid average)
    'two-wheeler': 0.072,        // kg CO2e per km
    bus: 0.105,                  // kg CO2e per km
    'train-metro': 0.041,        // kg CO2e per km
    'flight-domestic': 0.255,    // kg CO2e per km (higher radiative forcing factor)
    'flight-international': 0.195,// kg CO2e per km
    bicycle: 0,                  // zero-emission
    walking: 0                   // zero-emission
  },
  energy: {
    electricity: 0.71,           // kg CO2e per kWh
    lpg: 42.0                    // kg CO2e per cylinder refill (14.2 kg)
  },
  diet: {
    vegan: 1.5,                  // kg CO2e per day
    vegetarian: 1.7,             // kg CO2e per day
    eggetarian: 2.1,             // kg CO2e per day
    'non-veg-moderate': 3.3,     // kg CO2e per day
    'non-veg-heavy': 5.6         // kg CO2e per day
  },
  waste: {
    'low-segregated': 0.5,       // kg CO2e per day
    'low-mixed': 0.9,            // kg CO2e per day
    'medium-segregated': 1.0,    // kg CO2e per day
    'medium-mixed': 1.8,         // kg CO2e per day
    'high-segregated': 1.6,      // kg CO2e per day
    'high-mixed': 2.9            // kg CO2e per day
  }
} as const;

/**
 * Represents the available modes of transport.
 */
export type TransportMode = keyof typeof EMISSION_FACTORS.transport;

/**
 * Represents the available diet types.
 */
export type DietType = keyof typeof EMISSION_FACTORS.diet;

/**
 * Represents the waste volume level options.
 */
export type WasteLevel = 'low' | 'medium' | 'high';

/**
 * National average monthly carbon footprint of an Indian citizen (kg CO2e).
 */
export const NATIONAL_AVERAGE_MONTHLY_CO2 = 1900;

/**
 * National average weekly carbon footprint of an Indian citizen (kg CO2e).
 */
export const NATIONAL_AVERAGE_WEEKLY_CO2 = 1900 * 12 / 52; // ~438.46 kg CO2e per week

/**
 * National average daily carbon footprint of an Indian citizen (kg CO2e).
 */
export const NATIONAL_AVERAGE_DAILY_CO2 = 1900 / 30; // ~63.33 kg CO2e per day
