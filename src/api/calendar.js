import { mockCalendarEvents } from './mockData'

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

export const fetchCalendarEvents = async (filters = {}) => {
  await delay()
  let list = [...mockCalendarEvents]
  if (filters.eventTypes?.length) {
    list = list.filter((e) => filters.eventTypes.includes(e.type))
  }
  if (filters.dealership) {
    list = list.filter((e) => e.dealership === filters.dealership)
  }
  if (filters.team) {
    list = list.filter((e) => e.team === filters.team)
  }
  if (filters.includeCancelled === false) {
    list = list.filter((e) => e.status !== 'cancelled')
  }
  if (filters.noShowsOnly) {
    list = list.filter((e) => e.status === 'no-show')
  }
  if (filters.currentUserId) {
    list = list.filter((e) => e.assigneeId === filters.currentUserId)
  }
  return list
}

export const createCalendarEvent = async (eventData) => {
  await delay()
  const newEvent = {
    id: mockCalendarEvents.length + 1,
    assigneeId: eventData.assigneeId || null,
    assigneeType: eventData.assigneeType || 'user',
    teamId: eventData.teamId || null,
    team: eventData.team || null,
    ...eventData
  }
  mockCalendarEvents.push(newEvent)
  return newEvent
}

export const updateCalendarEvent = async (id, updates) => {
  await delay()
  const index = mockCalendarEvents.findIndex(event => event.id === id)
  if (index !== -1) {
    mockCalendarEvents[index] = { ...mockCalendarEvents[index], ...updates }
    return mockCalendarEvents[index]
  }
  return null
}

export const deleteCalendarEvent = async (id) => {
  await delay()
  const index = mockCalendarEvents.findIndex(event => event.id === id)
  if (index !== -1) {
    mockCalendarEvents.splice(index, 1)
    return true
  }
  return false
}

export const fetchTodayAppointments = async () => {
  await delay()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  return mockCalendarEvents.filter(event => {
    const eventDate = new Date(event.start)
    eventDate.setHours(0, 0, 0, 0)
    return eventDate >= today && eventDate < tomorrow
  })
}

export const fetchUpcomingAppointments = async (days = 7) => {
  await delay()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endDate = new Date(today)
  endDate.setDate(endDate.getDate() + days)
  
  return mockCalendarEvents.filter(event => {
    const eventDate = new Date(event.start)
    return eventDate >= today && eventDate < endDate
  })
}

/** Customer-facing appointment types (appointment, test-drive, meeting, call, delivery). */
const APPOINTMENT_TYPES = ['appointment', 'test-drive', 'meeting', 'call', 'delivery', 'offsite', 'workshop']

/**
 * Fetch all appointments (calendar events) for a customer.
 * @param {number} customerId
 * @returns {Promise<Array>} Sorted by start date descending (newest first).
 */
export const fetchAppointmentsByCustomerId = async (customerId) => {
  await delay()
  return mockCalendarEvents
    .filter(
      (e) =>
        e.customerId === parseInt(customerId) && APPOINTMENT_TYPES.includes(e.type)
    )
    .sort((a, b) => new Date(b.start) - new Date(a.start))
}

export const fetchCalendarFilterOptions = async () => {
  await delay()
  
  // Extract unique values from calendar events
  const eventTypes = [
    { value: 'test-drive', label: 'Test Drive' },
    { value: 'appointment', label: 'Dealership Visit' },
    { value: 'offsite', label: 'Offsite Visit' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'call', label: 'Call' },
    { value: 'delivery', label: 'Delivery' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'training', label: 'Training' },
    { value: 'marketing', label: 'Marketing Event' },
    { value: 'leave', label: 'Leave' },
    { value: 'memo', label: 'Memo' },
    { value: 'recall', label: 'Recall' },
    { value: 'absence', label: 'Absence' },
    { value: 'other', label: 'Other' }
  ]
  
  // Mock dealerships
  const dealerships = ['Main Dealership', 'Downtown Branch', 'Westside Location']
  
  // Mock teams
  const teams = ['Sales Team A', 'Sales Team B', 'Service Team']
  
  // Mock users (would typically come from users API)
  const users = [
    { id: 1, name: 'Giovanni Russo' },
    { id: 2, name: 'Giulia Ferri' },
    { id: 3, name: 'Michele Romano' }
  ]
  
  return {
    eventTypes,
    dealerships,
    teams,
    users
  }
}