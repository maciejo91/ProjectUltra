import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import * as leadsApi from '@/api/leads'
import { createOpportunityFromLead } from '@/api/opportunities'

export const useLeadsStore = defineStore('leads', () => {
  const leads = ref([])
  const currentLead = ref(null)
  const currentLeadActivities = ref([]) // Store activities in ref instead of computed
  const loading = ref(false)
  const error = ref(null)

  const lastInlineLeadQualifySuccess = ref(null)

  function setLastInlineLeadQualifySuccess(payload) {
    lastInlineLeadQualifySuccess.value = payload
  }

  function clearLastInlineLeadQualifySuccess() {
    lastInlineLeadQualifySuccess.value = null
  }

  // Computed: Hot leads (priority === 'Hot')
  const hotLeads = computed(() => {
    return leads.value.filter(lead => lead.priority === 'Hot' && !lead.isDisqualified)
  })

  // Watch for currentLead changes and load activities
  watch(currentLead, async (lead, oldLead) => {
    if (lead) {
      // Only clear activities if we're switching to a different lead
      if (!oldLead || oldLead.id !== lead.id) {
        try {
          currentLeadActivities.value = await leadsApi.fetchLeadActivities(lead.id)
        } catch (err) {
          console.error('Failed to load lead activities:', err)
          currentLeadActivities.value = []
        }
      }
    } else {
      currentLeadActivities.value = []
    }
  }, { immediate: true })

  const fetchLeads = async (filters = {}) => {
    loading.value = true
    error.value = null
    try {
      const result = await leadsApi.fetchLeads(filters)
      leads.value = result.data || result
      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchLeadById = async (id) => {
    loading.value = true
    error.value = null
    try {
      const loadedLead = await leadsApi.fetchLeadById(id)
      currentLead.value = loadedLead

      const numericId = parseInt(id, 10)
      const ix = leads.value.findIndex((l) => l.id === numericId)
      if (ix !== -1) {
        leads.value = leads.value.map((l) => (l.id === numericId ? loadedLead : l))
      } else {
        leads.value = [...leads.value, loadedLead]
      }
      
      // Activities will be loaded via watch on currentLead
      
      return currentLead.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createLead = async (leadData) => {
    loading.value = true
    error.value = null
    try {
      const newLead = await leadsApi.createLead(leadData)
      leads.value.push(newLead)
      return newLead
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateLead = async (id, updates) => {
    const numericId = parseInt(id, 10)
    
    // Optimistic update for better UX
    const index = leads.value.findIndex(l => l.id === numericId)
    const hadOptimistic = index !== -1
    if (hadOptimistic) {
      const optimisticLead = { ...leads.value[index], ...updates }
      leads.value = leads.value.map(l => (l.id === numericId ? optimisticLead : l))
      if (currentLead.value?.id === numericId) {
        currentLead.value = optimisticLead
      }
    }
    
    error.value = null
    try {
      const updated = await leadsApi.updateLead(id, updates)
      // Skip redundant reactive writes when the optimistic update already applied
      // the changes. Re-assigning leads.value and currentLead.value would trigger
      // a second full reactivity cascade across all watching components.
      if (!hadOptimistic) {
        const newIndex = leads.value.findIndex(l => l.id === numericId)
        if (newIndex !== -1) {
          leads.value = leads.value.map(l => (l.id === numericId ? updated : l))
        }
        if (currentLead.value?.id === numericId) {
          currentLead.value = updated
        }
      }
      return updated
    } catch (err) {
      error.value = err.message
      // Revert optimistic update on error
      if (hadOptimistic) {
        const revertedLead = await leadsApi.fetchLeadById(id)
        leads.value = leads.value.map(l => (l.id === numericId ? revertedLead : l))
        if (currentLead.value?.id === numericId) {
          currentLead.value = revertedLead
        }
      }
      throw err
    }
  }

  const deleteLead = async (id) => {
    loading.value = true
    error.value = null
    try {
      await leadsApi.deleteLead(id)
      const numericId = parseInt(id, 10)
      leads.value = leads.value.filter(l => l.id !== numericId)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const addActivity = async (leadId, activity) => {
    const numericId = parseInt(leadId)
    
    // Optimistic update: add activity immediately to avoid reload
    if (currentLead.value?.id === numericId) {
      currentLeadActivities.value = [...currentLeadActivities.value, {
        ...activity,
        id: `temp-${Date.now()}`
      }]
    }
    
    error.value = null
    try {
      const newActivity = await leadsApi.addLeadActivity(leadId, activity)
      if (currentLead.value?.id === numericId) {
        // Replace temp activity with real one via in-place mutation.
        // This avoids creating a new array and triggering a full reactivity
        // cascade – only the affected item re-renders.
        const tempIndex = currentLeadActivities.value.findIndex(a => a.id && a.id.toString().startsWith('temp-'))
        if (tempIndex !== -1) {
          currentLeadActivities.value[tempIndex] = newActivity
        } else {
          // Fallback: reload all activities
          currentLeadActivities.value = await leadsApi.fetchLeadActivities(leadId)
        }
      }
      return newActivity
    } catch (err) {
      error.value = err.message
      // Revert optimistic update on error
      if (currentLead.value?.id === numericId) {
        currentLeadActivities.value = await leadsApi.fetchLeadActivities(leadId)
      }
      throw err
    }
  }

  const updateActivity = async (leadId, activityId, updates) => {
    loading.value = true
    error.value = null
    try {
      const updated = await leadsApi.updateLeadActivity(leadId, activityId, updates)
      if (currentLead.value?.id === parseInt(leadId)) {
        // Reload activities via API wrapper
        currentLeadActivities.value = await leadsApi.fetchLeadActivities(leadId)
      }
      return updated
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteActivity = async (leadId, activityId) => {
    loading.value = true
    error.value = null
    try {
      await leadsApi.deleteLeadActivity(leadId, activityId)
      if (currentLead.value?.id === parseInt(leadId)) {
        // Reload activities via API wrapper
        currentLeadActivities.value = await leadsApi.fetchLeadActivities(leadId)
      }
      return { success: true }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const convertLeadToOpportunity = async (leadId, qualifiedData = null) => {
    loading.value = true
    error.value = null
    try {
      const lead = await leadsApi.fetchLeadById(leadId)
      // Use API wrapper to fetch activities instead of direct mockActivities import
      const activities = await leadsApi.fetchLeadActivities(leadId)
      const options = qualifiedData ? {
        appointmentData: qualifiedData.appointmentData,
        assigneeId: qualifiedData.assignment?.assignee?.id,
        preferences: qualifiedData.preferences,
        surveyData: qualifiedData.surveyData
      } : {}
      const opportunity = await createOpportunityFromLead(lead, activities, options)
      
      // Mark lead as converted (API update only). Caller removes from list after navigation
      // so the drawer can find the new opportunity before the lead disappears.
      await leadsApi.updateLead(leadId, { isDisqualified: true, disqualifyReason: 'Converted to opportunity' })
      
      // Do NOT remove from leads list here – handleQualified removes after navigation when redirecting
      // to avoid drawer closing (drawerTask = null) before opportunity is shown
      
      return opportunity
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    leads,
    currentLead,
    loading,
    error,
    currentLeadActivities: computed(() => currentLeadActivities.value), // Return as computed for backward compatibility
    hotLeads,
    fetchLeads,
    fetchLeadById,
    createLead,
    updateLead,
    deleteLead,
    addActivity,
    updateActivity,
    deleteActivity,
    convertLeadToOpportunity,
    lastInlineLeadQualifySuccess,
    setLastInlineLeadQualifySuccess,
    clearLastInlineLeadQualifySuccess
  }
})
