<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <SidebarMenuButton :tooltip="t('common.navigation.notifications')">
        <span class="flex min-w-0 w-full items-center gap-2">
          <span class="relative inline-flex shrink-0">
            <Bell class="size-4 shrink-0" />
            <span
              v-if="notificationCount > 0"
              class="pointer-events-none absolute -right-1 -top-1 hidden min-w-4 h-4 items-center justify-center rounded-full bg-destructive px-1 text-xs font-semibold leading-none text-destructive-foreground ring-2 ring-sidebar group-data-[collapsible=icon]:inline-flex"
              aria-hidden="true"
            >
              {{ notificationCount > 99 ? '99+' : notificationCount }}
            </span>
          </span>
          <span class="truncate group-data-[collapsible=icon]:hidden">
            {{ t('common.navigation.notifications') }}
          </span>
          <span
            v-if="notificationCount > 0"
            class="ml-auto inline-flex h-5 items-center justify-center rounded-full bg-destructive/10 px-2 text-xs font-semibold leading-none text-destructive group-data-[collapsible=icon]:hidden"
          >
            {{ notificationCount > 99 ? '99+' : notificationCount }}
          </span>
        </span>
      </SidebarMenuButton>
    </PopoverTrigger>

    <PopoverContent
      class="z-50 w-96 rounded-md border border-border bg-background p-2 shadow-md"
      align="start"
      side="right"
      :side-offset="8"
    >
      <div class="flex items-center justify-between gap-2 px-2 py-1">
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-foreground">
            {{ t('common.navigation.notifications') }}
          </p>
          <p class="truncate text-xs text-muted-foreground">
            {{ t('common.notifications.subtitle') }}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="small"
          class="shrink-0 rounded-sm"
          @click="goToNotificationCenter"
        >
          {{ t('common.notifications.seeMore') }}
        </Button>
      </div>

      <div class="mt-1 max-h-80 overflow-y-auto">
        <div v-if="loading" class="space-y-2 px-2 pb-1">
          <div v-for="n in 3" :key="`notif-sk-${n}`" class="rounded-md border border-border p-3">
            <div class="h-3 w-2/3 rounded bg-muted animate-pulse" />
            <div class="mt-2 h-3 w-1/2 rounded bg-muted animate-pulse" />
          </div>
        </div>

        <div
          v-else-if="notifications.length === 0"
          class="rounded-md border border-border bg-muted/30 px-4 py-10 text-center"
        >
          <p class="text-sm font-medium text-foreground">
            {{ t('common.notifications.emptyTitle') }}
          </p>
          <p class="mt-1 text-sm text-muted-foreground">
            {{ t('common.notifications.emptySubtitle') }}
          </p>
        </div>

        <div v-else class="space-y-1 px-1 pb-1">
          <div
            v-for="item in notifications"
            :key="item.id"
            class="flex items-start gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/30"
          >
            <span class="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
              <component :is="iconForType(item.type)" class="size-4 text-muted-foreground" />
            </span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-foreground">
                {{ t(item.titleKey) }}
              </p>
              <p v-if="item.bodyKey" class="truncate text-sm text-muted-foreground">
                {{ t(item.bodyKey) }}
              </p>
              <p class="mt-1 text-xs text-muted-foreground">
                {{ formatTimestamp(item.createdAt) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Bell, CircleAlert, Megaphone, MessageSquare } from 'lucide-vue-next'
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  SidebarMenuButton
} from '@motork/component-library/future/primitives'
import { useNotificationsStore } from '@/stores/notifications'

const router = useRouter()
const { t, locale } = useI18n()
const store = useNotificationsStore()

const open = ref(false)

const notifications = computed(() => store.notifications)
const loading = computed(() => store.loading)
const notificationCount = computed(() => store.notificationCount)

async function loadNotificationsIfNeeded() {
  if (store.notifications.length > 0 || store.loading) return
  await store.fetchNotifications({ limit: 20 })
}

onMounted(() => {
  loadNotificationsIfNeeded()
})

watch(open, async (isOpen) => {
  if (!isOpen) return
  await loadNotificationsIfNeeded()
})

function goToNotificationCenter() {
  open.value = false
  router.push('/notifications')
}

function iconForType(type) {
  if (type === 'message') return MessageSquare
  if (type === 'update') return Megaphone
  return CircleAlert
}

function formatTimestamp(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(locale.value || undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}
</script>

