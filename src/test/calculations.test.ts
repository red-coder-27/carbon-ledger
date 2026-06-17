import { describe, it, expect } from 'vitest';
import {
  calculateTransportEmissions,
  calculateEnergyEmissions,
  calculateFoodEmissions,
  calculateWasteEmissions,
  calculateActivityEmissions,
  aggregateEmissions
} from '../utils/calculations';

describe('Emission Calculations Module', () => {
  describe('calculateTransportEmissions', () => {
    it('calculates correct emissions for petrol car commute', () => {
      // 100 km * 0.192 = 19.2 kg
      expect(calculateTransportEmissions('car-petrol', 100)).toBe(19.2);
    });

    it('calculates correct emissions for public bus', () => {
      // 10 km * 0.105 = 1.05 kg
      expect(calculateTransportEmissions('bus', 10)).toBe(1.05);
    });

    it('returns 0 for walking and bicycle trips', () => {
      expect(calculateTransportEmissions('walking', 50)).toBe(0);
      expect(calculateTransportEmissions('bicycle', 10)).toBe(0);
    });

    it('gracefully handles zero distance', () => {
      expect(calculateTransportEmissions('car-diesel', 0)).toBe(0);
    });

    it('returns 0 for negative distance inputs', () => {
      expect(calculateTransportEmissions('car-petrol', -15)).toBe(0);
    });
  });

  describe('calculateEnergyEmissions', () => {
    it('calculates correct emissions for electricity and LPG refills combined', () => {
      // electricity: 10 kWh * 0.71 = 7.1
      // lpg: 1 refill * 42.0 = 42.0
      // total = 49.1 kg
      expect(calculateEnergyEmissions(10, 1)).toBe(49.1);
    });

    it('handles electricity usage alone', () => {
      expect(calculateEnergyEmissions(100, 0)).toBe(71.0);
    });

    it('handles LPG refills alone', () => {
      expect(calculateEnergyEmissions(0, 2)).toBe(84.0);
    });

    it('caps negative electricity or LPG counts to 0', () => {
      expect(calculateEnergyEmissions(-50, -2)).toBe(0);
    });
  });

  describe('calculateFoodEmissions', () => {
    it('returns correct emission values for all diet types', () => {
      expect(calculateFoodEmissions('vegan')).toBe(1.5);
      expect(calculateFoodEmissions('vegetarian')).toBe(1.7);
      expect(calculateFoodEmissions('eggetarian')).toBe(2.1);
      expect(calculateFoodEmissions('non-veg-moderate')).toBe(3.3);
      expect(calculateFoodEmissions('non-veg-heavy')).toBe(5.6);
    });
  });

  describe('calculateWasteEmissions', () => {
    it('calculates emissions for low waste levels', () => {
      expect(calculateWasteEmissions('low', true)).toBe(0.5); // segregated
      expect(calculateWasteEmissions('low', false)).toBe(0.9); // mixed
    });

    it('calculates emissions for medium waste levels', () => {
      expect(calculateWasteEmissions('medium', true)).toBe(1.0); // segregated
      expect(calculateWasteEmissions('medium', false)).toBe(1.8); // mixed
    });

    it('calculates emissions for high waste levels', () => {
      expect(calculateWasteEmissions('high', true)).toBe(1.6); // segregated
      expect(calculateWasteEmissions('high', false)).toBe(2.9); // mixed
    });
  });

  describe('calculateActivityEmissions router helper', () => {
    it('correctly maps and calculates transport activities', () => {
      const details = { mode: 'two-wheeler', distance: 10 };
      expect(calculateActivityEmissions('transport', details)).toBe(0.72);
    });

    it('returns 0 if details are null or undefined', () => {
      expect(calculateActivityEmissions('transport', null)).toBe(0);
    });
  });

  describe('aggregateEmissions', () => {
    it('correctly sums and groups list of activities by category', () => {
      const mockActivities = [
        { category: 'transport' as const, emissions: 12.5 },
        { category: 'transport' as const, emissions: 7.5 },
        { category: 'energy' as const, emissions: 30 },
        { category: 'food' as const, emissions: 1.7 },
        { category: 'waste' as const, emissions: 0.5 }
      ];

      const result = aggregateEmissions(mockActivities);
      expect(result.transport).toBe(20.0);
      expect(result.energy).toBe(30.0);
      expect(result.food).toBe(1.7);
      expect(result.waste).toBe(0.5);
      expect(result.total).toBe(52.2);
    });

    it('handles empty activity arrays', () => {
      const result = aggregateEmissions([]);
      expect(result.total).toBe(0);
      expect(result.transport).toBe(0);
    });
  });
});
