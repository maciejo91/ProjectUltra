import { mockCalendarEvents, mockUsers, mockActionableQuestions } from './mockData'
import { opportunityService } from '@/services/opportunityService'
import { OpportunityRepository } from '@/repositories/OpportunityRepository'
import { ActivityRepository } from '@/repositories/ActivityRepository'

// Create repository instances for activities and operations that don't go through service
const opportunityRepository = new OpportunityRepository()
const activityRepository = new ActivityRepository()

// Simulate API delay (reduced for snappier UX; increase when testing loading states)
const delay = (ms = 50) => new Promise(resolve => setTimeout(resolve, ms))

// Helper function for enrichment (used by business logic functions)
function enrichOpportunityWithCustomer(opportunity) {
  return opportunityService.enrichWithCustomer(opportunity)
}

export const fetchOpportunities = async (filters = {}) => {
  await delay()
  // Use service layer for business logic and enrichment
  return await opportunityService.findAll(filters)
}

export const fetchOpportunityById = async (id) => {
  await delay()
  // Use service layer for business logic and enrichment
  return await opportunityService.findById(id)
}

export const fetchOpportunityActivities = async (opportunityId) => {
  await delay()
  return await activityRepository.findAllByOpportunityId(opportunityId)
}

export const fetchAppointmentByCustomerId = async (customerId) => {
  await delay()
  // NOTE: Calendar events will need their own repository in the future
  const appointments = mockCalendarEvents
    .filter(event => 
      event.customerId === parseInt(customerId) && 
      (event.type === 'appointment' || event.type === 'test-drive' || event.type === 'meeting') &&
      event.status === 'confirmed'
    )
    .sort((a, b) => new Date(b.start) - new Date(a.start))
  
  return appointments.length > 0 ? appointments[0] : null
}

export const createOpportunity = async (opportunityData) => {
  await delay()
  // Use service layer for business logic and enrichment
  return await opportunityService.create(opportunityData)
}

