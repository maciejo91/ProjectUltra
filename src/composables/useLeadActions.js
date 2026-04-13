/**
 * Lead Actions Composable
 * 
 * Connects state machine configuration with business rules and component handlers.
 * This is the "glue layer" between pure logic and Vue components.
 */

import { computed, toValue } from 'vue'
import {
  getLeadPrimaryAction,
  getAvailableLeadSecondaryActions,
  isLeadClosed,
  shouldShowLQWidget,
  shouldShowDeadlineBanner,
  canPostponeLead,
  getLQWidgetMode
} from '@/utils/leadRules'
import {
  resolveLeadVerifyContactDisplayTitle,
  getNoPhoneContactDescription
} from '@/utils/taskActionTitle'
import { getDisplayStage } from '@/utils/stageMapper'
import { useSettingsStore } from '@/stores/settings'

/**
 * Main composable for lead actions
 * 
 * @param {Ref|Object|Function} lead - The lead object (reactive, can be ref, object, or getter function)
 * @param {Object} handlers - Map of action keys to handler functions
 * @returns {Object} Computed properties for actions and widgets
 */
export function useLeadActions(lead, handlers = {}) {
  const settingsStore = useSettingsStore()
  
  // Build context object for rule evaluation
  // Use toValue directly to ensure proper reactivity tracking
  const context = computed(() => {
    // Handle function getters (like () => props.lead)
    const leadValue = typeof lead === 'function' ? lead() : toValue(lead)
    
    return {
      lead: leadValue,
      displayStage: leadValue ? getDisplayStage(leadValue, 'lead') : null
    }
  })

  // Compute display stage
  const displayStage = computed(() => {
    const ctx = context.value
    return ctx.displayStage || 'New'
  })

  // Check if lead is closed
  const isClosed = computed(() => {
    const ctx = context.value
    return isLeadClosed(ctx)
  })

  // Compute primary action
  const primaryAction = computed(() => {
    const ctx = context.value
    const actionConfig = getLeadPrimaryAction(ctx)

    if (!actionConfig) return null

    const handler = handlers[actionConfig.key]
    const phone = (ctx.lead?.customer?.phone ?? '').trim()
    const emailTitle =
      actionConfig.key === 'call-to-verify' && !phone
        ? resolveLeadVerifyContactDisplayTitle(ctx.lead)
        : null
    const customerName = ctx.lead?.customer?.name ?? ''

    return {
      ...actionConfig,
      ...(emailTitle
        ? {
            label: emailTitle,
            title: emailTitle,
            description: getNoPhoneContactDescription(customerName)
          }
        : {}),
      handler: handler || (() => {})
    }
  })

  // Compute secondary actions
  const secondaryActions = computed(() => {
    const ctx = context.value
    const availableActions = getAvailableLeadSecondaryActions(ctx)
    
    return availableActions.map(action => {
      const handler = handlers[action.key]
      
      return {
        ...action,
        handler: handler || (() => {})
      }
    })
  })

  // Check if LQ widget should be shown
  const showLQWidget = computed(() => {
    const ctx = context.value
    return shouldShowLQWidget(ctx)
  })

  // Check if deadline banner should be shown
  const showDeadlineBanner = computed(() => {
    const ctx = context.value
    return shouldShowDeadlineBanner(ctx)
  })

  // Check if lead can be postponed
  const canPostpone = computed(() => {
    const ctx = context.value
    return canPostponeLead(ctx)
  })

  // Get LQ widget mode
  const lqWidgetMode = computed(() => {
    const ctx = context.value
    return getLQWidgetMode(ctx)
  })

  // Contact attempts
  const contactAttempts = computed(() => {
    const ctx = context.value
    const leadValue = ctx.lead
    return (leadValue?.contactAttempts || []).length || 0
  })

  // Max contact attempts from settings
  const maxContactAttempts = computed(() => {
    return settingsStore.getSetting('maxContactAttempts')
  })

  // Should show auto-disqualify warning
  const shouldShowAutoDisqualifyWarning = computed(() => {
    return contactAttempts.value + 1 >= maxContactAttempts.value
  })

  // Check if lead can be reassigned (always true for now)
  const canReassign = computed(() => true)

  return {
    displayStage,
    isClosed,
    primaryAction,
    secondaryActions,
    showLQWidget,
    showDeadlineBanner,
    canPostpone,
    canReassign,
    lqWidgetMode,
    contactAttempts,
    maxContactAttempts,
    shouldShowAutoDisqualifyWarning
  }
}

