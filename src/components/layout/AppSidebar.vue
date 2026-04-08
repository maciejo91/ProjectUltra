<template>
  <Sidebar
    side="left"
    :collapsible="isSettingsArea ? 'none' : 'icon'"
    variant="sidebar"
    class="border-sidebar-border overflow-x-hidden"
  >
    <SidebarHeader class="shrink-0 px-2 py-2">
      <template v-if="!isSettingsArea">
        <div
          class="flex min-w-0 items-center justify-between gap-2 group-data-[collapsible=icon]:hidden"
        >
          <RouterLink
            :to="firstVisibleRoute"
            class="flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent focus-visible:ring-2"
          >
            <div class="flex size-8 shrink-0 items-center justify-center rounded-md">
              <img
                src="@/assets/images/leadspark-logo.png"
                alt="LeadSparK"
                class="size-6 object-contain"
              />
            </div>
            <span class="truncate text-left text-sm font-semibold text-sidebar-foreground">
              LeadSparK
            </span>
          </RouterLink>
          <SidebarTrigger
            class="shrink-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
            :aria-label="t('common.layout.toggleSidebar')"
          />
        </div>

        <div
          class="relative hidden h-10 w-full items-center justify-center group-data-[collapsible=icon]:flex"
        >
          <RouterLink
            :to="firstVisibleRoute"
            class="flex size-10 items-center justify-center rounded-md outline-none ring-sidebar-ring transition-opacity hover:bg-sidebar-accent focus-visible:ring-2 group-hover:pointer-events-none group-hover:opacity-0"
          >
            <img
              src="@/assets/images/leadspark-logo.png"
              alt="LeadSparK"
              class="size-6 object-contain"
            />
          </RouterLink>
          <SidebarTrigger
            class="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 opacity-0 pointer-events-none transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
            :aria-label="t('common.layout.toggleSidebar')"
          />
        </div>
      </template>

      <template v-else>
        <div class="flex min-w-0 w-full items-center gap-2">
          <RouterLink
            :to="firstVisibleRoute"
            class="flex size-8 shrink-0 items-center justify-center rounded-md outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent focus-visible:ring-2"
            :aria-label="t('common.buttons.back')"
          >
            <ChevronLeft class="size-4 shrink-0 text-sidebar-foreground" />
          </RouterLink>
          <span
            class="min-w-0 flex-1 truncate text-center text-sm font-semibold text-sidebar-foreground"
          >
            {{ t('common.navigation.settings') }}
          </span>
        </div>
      </template>
    </SidebarHeader>

    <SidebarContent class="flex flex-1 min-h-0 flex-col overflow-hidden">
      <div v-if="!isSettingsArea" class="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel
            class="group-data-[collapsible=icon]:hidden px-2 text-sm font-medium text-muted-foreground"
          >
            {{ t('common.navigation.groups.actions') }}
          </SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                as-child
                :is-active="isRouteActive('/add-new')"
                :tooltip="addNewLabel"
                class="data-[active=true]:rounded-lg data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
              >
                <RouterLink to="/add-new" class="flex min-w-0 w-full items-center gap-2">
                  <Plus class="size-4 shrink-0" />
                  <span class="truncate group-data-[collapsible=icon]:hidden">{{ addNewLabel }}</span>
                </RouterLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem v-if="navigationVisibility.search !== false">
              <SidebarMenuButton as-child :tooltip="t('common.buttons.search')">
                <button
                  type="button"
                  class="flex min-w-0 w-full items-center gap-2"
                  @click="layoutStore.setSearchModalOpen(true)"
                >
                  <Search class="size-4 shrink-0" />
                  <span class="truncate group-data-[collapsible=icon]:hidden">{{
                    t('common.buttons.search')
                  }}</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel
            class="group-data-[collapsible=icon]:hidden px-2 text-sm font-medium text-muted-foreground"
          >
            {{ t('common.navigation.groups.workspace') }}
          </SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in primaryNavItems" :key="item.href">
              <SidebarMenuButton
                as-child
                :is-active="isRouteActive(item.href)"
                :tooltip="item.name"
                class="data-[active=true]:rounded-lg data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
              >
                <RouterLink :to="item.href" class="flex min-w-0 w-full items-center gap-2">
                  <component :is="item.icon" class="size-4 shrink-0" />
                  <span class="truncate group-data-[collapsible=icon]:hidden">{{ item.name }}</span>
                  <SidebarMenuBadge
                    v-if="item.notificationCount"
                    class="ml-auto group-data-[collapsible=icon]:hidden"
                  >
                    {{ item.notificationCount }}
                  </SidebarMenuBadge>
                </RouterLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel
            class="group-data-[collapsible=icon]:hidden px-2 text-sm font-medium text-muted-foreground"
          >
            {{ t('common.navigation.groups.data') }}
          </SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in dataNavItems" :key="dataItemKey(item)">
              <SidebarMenuButton
                v-if="item.kind === 'comingSoon'"
                :tooltip="item.name"
                class="data-[active=true]:rounded-lg data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                @click="showMarketingModal = true"
              >
                <component :is="item.icon" class="size-4 shrink-0" />
                <span class="truncate group-data-[collapsible=icon]:hidden">{{ item.name }}</span>
              </SidebarMenuButton>
              <SidebarMenuButton
                v-else
                as-child
                :is-active="isRouteActive(item.href)"
                :tooltip="item.name"
                class="data-[active=true]:rounded-lg data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
              >
                <RouterLink :to="item.href" class="flex min-w-0 w-full items-center gap-2">
                  <component :is="item.icon" class="size-4 shrink-0" />
                  <span class="truncate group-data-[collapsible=icon]:hidden">{{ item.name }}</span>
                </RouterLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <div class="min-h-4 flex-1 shrink-0" aria-hidden="true" />
      </div>

      <div v-else class="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <SidebarGroup v-for="section in SETTINGS_NAV_SECTIONS" :key="section.sectionKey">
          <SidebarGroupLabel
            class="group-data-[collapsible=icon]:hidden px-2 text-sm font-semibold text-foreground"
          >
            {{ t(`common.navigation.settingsSections.${section.sectionKey}`) }}
          </SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in section.items" :key="item.relPath">
              <SidebarMenuButton
                as-child
                :is-active="isSettingsNavActive(settingsPathForRel(item.relPath))"
                :tooltip="t(item.titleKey)"
                class="data-[active=true]:rounded-lg data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
              >
                <RouterLink
                  :to="settingsPathForRel(item.relPath)"
                  class="flex min-w-0 w-full items-center gap-2"
                >
                  <span class="truncate group-data-[collapsible=icon]:hidden">{{
                    t(item.titleKey)
                  }}</span>
                </RouterLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel
            class="group-data-[collapsible=icon]:hidden px-2 text-sm font-semibold text-foreground"
          >
            {{ t('common.navigation.settingsSections.prototype') }}
          </SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                as-child
                :is-active="isSettingsNavActive(SETTINGS_PROTOTYPE_PATH)"
                :tooltip="t('common.navigation.settingsPrototype')"
                class="data-[active=true]:rounded-lg data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
              >
                <RouterLink
                  :to="SETTINGS_PROTOTYPE_PATH"
                  class="flex min-w-0 w-full items-center gap-2"
                >
                  <span class="truncate group-data-[collapsible=icon]:hidden">{{
                    t('common.navigation.settingsPrototype')
                  }}</span>
                </RouterLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <div class="min-h-4 flex-1 shrink-0" aria-hidden="true" />
      </div>

      <SidebarGroup class="shrink-0 border-t border-sidebar-border pt-2">
        <SidebarMenu>
          <SidebarMenuItem v-if="userStore.canAccessSettings() && !isSettingsArea">
            <SidebarMenuButton
              as-child
              :is-active="isRouteActive(settingsPath)"
              :tooltip="t('common.navigation.settings')"
              class="data-[active=true]:rounded-lg data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
            >
              <RouterLink :to="settingsPath" class="flex min-w-0 w-full items-center gap-2">
                <Settings class="size-4 shrink-0" />
                <span class="truncate group-data-[collapsible=icon]:hidden">{{
                  t('common.navigation.settings')
                }}</span>
              </RouterLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem v-if="navigationVisibility.support !== false">
            <SidebarMenuButton :tooltip="t('common.navigation.support')" @click="showSupportModal = true">
              <LifeBuoy class="size-4 shrink-0" />
              <span class="truncate group-data-[collapsible=icon]:hidden">{{
                t('common.navigation.support')
              }}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarUserChrome />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>

    <SidebarRail v-if="!isSettingsArea" />

    <ComingSoonModal
      :show="showMarketingModal"
      :title="t('common.navigation.marketing')"
      @close="showMarketingModal = false"
    />
    <ComingSoonModal
      :show="showSupportModal"
      :title="t('common.navigation.support')"
      @close="showSupportModal = false"
    />
  </Sidebar>
