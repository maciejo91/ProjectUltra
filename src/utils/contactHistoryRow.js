export function formatContactHistoryMonthYear(dateString) {
  if (!dateString) return ''
  const d = new Date(dateString)
  if (Number.isNaN(d.getTime())) return ''
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = String(d.getFullYear())
  return `${mm}/${yyyy}`
}

export function buildContactHistoryVehicleLine(original, fallbackTitle) {
  const r = original || {}
  const car = r.requestedCar || r.vehicle || {}
  const base =
    [car.brand, car.model].filter(Boolean).join(' ') ||
    (typeof fallbackTitle === 'string' ? fallbackTitle : '') ||
    '—'
  const year = car.year != null && car.year !== '' ? String(car.year) : ''
  const variant = car.variant && String(car.variant).trim() ? String(car.variant).trim() : ''
  return [base, year, variant].filter(Boolean).join(' · ')
}

export function resolveContactHistoryDealership(original) {
  const r = original || {}
  const car = r.requestedCar || r.vehicle || {}
  return car.dealership || r.dealership || ''
}

export function resolveContactHistorySource(original) {
  const r = original || {}
  const s = r.source && String(r.source).trim()
  if (s) return s
  const d = r.sourceDetails && String(r.sourceDetails).trim()
  return d || ''
}
