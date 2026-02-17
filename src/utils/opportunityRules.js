/**
 * Opportunity Business Rules Engine
 * 
 * Pure functions for evaluating conditions and determining which actions/widgets to show.
 * All functions are testable and have no side effects.
 */

import { OPPORTUNITY_STATE_CONFIG, CLOSED_OPPORTUNITY_ACTIONS } from '@/composables/useOpportunityStateMachine'
import { useSettingsStore } from '@/stores/settings'

// Helper function to calculate days since a date
function calculateDaysSince(dateString) {
  if (!dateString) return 0
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

/**
 * Condition Evaluators
 * Each function takes a context object and returns boolean
 */
export const OpportunityConditions = {
  // Appointment conditions
  'no-appointment': (context) => !context.scheduledAppointment,
  
  'has-appointment': (context) => !!context.scheduledAppointment,
  
  'appointment-past-not-completed': (context) => {
    if (!context.scheduledAppointment) return false
    const appointmentDate = new Date(context.scheduledAppointment.start)
    const now = new Date()
    return appointmentDate < now && context.scheduledAppointment.status !== 'completed'
  },
  
  'has-future-appointment': (context) => {
    if (!context.scheduledAppointment) return false
    return new Date(context.scheduledAppointment.start) > new Date()
  },

  // Offer conditions
  'no-offers': (context) => !context.hasOffers,
  
  'has-offers': (context) => context.hasOffers,

  // Qualified stage conditions
  'qualified-no-offers-7-13-days': (context) => {
    const settingsStore = useSettingsStore()
    const minDays = settingsStore.getSetting('oofbMinDays')
    const maxDays = settingsStore.getSetting('oofbMaxDays')
    
    // Check if OOFB was postponed
    const postponedDate = context.opportunity.postponedTasks?.oofb
    if (postponedDate) {
      const daysSincePostpone = calculateDaysSince(postponedDate)
      const postponePeriod = settingsStore.getSetting('postponeTaskDays') || 7
      // Don't show task if still within postpone period
      if (daysSincePostpone < postponePeriod) return false
      // If postpone period has passed, recalculate from postpone date
      const daysFromPostpone = calculateDaysSince(postponedDate)
      return daysFromPostpone >= minDays && daysFromPostpone < maxDays + 1 && !context.hasOffers
    }
    
    // Normal condition check
    const days = calculateDaysSince(context.opportunity.createdAt)
    return days >= minDays && days < maxDays + 1 && !context.hasOffers
  },
  
  'qualified-no-offers-14-plus-days': (context) => {
    const settingsStore = useSettingsStore()
    const threshold = settingsStore.getSetting('ufbDays')
    
    // Check if UFB was postponed
    const postponedDate = context.opportunity.postponedTasks?.ufb
    if (postponedDate) {
      const daysSincePostpone = calculateDaysSince(postponedDate)
      const postponePeriod = settingsStore.getSetting('postponeTaskDays') || 7
      // Don't show task if still within postpone period
      if (daysSincePostpone < postponePeriod) return false
      // If postpone period has passed, recalculate from postpone date
      const daysFromPostpone = calculateDaysSince(postponedDate)
      return daysFromPostpone >= threshold && !context.hasOffers
    }
    
    // Normal condition check
    const days = calculateDaysSince(context.opportunity.createdAt)
    return days >= threshold && !context.hasOffers
  },

  // Negotiation substatus conditions
  'negotiation-offer-sent-substatus': (context) => {
    return context.opportunity?.negotiationSubstatus === 'Offer Sent'
  },
  
  'negotiation-contract-pending-substatus': (context) => {
    return context.opportunity?.contractDate !== null && 
           context.opportunity?.contractDate !== undefined
  },
  
  'negotiation-offer-feedback-substatus': (context) => {
    return context.opportunity?.negotiationSubstatus === 'Offer Feedback'
  },

  // Negotiation stage conditions
  // NOTE: OFB task should NOT appear during negotiation phase - only in Closed Won - Awaiting Feedback
  // TEMPORARILY ENABLED FOR EVALUATION - opportunity 33
  'negotiation-5-plus-days-no-contract-has-offers': (context) => {
    // OFB never appears during negotiation phase per new requirements
    // TEMPORARY: Enable for opportunity 33 evaluation
    if (context.opportunity?.id === 3) {
      // Check if has offers and no contract
      if (!context.hasOffers) return false
      if (context.opportunity.contractDate) return false
      
      // Check days since last activity (or creation if no lastActivity)
      const date = context.opportunity.lastActivity || context.opportunity.createdAt
      if (!date) return false
      const days = calculateDaysSince(date)
      return days >= 5
    }
    return false
  },
  
  'contract-pending-5-plus-days': (context) => {
    // Contract Feedback Task (CFB) - shows in Contract Pending substatus
    // Only show if at least one contract exists AND at least one is accepted (signed).
    // No CFB when contracts exist but none have been marked accepted.
    const opp = context.opportunity
    const hasAccepted = (c) => !!(c?.contractSigned || c?.esignatureCollectedDate)

    let hasAnyAcceptedContract = false
    let referenceDate = null

    if (Array.isArray(opp?.contracts) && opp.contracts.length > 0) {
      const accepted = opp.contracts.filter(hasAccepted)
      hasAnyAcceptedContract = accepted.length > 0
      if (hasAnyAcceptedContract) {
        const latest = accepted.reduce((best, c) => {
          const d = c.esignatureCollectedDate || c.contractDate
          if (!d) return best
          if (!best) return d
          return new Date(d) > new Date(best) ? d : best
        }, null)
        referenceDate = latest
      }
    } else {
      hasAnyAcceptedContract = !!(opp?.contractSigned || opp?.esignatureCollectedDate)
      referenceDate = opp?.contractDate || opp?.esignatureCollectedDate
    }

    if (!hasAnyAcceptedContract || !referenceDate) {
      return false
    }

    const settingsStore = useSettingsStore()
    const threshold = settingsStore.getSetting('cfbDays') || 5

    const postponedDate = opp.postponedTasks?.cfb
    if (postponedDate) {
      const daysSincePostpone = calculateDaysSince(postponedDate)
      const postponePeriod = settingsStore.getSetting('postponeTaskDays') || 7
      if (daysSincePostpone < postponePeriod) return false
      const daysFromPostpone = calculateDaysSince(postponedDate)
      return daysFromPostpone >= threshold
    }

    try {
      const dateObj = new Date(referenceDate)
      if (isNaN(dateObj.getTime())) return false
      const days = calculateDaysSince(dateObj.toISOString())
      return days >= threshold
    } catch (e) {
      return false
    }
  },
  
  'closed-won-contract-feedback': (context) => {
    // Contract Feedback Task (CFB) - shows in Closed Won stage
    // Only show if a contract exists on the opportunity
    const contractDate = context.opportunity?.contractDate
    if (!contractDate || contractDate === null || contractDate === undefined || contractDate === '') {
      return false
    }
    
    const settingsStore = useSettingsStore()
    const threshold = settingsStore.getSetting('cfbDays') || 5
    
    // Check if CFB was postponed
    const postponedDate = context.opportunity.postponedTasks?.cfb
    if (postponedDate) {
      const daysSincePostpone = calculateDaysSince(postponedDate)
      const postponePeriod = settingsStore.getSetting('postponeTaskDays') || 7
      if (daysSincePostpone < postponePeriod) return false
      const daysFromPostpone = calculateDaysSince(postponedDate)
      return daysFromPostpone >= threshold
    }
    
    // Normal condition check - ensure contractDate is a valid date
    try {
      const contractDateObj = new Date(contractDate)
      if (isNaN(contractDateObj.getTime())) {
        return false // Invalid date
      }
      const days = calculateDaysSince(contractDateObj.toISOString())
      return days >= threshold
    } catch (e) {
      return false // Error parsing date
    }
  },
  
  'negotiation-offer-feedback-5-plus-days-no-appointment': (context) => {
    // NFU only appears in 'Offer Feedback' substatus
    if (context.opportunity?.negotiationSubstatus !== 'Offer Feedback') {
      return false
    }
    
    // Must have offers
    if (!context.hasOffers) {
      return false
    }
    
    const settingsStore = useSettingsStore()
    const threshold = settingsStore.getSetting('nfuDays')
    
    // Check if NFU was postponed
    const postponedDate = context.opportunity.postponedTasks?.nfu
    if (postponedDate) {
      const daysSincePostpone = calculateDaysSince(postponedDate)
      const postponePeriod = settingsStore.getSetting('postponeTaskDays') || 7
      // Don't show task if still within postpone period
      if (daysSincePostpone < postponePeriod) return false
      // If postpone period has passed, recalculate from postpone date
      const daysFromPostpone = calculateDaysSince(postponedDate)
      const hasFutureAppointment = context.scheduledAppointment && 
        new Date(context.scheduledAppointment.start) > new Date()
      return daysFromPostpone >= threshold && !context.opportunity.contractDate && !hasFutureAppointment
    }
    
    // Normal condition check
    const days = calculateDaysSince(context.opportunity.lastActivity || context.opportunity.createdAt)
    const hasFutureAppointment = context.scheduledAppointment && 
      new Date(context.scheduledAppointment.start) > new Date()
    
    return days >= threshold && !context.opportunity.contractDate && !hasFutureAppointment
  },
  
  // Legacy condition (kept for backwards compatibility)
  'negotiation-5-plus-days-no-contract-no-future-appointment-has-offers': (context) => {
    // Redirect to new condition
    return OpportunityConditions['negotiation-offer-feedback-5-plus-days-no-appointment'](context)
  },

  // Contract/Delivery conditions
  'contract-7-plus-days-no-delivery': (context) => {
    if (!context.opportunity.contractDate) return false
    
    const settingsStore = useSettingsStore()
    const threshold = settingsStore.getSetting('cfbDays')
    
    // Check if CFB was postponed
    const postponedDate = context.opportunity.postponedTasks?.cfb
    if (postponedDate) {
      const daysSincePostpone = calculateDaysSince(postponedDate)
      const postponePeriod = settingsStore.getSetting('postponeTaskDays') || 7
      // Don't show task if still within postpone period
      if (daysSincePostpone < postponePeriod) return false
      // If postpone period has passed, recalculate from postpone date
      const daysFromPostpone = calculateDaysSince(postponedDate)
      const hasDelivery = context.activities?.some(a => 
        a.type === 'delivery' || a.action?.toLowerCase().includes('delivered')
      )
      return daysFromPostpone >= threshold && !hasDelivery
    }
    
    // Normal condition check
    const days = calculateDaysSince(context.opportunity.contractDate)
    const hasDelivery = context.activities?.some(a => 
      a.type === 'delivery' || a.action?.toLowerCase().includes('delivered')
    )
    
    return days >= threshold && !hasDelivery
  },
  
  'delivery-delay-feedback-required': (context) => {
    // Must be awaiting delivery (not yet delivered)
    if (context.deliverySubstatus !== 'Awaiting Delivery') return false
    
    // Must have a delivery date set
    if (!context.opportunity.deliveryDate) return false
    
    // Check that there's no actual delivery date yet
    const actualDeliveryDate = context.opportunity.actualDeliveryDate || 
      context.activities?.find(a => a.data?.actualDeliveryDate)?.data?.actualDeliveryDate
    if (actualDeliveryDate) return false
    
    const settingsStore = useSettingsStore()
    const threshold = settingsStore.getSetting('dfbDays') || 3
    
    // Check if DFB was postponed
    const postponedDate = context.opportunity.postponedTasks?.dfb
    if (postponedDate) {
      const daysSincePostpone = calculateDaysSince(postponedDate)
      const postponePeriod = settingsStore.getSetting('postponeTaskDays') || 7
      // Don't show task if still within postpone period
      if (daysSincePostpone < postponePeriod) return false
      // If postpone period has passed, recalculate from postpone date
      const daysFromPostpone = calculateDaysSince(postponedDate)
      return daysFromPostpone >= threshold
    }
    
    // Normal condition check - X days after scheduled delivery date
    const days = calculateDaysSince(context.opportunity.deliveryDate)
    
    return days >= threshold
  },
  
  'delivery-feedback-required': (context) => {
    // Must be delivered
    if (context.deliverySubstatus !== 'Delivered') return false
    
    // Check actual delivery date (not scheduled deliveryDate)
    // Support both actualDeliveryDate and deliveredDate for backward compatibility
    const actualDeliveryDate = context.opportunity.actualDeliveryDate || 
      context.opportunity.deliveredDate ||
      context.activities?.find(a => a.data?.actualDeliveryDate)?.data?.actualDeliveryDate ||
      context.activities?.find(a => a.data?.deliveredDate)?.data?.deliveredDate
    
    if (!actualDeliveryDate) return false
    
    const settingsStore = useSettingsStore()
    const threshold = settingsStore.getSetting('dfbDays') || 3
    
    // Check if DFB was postponed
    const postponedDate = context.opportunity.postponedTasks?.dfb
    if (postponedDate) {
      const daysSincePostpone = calculateDaysSince(postponedDate)
      const postponePeriod = settingsStore.getSetting('postponeTaskDays') || 7
      // Don't show task if still within postpone period
      if (daysSincePostpone < postponePeriod) return false
      // If postpone period has passed, recalculate from postpone date
      const daysFromPostpone = calculateDaysSince(postponedDate)
      return daysFromPostpone >= threshold
    }
    
    // Normal condition check
    const days = calculateDaysSince(actualDeliveryDate)
    
    return days >= threshold
  },

  // Delivery substatus conditions
  'is-awaiting-delivery': (context) => {
    return context.deliverySubstatus === 'Awaiting Delivery'
  },
  
  'is-delivered': (context) => {
    return context.deliverySubstatus === 'Delivered'
  },
  
  'has-no-delivery': (context) => {
    return !context.deliverySubstatus || context.deliverySubstatus === null
  },

  // Closed state conditions
  'is-closed': (context) => {
    const stage = context.stage
    return stage === 'Closed Won' || stage === 'Closed Lost'
  },
  
  'is-closed-with-task-widget': (context) => {
    return OpportunityConditions['is-closed'](context) && context.hasActiveTaskWidget
  },

  // Abandoned condition
  'opportunity-abandoned': (context) => {
    // Don't mark as abandoned if already closed
    if (OpportunityConditions['is-closed'](context)) {
      return false
    }

    const settingsStore = useSettingsStore()
    const threshold = settingsStore.getSetting('abandonedOpportunityDays')
    const eligibleStages = settingsStore.getSetting('abandonedEligibleStages')
    
    // Check if stage is eligible
    if (!eligibleStages.includes(context.stage)) {
      return false
    }
    
    // Calculate days since last activity
    const lastActivity = context.opportunity.lastActivity || context.opportunity.createdAt
    const days = calculateDaysSince(lastActivity)
    
    return days >= threshold
  }
}

/**
 * Get available secondary actions for a stage
 * Filters actions based on their conditional requirements
 */
export function getAvailableSecondaryActions(stage, context) {
  // Special case: closed opportunities with task widgets
  if (OpportunityConditions['is-closed-with-task-widget'](context)) {
    return [
      CLOSED_OPPORTUNITY_ACTIONS.reopen,
      CLOSED_OPPORTUNITY_ACTIONS.requalify,
      CLOSED_OPPORTUNITY_ACTIONS.closeLost,
      {
        key: 'schedule-appointment',
        label: 'Schedule Appointment',
        icon: 'fa-solid fa-calendar-plus',
        description: 'Schedule a new appointment'
      }
    ]
  }
  
  const stageConfig = OPPORTUNITY_STATE_CONFIG[stage]
  if (!stageConfig || !stageConfig.secondaryActions) {
    // Even if no stage config, always include schedule-appointment
    return [
      {
        key: 'schedule-appointment',
        label: 'Schedule Appointment',
        icon: 'fa-solid fa-calendar-plus',
        description: 'Schedule a new appointment'
      }
    ]
  }
  
  const filteredActions = stageConfig.secondaryActions.filter(action => {
    // If no conditional, always include
    if (!action.conditional) return true
    
    // Evaluate the condition
    const conditionFn = OpportunityConditions[action.conditional]
    return conditionFn ? conditionFn(context) : true
  })
  
  // Always ensure schedule-appointment is included
  const hasScheduleAppointment = filteredActions.some(a => a.key === 'schedule-appointment')
  if (!hasScheduleAppointment) {
    filteredActions.push({
      key: 'schedule-appointment',
      label: 'Schedule Appointment',
      icon: 'fa-solid fa-calendar-plus',
      description: 'Schedule a new appointment'
    })
  }
  
  return filteredActions
}

/**
 * Get the active task widget for current stage and context
 * Returns the first widget whose condition is met, or null
 */
export function getActiveTaskWidget(stage, context) {
  const stageConfig = OPPORTUNITY_STATE_CONFIG[stage]
  if (!stageConfig || !stageConfig.taskWidgets) {
    return null
  }
  
  // Skip task widgets if opportunity was just reopened from Closed Won
  if (context.opportunity.skipTaskReTrigger) {
    return null
  }
  
  // Check if opportunity is closed and auto-close is enabled
  const settingsStore = useSettingsStore()
  const autoCloseEnabled = settingsStore.getSetting('autoCloseWidgetsOnClose')
  const isClosed = OpportunityConditions['is-closed']({ stage })
  
  // Check each widget's condition in order
  for (const widget of stageConfig.taskWidgets) {
    // Auto-close NFU/OFB widgets when opportunity is closed (if enabled)
    if (autoCloseEnabled && isClosed && (widget.type === 'NFU' || widget.type === 'OFB')) {
      continue // Skip this widget
    }
    
    const conditionFn = OpportunityConditions[widget.condition]
    if (conditionFn && conditionFn(context)) {
      return widget.type
    }
  }
  
  return null
}

/**
 * Get primary action configuration for a stage
 * Returns the action config with dynamic values evaluated
 */
export function getPrimaryAction(stage, context) {
  const stageConfig = OPPORTUNITY_STATE_CONFIG[stage]
  if (!stageConfig || !stageConfig.primaryAction) {
    return null
  }
  
  let action = stageConfig.primaryAction
  
  // Handle case where primaryAction is a function (e.g., Closed Won stage)
  if (typeof action === 'function') {
    action = action(context)
    if (!action) {
      return null
    }
  }
  
  // Evaluate dynamic properties (functions)
  return {
    ...action,
    title: typeof action.title === 'function' ? action.title(context) : action.title,
    description: typeof action.description === 'function' ? action.description(context) : action.description,
    label: typeof action.label === 'function' ? action.label(context) : action.label
  }
}

/**
 * Get task widget title based on widget type
 */
export function getTaskWidgetTitle(widgetType) {
  const titles = {
    'OOFB': 'Overdue Offer Follow-up Task',
    'UFB': 'Urgent Follow-up Task',
    'NFU': 'No Future Updates Task',
    'OFB': 'Offer Follow-up Task',
    'CFB': 'Contract Follow-up Task',
    'DFB': 'Post-Delivery Customer Satisfaction Survey',
    'NS': 'NS',
    'ABANDONED': 'Abandoned Opportunity Task'
  }
  
  return titles[widgetType] || 'Task'
}

/**
 * Check if opportunity is in a closed state
 */
export function isOpportunityClosed(stage) {
  return stage === 'Closed Won' || stage === 'Closed Lost'
}

/**
 * Validation functions for opportunity operations
 */
export const OpportunityValidations = {
  /**
   * Check if contract can be created
   * @param {Object} opportunity - Opportunity object
   * @param {boolean} isFastDeal - Whether this is a fast deal (contract from Offer Sent directly)
   * @returns {Object} { valid: boolean, error: string|null }
   */
  canCreateContract: (opportunity, isFastDeal = false) => {
    if (!opportunity) {
      return { valid: false, error: 'Opportunity not found' }
    }
    
    // Fast deal path: can create contract from Offer Sent status
    if (isFastDeal) {
      if (opportunity.negotiationSubstatus === 'Offer Sent' || 
          opportunity.negotiationSubstatus === 'Awaiting Response' || // backward compatibility
          opportunity.negotiationSubstatus === null) { // new offers default to Offer Sent
        return { valid: true, error: null }
      }
    }
    
    // Normal path: can create contract from Offer Sent status
    if (opportunity.negotiationSubstatus === 'Offer Sent' || 
        opportunity.negotiationSubstatus === 'Awaiting Response' || // backward compatibility
        opportunity.negotiationSubstatus === null) {
      return { valid: true, error: null }
    }
    
    return { valid: true, error: null }
  }
}

// Export helper for external use
export { calculateDaysSince }

