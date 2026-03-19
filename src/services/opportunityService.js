import { getDisplayStage, getDeliverySubstatus } from '@/utils/stageMapper'
import { OpportunityRepository } from '@/repositories/OpportunityRepository'
import { ActivityRepository } from '@/repositories/ActivityRepository'
import { CustomerRepository } from '@/repositories/CustomerRepository'

// Create repository instances
const opportunityRepository = new OpportunityRepository()
const activityRepository = new ActivityRepository()
const customerRepository = new CustomerRepository()

/**
 * Opportunity Service
 * 
 * Handles business logic and data transformation for opportunities.
 * This layer sits between API wrappers and repositories.
 * 
 * Responsibilities:
 * - Data enrichment (customer data, display stages, delivery substatus)
 * - Business logic
 * - Data transformation
 * - Validation
 */
export class OpportunityService {
  /**
   * Enrich opportunity with customer data
   * @param {Object} opportunity - Opportunity object
   * @returns {Object} Opportunity with customer data
   */
  enrichWithCustomer(opportunity) {
    if (!opportunity) return null
    
    // First try to find customer by customerId
    let customer = customerRepository.findByIdSync(opportunity.customerId)
    
    // If not found and opportunity has contactId (account-level), try to find by contactId
    if (!customer && opportunity.contactId) {
      customer = customerRepository.findByIdSync(opportunity.contactId)
    }
    
    // If customer found, use it
    if (customer) {
      return {
        ...opportunity,
        customer: {
          id: customer.id,
          name: customer.name,
          initials: customer.initials,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          isBusiness: !!customer.isBusiness
        }
      }
    }
    
    // If contactName is available (account-level opportunities), use it
    if (opportunity.contactName && opportunity.contactName.trim()) {
      const nameParts = opportunity.contactName.trim().split(' ').filter(Boolean)
      let initials = '??'
      if (nameParts.length >= 2) {
        initials = (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      } else if (nameParts.length === 1 && nameParts[0].length >= 2) {
        initials = nameParts[0].substring(0, 2).toUpperCase()
      } else if (nameParts.length === 1 && nameParts[0].length === 1) {
        initials = nameParts[0].toUpperCase() + '?'
      }
      
      return {
        ...opportunity,
        customer: {
          id: opportunity.contactId || opportunity.customerId,
          name: opportunity.contactName,
          initials: initials,
          email: '',
          phone: '',
          address: ''
        }
      }
    }
    
    // Last resort: Unknown Customer
    return {
      ...opportunity,
      customer: {
        id: opportunity.customerId,
        name: 'Unknown Customer',
        initials: '??',
        email: '',
        phone: '',
        address: ''
      }
    }
  }

  /**
   * Enrich opportunity with display stage, delivery substatus, and customer data
   * @param {Object} opportunity - Opportunity object
   * @returns {Promise<Object>} Enriched opportunity with display stage
   */
  async enrichWithStage(opportunity) {
    if (!opportunity) return null
    
    // Backward compatibility: Migrate old stage names
    let migratedStage = opportunity.stage
    let migratedSubstatus = opportunity.negotiationSubstatus
    
    if (opportunity.stage === 'Offer Sent') {
      migratedStage = 'In Negotiation'
      migratedSubstatus = 'Offer Sent'
    } else if (opportunity.stage === 'Awaiting Response') {
      migratedStage = 'In Negotiation'
      migratedSubstatus = 'Offer Sent'
    }
    
    // Migrate legacy "Awaiting Response" substatus to "Offer Sent"
    if (opportunity.negotiationSubstatus === 'Awaiting Response') {
      migratedSubstatus = 'Offer Sent'
    }
    
    const oppWithCustomer = this.enrichWithCustomer({ 
      ...opportunity, 
      stage: migratedStage,
      negotiationSubstatus: migratedSubstatus !== undefined ? migratedSubstatus : opportunity.negotiationSubstatus
    })
    
    // Fetch activities using repository
    const activities = await activityRepository.findAllByOpportunityId(opportunity.id)
    const displayStage = getDisplayStage({ ...oppWithCustomer, apiStatus: migratedStage, activities }, 'opportunity')
    
    // Calculate delivery substatus only for Closed Won opportunities
    const deliverySubstatus = displayStage === 'Closed Won' 
      ? getDeliverySubstatus({ ...oppWithCustomer, displayStage }, activities)
      : null
    
    return {
      ...oppWithCustomer,
      stage: migratedStage, // Use migrated stage
      apiStatus: migratedStage,
      displayStage,
      deliverySubstatus,
      activities // Include activities for stage calculation
    }
  }

  /**
   * Fetch all opportunities with enrichment
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Object>} Object with data and total
   */
  async findAll(filters = {}) {
    // Use repository to fetch opportunities
    let results = await opportunityRepository.findAll(filters)
    
    // Apply customer search filter (business logic)
    if (filters.search) {
      const search = filters.search.toLowerCase()
      results = results.filter(opp => {
        // Try to find customer by customerId or contactId
        let customer = customerRepository.findByIdSync(opp.customerId)
        if (!customer && opp.contactId) {
          customer = customerRepository.findByIdSync(opp.contactId)
        }
        const customerName = customer?.name || opp.contactName || ''
        return customerName.toLowerCase().includes(search) ||
          (opp.vehicle && opp.vehicle.brand && opp.vehicle.brand.toLowerCase().includes(search)) ||
          (opp.vehicle && opp.vehicle.model && opp.vehicle.model.toLowerCase().includes(search))
      })
    }
    
    // Enrich with display stages (use allSettled so one failing enrichment does not empty the list)
    const settled = await Promise.allSettled(results.map(opp => this.enrichWithStage(opp)))
    const enrichedResults = settled
      .filter(p => p.status === 'fulfilled')
      .map(p => p.value)
      .filter(Boolean)
    const rejectedCount = settled.filter(p => p.status === 'rejected').length
    if (rejectedCount > 0 && import.meta.env.DEV) {
      console.warn(`OpportunityService: ${rejectedCount} opportunity(ies) skipped due to enrichment error`)
    }

    return { data: enrichedResults, total: enrichedResults.length }
  }

  /**
   * Fetch opportunity by ID with enrichment
   * @param {number|string} id - Opportunity ID
   * @returns {Promise<Object>} Enriched opportunity
   */
  async findById(id) {
    const opportunity = await opportunityRepository.findById(id)
    if (!opportunity) throw new Error('Opportunity not found')
    return await this.enrichWithStage(opportunity)
  }

  /**
   * Create a new opportunity with enrichment
   * @param {Object} data - Opportunity data
   * @returns {Promise<Object>} Created and enriched opportunity
   */
  async create(data) {
    const newOpportunity = await opportunityRepository.create(data)
    return await this.enrichWithStage(newOpportunity)
  }

  /**
   * Update an existing opportunity with enrichment
   * @param {number|string} id - Opportunity ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated and enriched opportunity
   */
  async update(id, updates) {
    const updatedOpportunity = await opportunityRepository.update(id, updates)
    return await this.enrichWithStage(updatedOpportunity)
  }

  /**
   * Delete an opportunity
   * @param {number|string} id - Opportunity ID
   * @returns {Promise<Object>} Success object
   */
  async delete(id) {
    return await opportunityRepository.delete(id)
  }
}

// Export singleton instance
export const opportunityService = new OpportunityService()



