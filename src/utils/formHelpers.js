/**
 * Helper utilities for form initialization and management
 *
 * Provides functions to initialize form fields with default values
 */

import { formatMotorkDateFieldEu } from './motorkDateField.js'

function startOfToday() {
  const t = new Date()
  t.setHours(0, 0, 0, 0)
  return t
}

/** Today in Motork date-field format (DD.MM.YYYY). */
export function getTodayMotorkDateStringEu() {
  return formatMotorkDateFieldEu(startOfToday())
}

/**
 * Initialize a Motork calendar date field with today (EU) if unset.
 * @param {import('vue').Ref<{ [key: string]: unknown }>} form
 * @param {string} field
 * @param {string|null} defaultValue - EU or ISO string
 */
export function initDateField(form, field, defaultValue = null) {
  if (!form.value[field]) {
    form.value[field] = defaultValue != null ? defaultValue : getTodayMotorkDateStringEu()
  }
}

/**
 * Today as YYYY-MM-DD (min/max for MiniCalendarDateField, legacy APIs).
 * @returns {string}
 */
export function getTodayDateString() {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

/**
 * Initialize multiple date fields at once
 * @param {import('vue').Ref<{ [key: string]: unknown }>} form
 * @param {string[]} fields
 * @param {string|null} defaultValue
 */
export function initDateFields(form, fields, defaultValue = null) {
  fields.forEach((field) => {
    initDateField(form, field, defaultValue)
  })
}
