/**
 * Stage Mapper Service - Main Entry Point
 * 
 * Maps between API statuses (backend) and display stages (frontend UX)
 * Maintains backward compatibility with legacy API while providing granular stage tracking
 */

// Import constants
import {
  OPPORTUNITY_STAGES,
  LEAD_STAGES,
  API_STATUSES,
  DELIVERY_SUBSTATUS
} from './constants.js'

// Re-export constants
export {
  OPPORTUNITY_STAGES,
  LEAD_STAGES,
  API_STATUSES,
  DELIVERY_SUBSTATUS
}

// Import stage calculation functions
import { calculateOpportunityDisplayStage, mapOpportunityStageToApiStatus, getOpportunityTransitions, calculateDeliverySubstatusForOpportunity } from './opportunityStages.js'
import { calculateLeadDisplayStage, mapLeadStageToApiStatus, getLeadTransitions } from './leadStages.js'
import { getStageBadgeClass } from '@/utils/formatters'

// ========================================
// MAIN FUNCTIONS
// ========================================

/**
 * Calculate display stage from API status and metadata
 * @param {Object} entity - Lead or opportunity object
 * @param {string} type - 'lead' or 'opportunity'
 * @returns {string} Display stage
 */
export function getDisplayStage(entity, type = 'opportunity') {
  if (!entity) return null
  
  if (type === 'opportunity') {
    return calculateOpportunityDisplayStage(entity)
  } else if (type === 'lead') {
    // CRITICAL: Always recalculate from source data, never use existing displayStage
    // Create a clean object with only source properties (exclude displayStage)
    const { displayStage: _, ...sourceData } = entity
    return calculateLeadDisplayStage(sourceData)
  }
  
  return entity.stage || entity.apiStatus
}

/**
 * Map display stage back to API status
 * @param {string} displayStage 
 * @param {string} entityType 
 * @returns {string} API status
 */
export function getApiStatus(displayStage, entityType = 'opportunity') {
  if (entityType === 'opportunity') {
    return mapOpportunityStageToApiStatus(displayStage)
  } else if (entityType === 'lead') {
    return mapLeadStageToApiStatus(displayStage)
  }
  
  return displayStage
}

/**
 * Create update payload for backend
 * @param {Object} entity 
 * @param {string} newDisplayStage 
 * @param {Object} metadata - Additional metadata to update
 * @returns {Object} Update payload
 */
export function createUpdatePayload(entity, newDisplayStage, metadata = {}) {
  const entityType = entity.customer ? 'opportunity' : 'lead'
  const newApiStatus = getApiStatus(newDisplayStage, entityType)
  
  return {
    stage: newApiStatus,
    displayStage: newDisplayStage,
    ...metadata,
    updatedAt: new Date().toISOString()
  }
}

/**
 * Validate if transition is allowed
 * @param {string} currentStage 
 * @param {string} targetStage 
 * @param {string} entityType 
 * @returns {boolean}
 */
export function canTransitionTo(currentStage, targetStage, entityType = 'opportunity') {
  const validTransitions = entityType === 'opportunity' 
    ? getOpportunityTransitions()
    : getLeadTransitions()
  
  return validTransitions[currentStage]?.includes(targetStage) ?? false
}

/**
 * Build opportunity update payload from display stage
 * Handles negotiation substatus for granular In Negotiation stages
 * @param {string} displayStage - Display stage to set
 * @returns {Object} Update payload { stage, negotiationSubstatus? }
 */
export function getOpportunityUpdateFromDisplayStage(displayStage) {
  if (displayStage === OPPORTUNITY_STAGES.ABANDONED) {
    return { stage: 'Abandoned', negotiationSubstatus: null }
  }
  const apiStatus = mapOpportunityStageToApiStatus(displayStage)
  const payload = { stage: apiStatus }
  if (displayStage?.startsWith(`${OPPORTUNITY_STAGES.IN_NEGOTIATION} - `)) {
    payload.negotiationSubstatus = displayStage.replace(`${OPPORTUNITY_STAGES.IN_NEGOTIATION} - `, '')
  } else {
    payload.negotiationSubstatus = null
  }
  return payload
}

/**
 * Get delivery substatus for Closed Won opportunities
 */
export function getDeliverySubstatus(opportunity, activities = []) {
  // Only calculate substatus for Closed Won opportunities
  const displayStage = getDisplayStage(opportunity, 'opportunity')
  if (displayStage !== OPPORTUNITY_STAGES.CLOSED_WON) {
    return null
  }
  
  return calculateDeliverySubstatusForOpportunity(opportunity, activities)
}

// ========================================
// STAGE COLOR MAPPING (delegate to formatters for consistency with tasks table)
// ========================================

export function getStageColor(displayStage, _entityType = 'opportunity') {
  return getStageBadgeClass(displayStage)
}

// Get color classes for delivery substatus badges
export function getDeliverySubstatusColor(substatus) {
  const substatusColors = {
    [DELIVERY_SUBSTATUS.AWAITING_DELIVERY]: 'bg-teal-50 text-teal-700',
    [DELIVERY_SUBSTATUS.DELIVERED]: 'bg-badge-green text-green-700'
  }
  
  return substatusColors[substatus] || 'bg-gray-50 text-gray-700'
}

