<template>
  <Sidebar
    side="left"
    :collapsible="isSettingsArea ? 'none' : 'icon'"
    variant="sidebar"
    class="relative border-sidebar-border overflow-visible"
  >
    <SidebarHeader class="shrink-0 px-2 py-2">
      <template v-if="!isSettingsArea">
        <div
          class="flex min-h-10 min-w-0 items-center justify-between gap-2 group-data-[collapsible=icon]:hidden"
        >
          <RouterLink
            to="/home"
            class="flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent focus-visible:ring-2"
          >
            <div class="flex size-8 shrink-0 items-center justify-center rounded-md">
              <img
                src="@/assets/images/leadspark-logo.png"
                alt="LeadSparK"
                class="size-7 rounded-sm object-contain"
              />
            </div>
            <span class="truncate text-left text-sm font-semibold text-sidebar-foreground">
              LeadSparK
            </span>
          </RouterLink>
          <SidebarTrigger
            class="size-9 shrink-0 rounded-md text-sidebar-foreground outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent focus-visible:ring-2"
            :aria-label="t('common.layout.toggleSidebar')"
          />
        </div>

        <div
          class="relative hidden h-10 w-full items-center justify-center group-data-[collapsible=icon]:flex"
        >
          <RouterLink
            to="/home"
            class="absolute inset-0 z-10 flex items-center justify-center rounded-md outline-none ring-sidebar-ring transition-opacity duration-200 hover:bg-sidebar-accent focus-visible:ring-2 group-hover:pointer-events-none group-hover:opacity-0"
            :aria-label="t('common.navigation.home')"
          >
            <img
              src="@/assets/images/leadspark-logo.png"
              alt=""
              class="size-7 rounded-sm object-contain"
            />
          </RouterLink>
          <SidebarTrigger
            class="relative z-20 size-10 shrink-0 rounded-md text-sidebar-foreground opacity-0 outline-none ring-sidebar-ring transition-opacity duration-200 pointer-events-none hover:bg-sidebar-accent focus-visible:pointer-events-auto focus-visible:opacity-100 focus-visible:ring-2 group-hover:pointer-events-auto group-hover:opacity-100"
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
        <SidebarGroup v-if="hasActionsGroup">
          <SidebarMenu>
            <SidebarMenuItem v-if="actionsVisibility.addNew">
              <TooltipProvider v-if="lockedActions.addNew" :delay-duration="200">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <SidebarMenuButton
                      :aria-disabled="true"
                      :class="lockedNavButtonClass"
                      @click.prevent
                    >
                      <span class="flex min-w-0 w-full items-center gap-2">
                        <Plus class="size-4 shrink-0" />
                        <span class="truncate group-data-[collapsible=icon]:hidden">{{ addNewLabel }}</span>
                      </span>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center" class="max-w-xs">
                    {{ lockedTooltipText }}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <SidebarMenuButton
                v-else
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
            <SidebarMenuItem v-if="actionsVisibility.search">
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
            <SidebarMenuItem>
              <TooltipProvider v-if="lockedActions.notifications" :delay-duration="200">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <SidebarMenuButton
                      :aria-disabled="true"
                      :class="lockedNavButtonClass"
                      @click.prevent
                    >
                      <span class="flex min-w-0 w-full items-center gap-2">
                        <Bell class="size-4 shrink-0" />
                        <span class="truncate group-data-[collapsible=icon]:hidden">
                          {{ t('common.navigation.notifications') }}
                        </span>
                      </span>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center" class="max-w-xs">
                    {{ lockedTooltipText }}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <SidebarNotificationsPopover v-else />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup v-if="primaryNavItems.length > 0">
          <SidebarGroupLabel
            class="group-data-[collapsible=icon]:hidden px-2 text-sm font-medium text-muted-foreground"
          >
            {{ t('common.navigation.groups.workspace') }}
          </SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in primaryNavItems" :key="item.href">
              <TooltipProvider v-if="item.locked" :delay-duration="200">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <SidebarMenuButton
                      :aria-disabled="true"
                      :class="lockedNavButtonClass"
                      @click.prevent
                    >
                      <span class="flex min-w-0 w-full items-center gap-2">
                        <component :is="item.icon" class="size-4 shrink-0" />
                        <span class="truncate group-data-[collapsible=icon]:hidden">{{ item.name }}</span>
                      </span>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center" class="max-w-xs">
                    {{ lockedTooltipText }}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <SidebarMenuButton
                v-else
                as-child
                :is-active="!item.locked && isRouteActive(item.href)"
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

        <SidebarGroup v-if="dataNavItems.length > 0">
          <SidebarGroupLabel
            class="group-data-[collapsible=icon]:hidden px-2 text-sm font-medium text-muted-foreground"
          >
            {{ t('common.navigation.groups.data') }}
          </SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in dataNavItems" :key="dataItemKey(item)">
              <TooltipProvider v-if="item.locked" :delay-duration="200">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <SidebarMenuButton
                      :aria-disabled="true"
                      :class="lockedNavButtonClass"
                      @click.prevent
                    >
                      <span class="flex min-w-0 w-full items-center gap-2">
                        <component :is="item.icon" class="size-4 shrink-0" />
                        <span class="truncate group-data-[collapsible=icon]:hidden">{{ item.name }}</span>
                      </span>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center" class="max-w-xs">
                    {{ lockedTooltipText }}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <SidebarMenuButton
                v-else
                as-child
                :is-active="!item.locked && isRouteActive(item.href)"
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
    </SidebarContent>

    <SidebarGroup v-if="!isSettingsArea" class="shrink-0 px-2 pb-2">
      <SidebarMenu>
        <SidebarMenuItem>
          <Popover v-model:open="pbxPopoverOpen">
            <PopoverTrigger as-child>
              <SidebarMenuButton :tooltip="t('common.navigation.pbx.connected')">
                <span class="flex min-w-0 w-full items-center gap-2">
                  <span class="relative inline-flex shrink-0">
                    <Phone class="size-4 shrink-0" />
                    <span
                      class="pointer-events-none absolute -right-0.5 -top-0.5 hidden size-2 rounded-full bg-emerald-500 ring-2 ring-sidebar group-data-[collapsible=icon]:block"
                      aria-hidden="true"
                    />
                  </span>
                  <span class="min-w-0 truncate group-data-[collapsible=icon]:hidden">
                    <span class="inline-flex items-center gap-2">
                      <span>{{ t('common.navigation.pbx.label') }}</span>
                      <span class="size-2 rounded-full bg-emerald-500" aria-hidden="true" />
                    </span>
                  </span>
                  <ChevronRight
                    class="ml-auto size-4 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden"
                    aria-hidden="true"
                  />
                </span>
              </SidebarMenuButton>
            </PopoverTrigger>
            <PopoverContent
              class="z-50 w-auto min-w-36 rounded-md border border-border bg-background p-1 shadow-md"
              align="center"
              side="top"
              :side-offset="8"
            >
              <Button
                type="button"
                variant="ghost"
                class="h-9 w-full justify-start gap-2 rounded-sm px-2 text-sm font-normal text-destructive hover:text-destructive"
                @click="onPbxDisconnect"
              >
                <PhoneOff class="size-3.5 shrink-0" />
                {{ t('common.navigation.pbx.disconnect') }}
              </Button>
            </PopoverContent>
          </Popover>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>

    <SidebarGroup class="shrink-0 border-t border-sidebar-border pt-2">
      <SidebarMenu>
        <SidebarMenuItem v-if="bottomNavVisibility.settings && !isSettingsArea">
          <TooltipProvider v-if="lockedActions.settings" :delay-duration="200">
            <Tooltip>
              <TooltipTrigger as-child>
                <SidebarMenuButton
                  :aria-disabled="true"
                  :class="lockedNavButtonClass"
                  @click.prevent
                >
                  <span class="flex min-w-0 w-full items-center gap-2">
                    <Settings class="size-4 shrink-0" />
                    <span class="truncate group-data-[collapsible=icon]:hidden">{{
                      t('common.navigation.settings')
                    }}</span>
                  </span>
                </SidebarMenuButton>
              </TooltipTrigger>
              <TooltipContent side="right" align="center" class="max-w-xs">
                {{ lockedTooltipText }}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <SidebarMenuButton
            v-else
            as-child
            :is-active="isRouteActive(settingsPath)"
            :tooltip="t('common.navigation.settings')"
            class="data-[active=true]:rounded-lg data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
          >
            <RouterLink
              :to="settingsPath"
              class="flex min-w-0 w-full items-center gap-2"
              @click="expandSidebarFromIconMode"
            >
              <Settings class="size-4 shrink-0" />
              <span class="truncate group-data-[collapsible=icon]:hidden">{{
                t('common.navigation.settings')
              }}</span>
              <ChevronRight
                class="ml-auto size-4 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden"
              />
            </RouterLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem v-if="bottomNavVisibility.support">
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

    <SidebarRail v-if="!isSettingsArea" class="cursor-col-resize!" />

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
import {
  Plus,
  Search,
  LifeBuoy,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  Phone,
  PhoneOff
} from 'lucide-vue-next'
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
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
  SidebarTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  useSidebar
} from '@motork/component-library/future/primitives'
import { useLayoutStore } from '@/stores/layout'
import { useAppSidebarNavigation } from '@/composables/useAppSidebarNavigation'
import {
  SETTINGS_NAV_SECTIONS,
  SETTINGS_PROTOTYPE_PATH,
  settingsPathForRel
} from '@/constants/settingsNavRoutes'
import ComingSoonModal from '@/components/modals/ComingSoonModal.vue'
import SidebarUserChrome from './SidebarUserChrome.vue'
import SidebarNotificationsPopover from './SidebarNotificationsPopover.vue'
import { useToastStore } from '@/stores/toast'

