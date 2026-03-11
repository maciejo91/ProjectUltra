/**
 * Activity helpers for offer/activity logic
 */

/**
 * Get the latest offer from activities
 * @param {Array} activities - Array of activity objects with type and timestamp
 * @returns {object|null} Latest offer or null
 */
export function getLatestOffer(activities) {
  if (!activities || activities.length === 0) return null
  const offers = activities
    .filter((a) => a.type === 'offer')
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  return offers[0] || null
}
