import { getDisplayStage } from '@/utils/stageMapper'
import { LeadRepository } from '@/repositories/LeadRepository'
import { CustomerRepository } from '@/repositories/CustomerRepository'

// Create repository instances
const leadRepository = new LeadRepository()
const customerRepository = new CustomerRepository()

/**
 * Lead Service
 * 
 * Handles business logic and data transformation for leads.
 * This layer sits between API wrappers and repositories.
 * 
 * Responsibilities:
 * - Data enrichment (customer data, display stages)
 * - Business logic
 * - Data transformation
 * - Validation
 */
export class LeadService {
  /**
   * Enrich lead with customer data
   * @param {Object} lead - Lead object
   * @returns {Object} Lead with customer data
   */
  enrichWithCustomer(lead) {
    if (!lead) return null
    
    // First try to find customer by customerId
    let customer = customerRepository.findByIdSync(lead.customerId)
    
    // If not found and lead has contactId (account-level), try to find by contactId
    if (!customer && lead.contactId) {
      customer = customerRepository.findByIdSync(lead.contactId)
    }
    
    // If customer found, use it
    if (customer) {
      return {
        ...lead,
        customer: {
          id: customer.id,
          name: customer.name,
          initials: customer.initials,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          isBusiness: !!customer.isBusiness,
          tags: Array.isArray(customer.tags) ? customer.tags : []
        }
      }
    }
    
    // If contactName is available (account-level leads), use it
    if (lead.contactName && lead.contactName.trim()) {
      const nameParts = lead.contactName.trim().split(' ').filter(Boolean)
      let initials = '??'
      if (nameParts.length >= 2) {
        initials = (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      } else if (nameParts.length === 1 && nameParts[0].length >= 2) {
        initials = nameParts[0].substring(0, 2).toUpperCase()
      } else if (nameParts.length === 1 && nameParts[0].length === 1) {
        initials = nameParts[0].toUpperCase() + '?'
      }
      
      return {
        ...lead,
        customer: {
          id: lead.contactId || lead.customerId,
          name: lead.contactName,
          initials: initials,
          email: '',
          phone: '',
          address: ''
        }
      }
    }
    
    // Last resort: Unknown Customer
    return {
      ...lead,
      customer: {
        id: lead.customerId,
        name: 'Unknown Customer',
        initials: '??',
        email: '',
        phone: '',
        address: ''
      }
    }
  }

  /**
   * Enrich lead with display stage and customer data
   * @param {Object} lead - Lead object
   * @returns {Object} Enriched lead with display stage
   */
  enrichWithStage(lead) {
    if (!lead) return null
    
    const leadWithCustomer = this.enrichWithCustomer(lead)
    
    // Explicitly preserve isDisqualified - critical for state machine
    const enrichedLead = {
      ...leadWithCustomer,
      apiStatus: lead.stage,
      // Ensure isDisqualified is explicitly set (default to false if missing)
      isDisqualified: lead.isDisqualified === true,
      displayStage: getDisplayStage({ ...leadWithCustomer, apiStatus: lead.stage, isDisqualified: lead.isDisqualified === true }, 'lead')
    }
    
    return enrichedLead
  }

  /**
   * Fetch all leads with enrichment
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Object>} Object with data and total
   */
  async findAll(filters = {}) {
    // Use repository to fetch leads
    let results = await leadRepository.findAll(filters)
    
    // Apply customer search filter (business logic)
    if (filters.search) {
      const search = filters.search.toLowerCase()
      results = results.filter(lead => {
        // Try to find customer by customerId or contactId
        let customer = customerRepository.findByIdSync(lead.customerId)
        if (!customer && lead.contactId) {
          customer = customerRepository.findByIdSync(lead.contactId)
        }
        const customerName = customer?.name || lead.contactName || ''
        return customerName.toLowerCase().includes(search) ||
          (lead.requestedCar && lead.requestedCar.brand && lead.requestedCar.brand.toLowerCase().includes(search)) ||
          (lead.requestedCar && lead.requestedCar.model && lead.requestedCar.model.toLowerCase().includes(search))
      })
    }
    
    // Enrich with display stages
    const enrichedResults = results.map(lead => this.enrichWithStage(lead))
    
    return { data: enrichedResults, total: enrichedResults.length }
  }

  /**
   * Fetch lead by ID with enrichment
   * @param {number|string} id - Lead ID
   * @returns {Promise<Object>} Enriched lead
   */
  async findById(id) {
    const lead = await leadRepository.findById(id)
    if (!lead) throw new Error('Lead not found')
    return this.enrichWithStage(lead)
  }

  /**
   * Create a new lead with enrichment
   * @param {Object} data - Lead data
   * @returns {Promise<Object>} Created and enriched lead
   */
  async create(data) {
    const newLead = await leadRepository.create(data)
    return this.enrichWithStage(newLead)
  }

  /**
   * Update an existing lead with enrichment
   * @param {number|string} id - Lead ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated and enriched lead
   */
  async update(id, updates) {
    const updatedLead = await leadRepository.update(id, updates)
    return this.enrichWithStage(updatedLead)
  }

  /**
   * Delete a lead
   * @param {number|string} id - Lead ID
   * @returns {Promise<Object>} Success object
   */
  async delete(id) {
    return await leadRepository.delete(id)
  }
}

// Export singleton instance
export const leadService = new LeadService()

