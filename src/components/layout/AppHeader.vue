<template>
  <header
    class="hidden md:flex shrink-0 items-start justify-between gap-4 px-6 py-6 app-header transition-shadow duration-200"
    :class="[
      route.meta?.mutedPageChrome ? 'bg-muted' : 'bg-background',
      isScrolled ? 'shadow-sm' : 'shadow-none'
    ]"
  >
    <div class="flex min-w-0 flex-1 items-start">
      <h1 class="truncate text-xl leading-6 font-semibold text-foreground min-w-0">
        {{ pageTitle }}
      </h1>
    </div>

    <div class="flex shrink-0 items-center gap-3 ml-auto">
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
        <Button
          :variant="customHeaderAddButtonVariant"
          size="sm"
          class="flex items-center gap-2 rounded-sm"
          @click="customHeaderActions.onAddNew()"
        >
          <Plus class="size-4 shrink-0" />
          <span class="hidden sm:inline">{{ customAddButtonLabel }}</span>
        </Button>
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
import { computed, inject, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Plus, RefreshCw, Filter, Link } from 'lucide-vue-next'
import { Button } from '@motork/component-library/future/primitives'

defineProps({
  isScrolled: {
    type: Boolean,
    default: false
  }
})

const route = useRoute()
const { t } = useI18n()
const reportsTimeRange = ref('This month')

const headerActionsRef = inject('headerActionsRef', null)
const customHeaderActions = computed(() => {
  const ref = headerActionsRef?.value
  if (ref?.type === 'customers' || ref?.type === 'vehicles') return ref
  return null
})

const customAddButtonLabel = computed(() => {
  const ref = customHeaderActions.value
  if (ref?.addLabelKey) return t(ref.addLabelKey)
  return t('common.navigation.addNew')
})

const customHeaderAddButtonVariant = computed(() => {
  const ref = customHeaderActions.value
  return ref?.addButtonVariant === 'outline' ? 'outline' : 'default'
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

const ROUTE_TITLE_MAP = {
  'home-dashboard': 'common.navigation.nscDashboard',
  'add-new': 'common.navigation.addNewCustomer',
  'task-detail': 'common.navigation.tasks',
  'customer-view': 'entities.customer.title',
  vehicles: 'common.navigation.vehicles',
  customers: 'common.navigation.customers',
  calendar: 'common.navigation.calendar',
  reports: 'common.navigation.reports',
  'access-denied': null
}

const pageTitle = computed(() => {
  const meta = route.meta
  if (meta?.title) return meta.title
  const key = meta?.titleKey ?? ROUTE_TITLE_MAP[route.name]
  return key ? t(key) : t('common.navigation.tasks')
})
</script>
