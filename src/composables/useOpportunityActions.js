/**
 * Opportunity Actions Composable
 * 
 * Connects state machine configuration with business rules and component handlers.
 * This is the "glue layer" between pure logic and Vue components.
 */

import { computed, toValue } from 'vue'
import { getDisplayStage } from '@/utils/stageMapper'
import { 
  getPrimaryAction, 
  getAvailableSecondaryActions, 
  getActiveTaskWidget,
  getTaskWidgetTitle,
  isOpportunityClosed
} from '@/utils/opportunityRules'

// Import task widget components
import OOFBTask from '@/components/tasks/opportunity/OOFBTask.vue'
import UFBTask from '@/components/tasks/opportunity/UFBTask.vue'
import NFUTask from '@/components/tasks/opportunity/NFUTask.vue'
import OFBTask from '@/components/tasks/opportunity/OFBTask.vue'
import CFBTask from '@/components/tasks/opportunity/CFBTask.vue'
import DFBTask from '@/components/tasks/opportunity/DFBTask.vue'
import AbandonedTask from '@/components/tasks/opportunity/AbandonedTask.vue'

// Map widget types to components
// Note: NS task widgets (NS1/NS2/NS3) are handled inline in OpportunityManagementWidget, not as task widgets
const TASK_WIDGET_COMPONENTS = {
  'OOFB': OOFBTask,
  'UFB': UFBTask,
  'NFU': NFUTask,
  'OFB': OFBTask,
  'CFB': CFBTask,
  'DFB': DFBTask,
  'ABANDONED': AbandonedTask
}

/**
 * Main composable for opportunity actions
 * 
 * @param {Ref|Object} opportunity - The opportunity object (reactive)
 * @param {Ref|Object} scheduledAppointment - Scheduled appointment if any (reactive)
 * @param {Ref|Array} activities - Array of activities (reactive)
 * @param {Object} handlers - Map of action keys to handler functions
 * @param {Function} formatDateTime - Function to format date/time strings
 * @returns {Object} Computed properties for actions and widgets
 */
export function useOpportunityActions(opportunity, scheduledAppointment, activities, handlers, formatDateTime) {
  // Build context object for rule evaluation
  const context = computed(() => {
    const opp = toValue(opportunity)
    const appt = toValue(scheduledAppointment)
    const acts = toValue(activities)
    
    const enrichedOpp = { ...opp, activities: acts, scheduledAppointment: appt ?? opp.scheduledAppointment }
    const stage = opp.displayStage || getDisplayStage(enrichedOpp, 'opportunity') || opp.stage
    return {
      opportunity: opp,
      scheduledAppointment: appt,
      activities: acts,
      hasOffers: (opp.offers && opp.offers.length > 0) || acts?.some(a => a.type === 'offer') || false,
      stage,
      deliverySubstatus: opp.deliverySubstatus || null,
      formatDateTime: formatDateTime,
      hasActiveTaskWidget: false // Will be set after activeTaskWidget is computed
    }
  })

  // Compute active task widget first (needed for context)
  const activeTaskWidget = computed(() => {
    const ctx = context.value
    const widgetType = getActiveTaskWidget(ctx.stage, ctx)
    
    if (!widgetType) return null
    
    const component = TASK_WIDGET_COMPONENTS[widgetType]
    if (!component) {
      return null
    }
    
    return {
      type: widgetType,
      component,
      props: {
        opportunity: ctx.opportunity,
        appointment: ctx.scheduledAppointment,
        activities: ctx.activities
      }
    }
  })

  // Update context with hasActiveTaskWidget
  const contextWithWidget = computed(() => ({
    ...context.value,
    hasActiveTaskWidget: !!activeTaskWidget.value
  }))

  // Compute primary action
  const primaryAction = computed(() => {
    const ctx = contextWithWidget.value
    const actionConfig = getPrimaryAction(ctx.stage, ctx)
    
    if (!actionConfig) return null
    
    // Map handler
    const handler = handlers[actionConfig.key]
    
    return {
      ...actionConfig,
      handler: handler || (() => {})
    }
  })

  // Compute secondary actions
  const secondaryActions = computed(() => {
    const ctx = contextWithWidget.value
    const availableActions = getAvailableSecondaryActions(ctx.stage, ctx)
    const primaryKey = primaryAction.value?.key
    
    return availableActions
      .filter(action => action.key !== primaryKey) // Filter out primary action
      .map(action => {
        const handler = handlers[action.key]
        
        return {
          ...action,
          handler: handler || (() => {})
        }
      })
  })

  // Check if opportunity is closed
  const isClosed = computed(() => {
    const ctx = context.value
    return isOpportunityClosed(ctx.stage)
  })

  // Get task widget title
  const taskWidgetTitle = computed(() => {
    if (!activeTaskWidget.value || !activeTaskWidget.value.type) return ''
    
    return getTaskWidgetTitle(activeTaskWidget.value.type)
  })

  return {
    primaryAction,
    secondaryActions,
    activeTaskWidget,
    taskWidgetTitle,
    isClosed
  }
}

