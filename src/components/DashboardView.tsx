import React, { useState, useMemo } from 'react';
import { Activity, ActivityCategory } from '../types';
import TreeRingChart from './TreeRingChart';
import { NATIONAL_AVERAGE_WEEKLY_CO2, NATIONAL_AVERAGE_MONTHLY_CO2 } from '../data/emissionFactors';
import { aggregateEmissions } from '../utils/calculations';
import { BookOpen, ArrowRight, TrendingDown, AlertCircle } from 'lucide-react';
import ErrorBoundary from './ErrorBoundary';

/** Props for the DashboardView component. */
interface DashboardViewProps {
  /** Array of logged activities to compile summaries and concentric tree rings */
  readonly activities: readonly Activity[];
  /** Callback triggering redirect navigation to the activity logging view */
  readonly onNavigateToLog: () => void;
  /** Callback triggering redirect navigation to the insights recommendations view */
  readonly onNavigateToInsights: () => void;
}

/**
 * Renders the dashboard view including the signature tree-ring chart, carbon footprint totals, and baseline comparison.
 *
 * @param {DashboardViewProps} props - Props containing activities and navigation handlers
 * @returns {React.ReactElement} The dashboard overview page component
 */
function DashboardView({
  activities,
  onNavigateToLog,
  onNavigateToInsights
}: DashboardViewProps): React.ReactElement {
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  // Filter activities based on the selected period (relative to today's date)
  const filteredActivities = useMemo((): readonly Activity[] => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // end of today
    
    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    if (period === 'week') {
      cutoff.setDate(today.getDate() - 7);
    } else {
      cutoff.setDate(today.getDate() - 30);
    }

    return activities.filter((act: Activity): boolean => {
      const parts = act.date.split('-');
      if (parts.length !== 3) return false;
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const actDate = new Date(year, month, day, 12, 0, 0); // Noon local time
      return actDate >= cutoff && actDate <= today;
    });
  }, [activities, period]);

  // Aggregate emissions for the filtered activities
  const emissionsSummary = useMemo(() => {
    return aggregateEmissions(filteredActivities);
  }, [filteredActivities]);

  // Baseline Comparison
  const baseline = period === 'week' ? NATIONAL_AVERAGE_WEEKLY_CO2 : NATIONAL_AVERAGE_MONTHLY_CO2;
  const percentOfAverage = Math.round((emissionsSummary.total / baseline) * 100);
  const isBelowAverage = emissionsSummary.total <= baseline;

  // Dynamic summary sentence generation
  const summarySentence = useMemo((): string => {
    if (filteredActivities.length === 0) {
      return "Your journal is empty for this period. Log today's activities to see your environmental footprint.";
    }

    const { transport, energy, food, waste, total } = emissionsSummary;
    if (total === 0) {
      return "You logged zero emissions for this period. Great job on active travel and green choices!";
    }

    // Find highest category
    const categories: { readonly name: ActivityCategory; readonly val: number }[] = [
      { name: 'transport', val: transport },
      { name: 'energy', val: energy },
      { name: 'food', val: food },
      { name: 'waste', val: waste }
    ];
    const sortedCategories = [...categories].sort((a, b) => b.val - a.val);
    const primary = sortedCategories[0];
    const pct = Math.round((primary.val / total) * 100);

    let advice = "";
    if (primary.name === 'transport') {
      advice = "Commuting via fossil fuel vehicles appears to be your primary carbon driver. Try public transit or carpooling.";
    } else if (primary.name === 'energy') {
      advice = "Household electricity and cooking LPG represent your largest footprint. Consider raising your AC temp or unplugging standby devices.";
    } else if (primary.name === 'food') {
      advice = "Diet choices are driving a major portion of your emissions. Swapping a couple of meat days for vegetarian plates could significantly shave this down.";
    } else if (primary.name === 'waste') {
      advice = "Waste accumulation is your highest factor. Start segregating your kitchen scraps to prevent high landfill methane generation.";
    }

    return `Your ${primary.name} footprint is your highest emissions driver at ${primary.val.toFixed(1)} kg CO₂e (${pct}% of total). ${advice}`;
  }, [filteredActivities, emissionsSummary]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-sans">
      
      {/* Welcome Journal Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-moss/20 pb-4">
        <div>
          <h2 className="text-4xl font-serif text-ink font-bold flex items-center gap-2">
            <BookOpen className="text-clay w-8 h-8" />
            Field Ledger Summary
          </h2>
          <p className="text-graphite text-sm mt-1">
            "We do not inherit the earth from our ancestors; we borrow it from our children." — Indigene Proverbs
          </p>
        </div>

        {/* Period Selector */}
        <div className="mt-4 md:mt-0 flex items-center space-x-1 border border-moss/30 p-0.5 rounded-lg bg-paper-dark">
          <button
            onClick={(): void => setPeriod('week')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              period === 'week' 
                ? 'bg-clay text-white shadow-sm' 
                : 'text-graphite hover:text-ink'
            }`}
            aria-pressed={period === 'week'}
          >
            Weekly view
          </button>
          <button
            onClick={(): void => setPeriod('month')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              period === 'month' 
                ? 'bg-clay text-white shadow-sm' 
                : 'text-graphite hover:text-ink'
            }`}
            aria-pressed={period === 'month'}
          >
            Monthly view
          </button>
        </div>
      </div>

      {/* Main Dashboard Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Tree Ring Visual (Signature Element) */}
        <div className="lg:col-span-7 bg-white border-2 border-moss/20 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-moss/60" />
          <h3 className="text-sm font-semibold text-ink uppercase tracking-wider self-start mb-4">
            Carbon Rings breakdown
          </h3>
          <ErrorBoundary>
            <TreeRingChart
              transport={emissionsSummary.transport}
              energy={emissionsSummary.energy}
              food={emissionsSummary.food}
              waste={emissionsSummary.waste}
              total={emissionsSummary.total}
            />
          </ErrorBoundary>
        </div>

        {/* Context stats and summary */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          
          {/* Comparison Card */}
          <div className="bg-white border-2 border-moss/20 rounded-xl p-6 shadow-sm relative overflow-hidden flex-1">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-clay/60" />
            <h3 className="text-sm font-semibold text-ink uppercase tracking-wider mb-3">
              National Comparison
            </h3>

            <div className="space-y-4">
              <div>
                <span className="text-xs text-graphite block">Average Indian Citizen ({period})</span>
                <span className="text-lg font-mono-journal font-bold text-graphite">
                  {baseline.toFixed(0)} kg CO₂e
                </span>
                <span className="text-[10px] text-graphite block italic -mt-0.5">
                  * Based on an estimated average monthly carbon footprint of 1.9 tons per capita in India.
                </span>
              </div>

              <div className="pt-2 border-t border-moss/10">
                <span className="text-xs text-graphite block">Your Footprint</span>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-3xl font-mono-journal font-bold text-ink">
                    {emissionsSummary.total.toFixed(1)}
                  </span>
                  <span className="text-xs text-graphite">kg CO₂e</span>
                </div>
              </div>

              {/* Graphical bar comparing to average */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Usage relative to average</span>
                  <span className={isBelowAverage ? 'text-leaf' : 'text-clay'}>
                    {percentOfAverage}%
                  </span>
                </div>
                <div className="w-full bg-paper border border-moss/20 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      isBelowAverage ? 'bg-leaf' : 'bg-clay'
                    }`}
                    style={{ width: `${Math.min(percentOfAverage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Status Message */}
              <div className="flex items-center space-x-2 pt-2 text-xs">
                {isBelowAverage ? (
                  <>
                    <TrendingDown className="text-leaf w-4 h-4 flex-shrink-0" />
                    <span className="text-leaf font-medium">
                      You are logging {100 - percentOfAverage}% less than the average baseline.
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="text-clay w-4 h-4 flex-shrink-0" />
                    <span className="text-clay font-medium">
                      You are exceeding the baseline by {percentOfAverage - 100}%. Check Insights to reduce!
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick CTA panel */}
          <div className="bg-paper-dark border-2 border-moss/20 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <h4 className="text-xs font-semibold text-ink uppercase tracking-wider mb-2">
              Log Entries
            </h4>
            <p className="text-xs text-graphite mb-4">
              Regular logging helps trace more accurate carbon curves and unlock milestone journal badges.
            </p>
            <button
              onClick={onNavigateToLog}
              className="w-full py-2 px-4 bg-clay hover:bg-clay-dark text-white font-serif-journal font-bold rounded-lg text-sm transition-colors flex items-center justify-center gap-2 group shadow-sm"
            >
              Log Today's Activities
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>
      </div>

      {/* Dynamic Summary Sentence banner */}
      <div className="bg-white border-2 border-moss/20 rounded-xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-ink" />
        <h3 className="text-sm font-semibold text-ink uppercase tracking-wider mb-2">
          Journal Insights Summary
        </h3>
        <p className="text-ink text-sm md:text-base leading-relaxed italic">
          "{summarySentence}"
        </p>
        {filteredActivities.length > 0 && (
          <button
            onClick={onNavigateToInsights}
            className="mt-3 text-xs text-clay font-bold hover:underline inline-flex items-center gap-1"
          >
            View Tailored Recommendations <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

    </div>
  );
}

export default DashboardView;
