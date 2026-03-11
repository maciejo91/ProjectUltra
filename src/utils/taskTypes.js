/**
 * Task type codes and labels for manual tasks
 * Only types that exist in the app
 */
export const TASK_TYPES = {
  LQF: { code: 'LQF', name: 'Lead Qualification (Sales)' },
  OOFB: { code: 'OOFB', name: 'Open Opportunity Feedback' },
  UFB: { code: 'UFB', name: 'Unsold Feedback' },
  OFB: { code: 'OFB', name: 'Offer Feedback' },
  NFU: { code: 'NFU', name: 'Negotiation Follow-up' },
  CFB: { code: 'CFB', name: 'Contract Feedback' },
  DFB: { code: 'DFB', name: 'Delivery Feedback' }
}

/**
 * All task types (no entity filtering)
 * @returns {Array<{code: string, name: string}>}
 */
export function getAllTaskTypes() {
  return Object.values(TASK_TYPES)
}
