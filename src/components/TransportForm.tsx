import React from 'react';
import { TransportFormInput } from '../utils/validation';
import { TransportMode } from '../data/emissionFactors';

/** Props for the TransportForm component. */
interface TransportFormProps {
  /** The current values inside the transport logging inputs */
  readonly value: Partial<TransportFormInput>;
  /** Callback updater function to modify input state */
  readonly onChange: (updater: (prev: Partial<TransportFormInput>) => Partial<TransportFormInput>) => void;
  /** Map of validation errors for transport fields */
  readonly errors: Readonly<Record<string, string>>;
}

/**
 * Sub-component for rendering the Transport logging form.
 * 
 * Renders mode select dropdown and distance number inputs.
 *
 * @param {TransportFormProps} props - Component props containing form values, setter, and validation errors
 * @returns {React.ReactElement} The transport form inputs component
 */
function TransportForm({ value, onChange, errors }: TransportFormProps): React.ReactElement {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col space-y-2">
        <label htmlFor="t-mode" className="text-sm font-medium text-ink">
          Mode of Travel
        </label>
        <select
          id="t-mode"
          value={value.mode || 'car-petrol'}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => 
            onChange((prev: Partial<TransportFormInput>): Partial<TransportFormInput> => ({
              ...prev,
              mode: e.target.value as TransportMode
            }))
          }
          className="w-full px-3 py-2 border border-moss/45 bg-white rounded-md focus:border-clay text-sm"
        >
          <option value="car-petrol">Petrol Car</option>
          <option value="car-diesel">Diesel Car</option>
          <option value="car-ev">Electric Vehicle (EV)</option>
          <option value="two-wheeler">Two-Wheeler (Motorcycle/Scooter)</option>
          <option value="bus">Public Bus</option>
          <option value="train-metro">Train / Metro</option>
          <option value="flight-domestic">Domestic Flight</option>
          <option value="flight-international">International Flight</option>
          <option value="bicycle">Bicycle</option>
          <option value="walking">Walking</option>
        </select>
      </div>

      <div className="flex flex-col space-y-2">
        <label htmlFor="t-distance" className="text-sm font-medium text-ink">
          Distance Traveled (in km)
        </label>
        <input
          type="number"
          id="t-distance"
          placeholder="e.g. 15"
          value={value.distance === undefined ? '' : value.distance}
          onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
            const val = e.target.value;
            onChange((prev: Partial<TransportFormInput>): Partial<TransportFormInput> => ({
              ...prev,
              distance: val === '' ? undefined : Number(val)
            }));
          }}
          className={`w-full px-3 py-2 border rounded-md focus:border-clay font-mono-journal text-sm ${
            errors.distance ? 'border-red-500 bg-red-50/20' : 'border-moss/45'
          }`}
          aria-invalid={!!errors.distance}
          aria-describedby={errors.distance ? "t-distance-error" : "t-distance-helper"}
        />
        {errors.distance ? (
          <p id="t-distance-error" className="text-xs text-red-600 font-medium" role="alert">
            {errors.distance}
          </p>
        ) : (
          <span id="t-distance-helper" className="text-xs text-graphite italic">
            Average commute is 8–15 km. Maximum limit is 1000 km/day.
          </span>
        )}
      </div>
    </div>
  );
}

export default TransportForm;
