<template>
  <div class="page-container overflow-y-auto px-4 pb-6 pt-4 md:pb-8">
    <div class="mx-auto w-full max-w-[55.44rem] space-y-10">
      <template v-if="loading">
        <div v-for="cat in CATEGORY_ORDER" :key="`sk-${cat}`" class="space-y-3">
          <div class="h-7 w-40 max-w-full rounded bg-muted animate-pulse" />
          <div class="rounded-lg bg-card shadow-mk-dashboard-card overflow-hidden">
            <div class="flex flex-col">
              <template v-for="n in skeletonRowCount(cat)" :key="`${cat}-r-${n}`">
                <div
                  :class="[
                    rowGridClass,
                    n === skeletonRowCount(cat) ? '' : 'border-b border-border'
                  ]"
                >
                  <div class="min-w-0 space-y-1 px-4 py-2">
                    <div class="h-4 w-48 max-w-full rounded bg-muted animate-pulse" />
                    <div class="h-4 w-full max-w-md rounded bg-muted animate-pulse" />
                  </div>
                  <div class="flex items-center justify-center py-2 pl-6 pr-2">
                    <div class="h-7 w-12 rounded-full bg-muted animate-pulse" />
                  </div>
                  <div class="flex items-center justify-center px-2 py-2">
                    <div class="h-7 w-12 rounded-full bg-muted animate-pulse" />
                  </div>
                  <div class="flex items-center justify-center px-2 py-2">
                    <div class="h-7 w-12 rounded-full bg-muted animate-pulse" />
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div v-for="section in groupedSections" :key="section.categoryId" class="space-y-3">
          <h2 class="text-xl font-semibold leading-tight text-foreground">
            {{ t(section.titleKey) }}
          </h2>
          <div class="rounded-lg bg-card shadow-mk-dashboard-card overflow-hidden">
            <div class="flex flex-col">
              <div :class="[rowGridClass, 'border-b border-border']">
                <p class="px-4 py-2 text-sm font-semibold leading-snug text-muted-foreground">
                  {{ t('common.settingsNotifications.columns.notification') }}
                </p>
                <p
                  class="py-2 pl-6 pr-2 text-center text-sm font-semibold leading-snug text-muted-foreground"
                >
                  {{ t('common.settingsNotifications.channels.email') }}
                </p>
                <p class="px-2 py-2 text-center text-sm font-semibold leading-snug text-muted-foreground">
                  {{ t('common.settingsNotifications.channels.inApp') }}
                </p>
                <p class="px-2 py-2 text-center text-sm font-semibold leading-snug text-muted-foreground">
                  {{ t('common.settingsNotifications.channels.mobileApp') }}
                </p>
              </div>

              <div
                v-for="(row, rowIdx) in section.items"
                :key="row.id"
                :class="[
                  rowGridClass,
                  'hover:bg-muted/30',
                  rowIdx < section.items.length - 1 ? 'border-b border-border' : ''
                ]"
              >
                <div class="min-w-0 space-y-0.5 px-4 py-2">
                  <p class="text-sm font-semibold leading-snug text-foreground">
                    {{ t(row.titleKey) }}
                  </p>
                  <p class="text-sm font-normal leading-snug text-muted-foreground">
                    {{ t(row.descriptionKey) }}
                  </p>
                </div>
                <div class="flex items-center justify-center py-2 pl-6 pr-2">
                  <Switch
                    :model-value="Boolean(row?.channels?.email)"
                    :aria-label="t('common.settingsNotifications.toggleEmailAria')"
                    @update:model-value="(v) => onToggle(row.id, 'email', v)"
                  />
                </div>
                <div class="flex items-center justify-center px-2 py-2">
                  <Switch
                    :model-value="Boolean(row?.channels?.inApp)"
                    :aria-label="t('common.settingsNotifications.toggleInAppAria')"
                    @update:model-value="(v) => onToggle(row.id, 'inApp', v)"
                  />
                </div>
                <div class="flex items-center justify-center px-2 py-2">
                  <Switch
                    :model-value="Boolean(row?.channels?.mobileApp)"
                    :aria-label="t('common.settingsNotifications.toggleMobileAppAria')"
                    @update:model-value="(v) => onToggle(row.id, 'mobileApp', v)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Switch } from '@motork/component-library/future/primitives'
import { useNotificationSettingsStore } from '@/stores/notificationSettings'

const CATEGORY_ORDER = ['leads', 'integrations', 'opportunities', 'tasks', 'contacts']

const rowGridClass =
  'grid grid-cols-[minmax(0,1fr)_6.5rem_6.5rem_6.5rem] items-center'

const SKELETON_ROWS_BY_CATEGORY = {
  leads: 2,
  integrations: 1,
  opportunities: 3,
  tasks: 4,
  contacts: 1
}

const { t } = useI18n()
const store = useNotificationSettingsStore()

const items = computed(() => store.items)
const loading = computed(() => store.loading)

const groupedSections = computed(() => {
  const list = items.value
  const map = new Map(CATEGORY_ORDER.map((id) => [id, []]))
  for (const row of list) {
    const cat = row.categoryId
    if (!cat || !map.has(cat)) continue
    map.get(cat).push(row)
  }
  return CATEGORY_ORDER.filter((id) => map.get(id).length > 0).map((id) => ({
    categoryId: id,
    titleKey: `common.settingsNotifications.groups.${id}`,
    items: map.get(id)
  }))
})

function skeletonRowCount(cat) {
  return SKELETON_ROWS_BY_CATEGORY[cat] ?? 2
}

onMounted(async () => {
  await store.fetchSettings()
})

function onToggle(id, channel, nextValue) {
  store.setChannelEnabled(id, channel, Boolean(nextValue))
}
</script>
