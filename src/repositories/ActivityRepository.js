import { BaseRepository } from './BaseRepository.js'
import { getMockData } from '@/api/mockData/localeLoader.js'
import { LeadRepository } from '@/repositories/LeadRepository'
import { CustomerRepository } from '@/repositories/CustomerRepository'

const DEMO_VEHICLE_MENTIONS = [
  'BMW iX xDrive50',
  'BMW iX',
  'Audi A6 Allroad',
  'Audi A6',
  'Volkswagen ID.4',
  'VW ID.4',
  'ID.4',
  'Mercedes-Benz C-Class',
  'Mercedes C-Class',
  'C-Class'
]

const DEMO_STAFF_MENTIONS = ['Sara Marino', 'Davide Rinaldi', 'Matteo Greco', 'Matteo Alpino']
const DEMO_VEHICLE_MENTION_PATTERN = new RegExp(
  DEMO_VEHICLE_MENTIONS
    .slice()
    .sort((a, b) => b.length - a.length)
    .map((mention) => mention.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|'),
  'g'
)

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

  _dedupeActivities(activities) {
    if (!Array.isArray(activities)) return []
    const seen = new Set()
    const callSeen = new Set()
    return activities.filter((activity) => {
      const content = activity?.content ?? activity?.message ?? activity?.action ?? ''
      if (activity?.type === 'call') {
        const callKey = [
          activity?.leadId ?? '',
          activity?.opportunityId ?? '',
          activity?.timestamp ?? '',
          activity?.user ?? ''
        ].join('|')
        if (callSeen.has(callKey)) return false
        callSeen.add(callKey)
      }
      const key = [
        activity?.leadId ?? '',
        activity?.opportunityId ?? '',
        activity?.type ?? '',
        activity?.timestamp ?? '',
        activity?.user ?? '',
        String(content).trim()
      ].join('|')
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
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
      requestedVehicleName: [lead?.requestedCar?.brand, lead?.requestedCar?.model].filter(Boolean).join(' '),
      templateCustomerName: 'Giulia Conti'
    }
    this._leadContextCache.set(leadId, ctx)
    return ctx
  }

  _sanitizeTemplateText(text, ctx, { mode }) {
    if (typeof text !== 'string' || !text.trim()) return text
    const customerName = ctx?.customerName || ''
    const assigneeName = ctx?.assigneeName || ''
    const requestedVehicleName = ctx?.requestedVehicleName || ''
    const templateName = ctx?.templateCustomerName || 'Giulia Conti'

    let out = text

    // Basic replacement of the template customer's name.
    if (customerName) {
      out = out.replaceAll(templateName, customerName)
    }

    // If this is an outbound rep-authored message and it contains the customer's name
    // (e.g. "Hi Giulia"), swap it to the target customer's first name.
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

    if (requestedVehicleName) {
      out = out
        .replace(/BMW\s+BMW\s+iX\s+xDrive50(?:\s+xDrive50)*/g, 'BMW iX xDrive50')
        .replace(/BMW\s+iX\s+xDrive50(?:\s+xDrive50)+/g, 'BMW iX xDrive50')
        .replace(DEMO_VEHICLE_MENTION_PATTERN, requestedVehicleName)
    }

    // Ensure the rep signature isn't "Davide Rinaldi" for everyone.
    if (mode === 'outbound' && assigneeName) {
      out = DEMO_STAFF_MENTIONS.reduce(
        (nextText, mention) => nextText.replaceAll(mention, assigneeName),
        out
      )
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
      if (type === 'ai-summary') return 0.35
      if (type === 'note') return 0.45
      if (type === 'call') return 0.35
      if (['email', 'customer-email', 'whatsapp', 'customer-whatsapp', 'sms', 'customer-sms'].includes(type)) return 0.55
      return 0.4
    }

    const pickFrom = (list) => {
      if (!list || list.length === 0) return null
      const idx = Math.floor(rng() * list.length)
      return list[Math.min(idx, list.length - 1)]
    }

    const randomized = []
    const typeCounts = new Map()
    const maxByType = new Map([
      ['call', 2],
      ['email', 2],
      ['customer-email', 2],
      ['whatsapp', 2],
      ['customer-whatsapp', 2],
      ['sms', 1],
      ['customer-sms', 1],
      ['note', 1],
      ['ai-summary', 1],
      ['lead-created', 1],
      ['lead-assigned', 1],
      ['lead-updated', 1]
    ])

    for (const base of template) {
      const type = base?.type || 'unknown'
      if (rng() > keepProbabilityForType(type)) continue
      const currentCount = typeCounts.get(type) || 0
      const maxCount = maxByType.get(type) ?? 1
      if (currentCount >= maxCount) continue

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
      typeCounts.set(type, currentCount + 1)
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

    return this._limitTimelineActivities(this._dedupeActivities(randomized), rng)
  }

  _limitTimelineActivities(activities, rng) {
    const maxItems = 5 + Math.floor(rng() * 6)
    const sorted = [...activities].sort((a, b) => {
      const ta = a?.timestamp ? new Date(a.timestamp).getTime() : 0
      const tb = b?.timestamp ? new Date(b.timestamp).getTime() : 0
      return tb - ta
    })
    if (sorted.length <= maxItems) return sorted
    const systemItems = sorted.filter((activity) =>
      ['lead-created', 'lead-assigned', 'lead-updated'].includes(activity?.type)
    )
    const interactionItems = sorted.filter((activity) =>
      !['lead-created', 'lead-assigned', 'lead-updated'].includes(activity?.type)
    )
    const keepSystem = systemItems.slice(0, 2)
    const keepInteractions = interactionItems.slice(0, Math.max(0, maxItems - keepSystem.length))
    return [...keepInteractions, ...keepSystem].sort((a, b) => {
      const ta = a?.timestamp ? new Date(a.timestamp).getTime() : 0
      const tb = b?.timestamp ? new Date(b.timestamp).getTime() : 0
      return tb - ta
    })
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
        results = this._limitTimelineActivities(
          this._dedupeActivities([...randomizedTimeline, ...leadSpecific]),
          this._makeRng(requestedLeadId * 2017 + 31)
        )
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
    
    return this._dedupeActivities(results)
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


