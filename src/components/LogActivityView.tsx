import React, { useState } from 'react';
import { calculateActivityEmissions } from '../utils/calculations';
import { 
  transportSchema, 
  energySchema, 
  foodSchema, 
  wasteSchema,
  TransportFormInput,
  EnergyFormInput,
  FoodFormInput,
  WasteFormInput
} from '../utils/validation';
import { Activity, ActivityCategory } from '../types';
import { TransportMode, DietType, WasteLevel } from '../data/emissionFactors';
import { PenTool, Bike, Zap, Apple, Trash2, CheckCircle2, Calculator } from 'lucide-react';

interface LogActivityViewProps {
  onAddActivity: (activity: Activity) => void;
}

type TabType = ActivityCategory;

export const LogActivityView: React.FC<LogActivityViewProps> = ({ onAddActivity }) => {
  const [activeTab, setActiveTab] = useState<TabType>('transport');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [transportForm, setTransportForm] = useState<Partial<TransportFormInput>>({
    mode: 'car-petrol',
    distance: undefined
  });
  const [energyForm, setEnergyForm] = useState<Partial<EnergyFormInput>>({
    electricity: undefined,
    lpg: undefined
  });
  const [foodForm, setFoodForm] = useState<Partial<FoodFormInput>>({
    dietType: 'vegetarian'
  });
  const [wasteForm, setWasteForm] = useState<Partial<WasteFormInput>>({
    level: 'medium',
    segregated: false
  });

  // Energy Estimator Helper State
  const [showEstimator, setShowEstimator] = useState(false);
  const [estHouseholdSize, setEstHouseholdSize] = useState<number>(2);
  const [estAcHours, setEstAcHours] = useState<number>(4);

  // Error states
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Trigger helper calculation for energy
  const applyEstimation = () => {
    // Estimating daily kWh: base load per member (2 kWh) + AC cooling load (1.8 kWh per hour)
    const computedKwh = (estHouseholdSize * 2.0) + (estAcHours * 1.8);
    setEnergyForm(prev => ({
      ...prev,
      electricity: Number(computedKwh.toFixed(1))
    }));
    setShowEstimator(false);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setErrors({});
  };

  const showSuccess = (categoryName: string) => {
    setSuccessMessage(`Successfully logged today's ${categoryName} entry in your ledger!`);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const id = crypto.randomUUID();
    let validatedDetails: any = null;
    let categoryName = '';

    try {
      if (activeTab === 'transport') {
        categoryName = 'Transport';
        const parsed = transportSchema.safeParse({
          mode: transportForm.mode,
          distance: transportForm.distance === undefined ? undefined : Number(transportForm.distance)
        });
        if (!parsed.success) {
          const errs: Record<string, string> = {};
          parsed.error.issues.forEach(err => {
            if (err.path[0]) errs[err.path[0] as string] = err.message;
          });
          setErrors(errs);
          return;
        }
        validatedDetails = parsed.data;
      } else if (activeTab === 'energy') {
        categoryName = 'Energy';
        const parsed = energySchema.safeParse({
          electricity: energyForm.electricity === undefined ? 0 : Number(energyForm.electricity),
          lpg: energyForm.lpg === undefined ? 0 : Number(energyForm.lpg)
        });
        if (!parsed.success) {
          const errs: Record<string, string> = {};
          parsed.error.issues.forEach(err => {
            if (err.path[0]) errs[err.path[0] as string] = err.message;
          });
          setErrors(errs);
          return;
        }
        // At least one field must be greater than zero to be useful
        if (parsed.data.electricity === 0 && parsed.data.lpg === 0) {
          setErrors({ electricity: "Please input either electricity consumption or LPG refill details." });
          return;
        }
        validatedDetails = parsed.data;
      } else if (activeTab === 'food') {
        categoryName = 'Food';
        const parsed = foodSchema.safeParse(foodForm);
        if (!parsed.success) {
          const errs: Record<string, string> = {};
          parsed.error.issues.forEach(err => {
            if (err.path[0]) errs[err.path[0] as string] = err.message;
          });
          setErrors(errs);
          return;
        }
        validatedDetails = parsed.data;
      } else if (activeTab === 'waste') {
        categoryName = 'Waste';
        const parsed = wasteSchema.safeParse(wasteForm);
        if (!parsed.success) {
          const errs: Record<string, string> = {};
          parsed.error.issues.forEach(err => {
            if (err.path[0]) errs[err.path[0] as string] = err.message;
          });
          setErrors(errs);
          return;
        }
        validatedDetails = parsed.data;
      }

      // Calculate emissions
      const emissions = calculateActivityEmissions(activeTab, validatedDetails);

      const newActivity: Activity = {
        id,
        date,
        category: activeTab,
        details: validatedDetails,
        emissions
      };

      onAddActivity(newActivity);
      showSuccess(categoryName);

      // Reset form variables (retain date for convenience)
      if (activeTab === 'transport') {
        setTransportForm({ mode: 'car-petrol', distance: undefined });
      } else if (activeTab === 'energy') {
        setEnergyForm({ electricity: undefined, lpg: undefined });
      } else if (activeTab === 'food') {
        // keep diet
      } else if (activeTab === 'waste') {
        setWasteForm({ level: 'medium', segregated: false });
      }

    } catch (err) {
      console.error('Submission error:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto font-sans">
      <div className="flex items-center space-x-3 mb-6">
        <PenTool className="text-clay w-7 h-7" />
        <h2 className="text-3xl font-serif text-ink font-bold">Log Daily Activities</h2>
      </div>

      <p className="text-graphite mb-6 leading-relaxed">
        Record your observations in your naturalist field journal. The ledger supports logging daily travel, household power metrics, diet choices, and waste segregation outputs.
      </p>

      {successMessage && (
        <div 
          className="mb-6 p-4 bg-leaf/10 border border-leaf text-ink rounded-lg flex items-center space-x-3 animate-fade-in"
          role="alert"
        >
          <CheckCircle2 className="text-leaf w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {/* Form Container */}
      <div className="bg-white border-2 border-moss/20 rounded-xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        {/* Ledger Page Line Deco */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-clay/60" />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Shared Date Selection */}
          <div className="flex flex-col space-y-2">
            <label htmlFor="log-date" className="text-sm font-semibold text-ink uppercase tracking-wider">
              Observation Date
            </label>
            <input
              type="date"
              id="log-date"
              value={date}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
              className="w-full md:w-64 px-3 py-2 border border-moss/40 bg-paper/30 rounded-md focus:border-clay focus:ring-1 focus:ring-clay font-mono-journal text-sm"
              required
            />
          </div>

          {/* Category Tab Bar */}
          <div>
            <span className="block text-sm font-semibold text-ink uppercase tracking-wider mb-2">
              Select Category
            </span>
            <div className="grid grid-cols-4 gap-2 border border-moss/30 p-1 rounded-lg bg-paper/50">
              <button
                type="button"
                onClick={() => handleTabChange('transport')}
                className={`py-2 px-1 text-xs md:text-sm font-medium rounded-md flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 transition-all ${
                  activeTab === 'transport' 
                    ? 'bg-clay text-white shadow-sm' 
                    : 'text-graphite hover:text-ink hover:bg-moss/10'
                }`}
                aria-pressed={activeTab === 'transport'}
              >
                <Bike className="w-4 h-4" />
                <span>Transport</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('energy')}
                className={`py-2 px-1 text-xs md:text-sm font-medium rounded-md flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 transition-all ${
                  activeTab === 'energy' 
                    ? 'bg-clay text-white shadow-sm' 
                    : 'text-graphite hover:text-ink hover:bg-moss/10'
                }`}
                aria-pressed={activeTab === 'energy'}
              >
                <Zap className="w-4 h-4" />
                <span>Energy</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('food')}
                className={`py-2 px-1 text-xs md:text-sm font-medium rounded-md flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 transition-all ${
                  activeTab === 'food' 
                    ? 'bg-clay text-white shadow-sm' 
                    : 'text-graphite hover:text-ink hover:bg-moss/10'
                }`}
                aria-pressed={activeTab === 'food'}
              >
                <Apple className="w-4 h-4" />
                <span>Diet</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('waste')}
                className={`py-2 px-1 text-xs md:text-sm font-medium rounded-md flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 transition-all ${
                  activeTab === 'waste' 
                    ? 'bg-clay text-white shadow-sm' 
                    : 'text-graphite hover:text-ink hover:bg-moss/10'
                }`}
                aria-pressed={activeTab === 'waste'}
              >
                <Trash2 className="w-4 h-4" />
                <span>Waste</span>
              </button>
            </div>
          </div>

          {/* TRANSPORT FORM FIELDS */}
          {activeTab === 'transport' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col space-y-2">
                <label htmlFor="t-mode" className="text-sm font-medium text-ink">
                  Mode of Travel
                </label>
                <select
                  id="t-mode"
                  value={transportForm.mode}
                  onChange={(e) => setTransportForm(prev => ({ ...prev, mode: e.target.value as TransportMode }))}
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
                  value={transportForm.distance === undefined ? '' : transportForm.distance}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTransportForm(prev => ({ ...prev, distance: val === '' ? undefined : Number(val) }));
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
          )}

          {/* ENERGY FORM FIELDS */}
          {activeTab === 'energy' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="e-electricity" className="text-sm font-medium text-ink">
                    Electricity Consumption (kWh)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowEstimator(!showEstimator)}
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
                          onChange={(e) => setEstHouseholdSize(Number(e.target.value))}
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
                          onChange={(e) => setEstAcHours(Number(e.target.value))}
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
                  value={energyForm.electricity === undefined ? '' : energyForm.electricity}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEnergyForm(prev => ({ ...prev, electricity: val === '' ? undefined : Number(val) }));
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
                    Refer to your electricity bill or tap "Estimate Assist". Max: 5000 kWh.
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
                  value={energyForm.lpg === undefined ? '' : energyForm.lpg}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEnergyForm(prev => ({ ...prev, lpg: val === '' ? undefined : Number(val) }));
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
          )}

          {/* DIET FORM FIELDS */}
          {activeTab === 'food' && (
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
                      foodForm.dietType === option.value
                        ? 'border-clay bg-clay/5'
                        : 'border-moss/30 hover:bg-paper/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="dietType"
                      value={option.value}
                      checked={foodForm.dietType === option.value}
                      onChange={() => setFoodForm({ dietType: option.value as DietType })}
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
          )}

          {/* WASTE FORM FIELDS */}
          {activeTab === 'waste' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex flex-col space-y-2">
                <label htmlFor="w-level" className="text-sm font-medium text-ink">
                  Estimated Waste Volume (per day)
                </label>
                <select
                  id="w-level"
                  value={wasteForm.level}
                  onChange={(e) => setWasteForm(prev => ({ ...prev, level: e.target.value as WasteLevel }))}
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
                    checked={wasteForm.segregated}
                    onChange={(e) => setWasteForm(prev => ({ ...prev, segregated: e.target.checked }))}
                    className="w-4 h-4 text-clay border-moss/40 rounded focus:ring-clay"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="w-segregated" className="font-semibold text-ink block">
                    Waste Segregation / Recycling Done
                  </label>
                  <span className="text-xs text-graphite">
                    Wet waste composted or separated, and dry waste (paper, plastic, glass) cleaned and recycled.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className="w-full py-3 bg-clay text-white font-serif-journal font-bold rounded-lg shadow-sm hover:bg-clay-dark focus:ring-4 focus:ring-clay/30 transition duration-150 text-base"
          >
            Record Entry in Ledger
          </button>
        </form>
      </div>
    </div>
  );
};
