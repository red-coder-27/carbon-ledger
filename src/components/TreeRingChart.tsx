import React from 'react';

interface TreeRingChartProps {
  transport: number;
  energy: number;
  food: number;
  waste: number;
  total: number;
}

export const TreeRingChart: React.FC<TreeRingChartProps> = ({
  transport,
  energy,
  food,
  waste,
  total
}) => {
  // Prevent division by zero
  const safeTotal = total > 0 ? total : 1;

  // Calculate percentages
  const pctTransport = (transport / safeTotal) * 100;
  const pctEnergy = (energy / safeTotal) * 100;
  const pctFood = (food / safeTotal) * 100;
  const pctWaste = (waste / safeTotal) * 100;

  // Ring configurations: radius, stroke width, color, percentage, category name
  const rings = [
    {
      id: 'transport',
      name: 'Transport',
      radius: 80,
      strokeWidth: 10,
      color: '#C75D3A', // Clay
      percentage: pctTransport,
      value: transport
    },
    {
      id: 'energy',
      name: 'Energy',
      radius: 64,
      strokeWidth: 9,
      color: '#6B8E7F', // Moss
      percentage: pctEnergy,
      value: energy
    },
    {
      id: 'food',
      name: 'Food',
      radius: 48,
      strokeWidth: 8,
      color: '#1B3A2B', // Ink
      percentage: pctFood,
      value: food
    },
    {
      id: 'waste',
      name: 'Waste',
      radius: 32,
      strokeWidth: 7,
      color: '#4F8A5B', // Leaf
      percentage: pctWaste,
      value: waste
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Graphic Wrapper */}
      <div className="relative w-64 h-64 md:w-72 md:h-72" aria-hidden="true">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full transform -rotate-90"
        >
          {/* Subtle paper-like concentric circles underneath for guides */}
          {rings.map((ring) => (
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
          {rings.map((ring) => {
            const circumference = 2 * Math.PI * ring.radius;
            // Map percentage to a stroke dashoffset.
            // If total emissions are 0, draw just a tiny 2% notch or nothing (let's do 0).
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
                className="transition-all duration-1000 ease-out"
                style={{
                  filter: 'drop-shadow(0.5px 1px 1px rgba(27, 58, 43, 0.15))',
                }}
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
          {rings.map(ring => (
            <li key={`sr-${ring.id}`}>
              {ring.name}: {ring.value.toFixed(1)} kg CO₂e ({ring.percentage.toFixed(0)}%)
            </li>
          ))}
          <li>Total footprint: {total.toFixed(1)} kg CO₂e</li>
        </ul>
      </div>

      {/* Legible visual legend */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 text-xs font-sans">
        {rings.map((ring) => (
          <div key={`legend-${ring.id}`} className="flex items-center space-x-2">
            <span
              className="w-3.5 h-3.5 rounded-full inline-block"
              style={{ backgroundColor: ring.color }}
            />
            <span className="text-graphite font-medium">
              {ring.name}: <span className="font-mono-journal text-ink">{ring.value.toFixed(1)} kg</span> ({ring.percentage.toFixed(0)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
