<template>
  <div class="flex items-start gap-3 p-4 rounded-lg border bg-card text-card-foreground shadow-sm" :class="containerClass">
    <div class="shrink-0">
      <div class="w-8 h-8 rounded-full flex items-center justify-center" :class="iconBgClass">
        <component :is="icon" class="w-4 h-4" :class="iconColorClass" />
      </div>
    </div>
    <div class="flex-1 min-w-0 space-y-1">
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <span class="font-medium text-sm text-foreground">{{ activity.user }}</span>
          <span
            class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium uppercase leading-none"
            :class="channelBadgeClass"
          >
            <component :is="channelIcon" class="w-3 h-3 shrink-0" />
            {{ channelLabel }}
          </span>
        </div>
        <span class="text-xs text-muted-foreground">{{ formatTimestamp(activity.timestamp) }}</span>
      </div>
      <p
        class="text-sm text-muted-foreground break-words leading-normal"
        :class="{ 'line-clamp-1': !expanded && isLong }"
      >
        {{ content }}
      </p>
      <button
        v-if="isLong"
        type="button"
        class="text-xs font-medium text-primary hover:underline mt-0.5"
        @click="expanded = !expanded"
      >
        {{ expanded ? 'Show less' : 'Show more' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Mail, MessageCircle, Download, Upload } from 'lucide-vue-next'

const props = defineProps({
  activity: {
    type: Object,
    required: true
  }
})

const expanded = ref(false)
const content = computed(() => props.activity.content || props.activity.message || '—')
const isLong = computed(() => content.value.length > 80)

const isEmail = computed(() => ['email', 'customer-email'].includes(props.activity.type))
const isWhatsapp = computed(() => ['whatsapp', 'customer-whatsapp'].includes(props.activity.type))
const isInbound = computed(() => ['customer-email', 'customer-whatsapp'].includes(props.activity.type))

// Icon logic: Download for inbound (message coming in), Upload for outbound (message going out)
const icon = computed(() => (isInbound.value ? Download : Upload))

// Channel icon for badge (Email or WhatsApp)
const channelIcon = computed(() => (isEmail.value ? Mail : MessageCircle))

// Icon area: green for WhatsApp, blue for Email (channel-based)
const iconBgClass = computed(() => {
  if (isEmail.value) return 'bg-blue-100 dark:bg-blue-900/30'
  if (isWhatsapp.value) return 'bg-green-100 dark:bg-green-900/30'
  return 'bg-muted'
})

const iconColorClass = computed(() => {
  if (isEmail.value) return 'text-blue-600 dark:text-blue-400'
  if (isWhatsapp.value) return 'text-green-600 dark:text-green-400'
  return 'text-muted-foreground'
})

const containerClass = computed(() => {
  return 'border-border'
})

// Badge logic: show channel name (Email/WhatsApp) instead of direction
const channelLabel = computed(() => isEmail.value ? 'Email' : isWhatsapp.value ? 'WhatsApp' : 'Unknown')

// Badge styling: match TaskBadges (px-1.5 py-0.5 rounded text-xs font-medium uppercase leading-none)
const channelBadgeClass = computed(() => {
  if (isEmail.value) return 'bg-blue-50 text-blue-700'
  if (isWhatsapp.value) return 'bg-badge-green text-emerald-700'
  return 'bg-muted text-muted-foreground'
})

function formatTimestamp(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'short',
    timeStyle: 'short'
  })
}
</script>
