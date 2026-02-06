import { mockCustomers, mockCalendarEvents, mockUsers } from './mockData'
import { leadService } from '@/services/leadService'
import { ActivityRepository } from '@/repositories/ActivityRepository'
import { LeadRepository } from '@/repositories/LeadRepository'

// Create repository instance for activities and ID generation
const activityRepository = new ActivityRepository()
const leadRepository = new LeadRepository()

// Simulate API delay (reduced for snappier UX; increase when testing loading states)
const delay = (ms = 50) => new Promise(resolve => setTimeout(resolve, ms))

// ID generation helpers
// NOTE: This will not be needed when using real API (server generates IDs)
export const generateLeadId = () => {
  return leadRepository.generateId()
}

export const fetchLeads = async (filters = {}) => {
  await delay()
  // Use service layer for business logic and enrichment
  return await leadService.findAll(filters)
}

export const fetchLeadById = async (id) => {
  await delay()
  // Use service layer for business logic and enrichment
  return await leadService.findById(id)
}

export const fetchLeadActivities = async (leadId) => {
  await delay()
  return await activityRepository.findAllByLeadId(leadId)
}

export const createLead = async (leadData) => {
  await delay()
  // Use service layer for business logic and enrichment
  return await leadService.create(leadData)
}

export const createLeadFromContact = async (contactId, carData) => {
  await delay()
  const { mockContacts } = await import('./mockData')
  const contact = mockContacts.find(c => c.id === parseInt(contactId))
  if (!contact) throw new Error('Contact not found')
  
  // Use service layer for business logic and enrichment
  return await leadService.create({
    customerId: contact.customerId,
    requestedCar: carData,
    status: 'Open',
    stage: 'Open',
    priority: 'Normal',
    source: carData.source || 'Direct',
    assignee: null,
    assigneeInitials: '',
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    nextActionDue: null,
    tags: [],
    isDisqualified: false,
    disqualifyReason: null,
    scheduledAppointment: null,
    contactAttempts: []
  })
}

export const updateLead = async (id, updates) => {
  await delay()
  // Use service layer for business logic and enrichment
  return await leadService.update(id, updates)
}

export const deleteLead = async (id) => {
  await delay()
  // Use service layer
  return await leadService.delete(id)
}

export const addLeadActivity = async (leadId, activity) => {
  await delay()
  // Use repository directly for activities
  const newActivity = await activityRepository.create({
    leadId: parseInt(leadId),
    timestamp: new Date().toISOString(),
    ...activity
  })
  return newActivity
}

export const updateLeadActivity = async (leadId, activityId, updates) => {
  await delay()
  // Use repository directly for activities
  const activity = await activityRepository.findByLeadIdAndActivityId(leadId, activityId)
  if (!activity) throw new Error('Activity not found')
  return await activityRepository.update(activityId, updates)
}

export const deleteLeadActivity = async (leadId, activityId) => {
  await delay()
  return await activityRepository.deleteByLeadIdAndActivityId(leadId, activityId)
}

// Helper function for enrichment (used by other functions)
function enrichLeadWithCustomer(lead) {
  return leadService.enrichWithCustomer(lead)
}

// Schedule follow-up appointment for lead
// NOTE: Calendar events will need their own repository in the future
export const scheduleLeadFollowUp = async (leadId, appointmentData) => {
  await delay()
  const lead = await leadService.findById(leadId)
  if (!lead) throw new Error('Lead not found')
  
  // Create calendar event
  const eventId = mockCalendarEvents.length > 0 ? Math.max(...mockCalendarEvents.map(e => e.id)) + 1 : 1
  const appointmentStart = new Date(appointmentData.dateTime)
  const appointmentEnd = new Date(appointmentStart.getTime() + 30 * 60000) // +30 minutes
  
  const enrichedLead = enrichLeadWithCustomer(lead)
  const customer = enrichedLead.customer
  
  const calendarEvent = {
    id: eventId,
    title: 'Follow-up Call',
    start: appointmentStart.toISOString(),
    end: appointmentEnd.toISOString(),
    type: 'call',
    customer: customer.name,
    customerId: customer.id,
    leadId: lead.id,
    opportunityId: null,
    assignee: appointmentData.assignee || lead.assignee,
    assigneeId: appointmentData.assigneeId || null,
    assigneeType: appointmentData.assigneeType || 'user',
    teamId: appointmentData.teamId || null,
    team: appointmentData.team || 'BDC',
    dealership: lead.fiscalEntity || 'Main',
    status: 'scheduled'
  }
  
  mockCalendarEvents.push(calendarEvent)
  
  // Update lead with appointment reference and due date using service
  await leadService.update(leadId, {
    scheduledAppointment: calendarEvent,
    nextActionDue: appointmentStart.toISOString(),
    lastActivity: new Date().toISOString()
  })
  
  return calendarEvent
}

