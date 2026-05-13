/**
 * Shared helpers for vehicle/requested-car display.
 * Used by task detail (Request tab) and request detail page.
 */

/**
 * @param {Object} vehicle - requestedCar or vehicle object
 * @returns {string} image URL or empty string
 */
export function getCarImageUrl(vehicle) {
  if (!vehicle) return ''
  return vehicle.image || vehicle.imageUrl || ''
}

/**
 * @param {Object} [vehicle] - requestedCar or vehicle object
 * @returns {string} e.g. "Volkswagen ID.4"
 */
export function getRequestedVehicleDisplayLabel(vehicle) {
  if (!vehicle) return ''
  const brand = (vehicle.brand || '').trim()
  const model = (vehicle.model || '').trim()
  const parts = [brand, model].filter(Boolean)
  return parts.join(' ')
}

/**
 * Condition label for vehicle cards (Km0, New, Used, or capitalized status).
 * Aligns with VehicleRequestCard / Request / task overview.
 *
 * @param {Object|null|undefined} vehicle
 * @returns {string|null}
 */
export function getVehicleConditionLabel(vehicle) {
  if (!vehicle || typeof vehicle !== 'object') return null
  const raw = vehicle.status || ''
  const status = raw.toLowerCase()
  const km = vehicle.kilometers ?? vehicle.mileage
  if (status === 'new') return 'New'
  if (km === 0 || (typeof km === 'number' && km < 1)) {
    return 'Km0'
  }
  if (raw) {
    return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
  }
  return 'Used'
}

/**
 * @param {string|null|undefined} label
 * @returns {string} Tailwind classes for condition pill
 */
export function getVehicleConditionBadgeClass(label) {
  const c = (label || '').toLowerCase()
  if (c === 'used') return 'bg-yellow-400 text-foreground'
  if (c === 'km0' || c === 'new') return 'bg-emerald-100 text-emerald-900'
  return 'bg-muted text-muted-foreground'
}
