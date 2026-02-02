/**
 * PROTOTYPE ONLY – Simulated call extraction for LQTask "interested" path.
 *
 * When VITE_LQ_SIMULATE_EXTRACTION=true, this module simulates extracting data
 * from a phone call (e.g. transcript) and returns values that fill the
 * interested-path form (enrich lead + preferences).
 *
 * To remove when moving to real product:
 * 1. Set VITE_LQ_SIMULATE_EXTRACTION to false or delete the env var.
 * 2. In LQTask.vue, remove the import and the branch that calls
 *    simulateCallExtraction / applySimulatedExtraction.
 * 3. Delete this file and the simulation/ folder if empty.
 */

const SIMULATION_ENABLED = import.meta.env.VITE_LQ_SIMULATE_EXTRACTION === 'true'

/**
 * Values allowed in the interested-path form (must match LQTask options).
 */
const INTEREST_LEVELS = ['High', 'Medium', 'Low']
const PURCHASE_TIMELINES = ['Immediate', 'Within 1 month', 'Within 3 months', 'Within 6 months', 'Just browsing']
const BUDGET_RANGES = ['Under €30k', '€30k-€50k', '€50k-€80k', '€80k+', 'Not discussed']

/**
 * Simulated extraction result shape for the interested path.
 * @typedef {{
 *   interestLevel: string,
 *   purchaseTimeline: string,
 *   budgetRange: string,
 *   additionalNotes: string,
 *   tradeIn: boolean,
 *   financing: boolean
 * }} SimulatedExtractionResult
 */

/**
 * Derive simulated extraction from call data (e.g. transcript).
 * Uses transcript keywords when present; otherwise returns fixed prototype values.
 *
 * @param {{ transcription?: { leadLines?: string[], salesLines?: string[] }, duration?: number }} callData
 * @returns {SimulatedExtractionResult}
 */
export function simulateCallExtraction(callData) {
  const transcription = callData?.transcription
  const leadLines = transcription?.leadLines ?? []
  const allText = leadLines.join(' ').toLowerCase()

  const tradeIn =
    allText.includes('trade') ||
    allText.includes('exchange') ||
    allText.includes('vehicle to trade') ||
    allText.includes('old car')
  const financing =
    allText.includes('financ') ||
    allText.includes('payment') ||
    allText.includes('loan') ||
    allText.includes('monthly')

  const interestLevel = allText.includes('definitely') || allText.includes('very interested')
    ? 'High'
    : allText.includes('interested')
      ? 'Medium'
      : INTEREST_LEVELS[0]
  const purchaseTimeline =
    allText.includes('soon') || allText.includes('as soon')
      ? 'Immediate'
      : allText.includes('month')
        ? allText.includes('1 month') || allText.includes('next month')
          ? 'Within 1 month'
          : 'Within 3 months'
        : PURCHASE_TIMELINES[1]
  const budgetRange =
    allText.includes('30') || allText.includes('budget')
      ? '€30k-€50k'
      : BUDGET_RANGES[2]
  const additionalNotes = leadLines.length
    ? `Simulated from call (${leadLines.length} lead lines). Review and edit as needed.`
    : ''

  return {
    interestLevel,
    purchaseTimeline,
    budgetRange,
    additionalNotes,
    tradeIn,
    financing
  }
}

/**
 * Whether the simulation is enabled (env flag).
 * @returns {boolean}
 */
export function isSimulationEnabled() {
  return SIMULATION_ENABLED
}
