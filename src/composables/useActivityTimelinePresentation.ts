import type {
  ActivityRecord,
  ActivityTimelineCardAccent,
  ActivityTimelineHeadlineParts,
  ActivityTimelineIconKind
} from '@/types/activityTimeline'
import { getEventTypeLabel } from '@/utils/calendarHelpers'

type TFn = (key: string, ...args: unknown[]) => string

const APPOINTMENT_SCHEDULED_PATTERN = /appointment\s+scheduled/i

type CommunicationChannel = 'email' | 'whatsapp' | 'sms'

export function isRichSystemEvent(activity: ActivityRecord | null | undefined): boolean {
  if (!activity) return false
  const data = activity.data
  if (data?.richSystemEvent) return true
  return Array.isArray(data?.sections) && data.sections.length > 0
}

export function isAppointmentScheduledActivity(
  activity: ActivityRecord | null | undefined
): boolean {
  if (!activity || activity.type === 'calendar-event') return false
  const text = `${activity.action ?? ''} ${activity.message ?? ''}`.trim()
  return APPOINTMENT_SCHEDULED_PATTERN.test(text)
}

/** Timeline UI type; appointment-scheduled logs render as calendar events. */
export function getTimelinePresentationType(activity: ActivityRecord | null | undefined): string {
  if (!activity?.type) return ''
  if (activity.type === 'calendar-event' || isAppointmentScheduledActivity(activity)) {
    return 'calendar-event'
  }
  return activity.type
}

const WHATSAPP_CONVERSATION_WINDOW_MS = 24 * 60 * 60 * 1000

const CHANNEL_BY_ACTIVITY_TYPE: Record<string, CommunicationChannel> = {
  email: 'email',
  'customer-email': 'email',
  whatsapp: 'whatsapp',
  'customer-whatsapp': 'whatsapp',
  sms: 'sms',
  'customer-sms': 'sms'
}

function getCommunicationChannel(activity: ActivityRecord): CommunicationChannel | null {
  return CHANNEL_BY_ACTIVITY_TYPE[activity.type] ?? null
}

function getConversationKey(activity: ActivityRecord): string | null {
  const channel = getCommunicationChannel(activity)
  if (!channel) return null
  const explicit = activity.data?.threadId || activity.threadId
  if (explicit) return explicit
  if (activity.leadId != null) return `lead-${activity.leadId}-${channel}`
  if (activity.opportunityId != null) return `opportunity-${activity.opportunityId}-${channel}`
  return null
}

function getActivityTimestampMs(activity: ActivityRecord): number {
  const ts = activity.timestamp || activity.createdAt
  if (!ts) return Number.NaN
  const ms = new Date(ts).getTime()
  return Number.isNaN(ms) ? Number.NaN : ms
}

export function isCommunicationReply(
  activity: ActivityRecord | null | undefined,
  allActivities: ActivityRecord[] | undefined
): boolean {
  if (!activity || !allActivities?.length) return false
  const channel = getCommunicationChannel(activity)
  if (!channel) return false
  const key = getConversationKey(activity)
  if (!key) return false
  const ts = getActivityTimestampMs(activity)
  if (Number.isNaN(ts)) return false

  const windowMs = channel === 'email' ? null : WHATSAPP_CONVERSATION_WINDOW_MS

  for (const other of allActivities) {
    if (other === activity) continue
    if (other.id != null && activity.id != null && other.id === activity.id) continue
    if (getCommunicationChannel(other) !== channel) continue
    if (getConversationKey(other) !== key) continue
    const otherTs = getActivityTimestampMs(other)
    if (Number.isNaN(otherTs)) continue
    if (otherTs >= ts) continue
    if (windowMs == null) return true
    if (ts - otherTs <= windowMs) return true
  }
  return false
}

export type ActivityTimelineDayGroup = {
  dayKey: string
  label: string
  activities: ActivityRecord[]
}

function getTimelineDayKey(timestamp: string | undefined): string {
  if (!timestamp) return 'unknown'
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return 'unknown'
  return date.toDateString()
}

function formatTimelineDayDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = String(date.getFullYear()).slice(-2)
  return `${day}/${month}/${year}`
}

export function formatActivityTimelineDayLabel(
  timestamp: string | undefined,
  t: TFn
): string {
  const dayKey = getTimelineDayKey(timestamp)
  if (dayKey === 'unknown') return t('entities.activity.timeline.recentActivity')
  const date = new Date(timestamp as string)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (dayKey === today.toDateString()) {
    return t('entities.activity.timeline.today')
  }
  if (dayKey === yesterday.toDateString()) {
    return t('entities.activity.timeline.yesterday')
  }
  return formatTimelineDayDate(date)
}

