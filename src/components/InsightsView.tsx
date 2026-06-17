import React, { useMemo } from 'react';
import { Activity, Recommendation } from '../types';
import { generateInsights } from '../utils/insights';
import InsightCard from './InsightCard';
import { Lightbulb, Bike, Zap, Apple, Trash2, HelpCircle } from 'lucide-react';

/** Props for the InsightsView component. */
interface InsightsViewProps {
  /** Array of logged daily activity entries used to generate custom footprint recommendations */
  readonly activities: readonly Activity[];
}

/**
 * Renders the tailored recommendations and carbon insights based on logged activities.
 * 
 * Analyzes carbon drivers from the last 7 days and ranks actionable recommendations.
 *
 * @param {InsightsViewProps} props - Component props containing user activities
 * @returns {React.ReactElement} The personal insights page
 */
function InsightsView({ activities }: InsightsViewProps): React.ReactElement {
  const insights = useMemo(() => {
    return generateInsights(activities);
  }, [activities]);

  const { highestCategory, categoryTotals, recommendations } = insights;

  const categoryLabels: Record<string, string> = {
    transport: 'Transport',
    energy: 'Energy',
    food: 'Diet',
    waste: 'Waste',
    none: 'None'
  };

  const categoryIcons: Record<string, React.ReactElement> = {
    transport: <Bike className="w-5 h-5 text-clay" />,
    energy: <Zap className="w-5 h-5 text-moss" />,
    food: <Apple className="w-5 h-5 text-ink" />,
    waste: <Trash2 className="w-5 h-5 text-leaf" />,
    none: <HelpCircle className="w-5 h-5 text-graphite" />
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
                {categoryLabels[highestCategory] ?? 'None'}
              </h3>
              {categoryIcons[highestCategory] ?? categoryIcons.none}
            </div>
            <p className="text-sm text-graphite">
              Your logged {(categoryLabels[highestCategory] ?? '').toLowerCase()} activity emitted{' '}
              <span className="font-semibold text-ink font-mono-journal">
                {(categoryTotals[highestCategory] ?? 0).toFixed(1)} kg
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
                      Object.values(categoryTotals).reduce((a: number, b: number): number => a + b, 0)) *
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
          recommendations.map((rec: Recommendation): React.ReactElement => (
            <InsightCard key={rec.id} recommendation={rec} />
          ))
        )}
      </div>

    </div>
  );
}

export default InsightsView;
