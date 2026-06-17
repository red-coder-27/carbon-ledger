/**
 * Carbon Ledger — Constants and Magic Numbers Configuration
 * 
 * Sourced constants and security boundaries used across the calculation,
 * storage, validation, and rendering components.
 */

/**
 * Maximum localStorage database size boundary limit (4MB in bytes).
 * Used to safeguard the system from storage-filling Denial of Service (DoS) attacks.
 */
export const MAX_STORAGE_BYTES = 4_194_304 as const;

/**
 * Version identifier for the localStorage schema database.
 * Used for database schema version verification during read and write cycles.
 */
export const STORAGE_VERSION = '1.0.0' as const;

/**
 * Maximum allowed ledger entry submissions per unique date.
 * Enforces rate limiting to prevent memory consumption attacks.
 */
export const MAX_ENTRIES_PER_DATE = 50 as const;

/**
 * Estimated national average monthly carbon footprint of an Indian citizen (in kg CO₂e).
 * Sourced from the CEA grid averages and public environmental datasets.
 */
export const NATIONAL_AVERAGE_MONTHLY_CO2 = 1900 as const;

/**
 * Estimated national average weekly carbon footprint of an Indian citizen (in kg CO₂e).
 * Mathematically derived from the monthly baseline ((1900 * 12) / 52).
 */
export const NATIONAL_AVERAGE_WEEKLY_CO2 = 438.46 as const;

/**
 * Estimated national average daily carbon footprint of an Indian citizen (in kg CO₂e).
 * Mathematically derived from the monthly baseline (1900 / 30).
 */
export const NATIONAL_AVERAGE_DAILY_CO2 = 63.33 as const;
