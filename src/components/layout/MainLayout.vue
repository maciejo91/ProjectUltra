<template>
  <SidebarProvider class="max-h-svh min-h-svh w-full overflow-hidden bg-muted">
    <AppSidebar v-if="!hideNavigation" />

    <SidebarInset class="flex min-h-0 flex-1 flex-col overflow-hidden bg-muted">
      <header
        v-if="showMobileHeader"
        class="mobile-header md:hidden shrink-0 z-50 flex items-start justify-between gap-3 px-6 py-6"
        :class="[
          route.meta?.mutedPageChrome ? 'bg-muted' : 'bg-background',
          isHeaderScrolled ? 'shadow-sm' : 'shadow-none'
        ]"
      >
        <SidebarTrigger
          v-if="!hideNavigation"
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
              :variant="mobileCustomAddButtonVariant"
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
            @scroll.capture="handleContentScroll"
          >
            <aside
              class="hidden shrink-0 flex-col border-border border-r bg-background md:flex md:w-80"
            >
              <AppHeader
                v-if="showDesktopHeader"
                :class="desktopHeaderClass"
                :is-scrolled="isHeaderScrolled"
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
          class="flex min-h-0 flex-1 flex-col"
          :class="mainContentClass"
          @scroll.capture="handleContentScroll"
        >
          <AppHeader v-if="showDesktopHeader" :class="desktopHeaderClass" :is-scrolled="isHeaderScrolled" />
          <div ref="pageContentRef" :class="pageContentClass">
            <router-view />
          </div>
        </main>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>

<script setup>
import { ref, provide, computed, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Plus, RefreshCw, Filter } from 'lucide-vue-next'
import { Button, SidebarProvider, SidebarInset, SidebarTrigger } from '@motork/component-library/future/primitives'
import { useLayoutStore } from '@/stores/layout'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'
import { useHideNavigation } from '@/composables/useHideNavigation'

const route = useRoute()
const { hideNavigation } = useHideNavigation()
const { t } = useI18n()
const layoutStore = useLayoutStore()
const headerActionsRef = ref(null)
const mobileReportsTimeRange = ref('This month')
const pageContentRef = ref(null)
const isHeaderScrolled = ref(false)
provide('headerActionsRef', headerActionsRef)

const isTablePageLayout = computed(() => Boolean(route.meta?.tablePageLayout))

const getPageScrollContainers = () => {
  const pageContainer = pageContentRef.value?.querySelector('.page-container')
  if (!pageContainer) return []

  const candidates = [
    pageContainer,
    ...pageContainer.querySelectorAll('.overflow-y-auto'),
    ...pageContainer.querySelectorAll('.data-table-inner [data-slot="frame-panel"]')
  ]
  const pageRect = pageContainer.getBoundingClientRect()

  return candidates.filter((element) => {
    const rect = element.getBoundingClientRect()
    const isPageWidth = rect.width >= pageRect.width * 0.7
    const isPageAligned = Math.abs(rect.left - pageRect.left) < 2
    return element.scrollHeight > element.clientHeight && isPageWidth && isPageAligned
  })
}

const updateHeaderScrollState = () => {
  isHeaderScrolled.value = getPageScrollContainers().some((element) => element.scrollTop > 0)
}

const handleContentScroll = () => {
  updateHeaderScrollState()
}

watch(
  () => route.fullPath,
  async () => {
    isHeaderScrolled.value = false
    await nextTick()
    updateHeaderScrollState()
  }
)

const ROUTE_TITLE_MAP = {
  'home-dashboard': 'common.navigation.nscDashboard',
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

const mobileCustomAddButtonVariant = computed(() => {
  const ref = mobileCustomHeaderActions.value
  return ref?.addButtonVariant === 'outline' ? 'outline' : 'default'
})

const mobileCalendarHeaderActions = computed(() => {
  const ref = headerActionsRef?.value
  if (ref?.type === 'calendar') return ref
  return null
})

const showDesktopHeader = computed(() => {
  if (route?.meta?.showPageTitle === false) return false
  if (route.name === 'task-detail' && Boolean(route.params.id)) return false
  return true
})

const desktopHeaderClass = computed(() => {
  return 'shrink-0'
})

const mainContentClass = computed(() => [
  route.meta?.mutedPageChrome ? 'bg-muted' : 'bg-background',
  isTablePageLayout.value ? 'overflow-hidden' : 'overflow-y-auto overscroll-contain'
])

const pageContentClass = computed(() => [
  'flex min-w-0 flex-col',
  route.name === 'request-detail' || isTablePageLayout.value
    ? 'min-h-0 flex-1 overflow-hidden'
    : '',
  route.name === 'request-detail' ? 'bg-muted' : ''
])

const showMobileHeader = computed(() => {
  if (route?.meta?.showPageTitle === false) return false
  if (route.name === 'task-detail' && Boolean(route.params.id)) return false
  return true
})

const showTaskDetailSplitPane = computed(() => {
  return (
    route.name === 'task-detail' &&
    layoutStore.hideHeaderForTaskDetail &&
    Boolean(route.params.id)
  )
})

</script>
