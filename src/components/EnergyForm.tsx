import React, { useState } from 'react';
import { EnergyFormInput } from '../utils/validation';
import { Calculator } from 'lucide-react';

/** Props for the EnergyForm component. */
interface EnergyFormProps {
  /** The current values inside the energy logging inputs */
  readonly value: Partial<EnergyFormInput>;
  /** Callback updater function to modify input state */
  readonly onChange: (updater: (prev: Partial<EnergyFormInput>) => Partial<EnergyFormInput>) => void;
  /** Map of validation errors for energy fields */
  readonly errors: Readonly<Record<string, string>>;
}

/**
 * Sub-component for rendering the Energy logging form.
 * 
 * Renders electricity kWh consumption and LPG cylinder refills inputs.
 * Includes a quick estimator tool.
 *
 * @param {EnergyFormProps} props - Component props containing form values, setter, and validation errors
 * @returns {React.ReactElement} The energy form inputs component
 */
function EnergyForm({ value, onChange, errors }: EnergyFormProps): React.ReactElement {
  const [showEstimator, setShowEstimator] = useState<boolean>(false);
  const [estHouseholdSize, setEstHouseholdSize] = useState<number>(2);
  const [estAcHours, setEstAcHours] = useState<number>(4);

  const applyEstimation = (): void => {
    // Estimating daily kWh: base load per member (2 kWh) + AC cooling load (1.8 kWh per hour)
    const computedKwh = (estHouseholdSize * 2.0) + (estAcHours * 1.8);
    onChange((prev: Partial<EnergyFormInput>): Partial<EnergyFormInput> => ({
      ...prev,
      electricity: Number(computedKwh.toFixed(1))
    }));
    setShowEstimator(false);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="e-electricity" className="text-sm font-medium text-ink">
            Electricity Consumption (kWh)
          </label>
          <button
            type="button"
            onClick={(): void => setShowEstimator(!showEstimator)}
            className="text-xs text-clay hover:underline flex items-center gap-1 font-semibold"
          >
            <Calculator className="w-3.5 h-3.5" />
            Estimate Assist
          </button>
        </div>

        {showEstimator && (
          <div className="p-4 bg-paper/60 border border-moss/30 rounded-lg space-y-3 mb-2">
            <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Quick Estimator</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1">
                <label htmlFor="est-members" className="text-xs text-graphite font-medium">Household Size</label>
                <select 
                  id="est-members"
                  value={estHouseholdSize}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => setEstHouseholdSize(Number(e.target.value))}
                  className="px-2 py-1 border border-moss/30 bg-white text-xs rounded"
                >
                  <option value="1">1 Person</option>
                  <option value="2">2 People</option>
                  <option value="3">3-4 People</option>
                  <option value="5">5+ People</option>
                </select>
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="est-ac" className="text-xs text-graphite font-medium">AC Usage Hours/Day</label>
                <select 
                  id="est-ac"
                  value={estAcHours}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => setEstAcHours(Number(e.target.value))}
                  className="px-2 py-1 border border-moss/30 bg-white text-xs rounded"
                >
                  <option value="0">No AC</option>
                  <option value="2">1-3 Hours</option>
                  <option value="6">4-8 Hours</option>
                  <option value="12">8+ Hours</option>
                </select>
              </div>
            </div>
            <button
              type="button"
              onClick={applyEstimation}
              className="w-full mt-2 py-1 bg-moss text-white font-medium rounded text-xs hover:bg-moss-dark transition"
            >
              Apply Estimate
            </button>
          </div>
        )}

        <input
          type="number"
          id="e-electricity"
          placeholder="e.g. 8"
          value={value.electricity === undefined ? '' : value.electricity}
          onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
            const val = e.target.value;
            onChange((prev: Partial<EnergyFormInput>): Partial<EnergyFormInput> => ({
              ...prev,
              electricity: val === '' ? undefined : Number(val)
            }));
          }}
          className={`w-full px-3 py-2 border rounded-md focus:border-clay font-mono-journal text-sm ${
            errors.electricity ? 'border-red-500 bg-red-50/20' : 'border-moss/45'
          }`}
          aria-invalid={!!errors.electricity}
          aria-describedby={errors.electricity ? "e-electricity-error" : "e-electricity-helper"}
        />
        {errors.electricity ? (
          <p id="e-electricity-error" className="text-xs text-red-600 font-medium" role="alert">
            {errors.electricity}
          </p>
        ) : (
          <span id="e-electricity-helper" className="text-xs text-graphite italic">
            Refer to your electricity bill or tap "Estimate Assist". Max: 500 kWh.
          </span>
        )}
      </div>

      <div className="flex flex-col space-y-2">
        <label htmlFor="e-lpg" className="text-sm font-medium text-ink">
          LPG Cylinder Refills (14.2kg Cylinder)
        </label>
        <input
          type="number"
          id="e-lpg"
          placeholder="e.g. 1"
          step="any"
          value={value.lpg === undefined ? '' : value.lpg}
          onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
            const val = e.target.value;
            onChange((prev: Partial<EnergyFormInput>): Partial<EnergyFormInput> => ({
              ...prev,
              lpg: val === '' ? undefined : Number(val)
            }));
          }}
          className={`w-full px-3 py-2 border rounded-md focus:border-clay font-mono-journal text-sm ${
            errors.lpg ? 'border-red-500 bg-red-50/20' : 'border-moss/45'
          }`}
          aria-invalid={!!errors.lpg}
          aria-describedby={errors.lpg ? "e-lpg-error" : "e-lpg-helper"}
        />
        {errors.lpg ? (
          <p id="e-lpg-error" className="text-xs text-red-600 font-medium" role="alert">
            {errors.lpg}
          </p>
        ) : (
          <span id="e-lpg-helper" className="text-xs text-graphite italic">
            Enter refills received today (fractional counts e.g., 0.5 are allowed). Max: 10.
          </span>
        )}
      </div>
    </div>
  );
}

export default EnergyForm;
