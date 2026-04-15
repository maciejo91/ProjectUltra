import { computed } from 'vue'
import { useLeadsStore } from '@/stores/leads'
import { useOpportunitiesStore } from '@/stores/opportunities'
import LeadManagementWidget from '@/components/tasks/lead/LeadManagementWidget.vue'
import OpportunityManagementWidget from '@/components/tasks/opportunity/OpportunityManagementWidget.vue'

/**
 * Composable for setting up EntityDetailLayout component props
 * Reduces boilerplate code needed to configure EntityDetailLayout
 * 
 * @param {Ref|ComputedRef} task - The task object (lead or opportunity)
 * @returns {Object} Object containing managementWidget, storeAdapter, and addNewConfig
 */
export function useTaskShell(task) {
  const leadsStore = useLeadsStore()
  const opportunitiesStore = useOpportunitiesStore()

  // Determine which management widget to use based on task type
  const managementWidget = computed(() => {
    if (!task.value) return null
    return task.value.type === 'lead' 
      ? LeadManagementWidget 
      : OpportunityManagementWidget
  })

  // Create store adapter that wraps store methods for EntityDetailLayout
  const storeAdapter = computed(() => {
    if (!task.value) return null
    
    if (task.value.type === 'lead') {
      return {
        currentActivities: computed(() => {
          if (leadsStore.currentLead?.id !== task.value.id) {
            return []
          }
          return leadsStore.currentLeadActivities
        }),
        addActivity: (taskId, activity) => leadsStore.addActivity(taskId, activity),
        updateActivity: (taskId, activityId, updates) => leadsStore.updateActivity(taskId, activityId, updates),
        deleteActivity: (taskId, activityId) => leadsStore.deleteActivity(taskId, activityId),
        updateLead: (taskId, updates) => leadsStore.updateLead(taskId, updates),
        loadLeadById: (taskId) => leadsStore.fetchLeadById(taskId)
      }
    } else {
      return {
        currentActivities: computed(() => {
          if (opportunitiesStore.currentOpportunity?.id !== task.value.id) {
            return []
          }
          return opportunitiesStore.currentOpportunityActivities
        }),
        addActivity: (taskId, activity) => opportunitiesStore.addActivity(taskId, activity),
        updateActivity: (taskId, activityId, updates) => opportunitiesStore.updateActivity(taskId, activityId, updates),
        deleteActivity: (taskId, activityId) => opportunitiesStore.deleteActivity(taskId, activityId),
        addVehicle: (taskId, vehicleData) => opportunitiesStore.addVehicle(taskId, vehicleData),
        createOffer: (taskId, offerData) => opportunitiesStore.createOffer(taskId, offerData),
        updateOpportunity: (taskId, updates) => opportunitiesStore.updateOpportunity(taskId, updates),
        loadOpportunityById: (taskId) => opportunitiesStore.fetchOpportunityById(taskId)
      }
    }
  })

  // Standardized action configuration for Add New button
  const addNewConfig = computed(() => {
    if (!task.value) return { overviewActions: [], tabActions: [] }
    
    return {
      overviewActions: ['financing', 'tradein', 'purchase'],
      tabActions: ['note', 'call', 'email', 'sms', 'whatsapp', 'attachment']
    }
  })

  return {
    managementWidget,
    storeAdapter,
    addNewConfig
  }
}

