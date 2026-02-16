<template>
  <header
    class="hidden md:flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-4 md:px-6"
  >
    <div class="flex min-w-0 flex-1 items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        :aria-label="layoutStore.sidebarExpanded ? t('common.layout.closeSidebar') : t('common.layout.openSidebar')"
        :aria-expanded="layoutStore.sidebarExpanded"
        class="h-10 w-10 shrink-0 text-muted-foreground hover:text-foreground"
        @click="layoutStore.toggleSidebar()"
      >
        <PanelLeftClose v-if="layoutStore.sidebarExpanded" :size="20" />
        <PanelLeft v-else :size="20" />
      </Button>
      <h1 class="truncate text-xl font-medium text-foreground">
        {{ pageTitle }}
      </h1>
    </div>

    <div v-if="customersHeaderActions" class="flex shrink-0 items-center gap-3">
      <button
        type="button"
        class="group flex items-center gap-2 rounded-xl border border-border px-3 py-1.5 bg-surface text-sm font-medium text-muted-foreground hover:border-red-100 hover:bg-red-50 hover:text-brand-red transition-all"
        @click="customersHeaderActions.onAddNew()"
      >
        <Plus class="w-4 h-4 shrink-0 text-muted-foreground group-hover:text-brand-red" />
        <span class="hidden sm:inline">{{ t('common.navigation.addNew') }}</span>
      </button>
    </div>
    <div v-else-if="tasksHeaderActions" class="flex shrink-0 items-center gap-3">
      <div class="app-header-view-toggle outcome-toggle-group bg-white p-0.5 rounded-btn inline-flex gap-0.5">
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
      <button
        type="button"
        :class="[
          'group flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm font-medium transition-all',
          tasksHeaderActions.showClosedRef.value
            ? 'border-red-200 bg-red-50 text-brand-red'
            : 'border-border bg-surface text-muted-foreground hover:border-red-100 hover:bg-red-50 hover:text-brand-red'
        ]"
        :aria-pressed="tasksHeaderActions.showClosedRef.value"
        @click="tasksHeaderActions.onToggleClosed()"
      >
        <EyeOff
          :class="[
            'w-4 h-4 shrink-0',
            tasksHeaderActions.showClosedRef.value ? 'text-brand-red' : 'text-muted-foreground group-hover:text-brand-red'
          ]"
        />
        <span class="hidden sm:inline">{{ t('common.tasks.showClosed') }}</span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed, inject } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLayoutStore } from '@/stores/layout'
import { PanelLeft, PanelLeftClose, LayoutGrid, Table, EyeOff, Plus } from 'lucide-vue-next'
import { Button, Toggle } from '@motork/component-library/future/primitives'

const route = useRoute()
const { t } = useI18n()
const layoutStore = useLayoutStore()

const headerActionsRef = inject('headerActionsRef', null)
const customersHeaderActions = computed(() => {
  const ref = headerActionsRef?.value
  if (ref?.type === 'customers') return ref
  return null
})

const tasksHeaderActions = computed(() => {
  const ref = headerActionsRef?.value
  if (ref?.type === 'tasks') return ref
  return null
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
