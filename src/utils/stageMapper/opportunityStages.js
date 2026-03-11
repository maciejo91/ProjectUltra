/**
 * Opportunity Stage Mapping Logic
 * 
 * Handles opportunity stage calculation, mapping, and transitions
 */

import { API_STATUSES, OPPORTUNITY_STAGES, DELIVERY_SUBSTATUS } from './constants.js'
import { calculateDaysSince } from '@/utils/formatters'

function hasDelivery(opportunity, activities) {
  if (opportunity.deliveryDate) return true
  
  return activities.some(a => 
    a.type === 'delivery' || 
    a.action?.toLowerCase().includes('delivered')
  )
}

function hasContract(opportunity, activities) {
  if (opportunity.contractDate && opportunity.contractSigned) return true
  
  return activities.some(a => 
    a.type === 'contract' || 
    a.action?.toLowerCase().includes('contract signed')
  )
}

function hasScheduledAppointment(opportunity, activities) {
  if (opportunity.scheduledAppointment) return true
  
  return activities.some(a => 
    a.type === 'appointment' && 
    a.status === 'confirmed'
  )
}

/**
 * Check and auto-transition negotiation substatus if needed
 * Returns updated substatus if changed, or current substatus if unchanged
 * 
 * Migrates legacy "Awaiting Response" to "Offer Sent"
 */
export function checkNegotiationSubstatusTransition(opportunity) {
  // Migrate legacy "Awaiting Response" to "Offer Sent"
  if (opportunity.stage === 'In Negotiation' && 
      opportunity.negotiationSubstatus === 'Awaiting Response') {
    return 'Offer Sent'
  }
  
  // No transition needed for other cases
  return opportunity.negotiationSubstatus
}

/**
 * Calculate display stage for an opportunity
 */
