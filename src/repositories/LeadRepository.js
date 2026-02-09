import { BaseRepository } from './BaseRepository.js'
import { getMockData } from '@/api/mockData/localeLoader.js'

const STORAGE_KEY = 'project-ultra-leads'

/**
 * Lead Repository
 * 
 * Abstracts data access for leads.
 * Maps to REST API endpoint: /leads
 * 
 * Current implementation: in-memory array seeded from mock data (or localStorage
 * if present). All create/update/delete persist to localStorage so changes survive
 * page refresh. When real API is integrated, remove localStorage and call REST instead.
 */
export class LeadRepository extends BaseRepository {
  constructor() {
    super([]) // Initialize with empty array, data loaded dynamically
  }

  /** @type {Array|null} Mutable copy of leads; rehydrated from localStorage or mock on first access */
  _leadsCache = null

  /**
   * Persist current leads to localStorage so data survives refresh.
   */
  _persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._leadsCache))
    } catch (e) {
      // Ignore quota or private mode errors
    }
  }

  /**
   * Get current data source: from localStorage if previously saved, else deep-clone of mock leads.
   */
  get dataSource() {
    if (this._leadsCache === null) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          this._leadsCache = Array.isArray(parsed) ? parsed : []
        }
      } catch (_) {
        this._leadsCache = []
      }
      if (this._leadsCache === null) {
        const mock = getMockData().mockLeads
        this._leadsCache = JSON.parse(JSON.stringify(mock || []))
      }
    }
    return this._leadsCache
  }

  /**
   * Find all leads matching filters
   * @param {Object} filters - Filter criteria (status, priority, assignee, search)
   * @returns {Promise<Array>} Array of leads
   */
  async findAll(filters = {}) {
    // Simulate API delay (will be removed when real API is integrated)
    await new Promise(resolve => setTimeout(resolve, 300))
    
    let results = [...this.dataSource]
    
    // Apply filters
    if (filters.status) {
      results = results.filter(lead => lead.status === filters.status)
    }
    if (filters.priority) {
      results = results.filter(lead => lead.priority === filters.priority)
    }
    if (filters.assignee) {
      results = results.filter(lead => lead.assignee === filters.assignee)
    }
    if (filters.search) {
      const search = filters.search.toLowerCase()
      results = results.filter(lead => {
        // Note: Customer filtering will be handled by service layer
        return (lead.requestedCar && lead.requestedCar.brand && lead.requestedCar.brand.toLowerCase().includes(search)) ||
               (lead.requestedCar && lead.requestedCar.model && lead.requestedCar.model.toLowerCase().includes(search))
      })
    }
    
    return results
  }

  /**
   * Find a lead by ID
   * @param {number|string} id - Lead ID
   * @returns {Promise<Object|null>} Lead or null if not found
   */
  async findById(id) {
    await new Promise(resolve => setTimeout(resolve, 300))
    const lead = this.dataSource.find(l => l.id === parseInt(id))
    return lead || null
  }

  /**
   * Create a new lead
   * @param {Object} data - Lead data
   * @returns {Promise<Object>} Created lead
   */
  async create(data) {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Generate ID (in real API, server generates this)
    const newId = this.dataSource.length > 0 
      ? Math.max(...this.dataSource.map(l => l.id)) + 1 
      : 1
    
    const newLead = {
      id: newId,
      customerId: data.customerId,
      status: data.status || 'Open',
      priority: data.priority || 'Normal',
      requestedCar: data.requestedCar,
      carStatus: data.carStatus || null,
      requestType: data.requestType || 'Generic Sales',
      source: data.source || 'Direct',
      fiscalEntity: data.fiscalEntity || '',
      sourceDetails: data.sourceDetails || '',
      assignee: data.assignee || null,
      assigneeInitials: data.assigneeInitials || '',
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      nextActionDue: data.nextActionDue || null,
      tags: data.tags || [],
      stage: data.stage || 'Open',
      isDisqualified: data.isDisqualified || false,
      disqualifyReason: data.disqualifyReason || null,
      scheduledAppointment: data.scheduledAppointment || null,
      contactAttempts: data.contactAttempts || [],
      tradeIns: data.tradeIns || [],
      financingOptions: data.financingOptions || []
    }
    
    this.dataSource.push(newLead)
    this._persist()
    return newLead
  }

  /**
   * Update an existing lead
   * @param {number|string} id - Lead ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated lead
   */
  async update(id, updates) {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const index = this.dataSource.findIndex(l => l.id === parseInt(id))
    if (index === -1) {
      throw new Error('Lead not found')
    }
    
    // Remove computed fields that shouldn't be stored
    const { displayStage, ...updatesToStore } = updates
    
    this.dataSource[index] = { 
      ...this.dataSource[index], 
      ...updatesToStore, 
      lastActivity: new Date().toISOString() 
    }
    this._persist()
    return this.dataSource[index]
  }

  /**
   * Delete a lead
   * @param {number|string} id - Lead ID
   * @returns {Promise<Object>} Success object
   */
  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const index = this.dataSource.findIndex(l => l.id === parseInt(id))
    if (index === -1) {
      throw new Error('Lead not found')
    }
    
    this.dataSource.splice(index, 1)
    this._persist()
    return { success: true }
  }

  /**
   * Generate next available lead ID
   * (Helper method - will not be needed when using real API)
   * @returns {number} Next available ID
   */
  generateId() {
    return this.dataSource.length > 0 
      ? Math.max(...this.dataSource.map(l => l.id)) + 1 
      : 1
  }
}


