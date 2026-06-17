import React, { useMemo } from 'react';
import { Activity } from '../types';
import { generateInsights } from '../utils/insights';
import { Lightbulb, TrendingDown, Bike, Zap, Apple, Trash2, HelpCircle } from 'lucide-react';

interface InsightsViewProps {
  readonly activities: Activity[];
}

/**
 * Renders the tailored recommendations and carbon insights based on logged activities.
 * @param {InsightsViewProps} props - The component props containing the activity log
 * @returns {React.ReactElement} The personal insights page
 */
export const InsightsView: React.FC<InsightsViewProps> = ({ activities }) => {
  const insights = useMemo(() => {
    return generateInsights(activities);
  }, [activities]);

  const { highestCategory, categoryTotals, recommendations } = insights;

  const categoryLabels = {
    transport: 'Transport',
    energy: 'Energy',
    food: 'Diet',
    waste: 'Waste',
    none: 'None'
  };

  const categoryIcons = {
    transport: <Bike className="w-5 h-5 text-clay" />,
    energy: <Zap className="w-5 h-5 text-moss" />,
    food: <Apple className="w-5 h-5 text-ink" />,
    waste: <Trash2 className="w-5 h-5 text-leaf" />,
    none: <HelpCircle className="w-5 h-5 text-graphite" />
  };

  const categoryColors = {
    transport: 'bg-clay/10 text-clay border-clay/30',
    energy: 'bg-moss/10 text-moss-dark border-moss/30',
    food: 'bg-ink/10 text-ink border-ink/30',
    waste: 'bg-leaf/10 text-leaf-dark border-leaf/30',
    none: 'bg-graphite/10 text-graphite border-graphite/30'
  };

  return (
    <div className="max-w-3xl mx-auto font-sans space-y-6">
      
      {/* Title */}
      <div className="flex items-center space-x-3 mb-6">
        <Lightbulb className="text-clay w-7 h-7" />
        <h2 className="text-3xl font-serif text-ink font-bold">Personal Insights</h2>
      </div>

      <p className="text-graphite leading-relaxed">
        Based on your logged activities, our analysis engine evaluates carbon drivers in your daily ledger and produces tailored reduction plans.
      </p>

      {/* Highest Driver Banner */}
      {highestCategory !== 'none' && (
        <div className="bg-white border-2 border-moss/20 rounded-xl p-6 shadow-sm relative overflow-hidden flex items-center justify-between">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-clay" />
          <div className="space-y-1">
            <span className="text-xs text-graphite uppercase tracking-wider block">Primary Footprint Driver</span>
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-bold font-serif text-ink capitalize">
                {categoryLabels[highestCategory]}
              </h3>
              {categoryIcons[highestCategory]}
            </div>
            <p className="text-sm text-graphite">
              Your logged {categoryLabels[highestCategory].toLowerCase()} activity emitted{' '}
              <span className="font-semibold text-ink font-mono-journal">
                {categoryTotals[highestCategory].toFixed(1)} kg
              </span>{' '}
              CO₂e over the last 7 active ledger days.
            </p>
          </div>
          <div className="hidden sm:block text-right">
            <span className="text-xs text-graphite">Percentage share</span>
            <span className="block text-3xl font-bold font-serif-journal text-clay">
              {categoryTotals[highestCategory] > 0
                ? Math.round(
                    (categoryTotals[highestCategory] /
                      Object.values(categoryTotals).reduce((a, b) => a + b, 0)) *
                      100
                  )
                : 0}
              %
            </span>
          </div>
        </div>
      )}

      {/* Recommendations List */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif text-ink font-semibold">Actionable Recommendations</h3>
        
        {recommendations.length === 0 ? (
          <p className="text-sm text-graphite italic">No recommendations calculated yet.</p>
        ) : (
          recommendations.map((rec) => (
            <div
              key={rec.id}
              className="bg-white border border-moss/20 rounded-xl p-5 shadow-sm hover:border-moss/40 transition-colors flex flex-col md:flex-row justify-between items-start md:items-stretch gap-4"
            >
              {/* Content Side */}
              <div className="space-y-3 flex-1">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      categoryColors[rec.category]
                    }`}
                  >
                    {categoryLabels[rec.category]}
                  </span>
                  <div className="flex items-center gap-1">
                    {categoryIcons[rec.category]}
                  </div>
                </div>

                <h4 className="text-lg font-bold font-serif text-ink">{rec.title}</h4>
                <p className="text-sm text-graphite leading-relaxed">{rec.description}</p>
                
                {/* Specific Action Step */}
                <div className="p-3 bg-paper/40 rounded-lg border border-dashed border-moss/30 flex items-start space-x-2">
                  <span className="text-xs font-bold text-clay uppercase tracking-wider mt-0.5 select-none">Action:</span>
                  <p className="text-xs text-ink font-medium">{rec.actionableText}</p>
                </div>
              </div>

              {/* Carbon Savings Stamp side */}
              <div className="w-full md:w-36 flex md:flex-col items-center justify-between md:justify-center p-3 bg-paper/60 border border-moss/20 rounded-xl text-center md:self-center">
                <span className="text-[10px] text-graphite font-bold uppercase tracking-wider block">
                  Est. Savings
                </span>
                <div className="flex items-baseline md:flex-col md:items-center justify-center space-x-1 md:space-x-0 my-1">
                  <span className="text-2xl font-mono-journal font-bold text-leaf">
                    ~{rec.savings}
                  </span>
                  <span className="text-[10px] font-medium text-graphite font-mono-journal">
                    kg CO₂e/wk
                  </span>
                </div>
                <div className="flex items-center gap-0.5 text-xs text-leaf font-bold">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Reduce</span>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};
