/**
 * Lead State Machine Configuration
 * 
 * Pure configuration defining what actions and widgets exist for each lead stage.
 * Centralizes all branching logic and conditional actions based on lead statuses.
 */

import { computed } from 'vue'
import { LEAD_STAGES, getDisplayStage } from '@/utils/stageMapper'
import { useSettingsStore } from '@/stores/settings'

export const LEAD_STATE_CONFIG = {
  [LEAD_STAGES.NEW]: {
    primaryAction: {
      key: 'call-to-verify',
      title: 'Call to Verify Contact Details',
      description: 'Begin lead qualification by verifying customer contact information',
      label: 'Call to Verify',
      icon: 'fa-solid fa-phone',
      buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
      colorScheme: { background: 'bg-blue-50/50', border: 'border-blue-100' }
    },
    secondaryActions: [
      {
        key: 'disqualify',
        label: 'Disqualify Lead',
        icon: 'fa-solid fa-xmark',
        description: 'Mark lead as invalid or not interested'
      }
    ],
    taskWidgets: [
      { type: 'LQ', condition: 'always' } // LQWidget always shown for New leads
    ],
    showLQWidget: true,
    showDeadlineBanner: true,
    canPostpone: true,
    canReassign: true
  },

  [LEAD_STAGES.TO_BE_CALLED_BACK]: {
    primaryAction: {
      key: 'call-prospect',
      title: 'Call Prospect',
      description: 'Customer requested a callback. Make the call at scheduled time',
      label: 'Call Prospect',
      icon: 'fa-solid fa-phone',
      buttonClass: 'bg-purple-600 hover:bg-purple-700 text-white',
      colorScheme: { background: 'bg-purple-50/50', border: 'border-purple-100' }
    },
    secondaryActions: [
      {
        key: 'postpone',
        label: 'Postpone Task',
        icon: 'fa-solid fa-clock',
        description: 'Reschedule the callback'
      },
      {
        key: 'disqualify',
        label: 'Disqualify Lead',
        icon: 'fa-solid fa-xmark'
      }
    ],
    taskWidgets: [
      { type: 'LQ', condition: 'has-callback-date' }
    ],
    showLQWidget: (lead) => !!(lead.callbackDate || lead.callbackScheduled),
    showDeadlineBanner: true,
    canPostpone: true,
    canReassign: true
  },

  [LEAD_STAGES.VALID_TO_BE_CALLED_BACK]: {
    primaryAction: {
      key: 'call-prospect',
      title: 'Valid - to be called back',
      description: 'Call was interrupted after interest. Complete qualification or call back at scheduled time',
      label: 'Call back',
      icon: 'fa-solid fa-phone',
      buttonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      colorScheme: { background: 'bg-emerald-50/50', border: 'border-emerald-100' }
    },
    secondaryActions: [
      {
        key: 'postpone',
        label: 'Postpone Task',
        icon: 'fa-solid fa-clock',
        description: 'Reschedule the callback'
      },
      {
        key: 'disqualify',
        label: 'Disqualify Lead',
        icon: 'fa-solid fa-xmark'
      }
    ],
    taskWidgets: [
      { type: 'LQ', condition: 'always' }
    ],
    showLQWidget: true,
    showDeadlineBanner: true,
    canPostpone: true,
    canReassign: true
  },

  [LEAD_STAGES.CLOSED_INVALID]: {
    primaryAction: {
      key: 'reopen',
      title: 'Lead Closed - Invalid',
      description: 'This lead has been marked as invalid. Reopen it to continue qualification',
      label: 'Reopen Lead',
      icon: 'fa-solid fa-rotate-left',
      buttonClass: 'bg-gray-600 hover:bg-gray-700 text-white',
      colorScheme: { background: 'bg-gray-50/50', border: 'border-gray-100' }
    },
    secondaryActions: [],
    taskWidgets: [],
    showLQWidget: false,
    showDeadlineBanner: false,
    canPostpone: false,
    canReassign: false
  },

  [LEAD_STAGES.CLOSED_NOT_INTERESTED]: {
    primaryAction: {
      key: 'reopen',
      title: 'Lead Closed - Not Interested',
      description: 'This lead has been marked as not interested. Reopen it to continue qualification',
      label: 'Reopen Lead',
      icon: 'fa-solid fa-rotate-left',
      buttonClass: 'bg-gray-600 hover:bg-gray-700 text-white',
      colorScheme: { background: 'bg-gray-50/50', border: 'border-gray-100' }
    },
    secondaryActions: [],
    taskWidgets: [],
    showLQWidget: false,
    showDeadlineBanner: false,
    canPostpone: false,
    canReassign: false
  },

  [LEAD_STAGES.CLOSED_DUPLICATE]: {
    primaryAction: {
      key: 'reopen',
      title: 'Lead Closed - Duplicate',
      description: 'This lead has been marked as duplicate. Reopen it to continue qualification',
      label: 'Reopen Lead',
      icon: 'fa-solid fa-rotate-left',
      buttonClass: 'bg-gray-600 hover:bg-gray-700 text-white',
      colorScheme: { background: 'bg-gray-50/50', border: 'border-gray-100' }
    },
    secondaryActions: [],
    taskWidgets: [],
    showLQWidget: false,
    showDeadlineBanner: false,
    canPostpone: false,
    canReassign: false
  }
}

