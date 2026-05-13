import type {
  ActivityRecord,
  ActivityTimelineCardAccent,
  ActivityTimelineHeadlineParts,
  ActivityTimelineIconKind
} from '@/types/activityTimeline'

type TFn = (key: string, ...args: unknown[]) => string

type CommunicationChannel = 'email' | 'whatsapp' | 'sms'

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

export function getActivityTimelineDateLabel(activities: ActivityRecord[] | undefined, t: TFn): string {
  if (!activities || activities.length === 0) return ''
  const mostRecent = activities[0]
  const timestamp = mostRecent.timestamp || mostRecent.createdAt
  if (!timestamp) return t('entities.activity.timeline.recentActivity')
  const date = new Date(timestamp)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === today.toDateString()) {
    return t('entities.activity.timeline.today')
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return t('entities.activity.timeline.yesterday')
  }
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
  })
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

export function getActivityIconKind(activity: ActivityRecord | null | undefined): ActivityTimelineIconKind {
  if (!activity) return 'file'
  const type = activity.type
  if (type === 'note') return 'note'
  if (type === 'call') {
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
  if (type === 'email' || type === 'customer-email') return 'email'
  if (type === 'whatsapp' || type === 'customer-whatsapp' || type === 'sms' || type === 'customer-sms')
    return 'messageGreen'
  if (type === 'ai-summary') return 'ai'
  if (type === 'appointment') return 'appointment'
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
  const type = activity.type
  if (type === 'note') return 'note'
  if (type === 'email' || type === 'customer-email') return 'email'
  if (type === 'whatsapp' || type === 'customer-whatsapp') return 'messageGreen'
  if (type === 'sms' || type === 'customer-sms') return 'sms'
  if (type === 'call') return 'call'
  if (type === 'ai-summary') return 'ai'
  if (type === 'appointment') return 'appointment'
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
  if (type === 'appointment') {
    return !!(activity.title || activity.message || activity.location || activity.customerName || activity.vehicle)
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