export function groupActivitiesByTimelineDay(
  activities: ActivityRecord[] | undefined,
  t: TFn
): ActivityTimelineDayGroup[] {
  if (!activities?.length) return []
  const groups: ActivityTimelineDayGroup[] = []
  let currentKey = ''
  for (const activity of activities) {
    const timestamp = activity.timestamp || activity.createdAt
    const dayKey = getTimelineDayKey(timestamp)
    const label = formatActivityTimelineDayLabel(timestamp, t)
    if (dayKey !== currentKey) {
      groups.push({ dayKey, label, activities: [activity] })
      currentKey = dayKey
    } else {
      groups[groups.length - 1].activities.push(activity)
    }
  }
  return groups
}

/** @deprecated Use groupActivitiesByTimelineDay for per-day section headers. */
export function getActivityTimelineDateLabel(activities: ActivityRecord[] | undefined, t: TFn): string {
  if (!activities || activities.length === 0) return ''
  const mostRecent = activities[0]
  return formatActivityTimelineDayLabel(mostRecent.timestamp || mostRecent.createdAt, t)
}

export function getCallTranscriptLines(activity: ActivityRecord | undefined): Array<{ speaker: string; text: string }> {
  if (!activity) return []
  const transcription = activity.data?.transcription || activity.transcription
  if (!transcription?.leadLines?.length && !transcription?.salesLines?.length) return []
  const lead = transcription.leadLines ?? []
  const sales = transcription.salesLines ?? []
  const lines: Array<{ speaker: string; text: string }> = []
  const maxLen = Math.max(lead.length, sales.length)
  for (let i = 0; i < maxLen; i++) {
    if (lead[i]) lines.push({ speaker: 'Lead', text: lead[i] })
    if (sales[i]) lines.push({ speaker: 'Sales', text: sales[i] })
  }
  return lines
}

export function getCallSummaryText(activity: ActivityRecord | undefined, t: TFn): string {
  if (!activity) return ''
  return activity.data?.summary || activity.content || t('entities.activity.timeline.callCompletedFallback')
}

function getCallIconKindFromText(activity: ActivityRecord): 'call' | 'callMissed' {
  const text = `${activity.action ?? ''} ${activity.message ?? ''} ${activity.content ?? ''} ${activity.data?.summary ?? ''}`.toLowerCase()
  const isMissed =
    text.includes('no answer') ||
    text.includes('voicemail') ||
    /\bmissed\b/.test(text) ||
    text.includes('unanswered') ||
    text.includes('not answered') ||
    /\bbusy\b/.test(text)
  return isMissed ? 'callMissed' : 'call'
}

function getAgentActionIconKind(activity: ActivityRecord): ActivityTimelineIconKind {
  const action = activity.data?.agentAction
  if (action === 'call') return getCallIconKindFromText(activity)
  if (action === 'email') return 'email'
  if (action === 'whatsapp') return 'messageGreen'
  if (action === 'sms') return 'messageGreen'
  return 'file'
}

export function getActivityIconKind(activity: ActivityRecord | null | undefined): ActivityTimelineIconKind {
  if (!activity) return 'file'
  if (isAppointmentScheduledActivity(activity)) return 'calendarEvent'
  const type = activity.type
  if (type === 'note') return 'note'
  if (type === 'call') {
    return getCallIconKindFromText(activity)
  }
  if (type === 'email' || type === 'customer-email') return 'email'
  if (type === 'whatsapp' || type === 'customer-whatsapp' || type === 'sms' || type === 'customer-sms')
    return 'messageGreen'
  if (type === 'ai-agent-action') return getAgentActionIconKind(activity)
  if (type === 'ai-summary') return 'ai'
  if (type === 'appointment') return 'appointment'
  if (type === 'calendar-event') return 'calendarEvent'
  if (
    type === 'created' ||
    type === 'system' ||
    type === 'status' ||
    type === 'transcription' ||
    type === 'opportunity-created' ||
    type === 'lead-created' ||
    type === 'lead-assigned' ||
    type === 'lead-updated'
  ) {
    return 'system'
  }
  return 'file'
}

export function isActivityTimelineSystemHeadline(activity: ActivityRecord | null | undefined): boolean {
  if (!activity) return false
  if (activity.type === 'ai-summary') return true
  if (isAppointmentScheduledActivity(activity)) return false
  if (isRichSystemEvent(activity)) return false
  return getActivityIconKind(activity) === 'system'
}

