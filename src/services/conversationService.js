import { ActivityRepository } from '@/repositories/ActivityRepository'
import { leadService } from '@/services/leadService'
import { opportunityService } from '@/services/opportunityService'

const activityRepository = new ActivityRepository()

const COMM_TYPES = new Set([
  'email',
  'customer-email',
  'whatsapp',
  'customer-whatsapp',
  'sms',
  'customer-sms'
])

const CHANNEL_BY_TYPE = {
  email: 'email',
  'customer-email': 'email',
  whatsapp: 'whatsapp',
  'customer-whatsapp': 'whatsapp',
  sms: 'sms',
  'customer-sms': 'sms'
}

export function inferChannelFromActivityType(activityType) {
  return CHANNEL_BY_TYPE[activityType] || null
}

export function parseThreadId(threadId) {
  const m = String(threadId).match(/^(lead|opportunity)-(\d+)-(email|whatsapp|sms)$/)
  if (!m) return null
  return { entityType: m[1], entityId: parseInt(m[2], 10), channel: m[3] }
}

export function buildThreadId(entityType, entityId, channel) {
  return `${entityType}-${entityId}-${channel}`
}

const customerNameCache = new Map()

async function resolveCustomerName(entityType, entityId) {
  const cacheKey = `${entityType}-${entityId}`
  if (customerNameCache.has(cacheKey)) {
    return customerNameCache.get(cacheKey)
  }
  let name = 'Unknown'
  try {
    if (entityType === 'lead') {
      const lead = await leadService.findById(entityId)
      name = lead?.customer?.name || lead?.contactName || 'Unknown'
    } else {
      const opp = await opportunityService.findById(entityId)
      name = opp?.customer?.name || opp?.contactName || 'Unknown'
    }
  } catch {
    name = 'Unknown'
  }
  customerNameCache.set(cacheKey, name)
  return name
}

export async function listConversationThreads() {
  const activities = await activityRepository.findAll({})
  const groups = new Map()

  for (const activity of activities) {
    if (!COMM_TYPES.has(activity.type)) continue
    const channel = inferChannelFromActivityType(activity.type)
    if (!channel) continue

    let entityType
    let entityId
    if (activity.leadId != null) {
      entityType = 'lead'
      entityId = activity.leadId
    } else if (activity.opportunityId != null) {
      entityType = 'opportunity'
      entityId = activity.opportunityId
    } else {
      continue
    }

    const threadId = buildThreadId(entityType, entityId, channel)
    if (!groups.has(threadId)) {
      groups.set(threadId, { threadId, entityType, entityId, channel, activities: [] })
    }
    groups.get(threadId).activities.push(activity)
  }

  const uniqueKeys = [...new Set([...groups.values()].map((g) => `${g.entityType}-${g.entityId}`))]
  await Promise.all(
    uniqueKeys.map(async (key) => {
      if (key.startsWith('lead-')) {
        await resolveCustomerName('lead', parseInt(key.slice('lead-'.length), 10))
      } else if (key.startsWith('opportunity-')) {
        await resolveCustomerName(
          'opportunity',
          parseInt(key.slice('opportunity-'.length), 10)
        )
      }
    })
  )

  const threads = []
  for (const group of groups.values()) {
    const sorted = [...group.activities].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
    const last = sorted[sorted.length - 1]
    const previewSource = last.content || last.message || ''
    const preview =
      previewSource.length > 72 ? `${previewSource.slice(0, 69)}…` : previewSource
    const customerName = await resolveCustomerName(group.entityType, group.entityId)
    threads.push({
      threadId: group.threadId,
      entityType: group.entityType,
      entityId: group.entityId,
      channel: group.channel,
      customerName,
      lastMessageAt: last.timestamp,
      preview
    })
  }

  threads.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
  return threads
}

export async function getThreadMessages(threadId) {
  const parsed = parseThreadId(threadId)
  if (!parsed) return []

  const activities = await activityRepository.findAll({})
  const filtered = activities.filter((activity) => {
    if (!COMM_TYPES.has(activity.type)) return false
    const ch = inferChannelFromActivityType(activity.type)
    if (ch !== parsed.channel) return false
    if (parsed.entityType === 'lead') {
      return activity.leadId === parsed.entityId
    }
    return activity.opportunityId === parsed.entityId
  })

  return filtered.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )
}

export function outboundActivityTypeForChannel(channel) {
  if (channel === 'email') return 'email'
  if (channel === 'whatsapp') return 'whatsapp'
  if (channel === 'sms') return 'sms'
  return 'email'
}

export function outboundActionLabelForChannel(channel) {
  if (channel === 'email') return 'sent an email'
  if (channel === 'whatsapp') return 'sent a WhatsApp message'
  if (channel === 'sms') return 'sent an SMS'
  return 'sent a message'
}