// Helper function to get state config for a lead
export function getLeadStateConfig(lead) {
  // Always calculate displayStage from the lead object to ensure correct mapping
  const displayStage = getDisplayStage(lead, 'lead')
  const config = LEAD_STATE_CONFIG[displayStage]
  if (!config) {
    console.warn(`No state config found for lead stage: ${displayStage}`)
    return null
  }
  return config
}

// Transition handlers - define what happens when transitioning between states
export const LEAD_TRANSITION_HANDLERS = {
  // Transition to any closed state
  toClosed: (lead, targetStage, disqualifyData) => {
    const updates = {
      isDisqualified: true,
      disqualifyReason: disqualifyData?.reason || null,
      disqualifyCategory: disqualifyData?.category || null,
      scheduledAppointment: null, // Cancel any future appointments
      nextActionDue: null // Clear deadline
    }
    
    // Set stage based on disqualify reason
    if (disqualifyData?.reason === 'Duplicate') {
      updates.isDuplicate = true
      updates.stage = 'Closed Failed'
    } else if (disqualifyData?.category === 'Not Interested') {
      updates.stage = 'Not Interested'
    } else {
      updates.stage = 'Not Valid'
    }
    
    updates.status = 'Disqualified'
    
    // Generate activity logs
    const activities = [
      {
        type: 'note',
        user: 'You',
        action: 'disqualified lead',
        content: `Lead disqualified - Category: ${disqualifyData?.category || 'Unknown'}, Reason: ${disqualifyData?.reason || 'Unknown'}`
      }
    ]
    
    // Add appointment cancellation activity if there was one
    if (lead.scheduledAppointment) {
      activities.push({
        type: 'appointment',
        user: 'You',
        action: 'cancelled appointment',
        content: `Appointment cancelled due to lead disqualification`,
        data: {
          cancelledReason: 'Lead disqualified',
          originalAppointment: lead.scheduledAppointment
        }
      })
    }
    
    return {
      updates,
      activities
    }
  },
  
  // Transition from closed state back to open (reopen)
  reopen: (lead) => {
    return {
      updates: {
        isDisqualified: false,
        disqualifyReason: null,
        disqualifyCategory: null,
        isDuplicate: false,
        stage: 'Open',
        status: 'Open',
        nextActionDue: null, // Clear any old due dates
        scheduledAppointment: null // Clear any old appointments
      },
      activities: [
        {
          type: 'note',
          user: 'You',
          action: 'reopened lead',
          content: 'Lead has been reopened for qualification'
        }
      ]
    }
  }
}

// Helper functions for auto-disqualification
export function shouldAutoDisqualify(lead, contactAttempts, maxAttempts) {
  return contactAttempts + 1 >= maxAttempts
}

export function getAutoDisqualifyReason(lead) {
  return {
    category: 'Not Interested',
    reason: 'Unreachable'
  }
}

// Get transition handler for a specific transition
export function getTransitionHandler(fromStage, toStage) {
  // Transition to any closed state
  if (toStage.startsWith('Closed')) {
    return LEAD_TRANSITION_HANDLERS.toClosed
  }
  
  // Reopen transition
  if (fromStage.startsWith('Closed') && !toStage.startsWith('Closed')) {
    return LEAD_TRANSITION_HANDLERS.reopen
  }
  
  return null
}