</template>

<script setup>
import { computed, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Plus, Search, LifeBuoy, Settings, ChevronLeft } from 'lucide-vue-next'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarRail,
  SidebarTrigger
} from '@motork/component-library/future/primitives'
import { useLayoutStore } from '@/stores/layout'
import { useUserStore } from '@/stores/user'
import { useAppSidebarNavigation } from '@/composables/useAppSidebarNavigation'
import {
  SETTINGS_NAV_SECTIONS,
  SETTINGS_PROTOTYPE_PATH,
  settingsPathForRel
} from '@/constants/settingsNavRoutes'
import ComingSoonModal from '@/components/modals/ComingSoonModal.vue'
import SidebarUserChrome from './SidebarUserChrome.vue'

const route = useRoute()
const { t } = useI18n()
const layoutStore = useLayoutStore()
const userStore = useUserStore()
const {
  navigationVisibility,
  firstVisibleRoute,
  primaryNavItems,
  dataNavItems,
  addNewLabel
} = useAppSidebarNavigation()

const settingsPath = '/settings'
const showMarketingModal = ref(false)
const showSupportModal = ref(false)

const isSettingsArea = computed(() => route.path.startsWith('/settings'))

function dataItemKey(item) {
  return item.kind === 'comingSoon' ? item.id : item.href
}

function isSettingsNavActive(path) {
  return route.path === path
}

function isRouteActive(href) {
  if (href === '/home') return route.path === '/home' || route.path === '/'
  if (href === '/tasks') {
    if (route.path.startsWith('/requests') && route.query?.from === 'tasks') return true
    return route.path.startsWith('/tasks')
  }
  if (href === '/requests') {
    if (route.path.startsWith('/requests') && route.query?.from === 'tasks') return false
    return route.path.startsWith('/requests')
  }
  return route.path.startsWith(href)
}
</script>
