/**
 * Lead Stage Mapping Logic
 * 
 * Handles lead stage calculation, mapping, and transitions
 */

import { API_STATUSES, LEAD_STAGES } from './constants.js'

/**
 * Calculate display stage for a lead
 */
export function calculateLeadDisplayStage(lead) {
  if (!lead) {
    return LEAD_STAGES.NEW
  }
  
  // CRITICAL: Always check isDisqualified FIRST before any stage logic
  // If lead is not disqualified (false, null, undefined), it can NEVER be in a closed state
  // Use explicit check: only true means disqualified
  // Defensive: handle undefined/null as false
  const isDisqualified = lead.isDisqualified === true
  
  // ACTIVE LEADS: If not disqualified, must return an active stage
  if (!isDisqualified) {
    // Lead is active - calculate active stage
    const stageValue = lead.stage || lead.apiStatus
    
    // If no stage/apiStatus provided, default to NEW
    if (!stageValue || typeof stageValue !== 'string') {
      return LEAD_STAGES.NEW
    }
    
    // If stage is already an active display stage, return it directly (never VALID)
    if (stageValue === LEAD_STAGES.NEW ||
        stageValue === LEAD_STAGES.TO_BE_CALLED_BACK ||
        stageValue === LEAD_STAGES.VALID_TO_BE_CALLED_BACK) {
      return stageValue
    }
    
    // Treat as API status and map to active display stage
    const apiStatus = stageValue

    // Check for callback scheduled first (takes precedence for display)
    if (lead.callbackDate || lead.callbackScheduled) {
      // Validated + callback → "Valid - to be called back"; Open + callback → "To be called back"
      if (apiStatus === API_STATUSES.VALIDATED || apiStatus === 'Qualified') {
        return LEAD_STAGES.VALID_TO_BE_CALLED_BACK
      }
      return LEAD_STAGES.TO_BE_CALLED_BACK
    }

    // Map validated/qualified: always "Valid - to be called back" (never "Valid")
    if (apiStatus === API_STATUSES.VALIDATED || apiStatus === 'Qualified') {
      return LEAD_STAGES.VALID_TO_BE_CALLED_BACK
    }
    
    // Default: New lead (for 'Open' and any other active status)
    // This is the safe fallback - all active leads default to New
    return LEAD_STAGES.NEW
  }
  
  // CLOSED LEADS: Only reach here if isDisqualified === true
  const stageValue = lead.stage || lead.apiStatus
  
  // If no stage/apiStatus provided, default to CLOSED_INVALID
  if (!stageValue || typeof stageValue !== 'string') {
    return LEAD_STAGES.CLOSED_INVALID
  }
  
  // If stage is already a closed display stage, return it directly
  if (stageValue === LEAD_STAGES.CLOSED_INVALID ||
      stageValue === LEAD_STAGES.CLOSED_NOT_INTERESTED ||
      stageValue === LEAD_STAGES.CLOSED_DUPLICATE) {
    return stageValue
  }
  
  // Treat as API status and map to closed display stage
  const apiStatus = stageValue
  
  if (apiStatus === API_STATUSES.CLOSED_FAILED || apiStatus === API_STATUSES.NOT_VALID) {
    return LEAD_STAGES.CLOSED_INVALID
  }
  if (apiStatus === API_STATUSES.NOT_INTERESTED) {
    return LEAD_STAGES.CLOSED_NOT_INTERESTED
  }
  // Only mark as duplicate if it's actually disqualified
  if (lead.isDuplicate === true || apiStatus === API_STATUSES.CLOSED_FAILED) {
    return LEAD_STAGES.CLOSED_DUPLICATE
  }
  
  // Default closed state if disqualified but stage doesn't match
  return LEAD_STAGES.CLOSED_INVALID
}

/**
 * Map lead display stage back to API status
 * Includes backward compatibility for legacy stage values
 */