function getCommunicationActionLabel(
  activity: ActivityRecord,
  t: TFn,
  allActivities: ActivityRecord[] | undefined
): string {
  const channel = getCommunicationChannel(activity)
  if (channel === 'sms') {
    return t('entities.activity.timeline.sentSms')
  }
  const isReply = isCommunicationReply(activity, allActivities)
  if (channel === 'email') {
    return isReply
      ? t('entities.activity.timeline.repliedEmailThread')
      : t('entities.activity.timeline.startedEmailThread')
  }
  return isReply
    ? t('entities.activity.timeline.repliedWhatsappConversation')
    : t('entities.activity.timeline.startedWhatsappConversation')
}

export function buildActivityHeadlineParts(
  activity: ActivityRecord | null | undefined,
  t: TFn,
  allActivities?: ActivityRecord[]
): ActivityTimelineHeadlineParts {
  if (!activity) {
    return { primary: '', secondary: null }
  }
  const type = activity.type
  const user = activity.user ?? ''
  const contactName = activity.data?.contactName || activity.customerName || ''

  if (type === 'note') {
    return {
      primary: user || t('entities.activity.timeline.you'),
      secondary: t('entities.activity.timeline.addedNote')
    }
  }

  if (type === 'call') {
    if (contactName) {
      return {
        primary: t('entities.activity.timeline.you'),
        secondary: t('entities.activity.timeline.calledContact', { name: contactName })
      }
    }
    const action = (activity.message || activity.action || '').trim()
    if (user && action) {
      return { primary: user, secondary: action }
    }
    if (user) {
      return { primary: user, secondary: null }
    }
    return { primary: t('entities.activity.timeline.callCompletedFallback'), secondary: null }
  }

  if (type === 'customer-email' || type === 'customer-whatsapp' || type === 'customer-sms') {
    return {
      primary: user || t('entities.activity.timeline.contact'),
      secondary: getCommunicationActionLabel(activity, t, allActivities)
    }
  }

  if (type === 'email' || type === 'whatsapp' || type === 'sms') {
    return {
      primary: user || t('entities.activity.timeline.you'),
      secondary: getCommunicationActionLabel(activity, t, allActivities)
    }
  }

  if (type === 'ai-summary') {
    return { primary: t('entities.activity.timeline.aiSummaryHeadline'), secondary: null }
  }

  if (type === 'ai-agent-action') {
    const contactName = activity.data?.contactName || activity.customerName || ''
    const agentAction = activity.data?.agentAction
    let secondary =
      (activity.action || activity.message || '').trim() || null
    if (!secondary && agentAction === 'call') {
      secondary = contactName
        ? t('entities.activity.timeline.agentSparkCalledContact', { name: contactName })
        : t('entities.activity.timeline.agentSparkCalledCustomer')
    }
    if (!secondary && agentAction === 'email') {
      secondary = t('entities.activity.timeline.agentSparkSentEmail')
    }
    if (!secondary && agentAction === 'whatsapp') {
      secondary = t('entities.activity.timeline.agentSparkSentWhatsapp')
    }
    if (!secondary && agentAction === 'sms') {
      secondary = t('entities.activity.timeline.agentSparkSentSms')
    }
    return {
      primary: t('entities.activity.timeline.agentSparkName'),
      secondary
    }
  }

  if (type === 'appointment') {
    const detail = (activity.message || activity.title || '').trim()
    if (user && detail) {
      return { primary: user, secondary: detail }
    }
    if (user) {
      return {
        primary: user,
        secondary: t('entities.activity.timeline.userAppointmentSuffix')
      }
    }
    return { primary: t('entities.activity.timeline.appointmentFallback'), secondary: null }
  }

  if (type === 'calendar-event' || isAppointmentScheduledActivity(activity)) {
    const eventType = activity.data?.eventType || 'appointment'
    const typeLabel = getEventTypeLabel(eventType)
    const secondary = t('entities.activity.timeline.bookedCalendarEvent', { type: typeLabel })
    const assignee =
      user && user !== 'System' ? user : activity.data?.assignee || t('entities.activity.timeline.you')
    return {
      primary: assignee,
      secondary
    }
  }

  if (type === 'created') {
    return {
      primary: activity.message || activity.action || t('entities.activity.timeline.leadCreated'),
      secondary: null
    }
  }

  if (type === 'lead-created' || type === 'lead-assigned' || type === 'lead-updated') {
    return {
      primary: activity.message || activity.action || t('entities.activity.timeline.systemUpdate'),
      secondary: null
    }
  }

  if (type === 'opportunity-created') {
    return {
      primary: activity.message || activity.action || t('entities.activity.timeline.opportunityCreated'),
      secondary: null
    }
  }

  if (isRichSystemEvent(activity)) {
    const action = (activity.action || activity.message || '').trim()
    const secondary = action.replace(/^SYSTEM\s*/i, '').trim() || action
    return { primary: 'SYSTEM', secondary: secondary || null }
  }

  if (type === 'system' || type === 'status') {
    return {
      primary: activity.message || activity.action || t('entities.activity.timeline.systemUpdate'),
      secondary: null
    }
  }

  const rest = (activity.message || activity.action || '').trim()
  if (user && rest) {
    return { primary: user, secondary: rest }
  }
  const single = user || rest || t('entities.activity.timeline.activity')
  return { primary: single, secondary: null }
}

