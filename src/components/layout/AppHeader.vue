<template>
  <header
    :class="[
      'hidden md:flex h-12 shrink-0 items-center justify-between gap-4 border-b border-border bg-background pl-4 md:pl-6 app-header',
      isTasksCardViewNarrow ? 'pr-1 md:pr-2' : 'pr-4 md:pr-6'
    ]"
  >
    <!-- Title always on the very left; when cards view is selected the header shrinks and brings the action buttons closer -->
    <div class="flex min-w-0 flex-1 items-center">
      <h1 class="truncate text-base font-medium text-foreground min-w-0">
        {{ pageTitle }}
      </h1>
    </div>

    <!-- Action buttons on the very right (same as all pages); ml-auto keeps them right when header is narrow -->
    <div class="flex shrink-0 items-center gap-3 ml-auto">
      <template v-if="tasksHeaderActions">
        <div class="app-header-view-toggle outcome-toggle-group bg-white p-0.5 rounded-btn inline-flex gap-0.5 shrink-0">
          <Toggle
            variant="outline"
            :model-value="tasksHeaderActions.viewModeRef.value === 'card'"
            class="app-header-view-toggle-btn h-7 w-7 rounded-md inline-flex items-center justify-center border transition-colors min-w-7 p-0"
            title="Card View"
            @update:model-value="(p) => p && tasksHeaderActions.onViewChange('card')"
          >
            <LayoutGrid :size="14" />
          </Toggle>
          <Toggle
            variant="outline"
            :model-value="tasksHeaderActions.viewModeRef.value === 'table'"
            class="app-header-view-toggle-btn h-7 w-7 rounded-md inline-flex items-center justify-center border transition-colors min-w-7 p-0"
            title="Table View"
            @update:model-value="(p) => p && tasksHeaderActions.onViewChange('table')"
          >
            <Table :size="14" />
          </Toggle>
        </div>
      </template>
      <template v-if="route.name === 'reports'">
        <select
          v-model="reportsTimeRange"
          class="px-3 py-1.5 rounded-lg border border-border bg-white text-sm font-medium text-muted-foreground shadow-sm hover:bg-muted transition-all cursor-pointer"
        >
          <option>This month</option>
          <option>Last month</option>
          <option>This quarter</option>
          <option>This year</option>
        </select>
      </template>
      <template v-else-if="homeHeaderActions">
        <Button
          variant="outline"
          size="sm"
          class="flex items-center gap-2"
          :disabled="homeHeaderActions.isLoading?.()"
          @click="homeHeaderActions.onRefresh()"
        >
          <RefreshCw :class="{ 'animate-spin': homeHeaderActions.isLoading?.() }" class="size-4 shrink-0" />
          <span class="hidden sm:inline">Refresh</span>
        </Button>
      </template>
      <template v-else-if="customHeaderActions">
        <button
          type="button"
          class="group flex items-center gap-2 rounded-xl border border-border px-3 py-1.5 bg-surface text-sm font-medium text-muted-foreground hover:border-red-100 hover:bg-red-50 hover:text-brand-red transition-all"
          @click="customHeaderActions.onAddNew()"
        >
          <Plus class="w-4 h-4 shrink-0 text-muted-foreground group-hover:text-brand-red" />
          <span class="hidden sm:inline">{{ t('common.navigation.addNew') }}</span>
        </button>
      </template>
      <template v-else-if="calendarHeaderActions">
        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            class="hidden"
            @click="calendarHeaderActions.onFilters()"
          >
            <Filter class="size-4 shrink-0" />
            <span>Filters</span>
            <span
              v-if="calendarHeaderActions.activeFilterCount > 0"
              class="rounded-full bg-primary text-primary-foreground text-sm px-2 min-w-5 h-5 flex items-center justify-center"
            >
              {{ calendarHeaderActions.activeFilterCount }}
            </span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            class="flex items-center gap-2"
            @click="calendarHeaderActions.onConnect()"
          >
            <Link class="size-4 shrink-0" />
            <span>{{ calendarHeaderActions.connectedCount > 0 ? 'Connected' : 'Connect' }}</span>
          </Button>
          <Button variant="outline" size="sm" class="flex items-center gap-2" @click="calendarHeaderActions.onAddEvent()">
            <Plus class="size-4 shrink-0" />
            <span>Add event</span>
          </Button>
        </div>
      </template>
    </div>
  </header>
</template>

<script setup>
import { computed, inject, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { LayoutGrid, Table, Plus, RefreshCw, Filter, Link } from 'lucide-vue-next'
import { Toggle, Button } from '@motork/component-library/future/primitives'

const route = useRoute()
const { t } = useI18n()
const reportsTimeRange = ref('This month')

const headerActionsRef = inject('headerActionsRef', null)
const customHeaderActions = computed(() => {
  const ref = headerActionsRef?.value
  if (ref?.type === 'customers' || ref?.type === 'vehicles') return ref
  return null
})

const tasksHeaderActions = computed(() => {
  const ref = headerActionsRef?.value
  if (ref?.type === 'tasks') return ref
  return null
})

const homeHeaderActions = computed(() => {
  const ref = headerActionsRef?.value
  if (ref?.type === 'home') return ref
  return null
})

const calendarHeaderActions = computed(() => {
  const ref = headerActionsRef?.value
  if (ref?.type === 'calendar') return ref
  return null
})

const isNarrow = ref(typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches)
let narrowMq = null
let narrowUpdate = null
onMounted(() => {
  if (typeof window === 'undefined') return
  narrowMq = window.matchMedia('(max-width: 1023px)')
  narrowUpdate = () => { isNarrow.value = narrowMq.matches }
  narrowMq.addEventListener('change', narrowUpdate)
})
onBeforeUnmount(() => {
  if (narrowMq && narrowUpdate) narrowMq.removeEventListener('change', narrowUpdate)
})

const isTasksCardViewNarrow = computed(() => {
  const tasks = tasksHeaderActions.value
  if (!tasks) return false
  if (tasks.viewModeRef?.value !== 'card') return false
  return isNarrow.value
})

const ROUTE_TITLE_MAP = {
  'home-dashboard': 'common.navigation.home',
  'add-new': 'common.navigation.addNewCustomer',
  'task-detail': 'common.navigation.tasks',
  'customer-view': 'entities.customer.title',
  vehicles: 'common.navigation.vehicles',
  customers: 'common.navigation.customers',
  calendar: 'common.navigation.calendar',
  reports: 'common.navigation.reports',
  settings: 'common.navigation.settings',
  'access-denied': null
}

const pageTitle = computed(() => {
  const meta = route.meta
  if (meta?.title) return meta.title
  const key = meta?.titleKey ?? ROUTE_TITLE_MAP[route.name]
  return key ? t(key) : t('common.navigation.tasks')
})
</script>
