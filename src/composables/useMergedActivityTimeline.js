import { ref, watch, computed, unref } from 'vue'
import { fetchCalendarEventsForEntity } from '@/api/calendar'
import {
  mapCalendarEventToActivity,
  mergeActivitiesWithCalendarEvents
} from '@/utils/calendarTimelineMapper'

function hasEntityContext(context) {
  if (!context) return false
  const { customerId, opportunityId } = context
  return (
    (opportunityId != null && opportunityId !== '') ||
    (customerId != null && customerId !== '')
  )
}

/**
 * Merges store activities with booked calendar events for the timeline.
 * @param {import('vue').MaybeRefOrGetter<import('@/types/activityTimeline').ActivityRecord[]>} activitiesSource
 * @param {import('vue').MaybeRefOrGetter<{ customerId?: number, opportunityId?: number, leadId?: number } | null>} entityContextSource
 */
export function useMergedActivityTimeline(activitiesSource, entityContextSource) {
  const calendarActivities = ref([])
  const loading = ref(false)

  const baseActivities = computed(() => {
    const raw = typeof activitiesSource === 'function' ? activitiesSource() : unref(activitiesSource)
    return Array.isArray(raw) ? raw : []
  })

  const entityContext = computed(() => {
    const raw =
      typeof entityContextSource === 'function' ? entityContextSource() : unref(entityContextSource)
    return raw && typeof raw === 'object' ? raw : null
  })

  async function loadCalendarEvents() {
    const ctx = entityContext.value
    if (!hasEntityContext(ctx)) {
      calendarActivities.value = []
      return
    }
    loading.value = true
    try {
      const events = await fetchCalendarEventsForEntity({
        customerId: ctx.customerId,
        opportunityId: ctx.opportunityId,
        leadId: ctx.leadId,
        limit: 8
      })
      calendarActivities.value = events.map((event) =>
        mapCalendarEventToActivity(event, baseActivities.value)
      )
    } catch {
      calendarActivities.value = []
    } finally {
      loading.value = false
    }
  }

  watch(entityContext, loadCalendarEvents, { immediate: true, deep: true })

  const mergedActivities = computed(() =>
    mergeActivitiesWithCalendarEvents(baseActivities.value, calendarActivities.value)
  )

  return {
    mergedActivities,
    calendarActivities,
    loading,
    reloadCalendarEvents: loadCalendarEvents
  }
}
