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
import { PenTool, Bike, Zap, Apple, Trash2, CheckCircle2 } from 'lucide-react';
import TransportForm from './TransportForm';
import EnergyForm from './EnergyForm';
import FoodForm from './FoodForm';
import WasteForm from './WasteForm';

/** Props for the LogActivityView component. */
interface LogActivityViewProps {
  /** Callback triggered when a new activity log has been successfully calculated and validated */
  readonly onAddActivity: (activity: Activity) => void;
}

type TabType = ActivityCategory;

/**
 * Renders the form panel to log daily activities for Transport, Energy, Food, and Waste.
 * 
 * Each category contains fields validated against schemas before being logged and stored.
 *
 * @param {LogActivityViewProps} props - Component props containing the callback to log activities
 * @returns {React.ReactElement} The form submission interface component
 */
function LogActivityView({ onAddActivity }: LogActivityViewProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState<TabType>('transport');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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

  // Error states
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleTabChange = (tab: TabType): void => {
    setActiveTab(tab);
    setErrors({});
  };

  const showSuccess = (categoryName: string): void => {
    setSuccessMessage(`Successfully logged today's ${categoryName} entry in your ledger!`);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (isSubmitting) return;

    // SECURITY: Prevent double form submission by locking the submitting state
    setIsSubmitting(true);
    setErrors({});

    // SECURITY: Debounce form submission by 500ms to allow animations/clicks to settle
    setTimeout((): void => {
      const id = crypto.randomUUID();
      let validatedDetails: TransportFormInput | EnergyFormInput | FoodFormInput | WasteFormInput | null = null;
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
            parsed.error.issues.forEach((err): void => {
              if (err.path[0]) errs[err.path[0] as string] = err.message;
            });
            setErrors(errs);
            setIsSubmitting(false);
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
            parsed.error.issues.forEach((err): void => {
              if (err.path[0]) errs[err.path[0] as string] = err.message;
            });
            setErrors(errs);
            setIsSubmitting(false);
            return;
          }
          if (parsed.data.electricity === 0 && parsed.data.lpg === 0) {
            setErrors({ electricity: "Please input either electricity consumption or LPG refill details." });
            setIsSubmitting(false);
            return;
          }
          validatedDetails = parsed.data;
        } else if (activeTab === 'food') {
          categoryName = 'Food';
          const parsed = foodSchema.safeParse(foodForm);
          if (!parsed.success) {
            const errs: Record<string, string> = {};
            parsed.error.issues.forEach((err): void => {
              if (err.path[0]) errs[err.path[0] as string] = err.message;
            });
            setErrors(errs);
            setIsSubmitting(false);
            return;
          }
          validatedDetails = parsed.data;
        } else if (activeTab === 'waste') {
          categoryName = 'Waste';
          const parsed = wasteSchema.safeParse(wasteForm);
          if (!parsed.success) {
            const errs: Record<string, string> = {};
            parsed.error.issues.forEach((err): void => {
              if (err.path[0]) errs[err.path[0] as string] = err.message;
            });
            setErrors(errs);
            setIsSubmitting(false);
            return;
          }
          validatedDetails = parsed.data;
        }

        if (!validatedDetails) {
          setIsSubmitting(false);
          return;
        }

        const emissions = calculateActivityEmissions(activeTab, validatedDetails);

        const newActivity: Activity = {
          id,
          date,
          category: activeTab,
          details: validatedDetails,
          emissions
        };

        try {
          onAddActivity(newActivity);
          showSuccess(categoryName);

          // Reset form variables (retain date for convenience)
          if (activeTab === 'transport') {
            setTransportForm({ mode: 'car-petrol', distance: undefined });
          } else if (activeTab === 'energy') {
            setEnergyForm({ electricity: undefined, lpg: undefined });
          } else if (activeTab === 'food') {
            // keep diet type
          } else if (activeTab === 'waste') {
            setWasteForm({ level: 'medium', segregated: false });
          }
        } catch (saveError: unknown) {
          const message = saveError instanceof Error ? saveError.message : 'Daily entry limit reached';
          console.error('[LogActivityView/handleSubmit/onAddActivity]', message);
          setErrors({ submit: message });
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('[LogActivityView/handleSubmit]', message);
      } finally {
        // SECURITY: Hold submit lock for 1 second after processing to prevent rapid duplicate posts
        setTimeout((): void => {
          setIsSubmitting(false);
        }, 1000);
      }
    }, 500);
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
              onChange={(e): void => setDate(e.target.value)}
              className="w-full md:w-64 px-3 py-2 border border-moss/44 bg-paper/30 rounded-md focus:border-clay focus:ring-1 focus:ring-clay font-mono-journal text-sm"
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
                onClick={(): void => handleTabChange('transport')}
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
                onClick={(): void => handleTabChange('energy')}
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
                onClick={(): void => handleTabChange('food')}
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
                onClick={(): void => handleTabChange('waste')}
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

          {/* Form fields rendering */}
          {activeTab === 'transport' && (
            <TransportForm 
              value={transportForm} 
              onChange={setTransportForm} 
              errors={errors} 
            />
          )}

          {activeTab === 'energy' && (
            <EnergyForm 
              value={energyForm} 
              onChange={setEnergyForm} 
              errors={errors} 
            />
          )}

          {activeTab === 'food' && (
            <FoodForm 
              value={foodForm} 
              onChange={setFoodForm} 
            />
          )}

          {activeTab === 'waste' && (
            <WasteForm 
              value={wasteForm} 
              onChange={setWasteForm} 
            />
          )}

          {/* Submit error feedback */}
          {errors.submit && (
            <p className="text-sm text-red-600 font-semibold mt-2" role="alert">
              ⚠️ {errors.submit}
            </p>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 bg-clay text-white font-serif-journal font-bold rounded-lg shadow-sm hover:bg-clay-dark focus:ring-4 focus:ring-clay/30 transition duration-150 text-base flex items-center justify-center gap-2 ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Recording entry...</span>
              </>
            ) : (
              <span>Record Entry in Ledger</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LogActivityView;
