import { getMockData } from './mockData/localeLoader.js'
import { mockCustomers } from './mockData'

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

// Filter contacts (customers without company field)
const getContacts = () => {
  return mockCustomers.filter(c => !c.company || c.company === '')
}

export const fetchContacts = async (filters = {}) => {
  await delay()
  
  let results = getContacts()
  
  if (filters.search) {
    const search = filters.search.toLowerCase()
    results = results.filter(contact => 
      contact.name.toLowerCase().includes(search) ||
      contact.email.toLowerCase().includes(search)
    )
  }
  
  return { data: results, total: results.length }
}

export const fetchContactById = async (id) => {
  await delay()
  const contacts = getContacts()
  const contact = contacts.find(c => c.id === parseInt(id))
  if (!contact) throw new Error('Contact not found')
  return contact
}

export const createContact = async (contactData) => {
  await delay()
  const newContact = {
    id: mockCustomers.length + 1,
    ...contactData,
    company: null, // Ensure no company field for contacts
    createdAt: new Date().toISOString(),
    lastContact: new Date().toISOString()
  }
  mockCustomers.push(newContact)
  return newContact
}

export const updateContact = async (id, updates) => {
  await delay()
  const contacts = getContacts()
  const index = contacts.findIndex(c => c.id === parseInt(id))
  if (index === -1) throw new Error('Contact not found')
  
  const customerIndex = mockCustomers.findIndex(c => c.id === parseInt(id))
  if (customerIndex !== -1) {
    // Ensure company stays null for contacts
    mockCustomers[customerIndex] = { ...mockCustomers[customerIndex], ...updates, company: null }
  }
  
  return mockCustomers[customerIndex]
}

export const deleteContact = async (id) => {
  await delay()
  const index = mockCustomers.findIndex(c => c.id === parseInt(id))
  if (index === -1) throw new Error('Contact not found')
  
  mockCustomers.splice(index, 1)
  return { success: true }
}

export const addRequestedCarToContact = async (contactId, carData) => {
  await delay()
  const contacts = getContacts()
  const contact = contacts.find(c => c.id === parseInt(contactId))
  if (!contact) throw new Error('Contact not found')
  
  // Find in mockCustomers and update
  const customerIndex = mockCustomers.findIndex(c => c.id === parseInt(contactId))
  if (customerIndex === -1) throw new Error('Contact not found')
  
  // Set the requested car (replacing any existing one)
  mockCustomers[customerIndex].requestedCar = {
    ...carData,
    id: Date.now()
  }
  
  return { ...mockCustomers[customerIndex] }
}

// Convert contact to lead
export const convertContactToLead = async (contactId) => {
  await delay()
  const contacts = getContacts()
  const contact = contacts.find(c => c.id === parseInt(contactId))
  if (!contact) throw new Error('Contact not found')
  if (!contact.requestedCar) throw new Error('Contact must have requested car')
  
  // Import leads API
  const { createLead } = await import('./leads.js')
  
  const newLead = await createLead({
    customerId: contact.id,
    requestedCar: contact.requestedCar,
    source: contact.source || 'Direct',
    tags: contact.tags || [],
    stage: 'Open',
    status: 'Open',
    priority: 'Normal'
  })
  
  return newLead
}

// Convert contact to opportunity
export const convertContactToOpportunity = async (contactId) => {
  await delay()
  const contacts = getContacts()
  const contact = contacts.find(c => c.id === parseInt(contactId))
  if (!contact) throw new Error('Contact not found')
  if (!contact.requestedCar) throw new Error('Contact must have requested car')
  
  // Import opportunities API
  const { createOpportunity } = await import('./opportunities.js')
  
  const newOpp = await createOpportunity({
    customerId: contact.id,
    vehicle: contact.requestedCar, // Opportunity uses 'vehicle' not 'requestedCar'
    source: contact.source || 'Direct',
    tags: contact.tags || [],
    stage: 'Qualified',
    value: contact.requestedCar.price || 0
  })
  
  return newOpp
}

// Fetch all leads associated with a customer or account
export const fetchLeadsByCustomerId = async (customerId, accountId = null) => {
  await delay()
  const { mockLeads } = getMockData()
  let leads = []
  
  if (accountId) {
    // Fetch leads by account_id (leads linked to account)
    leads = mockLeads.filter(lead => {
      const leadAccountId = lead.account_id || lead.accountId
      return leadAccountId && parseInt(leadAccountId) === parseInt(accountId)
    })
  } else {
    // Match by customerId (leads now have customerId field)
    leads = mockLeads.filter(lead => lead.customerId === parseInt(customerId))
  }
  
  // Enrich leads with contact reference info if available
  const enrichedLeads = leads.map(lead => ({
    ...lead,
    contactReference: lead.contactId ? {
      id: lead.contactId,
      name: lead.contactName || 'Unknown Contact'
    } : null
  }))
  
  return { data: enrichedLeads, total: enrichedLeads.length }
}

