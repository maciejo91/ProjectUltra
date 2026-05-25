<template>
  <div class="flex w-full min-w-0 items-center gap-3">
    <div
      class="flex size-11 shrink-0 flex-col overflow-hidden rounded-md border border-border bg-background"
      aria-hidden="true"
    >
      <div class="flex h-4 w-full shrink-0 items-center justify-center bg-muted">
        <span class="text-xs font-semibold uppercase leading-none tracking-wide text-muted-foreground">
          {{ monthLabel }}
        </span>
      </div>
      <div class="flex min-h-0 flex-1 items-center justify-center">
        <span class="text-base font-semibold tabular-nums leading-none text-foreground">
          {{ dayNumber }}
        </span>
      </div>
    </div>

    <div class="flex min-w-0 flex-1 flex-col justify-center gap-1 py-0.5">
      <div class="flex min-w-0 flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <p class="min-w-0 flex-1 text-sm font-medium leading-snug text-foreground wrap-break-word">
          {{ cardTitle }}
        </p>
        <span
          v-if="statusLabel"
          class="inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium leading-none"
          :class="statusClass"
        >
          {{ statusLabel }}
        </span>
      </div>

      <p
        v-if="metaSegments.length > 0"
        class="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-sm leading-snug text-muted-foreground"
      >
        <template v-for="(segment, index) in metaSegments" :key="`${segment}-${index}`">
          <span
            v-if="index > 0"
            class="shrink-0 text-muted-foreground/40"
            aria-hidden="true"
          >
            ·
          </span>
          <span class="min-w-0 wrap-break-word">{{ segment }}</span>
        </template>
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatTime } from '@/utils/formatters'
import { getEventTypeLabel } from '@/utils/calendarHelpers'
import { translateText } from '@/api/mockData/locales/translations.js'

const props = defineProps({
  activity: {
    type: Object,
    required: true
  }
})

const { t, locale } = useI18n()

const eventData = computed(() => props.activity?.data || {})

const startIso = computed(
  () => eventData.value.start || props.activity?.timestamp || ''
)

const endIso = computed(() => eventData.value.end || '')

const startDate = computed(() => {
  if (!startIso.value) return null
  const d = new Date(startIso.value)
  return Number.isNaN(d.getTime()) ? null : d
})

const monthLabel = computed(() => {
  if (!startDate.value) return ''
  return startDate.value
    .toLocaleDateString(locale.value, { month: 'short' })
    .toUpperCase()
})

const dayNumber = computed(() => (startDate.value ? startDate.value.getDate() : ''))

const startTimeLabel = computed(() =>
  startDate.value ? formatTime(startDate.value) : ''
)

const cardTitle = computed(() => {
  const eventType = eventData.value.eventType
  if (eventType) {
    return translateText(getEventTypeLabel(eventType), locale.value)
  }
  const raw = props.activity?.title || ''
  return raw ? translateText(raw, locale.value) : t('entities.activity.timeline.calendarEventFallback')
})

const timeRangeLine = computed(() => {
  if (!startTimeLabel.value) return ''
  if (!endIso.value || !startIso.value) return startTimeLabel.value
  const end = new Date(endIso.value)
  if (Number.isNaN(end.getTime())) return startTimeLabel.value
  const endTime = formatTime(end)
  if (endTime === startTimeLabel.value) return startTimeLabel.value
  return `${startTimeLabel.value} – ${endTime}`
})

const locationLine = computed(() => {
  const loc = props.activity?.location
  return loc ? translateText(loc, locale.value) : ''
})

const vehicleLine = computed(() => {
  const v = props.activity?.vehicle
  return v ? translateText(v, locale.value) : ''
})

const assigneeLine = computed(() => {
  const name = eventData.value.assignee || props.activity?.user
  if (!name) return ''
  return t('entities.activity.timeline.calendarEventAssignee', { name })
})

const metaSegments = computed(() =>
  [timeRangeLine.value, locationLine.value, vehicleLine.value, assigneeLine.value].filter(Boolean)
)

const statusKey = computed(() => String(eventData.value.status || '').toLowerCase())

const statusLabel = computed(() => {
  const key = statusKey.value
  if (!key) return ''
  const map = {
    confirmed: 'entities.activity.timeline.calendarEventStatus.confirmed',
    'pending_confirmation': 'entities.activity.timeline.calendarEventStatus.pending',
    pending: 'entities.activity.timeline.calendarEventStatus.pending',
    cancelled: 'entities.activity.timeline.calendarEventStatus.cancelled',
    canceled: 'entities.activity.timeline.calendarEventStatus.cancelled',
    'no-show': 'entities.activity.timeline.calendarEventStatus.noShow'
  }
  const i18nKey = map[key]
  return i18nKey ? t(i18nKey) : eventData.value.status
})

const statusClass = computed(() => {
  const key = statusKey.value
  if (key === 'confirmed') return 'bg-emerald-100 text-emerald-800'
  if (key === 'pending_confirmation' || key === 'pending') return 'bg-amber-100 text-amber-800'
  if (key === 'cancelled' || key === 'canceled') return 'bg-muted text-muted-foreground'
  if (key === 'no-show') return 'bg-destructive/10 text-destructive'
  return 'bg-muted text-muted-foreground'
})
</script>
