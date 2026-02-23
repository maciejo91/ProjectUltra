import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

/**
 * Composable for calendar view state and navigation.
 * Handles current date, view mode (week/month), display title, and daysToShow for responsive layout.
 */
export function useCalendarView() {
  const currentView = ref('week')
  const currentDate = ref(new Date())

  const displayTitle = computed(() => {
    if (currentView.value === 'week') {
      const start = startOfWeek(currentDate.value)
      const end = endOfWeek(currentDate.value)
      return `${formatMonthYear(start)} – ${formatMonthYear(end)}`
    }
    return formatMonthYear(currentDate.value)
  })

  const daysToShow = ref(7)
  let mediaQuery = null

  const updateDaysToShow = () => {
    if (typeof window === 'undefined') return
    if (window.innerWidth < 640) {
      daysToShow.value = 1
    } else if (window.innerWidth < 768) {
      daysToShow.value = 3
    } else {
      daysToShow.value = 7
    }
  }

  onMounted(() => {
    updateDaysToShow()
    mediaQuery = window.matchMedia('(min-width: 768px)')
    mediaQuery.addEventListener('change', updateDaysToShow)
  })

  onBeforeUnmount(() => {
    if (mediaQuery) mediaQuery.removeEventListener('change', updateDaysToShow)
  })

  const goToPrevious = () => {
    const date = new Date(currentDate.value)
    if (currentView.value === 'week') {
      date.setDate(date.getDate() - 7)
    } else {
      date.setMonth(date.getMonth() - 1)
    }
    currentDate.value = date
  }

  const goToNext = () => {
    const date = new Date(currentDate.value)
    if (currentView.value === 'week') {
      date.setDate(date.getDate() + 7)
    } else {
      date.setMonth(date.getMonth() + 1)
    }
    currentDate.value = date
  }

  const goToToday = () => {
    currentDate.value = new Date()
  }

  const setView = (view) => {
    currentView.value = view
  }

  return {
    currentView,
    currentDate,
    displayTitle,
    daysToShow,
    goToPrevious,
    goToNext,
    goToToday,
    setView,
    startOfWeek,
    endOfWeek,
  }
}

export function startOfWeek(date) {
  const result = new Date(date)
  const day = result.getDay()
  const diff = (day === 0 ? -6 : 1) - day
  result.setDate(result.getDate() + diff)
  result.setHours(0, 0, 0, 0)
  return result
}

export function endOfWeek(date) {
  const start = startOfWeek(date)
  const result = new Date(start)
  result.setDate(start.getDate() + 6)
  result.setHours(23, 59, 59, 999)
  return result
}

export function formatMonthYear(date) {
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}
