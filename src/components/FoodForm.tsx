import React from 'react';
import { FoodFormInput } from '../utils/validation';
import { DietType } from '../data/emissionFactors';

interface FoodFormProps {
  readonly value: Partial<FoodFormInput>;
  readonly onChange: (updater: (prev: Partial<FoodFormInput>) => Partial<FoodFormInput>) => void;
}

/**
 * Sub-component for rendering the Food logging form.
 * @param {FoodFormProps} props - Component props containing form values and setter
 * @returns {React.ReactElement} The food form radio buttons
 */
export const FoodForm: React.FC<FoodFormProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-4 animate-fade-in">
      <span className="block text-sm font-medium text-ink">
        Diet Pattern for the Day
      </span>
      <div className="space-y-3" role="radiogroup" aria-label="Diet Pattern Options">
        {[
          { value: 'vegan', label: 'Vegan', desc: 'No animal products (approx. 1.5 kg CO₂e/day)' },
          { value: 'vegetarian', label: 'Vegetarian', desc: 'Dairy but no meat or eggs (approx. 1.7 kg CO₂e/day)' },
          { value: 'eggetarian', label: 'Eggetarian', desc: 'Eggs and dairy, no meat (approx. 2.1 kg CO₂e/day)' },
          { value: 'non-veg-moderate', label: 'Moderate Non-Veg', desc: 'Some meat/fish (approx. 3.3 kg CO₂e/day)' },
          { value: 'non-veg-heavy', label: 'Heavy Non-Veg', desc: 'Frequent meat/red meat (approx. 5.6 kg CO₂e/day)' },
        ].map((option) => (
          <label
            key={option.value}
            className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
              value.dietType === option.value
                ? 'border-clay bg-clay/5'
                : 'border-moss/30 hover:bg-paper/30'
            }`}
          >
            <input
              type="radio"
              name="dietType"
              value={option.value}
              checked={value.dietType === option.value}
              onChange={() => onChange(() => ({ dietType: option.value as DietType }))}
              className="mt-1 mr-3 text-clay focus:ring-clay"
            />
            <div className="text-sm">
              <span className="block font-semibold text-ink">{option.label}</span>
              <span className="block text-xs text-graphite">{option.desc}</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};
