import React from 'react';
import { getTreeRingData, TreeRingData } from '../utils/treeRingData';

/**
 * Props for the TreeRingChart component.
 */
interface TreeRingChartProps {
  /** Total transport emissions logged for the period (in kg CO₂e) */
  readonly transport: number;
  /** Total energy emissions logged for the period (in kg CO₂e) */
  readonly energy: number;
  /** Total diet/food emissions logged for the period (in kg CO₂e) */
  readonly food: number;
  /** Total waste emissions logged for the period (in kg CO₂e) */
  readonly waste: number;
  /** Grand total emissions across all categories combined (in kg CO₂e) */
  readonly total: number;
}

/**
 * Renders a circular concentric tree-ring visualization of carbon emissions.
 * 
 * Each concentric ring matches a category (Transport, Energy, Food, Waste).
 * The length of each ring corresponds to its relative contribution to the total.
 * Includes a text panel in the center displaying the absolute total footprint.
 *
 * @param {TreeRingChartProps} props - Props containing emissions values per category and total sum
 * @returns {React.ReactElement} Concentric SVG-based tree-ring carbon chart
 */
function TreeRingChart({
  transport,
  energy,
  food,
  waste,
  total
}: TreeRingChartProps): React.ReactElement {
  const rings = getTreeRingData(transport, energy, food, waste, total);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Graphic Wrapper */}
      <div className="relative w-64 h-64 md:w-72 md:h-72" aria-hidden="true">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full transform -rotate-90"
        >
          {/* Subtle paper-like concentric circles underneath for guides */}
          {rings.map((ring: TreeRingData) => (
            <circle
              key={`guide-${ring.id}`}
              cx="100"
              cy="100"
              r={ring.radius}
              fill="none"
              stroke="#E2DCD0"
              strokeWidth={1}
              strokeDasharray="4,4"
            />
          ))}

          {/* Active concentric tree rings */}
          {rings.map((ring: TreeRingData) => {
            const circumference = 2 * Math.PI * ring.radius;
            // Map percentage to a stroke dashoffset.
            const activePercent = total > 0 ? ring.percentage : 0;
            const strokeDashoffset = circumference - (activePercent / 100) * circumference;

            return (
              <circle
                key={`ring-${ring.id}`}
                cx="100"
                cy="100"
                r={ring.radius}
                fill="none"
                stroke={ring.color}
                strokeWidth={ring.strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out drop-shadow-[0.5px_1px_1px_rgba(27,58,43,0.15)]"
              />
            );
          })}
        </svg>

        {/* Center Text Panel (Not rotated) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
          <span className="text-xs uppercase tracking-wider text-graphite font-sans">
            Total Footprint
          </span>
          <span className="text-3xl md:text-4xl font-mono-journal font-bold text-ink my-0.5">
            {total.toFixed(1)}
          </span>
          <span className="text-xs text-graphite font-sans">
            kg CO₂e
          </span>
        </div>
      </div>

      {/* Screen Reader Table/Summary Alternative */}
      <div className="sr-only">
        <h4>Emissions Breakdown (Tree Ring Chart):</h4>
        <ul>
          {rings.map((ring: TreeRingData): React.ReactElement => (
            <li key={`sr-${ring.id}`}>
              {ring.name}: {ring.value.toFixed(1)} kg CO₂e ({ring.percentage.toFixed(0)}%)
            </li>
          ))}
          <li>Total footprint: {total.toFixed(1)} kg CO₂e</li>
        </ul>
      </div>

      {/* Legible visual legend */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 text-xs font-sans">
        {rings.map((ring: TreeRingData): React.ReactElement => (
          <div key={`legend-${ring.id}`} className="flex items-center space-x-2">
            <span
              className={`w-3.5 h-3.5 rounded-full inline-block ${ring.bgClass}`}
            />
            <span className="text-graphite font-medium">
              {ring.name}: <span className="font-mono-journal text-ink">{ring.value.toFixed(1)} kg</span> ({ring.percentage.toFixed(0)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TreeRingChart;
