import { z } from 'zod';

/**
 * Sanitized safe string schema to prevent script injection.
 * 
 * Trims whitespace, sets a maximum length of 1024 characters, and rejects
 * strings containing brackets, parentheses, slashes, or angle tags.
 */
const safeString: z.ZodType<string, z.ZodTypeDef, unknown> = z.string()
  .trim()
  .max(1024, "Input too long")
  .refine(
    (val: string): boolean => !/[<>{}()\[\]\\\/]/.test(val),
    "Input contains invalid characters"
  );

/**
 * Helper to generate a preprocessed coerced number validation schema.
 * 
 * Converts empty strings to 0, maps inputs to numbers, checks for finite values,
 * and asserts that the resulting number is non-negative and below a designated max limit.
 *
 * @param {number} maxVal - The maximum allowed number value
 * @param {string} errMsg - Error message to display when the value exceeds maxVal
 * @param {string} invalidMsg - Error message to display when the input is not a number
 * @returns {z.ZodType<number, z.ZodTypeDef, unknown>} A Zod validation schema for coerced numbers
 *
 * @example
 * safeCoercedNumber(100, "Exceeded limit", "Must be a number").parse("45")
 * // returns 45
 */
const safeCoercedNumber = (maxVal: number, errMsg: string, invalidMsg: string): z.ZodType<number, z.ZodTypeDef, unknown> => z.preprocess(
  (val: unknown): unknown => {
    if (typeof val === 'string' && val === '') return 0;
    const num = Number(val);
    return isNaN(num) ? val : num;
  },
  z.number({ invalid_type_error: invalidMsg })
    .finite("Must be a finite number")
    .nonnegative("Value cannot be negative")
    .max(maxVal, errMsg)
);

/**
 * Safe LPG refill count validator.
 * 
 * Restricts LPG refills to integers between 0 and 10.
 */
const safeLpgNumber: z.ZodType<number, z.ZodTypeDef, unknown> = z.preprocess(
  (val: unknown): unknown => {
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

/**
 * Safe date string validator.
 * 
 * Validates date formatted as YYYY-MM-DD. Enforces boundaries to ensure
 * logs cannot be more than 1 day in the future or older than 1 year.
 */
const safeDateString: z.ZodType<string, z.ZodTypeDef, unknown> = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (must be YYYY-MM-DD)")
  .refine((val: string): boolean => {
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
  ], { errorMap: (): { readonly message: string } => ({ message: "Please select a valid transport mode" }) }),
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
  ], { errorMap: (): { readonly message: string } => ({ message: "Please select a diet type" }) })
});

/**
 * Validation schema for waste activities.
 */
export const wasteSchema = z.object({
  level: z.enum(['low', 'medium', 'high'], { errorMap: (): { readonly message: string } => ({ message: "Please select a waste level" }) }),
  segregated: z.boolean().default(false)
});

/**
 * Validation schema for a single activity log entry.
 */
export const activitySchema = z.object({
  id: safeString,
  date: safeDateString,
  category: z.enum(['transport', 'energy', 'food', 'waste']),
  details: z.union([transportSchema, energySchema, foodSchema, wasteSchema]),
  emissions: z.number().finite().nonnegative()
});

/**
 * Validation schema for a list of activity entries.
 */
export const activityListSchema = z.array(activitySchema);

/**
 * Validation schema for achievements locked/unlocked state mapping.
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
