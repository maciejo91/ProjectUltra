import { BaseRepository } from './BaseRepository.js'
import { getMockData } from '@/api/mockData/localeLoader.js'

const STORAGE_KEY = 'projectUltra.createdOpportunities'

/**
 * Opportunity Repository
 *
 * Abstracts data access for opportunities.
 * Maps to REST API endpoint: /opportunities
 *
 * Current implementation uses mock data arrays.
 * Opportunities created from leads are persisted to localStorage so they survive page refresh.
 * When real API is integrated, this will call REST endpoints:
 * - findAll() → GET /opportunities
 * - findById(id) → GET /opportunities/{id}
 * - create(data) → POST /opportunities
 * - update(id, data) → PUT /opportunities/{id}
 * - delete(id) → DELETE /opportunities/{id}
 */
export class OpportunityRepository extends BaseRepository {
  constructor() {
    super([]) // Initialize with empty array, data loaded dynamically
  }

  getCreatedOpportunities() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  saveCreatedOpportunities(opportunities) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(opportunities))
    } catch (e) {
      console.warn('Failed to persist opportunities to localStorage:', e)
    }
  }
  
  /**
   * Get current data source (locale-aware)
   */
  get dataSource() {
    return getMockData().mockOpportunities
  }

  /**
   * Find all opportunities matching filters
   * @param {Object} filters - Filter criteria (stage, assignee, search)
   * @returns {Promise<Array>} Array of opportunities
   */
  async findAll(filters = {}) {
    // Simulate API delay (will be removed when real API is integrated)
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const mockIds = new Set(this.dataSource.map(o => o.id))
    const created = this.getCreatedOpportunities().filter(o => !mockIds.has(o.id))
    let results = [...this.dataSource, ...created]
    
    // Apply filters
    if (filters.stage) {
      results = results.filter(opp => opp.stage === filters.stage)
    }
    if (filters.assignee) {
      results = results.filter(opp => opp.assignee === filters.assignee)
    }
    if (filters.search) {
      const search = filters.search.toLowerCase()
      results = results.filter(opp => {
        // Note: Customer filtering will be handled by service layer
        return (opp.vehicle && opp.vehicle.brand && opp.vehicle.brand.toLowerCase().includes(search)) ||
               (opp.vehicle && opp.vehicle.model && opp.vehicle.model.toLowerCase().includes(search))
      })
    }
    
    // Ensure opportunity id: 1 always has today's appointment (for demo purposes)
    return this.ensureTodayAppointment(results)
  }

  /**
   * Find an opportunity by ID
   * @param {number|string} id - Opportunity ID
   * @returns {Promise<Object|null>} Opportunity or null if not found
   */
  async findById(id) {
    await new Promise(resolve => setTimeout(resolve, 300))
    const numId = parseInt(id)
    let opportunity = this.dataSource.find(o => o.id === numId)
    if (!opportunity) {
      opportunity = this.getCreatedOpportunities().find(o => o.id === numId)
    }
    if (!opportunity) return null
    
    // Ensure opportunity id: 1 always has today's appointment (for demo purposes)
    return this.ensureTodayAppointment(opportunity)
  }

  /**
   * Create a new opportunity
   * @param {Object} data - Opportunity data
   * @returns {Promise<Object>} Created opportunity
   */
  async create(data) {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const allIds = [
      ...this.dataSource.map(o => o.id),
      ...this.getCreatedOpportunities().map(o => o.id)
    ]
    const newId = allIds.length > 0 ? Math.max(...allIds) + 1 : 1
    
    const newOpportunity = {
      id: newId,
      customerId: data.customerId,
      requestedCar: data.requestedCar || null,
      vehicle: data.vehicle || data.requestedCar || null,
      selectedVehicle: data.selectedVehicle || null,
      stage: data.stage || 'Qualified',
      tags: data.tags || [],
      value: data.value || 0,
      expectedCloseDate: data.expectedCloseDate || null,
      assignee: data.assignee || null,
      source: data.source || 'Direct',
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      scheduledAppointment: data.scheduledAppointment || null,
      contractDate: data.contractDate || null,
      postponedTasks: data.postponedTasks || {},
      actualDeliveryDate: data.actualDeliveryDate || null,
      skipTaskReTrigger: data.skipTaskReTrigger || false,
      tradeIns: data.tradeIns || [],
      financingOptions: data.financingOptions || []
    }
    
    this.dataSource.push(newOpportunity)
    const created = this.getCreatedOpportunities()
    created.push(newOpportunity)
    this.saveCreatedOpportunities(created)
    return newOpportunity
  }

  /**
   * Update an existing opportunity
   * @param {number|string} id - Opportunity ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated opportunity
   */
  async update(id, updates) {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const numId = parseInt(id)
    const { displayStage, ...updatesToStore } = updates
    
    const index = this.dataSource.findIndex(o => o.id === numId)
    if (index !== -1) {
      this.dataSource[index] = { ...this.dataSource[index], ...updatesToStore }
      return this.dataSource[index]
    }
    
    const created = this.getCreatedOpportunities()
    const createdIndex = created.findIndex(o => o.id === numId)
    if (createdIndex !== -1) {
      created[createdIndex] = { ...created[createdIndex], ...updatesToStore }
      this.saveCreatedOpportunities(created)
      return created[createdIndex]
    }
    
    throw new Error('Opportunity not found')
  }

  /**
   * Delete an opportunity
   * @param {number|string} id - Opportunity ID
   * @returns {Promise<Object>} Success object
   */
  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const numId = parseInt(id)
    const index = this.dataSource.findIndex(o => o.id === numId)
    if (index !== -1) {
      this.dataSource.splice(index, 1)
      return { success: true }
    }
    
    const created = this.getCreatedOpportunities()
    const createdIndex = created.findIndex(o => o.id === numId)
    if (createdIndex !== -1) {
      created.splice(createdIndex, 1)
      this.saveCreatedOpportunities(created)
      return { success: true }
    }
    
    throw new Error('Opportunity not found')
  }

  /**
   * Generate next available opportunity ID
   * (Helper method - will not be needed when using real API)
   * @returns {number} Next available ID
   */
  generateId() {
    return this.dataSource.length > 0 
      ? Math.max(...this.dataSource.map(o => o.id)) + 1 
      : 1
  }

  /**
   * Ensure opportunity id: 1 has today's appointment
   * (Helper method for demo purposes - ensures "Mark as Showed Up" and "Mark as No-Show" are visible)
   * @param {Object|Array} opportunityOrArray - Single opportunity object or array of opportunities
   * @returns {Object|Array} Opportunity or array with id: 1 updated to have today's appointment
   */
  ensureTodayAppointment(opportunityOrArray) {
    const isArray = Array.isArray(opportunityOrArray)
    const opportunities = isArray ? opportunityOrArray : [opportunityOrArray]
    
    const today = new Date()
    const startDate = new Date(today)
    startDate.setHours(14, 0, 0, 0)
    const endDate = new Date(today)
    endDate.setHours(15, 0, 0, 0)
    
    const updatedOpportunities = opportunities.map(opp => {
      if (opp && opp.id === 1) {
        // Ensure opportunity id: 1 has today's appointment
        const existingAppointment = opp.scheduledAppointment
        return {
          ...opp,
          scheduledAppointment: {
            id: existingAppointment?.id || 10,
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            type: existingAppointment?.type || 'Test Drive',
            assignee: existingAppointment?.assignee || opp.assignee || 'Sarah Jenkins',
            customerId: existingAppointment?.customerId || opp.customerId || 2,
            opportunityId: 1,
            duration: existingAppointment?.duration || 60,
            status: existingAppointment?.status || 'confirmed',
            noShowCount: existingAppointment?.noShowCount || 0,
            lastNoShowDate: existingAppointment?.lastNoShowDate || null
          }
        }
      }
      return opp
    })
    
    return isArray ? updatedOpportunities : updatedOpportunities[0]
  }
}