const route = useRoute()
const { t } = useI18n()
const layoutStore = useLayoutStore()
const { state: sidebarUiState, setOpen, isMobile, setOpenMobile } = useSidebar()
const {
  actionsVisibility,
  bottomNavVisibility,
  lockedActions,
  firstVisibleRoute,
  primaryNavItems,
  dataNavItems,
  addNewLabel
} = useAppSidebarNavigation()

const settingsPath = '/settings'
const showSupportModal = ref(false)
const pbxPopoverOpen = ref(false)
const toastStore = useToastStore()
const lockedNavButtonClass = 'text-foreground/75 hover:text-foreground/85 hover:bg-muted/70 cursor-not-allowed opacity-100'
const lockedTooltipText = computed(() => t('common.layout.demoAccess.lockedTooltip'))

function onPbxDisconnect() {
  pbxPopoverOpen.value = false
  toastStore.pushToast('success', t('common.navigation.pbx.disconnected'))
}

const isSettingsArea = computed(() => route.path.startsWith('/settings'))

function expandSidebarFromIconMode() {
  if (isMobile.value) setOpenMobile(true)
  else if (sidebarUiState.value === 'collapsed') setOpen(true)
}

const hasActionsGroup = computed(() => true)

function dataItemKey(item) {
  return item.href
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
