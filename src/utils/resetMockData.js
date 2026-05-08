/**
 * Reset mock data storage.
 * Clears localStorage keys used by repositories so the app reloads from mock data.
 * Use this when mock data has been updated and you want changes to take effect.
 */

const MOCK_DATA_KEYS = [
  'project-ultra-leads',
  'project-ultra-leads-version',
  'projectUltra.createdOpportunities'
]

/**
 * Clear mock data from localStorage and optionally reload the page.
 * @param {Object} options
 * @param {boolean} [options.reload=true] - Whether to reload the page after clearing
 */
export function resetMockData(options = {}) {
  const { reload = true } = options

  try {
    for (const key of MOCK_DATA_KEYS) {
      localStorage.removeItem(key)
    }

    if (reload && typeof window !== 'undefined') {
      window.location.reload()
    }

    return true
  } catch (e) {
    console.error('Failed to reset mock data:', e)
    return false
  }
}
