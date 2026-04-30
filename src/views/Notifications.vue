<template>
  <div class="page-container flex flex-col min-h-0 bg-muted">
    <div class="flex-1 overflow-y-auto px-6 pt-4 pb-8 md:pt-6 md:pb-10 lg:pb-12 min-h-0">
      <div v-if="loading" class="space-y-2">
        <div v-for="n in 6" :key="`notif-page-sk-${n}`" class="rounded-lg border border-border bg-card p-4">
          <div class="flex items-start gap-3">
            <div class="size-10 shrink-0 rounded-md bg-muted animate-pulse" />
            <div class="min-w-0 flex-1">
              <div class="h-4 w-2/3 rounded bg-muted animate-pulse" />
              <div class="mt-2 h-3 w-1/2 rounded bg-muted animate-pulse" />
              <div class="mt-3 h-3 w-1/3 rounded bg-muted animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <div
        v-else-if="unreadNotifications.length === 0 && readNotifications.length === 0"
        class="rounded-lg border border-border bg-muted/30 p-10 text-center"
      >
        <p class="text-sm font-medium text-foreground">
          {{ t('common.notifications.emptyTitle') }}
        </p>
        <p class="mt-1 text-sm text-muted-foreground">
          {{ t('common.notifications.emptySubtitle') }}
        </p>
      </div>

      <div v-else class="space-y-6">
        <section v-if="unreadNotifications.length > 0" class="space-y-3">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-sm font-semibold text-foreground">
              {{ t('common.notifications.sections.unread') }}
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="small"
              class="shrink-0 rounded-sm"
              @click="markAllAsRead"
            >
              {{ t('common.notifications.markAllAsRead') }}
            </Button>
          </div>
          <div
            class="divide-y divide-border rounded-lg border border-border bg-card overflow-hidden shadow-mk-dashboard-card"
          >
            <div
              v-for="item in unreadNotifications"
              :key="item.id"
              class="flex items-start gap-3 px-4 py-4 md:px-6"
            >
              <span class="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
                <component :is="iconForType(item.type)" class="size-5 text-muted-foreground" />
              </span>

              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-foreground">
                  {{ t(item.titleKey) }}
                </p>
                <p v-if="item.bodyKey" class="truncate text-sm text-muted-foreground mt-0.5">
                  {{ t(item.bodyKey) }}
                </p>
                <p class="mt-2 text-xs text-muted-foreground">
                  {{ formatTimestamp(item.createdAt) }}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section v-if="readNotifications.length > 0" class="space-y-3">
          <h2 class="text-sm font-semibold text-foreground">
            {{ t('common.notifications.sections.read') }}
          </h2>
          <div class="divide-y divide-border">
            <div
              v-for="item in readNotifications"
              :key="item.id"
              class="flex items-start gap-3 px-4 py-4 md:px-6 transition-colors hover:bg-muted/30"
            >
              <span class="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
                <component :is="iconForType(item.type)" class="size-5 text-muted-foreground" />
              </span>

              <div class="min-w-0 flex-1">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold text-foreground">
                      {{ t(item.titleKey) }}
                    </p>
                    <p v-if="item.bodyKey" class="truncate text-sm text-muted-foreground mt-0.5">
                      {{ t(item.bodyKey) }}
                    </p>
                  </div>

                  <span
                    class="shrink-0 inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-1 text-xs font-semibold text-foreground"
                  >
                    <Check class="size-3.5 shrink-0 text-muted-foreground" />
                    {{ t('common.notifications.read') }}
                  </span>
                </div>

                <p class="mt-2 text-xs text-muted-foreground">
                  {{ formatTimestamp(item.createdAt) }}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Check, CircleAlert, Megaphone, MessageSquare } from 'lucide-vue-next'
import { Button } from '@motork/component-library/future/primitives'
import { useNotificationsStore } from '@/stores/notifications'

const { t, locale } = useI18n()
const store = useNotificationsStore()

const notifications = computed(() => store.notifications)
const loading = computed(() => store.loading)

const unreadNotifications = computed(() => notifications.value.filter((n) => n?.isRead === false))
const readNotifications = computed(() => notifications.value.filter((n) => n?.isRead !== false))

onMounted(async () => {
  await store.fetchNotifications()
})

function markAllAsRead() {
  store.markAllAsRead()
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

