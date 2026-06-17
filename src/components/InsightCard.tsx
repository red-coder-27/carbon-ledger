import React from 'react';
import { Recommendation } from '../types';
import { TrendingDown, Bike, Zap, Apple, Trash2, HelpCircle } from 'lucide-react';

/** Props for the InsightCard component. */
interface InsightCardProps {
  /** The recommendation data object containing title, description, and savings */
  readonly recommendation: Recommendation;
}

/**
 * Renders an individual actionable carbon reduction recommendation card.
 * 
 * Includes visual category indicators, specific next steps, and estimated weekly savings stamps.
 *
 * @param {InsightCardProps} props - The component props containing the recommendation item
 * @returns {React.ReactElement} A responsive styled recommendation card
 */
function InsightCard({ recommendation }: InsightCardProps): React.ReactElement {
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

  const categoryColors: Record<string, string> = {
    transport: 'bg-clay/10 text-clay border-clay/30',
    energy: 'bg-moss/10 text-moss-dark border-moss/30',
    food: 'bg-ink/10 text-ink border-ink/30',
    waste: 'bg-leaf/10 text-leaf-dark border-leaf/30',
    none: 'bg-graphite/10 text-graphite border-graphite/30'
  };

  return (
    <div className="bg-white border border-moss/20 rounded-xl p-5 shadow-sm hover:border-moss/40 transition-colors flex flex-col md:flex-row justify-between items-start md:items-stretch gap-4">
      {/* Content Side */}
      <div className="space-y-3 flex-1">
        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              categoryColors[recommendation.category] ?? categoryColors.none
            }`}
          >
            {categoryLabels[recommendation.category] ?? categoryLabels.none}
          </span>
          <div className="flex items-center gap-1">
            {categoryIcons[recommendation.category] ?? categoryIcons.none}
          </div>
        </div>

        <h4 className="text-lg font-bold font-serif text-ink">{recommendation.title}</h4>
        <p className="text-sm text-graphite leading-relaxed">{recommendation.description}</p>
        
        {/* Specific Action Step */}
        <div className="p-3 bg-paper/40 rounded-lg border border-dashed border-moss/30 flex items-start space-x-2">
          <span className="text-xs font-bold text-clay uppercase tracking-wider mt-0.5 select-none">Action:</span>
          <p className="text-xs text-ink font-medium">{recommendation.actionableText}</p>
        </div>
      </div>

      {/* Carbon Savings Stamp side */}
      <div className="w-full md:w-36 flex md:flex-col items-center justify-between md:justify-center p-3 bg-paper/60 border border-moss/20 rounded-xl text-center md:self-center">
        <span className="text-[10px] text-graphite font-bold uppercase tracking-wider block">
          Est. Savings
        </span>
        <div className="flex items-baseline md:flex-col md:items-center justify-center space-x-1 md:space-x-0 my-1">
          <span className="text-2xl font-mono-journal font-bold text-leaf">
            ~{recommendation.savings}
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
  );
}

export default InsightCard;
