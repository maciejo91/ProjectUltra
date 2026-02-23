import { ref, computed, watch } from 'vue'
import { fetchCalendarEvents, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from '@/api/calendar'
import { getEventTypeCssClass } from '@/utils/calendarHelpers'

/**
 * Composable for calendar events: load, filter, CRUD, modal state.
 * Maps API events (start/end ISO) to view model (startTime/endTime Date, type, cssClass).
 */
export function useCalendarEvents({ appliedFilters, currentDate, currentView }) {
  const events = ref([])
  const isEventModalOpen = ref(false)
  const modalInitialRange = ref(null)
  const modalEditingEvent = ref(null)
  const filterOptions = ref({ eventTypes: [], dealerships: [], teams: [], users: [] })

  const loadEvents = async () => {
    const af = appliedFilters.value
    const apiFilters = {
      eventTypes: af.eventTypes,
      dealership: af.dealership || undefined,
      team: af.team || undefined,
      includeCancelled: af.includeCancelled,
      noShowsOnly: af.noShowsOnly,
    }
    const result = await fetchCalendarEvents(apiFilters)
    events.value = result
  }

  const loadFilterOptions = async () => {
    const { fetchCalendarFilterOptions } = await import('@/api/calendar')
    const opts = await fetchCalendarFilterOptions()
    filterOptions.value = opts
    if (activeTypeIds.value.length === 0 && opts.eventTypes?.length) {
      activeTypeIds.value = opts.eventTypes.map((t) => t.value)
    }
  }

  const mapEventToViewModel = (e) => {
    const startTime = new Date(e.start)
    const endTime = new Date(e.end)
    const type = e.type || 'other'
    return {
      id: String(e.id),
      title: e.title || '',
      description: e.description,
      startTime,
      endTime,
      type,
      cssClass: getEventTypeCssClass(type),
      location: e.dealership || e.location,
      attendees: e.attendees,
      customer: e.customer,
      assignee: e.assignee,
      assigneeId: e.assigneeId,
    }
  }

  const activeTypeIds = ref([])

  const filteredEvents = computed(() => {
    let list = events.value.map(mapEventToViewModel)
    const af = appliedFilters.value

    if (activeTypeIds.value.length > 0) {
      list = list.filter((e) => activeTypeIds.value.includes(e.type))
    }
    if (af.eventTypes?.length) {
      list = list.filter((e) => af.eventTypes.includes(e.type))
    }
    if (af.dealership) {
      list = list.filter((e) => e.location === af.dealership)
    }
    if (af.team) {
      list = list.filter((e) => e.assignee && e.assignee.includes(af.team))
    }
    if (af.mostRelevant) {
      list = list.filter((e) => e.customer)
    }
    if (!af.includeCancelled) {
      list = list.filter((e) => {
        const raw = events.value.find((ev) => String(ev.id) === e.id)
        return raw?.status !== 'cancelled'
      })
    }
    if (af.noShowsOnly) {
      list = list.filter((e) => {
        const raw = events.value.find((ev) => String(ev.id) === e.id)
        return raw?.status === 'no-show'
      })
    }

    return list
  })

  watch([currentDate, currentView], loadEvents, { immediate: false })
  watch(appliedFilters, loadEvents, { deep: true, immediate: false })

  const openCreateModal = (range = null) => {
    modalInitialRange.value = range
    modalEditingEvent.value = null
    isEventModalOpen.value = true
  }

  const openEditModal = (event) => {
    modalEditingEvent.value = event
    modalInitialRange.value = {
      start: new Date(event.startTime),
      end: new Date(event.endTime),
    }
    isEventModalOpen.value = true
  }

  const closeModal = () => {
    isEventModalOpen.value = false
    modalInitialRange.value = null
    modalEditingEvent.value = null
  }

  const apiEventFromForm = (payload) => {
    const start = payload.startTime instanceof Date ? payload.startTime : new Date(payload.startTime)
    const end = payload.endTime instanceof Date ? payload.endTime : new Date(payload.endTime)
    return {
      title: payload.title,
      type: payload.typeId || payload.type,
      start: start.toISOString().slice(0, 19),
      end: end.toISOString().slice(0, 19),
      customer: payload.customer,
      assignee: payload.assignee,
      assigneeId: payload.assigneeId,
      dealership: payload.dealership,
      vehicle: payload.vehicle,
    }
  }

  const upsertEvent = async (payload) => {
    const apiData = apiEventFromForm(payload)
    if (payload.id) {
      await updateCalendarEvent(parseInt(payload.id, 10), apiData)
    } else {
      await createCalendarEvent(apiData)
    }
    await loadEvents()
    closeModal()
  }

  const deleteEventAction = async (id) => {
    if (!confirm('Are you sure you want to delete this event?')) return
    await deleteCalendarEvent(parseInt(id, 10))
    await loadEvents()
    closeModal()
  }

  return {
    events,
    filteredEvents,
    filterOptions,
    activeTypeIds,
    isEventModalOpen,
    modalInitialRange,
    modalEditingEvent,
    loadEvents,
    loadFilterOptions,
    openCreateModal,
    openEditModal,
    closeModal,
    upsertEvent,
    deleteEventAction,
  }
}