export function buildActivityHeadline(
  activity: ActivityRecord | null | undefined,
  t: TFn,
  allActivities?: ActivityRecord[]
): string {
  const { primary, secondary } = buildActivityHeadlineParts(activity, t, allActivities)
  if (!secondary) return primary
  return `${primary} ${secondary}`.trim()
}

export function getActivityCardAccent(activity: ActivityRecord | null | undefined): ActivityTimelineCardAccent {
  if (!activity) return 'default'
  if (isAppointmentScheduledActivity(activity)) return 'calendarEvent'
  const type = activity.type
  if (type === 'note') return 'note'
  if (type === 'email' || type === 'customer-email') return 'email'
  if (type === 'whatsapp' || type === 'customer-whatsapp') return 'messageGreen'
  if (type === 'sms' || type === 'customer-sms') return 'sms'
  if (type === 'call') return 'call'
  if (type === 'ai-agent-action') {
    const action = activity.data?.agentAction
    if (action === 'call') return 'call'
    if (action === 'email') return 'email'
    if (action === 'whatsapp') return 'messageGreen'
    if (action === 'sms') return 'sms'
  }
  if (type === 'ai-summary') return 'ai'
  if (type === 'appointment') return 'appointment'
  if (type === 'calendar-event') return 'calendarEvent'
  return 'default'
}

export function shouldShowActivityCard(
  activity: ActivityRecord | null | undefined,
  linesForTranscript: Array<{ speaker: string; text: string }>
): boolean {
  if (!activity) return false
  const type = activity.type
  if (type === 'note') return !!(activity.message || activity.content)
  if (type === 'email' || type === 'customer-email') return !!activity.content
  if (type === 'whatsapp' || type === 'customer-whatsapp' || type === 'sms' || type === 'customer-sms')
    return !!activity.content
  if (type === 'ai-summary') return !!(activity.message || activity.content)
  if (type === 'ai-agent-action') return !!(activity.message || activity.content)
  if (type === 'appointment') {
    return !!(activity.title || activity.message || activity.location || activity.customerName || activity.vehicle)
  }
  if (type === 'calendar-event' || isAppointmentScheduledActivity(activity)) {
    return !!(activity.title || activity.data?.start || activity.timestamp)
  }
  if (isRichSystemEvent(activity)) {
    return true
  }
  if (type === 'call') {
    const hasTranscript = linesForTranscript.length > 0
    const summary = (activity.data?.summary || activity.content || '').trim()
    const headlineLike = (activity.message || activity.action || '').trim()
    if (hasTranscript) return true
    if (!summary) return false
    return summary !== headlineLike
  }
  return false
}

export function getActivityMetadataLine(activity: ActivityRecord | null | undefined, t: TFn): string | null {
  if (!activity) return null
  const type = activity.type
  const labelFrom = t('entities.activity.timeline.metaFrom')
  const labelTo = t('entities.activity.timeline.metaTo')

  if (type === 'email' || type === 'customer-email') {
    const from = activity.data?.from
    const to = activity.data?.to
    if (!from && !to) return null
    const parts: string[] = []
    if (from) parts.push(`${labelFrom}: ${from}`)
    if (to) parts.push(`${labelTo}: ${to}`)
    return parts.join(', ')
  }

  if (
    type === 'sms' ||
    type === 'customer-sms' ||
    type === 'whatsapp' ||
    type === 'customer-whatsapp'
  ) {
    const from = activity.data?.fromPhone
    const to = activity.data?.toPhone
    if (!from && !to) return null
    const parts: string[] = []
    if (from) parts.push(`${labelFrom}: ${from}`)
    if (to) parts.push(`${labelTo}: ${to}`)
    return parts.join(', ')
  }

  return null
}

export function isActivityClickable(activity: ActivityRecord | null | undefined): boolean {
  if (!activity) return false
  return false
}