export function calculateOpportunityDisplayStage(opportunity) {
  const apiStatus = opportunity.stage || opportunity.apiStatus
  const activities = opportunity.activities || []
  
  // Terminal stages pass through
  if (apiStatus === API_STATUSES.CLOSED_LOST) {
    return OPPORTUNITY_STAGES.CLOSED_LOST
  }
  
  // Closed Won - always return Closed Won (substatus calculated separately)
  if (apiStatus === API_STATUSES.CLOSED_WON || apiStatus === 'Closed' || apiStatus === API_STATUSES.REGISTRATION) {
    return OPPORTUNITY_STAGES.CLOSED_WON
  }
  
  // Check for abandoned status (before other stages)
  // Note: Abandoned is typically handled via task widget condition, but we check here if explicitly set
  if (apiStatus === 'Abandoned') {
    return OPPORTUNITY_STAGES.ABANDONED
  }
  
  // Backward compatibility: raw "Contract Pending" stage (now a substage of In Negotiation)
  if (apiStatus === 'Contract Pending') {
    return OPPORTUNITY_STAGES.CONTRACT_PENDING
  }
  
  // In Negotiation and substates
  if (apiStatus === API_STATUSES.IN_NEGOTIATION) {
    // Contract Pending (substage): contract date set OR offer is accepted
    const hasAcceptedOffer = opportunity.offers && opportunity.offers.some(
      offer => offer.status === 'accepted' || offer.acceptance_status === 'accepted'
    )
    
    if (opportunity.contractDate || hasAcceptedOffer) {
      return `${OPPORTUNITY_STAGES.IN_NEGOTIATION} - Contract Pending`
    }
    
    // Check negotiationSubstatus if present
    if (opportunity.negotiationSubstatus) {
      // Offer Sent - show as "In Negotiation - Offer Sent"
      if (opportunity.negotiationSubstatus === 'Offer Sent') {
        return `${OPPORTUNITY_STAGES.IN_NEGOTIATION} - Offer Sent`
      }
      
      // Migrate legacy "Awaiting Response" to "Offer Sent"
      if (opportunity.negotiationSubstatus === 'Awaiting Response') {
        return `${OPPORTUNITY_STAGES.IN_NEGOTIATION} - Offer Sent`
      }
      
      // Offer Under Review – migrated to Offer Feedback Missing (backward compat)
      if (opportunity.negotiationSubstatus === 'Offer Under Review') {
        return OPPORTUNITY_STAGES.OFFER_FEEDBACK_MISSING
      }
      
      // Awaiting Offer - show as "In Negotiation - Awaiting Offer" (skipped appointment, ready to create offer)
      if (opportunity.negotiationSubstatus === 'Awaiting Offer') {
        return `${OPPORTUNITY_STAGES.IN_NEGOTIATION} - Awaiting Offer`
      }
      
      // Offer Feedback – show as "In Negotiation - Offer Feedback Missing" (backward compatibility)
      if (opportunity.negotiationSubstatus === 'Offer Feedback') {
        return OPPORTUNITY_STAGES.OFFER_FEEDBACK_MISSING
      }
    }
    
    // In Negotiation stage must have explicit substatus
    // If no substatus, default to Offer Sent (should not happen in practice)
    return `${OPPORTUNITY_STAGES.IN_NEGOTIATION} - Offer Sent`
  }
  
  // Backward compatibility: old "Offer Sent" data
  if (apiStatus === 'Offer Sent') {
    return `${OPPORTUNITY_STAGES.IN_NEGOTIATION} - Offer Sent`
  }
  
  // Backward compatibility: old "Awaiting Response" data - migrate to "Offer Sent"
  if (apiStatus === 'Awaiting Response') {
    return `${OPPORTUNITY_STAGES.IN_NEGOTIATION} - Offer Sent`
  }
  
  // Qualified and early stages
  if (apiStatus === API_STATUSES.QUALIFIED || apiStatus === API_STATUSES.OPEN) {
    // Check for appointment
    const hasAppointment = opportunity.scheduledAppointment || hasScheduledAppointment(opportunity, activities)
    if (hasAppointment) {
      // Ensure appointment has valid data if it's an object
      if (opportunity.scheduledAppointment && (!opportunity.scheduledAppointment.start && !opportunity.scheduledAppointment.id)) {
        // Invalid appointment data, fall back to Awaiting Appointment (no appointment)
        return OPPORTUNITY_STAGES.AWAITING_APPOINTMENT
      }
      // Pending confirmation (e.g. after reschedule) → Awaiting Appointment
      if (opportunity.scheduledAppointment?.status === 'pending_confirmation') {
        return OPPORTUNITY_STAGES.AWAITING_APPOINTMENT
      }
      // Appointment exists and confirmed → Appointment Scheduled
      return OPPORTUNITY_STAGES.APPOINTMENT_SCHEDULED
    }
    
    // No appointment → Awaiting Appointment
    return OPPORTUNITY_STAGES.AWAITING_APPOINTMENT
  }
  
  // Fallback
  return apiStatus
}

/**
 * Calculate delivery substatus for Closed Won opportunities
 */
function calculateDeliverySubstatus(opportunity, activities) {
  // Check if vehicle has been delivered
  if (hasDelivery(opportunity, activities)) {
    return DELIVERY_SUBSTATUS.DELIVERED
  }
  
  // Check if delivery date is scheduled
  if (opportunity.deliveryDate) {
    return DELIVERY_SUBSTATUS.AWAITING_DELIVERY
  }
  
  // No delivery tracking yet
  return DELIVERY_SUBSTATUS.NONE
}

/**
 * Calculate delivery substatus for an opportunity (helper function)
 * Note: getDeliverySubstatus is exported from index.js to avoid circular dependencies
 */
export function calculateDeliverySubstatusForOpportunity(opportunity, activities) {
  return calculateDeliverySubstatus(opportunity, activities)
}

/**
 * Map opportunity display stage back to API status
 */