export const createOpportunityFromContact = async (contactId, carData) => {
  await delay()
  const { mockContacts } = await import('./mockData')
  const contact = mockContacts.find(c => c.id === parseInt(contactId))
  if (!contact) throw new Error('Contact not found')
  
  // Get expected close date from settings
  const { useSettingsStore } = await import('@/stores/settings')
  const settingsStore = useSettingsStore()
  const defaultDays = settingsStore.getSetting('expectedCloseDateDays') || 90
  const expectedCloseDate = new Date(Date.now() + defaultDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  
  // Use service layer for business logic and enrichment
  return await opportunityService.create({
    customerId: contact.customerId,
    vehicle: carData,
    requestedCar: carData,
    stage: 'Qualified',
    priority: 'Normal',
    source: carData.source || 'Direct',
    assignee: null,
    assigneeInitials: '',
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    expectedCloseDate: expectedCloseDate,
    tags: [],
    value: carData.price || 0
  })
}

export const updateOpportunity = async (id, updates) => {
  await delay()
  // Use service layer for business logic and enrichment
  return await opportunityService.update(id, updates)
}

export const deleteOpportunity = async (id) => {
  await delay()
  // Use service layer
  return await opportunityService.delete(id)
}

export const addOpportunityActivity = async (opportunityId, activity) => {
  await delay()
  // Use repository directly for activities
  const newActivity = await activityRepository.create({
    opportunityId: parseInt(opportunityId),
    timestamp: new Date().toISOString(),
    ...activity
  })
  return newActivity
}

export const updateOpportunityActivity = async (opportunityId, activityId, updates) => {
  await delay()
  // Use repository directly for activities
  const activity = await activityRepository.findByOpportunityIdAndActivityId(opportunityId, activityId)
  if (!activity) throw new Error('Activity not found')
  return await activityRepository.update(activityId, updates)
}

export const deleteOpportunityActivity = async (opportunityId, activityId) => {
  await delay()
  return await activityRepository.deleteByOpportunityIdAndActivityId(opportunityId, activityId)
}

// Add vehicle to opportunity (without creating offer or transitioning stage)
export const addVehicleToOpportunity = async (opportunityId, vehicleData) => {
  await delay()
  
  // Use service to find opportunity (for validation)
  const opportunity = await opportunityService.findById(opportunityId)
  if (!opportunity) throw new Error('Opportunity not found')
  
  // Store the selected vehicle using service
  await opportunityService.update(opportunityId, {
    selectedVehicle: {
      ...vehicleData.vehicle,
      selectionType: vehicleData.type // 'requested', 'stock', 'recommended', 'custom'
    },
    lastActivity: new Date().toISOString()
  })
  
  // Add activity to track vehicle selection
  const activity = await addOpportunityActivity(opportunityId, {
    type: 'note',
    user: 'You',
    action: 'selected a vehicle',
    content: `Selected ${vehicleData.vehicle.brand} ${vehicleData.vehicle.model} (${vehicleData.vehicle.year}) for this opportunity`
  })
  
  // Fetch updated opportunity using service
  const updatedOpportunity = await opportunityService.findById(opportunityId)
  return updatedOpportunity
}

// Create offer for opportunity (triggers stage transition to "In Negotiation")
export const createOfferForOpportunity = async (opportunityId, offerData) => {
  await delay()
  
  // Use service to find opportunity
  const opportunity = await opportunityService.findById(opportunityId)
  if (!opportunity) throw new Error('Opportunity not found')
  
  // Create offer activity using repository
  const offerActivity = await addOpportunityActivity(opportunityId, {
    type: 'offer',
    user: 'You',
    action: 'created an offer',
    data: offerData.data
  })
  
  // Transition stage from "Qualified" to "In Negotiation" when offer is created
  if (opportunity.stage === 'Qualified') {
    await opportunityService.update(opportunityId, {
      stage: 'In Negotiation',
      lastActivity: new Date().toISOString()
    })
  }
  
  // Fetch updated opportunity using service
  const updatedOpportunity = await opportunityService.findById(opportunityId)
  return { opportunity: updatedOpportunity, activity: offerActivity }
}

// Add offer to opportunity's offers array
export const addOffer = async (opportunityId, offerData) => {
  await delay()
  
  const opportunity = await opportunityService.findById(opportunityId)
  if (!opportunity) throw new Error('Opportunity not found')
  
  // Initialize offers array if it doesn't exist
  if (!opportunity.offers) opportunity.offers = []
  
  const newOffer = {
    id: offerData.id || `offer-${Date.now()}`,
    createdAt: offerData.createdAt || new Date().toISOString(),
    vehicleBrand: offerData.vehicleBrand || '',
    vehicleModel: offerData.vehicleModel || '',
    vehicleYear: offerData.vehicleYear || '',
    price: offerData.price || 0,
    status: offerData.status || 'active',
    acceptance_status: offerData.acceptance_status || 'pending',
    acceptance_date: offerData.acceptance_date || null,
    acceptance_method: offerData.acceptance_method || null,
    accepted_by_user_id: offerData.accepted_by_user_id || null,
    data: offerData.data || {}
  }
  
  opportunity.offers.push(newOffer)
  
  // If first offer, transition to In Negotiation with Offer Sent substatus
  if (opportunity.offers.length === 1) {
    opportunity.stage = 'In Negotiation'
    opportunity.negotiationSubstatus = 'Offer Sent'
  }
  
  opportunity.lastActivity = new Date().toISOString()
  
  await opportunityRepository.update(opportunityId, opportunity)
  return newOffer
}

// Add contract to opportunity's contracts array
export const addContract = async (opportunityId, contractData) => {
  await delay()

  const opportunity = await opportunityService.findById(opportunityId)
  if (!opportunity) throw new Error('Opportunity not found')

  if (!opportunity.contracts) opportunity.contracts = []

  const datetime = contractData.contractTime
    ? `${contractData.contractDate}T${contractData.contractTime}:00`
    : `${contractData.contractDate}T12:00:00`

  const newContract = {
    id: contractData.id || `contract-${Date.now()}`,
    contractDate: datetime,
    contractNotes: contractData.notes || '',
    version: opportunity.contracts.length + 1,
    contractSigned: false,
    esignatureCollectedDate: null,
    status: contractData.contractStatus || contractData.status || 'active',
    lockedOfferId: contractData.lockedOfferId || null,
    lockedTradeInLabel: contractData.lockedTradeInLabel || '',
    lockedFinancingLabel: contractData.lockedFinancingLabel || '',
    lockedPrice: contractData.lockedPrice || 0,
    // Extended contract fields
    deliveryDate: contractData.deliveryDate || null,
    expectedDeliveryDate: contractData.expectedDeliveryDate || null,
    contractExternalId: contractData.contractExternalId || '',
    contact: contractData.contact || null,
    vehicle: contractData.vehicle || null,
    tradeIn: contractData.tradeIn || null,
    financial: contractData.financial || null,
    paymentMethods: contractData.paymentMethods || [],
    legal: contractData.legal || null,
    contractOwner: contractData.contractOwner || null,
    source: contractData.source || null,
    dealLocation: contractData.dealLocation || null
  }

  opportunity.contracts.push(newContract)
  const isFirst = opportunity.contracts.length === 1
  if (isFirst) {
    opportunity.contractDate = datetime
  }
  opportunity.lastActivity = new Date().toISOString()

  await opportunityRepository.update(opportunityId, opportunity)
  return newContract
}

/**
 * Update an existing contract on an opportunity
 * @param {number|string} opportunityId - Opportunity ID
 * @param {number|string} contractId - Contract ID
 * @param {Object} updates - Fields to update (e.g. deliveryDate, expectedDeliveryDate)
 * @returns {Promise<Object>} Updated contract
 */
export const updateContract = async (opportunityId, contractId, updates) => {
  await delay()

  const opportunity = await opportunityService.findById(opportunityId)
  if (!opportunity) throw new Error('Opportunity not found')
  if (!opportunity.contracts?.length) throw new Error('No contracts found')

  const contractIndex = opportunity.contracts.findIndex(
    c => String(c.id) === String(contractId)
  )
  if (contractIndex === -1) throw new Error('Contract not found')

  const contract = opportunity.contracts[contractIndex]
  const allowedKeys = [
    'deliveryDate',
    'expectedDeliveryDate',
    'contractNotes',
    'status',
    'contractExternalId'
  ]
  const filtered = {}
  for (const key of allowedKeys) {
    if (updates[key] !== undefined) filtered[key] = updates[key]
  }
  opportunity.contracts[contractIndex] = { ...contract, ...filtered }
  opportunity.lastActivity = new Date().toISOString()

  await opportunityRepository.update(opportunityId, opportunity)
  return opportunity.contracts[contractIndex]
}

// Delete contract (clear contractDate and revert offer status if auto-accepted)
export const deleteContract = async (opportunityId) => {
  await delay()
  
  const opportunity = await opportunityService.findById(opportunityId)
  if (!opportunity) throw new Error('Opportunity not found')
  
  // Check if offer was auto-accepted via contract
  const wasAutoAccepted = opportunity.offerAcceptanceMethod === 'auto_via_contract'
  const hasAcceptedOffer = opportunity.offers && opportunity.offers.some(o => o.acceptance_method === 'auto_via_contract')
  
  // Clear contract date
  const updates = {
    contractDate: null,
    contractNotes: null
  }
  
  // Revert offer status to "Offer Sent" if it was auto-accepted via contract
  // Only revert if no other contracts exist (check if contractDate was the only contract indicator)
  if (wasAutoAccepted || hasAcceptedOffer) {
    // Find the auto-accepted offer and revert its status
    if (opportunity.offers) {
      const autoAcceptedOffers = opportunity.offers.filter(o => o.acceptance_method === 'auto_via_contract')
      for (const offer of autoAcceptedOffers) {
        offer.status = 'active'
        offer.acceptance_status = 'pending'
        offer.acceptance_date = null
        offer.acceptance_method = null
        offer.accepted_by_user_id = null
      }
    }
    
    // Revert opportunity negotiation substatus to "Offer Sent"
    updates.negotiationSubstatus = 'Offer Sent'
    updates.offerAcceptanceDate = null
    updates.offerAcceptanceMethod = null
    updates.acceptedByUserId = null
  }
  
  // If stage was Closed Won, revert to In Negotiation
  if (opportunity.stage === 'Closed Won') {
    updates.stage = 'In Negotiation'
  }
  
  updates.lastActivity = new Date().toISOString()
  
  await opportunityRepository.update(opportunityId, { ...opportunity, ...updates })
  
  // Add audit log
  await activityRepository.create({
    opportunityId,
    type: 'contract-deletion',
    user: 'System',
    action: 'contract deleted',
    content: wasAutoAccepted 
      ? 'Contract deleted, offer reverted to Offer Sent'
      : 'Contract deleted',
    data: {
      wasAutoAccepted,
      previousSubstatus: opportunity.negotiationSubstatus,
      previousStage: opportunity.stage
    },
    timestamp: new Date().toISOString()
  })
  
  return await opportunityService.findById(opportunityId)
}

// Delete/archive offer
export const deleteOffer = async (opportunityId, offerId) => {
  await delay()
  
  const opportunity = await opportunityService.findById(opportunityId)
  if (!opportunity) throw new Error('Opportunity not found')
  if (!opportunity.offers) throw new Error('No offers found')
  
  const offer = opportunity.offers.find(o => o.id === offerId)
  if (!offer) throw new Error('Offer not found')
  
  offer.status = 'archived'
  opportunity.lastActivity = new Date().toISOString()
  
  await opportunityRepository.update(opportunityId, opportunity)
  return opportunity
}

// Activate offer (change from archived to active)
// When activating an offer, deactivate all other active offers
export const activateOffer = async (opportunityId, offerId) => {
  await delay()
  
  const opportunity = await opportunityService.findById(opportunityId)
  if (!opportunity) throw new Error('Opportunity not found')
  if (!opportunity.offers) throw new Error('No offers found')
  
  const offer = opportunity.offers.find(o => o.id === offerId)
  if (!offer) throw new Error('Offer not found')
  
  // Deactivate all other active offers (except accepted ones)
  opportunity.offers.forEach(o => {
    if (o.id !== offerId && o.status === 'active' && o.acceptance_status !== 'accepted') {
      o.status = 'archived'
    }
  })
  
  // Activate the selected offer
  offer.status = 'active'
  opportunity.lastActivity = new Date().toISOString()
  
  await opportunityRepository.update(opportunityId, opportunity)
  return opportunity
}

// Conversion helpers
export const generateOpportunityId = () => {
  return opportunityRepository.generateId()
}

export const createOpportunityFromLead = async (leadData, activities, options = {}) => {
  await delay()

  // Get assignee name from options or lead
  let assigneeName = leadData.assignee || 'Michele Tomasi'
  if (options.assigneeId) {
    const assigneeUser = mockUsers.find(u => u.id === options.assigneeId)
    if (assigneeUser) {
      assigneeName = assigneeUser.name
    }
  }

  // Build scheduledAppointment from qualification appointmentData when provided
  let scheduledAppointment = null
  const appointmentData = options.appointmentData
  if (appointmentData) {
    const appointmentDateTime = appointmentData.datetime
      ? new Date(appointmentData.datetime).toISOString().split('T')[0] + 'T' + appointmentData.time + ':00'
      : `${appointmentData.date}T${appointmentData.time}:00`
    const endTime = new Date(appointmentDateTime)
    const duration = appointmentData.duration || 60
    endTime.setMinutes(endTime.getMinutes() + duration)
    const customerName = leadData.customer?.name || 'Customer'
    scheduledAppointment = {
      id: Date.now(),
      title: `${appointmentData.type} - ${customerName}`,
      start: appointmentDateTime,
      end: endTime.toISOString(),
      type: appointmentData.type,
      assignee: appointmentData.assignee,
      assigneeId: appointmentData.assigneeId || appointmentData.salespersonId || appointmentData.teamId,
      assigneeType: appointmentData.assigneeType || (appointmentData.salespersonId ? 'user' : 'team'),
      teamId: appointmentData.teamId || null,
      team: appointmentData.team || null,
      salesperson: appointmentData.salesperson || null,
      salespersonId: appointmentData.salespersonId || null,
      status: 'scheduled',
      location: appointmentData.location || '',
      notes: appointmentData.notes || ''
    }
  }

  // Use service layer to create opportunity
  // Get expected close date from settings
  const { useSettingsStore } = await import('@/stores/settings')
  const settingsStore = useSettingsStore()
  const defaultDays = settingsStore.getSetting('expectedCloseDateDays') || 90
  const expectedCloseDate = new Date(Date.now() + defaultDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const newOpportunity = await opportunityService.create({
    customerId: leadData.customerId,
    requestedCar: leadData.requestedCar,
    vehicle: { ...leadData.requestedCar }, // Copy requestedCar to vehicle
    stage: 'Qualified',
    scheduledAppointment,
    tags: leadData.tags || [],
    value: leadData.requestedCar?.price || 0,
    expectedCloseDate: expectedCloseDate,
    assignee: assigneeName,
    assigneeId: options.assigneeId || null,
    source: leadData.source || 'Marketing',
    fiscalEntity: leadData.fiscalEntity || '',
    sourceDetails: leadData.sourceDetails || '',
    customerPreferences: options.preferences || null, // Store customer preferences from call
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString()
  })
  
  // Migrate activities using repository
  for (const activity of activities) {
    await activityRepository.create({
      opportunityId: newOpportunity.id,
      leadId: undefined, // Remove lead reference
      timestamp: activity.timestamp,
      type: activity.type,
      user: activity.user,
      action: activity.action,
      content: activity.content,
      data: activity.data
    })
  }
  
  return newOpportunity
}

// Detect stuck opportunities (inactive for 7+ days)
// NOTE: This business logic will move to Service Layer in future iterations
export const detectStuckOpportunities = async (userId) => {
  await delay()
  
  const user = mockUsers.find(u => u.id === userId)
  if (!user) return []
  
  const questions = []
  const now = new Date()
  const THRESHOLD_DAYS = 7
  
  // Get all opportunities assigned to this user using service
  const allOpportunitiesResult = await opportunityService.findAll({})
  const allOpportunities = allOpportunitiesResult.data
  const userOpportunities = allOpportunities.filter(opp => {
    const userByName = mockUsers.find(u => u.name === opp.assignee)
    return userByName && userByName.id === userId
  })
  
  // Get all activities for checking recent offers
  const allActivities = await activityRepository.findAll({})
  
  for (const opp of userOpportunities) {
    // Only check Qualified or In Negotiation stages
    if (opp.stage !== 'Qualified' && opp.stage !== 'In Negotiation') continue
    
    // Calculate days since last activity
    const lastActivityDate = new Date(opp.lastActivity)
    const daysSinceActivity = Math.floor((now - lastActivityDate) / (1000 * 60 * 60 * 24))
    
    // Only show if 7-14 days inactive (urgent but not too old)
    if (daysSinceActivity < THRESHOLD_DAYS || daysSinceActivity > 14) continue
    
    // Check if there's a future appointment
    if (opp.scheduledAppointment) {
      const appointmentDate = new Date(opp.scheduledAppointment.start)
      if (appointmentDate > now) continue // Has future appointment
    }
    
    // Check for recent offers (last 7 days)
    const hasRecentOffers = allActivities.some(activity => {
      if (activity.opportunityId !== opp.id || activity.type !== 'offer') return false
      const activityDate = new Date(activity.timestamp)
      const daysAgo = Math.floor((now - activityDate) / (1000 * 60 * 60 * 24))
      return daysAgo < THRESHOLD_DAYS
    })
    
    if (hasRecentOffers) continue
    
    // This opportunity is stuck
    const enrichedOpp = enrichOpportunityWithCustomer(opp)
    questions.push({
      id: `stuck-opportunity-${opp.id}`,
      type: 'stuck-opportunity',
      priority: 1, // Critical
      question: `This opportunity with ${enrichedOpp.customer.name} has been inactive for ${daysSinceActivity} days. Are they still interested in purchasing?`,
      customer: enrichedOpp.customer,
      opportunityId: opp.id,
      opportunity: enrichedOpp,
      createdAt: opp.lastActivity,
      daysInactive: daysSinceActivity
    })
  }
  
  return questions
}

// Actionable Questions Detection
// NOTE: This business logic will move to Service Layer in future iterations
export const fetchActionableQuestions = async (userId, userRole) => {
  await delay()
  
  const user = mockUsers.find(u => u.id === userId)
  if (!user) return []
  
  const questions = []
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)
  
  // Get all opportunities assigned to this user using service
  const allOpportunitiesResult = await opportunityService.findAll({})
  const allOpportunities = allOpportunitiesResult.data
  const userOpportunities = allOpportunities.filter(opp => {
    const userByName = mockUsers.find(u => u.name === opp.assignee)
    return userByName && userByName.id === userId
  })
  
  // Get all activities for checking offers and communications
  const allActivities = await activityRepository.findAll({})
  
  // Question 1: Appointment in last 1-3 days but no offer added (urgent window)
  for (const opp of userOpportunities) {
    if (!opp.scheduledAppointment) continue
    
    const appointmentDate = new Date(opp.scheduledAppointment.start)
    const daysSinceAppointment = Math.floor((now - appointmentDate) / (1000 * 60 * 60 * 24))
    
    // Only show if appointment was 1-3 days ago (urgent actionable window)
    if (daysSinceAppointment >= 1 && daysSinceAppointment <= 3) {
      // Check if any offers exist for this opportunity
      const hasOffers = allActivities.some(
        activity => activity.opportunityId === opp.id && activity.type === 'offer'
      )
      
      if (!hasOffers) {
        const enrichedOpp = enrichOpportunityWithCustomer(opp)
        questions.push({
          id: `appt-followup-${opp.id}`,
          type: 'appointment-followup',
          priority: 4, // High priority
          question: `You had an appointment ${daysSinceAppointment === 1 ? 'yesterday' : `${daysSinceAppointment} days ago`} with ${enrichedOpp.customer.name} but no offer is added so far. Did they show up to the appointment?`,
          customer: enrichedOpp.customer,
          opportunityId: opp.id,
          opportunity: enrichedOpp,
          createdAt: opp.scheduledAppointment.start,
          appointmentDate: opp.scheduledAppointment.start
        })
      }
    }
  }
  
  // Question 2: NS task exists but no communications (1-2 days after creation)
  for (const opp of userOpportunities) {
    if (!opp.scheduledAppointment) continue
    
    const appointment = opp.scheduledAppointment
    // Check if appointment has no-show status or noShowCount > 0
    if ((appointment.status === 'no-show' || appointment.noShowCount > 0) && appointment.nsTaskCreatedAt) {
      // Find NS task creation timestamp
      const nsTaskCreatedAt = new Date(appointment.nsTaskCreatedAt)
      const daysSinceNSTask = Math.floor((now - nsTaskCreatedAt) / (1000 * 60 * 60 * 24))
      
      // Only show if 1-2 days after NS task creation (urgent follow-up window)
      if (daysSinceNSTask >= 1 && daysSinceNSTask <= 2) {
        // Check if there are any communications after NS task creation
        const hasCommunications = allActivities.some(activity => {
          if (activity.opportunityId !== opp.id) return false
          if (!['call', 'email', 'sms', 'whatsapp', 'communication'].includes(activity.type)) return false
          
          const activityDate = new Date(activity.timestamp)
          return activityDate >= nsTaskCreatedAt
        })
        
        if (!hasCommunications) {
          const enrichedOpp = enrichOpportunityWithCustomer(opp)
          questions.push({
            id: `ns-followup-${opp.id}`,
            type: 'ns-followup',
            priority: 3, // High
            question: `You had to follow up with ${enrichedOpp.customer.name} on a missed appointment. Did you call them?`,
            customer: enrichedOpp.customer,
            opportunityId: opp.id,
            opportunity: enrichedOpp,
            createdAt: appointment.nsTaskCreatedAt,
            nsTaskCreatedAt: appointment.nsTaskCreatedAt
          })
        }
      }
    }
  }
  
  // Question 3: Offer sent but no response (3+ days after offer sent)
  for (const opp of userOpportunities) {
    // Only check opportunities in In Negotiation stage with offers
    if (opp.stage !== 'In Negotiation') continue
    
    // Skip if already has contract
    if (opp.contractDate) continue
    if (opp.negotiationSubstatus === 'Contract Pending') continue
    
    // Check if opportunity has offers
    if (!opp.offers || opp.offers.length === 0) continue
    
    // Find the most recent offer (by createdAt date)
    const activeOffers = opp.offers.filter(o => o.status === 'active' || !o.status)
    if (activeOffers.length === 0) continue
    
    const mostRecentOffer = activeOffers.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0)
      const dateB = new Date(b.createdAt || 0)
      return dateB - dateA
    })[0]
    
    if (!mostRecentOffer.createdAt) continue
    
    const offerDate = new Date(mostRecentOffer.createdAt)
    const daysSinceOffer = Math.floor((now - offerDate) / (1000 * 60 * 60 * 24))
    
    // Only show if offer was sent 3+ days ago (after transition window)
    if (daysSinceOffer >= 3) {
      // Check if this specific offer has been accepted
      const offerAccepted = mostRecentOffer.acceptance_status === 'accepted' || 
                           (mostRecentOffer.acceptance_date && new Date(mostRecentOffer.acceptance_date) >= offerDate)
      
      // Check if contract has been created after this offer
      const hasContract = opp.contractDate && new Date(opp.contractDate) >= offerDate
      
      // Only show if offer hasn't been accepted and no contract exists
      if (!offerAccepted && !hasContract) {
        const enrichedOpp = enrichOpportunityWithCustomer(opp)
        questions.push({
          id: `offer-followup-${opp.id}`,
          type: 'offer-followup',
          priority: 5, // Medium
          question: `You sent an offer to ${enrichedOpp.customer.name} ${daysSinceOffer === 3 ? '3 days ago' : `${daysSinceOffer} days ago`}. Follow up on the pending offer.`,
          customer: enrichedOpp.customer,
          opportunityId: opp.id,
          opportunity: enrichedOpp,
          createdAt: mostRecentOffer.createdAt
        })
      }
    }
  }
  
  // Add stuck opportunities (only for managers and salesmen)
  if (userRole === 'manager' || userRole === 'salesman') {
    const stuckQuestions = await detectStuckOpportunities(userId)
    questions.push(...stuckQuestions)
  }
  
  // Add lead qualification urgency (only for managers and operators)
  if (userRole === 'manager' || userRole === 'operator') {
    const { detectUrgentLeads } = await import('./leads')
    const leadQuestions = await detectUrgentLeads(userId)
    questions.push(...leadQuestions)
  }
  
  // Assign priorities to existing question types
  questions.forEach(q => {
    if (!q.priority) {
      if (q.type === 'appointment-followup') q.priority = 4 // High
      else if (q.type === 'offer-followup') q.priority = 5 // Medium
    }
  })
  
  // Sort by priority (lower number = higher priority) then by age
  questions.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority
    
    const ageA = new Date(a.createdAt || a.appointmentDate)
    const ageB = new Date(b.createdAt || b.appointmentDate)
    return ageA - ageB // Older first
  })

  // Fallback to mock data when dynamic logic yields no questions (for demo/development)
  if (questions.length === 0 && mockActionableQuestions.length > 0) {
    return [...mockActionableQuestions]
  }

  return questions
}

