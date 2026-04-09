<template>
  <div class="page-container flex flex-col min-h-0 h-full overflow-hidden">
    <div class="flex flex-1 min-h-0 flex-col overflow-hidden px-6 pb-4 md:pb-6">
      <div class="flex flex-1 min-h-0 flex-col md:flex-row gap-4 md:gap-6 w-full">
        <aside
          class="hidden md:flex flex-col gap-4 shrink-0 w-72 lg:w-80 min-h-0 overflow-y-auto"
        >
          <CalendarSidebar
            :current-date="currentDate"
            :filters="filters"
            :filter-options="filterOptions"
            :active-type-ids="activeTypeIds"
            @update:current-date="currentDate = $event"
            @update:filters="filters = $event"
            @update:active-type-ids="activeTypeIds = $event"
          />
        </aside>

        <div class="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden gap-4 md:gap-6">
          <div class="shrink-0 flex flex-wrap items-center justify-between gap-3 py-3 border-b border-border">
            <div class="flex flex-wrap items-center gap-2">
              <Button variant="secondary" size="icon-sm" @click="goToPrevious">
                <ChevronLeft class="size-4 shrink-0" />
              </Button>
              <Button variant="secondary" size="icon-sm" @click="goToNext">
                <ChevronRight class="size-4 shrink-0" />
              </Button>
              <Button variant="secondary" size="sm" class="rounded-full px-3" @click="goToToday">
                Today
              </Button>
              <span class="text-base font-medium text-foreground ml-2">{{ displayTitle }}</span>
            </div>
            <div class="outcome-toggle-group flex rounded-md overflow-hidden">
              <Button
                variant="secondary"
                size="sm"
                class="rounded-none"
                :class="{ 'opacity-70': currentView !== 'week' }"
                @click="setView('week')"
              >
                Week
              </Button>
              <Button
                variant="secondary"
                size="sm"
                class="rounded-none"
                :class="{ 'opacity-70': currentView !== 'month' }"
                @click="setView('month')"
              >
                Month
              </Button>
            </div>
          </div>

          <div class="flex-1 min-h-0 bg-background rounded-lg border border-border shadow-mk-dashboard-card overflow-hidden flex flex-col">
            <div class="flex-1 min-h-0 flex flex-col">
              <WeekView
                v-if="currentView === 'week'"
                :current-date="currentDate"
                :events="filteredEvents"
                :days-to-show="daysToShow"
                @create-range="handleTimeRangeCreate"
                @event-click="handleEventClick"
              />
              <MonthView
                v-else
                :current-date="currentDate"
                :events="filteredEvents"
                @create-range="handleTimeRangeCreate"
                @event-click="handleEventClick"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile filter drawer -->
    <Teleport to="body">
      <div
        v-if="showFilterDrawer"
        class="fixed inset-0 z-50 md:hidden"
        @click.self="showFilterDrawer = false"
      >
        <div class="absolute inset-0 bg-black/50" aria-hidden="true" />
        <div
          class="absolute top-0 right-0 bottom-0 w-80 max-w-[90vw] bg-background shadow-xl overflow-y-auto"
        >
            <div class="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between z-10">
              <h3 class="text-base font-medium text-foreground">Filters</h3>
              <button
                type="button"
                class="p-2 rounded-md hover:bg-muted text-muted-foreground min-h-11 min-w-11 flex items-center justify-center"
                aria-label="Close"
                @click="showFilterDrawer = false"
              >
                <X class="size-5" />
              </button>
            </div>
            <div class="p-4">
              <CalendarSidebar
                :current-date="currentDate"
                :filters="filters"
                :filter-options="filterOptions"
                :active-type-ids="activeTypeIds"
                @update:current-date="currentDate = $event"
                @update:filters="filters = $event"
                @update:active-type-ids="activeTypeIds = $event"
              />
            </div>
          </div>
      </div>
    </Teleport>

    <CalendarConnectModal
      :show="showConnectModal"
      :connected-calendars="connectedCalendars"
      :connecting-to="connectingTo"
      @close="showConnectModal = false"
      @connect="handleConnect"
      @disconnect="handleDisconnect"
    />

    <CalendarEventModal
      v-if="isEventModalOpen"
      :open="isEventModalOpen"
      :initial-range="modalInitialRange"
      :event="modalEditingEvent"
      :event-types="filterOptions.eventTypes || []"
      :users="filterOptions.users || []"
      :default-user-id="userStore.currentUser?.id"
      @save="upsertEvent"
      @delete="deleteEventAction"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted, onBeforeUnmount } from 'vue'
import { X, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { Button } from '@motork/component-library/future/primitives'
import { useCalendarView } from '@/composables/useCalendarView'
import { useCalendarFilters } from '@/composables/useCalendarFilters'
import { useCalendarEvents } from '@/composables/useCalendarEvents'
import CalendarSidebar from '@/components/calendar/CalendarSidebar.vue'
import CalendarEventModal from '@/components/calendar/CalendarEventModal.vue'
import WeekView from '@/components/calendar/WeekView.vue'
import MonthView from '@/components/calendar/MonthView.vue'
import CalendarConnectModal from '@/components/modals/CalendarConnectModal.vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const headerActionsRef = inject('headerActionsRef', null)

const {
  currentView,
  currentDate,
  displayTitle,
  daysToShow,
  goToPrevious,
  goToNext,
  goToToday,
  setView,
} = useCalendarView()

const { filters, appliedFilters, activeFilterCount } = useCalendarFilters({
  eventTypes: computed(() => []),
})

const {
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
} = useCalendarEvents({
  appliedFilters,
  currentDate,
  currentView,
})

const showFilterDrawer = ref(false)
const showConnectModal = ref(false)
const connectedCalendars = ref([])
const connectingTo = ref(null)

const isMobile = ref(false)
const updateMobile = () => {
  isMobile.value = typeof window !== 'undefined' && window.innerWidth < 768
}

onMounted(async () => {
  updateMobile()
  window.addEventListener('resize', updateMobile)
  if (headerActionsRef) {
    headerActionsRef.value = {
      type: 'calendar',
      activeFilterCount,
      connectedCount: computed(() => connectedCalendars.value.length),
      onFilters: () => { showFilterDrawer.value = true },
      onConnect: () => { showConnectModal.value = true },
      onAddEvent: openCreateModal,
    }
  }
  await loadFilterOptions()
  await loadEvents()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateMobile)
  if (headerActionsRef) headerActionsRef.value = null
})

const handleTimeRangeCreate = ({ start, end }) => {
  openCreateModal({ start, end })
}

const handleEventClick = (id) => {
  const ev = filteredEvents.value.find((e) => e.id === id)
  if (ev) openEditModal(ev)
}

const handleConnect = async (provider) => {
  connectingTo.value = provider
  await new Promise((r) => setTimeout(r, 2000))
  connectedCalendars.value.push({
    id: Date.now(),
    type: provider,
    email: provider === 'google' ? 'user@gmail.com' : 'user@outlook.com',
    connectedAt: new Date().toISOString(),
  })
  connectingTo.value = null
}

const handleDisconnect = (id) => {
  connectedCalendars.value = connectedCalendars.value.filter((c) => c.id !== id)
}
</script>

