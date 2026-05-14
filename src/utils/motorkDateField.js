/**
 * Motork date field wire formats (MiniCalendarDateField default):
 * - Primary: DD.MM.YYYY (EU)
 * - Legacy / native: YYYY-MM-DD (ISO) — parsed for display and normalized where needed
 */

/** @param {string} s */
export function parseDdMmYyyy(s) {
  if (!s || !String(s).trim()) return null
  const parts = String(s).trim().split(/[./-]/)
  if (parts.length !== 3) return null
  const day = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10)
  const year = parseInt(parts[2], 10)
  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) return null
  const d = new Date(year, month - 1, day)
  d.setHours(0, 0, 0, 0)
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null
  return d
}

/** @param {string} s */
export function parseIsoYyyyMmDd(s) {
  const t = String(s || '').trim()
  const m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (!m) return null
  const year = parseInt(m[1], 10)
  const month = parseInt(m[2], 10)
  const day = parseInt(m[3], 10)
  const d = new Date(year, month - 1, day)
  d.setHours(0, 0, 0, 0)
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null
  return d
}

/** EU first, then ISO (for stored legacy values). */
export function parseMotorkDateField(isoOrEu) {
  return parseDdMmYyyy(isoOrEu) || parseIsoYyyyMmDd(isoOrEu)
}

/** @param {Date} date */
export function formatMotorkDateFieldEu(date) {
  const d = date.getDate().toString().padStart(2, '0')
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const y = date.getFullYear()
  return `${d}.${m}.${y}`
}

/** @param {Date} date */
export function formatMotorkDateFieldIso(date) {
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Normalize any supported string to DD.MM.YYYY, or '' if invalid. */
export function normalizeMotorkDateFieldToEu(s) {
  const d = parseMotorkDateField(s)
  return d ? formatMotorkDateFieldEu(d) : ''
}

/** Normalize any supported string to YYYY-MM-DD, or '' if invalid. */
export function normalizeMotorkDateFieldToIso(s) {
  const d = parseMotorkDateField(s)
  return d ? formatMotorkDateFieldIso(d) : ''
}

/**
 * Localized short date for summaries (e.g. lead details card).
 * @param {string} isoOrEu
 * @param {string} locale BCP 47
 */
export function formatMotorkDateFieldForLocale(isoOrEu, locale = 'en') {
  const d = parseMotorkDateField(isoOrEu)
  if (!d) return ''
  const loc = typeof locale === 'string' ? locale : 'en'
  return d.toLocaleDateString(loc, {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  })
}
