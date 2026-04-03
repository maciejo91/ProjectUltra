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