// Conversion helpers
export const createLeadFromOpportunity = async (opportunityData, activities) => {
  await delay()
  
  // Use service layer to create lead
  const newLead = await leadService.create({
    customerId: opportunityData.customerId,
    status: 'Open',
    priority: 'Normal',
    requestedCar: opportunityData.requestedCar,
    carStatus: opportunityData.requestedCar?.stockDays !== null && opportunityData.requestedCar?.stockDays !== undefined ? 'In Stock' : 'Not available',
    requestType: 'Generic Sales',
    source: opportunityData.source || 'Marketing',
    fiscalEntity: opportunityData.fiscalEntity || '',
    sourceDetails: opportunityData.sourceDetails || '',
    assignee: opportunityData.assignee || 'Michael Thomas',
    assigneeInitials: opportunityData.assigneeInitials || 'MT',
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    nextActionDue: '1h',
    tags: opportunityData.tags || [],
    stage: 'Open',
    isDisqualified: false,
    disqualifyReason: null
  })
  
  // Migrate activities using repository
  for (const activity of activities) {
    await activityRepository.create({
      leadId: newLead.id,
      opportunityId: undefined, // Remove opportunity reference
      timestamp: activity.timestamp,
      type: activity.type,
      user: activity.user,
      action: activity.action,
      content: activity.content,
      data: activity.data
    })
  }
  
  return newLead
}

// Detect urgent leads that need qualification
// NOTE: This business logic will move to Service Layer in Step 1.3 (or remain here as query logic)
export const detectUrgentLeads = async (userId) => {
  await delay()
  
  const user = mockUsers.find(u => u.id === userId)
  if (!user) return []
  
  const questions = []
  const now = new Date()
  const THRESHOLD_DAYS = 7
  
  // Get all leads assigned to this user using service
  const allLeadsResult = await leadService.findAll({})
  const allLeads = allLeadsResult.data
  const userLeads = allLeads.filter(lead => {
    const userByName = mockUsers.find(u => u.name === lead.assignee)
    return userByName && userByName.id === userId
  })
  
  // Find leads in "Open" stage for 7-14 days without conversion (urgent window)
  for (const lead of userLeads) {
    // Check if lead is in Open stage
    if (lead.stage !== 'Open') continue
    
    // Check if lead is disqualified
    if (lead.isDisqualified) continue
    
    // Calculate days since creation
    const createdDate = new Date(lead.createdAt)
    const daysSinceCreation = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24))
    
    // Only show if 7-14 days old (urgent actionable window)
    if (daysSinceCreation >= THRESHOLD_DAYS && daysSinceCreation <= 14) {
      const enrichedLead = enrichLeadWithCustomer(lead)
      questions.push({
        id: `lead-qualification-urgency-${lead.id}`,
        type: 'lead-qualification-urgency',
        priority: 1, // Critical
        question: `This lead from ${enrichedLead.customer.name} has been in the system for ${daysSinceCreation} days without qualification. Have you been able to contact them?`,
        customer: enrichedLead.customer,
        leadId: lead.id,
        lead: enrichedLead,
        createdAt: lead.createdAt,
        daysOld: daysSinceCreation
      })
    }
  }
  
  return questions
}

export const fetchTasksDueToday = async () => {
  await delay()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  // Use service to fetch all leads
  const allLeadsResult = await leadService.findAll({})
  const allLeads = allLeadsResult.data
  
  return allLeads.filter(lead => {
    if (!lead.nextActionDue) return false
    const dueDate = new Date(lead.nextActionDue)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate >= today && dueDate < tomorrow && !lead.isDisqualified
  })
}

export const fetchTasksDueUpcoming = async (days = 7) => {
  await delay()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endDate = new Date(today)
  endDate.setDate(endDate.getDate() + days)
  
  // Use service to fetch all leads
  const allLeadsResult = await leadService.findAll({})
  const allLeads = allLeadsResult.data
  
  return allLeads.filter(lead => {
    if (!lead.nextActionDue) return false
    const dueDate = new Date(lead.nextActionDue)
    return dueDate >= today && dueDate < endDate && !lead.isDisqualified
  })
}
