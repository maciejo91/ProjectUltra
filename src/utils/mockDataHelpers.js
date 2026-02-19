/**
 * Helper utilities for creating mock data
 * 
 * Provides functions to generate dates and timestamps for mock data files
 */

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
