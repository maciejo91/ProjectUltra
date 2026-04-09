<template>
  <SidebarProvider class="max-h-svh min-h-svh w-full overflow-hidden bg-muted">
    <AppSidebar />

    <SidebarInset class="flex min-h-0 flex-1 flex-col overflow-hidden bg-muted">
      <header
        v-if="showMobileHeader"
        class="mobile-header md:hidden shrink-0 z-50 flex items-start justify-between gap-3 px-6 py-6"
        :class="route.meta?.mutedPageChrome ? 'bg-muted' : 'bg-background'"
      >
        <SidebarTrigger
          class="w-11 h-11 shrink-0 rounded-lg text-muted-foreground hover:text-brand-red hover:bg-red-50"
          :aria-label="t('common.layout.openSidebar')"
        />
        <h1 class="truncate text-xl leading-6 font-semibold text-foreground flex-1 min-w-0">
          {{ mobilePageTitle }}
        </h1>
        <div class="flex shrink-0 items-center gap-2 ml-auto">
          <template v-if="route.name === 'reports'">
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
            <Button
              variant="default"
              size="sm"
              class="size-8 shrink-0 p-0 rounded-sm"
              :aria-label="mobileCustomAddLabel"
              @click="mobileCustomHeaderActions.onAddNew()"
            >
              <Plus class="size-4 shrink-0" />
            </Button>
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
                v-if="showDesktopHeader"
                class="sticky top-0 z-10 shrink-0 bg-background"
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
        <template v-else-if="showConversationsSplitPane">
          <div
            class="flex min-h-0 min-w-0 flex-1 overflow-hidden"
          >
            <aside
              class="hidden min-h-0 w-full shrink-0 flex-col overflow-hidden border-border border-r bg-background md:flex md:w-1/4 md:min-w-0"
            >
              <AppHeader
                v-if="showDesktopHeader"
                class="sticky top-0 z-10 shrink-0 bg-background"
              />
              <div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                <div
                  id="conversations-list-teleport"
                  class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
                />
              </div>
            </aside>
            <div
              class="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-border border-l bg-background"
            >
              <div class="hidden h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden md:flex">
                <div
                  id="conversations-detail-teleport"
                  class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
                />
              </div>
            </div>
          </div>
        </template>
        <main
          v-show="!showTaskDetailSplitPane && !showConversationsSplitPane"
          class="flex min-h-0 flex-1 flex-col overflow-hidden"
          :class="route.meta?.mutedPageChrome ? 'bg-muted' : 'bg-background'"
        >
          <AppHeader v-if="showDesktopHeader" class="sticky top-0 z-10 shrink-0" />
          <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
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
import { Plus, RefreshCw, Filter } from 'lucide-vue-next'
import { Button, SidebarProvider, SidebarInset, SidebarTrigger } from '@motork/component-library/future/primitives'
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
  marketing: 'common.navigation.marketing',
  'access-denied': null
}

const mobilePageTitle = computed(() => {
  const meta = route.meta
  if (meta?.title) return meta.title
  const key = meta?.titleKey ?? ROUTE_TITLE_MAP[route.name]
  return key ? t(key) : t('common.navigation.tasks')
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

const mobileCustomAddLabel = computed(() => {
  const ref = mobileCustomHeaderActions.value
  if (!ref) return ''
  if (ref.addLabelKey) return t(ref.addLabelKey)
  return t('common.navigation.addNew')
})

const mobileCalendarHeaderActions = computed(() => {
  const ref = headerActionsRef?.value
  if (ref?.type === 'calendar') return ref
  return null
})

const showDesktopHeader = computed(() => {
  if (route?.meta?.showPageTitle === false) return false
  if (route.name === 'task-detail' && Boolean(route.params.id)) return false
  if (route.name === 'conversations' && Boolean(route.params.threadId)) return false
  return true
})

const showMobileHeader = computed(() => {
  if (route?.meta?.showPageTitle === false) return false
  if (route.name === 'task-detail' && Boolean(route.params.id)) return false
  if (route.name === 'conversations' && Boolean(route.params.threadId)) return false
  return true
})

const showTaskDetailSplitPane = computed(() => {
  return (
    route.name === 'task-detail' &&
    layoutStore.hideHeaderForTaskDetail &&
    Boolean(route.params.id)
  )
})

const showConversationsSplitPane = computed(() => {
  return (
    route.name === 'conversations' &&
    layoutStore.hideHeaderForConversations &&
    Boolean(route.params.threadId)
  )
})
</script>
