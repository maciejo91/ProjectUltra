import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as campaignsApi from '@/api/campaigns'

export const useCampaignsStore = defineStore('campaigns', () => {
  const interactions = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchInteractions = async () => {
    loading.value = true
    error.value = null
    try {
      const result = await campaignsApi.fetchCampaignInteractions()
      interactions.value = result.data || result
      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const linkToLead = async (interactionId, leadId) => {
    error.value = null
    try {
      const updated = await campaignsApi.linkCampaignToLead(interactionId, leadId)
      const idx = interactions.value.findIndex((i) => i.id === parseInt(interactionId, 10))
      if (idx !== -1) {
        interactions.value = interactions.value.map((i) =>
          i.id === parseInt(interactionId, 10) ? { ...i, leadId: updated.leadId } : i
        )
      }
      return updated
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const linkToOpportunity = async (interactionId, opportunityId) => {
    error.value = null
    try {
      const updated = await campaignsApi.linkCampaignToOpportunity(interactionId, opportunityId)
      const idx = interactions.value.findIndex((i) => i.id === parseInt(interactionId, 10))
      if (idx !== -1) {
        interactions.value = interactions.value.map((i) =>
          i.id === parseInt(interactionId, 10) ? { ...i, opportunityId: updated.opportunityId } : i
        )
      }
      return updated
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  return {
    interactions,
    loading,
    error,
    fetchInteractions,
    linkToLead,
    linkToOpportunity
  }
})
