import { z } from 'zod';

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
  distance: z.coerce.number({ invalid_type_error: "Distance must be a number" })
    .min(0, "Distance cannot be negative")
    .max(1000, "Distance cannot exceed 1000 km per day")
});

export const energySchema = z.object({
  electricity: z.coerce.number({ invalid_type_error: "Electricity must be a number" })
    .min(0, "Electricity cannot be negative")
    .max(5000, "Electricity cannot exceed 5000 kWh")
    .default(0),
  lpg: z.coerce.number({ invalid_type_error: "LPG refills must be a number" })
    .min(0, "LPG refills cannot be negative")
    .max(10, "LPG refills cannot exceed 10 cylinders")
    .default(0)
});

export const foodSchema = z.object({
  dietType: z.enum([
    'vegan',
    'vegetarian',
    'eggetarian',
    'non-veg-moderate',
    'non-veg-heavy'
  ], { errorMap: () => ({ message: "Please select a diet type" }) })
});

export const wasteSchema = z.object({
  level: z.enum(['low', 'medium', 'high'], { errorMap: () => ({ message: "Please select a waste level" }) }),
  segregated: z.boolean().default(false)
});

export const activitySchema = z.object({
  id: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (must be YYYY-MM-DD)"),
  category: z.enum(['transport', 'energy', 'food', 'waste']),
  details: z.any(), // Checked dynamically based on category
  emissions: z.number().min(0)
});

export const activityListSchema = z.array(activitySchema);
export const achievementsStateSchema = z.record(z.string(), z.string().nullable());
export type TransportFormInput = z.infer<typeof transportSchema>;
export type EnergyFormInput = z.infer<typeof energySchema>;
export type FoodFormInput = z.infer<typeof foodSchema>;
export type WasteFormInput = z.infer<typeof wasteSchema>;