// Composable function
export function useLeadStateMachine(lead) {
  const settingsStore = useSettingsStore()
  
  // Helper to get lead value - handles both refs and getter functions
  const getLeadValue = () => {
    if (typeof lead === 'function') {
      return lead()
    }
    return lead?.value || lead
  }
  
  const displayStage = computed(() => {
    const leadValue = getLeadValue()
    if (!leadValue) {
      return LEAD_STAGES.NEW
    }
    
    // CRITICAL: Always recalculate displayStage from source data
    // This ensures the stage is correct even if the lead object's displayStage is stale
    // getDisplayStage will recalculate from source properties (stage, isDisqualified, etc.)
    // Explicitly access properties to ensure reactivity tracking
    const isDisqualified = leadValue.isDisqualified // Track for reactivity
    const stage = leadValue.stage || leadValue.apiStatus // Track for reactivity
    const callbackDate = leadValue.callbackDate // Track for reactivity
    const callbackScheduled = leadValue.callbackScheduled // Track for reactivity
    const isDuplicate = leadValue.isDuplicate // Track for reactivity
    
    // getDisplayStage will strip displayStage and recalculate from source
    // We explicitly access the properties above to ensure Vue tracks them for reactivity
    const calculatedStage = getDisplayStage(leadValue, 'lead')
    
    // Defensive: ensure we always return a valid stage
    if (!calculatedStage) {
      return LEAD_STAGES.NEW
    }
    
    return calculatedStage
  })
  
  const stateConfig = computed(() => {
    // Use the computed displayStage to ensure consistency
    const stage = displayStage.value
    if (!stage) {
      console.warn('No display stage found for lead')
      return null
    }
    const config = LEAD_STATE_CONFIG[stage]
    if (!config) {
      console.warn(`No state config found for lead stage: ${stage}`)
      return null
    }
    return config
  })
  
  const isClosedState = computed(() => {
    const leadValue = getLeadValue()
    if (!leadValue) {
      return false
    }
    
    // CRITICAL: Only return true if lead is explicitly disqualified
    // This is the primary check - if not disqualified, can never be closed
    // Normalize isDisqualified to boolean: only true is true, everything else is false
    const isDisqualified = Boolean(leadValue.isDisqualified === true)
    
    // If not disqualified, definitely not closed - return early
    if (!isDisqualified) {
      return false
    }
    
    // Lead IS disqualified - now verify stage is actually closed
    const stage = displayStage.value
    
    // Defensive: if no stage, can't determine if closed
    if (!stage || typeof stage !== 'string') {
      return false
    }
    
    // Check if it's one of the closed stages (exact match only)
    const isClosed = stage === LEAD_STAGES.CLOSED_INVALID || 
                     stage === LEAD_STAGES.CLOSED_NOT_INTERESTED || 
                     stage === LEAD_STAGES.CLOSED_DUPLICATE
    
    return isClosed
  })
  
  const isDisqualified = computed(() => {
    const leadValue = getLeadValue()
    // Only return true if explicitly set to true
    return leadValue?.isDisqualified === true
  })
  
  const showLQWidget = computed(() => {
    const config = stateConfig.value
    if (typeof config.showLQWidget === 'function') {
      return config.showLQWidget(getLeadValue())
    }
    return config.showLQWidget ?? false
  })
  
  const showDeadlineBanner = computed(() => {
    // Never show deadline banner for closed leads
    if (isClosedState.value) {
      return false
    }
    return stateConfig.value.showDeadlineBanner && getLeadValue()?.nextActionDue
  })
  
  const canPostpone = computed(() => {
    return stateConfig.value.canPostpone ?? false
  })
  
  const canReassign = computed(() => {
    return stateConfig.value.canReassign ?? false
  })
  
  const maxContactAttempts = computed(() => {
    return settingsStore.getSetting('maxContactAttempts')
  })
  
  const contactAttempts = computed(() => {
    return (getLeadValue()?.contactAttempts || []).length || 0
  })
  
  const shouldShowAutoDisqualifyWarning = computed(() => {
    return contactAttempts.value + 1 >= maxContactAttempts.value
  })
  
  const primaryAction = computed(() => {
    const action = stateConfig.value.primaryAction
    if (typeof action === 'function') {
      return action({ lead: getLeadValue(), displayStage: displayStage.value })
    }
    return action
  })
  
  const secondaryActions = computed(() => {
    return stateConfig.value.secondaryActions || []
  })
  
  const lqWidgetMode = computed(() => {
    return stateConfig.value.lqWidgetMode || 'qualification'
  })
  
  return {
    displayStage,
    stateConfig,
    isClosedState,
    isDisqualified,
    showLQWidget,
    showDeadlineBanner,
    canPostpone,
    canReassign,
    maxContactAttempts,
    contactAttempts,
    shouldShowAutoDisqualifyWarning,
    primaryAction,
    secondaryActions,
    lqWidgetMode
  }
}

