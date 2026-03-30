<template>
  <Sidebar
    side="left"
    collapsible="icon"
    variant="sidebar"
    class="border-sidebar-border overflow-x-hidden"
  >
    <SidebarHeader class="shrink-0 px-2 py-2">
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
    </SidebarHeader>

    <SidebarContent>
      <SidebarGroup>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              as-child
              :is-active="isRouteActive('/add-new')"
              :tooltip="addNewLabel"
            >
              <RouterLink to="/add-new" class="flex min-w-0 items-center gap-2">
                <Plus class="size-4 shrink-0" />
                <span class="truncate group-data-[collapsible=icon]:hidden">{{ addNewLabel }}</span>
              </RouterLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarMenu>
          <SidebarMenuItem v-for="item in navigationItems" :key="item.href">
            <SidebarMenuButton
              as-child
              :is-active="isRouteActive(item.href)"
              :tooltip="item.name"
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
    </SidebarContent>

    <SidebarFooter>
      <SidebarUserChrome />
    </SidebarFooter>

    <SidebarRail />
  </Sidebar>
</template>

<script setup>
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Plus } from 'lucide-vue-next'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarRail,
  SidebarTrigger
} from '@motork/component-library/future/primitives'
import { useAppSidebarNavigation } from '@/composables/useAppSidebarNavigation'
import SidebarUserChrome from './SidebarUserChrome.vue'

const route = useRoute()
const { t } = useI18n()
const { firstVisibleRoute, navigationItems, addNewLabel } = useAppSidebarNavigation()

function isRouteActive(href) {
  if (href === '/home') return route.path === '/home' || route.path === '/'
  return route.path.startsWith(href)
}
</script>
