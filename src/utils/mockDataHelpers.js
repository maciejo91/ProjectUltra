/**
 * Helper utilities for creating mock data
 *
 * Provides functions to generate dates and timestamps for mock data files
 */

/** Default car image URL (duplicated from opportunities baseRequestedCar for consistency) */
export const DEFAULT_CAR_IMAGE = 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&auto=format&fit=crop&q=60'

/** Shared demo customer request text for mock leads/opportunities (request detail message card). */
export const DEMO_CUSTOMER_REQUEST_MESSAGE =
  'Looking for a late-model Audi A6 Allroad 40 TDI. Specifically interested in the high-output 3.0L diesel. Please let me know if you have any available or if you can source one. Thanks!'

/**
 * Ensure requestedCar (or vehicle) object has an image URL.
 * Mutates in place; use when creating or loading entities.
 * @param {Object|null} car - requestedCar or vehicle object
 * @param {string} [fallback] - Image URL to use when missing
 * @returns {Object|null} The car object (or null)
 */
export function ensureRequestedCarImage(car, fallback = DEFAULT_CAR_IMAGE) {
  if (!car || typeof car !== 'object') return car
  if (!car.image) car.image = fallback
  return car
}

/**
 * Deterministic demo plate (EU-style alphanumeric) for mock requested cars.
 * @param {string} [brand]
 * @param {string} [model]
 * @param {number} [year]
 * @returns {string}
 */
export function demoPlateNumber(brand, model, year) {
  const letters = (s, max) =>
    (s || '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Za-z0-9]/g, '')
      .toUpperCase()
      .slice(0, max)
      .padEnd(max, '0')
  const b = letters(brand, 2)
  const yy = String(year ?? 0).slice(-2).padStart(2, '0')
  const m = letters(model, 3)
  return `${b}${yy}${m}`.slice(0, 7)
}

/**
 * Create a date offset from today
 * @param {number} days - Number of days to offset (positive for future, negative for past)
 * @returns {string} ISO timestamp string
 */
export function createDateOffset(days) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

/**
 * Create a date string (date only, no time) offset from today
 * @param {number} days - Number of days to offset (positive for future, negative for past)
 * @returns {string} ISO date string (YYYY-MM-DD)
 */
export function createDateString(days) {
  return createDateOffset(days).split('T')[0]
}

/**
 * Create a date with specific time offset from today
 * @param {number} days - Number of days to offset
 * @param {number} hours - Hours to set (0-23)
 * @param {number} minutes - Minutes to set (0-59)
 * @returns {string} ISO timestamp string
 */
export function createDateTimeOffset(days, hours = 0, minutes = 0) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(hours, minutes, 0, 0)
  return date.toISOString()
}

/**
 * Create a timestamp offset by hours from now (positive = future, negative = past)
 * @param {number} hours - Number of hours to offset
 * @returns {string} ISO timestamp string
 */
export function createHourOffset(hours) {
  const date = new Date()
  date.setHours(date.getHours() + hours)
  return date.toISOString()
}
