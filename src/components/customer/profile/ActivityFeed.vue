<template>
  <div class="space-y-4">
    <div v-if="showHeading" class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-foreground">{{ t('customerProfile.activityFeed.title') }}</h3>
      <Button variant="outline" size="sm" class="rounded-sm" @click="$emit('add')">{{
        t('customerProfile.activityFeed.add')
      }}</Button>
    </div>

    <ul v-if="displayActivities.length" class="m-0 list-none p-0" role="list">
      <li
        v-for="(activity, index) in displayActivities"
        :key="activity.id ?? `activity-${index}`"
        class="flex items-start gap-3"
      >
        <div class="flex w-8 shrink-0 flex-col items-center">
          <div
            class="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm"
          >
            <component :is="getActivityIcon(activity.type)" class="size-3.5 shrink-0" aria-hidden />
          </div>
          <div
            v-if="index < displayActivities.length - 1"
            class="mt-2 w-px flex-1 min-h-8 bg-border"
            aria-hidden
          />
        </div>
        <div
          class="min-w-0 flex-1 pt-1.5"
          :class="index < displayActivities.length - 1 ? 'pb-6' : 'pb-0'"
        >
          <div class="flex min-w-0 items-center justify-between gap-3">
            <p class="min-w-0 flex-1 text-sm leading-5 text-foreground">
              <span class="font-medium">{{
                activity.user || t('customerProfile.activityFeed.systemUser')
              }}</span>
              <span class="text-muted-foreground">{{
                activity.action ? ` ${activity.action}` : ` ${t('customerProfile.activityFeed.performedAction')}`
              }}</span>
            </p>
            <time
              class="shrink-0 whitespace-nowrap text-right text-sm leading-5 text-muted-foreground tabular-nums"
              :datetime="activity.timestamp || undefined"
            >
              {{ formatTime(activity.timestamp) }}
            </time>
          </div>
        </div>
      </li>
    </ul>

    <div
      v-else
      :class="
        variant === 'nested'
          ? 'w-full rounded-lg bg-muted p-2 text-sm font-normal leading-5 text-muted-foreground'
          : 'text-sm text-muted-foreground'
      "
    >
      {{ t('customerProfile.activityFeed.empty') }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@motork/component-library/future/primitives'
import {
  Calendar,
  FileText,
  Gift,
  Mail,
  MessageCircle,
  Paperclip,
  Phone,
  Plus,
  User
} from 'lucide-vue-next'

const props = defineProps({
  activities: { type: Array, default: () => [] },
  showHeading: { type: Boolean, default: true },
  variant: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'nested'].includes(v)
  }
})

defineEmits(['add'])

const { t } = useI18n()

const displayActivities = computed(() => {
  const list = [...(props.activities || [])]
  return list
    .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
    .slice(0, 5)
})

function getActivityIcon(type) {
  const icons = {
    note: FileText,
    email: Mail,
    'customer-email': Mail,
    call: Phone,
    meeting: Calendar,
    appointment: Calendar,
    whatsapp: MessageCircle,
    'customer-whatsapp': MessageCircle,
    sms: MessageCircle,
    attachment: Paperclip,
    offer: Gift,
    tradein: Plus,
    financing: Plus,
    lead: Plus,
    default: User
  }
  const key = typeof type === 'string' ? type : ''
  return icons[key] || icons.default
}

function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return t('customerProfile.activityFeed.justNow')
  if (diffMins < 60) {
    return t('customerProfile.activityFeed.minutesAgo', { count: diffMins })
  }
  if (diffMins < 1440) {
    const h = Math.floor(diffMins / 60)
    return t('customerProfile.activityFeed.hoursAgo', { count: h })
  }
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>
