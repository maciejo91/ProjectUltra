import { BaseRepository } from './BaseRepository.js'
import { getMockData } from '@/api/mockData/localeLoader.js'
import { LeadRepository } from '@/repositories/LeadRepository'
import { CustomerRepository } from '@/repositories/CustomerRepository'

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

  static DEFAULT_LEAD_TEMPLATE_ID = 4

  _leadRepository = null
  _customerRepository = null
  _leadContextCache = new Map()

  _getLeadRepository() {
    if (!this._leadRepository) this._leadRepository = new LeadRepository()
    return this._leadRepository
  }

  _getCustomerRepository() {
    if (!this._customerRepository) this._customerRepository = new CustomerRepository()
    return this._customerRepository
  }

  _normalizeNumericId(value) {
    const n = parseInt(String(value), 10)
    return Number.isFinite(n) ? n : null
  }

  _clone(obj) {
    return obj ? JSON.parse(JSON.stringify(obj)) : obj
  }

  _resolveLeadContext(leadId) {
    if (this._leadContextCache.has(leadId)) return this._leadContextCache.get(leadId)
    const leadRepo = this._getLeadRepository()
    const customerRepo = this._getCustomerRepository()

    const lead = (leadRepo.dataSource || []).find((l) => l.id === leadId) || null
    const customerId = lead?.customerId ?? lead?.contactId ?? null
    const customer = customerId != null ? customerRepo.findByIdSync(customerId) : null
    const ctx = {
      leadId,
      customerId,
      customerName: customer?.name || lead?.contactName || '',
      assigneeName: lead?.assignee || '',
      templateCustomerName: 'Sophie Mueller'
    }
    this._leadContextCache.set(leadId, ctx)
    return ctx
  }

  _sanitizeTemplateText(text, ctx, { mode }) {
    if (typeof text !== 'string' || !text.trim()) return text
    const customerName = ctx?.customerName || ''
    const assigneeName = ctx?.assigneeName || ''
    const templateName = ctx?.templateCustomerName || 'Sophie Mueller'

    let out = text

    // Basic replacement of the template customer's name.
    if (customerName) {
      out = out.replaceAll(templateName, customerName)
    }

    // If this is an outbound rep-authored message and it contains the customer's name
    // (e.g. "Hi Sophie"), swap it to the target customer's first name.
    if (mode === 'outbound' && customerName) {
      const firstName = customerName.split(' ').filter(Boolean)[0] || customerName
      const templateFirst = templateName.split(' ')[0]
      out = out.replaceAll(`Hi ${templateFirst}`, `Hi ${firstName}`)
      out = out.replaceAll(`${templateFirst} —`, `${firstName} —`)
      out = out.replaceAll(`Ask for “${firstName}” at reception.`, 'Ask at reception.')
    }

    // Remove any stray template name mentions if no customer name could be resolved.
    if (!customerName) {
      out = out.replaceAll(templateName, 'the customer')
    }

    // Ensure the rep signature isn't "David Miller" for everyone.
    if (mode === 'outbound' && assigneeName) {
      out = out.replaceAll('David Miller', assigneeName)
    }

    return out
  }

  _rewriteActivityForLead(activity, targetLeadId) {
    const ctx = this._resolveLeadContext(targetLeadId)
    const type = activity?.type || ''

    const isCustomerSide = String(type).startsWith('customer-') || (type === 'call' && String(activity?.action || '').toLowerCase().includes('inbound'))
    const mode = isCustomerSide ? 'inbound' : 'outbound'

    const user =
      isCustomerSide
        ? (ctx.customerName || activity.user)
        : (ctx.assigneeName || activity.user)

    const content = this._sanitizeTemplateText(activity?.content, ctx, { mode })
    const message = this._sanitizeTemplateText(activity?.message, ctx, { mode })
    const action = this._sanitizeTemplateText(activity?.action, ctx, { mode })
    const title = this._sanitizeTemplateText(activity?.title, ctx, { mode })

    const data = activity?.data && typeof activity.data === 'object'
      ? {
          ...activity.data,
          from: this._sanitizeTemplateText(activity.data.from, ctx, { mode }),
          to: this._sanitizeTemplateText(activity.data.to, ctx, { mode })
        }
      : activity?.data

    const mapped = this._mapTemplateThreadIds(
      {
        ...activity,
        leadId: targetLeadId,
        user,
        action,
        title,
        content,
        message,
        data
      },
      targetLeadId
    )

    return mapped
  }

  _makeRng(seed) {
    let s = (seed >>> 0) || 1
    return () => {
      // xorshift32
      s ^= s << 13
      s ^= s >>> 17
      s ^= s << 5
      return ((s >>> 0) % 1000000) / 1000000
    }
  }

  _mapTemplateThreadIds(activity, targetLeadId) {
    const data = activity?.data
    if (!data || typeof data !== 'object') return activity
    if (typeof data.threadId !== 'string') return activity
    const from = `lead-${ActivityRepository.DEFAULT_LEAD_TEMPLATE_ID}-`
    if (!data.threadId.includes(from)) return activity
    return {
      ...activity,
      data: {
        ...data,
        threadId: data.threadId.replace(from, `lead-${targetLeadId}-`)
      }
    }
  }

  _getTemplateLeadActivities() {
    const templateLeadId = ActivityRepository.DEFAULT_LEAD_TEMPLATE_ID
    return this.dataSource.filter((a) => a.leadId === templateLeadId)
  }

  _getDefaultLeadTimelineActivities(targetLeadId) {
    const templateLeadId = ActivityRepository.DEFAULT_LEAD_TEMPLATE_ID
    const base = this._getTemplateLeadActivities()
    const cloned = this._clone(base)
    return (cloned || []).map((a) =>
      this._mapTemplateThreadIds(
        {
          ...a,
          leadId: targetLeadId
        },
        targetLeadId
      )
    )
  }

  _getRandomizedLeadTimelineActivities(targetLeadId) {
    const template = this._clone(this._getTemplateLeadActivities()) || []
    if (template.length === 0) return []

    // Pools by type so we can mix actions while staying "based on Sophie".
    const byType = new Map()
    for (const a of template) {
      const t = a?.type || 'unknown'
      if (!byType.has(t)) byType.set(t, [])
      byType.get(t).push(a)
    }

    const rng = this._makeRng(targetLeadId * 1009 + 17)

    const keepProbabilityForType = (type) => {
      if (['lead-created', 'lead-assigned', 'lead-updated'].includes(type)) return 1
      if (type === 'ai-summary') return 0.65
      if (type === 'note') return 0.75
      if (type === 'call') return 0.8
      if (['email', 'customer-email', 'whatsapp', 'customer-whatsapp', 'sms', 'customer-sms'].includes(type)) return 0.9
      return 0.7
    }

    const pickFrom = (list) => {
      if (!list || list.length === 0) return null
      const idx = Math.floor(rng() * list.length)
      return list[Math.min(idx, list.length - 1)]
    }

    const randomized = []

    for (const base of template) {
      const type = base?.type || 'unknown'
      if (rng() > keepProbabilityForType(type)) continue

      const pool = byType.get(type) || [base]
      const picked = pickFrom(pool) || base

      const mapped = this._mapTemplateThreadIds(
        {
          ...picked,
          id: `tmpl-${picked.id ?? `${type}-${Math.floor(rng() * 1e9)}`}-lead-${targetLeadId}`,
          leadId: targetLeadId
        },
        targetLeadId
      )

      randomized.push(this._rewriteActivityForLead(mapped, targetLeadId))
    }

    // Ensure at least a couple of interactions exist.
    const interactionTypes = ['customer-email', 'customer-whatsapp', 'customer-sms', 'email', 'whatsapp', 'sms', 'call']
    const hasInteraction = randomized.some((a) => interactionTypes.includes(a?.type))
    if (!hasInteraction) {
      const fallbackType = interactionTypes[Math.floor(rng() * interactionTypes.length)]
      const pool = byType.get(fallbackType) || []
      const picked = pickFrom(pool) || template[0]
      randomized.push(
        this._mapTemplateThreadIds(
          {
            ...picked,
            id: `tmpl-${picked.id ?? `${fallbackType}-fallback`}-lead-${targetLeadId}`,
            leadId: targetLeadId
          },
          targetLeadId
        )
      )
    }

    return randomized
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
      const requestedLeadId = this._normalizeNumericId(filters.leadId)
      if (requestedLeadId !== null && requestedLeadId !== ActivityRepository.DEFAULT_LEAD_TEMPLATE_ID) {
        const randomizedTimeline = this._getRandomizedLeadTimelineActivities(requestedLeadId)
        const leadSpecific = results.filter((a) => a.leadId === requestedLeadId)
        results = [...randomizedTimeline, ...leadSpecific]
      } else {
        results = results.filter(activity => activity.leadId === requestedLeadId)
      }
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
      content: data.content ?? data.message ?? data.notes,
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