// Fetch all opportunities associated with a customer or account
export const fetchOpportunitiesByCustomerId = async (customerId, accountId = null) => {
  await delay()
  const { mockOpportunities } = getMockData()
  let opportunities = []
  
  if (accountId) {
    // Fetch opportunities by account_id (opportunities linked to account)
    opportunities = mockOpportunities.filter(opp => {
      const oppAccountId = opp.account_id || opp.accountId
      return oppAccountId && parseInt(oppAccountId) === parseInt(accountId)
    })
  } else {
    // Match by customerId (opportunities now have customerId field)
    opportunities = mockOpportunities.filter(opp => opp.customerId === parseInt(customerId))
  }
  
  // Enrich opportunities with contact reference info if available
  const enrichedOpportunities = opportunities.map(opp => ({
    ...opp,
    contactReference: opp.contactId ? {
      id: opp.contactId,
      name: opp.contactName || 'Unknown Contact'
    } : null
  }))
  
  return { data: enrichedOpportunities, total: enrichedOpportunities.length }
}

// Fetch leads by account ID
export const fetchLeadsByAccountId = async (accountId) => {
  return await fetchLeadsByCustomerId(null, accountId)
}

// Fetch opportunities by account ID
export const fetchOpportunitiesByAccountId = async (accountId) => {
  return await fetchOpportunitiesByCustomerId(null, accountId)
}

// Fetch all cars associated with a customer or account (requested, offered, drove, purchased, owned)
export const fetchCustomerCars = async (customerId) => {
  await delay()
  const { mockLeads, mockOpportunities, mockActivities, mockCalendarEvents } = getMockData()
  const cars = []
  
  // Get customer/account from mockCustomers
  const customer = mockCustomers.find(c => c.id === parseInt(customerId))
  const contactId = customer?.id || customerId
  
  // Check if this is an account (has company field) - accounts own vehicles
  const isAccount = customer?.company && customer.company !== ''
  
  // 1. Requested cars - from leads/contacts requestedCar field
  const leads = mockLeads.filter(lead => lead.customerId === parseInt(customerId))
  leads.forEach(lead => {
    if (lead.requestedCar) {
      cars.push({
        ...lead.requestedCar,
        id: `requested-${lead.id}`,
        type: 'requested',
        leadId: lead.id,
        leadStage: lead.stage
      })
    }
  })
  
  // Also check customer's requestedCar
  if (customer?.requestedCar) {
    cars.push({
      ...customer.requestedCar,
      id: `requested-contact-${customer.id}`,
      type: 'requested',
      contactId: customer.id
    })
  }
  
  // 2. Offered cars - from offer activities in opportunities
  const opportunities = mockOpportunities.filter(opp => opp.customerId === parseInt(customerId))
  opportunities.forEach(opp => {
    const offerActivities = mockActivities.filter(
      activity => activity.opportunityId === opp.id && activity.type === 'offer'
    )
    offerActivities.forEach(activity => {
      if (activity.data?.vehicle) {
        cars.push({
          ...activity.data.vehicle,
          id: `offered-${activity.id}`,
          type: 'offered',
          opportunityId: opp.id,
          opportunityStage: opp.stage,
          offerDate: activity.timestamp
        })
      }
    })
  })
  
  // 3. Drove cars - from calendar events with type 'test-drive'
  const testDriveEvents = mockCalendarEvents.filter(
    event => event.customerId === parseInt(customerId) && event.type === 'test-drive'
  )
  testDriveEvents.forEach(event => {
    if (event.vehicle) {
      cars.push({
        brand: event.vehicle.split(' ')[0] || '',
        model: event.vehicle.split(' ').slice(1).join(' ') || '',
        id: `drove-${event.id}`,
        type: 'drove',
        eventId: event.id,
        testDriveDate: event.start,
        vehicle: event.vehicle
      })
    }
  })
  
  // 4. Purchased cars - from opportunities with stage 'Closed Won'
  opportunities.forEach(opp => {
    if (opp.stage === 'Closed Won' && opp.vehicle) {
      cars.push({
        ...opp.vehicle,
        id: `purchased-${opp.id}`,
        type: 'purchased',
        opportunityId: opp.id,
        purchaseDate: opp.contractDate || opp.lastActivity
      })
    }
  })
  
  // 5. Owned vehicles - from account's vehicles array (accounts own vehicles)
  if (isAccount && customer?.vehicles && Array.isArray(customer.vehicles)) {
    customer.vehicles.forEach(vehicle => {
      if (vehicle.type === 'owned' || !vehicle.type) {
        cars.push({
          ...vehicle,
          id: vehicle.id || `owned-${customer.id}-${Date.now()}`,
          type: 'owned',
          accountId: customer.id
        })
      }
    })
  }
  
  // 6. If fetching for account, also get vehicles from related contacts (driven vehicles)
  if (isAccount) {
    const accountId = customer.id
    const relatedContacts = getContacts().filter(c => {
      const contactAccountId = c.account_id || c.accountId
      return contactAccountId && parseInt(contactAccountId) === parseInt(accountId)
    })
    
    // Get driven vehicles from related contacts
    relatedContacts.forEach(contact => {
      if (contact.vehicles && Array.isArray(contact.vehicles)) {
        contact.vehicles.forEach(vehicle => {
          if (vehicle.type === 'driven') {
            cars.push({
              ...vehicle,
              id: vehicle.id || `driven-${contact.id}-${Date.now()}`,
              type: 'driven',
              contactId: contact.id,
              contactName: contact.name,
              accountId: accountId
            })
          }
        })
      }
    })
  }
  
  return { data: cars, total: cars.length }
}

