/**
 * Represents the layout and data properties for a concentric carbon footprint ring.
 */
export interface TreeRingData {
  /** Uniquely identifies the emission category (e.g. 'transport') */
  readonly id: string;
  /** Human-readable label for the category */
  readonly name: string;
  /** Concentric radius for rendering the SVG circle */
  readonly radius: number;
  /** Stroke width thickness of the ring segment */
  readonly strokeWidth: number;
  /** Hex color code for the ring stroke */
  readonly color: string;
  /** Percentage contribution of this category to the total footprint */
  readonly percentage: number;
  /** Absolute emission value in kg CO₂e */
  readonly value: number;
  /** Tailwind background color class matching the category */
  readonly bgClass: string;
}

/**
 * Computes concentric circle percentages and visual layout data for the tree-ring chart.
 *
 * @param {number} transport - Transport category emissions in kg CO₂e
 * @param {number} energy - Energy category emissions in kg CO₂e
 * @param {number} food - Diet category emissions in kg CO₂e
 * @param {number} waste - Waste category emissions in kg CO₂e
 * @param {number} total - Grand total emissions across all categories
 * @returns {readonly TreeRingData[]} A compiled list of styled circular ring configurations
 * @example
 * const rings = getTreeRingData(10, 5, 5, 0, 20);
 * // returns [
 * //   { id: 'transport', name: 'Transport', radius: 80, strokeWidth: 10, color: '#C75D3A', percentage: 50, value: 10, bgClass: 'bg-clay' },
 * //   ...
 * // ]
 */
export function getTreeRingData(
  transport: number,
  energy: number,
  food: number,
  waste: number,
  total: number
): readonly TreeRingData[] {
  // Prevent division by zero
  const safeTotal = total > 0 ? total : 1;

  // Calculate percentages
  const pctTransport = (transport / safeTotal) * 100;
  const pctEnergy = (energy / safeTotal) * 100;
  const pctFood = (food / safeTotal) * 100;
  const pctWaste = (waste / safeTotal) * 100;

  return [
    {
      id: 'transport',
      name: 'Transport',
      radius: 80,
      strokeWidth: 10,
      color: '#C75D3A', // Clay
      percentage: pctTransport,
      value: transport,
      bgClass: 'bg-clay'
    },
    {
      id: 'energy',
      name: 'Energy',
      radius: 64,
      strokeWidth: 9,
      color: '#6B8E7F', // Moss
      percentage: pctEnergy,
      value: energy,
      bgClass: 'bg-moss'
    },
    {
      id: 'food',
      name: 'Food',
      radius: 48,
      strokeWidth: 8,
      color: '#1B3A2B', // Ink
      percentage: pctFood,
      value: food,
      bgClass: 'bg-ink'
    },
    {
      id: 'waste',
      name: 'Waste',
      radius: 32,
      strokeWidth: 7,
      color: '#4F8A5B', // Leaf
      percentage: pctWaste,
      value: waste,
      bgClass: 'bg-leaf'
    }
  ];
}