// Create NS Task
export const createNSTask = async (opportunityId, assigneeId) => {
  await delay()
  
  // Use service to find opportunity
  const opportunity = await opportunityService.findById(opportunityId)
  if (!opportunity) throw new Error('Opportunity not found')
  
  // Update appointment to mark NS task as created using service
  const appointment = opportunity.scheduledAppointment
  if (appointment) {
    const updatedAppointment = {
      ...appointment,
      noShowCount: (appointment.noShowCount || 0) + 1,
      nsTaskCreatedAt: new Date().toISOString(),
      status: 'no-show'
    }
    
    await opportunityService.update(opportunityId, {
      scheduledAppointment: updatedAppointment
    })
  }
  
  // Add NS task activity using repository
  const nsActivity = await activityRepository.create({
    opportunityId: parseInt(opportunityId),
    type: 'ns-task-created',
    user: mockUsers.find(u => u.id === assigneeId)?.name || 'System',
    action: 'NS task created',
    content: `No-show task created for missed appointment`,
    timestamp: new Date().toISOString()
  })
  
  // Fetch updated opportunity using service
  const updatedOpportunity = await opportunityService.findById(opportunityId)
  
  return {
    success: true,
    noShowCount: updatedOpportunity.scheduledAppointment?.noShowCount || 0,
    activity: nsActivity
  }
}

