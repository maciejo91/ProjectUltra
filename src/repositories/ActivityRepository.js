import { BaseRepository } from './BaseRepository.js'
import { getMockData } from '@/api/mockData/localeLoader.js'

/**
 * Activity Repository
 * 
 * Abstracts data access for activities (notes, calls, emails, etc.).
 * Maps to REST API endpoint: /activities
 * 
 * Current implementation uses mock data arrays.
 * When real API is integrated, this will call REST endpoints:
 * - findAll(filters) → GET /activities?{filters}
 * - findAllByLeadId(leadId) → GET /activities?leadId={leadId}
 * - findAllByOpportunityId(opportunityId) → GET /activities?opportunityId={opportunityId}
 * - findById(id) → GET /activities/{id}
 * - create(data) → POST /activities
 * - update(id, data) → PUT /activities/{id}
 * - delete(id) → DELETE /activities/{id}
 */
export class ActivityRepository extends BaseRepository {
  constructor() {
    super([]) // Initialize with empty array, data loaded dynamically
  }
  
  /**
   * Get current data source (locale-aware)
   */
  get dataSource() {
    return getMockData().mockActivities
  }

  /**
   * Find all activities matching filters
   * @param {Object} filters - Filter criteria (leadId, opportunityId, type)
   * @returns {Promise<Array>} Array of activities
   */
  async findAll(filters = {}) {
    await new Promise(resolve => setTimeout(resolve, 0))
    
    let results = [...this.dataSource]
    
    // Apply filters
    if (filters.leadId !== undefined) {
      results = results.filter(activity => activity.leadId === parseInt(filters.leadId))
    }
    if (filters.opportunityId !== undefined) {
      results = results.filter(activity => activity.opportunityId === parseInt(filters.opportunityId))
    }
    if (filters.type) {
      results = results.filter(activity => activity.type === filters.type)
    }
    
    return results
  }

  /**
   * Find all activities for a specific lead
   * @param {number|string} leadId - Lead ID
   * @returns {Promise<Array>} Array of activities
   */
  async findAllByLeadId(leadId) {
    return this.findAll({ leadId })
  }

  /**
   * Find all activities for a specific opportunity
   * @param {number|string} opportunityId - Opportunity ID
   * @returns {Promise<Array>} Array of activities
   */
  async findAllByOpportunityId(opportunityId) {
    return this.findAll({ opportunityId })
  }

  /**
   * Find an activity by ID
   * @param {number|string} id - Activity ID
   * @returns {Promise<Object|null>} Activity or null if not found
   */
  async findById(id) {
    await new Promise(resolve => setTimeout(resolve, 0))
    const activity = this.dataSource.find(a => a.id === parseInt(id))
    return activity || null
  }

  /**
   * Create a new activity
   * @param {Object} data - Activity data
   * @returns {Promise<Object>} Created activity
   */
  async create(data) {
    await new Promise(resolve => setTimeout(resolve, 0))
    
    // Generate ID (in real API, server generates this)
    const newId = this.dataSource.length > 0 
      ? Math.max(...this.dataSource.map(a => a.id)) + 1 
      : 1
    
    const newActivity = {
      id: newId,
      leadId: data.leadId !== undefined ? parseInt(data.leadId) : undefined,
      opportunityId: data.opportunityId !== undefined ? parseInt(data.opportunityId) : undefined,
      timestamp: data.timestamp || new Date().toISOString(),
      type: data.type,
      user: data.user,
      action: data.action,
      content: data.content,
      data: data.data
    }
    
    this.dataSource.push(newActivity)
    return newActivity
  }

  /**
   * Update an existing activity
   * @param {number|string} id - Activity ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated activity
   */
  async update(id, updates) {
    await new Promise(resolve => setTimeout(resolve, 0))
    
    const activity = this.dataSource.find(a => a.id === parseInt(id))
    if (!activity) {
      throw new Error('Activity not found')
    }
    
    Object.assign(activity, updates, { timestamp: new Date().toISOString() })
    return activity
  }

  /**
   * Delete an activity
   * @param {number|string} id - Activity ID
   * @returns {Promise<Object>} Success object
   */
  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 0))
    
    const index = this.dataSource.findIndex(a => a.id === parseInt(id))
    if (index === -1) {
      throw new Error('Activity not found')
    }
    
    this.dataSource.splice(index, 1)
    return { success: true }
  }

  /**
   * Find activity by lead ID and activity ID (for updates/deletes)
   * @param {number|string} leadId - Lead ID
   * @param {number|string} activityId - Activity ID
   * @returns {Promise<Object|null>} Activity or null if not found
   */
  async findByLeadIdAndActivityId(leadId, activityId) {
    await new Promise(resolve => setTimeout(resolve, 0))
    const activity = this.dataSource.find(
      a => a.id === parseInt(activityId) && a.leadId === parseInt(leadId)
    )
    return activity || null
  }

  /**
   * Find activity by opportunity ID and activity ID (for updates/deletes)
   * @param {number|string} opportunityId - Opportunity ID
   * @param {number|string} activityId - Activity ID
   * @returns {Promise<Object|null>} Activity or null if not found
   */
  async findByOpportunityIdAndActivityId(opportunityId, activityId) {
    await new Promise(resolve => setTimeout(resolve, 0))
    const activity = this.dataSource.find(
      a => a.id === parseInt(activityId) && a.opportunityId === parseInt(opportunityId)
    )
    return activity || null
  }

  /**
   * Delete activity by lead ID and activity ID
   * @param {number|string} leadId - Lead ID
   * @param {number|string} activityId - Activity ID
   * @returns {Promise<Object>} Success object
   */
  async deleteByLeadIdAndActivityId(leadId, activityId) {
    await new Promise(resolve => setTimeout(resolve, 0))
    const index = this.dataSource.findIndex(
      a => a.id === parseInt(activityId) && a.leadId === parseInt(leadId)
    )
    if (index === -1) {
      throw new Error('Activity not found')
    }
    this.dataSource.splice(index, 1)
    return { success: true }
  }

  /**
   * Delete activity by opportunity ID and activity ID
   * @param {number|string} opportunityId - Opportunity ID
   * @param {number|string} activityId - Activity ID
   * @returns {Promise<Object>} Success object
   */
  async deleteByOpportunityIdAndActivityId(opportunityId, activityId) {
    await new Promise(resolve => setTimeout(resolve, 0))
    const index = this.dataSource.findIndex(
      a => a.id === parseInt(activityId) && a.opportunityId === parseInt(opportunityId)
    )
    if (index === -1) {
      throw new Error('Activity not found')
    }
    this.dataSource.splice(index, 1)
    return { success: true }
  }
}