// Fetch vehicles by account ID (vehicles owned by accounts)
export const fetchVehiclesByAccountId = async (accountId) => {
  await delay()
  // Use the same logic as fetchCustomerCars but specifically for accounts
  return await fetchCustomerCars(accountId)
}

// Add vehicle to customer
export const addVehicleToCustomer = async (customerId, vehicleData) => {
  await delay()
  const customerIndex = mockCustomers.findIndex(c => c.id === parseInt(customerId))
  if (customerIndex === -1) throw new Error('Customer not found')
  
  const customer = mockCustomers[customerIndex]
  
  // Initialize vehicles array if it doesn't exist
  if (!customer.vehicles) {
    customer.vehicles = []
  }
  
  // Create vehicle object with ID
  const vehicle = {
    ...vehicleData,
    id: vehicleData.id || Date.now()
  }
  
  // Handle different vehicle types
  if (vehicleData.type === 'requested') {
    // For requested type, also update requestedCar field for backward compatibility
    customer.requestedCar = {
      brand: vehicleData.brand,
      model: vehicleData.model,
      year: vehicleData.year,
      price: vehicleData.price,
      requestType: vehicleData.requestType,
      requestMessage: vehicleData.requestMessage,
      image: vehicleData.image,
      dealership: vehicleData.dealership,
      fuelType: vehicleData.fuelType,
      gearType: vehicleData.gearType,
      kilometers: vehicleData.kilometers,
      id: vehicle.id
    }
  }
  
  // Add vehicle to vehicles array
  customer.vehicles.push(vehicle)
  
  // Update customer in mockCustomers
  mockCustomers[customerIndex] = customer
  
  return { ...customer }
}

// Fetch all tasks associated with a customer
export const fetchTasksByCustomerId = async (customerId) => {
  await delay()
  const { mockTasks } = getMockData()
  const tasks = mockTasks.filter(task => task.customerId === parseInt(customerId))
  return { data: tasks, total: tasks.length }
}

// Fetch all tasks associated with a lead
export const fetchTasksByLeadId = async (leadId) => {
  await delay()
  const { mockTasks } = getMockData()
  const tasks = mockTasks.filter(task => task.leadId === parseInt(leadId))
  return { data: tasks, total: tasks.length }
}

// Fetch all tasks associated with an opportunity
export const fetchTasksByOpportunityId = async (opportunityId) => {
  await delay()
  const { mockTasks } = getMockData()
  const tasks = mockTasks.filter(task => task.opportunityId === parseInt(opportunityId))
  return { data: tasks, total: tasks.length }
}

// Fetch all contacts associated with an account
export const fetchContactsByAccountId = async (accountId) => {
  await delay()
  const contacts = getContacts()
  // Filter contacts where account_id matches
  const relatedContacts = contacts.filter(contact => {
    const contactAccountId = contact.account_id || contact.accountId
    return contactAccountId && parseInt(contactAccountId) === parseInt(accountId)
  })
  return { data: relatedContacts, total: relatedContacts.length }
}
