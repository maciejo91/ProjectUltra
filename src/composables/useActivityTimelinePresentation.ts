import type {
  ActivityRecord,
  ActivityTimelineCardAccent,
  ActivityTimelineHeadlineParts,
  ActivityTimelineIconKind
} from '@/types/activityTimeline'

type TFn = (key: string, ...args: unknown[]) => string

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

export function getActivityIconKind(activity: ActivityRecord): ActivityTimelineIconKind {
  const type = activity.type
  if (type === 'note') return 'note'
  if (type === 'call') return 'call'
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

export function isActivityTimelineSystemHeadline(activity: ActivityRecord): boolean {
  if (activity.type === 'ai-summary') return true
  return getActivityIconKind(activity) === 'system'
}

export function buildActivityHeadlineParts(activity: ActivityRecord, t: TFn): ActivityTimelineHeadlineParts {
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

  if (type === 'customer-email' || type === 'customer-whatsapp') {
    const name = user || t('entities.activity.timeline.contact')
    return {
      primary: name,
      secondary: t('entities.activity.timeline.contactSentMessageAction')
    }
  }

  if (type === 'email' || type === 'whatsapp' || type === 'sms') {
    const action =
      type === 'email'
        ? t('entities.activity.timeline.sentEmail')
        : type === 'whatsapp'
          ? t('entities.activity.timeline.sentWhatsapp')
          : t('entities.activity.timeline.sentSms')
    return {
      primary: user || t('entities.activity.timeline.you'),
      secondary: action
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

export function buildActivityHeadline(activity: ActivityRecord, t: TFn): string {
  const { primary, secondary } = buildActivityHeadlineParts(activity, t)
  if (!secondary) return primary
  return `${primary} ${secondary}`.trim()
}

export function getActivityCardAccent(activity: ActivityRecord): ActivityTimelineCardAccent {
  const type = activity.type
  if (type === 'note') return 'note'
  if (type === 'email' || type === 'customer-email') return 'message'
  if (type === 'whatsapp' || type === 'customer-whatsapp' || type === 'sms' || type === 'customer-sms')
    return 'messageGreen'
  if (type === 'call') return 'call'
  if (type === 'ai-summary') return 'ai'
  if (type === 'appointment') return 'appointment'
  return 'default'
}

export function shouldShowActivityCard(
  activity: ActivityRecord,
  linesForTranscript: Array<{ speaker: string; text: string }>
): boolean {
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

export function getActivityMetadataLine(activity: ActivityRecord, t: TFn): string | null {
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

export function isActivityClickable(activity: ActivityRecord): boolean {
  return ['note', 'email', 'whatsapp', 'customer-email', 'customer-whatsapp'].includes(activity.type)
}