// Update opportunity assignee
export const updateOpportunityAssignee = async (opportunityId, assigneeId) => {
  await delay()
  
  // Use service to find opportunity
  const opportunity = await opportunityService.findById(opportunityId)
  if (!opportunity) throw new Error('Opportunity not found')
  
  const newAssignee = mockUsers.find(u => u.id === assigneeId)
  if (!newAssignee) throw new Error('User not found')
  
  // Use service to update assignee
  return await opportunityService.update(opportunityId, {
    assignee: newAssignee.name
  })
}

export const fetchTasksDueToday = async () => {
  await delay()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  // Use service to fetch all opportunities
  const allOpportunitiesResult = await opportunityService.findAll({})
  const allOpportunities = allOpportunitiesResult.data
  
  // Opportunities don't have nextActionDue, but we can check lastActivity or expectedCloseDate
  // For now, return opportunities with recent activity or due soon
  return allOpportunities.filter(opp => {
    if (opp.expectedCloseDate) {
      const closeDate = new Date(opp.expectedCloseDate)
      closeDate.setHours(0, 0, 0, 0)
      return closeDate >= today && closeDate < tomorrow
    }
    return false
  })
}

export const fetchRecentlyCreatedOpportunities = async ({ sinceHours = 48, limit = 10 } = {}) => {
  await delay()
  const cutoff = Date.now() - sinceHours * 60 * 60 * 1000
  const allOpportunitiesResult = await opportunityService.findAll({})
  const allOpportunities = allOpportunitiesResult.data
  return allOpportunities
    .filter((opp) => {
      if (!opp.createdAt) return false
      return new Date(opp.createdAt).getTime() >= cutoff
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit)
}

export const fetchTasksDueUpcoming = async (days = 7) => {
  await delay()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endDate = new Date(today)
  endDate.setDate(endDate.getDate() + days)
  
  // Use service to fetch all opportunities
  const allOpportunitiesResult = await opportunityService.findAll({})
  const allOpportunities = allOpportunitiesResult.data
  
  return allOpportunities.filter(opp => {
    if (opp.expectedCloseDate) {
      const closeDate = new Date(opp.expectedCloseDate)
      return closeDate >= today && closeDate < endDate
    }
    return false
  })
}
