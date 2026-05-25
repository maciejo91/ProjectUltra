import { getEventTypeLabel } from '@/utils/calendarHelpers'
import { formatTime } from '@/utils/formatters'
import { isAppointmentScheduledActivity } from '@/composables/useActivityTimelinePresentation'

const BOOKED_AFTER_ACTIVITY_MS = 2 * 60 * 1000
const BEFORE_APPOINTMENT_MS = 30 * 60 * 1000

/**
 * Timeline sort time: when the event was booked, not when it occurs.
 * Falls after the latest non-calendar activity when possible.
 * @param {{ start?: string, bookedAt?: string, createdAt?: string }} event
 * @param {import('@/types/activityTimeline').ActivityRecord[]} baseActivities
 */
export function resolveCalendarEventTimelineTimestamp(event, baseActivities = []) {
  if (event.bookedAt) return event.bookedAt
  if (event.createdAt) return event.createdAt

  const appointmentStart = new Date(event.start || '').getTime()
  if (!Number.isNaN(appointmentStart)) {
    return new Date(appointmentStart - BEFORE_APPOINTMENT_MS).toISOString()
  }

  let latestActivityMs = 0
  for (const activity of baseActivities) {
    if (!activity || activity.type === 'calendar-event') continue
    const ms = new Date(activity.timestamp || activity.createdAt || 0).getTime()
    if (!Number.isNaN(ms) && ms > latestActivityMs) {
      latestActivityMs = ms
    }
  }

  if (latestActivityMs > 0) {
    return new Date(latestActivityMs + BOOKED_AFTER_ACTIVITY_MS).toISOString()
  }

  return new Date().toISOString()
}

/**
 * @param {object} event - mockCalendarEvents row
 * @param {import('@/types/activityTimeline').ActivityRecord[]} [baseActivities]
 * @returns {import('@/types/activityTimeline').ActivityRecord}
 */
export function mapCalendarEventToActivity(event, baseActivities = []) {
  const title = getEventTypeLabel(event.type)
  const scheduledStart = event.start
  const timelineTimestamp = resolveCalendarEventTimelineTimestamp(event, baseActivities)

  return {
    id: `cal-${event.id}`,
    type: 'calendar-event',
    user: event.assignee || '',
    title,
    timestamp: timelineTimestamp,
    time: scheduledStart ? formatTime(scheduledStart) : undefined,
    location: event.dealership || event.location || '',
    customerName: event.customer || '',
    vehicle: event.vehicle || '',
    data: {
      calendarEventId: event.id,
      start: scheduledStart,
      end: event.end,
      bookedAt: timelineTimestamp,
      eventType: event.type,
      status: event.status,
      team: event.team,
      assignee: event.assignee
    }
  }
}

/**
 * @param {object | null | undefined} entity - lead, opportunity, contact, or request
 * @param {string} [entityType] - 'lead' | 'opportunity' | 'contact'
 * @returns {{ customerId?: number, opportunityId?: number, leadId?: number } | null}
 */
export function buildTimelineEntityContext(entity, entityType) {
  if (!entity) return null
  const type = entityType || entity.type
  const customerId = entity.customerId ?? entity.customer?.id ?? null
  const parsedCustomerId =
    customerId != null && customerId !== '' ? Number(customerId) : undefined

  if (type === 'opportunity') {
    const opportunityId = entity.id != null ? Number(entity.id) : undefined
    return {
      customerId: parsedCustomerId,
      opportunityId
    }
  }

  if (type === 'lead') {
    const leadId = entity.id != null ? Number(entity.id) : undefined
    return {
      customerId: parsedCustomerId,
      leadId
    }
  }

  if (type === 'contact') {
    if (parsedCustomerId == null) return null
    return { customerId: parsedCustomerId }
  }

  return parsedCustomerId != null ? { customerId: parsedCustomerId } : null
}

function activityDedupeKey(activity) {
  const content = activity?.content ?? activity?.message ?? activity?.action ?? ''
  return [
    activity?.leadId ?? '',
    activity?.opportunityId ?? '',
    activity?.type ?? '',
    activity?.timestamp ?? '',
    activity?.user ?? '',
    String(content).trim()
  ].join('|')
}

/**
 * @param {import('@/types/activityTimeline').ActivityRecord[]} baseActivities
 * @param {import('@/types/activityTimeline').ActivityRecord[]} calendarActivities
 */
export function mergeActivitiesWithCalendarEvents(baseActivities, calendarActivities) {
  const calendarIds = new Set(
    calendarActivities
      .map((a) => a.data?.calendarEventId)
      .filter((id) => id != null)
  )

  const filteredBase = (baseActivities || []).filter((activity) => {
    if (isAppointmentScheduledActivity(activity)) return false
    if (activity?.type !== 'appointment') return true
    const calId = activity?.data?.calendarEventId
    if (calId != null && calendarIds.has(calId)) return false
    return true
  })

  const resolvedCalendar = (calendarActivities || []).map((cal) => {
    const existingBookedAt = cal.data?.bookedAt
    const timestamp =
      cal.timestamp ||
      (existingBookedAt
        ? existingBookedAt
        : resolveCalendarEventTimelineTimestamp(
            { start: cal.data?.start, bookedAt: existingBookedAt },
            filteredBase
          ))
    return {
      ...cal,
      timestamp,
      data: { ...cal.data, bookedAt: timestamp }
    }
  })

  const seen = new Set()
  const merged = [...filteredBase, ...resolvedCalendar].filter((activity) => {
    if (!activity) return false
    const key = activity.type === 'calendar-event' ? `cal-${activity.data?.calendarEventId}` : activityDedupeKey(activity)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return merged.sort((a, b) => {
    const timeA = new Date(a.timestamp || a.createdAt || 0).getTime()
    const timeB = new Date(b.timestamp || b.createdAt || 0).getTime()
    return timeB - timeA
  })
}
