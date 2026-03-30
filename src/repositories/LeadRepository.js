import { BaseRepository } from './BaseRepository.js'
import { getMockData } from '@/api/mockData/localeLoader.js'
import {
  DEFAULT_CAR_IMAGE,
  demoPlateNumber,
  ensureRequestedCarImage
} from '@/utils/mockDataHelpers'

const STORAGE_KEY = 'project-ultra-leads'
const DATA_VERSION = 3

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
   * Ensure every lead has nextActionDue so the UI does not show "Not set".
   * Patches leads loaded from localStorage that may have been saved before the mock fix.
   */
  _ensureNextActionDue(leads) {
    if (!Array.isArray(leads)) return
    let changed = false
    for (const lead of leads) {
      if (lead.nextActionDue == null) {
        lead.nextActionDue = lead.lastActivity || lead.createdAt || new Date().toISOString()
        changed = true
      }
    }
    if (changed) this._persist()
  }

  /**
   * Ensure every lead with requestedCar has requestedCar.image.
   * Patches leads loaded from localStorage that may have been saved before the image fix.
   */
  _ensureCarImages(leads) {
    if (!Array.isArray(leads)) return
    let changed = false
    for (const lead of leads) {
      if (lead.requestedCar && !lead.requestedCar.image) {
        lead.requestedCar.image = DEFAULT_CAR_IMAGE
        changed = true
      }
    }
    if (changed) this._persist()
  }

  /**
   * Ensure requestedCar has plateNumber when missing (localStorage from before mock had plates).
   */
  _ensureRequestedCarPlates(leads) {
    if (!Array.isArray(leads)) return
    const mockLeads = getMockData().mockLeads || []
    const mockById = new Map(mockLeads.map((l) => [l.id, l]))
    let changed = false
    for (const lead of leads) {
      const rc = lead.requestedCar
      if (!rc) continue
      if (rc.plateNumber || rc.plate) continue
      const mock = mockById.get(lead.id)
      const fromMock = mock?.requestedCar?.plateNumber || mock?.requestedCar?.plate
      if (fromMock) {
        rc.plateNumber = fromMock
      } else {
        rc.plateNumber = demoPlateNumber(rc.brand, rc.model, rc.year)
      }
      changed = true
    }
    if (changed) this._persist()
  }

  /**
   * Merge mock leads that don't exist in stored data (e.g. new demo leads).
   * Ensures new mock leads appear even when user has existing localStorage.
   */
  _mergeNewMockLeads(storedLeads) {
    const mock = getMockData().mockLeads
    if (!Array.isArray(mock) || mock.length === 0) return storedLeads
    const storedIds = new Set((storedLeads || []).map(l => l.id))
    const toAdd = mock.filter(m => !storedIds.has(m.id))
    if (toAdd.length === 0) return storedLeads
    return [...(storedLeads || []), ...JSON.parse(JSON.stringify(toAdd))]
  }

  /**
   * Get current data source: from localStorage if previously saved, else deep-clone of mock leads.
   */
  get dataSource() {
    if (this._leadsCache === null) {
      try {
        const versionKey = `${STORAGE_KEY}-version`
        const storedVersion = parseInt(localStorage.getItem(versionKey) || '0', 10)
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored && storedVersion >= DATA_VERSION) {
          const parsed = JSON.parse(stored)
          this._leadsCache = Array.isArray(parsed) ? parsed : []
          this._ensureNextActionDue(this._leadsCache)
          this._ensureCarImages(this._leadsCache)
          this._ensureRequestedCarPlates(this._leadsCache)
          const merged = this._mergeNewMockLeads(this._leadsCache)
          if (merged.length > this._leadsCache.length) {
            this._leadsCache = merged
            this._ensureRequestedCarPlates(this._leadsCache)
            this._persist()
          }
        }
      } catch (_) {}
      if (this._leadsCache === null) {
        const mock = getMockData().mockLeads
        this._leadsCache = JSON.parse(JSON.stringify(mock || []))
        this._ensureRequestedCarPlates(this._leadsCache)
        this._persist()
        try {
          localStorage.setItem(`${STORAGE_KEY}-version`, String(DATA_VERSION))
        } catch (_) {}
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
    // Minimal delay; API layer provides main simulation
    await new Promise(resolve => setTimeout(resolve, 0))
    
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
    await new Promise(resolve => setTimeout(resolve, 0))
    const lead = this.dataSource.find(l => l.id === parseInt(id))
    return lead || null
  }

  /**
   * Create a new lead
   * @param {Object} data - Lead data
   * @returns {Promise<Object>} Created lead
   */
  async create(data) {
    await new Promise(resolve => setTimeout(resolve, 0))
    
    // Generate ID (in real API, server generates this)
    const newId = this.dataSource.length > 0 
      ? Math.max(...this.dataSource.map(l => l.id)) + 1 
      : 1
    
    ensureRequestedCarImage(data.requestedCar)
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
      nextActionDue: data.nextActionDue ?? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
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
    await new Promise(resolve => setTimeout(resolve, 0))
    
    const index = this.dataSource.findIndex(l => l.id === parseInt(id))
    if (index === -1) {
      throw new Error('Lead not found')
    }
    
    // Remove computed fields that shouldn't be stored
    const { displayStage, ...updatesToStore } = updates
    if (updatesToStore.requestedCar) ensureRequestedCarImage(updatesToStore.requestedCar)

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
    await new Promise(resolve => setTimeout(resolve, 0))
    
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


