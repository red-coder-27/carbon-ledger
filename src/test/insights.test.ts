import { describe, it, expect } from 'vitest';
import { generateInsights } from '../utils/insights';
import { Activity } from '../types';

describe('Insights and Recommendation Engine', () => {
  it('returns default guidelines when no activity logs are present', () => {
    const result = generateInsights([]);
    expect(result.highestCategory).toBe('none');
    expect(result.recommendations).toHaveLength(4);
    
    // Check that we got standard starter advice
    const ids = result.recommendations.map(r => r.id);
    expect(ids).toContain('def_transit');
    expect(ids).toContain('def_energy');
  });

  it('correctly identifies transport as the highest category and orders recommendations', () => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    const mockActivities: Activity[] = [
      {
        id: '1',
        date: todayStr,
        category: 'transport',
        details: { mode: 'car-petrol', distance: 200 }, // emissions: 200 * 0.192 = 38.4 kg
        emissions: 38.4
      },
      {
        id: '2',
        date: todayStr,
        category: 'food',
        details: { dietType: 'vegetarian' }, // emissions: 1.7 kg
        emissions: 1.7
      }
    ];

    const result = generateInsights(mockActivities);
    expect(result.highestCategory).toBe('transport');
    expect(result.categoryTotals.transport).toBe(38.4);
    
    // Should return transport-related recommendations
    expect(result.recommendations.length).toBeGreaterThan(0);
    // Recommendations should be sorted by savings descending
    const savings = result.recommendations.map(r => r.savings);
    const sortedSavings = [...savings].sort((a, b) => b - a);
    expect(savings).toEqual(sortedSavings);
  });

  it('correctly evaluates food-related diet advice', () => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    const mockActivities: Activity[] = [
      {
        id: '1',
        date: todayStr,
        category: 'food',
        details: { dietType: 'non-veg-heavy' },
        emissions: 5.6
      },
      {
        id: '2',
        date: todayStr,
        category: 'food',
        details: { dietType: 'non-veg-heavy' },
        emissions: 5.6
      }
    ];

    const result = generateInsights(mockActivities);
    expect(result.highestCategory).toBe('food');
    
    // Should trigger meat-reduction recommendation
    const hasDietRec = result.recommendations.some(r => r.id === 'f_heavy_to_veg');
    expect(hasDietRec).toBe(true);
  });

  it('correctly evaluates waste segregation advice', () => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    const mockActivities: Activity[] = [
      {
        id: '1',
        date: todayStr,
        category: 'waste',
        details: { level: 'medium', segregated: false },
        emissions: 1.8
      },
      {
        id: '2',
        date: todayStr,
        category: 'waste',
        details: { level: 'medium', segregated: false },
        emissions: 1.8
      }
    ];

    const result = generateInsights(mockActivities);
    expect(result.highestCategory).toBe('waste');
    
    // Should trigger segregation advice
    const hasWasteRec = result.recommendations.some(r => r.id === 'w_segregation');
    expect(hasWasteRec).toBe(true);
  });
});
