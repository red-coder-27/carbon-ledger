import React from 'react';
import { TransportFormInput } from '../utils/validation';
import { TransportMode } from '../data/emissionFactors';

interface TransportFormProps {
  readonly value: Partial<TransportFormInput>;
  readonly onChange: (updater: (prev: Partial<TransportFormInput>) => Partial<TransportFormInput>) => void;
  readonly errors: Record<string, string>;
}

/**
 * Sub-component for rendering the Transport logging form.
 * @param {TransportFormProps} props - Component props containing form values, setter, and validation errors
 * @returns {React.ReactElement} The transport form inputs
 */
export const TransportForm: React.FC<TransportFormProps> = ({ value, onChange, errors }) => {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col space-y-2">
        <label htmlFor="t-mode" className="text-sm font-medium text-ink">
          Mode of Travel
        </label>
        <select
          id="t-mode"
          value={value.mode || 'car-petrol'}
          onChange={(e) => onChange(prev => ({ ...prev, mode: e.target.value as TransportMode }))}
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
          onChange={(e) => {
            const val = e.target.value;
            onChange(prev => ({ ...prev, distance: val === '' ? undefined : Number(val) }));
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
};
