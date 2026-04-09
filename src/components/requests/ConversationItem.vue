<template>
  <div v-if="variant === 'bubble'" class="w-full">
    <div
      class="flex w-full gap-2"
      :class="isInbound ? 'justify-start' : 'justify-end'"
    >
      <div
        v-if="isInbound"
        class="flex size-8 shrink-0 items-center justify-center rounded-full"
        :class="iconBgClass"
      >
        <component :is="channelIcon" class="size-4 shrink-0" :class="iconColorClass" />
      </div>
      <div
        class="flex min-w-0 max-w-lg flex-col"
        :class="isInbound ? 'items-start' : 'items-end'"
      >
        <div
          class="wrap-break-word px-4 py-2.5 text-sm leading-relaxed shadow-sm"
          :class="bubbleBodyClass"
        >
          <p :class="isInbound ? 'text-foreground' : 'text-primary-foreground'">
            {{ expanded || !isLong ? content : truncatedContent }}
          </p>
          <button
            v-if="isLong"
            type="button"
            class="mt-1 text-xs font-medium underline-offset-2 hover:underline"
            :class="isInbound ? 'text-primary' : 'text-primary-foreground/90'"
            @click="expanded = !expanded"
          >
            {{
              expanded
                ? t('common.conversations.thread.showLess')
                : t('common.conversations.thread.showMore')
            }}
          </button>
        </div>
        <div
          class="mt-1 flex max-w-full flex-wrap items-center gap-x-2 gap-y-0.5 px-1 text-xs text-muted-foreground"
          :class="isInbound ? 'justify-start' : 'justify-end'"
        >
          <span class="font-medium text-foreground/80">{{ activity.user }}</span>
          <span>{{ formatBubbleTime(activity.timestamp) }}</span>
          <span
            class="inline-flex items-center gap-0.5 rounded px-1 py-px text-xs font-medium uppercase leading-none"
            :class="channelBadgeClass"
          >
            <component :is="channelIcon" class="size-2.5 shrink-0" />
            {{ t(channelLabelKey) }}
          </span>
        </div>
      </div>
    </div>
  </div>

  <div
    v-else
    class="flex items-start gap-3 rounded-lg border text-card-foreground"
    :class="rootClass"
  >
    <div class="shrink-0">
      <div class="flex h-8 w-8 items-center justify-center rounded-full" :class="iconBgClass">
        <component :is="icon" class="h-4 w-4" :class="iconColorClass" />
      </div>
    </div>
    <div class="min-w-0 flex-1 space-y-1">
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-foreground">{{ activity.user }}</span>
          <span
            class="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-sm font-medium uppercase leading-none"
            :class="channelBadgeClass"
          >
            <component :is="channelIcon" class="h-3 w-3 shrink-0" />
            {{ t(channelLabelKey) }}
          </span>
        </div>
        <span class="text-sm text-muted-foreground">{{ formatTimestamp(activity.timestamp) }}</span>
      </div>
      <p
        class="text-sm leading-normal wrap-break-word text-muted-foreground"
        :class="{ 'line-clamp-1': !expanded && isLong }"
      >
        {{ content }}
      </p>
      <button
        v-if="isLong"
        type="button"
        class="mt-0.5 text-sm font-medium text-primary hover:underline"
        @click="expanded = !expanded"
      >
        {{
          expanded
            ? t('common.conversations.thread.showLess')
            : t('common.conversations.thread.showMore')
        }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Mail, MessageCircle, MessageSquare, Download, Upload } from 'lucide-vue-next'

const props = defineProps({
  activity: {
    type: Object,
    required: true
  },
  variant: {
    type: String,
    default: 'default'
  }
})

const { t } = useI18n()

const expanded = ref(false)
const content = computed(() => props.activity.content || props.activity.message || '—')
const isLong = computed(() => content.value.length > 160)
const truncatedContent = computed(() =>
  content.value.length > 160 ? `${content.value.slice(0, 157)}…` : content.value
)

const isEmail = computed(() => ['email', 'customer-email'].includes(props.activity.type))
const isWhatsapp = computed(() => ['whatsapp', 'customer-whatsapp'].includes(props.activity.type))
const isSms = computed(() => ['sms', 'customer-sms'].includes(props.activity.type))
const isInbound = computed(() =>
  ['customer-email', 'customer-whatsapp', 'customer-sms'].includes(props.activity.type)
)

const icon = computed(() => (isInbound.value ? Download : Upload))

const channelIcon = computed(() => {
  if (isEmail.value) return Mail
  if (isSms.value) return MessageSquare
  return MessageCircle
})

const iconBgClass = computed(() => {
  if (isEmail.value) return 'bg-blue-100 dark:bg-blue-900/30'
  if (isWhatsapp.value) return 'bg-green-100 dark:bg-green-900/30'
  if (isSms.value) return 'bg-violet-100 dark:bg-violet-900/30'
  return 'bg-muted'
})

const iconColorClass = computed(() => {
  if (isEmail.value) return 'text-blue-600 dark:text-blue-400'
  if (isWhatsapp.value) return 'text-green-600 dark:text-green-400'
  if (isSms.value) return 'text-violet-600 dark:text-violet-400'
  return 'text-muted-foreground'
})

const bubbleBodyClass = computed(() => {
  if (isInbound.value) {
    return 'rounded-2xl rounded-bl-md border border-border bg-muted text-foreground'
  }
  return 'rounded-2xl rounded-br-md bg-primary text-primary-foreground'
})

const rootClass = computed(() => {
  if (props.variant === 'compact') {
    return 'gap-2 border-border bg-background p-3 shadow-sm'
  }
  return 'gap-3 border-border bg-card p-4 shadow-sm'
})

const channelLabelKey = computed(() => {
  if (isEmail.value) return 'common.conversations.channels.email'
  if (isWhatsapp.value) return 'common.conversations.channels.whatsapp'
  if (isSms.value) return 'common.conversations.channels.sms'
  return 'common.conversations.channels.unknown'
})

const channelBadgeClass = computed(() => {
  if (isEmail.value) return 'bg-blue-50 text-blue-700'
  if (isWhatsapp.value) return 'bg-badge-green text-emerald-700'
  if (isSms.value) return 'bg-violet-100 text-violet-800'
  return 'bg-muted text-muted-foreground'
})

function formatTimestamp(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'short',
    timeStyle: 'short'
  })
}

function formatBubbleTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit'
  })
}
</script>
