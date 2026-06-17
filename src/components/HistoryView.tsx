import React, { useState, useMemo } from 'react';
import { Activity, ActivityCategory, TransportDetails, EnergyDetails, FoodDetails, WasteDetails } from '../types';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  CartesianGrid 
} from 'recharts';
import { History, Table, Activity as ChartIcon, Trash2 } from 'lucide-react';
import { ErrorBoundary } from './ErrorBoundary';

interface HistoryViewProps {
  readonly activities: Activity[];
  readonly onDeleteActivity: (id: string) => void;
}

interface ChartRow {
  readonly date: string;
  readonly formattedDate: string;
  readonly transport: number;
  readonly energy: number;
  readonly food: number;
  readonly waste: number;
  readonly total: number;
}

/**
 * Renders the historical carbon ledger logs and trend charts.
 * @param {HistoryViewProps} props - The component props containing activities and deletion handler
 * @returns {React.ReactElement} The history view component
 */
export const HistoryView: React.FC<HistoryViewProps> = ({ 
  activities,
  onDeleteActivity
}) => {
  const [chartType, setChartType] = useState<'stacked' | 'line'>('stacked');
  const [showTable, setShowTable] = useState<boolean>(false);

  // Group activities by date and category
  const chartData = useMemo((): ChartRow[] => {
    if (activities.length === 0) return [];

    const dateMap: Record<string, Record<ActivityCategory | 'total', number>> = {};

    activities.forEach((act: Activity) => {
      const dateStr = act.date;
      if (!dateMap[dateStr]) {
        dateMap[dateStr] = {
          transport: 0,
          energy: 0,
          food: 0,
          waste: 0,
          total: 0
        };
      }
      dateMap[dateStr][act.category] = Number((dateMap[dateStr][act.category] + act.emissions).toFixed(2));
      dateMap[dateStr].total = Number((dateMap[dateStr].total + act.emissions).toFixed(2));
    });

    // Convert to sorted array
    return Object.entries(dateMap)
      .map(([date, values]) => ({
        date,
        formattedDate: new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        ...values
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [activities]);

  const categoryLabels = {
    transport: 'Transport',
    energy: 'Energy',
    food: 'Diet',
    waste: 'Waste'
  };

  const categoryColors = {
    transport: '#C75D3A', // Clay
    energy: '#6B8E7F',    // Moss
    food: '#1B3A2B',      // Ink
    waste: '#4F8A5B'      // Leaf
  };

  if (activities.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 px-6 font-sans">
        <div className="bg-white border-2 border-moss/20 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute left-0 right-0 top-0 h-1 bg-clay/60" />
          <div className="w-16 h-16 rounded-full bg-paper flex items-center justify-center mb-4 text-moss">
            <History className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif text-ink font-bold mb-2">Your Ledger History</h2>
          <p className="text-graphite mb-6 max-w-md">
            Your first entry will appear here. Log today's activities to start drawing your trend lines and carbon footprint curves.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto font-sans space-y-6">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-moss/20 pb-4">
        <div className="flex items-center space-x-3">
          <History className="text-clay w-7 h-7" />
          <h2 className="text-3xl font-serif text-ink font-bold">Carbon History & Trends</h2>
        </div>

        {/* View Toggles */}
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <button
            onClick={() => setChartType(chartType === 'stacked' ? 'line' : 'stacked')}
            className="px-3.5 py-1.5 border border-moss/30 hover:bg-moss/10 text-xs font-semibold rounded-md flex items-center gap-1.5 transition"
            aria-label={`Toggle chart style. Current: ${chartType === 'stacked' ? 'Stacked Area' : 'Line Trend'}`}
          >
            <ChartIcon className="w-3.5 h-3.5 text-clay" />
            <span>Show {chartType === 'stacked' ? 'Line View' : 'Stacked View'}</span>
          </button>
          
          <button
            onClick={() => setShowTable(!showTable)}
            className="px-3.5 py-1.5 border border-moss/30 hover:bg-moss/10 text-xs font-semibold rounded-md flex items-center gap-1.5 transition"
            aria-pressed={showTable}
          >
            <Table className="w-3.5 h-3.5 text-moss-dark" />
            <span>{showTable ? 'Hide Data Ledger' : 'Show Data Ledger'}</span>
          </button>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white border-2 border-moss/20 rounded-xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-moss/60" />
        
        <h3 className="text-sm font-semibold text-ink uppercase tracking-wider mb-6 flex items-center gap-2">
          Daily Emissions Trend (kg CO₂e)
        </h3>

        <div className="w-full h-80" id="emissions-chart-container">
          <ErrorBoundary>
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'stacked' ? (
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#eae5d9" />
                  <XAxis 
                    dataKey="formattedDate" 
                    tick={{ fill: '#4A4A45', fontSize: 11, fontFamily: 'JetBrains Mono' }} 
                  />
                  <YAxis 
                    tick={{ fill: '#4A4A45', fontSize: 11, fontFamily: 'JetBrains Mono' }} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FAF6EE', border: '1px solid #6B8E7F', fontFamily: 'Inter' }}
                    labelStyle={{ fontWeight: 'bold', color: '#1B3A2B' }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                    formatter={(value) => <span className="text-ink font-semibold">{categoryLabels[value as ActivityCategory] || value}</span>}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="transport" 
                    stackId="1" 
                    stroke={categoryColors.transport} 
                    fill={categoryColors.transport} 
                    fillOpacity={0.65} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="energy" 
                    stackId="1" 
                    stroke={categoryColors.energy} 
                    fill={categoryColors.energy} 
                    fillOpacity={0.65} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="food" 
                    stackId="1" 
                    stroke={categoryColors.food} 
                    fill={categoryColors.food} 
                    fillOpacity={0.65} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="waste" 
                    stackId="1" 
                    stroke={categoryColors.waste} 
                    fill={categoryColors.waste} 
                    fillOpacity={0.65} 
                  />
                </AreaChart>
              ) : (
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#eae5d9" />
                  <XAxis 
                    dataKey="formattedDate" 
                    tick={{ fill: '#4A4A45', fontSize: 11, fontFamily: 'JetBrains Mono' }} 
                  />
                  <YAxis 
                    tick={{ fill: '#4A4A45', fontSize: 11, fontFamily: 'JetBrains Mono' }} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FAF6EE', border: '1px solid #6B8E7F', fontFamily: 'Inter' }}
                    labelStyle={{ fontWeight: 'bold', color: '#1B3A2B' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    name="Total Emissions"
                    stroke="#C75D3A" 
                    strokeWidth={3}
                    activeDot={{ r: 8 }} 
                    dot={{ stroke: '#C75D3A', strokeWidth: 2, r: 4, fill: '#FAF6EE' }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </ErrorBoundary>
        </div>

        {/* Text screen reader chart explanation */}
        <p className="sr-only">
          This chart plots your daily carbon emissions.
          The trend starts on {chartData[0]?.formattedDate} with a total footprint of {chartData[0]?.total} kg CO₂e 
          and ends on {chartData[chartData.length - 1]?.formattedDate} with a total footprint of {chartData[chartData.length - 1]?.total} kg CO₂e.
        </p>
      </div>

      {/* Structured Ledger Table (Accessible/Toggleable view) */}
      {(showTable || !showTable) && (
        <div className={`bg-white border border-moss/20 rounded-xl p-6 shadow-sm overflow-hidden ${showTable ? 'block' : 'hidden'}`}>
          <h3 className="text-sm font-semibold text-ink uppercase tracking-wider mb-4">
            Aggregated Log Ledger
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-moss/20 text-ink">
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3 text-right">Transport (kg)</th>
                  <th className="py-2 px-3 text-right">Energy (kg)</th>
                  <th className="py-2 px-3 text-right">Diet (kg)</th>
                  <th className="py-2 px-3 text-right">Waste (kg)</th>
                  <th className="py-2 px-3 text-right font-bold">Total (kg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-moss/10 font-mono-journal text-xs">
                {chartData.map((row: ChartRow) => (
                  <tr key={row.date} className="hover:bg-paper/30 text-ink">
                    <td className="py-2 px-3 font-sans font-medium">{row.formattedDate}</td>
                    <td className="py-2 px-3 text-right">{row.transport.toFixed(1)}</td>
                    <td className="py-2 px-3 text-right">{row.energy.toFixed(1)}</td>
                    <td className="py-2 px-3 text-right">{row.food.toFixed(1)}</td>
                    <td className="py-2 px-3 text-right">{row.waste.toFixed(1)}</td>
                    <td className="py-2 px-3 text-right font-bold text-clay">{row.total.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Individual Entries List (For editing/deleting logs) */}
      <div className="bg-white border-2 border-moss/20 rounded-xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-clay/60" />
        <h3 className="text-sm font-semibold text-ink uppercase tracking-wider mb-4">
          All Journal Entries ({activities.length})
        </h3>
        
        <div className="divide-y divide-moss/10 max-h-96 overflow-y-auto pr-2">
          {activities.slice().sort((a: Activity, b: Activity) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((act: Activity) => {
            let label = "";
            if (act.category === 'transport') {
              const details = act.details as TransportDetails;
              label = `Travelled ${details.distance} km via ${details.mode.replace('car-', '')}`;
            } else if (act.category === 'energy') {
              const details = act.details as EnergyDetails;
              label = `Used ${details.electricity} kWh electricity and ${details.lpg} LPG refill(s)`;
            } else if (act.category === 'food') {
              const details = act.details as FoodDetails;
              label = `Followed a ${details.dietType.replace('-',' ')} diet`;
            } else if (act.category === 'waste') {
              const details = act.details as WasteDetails;
              label = `Generated ${details.level} waste (${details.segregated ? 'segregated' : 'unsegregated'})`;
            }

            return (
              <div key={act.id} className="py-3 flex justify-between items-center text-sm">
                <div>
                  <span className="text-xs text-graphite font-mono-journal block">
                    {new Date(act.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="font-semibold text-ink capitalize block">
                    {act.category}: <span className="font-normal text-graphite">{label}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-mono-journal text-xs font-bold text-clay">
                    +{act.emissions.toFixed(1)} kg CO₂e
                  </span>
                  <button
                    onClick={() => onDeleteActivity(act.id)}
                    className="p-1.5 text-graphite hover:text-red-600 rounded hover:bg-red-50 focus:ring-1 focus:ring-red-400"
                    title="Delete Entry"
                    aria-label={`Delete ${act.category} entry from ${act.date}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
