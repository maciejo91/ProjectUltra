<template>
  <SidebarProvider class="max-h-svh min-h-svh w-full overflow-hidden bg-muted">
    <AppSidebar />

    <SidebarInset class="flex min-h-0 flex-1 flex-col overflow-hidden bg-muted">
      <header
        v-if="route.name !== 'customer-view' && route.name !== 'request-detail'"
        class="mobile-header md:hidden h-16 border-b border-border bg-background flex items-center justify-between gap-3 px-4 shrink-0 z-50"
      >
        <SidebarTrigger
          class="w-11 h-11 shrink-0 rounded-lg text-muted-foreground hover:text-brand-red hover:bg-red-50"
          :aria-label="t('common.layout.openSidebar')"
        />
        <h1 class="truncate text-base font-medium text-foreground flex-1 min-w-0">
          {{ mobilePageTitle }}
        </h1>
        <div class="flex shrink-0 items-center gap-2 ml-auto">
          <template v-if="mobileTasksHeaderActions">
            <div class="outcome-toggle-group bg-muted p-0.5 rounded-btn inline-flex gap-0.5 shrink-0">
              <Toggle
                variant="outline"
                :model-value="mobileTasksHeaderActions.viewModeRef.value === 'card'"
                class="h-7 w-7 rounded-md inline-flex items-center justify-center border transition-colors min-w-7 p-0"
                title="Card View"
                @update:model-value="(p) => p && mobileTasksHeaderActions.onViewChange('card')"
              >
                <LayoutGrid :size="14" />
              </Toggle>
              <Toggle
                variant="outline"
                :model-value="mobileTasksHeaderActions.viewModeRef.value === 'table'"
                class="h-7 w-7 rounded-md inline-flex items-center justify-center border transition-colors min-w-7 p-0"
                title="Table View"
                @update:model-value="(p) => p && mobileTasksHeaderActions.onViewChange('table')"
              >
                <Table :size="14" />
              </Toggle>
            </div>
          </template>
          <template v-else-if="route.name === 'reports'">
            <select
              v-model="mobileReportsTimeRange"
              class="px-2 py-1 rounded-lg border border-border bg-background text-sm font-medium text-muted-foreground"
            >
              <option>This month</option>
              <option>Last month</option>
              <option>This quarter</option>
              <option>This year</option>
            </select>
          </template>
          <template v-else-if="mobileHomeHeaderActions">
            <Button
              variant="outline"
              size="sm"
              class="h-8 w-8 p-0"
              :disabled="mobileHomeHeaderActions.isLoading?.()"
              @click="mobileHomeHeaderActions.onRefresh()"
            >
              <RefreshCw :class="{ 'animate-spin': mobileHomeHeaderActions.isLoading?.() }" class="size-4 shrink-0" />
            </Button>
          </template>
          <template v-else-if="mobileCalendarHeaderActions">
            <Button
              variant="outline"
              size="sm"
              class="h-8 gap-1.5"
              @click="mobileCalendarHeaderActions.onFilters()"
            >
              <Filter class="size-4 shrink-0" />
              <span v-if="mobileCalendarHeaderActions.activeFilterCount > 0" class="rounded-full bg-primary text-primary-foreground text-sm px-1.5 min-w-4 h-4 flex items-center justify-center">
                {{ mobileCalendarHeaderActions.activeFilterCount }}
              </span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              class="h-8 gap-1.5"
              @click="mobileCalendarHeaderActions.onAddEvent()"
            >
              <Plus class="size-4 shrink-0" />
              <span>Add event</span>
            </Button>
          </template>
          <template v-else-if="mobileCustomHeaderActions">
            <button
              type="button"
              class="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-muted text-muted-foreground hover:border-red-100 hover:bg-red-50 hover:text-brand-red transition-all"
              @click="mobileCustomHeaderActions.onAddNew()"
            >
              <Plus class="w-4 h-4 shrink-0" />
            </button>
          </template>
        </div>
      </header>

      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <template v-if="showTaskDetailSplitPane">
          <!-- One scroll for list + detail (no nested column scrollbars) -->
          <div
            class="flex min-h-0 flex-1 min-w-0 items-start overflow-x-hidden overflow-y-auto overscroll-contain"
          >
            <aside
              class="hidden shrink-0 flex-col border-border border-r bg-background md:flex md:w-80"
            >
              <AppHeader
                v-if="route.name !== 'customer-view' && route.name !== 'request-detail'"
                class="sticky top-0 z-10 shrink-0 border-border border-b bg-background"
              />
              <div class="w-full min-w-0">
                <div id="tasks-list-teleport" class="flex w-full flex-col" />
              </div>
            </aside>
            <div
              class="relative flex min-h-0 min-w-0 flex-1 flex-col border-border border-l bg-background"
            >
              <div class="hidden w-full min-w-0 flex-col md:flex">
                <div id="tasks-detail-teleport" class="flex w-full min-w-0 flex-col" />
              </div>
            </div>
          </div>
        </template>
        <main
          v-show="!showTaskDetailSplitPane"
          class="flex-1 flex flex-col overflow-hidden min-h-0"
        >
          <div class="flex-1 flex flex-col min-h-0 overflow-hidden">
            <router-view />
          </div>
        </main>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>

<script setup>
import { ref, provide, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { LayoutGrid, Table, Plus, RefreshCw, Filter } from 'lucide-vue-next'
import { Toggle, Button, SidebarProvider, SidebarInset, SidebarTrigger } from '@motork/component-library/future/primitives'
import { useLayoutStore } from '@/stores/layout'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'

const route = useRoute()
const { t } = useI18n()
const layoutStore = useLayoutStore()
const headerActionsRef = ref(null)
const mobileReportsTimeRange = ref('This month')
provide('headerActionsRef', headerActionsRef)

const ROUTE_TITLE_MAP = {
  'home-dashboard': 'common.navigation.home',
  'add-new': 'common.navigation.addNewCustomer',
  'task-detail': 'common.navigation.tasks',
  'customer-view': 'entities.customer.title',
  vehicles: 'common.navigation.vehicles',
  requests: 'common.navigation.sales',
  'after-sales': 'common.navigation.afterSales',
  conversations: 'common.navigation.conversations',
  customers: 'common.navigation.customers',
  calendar: 'common.navigation.calendar',
  reports: 'common.navigation.reports',
  'access-denied': null
}

const mobilePageTitle = computed(() => {
  const meta = route.meta
  if (meta?.title) return meta.title
  const key = meta?.titleKey ?? ROUTE_TITLE_MAP[route.name]
  return key ? t(key) : t('common.navigation.tasks')
})

const mobileTasksHeaderActions = computed(() => {
  const ref = headerActionsRef?.value
  if (ref?.type === 'tasks') return ref
  return null
})

const mobileHomeHeaderActions = computed(() => {
  const ref = headerActionsRef?.value
  if (ref?.type === 'home') return ref
  return null
})

const mobileCustomHeaderActions = computed(() => {
  const ref = headerActionsRef?.value
  if (ref?.type === 'customers' || ref?.type === 'vehicles') return ref
  return null
})

const mobileCalendarHeaderActions = computed(() => {
  const ref = headerActionsRef?.value
  if (ref?.type === 'calendar') return ref
  return null
})

const showTaskDetailSplitPane = computed(() => {
  return (
    route.name === 'task-detail' &&
    layoutStore.hideHeaderForTaskDetail &&
    Boolean(route.params.id)
  )
})
</script>
