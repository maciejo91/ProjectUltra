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