export function mapOpportunityStageToApiStatus(displayStage) {
  const mapping = {
    [OPPORTUNITY_STAGES.QUALIFIED]: API_STATUSES.QUALIFIED,
    [OPPORTUNITY_STAGES.AWAITING_APPOINTMENT]: API_STATUSES.QUALIFIED,
    [OPPORTUNITY_STAGES.APPOINTMENT_SCHEDULED]: API_STATUSES.QUALIFIED,
    [OPPORTUNITY_STAGES.IN_NEGOTIATION]: API_STATUSES.IN_NEGOTIATION,
    [`${OPPORTUNITY_STAGES.IN_NEGOTIATION} - Offer Sent`]: API_STATUSES.IN_NEGOTIATION,
    [OPPORTUNITY_STAGES.OFFER_FEEDBACK_MISSING]: API_STATUSES.IN_NEGOTIATION,
    [`${OPPORTUNITY_STAGES.IN_NEGOTIATION} - Awaiting Offer`]: API_STATUSES.IN_NEGOTIATION,
    [`${OPPORTUNITY_STAGES.IN_NEGOTIATION} - Contract Pending`]: API_STATUSES.IN_NEGOTIATION,
    [OPPORTUNITY_STAGES.CLOSED_WON]: API_STATUSES.CLOSED_WON,
    [OPPORTUNITY_STAGES.CLOSED_LOST]: API_STATUSES.CLOSED_LOST,
    [OPPORTUNITY_STAGES.ABANDONED]: API_STATUSES.QUALIFIED // Abandoned maps back to Qualified for API
  }
  
  return mapping[displayStage] || API_STATUSES.QUALIFIED
}

/**
 * Get valid transitions for opportunities
 */
export function getOpportunityTransitions() {
  return {
    [OPPORTUNITY_STAGES.QUALIFIED]: [
      OPPORTUNITY_STAGES.AWAITING_APPOINTMENT,
      OPPORTUNITY_STAGES.APPOINTMENT_SCHEDULED,
      OPPORTUNITY_STAGES.IN_NEGOTIATION,
      OPPORTUNITY_STAGES.CLOSED_LOST,
      OPPORTUNITY_STAGES.ABANDONED
    ],
    [OPPORTUNITY_STAGES.AWAITING_APPOINTMENT]: [
      OPPORTUNITY_STAGES.APPOINTMENT_SCHEDULED,  // When appointment is scheduled
      OPPORTUNITY_STAGES.IN_NEGOTIATION,
      OPPORTUNITY_STAGES.CLOSED_LOST,
      OPPORTUNITY_STAGES.ABANDONED
    ],
    [OPPORTUNITY_STAGES.APPOINTMENT_SCHEDULED]: [
      OPPORTUNITY_STAGES.IN_NEGOTIATION,
      OPPORTUNITY_STAGES.AWAITING_APPOINTMENT,  // If appointment cancelled
      OPPORTUNITY_STAGES.CLOSED_LOST,
      OPPORTUNITY_STAGES.ABANDONED
    ],
    [OPPORTUNITY_STAGES.IN_NEGOTIATION]: [
      `${OPPORTUNITY_STAGES.IN_NEGOTIATION} - Contract Pending`,
      OPPORTUNITY_STAGES.CLOSED_LOST,
      OPPORTUNITY_STAGES.ABANDONED
    ],
    [`${OPPORTUNITY_STAGES.IN_NEGOTIATION} - Offer Sent`]: [
      `${OPPORTUNITY_STAGES.IN_NEGOTIATION} - Contract Pending`,
      OPPORTUNITY_STAGES.CLOSED_LOST
    ],
    [OPPORTUNITY_STAGES.OFFER_FEEDBACK_MISSING]: [
      `${OPPORTUNITY_STAGES.IN_NEGOTIATION} - Contract Pending`,
      OPPORTUNITY_STAGES.CLOSED_LOST
    ],
    [`${OPPORTUNITY_STAGES.IN_NEGOTIATION} - Contract Pending`]: [
      OPPORTUNITY_STAGES.CLOSED_WON,
      OPPORTUNITY_STAGES.CLOSED_LOST
    ],
    [OPPORTUNITY_STAGES.CONTRACT_PENDING]: [
      OPPORTUNITY_STAGES.CLOSED_WON,
      OPPORTUNITY_STAGES.CLOSED_LOST
    ],
    [OPPORTUNITY_STAGES.CLOSED_WON]: [
      OPPORTUNITY_STAGES.QUALIFIED  // Reopen
    ],
    [OPPORTUNITY_STAGES.CLOSED_LOST]: [
      OPPORTUNITY_STAGES.QUALIFIED  // Reopen
    ],
    [OPPORTUNITY_STAGES.ABANDONED]: [
      OPPORTUNITY_STAGES.QUALIFIED,  // Reopen
      OPPORTUNITY_STAGES.CLOSED_LOST
    ]
  }
}

