<template>
  <div
    ref="scrollContainer"
    class="flex h-full min-h-0 w-full min-w-0 shrink-0 flex-col overflow-hidden bg-muted lg:max-h-full"
  >
    <div class="shrink-0 px-2 py-3">
      <div class="flex min-w-0 flex-1">
        <InputGroup class="rounded-lg overflow-hidden bg-background">
          <InputGroupInput
            v-model="searchQuery"
            :placeholder="t('common.conversations.list.searchPlaceholder')"
            class="rounded-none border-0 bg-background focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <InputGroupAddon>
            <Search class="size-4 shrink-0 text-muted-foreground" />
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>

    <div class="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-2 pt-1 pb-6">
      <button
        v-for="thread in filteredThreads"
        :key="thread.threadId"
        type="button"
        :data-thread-id="thread.threadId"
        class="scroll-mt-2 scroll-mb-2 w-full rounded-xl border border-black/5 bg-background p-4 text-left shadow-sm transition-all"
        :class="
          thread.threadId === selectedThreadId
            ? 'ring-2 ring-primary/40'
            : 'hover:bg-muted/50'
        "
        @click="$emit('select', thread.threadId)"
      >
        <div class="flex items-start gap-3">
          <div
            class="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-sm font-semibold text-foreground"
          >
            {{ initialsFor(thread.customerName) }}
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-2">
              <span class="truncate text-sm font-medium text-foreground">{{
                thread.customerName
              }}</span>
              <span class="shrink-0 text-xs text-muted-foreground">{{
                formatListTime(thread.lastMessageAt)
              }}</span>
            </div>
            <div class="mt-1 flex flex-wrap items-center gap-1.5">
              <span
                class="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium uppercase leading-none"
                :class="channelBadgeClass(thread.channel)"
              >
                <component :is="channelIcon(thread.channel)" class="size-3 shrink-0" />
                {{ t(channelLabelKey(thread.channel)) }}
              </span>
              <span class="text-xs text-muted-foreground">{{
                t('common.conversations.list.messageTypeLabel')
              }}</span>
            </div>
            <p class="mt-1 line-clamp-1 text-xs text-muted-foreground">
              {{ thread.preview || '—' }}
            </p>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { Search, Mail, MessageCircle, MessageSquare } from 'lucide-vue-next'
import { InputGroup, InputGroupInput, InputGroupAddon } from '@motork/component-library/future/primitives'

const props = defineProps({
  threads: { type: Array, default: () => [] },
  selectedThreadId: { type: String, default: null }
})

defineEmits(['select'])

const { t, locale } = useI18n()
const scrollContainer = ref(null)
const searchQuery = ref('')

const filteredThreads = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return props.threads
  return props.threads.filter((thread) => {
    const hay = [
      thread.customerName,
      thread.preview,
      thread.channel,
      t(channelLabelKey(thread.channel))
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return hay.includes(q)
  })
})

watch(
  () => props.selectedThreadId,
  async (id) => {
    if (!id || !scrollContainer.value) return
    await nextTick()
    const el = scrollContainer.value.querySelector(`[data-thread-id="${CSS.escape(String(id))}"]`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  },
  { immediate: true }
)

function initialsFor(name) {
  if (!name || typeof name !== 'string') return '?'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return parts[0]?.[0]?.toUpperCase() || '?'
}

function channelLabelKey(channel) {
  if (channel === 'email') return 'common.conversations.channels.email'
  if (channel === 'whatsapp') return 'common.conversations.channels.whatsapp'
  if (channel === 'sms') return 'common.conversations.channels.sms'
  return 'common.conversations.channels.email'
}

function channelIcon(channel) {
  if (channel === 'email') return Mail
  if (channel === 'sms') return MessageSquare
  return MessageCircle
}

function channelBadgeClass(channel) {
  if (channel === 'email') return 'bg-blue-50 text-blue-700'
  if (channel === 'whatsapp') return 'bg-badge-green text-emerald-700'
  if (channel === 'sms') return 'bg-violet-100 text-violet-800'
  return 'bg-muted text-muted-foreground'
}

function formatListTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  if (sameDay) {
    return d.toLocaleTimeString(locale.value || undefined, {
      hour: 'numeric',
      minute: '2-digit'
    })
  }
  return d.toLocaleDateString(locale.value || undefined, {
    month: 'short',
    day: 'numeric'
  })
}
</script>
