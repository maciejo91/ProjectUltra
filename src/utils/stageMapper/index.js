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
// STAGE COLOR MAPPING
// ========================================

export function getStageColor(displayStage, entityType = 'opportunity') {
  // Match styling from task status chip: bg-{color}-100 text-{color}-700 (no border in color class, border is added separately)
  const opportunityColors = {
    [OPPORTUNITY_STAGES.QUALIFIED]: 'bg-blue-100 text-blue-700',
    [OPPORTUNITY_STAGES.AWAITING_APPOINTMENT]: 'bg-blue-100 text-blue-700',
    [OPPORTUNITY_STAGES.APPOINTMENT_SCHEDULED]: 'bg-purple-100 text-purple-700',
    [OPPORTUNITY_STAGES.IN_NEGOTIATION]: 'bg-yellow-100 text-yellow-700',
    [OPPORTUNITY_STAGES.CONTRACT_PENDING]: 'bg-badge-green text-emerald-700',
    [OPPORTUNITY_STAGES.CLOSED_WON]: 'bg-badge-green text-green-700',
    [OPPORTUNITY_STAGES.CLOSED_LOST]: 'bg-badge-red text-red-700',
    [OPPORTUNITY_STAGES.ABANDONED]: 'bg-gray-100 text-gray-700'
  }
  
  const leadColors = {
    [LEAD_STAGES.NEW]: 'bg-badge-green text-emerald-700',
    [LEAD_STAGES.TO_BE_CALLED_BACK]: 'bg-purple-100 text-purple-700',
    [LEAD_STAGES.VALID_TO_BE_CALLED_BACK]: 'bg-badge-green text-emerald-700',
    [LEAD_STAGES.VALID]: 'bg-badge-green text-emerald-700',
    [LEAD_STAGES.CLOSED_INVALID]: 'bg-gray-100 text-gray-600',
    [LEAD_STAGES.CLOSED_NOT_INTERESTED]: 'bg-badge-red text-red-700',
    [LEAD_STAGES.CLOSED_DUPLICATE]: 'bg-badge-orange text-orange-700'
  }
  
  const colors = entityType === 'opportunity' ? opportunityColors : leadColors
  return colors[displayStage] || 'bg-gray-100 text-gray-700'
}

// Get color classes for delivery substatus badges
export function getDeliverySubstatusColor(substatus) {
  const substatusColors = {
    [DELIVERY_SUBSTATUS.AWAITING_DELIVERY]: 'bg-teal-50 text-teal-700 border-teal-200',
    [DELIVERY_SUBSTATUS.DELIVERED]: 'bg-badge-green text-green-700 border-green-200'
  }
  
  return substatusColors[substatus] || 'bg-gray-50 text-gray-700 border-gray-200'
}

