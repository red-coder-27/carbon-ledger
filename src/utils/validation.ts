import { z } from 'zod';

// SECURITY: Sanitized safe string schema to prevent script injection
const safeString = z.string()
  .trim()
  .max(1024, "Input too long")
  .refine(
    val => !/[<>{}()\[\]\\\/]/.test(val),
    "Input contains invalid characters"
  );

// SECURITY: Coerced safe number validation to prevent NaN, Infinity, and overflow
const safeCoercedNumber = (maxVal: number, errMsg: string, invalidMsg: string) => z.preprocess(
  (val) => {
    if (typeof val === 'string' && val === '') return 0;
    const num = Number(val);
    return isNaN(num) ? val : num;
  },
  z.number({ invalid_type_error: invalidMsg })
    .finite("Must be a finite number")
    .nonnegative("Value cannot be negative")
    .max(maxVal, errMsg)
);

// SECURITY: Safe LPG integer checks
const safeLpgNumber = z.preprocess(
  (val) => {
    if (typeof val === 'string' && val === '') return 0;
    const num = Number(val);
    return isNaN(num) ? val : num;
  },
  z.number({ invalid_type_error: "LPG refills must be a number" })
    .int("LPG refills must be an integer")
    .finite("Must be a finite number")
    .nonnegative("LPG refills cannot be negative")
    .max(10, "LPG refills cannot exceed 10 cylinders")
);

// SECURITY: Prevent date manipulation (e.g. logging dates in the far future or past)
const safeDateString = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (must be YYYY-MM-DD)")
  .refine(val => {
    const d = new Date(val);
    if (isNaN(d.getTime())) return false;
    const now = new Date();
    // Allow up to 1 day in the future (timezone wiggle room)
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const oneYearInMs = 365 * 24 * 60 * 60 * 1000;
    const diff = d.getTime() - now.getTime();
    if (diff > oneDayInMs) return false;
    const age = now.getTime() - d.getTime();
    if (age > oneYearInMs) return false;
    return true;
  }, "Date must be valid, not more than 1 day in the future and not older than 1 year");

/**
 * Validation schema for transport activities.
 */
export const transportSchema = z.object({
  mode: z.enum([
    'car-petrol',
    'car-diesel',
    'car-ev',
    'two-wheeler',
    'bus',
    'train-metro',
    'flight-domestic',
    'flight-international',
    'bicycle',
    'walking'
  ], { errorMap: () => ({ message: "Please select a valid transport mode" }) }),
  distance: safeCoercedNumber(1000, "Distance cannot exceed 1000 km per day", "Distance must be a number")
});

/**
 * Validation schema for energy activities.
 */
export const energySchema = z.object({
  electricity: safeCoercedNumber(500, "Electricity cannot exceed 500 kWh", "Electricity must be a number").default(0),
  lpg: safeLpgNumber.default(0)
});

/**
 * Validation schema for food activities.
 */
export const foodSchema = z.object({
  dietType: z.enum([
    'vegan',
    'vegetarian',
    'eggetarian',
    'non-veg-moderate',
    'non-veg-heavy'
  ], { errorMap: () => ({ message: "Please select a diet type" }) })
});

/**
 * Validation schema for waste activities.
 */
export const wasteSchema = z.object({
  level: z.enum(['low', 'medium', 'high'], { errorMap: () => ({ message: "Please select a waste level" }) }),
  segregated: z.boolean().default(false)
});

/**
 * Validation schema for a single activity.
 */
export const activitySchema = z.object({
  id: safeString,
  date: safeDateString,
  category: z.enum(['transport', 'energy', 'food', 'waste']),
  details: z.union([transportSchema, energySchema, foodSchema, wasteSchema]),
  emissions: z.number().finite().nonnegative()
});

/**
 * Validation schema for a list of activities.
 */
export const activityListSchema = z.array(activitySchema);

/**
 * Validation schema for achievements locked/unlocked state.
 */
export const achievementsStateSchema = z.record(z.string(), z.string().nullable());

/**
 * TypeScript type inferred from Transport schema.
 */
export type TransportFormInput = z.infer<typeof transportSchema>;

/**
 * TypeScript type inferred from Energy schema.
 */
export type EnergyFormInput = z.infer<typeof energySchema>;

/**
 * TypeScript type inferred from Food schema.
 */
export type FoodFormInput = z.infer<typeof foodSchema>;

/**
 * TypeScript type inferred from Waste schema.
 */
export type WasteFormInput = z.infer<typeof wasteSchema>;
