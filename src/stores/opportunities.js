import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import * as opportunitiesApi from '@/api/opportunities'
import { useSettingsStore } from '@/stores/settings'

export const useOpportunitiesStore = defineStore('opportunities', () => {
  const opportunities = ref([])
  const currentOpportunity = ref(null)
  const currentOpportunityActivities = ref([]) // Store activities in ref instead of computed
  const loading = ref(false)
  const error = ref(null)

  // Computed: Hot opportunities (priority === 'Hot')
  const hotOpportunities = computed(() => {
    return opportunities.value.filter(opp => opp.priority === 'Hot' && opp.stage !== 'Closed Lost')
  })

  // Watch for currentOpportunity changes and load activities
  watch(currentOpportunity, async (opportunity, oldOpportunity) => {
    if (opportunity) {
      // Only clear activities if we're switching to a different opportunity
      if (!oldOpportunity || oldOpportunity.id !== opportunity.id) {
        try {
          currentOpportunityActivities.value = await opportunitiesApi.fetchOpportunityActivities(opportunity.id)
        } catch (err) {
          console.error('Failed to load opportunity activities:', err)
          currentOpportunityActivities.value = []
        }
      }
    } else {
      currentOpportunityActivities.value = []
    }
  }, { immediate: true })

  const fetchOpportunities = async (filters = {}) => {
    loading.value = true
    error.value = null
    try {
      const result = await opportunitiesApi.fetchOpportunities(filters)
      const opps = result.data || result
      
      // Check and auto-transition negotiation substatus for each opportunity
      const { checkNegotiationSubstatusTransition } = await import('@/utils/stageMapper/opportunityStages')
      for (const opp of opps) {
        const newSubstatus = checkNegotiationSubstatusTransition(opp)
        if (newSubstatus !== opp.negotiationSubstatus) {
          // Auto-transition detected - update silently
          opp.negotiationSubstatus = newSubstatus
          // Update in database (async, don't wait)
          opportunitiesApi.updateOpportunity(opp.id, { negotiationSubstatus: newSubstatus }).catch(err => {
            console.error('Failed to auto-update negotiation substatus:', err)
          })
        }
      }
      
      opportunities.value = opps
      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchOpportunityById = async (id) => {
    loading.value = true
    error.value = null
    try {
      const loadedOpportunity = await opportunitiesApi.fetchOpportunityById(id)
      
      // Check and auto-transition negotiation substatus
      const { checkNegotiationSubstatusTransition } = await import('@/utils/stageMapper/opportunityStages')
      const newSubstatus = checkNegotiationSubstatusTransition(loadedOpportunity)
      if (newSubstatus !== loadedOpportunity.negotiationSubstatus) {
        // Auto-transition detected - update silently
        loadedOpportunity.negotiationSubstatus = newSubstatus
        // Update in database (async, don't wait)
        opportunitiesApi.updateOpportunity(id, { negotiationSubstatus: newSubstatus }).catch(err => {
          console.error('Failed to auto-update negotiation substatus:', err)
        })
      }
      
      currentOpportunity.value = loadedOpportunity
      
      // Sync back to opportunities list to keep list and detail view in sync
      const index = opportunities.value.findIndex(o => o.id === parseInt(id))
      if (index !== -1) {
        opportunities.value[index] = loadedOpportunity
      }
      
      // Activities will be loaded via watch on currentOpportunity
      
      return currentOpportunity.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createOpportunity = async (opportunityData) => {
    loading.value = true
    error.value = null
    try {
      const newOpportunity = await opportunitiesApi.createOpportunity(opportunityData)
      opportunities.value.push(newOpportunity)
      return newOpportunity
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /** Add an opportunity to the list immediately (e.g. after lead conversion) for instant UI flip */
  const addOpportunityToList = (opportunity) => {
    if (!opportunities.value.some(o => o.id === opportunity.id)) {
      opportunities.value = [...opportunities.value, opportunity]
    }
  }

  const updateOpportunity = async (id, updates) => {
    loading.value = true
    error.value = null
    try {
      const numericId = parseInt(id, 10)
      const currentOpp = currentOpportunity.value?.id === numericId ? currentOpportunity.value : opportunities.value.find(o => o.id === numericId)
      
      // Closed Won is manual: user must use "Close as Won" action from Contract Pending.
      // No auto-transition when delivery date and e-signatures are completed.
      
      // Check if contract is being deleted (contractDate cleared)
      if (updates.contractDate === null && currentOpp?.contractDate) {
        // Contract deletion detected - revert offer status if auto-accepted
        const wasAutoAccepted = currentOpp.offerAcceptanceMethod === 'auto_via_contract'
        const hasAcceptedOffer = currentOpp.offers && currentOpp.offers.some(o => o.acceptance_method === 'auto_via_contract')
        
        if (wasAutoAccepted || hasAcceptedOffer) {
          // Revert offer acceptance
          if (currentOpp.offers) {
            const autoAcceptedOffers = currentOpp.offers.filter(o => o.acceptance_method === 'auto_via_contract')
            for (const offer of autoAcceptedOffers) {
              offer.status = 'active'
              offer.acceptance_status = 'pending'
              offer.acceptance_date = null
              offer.acceptance_method = null
              offer.accepted_by_user_id = null
            }
            updates.offers = currentOpp.offers
          }
          
          // Revert negotiation substatus
          updates.negotiationSubstatus = 'Offer Sent'
          updates.offerAcceptanceDate = null
          updates.offerAcceptanceMethod = null
          updates.acceptedByUserId = null
          
          // Note: Audit log will be added after update completes (see below)
        }
      }
      
      // Check if opportunity is being closed and auto-close is enabled
      const settingsStore = useSettingsStore()
      const autoCloseEnabled = settingsStore.getSetting('autoCloseWidgetsOnClose')
      
      // Check if stage is changing to Closed Won or Closed Lost
      if (autoCloseEnabled && updates.stage && (updates.stage === 'Closed Won' || updates.stage === 'Closed Lost')) {
        const currentStage = currentOpp?.stage
        // Only auto-close if transitioning from an active stage
        if (currentStage && currentStage !== 'Closed Won' && currentStage !== 'Closed Lost') {
          // Fetch activities via API wrapper instead of direct mockActivities import
          const allActivities = await opportunitiesApi.fetchOpportunityActivities(id)
          
          // Find and mark NFU/OFB activities as completed
          const nfuOfbActivities = allActivities.filter(activity => 
            (activity.type === 'nfu-task' || activity.type === 'ofb-task' || 
             activity.action?.includes('NFU') || activity.action?.includes('OFB'))
          )
          
          // Mark activities as completed
          for (const activity of nfuOfbActivities) {
            if (!activity.completed) {
              await updateActivity(id, activity.id, { 
                completed: true,
                completedAt: new Date().toISOString(),
                completionReason: `Opportunity closed as ${updates.stage}`
              })
            }
          }
        }
      }
      
      const updated = await opportunitiesApi.updateOpportunity(id, updates)
      const index = opportunities.value.findIndex(o => o.id === numericId)
      if (index !== -1) {
        opportunities.value[index] = updated
      }
      if (currentOpportunity.value?.id === numericId) {
        currentOpportunity.value = updated
      }
      
      // Add audit log for contract deletion if needed
      if (updates.contractDate === null && currentOpp?.contractDate && 
          currentOpp.offerAcceptanceMethod === 'auto_via_contract') {
        await addActivity(id, {
          type: 'contract-deletion',
          user: 'System',
          action: 'contract deleted',
          content: 'Contract deleted, offer reverted to Offer Sent',
          data: {
            wasAutoAccepted: currentOpp.offerAcceptanceMethod === 'auto_via_contract',
            previousSubstatus: currentOpp.negotiationSubstatus,
            previousStage: currentOpp.stage
          },
          timestamp: new Date().toISOString()
        })
      }
      
      return updated
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteOpportunity = async (id) => {
    loading.value = true
    error.value = null
    try {
      await opportunitiesApi.deleteOpportunity(id)
      opportunities.value = opportunities.value.filter(o => o.id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const addActivity = async (opportunityId, activity) => {
    loading.value = true
    error.value = null
    try {
      const newActivity = await opportunitiesApi.addOpportunityActivity(opportunityId, activity)
      if (currentOpportunity.value?.id === parseInt(opportunityId)) {
        // Reload activities via API wrapper
        currentOpportunityActivities.value = await opportunitiesApi.fetchOpportunityActivities(opportunityId)
      }
      return newActivity
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Add offer to opportunity
  const addOffer = async (opportunityId, offerData) => {
    loading.value = true
    error.value = null
    try {
      const newOffer = {
        id: `offer-${Date.now()}`,
        createdAt: new Date().toISOString(),
        vehicleBrand: offerData.vehicleBrand || '',
        vehicleModel: offerData.vehicleModel || '',
        vehicleYear: offerData.vehicleYear || '',
        price: offerData.price || 0,
        status: 'active',
        data: offerData.data || {}
      }
      
      const result = await opportunitiesApi.addOffer(opportunityId, newOffer)
      
      // Update local state
      const opp = opportunities.value.find(o => o.id === opportunityId)
      
      if (opp) {
        if (!opp.offers) opp.offers = []
        const wasFirstOffer = opp.offers.length === 0
        opp.offers.push(result)
        
        // Set stage and negotiationSubstatus if first offer
        if (wasFirstOffer) {
          opp.stage = 'In Negotiation'
          opp.negotiationSubstatus = 'Offer Sent'
          // Persist to API
          await opportunitiesApi.updateOpportunity(opportunityId, {
            stage: 'In Negotiation',
            negotiationSubstatus: 'Offer Sent'
          })
        }
      }
      
      if (currentOpportunity.value?.id === opportunityId) {
        if (!currentOpportunity.value.offers) currentOpportunity.value.offers = []
        const wasFirstOffer = currentOpportunity.value.offers.length === 0
        currentOpportunity.value.offers.push(result)
        
        // Set stage and negotiationSubstatus if first offer
        if (wasFirstOffer) {
          currentOpportunity.value.stage = 'In Negotiation'
          currentOpportunity.value.negotiationSubstatus = 'Offer Sent'
        }
      }
      
      // Add activity for offer creation
      await addActivity(opportunityId, {
        type: 'offer',
        user: 'You',
        action: 'created an offer',
        content: `Offer created: ${newOffer.vehicleBrand} ${newOffer.vehicleModel} (${newOffer.vehicleYear}) - € ${newOffer.price.toLocaleString()}`,
        data: { offerId: newOffer.id },
        timestamp: new Date().toISOString()
      })
      
      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Add contract to opportunity's contracts array
  const addContract = async (opportunityId, contractData) => {
    loading.value = true
    error.value = null
    try {
      const newContract = await opportunitiesApi.addContract(opportunityId, contractData)
      const opp = opportunities.value.find(o => o.id === opportunityId)
      if (opp) {
        if (!opp.contracts) opp.contracts = []
        opp.contracts.push(newContract)
        if (opp.contracts.length === 1) {
          opp.contractDate = newContract.contractDate
        }
        opp.lastActivity = newContract.contractDate || new Date().toISOString()
      }
      if (currentOpportunity.value?.id === opportunityId) {
        if (!currentOpportunity.value.contracts) currentOpportunity.value.contracts = []
        currentOpportunity.value.contracts.push(newContract)
        if (currentOpportunity.value.contracts.length === 1) {
          currentOpportunity.value.contractDate = newContract.contractDate
        }
        currentOpportunity.value.lastActivity = newContract.contractDate || new Date().toISOString()
      }
      return newContract
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete/archive offer
  const deleteOffer = async (opportunityId, offerId) => {
    loading.value = true
    error.value = null
    try {
      await opportunitiesApi.deleteOffer(opportunityId, offerId)
      
      // Update local state
      const opp = opportunities.value.find(o => o.id === opportunityId)
      if (opp && opp.offers) {
        const offer = opp.offers.find(o => o.id === offerId)
        if (offer) {
          offer.status = 'archived'
        }
      }
      
      if (currentOpportunity.value?.id === opportunityId && currentOpportunity.value.offers) {
        const offer = currentOpportunity.value.offers.find(o => o.id === offerId)
        if (offer) {
          offer.status = 'archived'
        }
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Activate offer (change from archived to active)
  // When activating an offer, deactivate all other active offers
  const activateOffer = async (opportunityId, offerId) => {
    loading.value = true
    error.value = null
    try {
      await opportunitiesApi.activateOffer(opportunityId, offerId)
      
      // Update local state - deactivate other active offers and activate the selected one
      const opp = opportunities.value.find(o => o.id === opportunityId)
      if (opp && opp.offers) {
        opp.offers.forEach(o => {
          if (o.id === offerId) {
            o.status = 'active'
          } else if (o.status === 'active' && o.acceptance_status !== 'accepted') {
            o.status = 'archived'
          }
        })
      }
      
      if (currentOpportunity.value?.id === opportunityId && currentOpportunity.value.offers) {
        currentOpportunity.value.offers.forEach(o => {
          if (o.id === offerId) {
            o.status = 'active'
          } else if (o.status === 'active' && o.acceptance_status !== 'accepted') {
            o.status = 'archived'
          }
        })
      }
      
      // Reload opportunity to ensure consistency
      await fetchOpportunityById(opportunityId)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update negotiation substatus
  const updateNegotiationSubstatus = async (opportunityId, substatus) => {
    loading.value = true
    error.value = null
    try {
      await opportunitiesApi.updateOpportunity(opportunityId, { negotiationSubstatus: substatus })
      
      // Update local state
      const opp = opportunities.value.find(o => o.id === opportunityId)
      if (opp) {
        opp.negotiationSubstatus = substatus
      }
      
      if (currentOpportunity.value?.id === opportunityId) {
        currentOpportunity.value.negotiationSubstatus = substatus
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateActivity = async (opportunityId, activityId, updates) => {
    loading.value = true
    error.value = null
    try {
      const updated = await opportunitiesApi.updateOpportunityActivity(opportunityId, activityId, updates)
      if (currentOpportunity.value?.id === parseInt(opportunityId)) {
        // Reload activities via API wrapper
        currentOpportunityActivities.value = await opportunitiesApi.fetchOpportunityActivities(opportunityId)
      }
      return updated
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const addVehicle = async (opportunityId, vehicleData) => {
    loading.value = true
    error.value = null
    try {
      const updated = await opportunitiesApi.addVehicleToOpportunity(opportunityId, vehicleData)
      const index = opportunities.value.findIndex(o => o.id === parseInt(opportunityId))
      if (index !== -1) {
        opportunities.value[index] = updated
      }
      if (currentOpportunity.value?.id === parseInt(opportunityId)) {
        currentOpportunity.value = updated
      }
      return updated
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createOffer = async (opportunityId, offerData) => {
    loading.value = true
    error.value = null
    try {
      const result = await opportunitiesApi.createOfferForOpportunity(opportunityId, offerData)
      const index = opportunities.value.findIndex(o => o.id === parseInt(opportunityId))
      if (index !== -1) {
        opportunities.value[index] = result.opportunity
      }
      if (currentOpportunity.value?.id === parseInt(opportunityId)) {
        currentOpportunity.value = result.opportunity
      }
      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteActivity = async (opportunityId, activityId) => {
    loading.value = true
    error.value = null
    try {
      await opportunitiesApi.deleteOpportunityActivity(opportunityId, activityId)
      if (currentOpportunity.value?.id === parseInt(opportunityId)) {
        // Reload activities via API wrapper
        currentOpportunityActivities.value = await opportunitiesApi.fetchOpportunityActivities(opportunityId)
      }
      return { success: true }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete contract (clear contractDate and revert offer status if auto-accepted)
  const deleteContract = async (opportunityId) => {
    loading.value = true
    error.value = null
    try {
      await opportunitiesApi.deleteContract(opportunityId)
      
      // Reload opportunity to get updated data
      await fetchOpportunityById(opportunityId)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    opportunities,
    currentOpportunity,
    loading,
    error,
    currentOpportunityActivities: computed(() => currentOpportunityActivities.value), // Return as computed for backward compatibility
    hotOpportunities,
    fetchOpportunities,
    fetchOpportunityById,
    createOpportunity,
    addOpportunityToList,
    updateOpportunity,
    deleteOpportunity,
    addActivity,
    updateActivity,
    deleteActivity,
    addVehicle,
    createOffer,
    addOffer,
    addContract,
    deleteOffer,
    activateOffer,
    deleteContract,
    updateNegotiationSubstatus
  }
})
