<template>
  <div class="h-screen flex bg-muted">
    <!-- Left Icon Sidebar (Desktop Only) -->
    <IconSidebar />

    <!-- Mobile Sidebar Drawer -->
    <MobileSidebar :is-open="isMobileSidebarOpen" @close="isMobileSidebarOpen = false" />

    <!-- Main Content Area -->
    <div
      class="flex-1 flex flex-col min-w-0 overflow-hidden main-content-area"
      :class="{ 'sidebar-expanded': layoutStore.sidebarExpanded }"
    >
      <!-- Mobile Header (Mobile Only); hidden on customer/request detail so page header with Back is visible -->
      <header
        v-if="route.name !== 'customer-view' && route.name !== 'request-detail'"
        class="mobile-header md:hidden h-16 border-b border-border bg-background flex items-center justify-between gap-3 px-4 shrink-0 z-50"
      >
        <Transition name="fade-button">
          <button
            v-if="!isMobileSidebarOpen"
            @click="isMobileSidebarOpen = true"
            class="w-11 h-11 flex items-center justify-center text-muted-foreground hover:text-brand-red hover:bg-red-50 rounded-lg transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2"
            aria-label="Open navigation menu"
            :aria-expanded="false"
          >
            <Menu :size="20" />
          </button>
        </Transition>
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
              <span v-if="mobileCalendarHeaderActions.activeFilterCount > 0" class="rounded-full bg-primary text-primary-foreground text-xs px-1.5 min-w-4 h-4 flex items-center justify-center">
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

      <!-- Header column shrinks from full width to list width (right edge moves left) when cards view is selected -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div
          class="tasks-header-row flex min-w-0 overflow-hidden"
          :class="layoutStore.hideHeaderForTaskDetail ? 'flex-1 flex-row' : 'shrink-0 flex-row'"
        >
          <aside
            class="tasks-header-aside hidden md:flex shrink-0 overflow-hidden flex-col bg-background border-border transition-[width] duration-300 ease-out"
            :class="layoutStore.hideHeaderForTaskDetail ? 'tasks-header-aside--narrow' : 'tasks-header-aside--full'"
          >
            <div class="tasks-header-inner w-full min-w-0 h-full flex flex-col shrink-0 border-r border-border">
              <AppHeader v-if="route.name !== 'customer-view' && route.name !== 'request-detail'" class="shrink-0 border-b border-border" />
              <div class="flex-1 min-h-0 overflow-hidden">
              <div id="tasks-list-teleport" class="h-full w-full min-h-0" />
            </div>
            </div>
          </aside>
          <div
            class="flex-1 flex flex-col min-h-0 min-w-0 relative tasks-detail-column"
            :class="layoutStore.hideHeaderForTaskDetail ? 'border-l border-border' : 'tasks-detail-column--inactive'"
          >
            <div
              class="min-h-0 overflow-hidden hidden md:block"
              :class="layoutStore.hideHeaderForTaskDetail ? 'flex-1 flex flex-col' : 'tasks-detail-teleport-inactive'"
            >
              <div id="tasks-detail-teleport" class="h-full w-full min-h-0 flex flex-col" />
            </div>
          </div>
        </div>
        <!-- Always in DOM so Tasks.vue never unmounts when toggling card view (avoids recursive updates loop) -->
        <main
          class="flex-1 flex flex-col overflow-hidden min-h-0"
          :class="layoutStore.hideHeaderForTaskDetail ? 'main-when-narrow' : ''"
        >
          <div class="main-router-outlet flex-1 flex flex-col min-h-0 overflow-hidden">
            <router-view />
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, provide, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Menu, LayoutGrid, Table, Plus, RefreshCw, Filter } from 'lucide-vue-next'
import { Toggle, Button } from '@motork/component-library/future/primitives'
import { useLayoutStore } from '@/stores/layout'
import AppHeader from './AppHeader.vue'
import IconSidebar from './IconSidebar.vue'
import MobileSidebar from './MobileSidebar.vue'

const route = useRoute()
const { t } = useI18n()
const isMobileSidebarOpen = ref(false)
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
  requests: 'common.navigation.requests',
  customers: 'common.navigation.customers',
  calendar: 'common.navigation.calendar',
  reports: 'common.navigation.reports',
  settings: 'common.navigation.settings',
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
</script>

<style scoped>
.fade-button-enter-active,
.fade-button-leave-active {
  transition: opacity 0.2s ease;
}

.fade-button-enter-from,
.fade-button-leave-to {
  opacity: 0;
}

/* Header column: full width by default; shrinks to 20rem (right edge moves left) when cards view selected */
@media (min-width: 768px) {
  .tasks-header-aside--full {
    width: 100%;
  }

  .tasks-header-aside--narrow {
    width: 20rem;
  }
}

/* When not in card view, detail column takes no space */
.tasks-detail-column--inactive {
  width: 0;
  min-width: 0;
  overflow: hidden;
}

/* When card view: hide main but keep in DOM so router-view (Tasks.vue) stays mounted and doesn't trigger onBeforeUnmount loop */
.main-when-narrow {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}

/* When not in card-view layout, teleport target stays in DOM but takes no space (avoids Vue patch error) */
.tasks-detail-teleport-inactive {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  pointer-events: none;
}
</style>
