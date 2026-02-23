import { ref, computed } from 'vue'

/**
 * Composable for calendar filter state and actions.
 */
export function useCalendarFilters({ eventTypes }) {
  const filters = ref({
    mostRelevant: false,
    includeCancelled: false,
    noShowsOnly: false,
    dealership: '',
    team: '',
    eventTypes: [],
  })

  const appliedFilters = computed(() => filters.value)

  const af = appliedFilters
  const activeFilterCount = computed(() => {
    const afVal = af.value
    let count = 0
    if (afVal.mostRelevant) count++
    if (afVal.includeCancelled) count++
    if (afVal.noShowsOnly) count++
    if (afVal.dealership) count++
    if (afVal.team) count++
    count += (afVal.eventTypes || []).length
    return count
  })

  const appliedFilterChips = computed(() => {
    const afVal = af.value
    const chips = []
    if (afVal.mostRelevant) {
      chips.push({ key: 'mostRelevant', label: 'Most relevant', type: 'quick' })
    }
    if (afVal.includeCancelled) {
      chips.push({ key: 'includeCancelled', label: 'Include cancelled', type: 'quick' })
    }
    if (afVal.noShowsOnly) {
      chips.push({ key: 'noShowsOnly', label: 'No-shows only', type: 'quick' })
    }
    if (afVal.dealership) {
      chips.push({ key: 'dealership', label: afVal.dealership, type: 'dealership', value: afVal.dealership })
    }
    if (afVal.team) {
      chips.push({ key: 'team', label: afVal.team, type: 'team', value: afVal.team })
    }
    ;(afVal.eventTypes || []).forEach((et) => {
      const t = eventTypes.value?.find((e) => e.value === et) || { label: et }
      chips.push({ key: `eventType-${et}`, label: t.label, type: 'eventType', value: et })
    })
    return chips
  })

  const applyFilters = () => {}

  const clearFilters = () => {
    filters.value = {
      mostRelevant: false,
      includeCancelled: false,
      noShowsOnly: false,
      dealership: '',
      team: '',
      eventTypes: [],
    }
  }

  const removeFilterChip = (chip) => {
    if (chip.type === 'quick') {
      filters.value = { ...filters.value, [chip.key]: false }
    } else if (chip.type === 'dealership') {
      filters.value = { ...filters.value, dealership: '' }
    } else if (chip.type === 'team') {
      filters.value = { ...filters.value, team: '' }
    } else if (chip.type === 'eventType') {
      filters.value = {
        ...filters.value,
        eventTypes: filters.value.eventTypes.filter((v) => v !== chip.value),
      }
    }
  }

  return {
    filters,
    appliedFilters,
    activeFilterCount,
    appliedFilterChips,
    applyFilters,
    clearFilters,
    removeFilterChip,
  }
}