export function mapLeadStageToApiStatus(displayStage) {
  // Legacy stage constants (for backward compatibility, not defined in LEAD_STAGES)
  const LEGACY_LEAD_STAGES = {
    NEW_LEAD: 'New Lead',
    FIRST_CONTACT_ATTEMPTED: 'First Contact Attempted',
    CALLBACK_SCHEDULED: 'Callback Scheduled',
    MULTIPLE_ATTEMPTS: 'Multiple Attempts',
    CONTACTED: 'Contacted',
    INTERESTED: 'Interested',
    QUALIFIED: 'Qualified',
    NOT_RESPONDING: 'Not Responding',
    DISQUALIFIED: 'Disqualified',
    CONVERTED: 'Converted'
  }
  
  const mapping = {
    [LEAD_STAGES.NEW]: API_STATUSES.OPEN_LEAD,
    [LEAD_STAGES.TO_BE_CALLED_BACK]: API_STATUSES.OPEN_LEAD,
    [LEAD_STAGES.VALID_TO_BE_CALLED_BACK]: API_STATUSES.VALIDATED,
    [LEAD_STAGES.VALID]: API_STATUSES.VALIDATED,
    [LEAD_STAGES.CLOSED_INVALID]: API_STATUSES.NOT_VALID,
    [LEAD_STAGES.CLOSED_NOT_INTERESTED]: API_STATUSES.NOT_INTERESTED,
    [LEAD_STAGES.CLOSED_DUPLICATE]: API_STATUSES.CLOSED_FAILED,
    // Old stages for backward compatibility
    [LEGACY_LEAD_STAGES.NEW_LEAD]: API_STATUSES.OPEN_LEAD,
    [LEGACY_LEAD_STAGES.FIRST_CONTACT_ATTEMPTED]: API_STATUSES.OPEN_LEAD,
    [LEGACY_LEAD_STAGES.CALLBACK_SCHEDULED]: API_STATUSES.OPEN_LEAD,
    [LEGACY_LEAD_STAGES.MULTIPLE_ATTEMPTS]: API_STATUSES.OPEN_LEAD,
    [LEGACY_LEAD_STAGES.CONTACTED]: API_STATUSES.OPEN_LEAD,
    [LEGACY_LEAD_STAGES.INTERESTED]: API_STATUSES.OPEN_LEAD,
    [LEGACY_LEAD_STAGES.QUALIFIED]: API_STATUSES.VALIDATED,
    [LEGACY_LEAD_STAGES.NOT_RESPONDING]: API_STATUSES.OPEN_LEAD,
    [LEGACY_LEAD_STAGES.DISQUALIFIED]: API_STATUSES.CLOSED_FAILED,
    [LEGACY_LEAD_STAGES.CONVERTED]: API_STATUSES.CLOSED_WON
  }
  
  return mapping[displayStage] || API_STATUSES.OPEN_LEAD
}

/**
 * Get valid transitions for leads
 */
export function getLeadTransitions() {
  return {
    [LEAD_STAGES.NEW]: [
      LEAD_STAGES.TO_BE_CALLED_BACK,
      LEAD_STAGES.VALID_TO_BE_CALLED_BACK,
      LEAD_STAGES.CLOSED_INVALID,
      LEAD_STAGES.CLOSED_NOT_INTERESTED,
      LEAD_STAGES.CLOSED_DUPLICATE
    ],
    [LEAD_STAGES.TO_BE_CALLED_BACK]: [
      LEAD_STAGES.VALID_TO_BE_CALLED_BACK,
      LEAD_STAGES.CLOSED_INVALID,
      LEAD_STAGES.CLOSED_NOT_INTERESTED
    ],
    [LEAD_STAGES.VALID_TO_BE_CALLED_BACK]: [
      LEAD_STAGES.TO_BE_CALLED_BACK,
      LEAD_STAGES.CLOSED_INVALID,
      LEAD_STAGES.CLOSED_NOT_INTERESTED
    ],
    [LEAD_STAGES.CLOSED_INVALID]: [
      LEAD_STAGES.NEW
    ],
    [LEAD_STAGES.CLOSED_NOT_INTERESTED]: [
      LEAD_STAGES.NEW
    ],
    [LEAD_STAGES.CLOSED_DUPLICATE]: []
  }
}



