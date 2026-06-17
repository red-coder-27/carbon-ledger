import React from 'react';
import { WasteFormInput } from '../utils/validation';
import { WasteLevel } from '../data/emissionFactors';

/** Props for the WasteForm component. */
interface WasteFormProps {
  /** The current values inside the waste logging inputs */
  readonly value: Partial<WasteFormInput>;
  /** Callback updater function to modify input state */
  readonly onChange: (updater: (prev: Partial<WasteFormInput>) => Partial<WasteFormInput>) => void;
}

/**
 * Sub-component for rendering the Waste logging form.
 * 
 * Renders estimated waste volume select box and segregation checkbox.
 *
 * @param {WasteFormProps} props - Component props containing form values and setter
 * @returns {React.ReactElement} The waste form inputs component
 */
function WasteForm({ value, onChange }: WasteFormProps): React.ReactElement {
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col space-y-2">
        <label htmlFor="w-level" className="text-sm font-medium text-ink">
          Estimated Waste Volume (per day)
        </label>
        <select
          id="w-level"
          value={value.level || 'medium'}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => 
            onChange((prev: Partial<WasteFormInput>): Partial<WasteFormInput> => ({
              ...prev,
              level: e.target.value as WasteLevel
            }))
          }
          className="w-full px-3 py-2 border border-moss/45 bg-white rounded-md focus:border-clay text-sm"
        >
          <option value="low">Low (less than 1 kg)</option>
          <option value="medium">Medium (1 - 2 kg)</option>
          <option value="high">High (more than 2 kg)</option>
        </select>
      </div>

      <div className="flex items-start p-4 bg-paper/30 border border-moss/30 rounded-lg">
        <div className="flex items-center h-5">
          <input
            id="w-segregated"
            type="checkbox"
            checked={!!value.segregated}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => 
              onChange((prev: Partial<WasteFormInput>): Partial<WasteFormInput> => ({
                ...prev,
                segregated: e.target.checked
              }))
            }
            className="w-4 h-4 text-clay border-moss/40 rounded focus:ring-clay"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="w-segregated" className="font-semibold text-ink block">
            Waste Segregation / Recycling Done
          </label>
          <span className="text-xs text-graphite block">
            Wet waste composted or separated, and dry waste (paper, plastic, glass) cleaned and recycled.
          </span>
        </div>
      </div>
    </div>
  );
}

export default WasteForm;
