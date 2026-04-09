<template>
  <div
    class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-black/5 bg-background shadow-mk-dashboard-card"
  >
    <div
      v-if="threadMeta"
      class="shrink-0 border-b border-border px-4 py-3 md:px-6"
    >
      <div class="flex min-w-0 flex-col gap-1">
        <h2 class="truncate text-base font-semibold text-foreground">
          {{ threadMeta.customerName }}
        </h2>
        <div class="flex flex-wrap items-center gap-2">
          <span
            class="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium uppercase leading-none"
            :class="channelBadgeClass(threadMeta.channel)"
          >
            <component :is="channelIcon(threadMeta.channel)" class="size-3 shrink-0" />
            {{ t(channelLabelKey(threadMeta.channel)) }}
          </span>
          <span class="text-xs text-muted-foreground">{{
            t('common.conversations.thread.channelReplyHint')
          }}</span>
        </div>
      </div>
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 md:px-6">
      <div v-if="loading" class="py-8 text-center text-sm text-muted-foreground">
        {{ t('common.common.loading') }}
      </div>
      <div v-else-if="!messages.length" class="py-8 text-center text-sm text-muted-foreground">
        {{ t('common.conversations.thread.empty') }}
      </div>
      <div v-else class="space-y-3">
        <template v-for="item in messagesWithSeparators" :key="item.key">
          <div
            v-if="item.kind === 'date'"
            class="flex items-center gap-3 py-2"
            role="separator"
          >
            <div class="h-px flex-1 bg-border" />
            <span class="shrink-0 text-xs font-medium uppercase text-muted-foreground">{{
              item.label
            }}</span>
            <div class="h-px flex-1 bg-border" />
          </div>
          <ConversationItem v-else :activity="item.activity" variant="bubble" />
        </template>
      </div>
    </div>

    <div class="shrink-0 border-t border-border bg-background px-4 py-3 md:px-6">
      <div class="flex flex-col gap-3 rounded-lg border border-border bg-background p-3 shadow-sm">
        <Textarea
          v-model="draft"
          rows="3"
          :placeholder="t('common.conversations.thread.composerPlaceholder')"
          class="min-h-0 resize-none border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
          @keydown.enter.exact.prevent="submit"
        />
        <div class="flex justify-end">
          <Button
            type="button"
            variant="default"
            size="sm"
            class="rounded-sm"
            :disabled="!draft.trim() || sending"
            @click="submit"
          >
            <Send class="mr-2 size-4 shrink-0" />
            {{ t('common.conversations.thread.send') }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Mail, MessageCircle, MessageSquare, Send } from 'lucide-vue-next'
import { Button, Textarea } from '@motork/component-library/future/primitives'
import ConversationItem from '@/components/requests/ConversationItem.vue'

const props = defineProps({
  threadMeta: { type: Object, default: null },
  messages: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  sending: { type: Boolean, default: false }
})

const emit = defineEmits(['send'])

const { t, locale } = useI18n()
const draft = ref('')

watch(
  () => props.threadMeta?.threadId,
  () => {
    draft.value = ''
  }
)

const messagesWithSeparators = computed(() => {
  const out = []
  let lastDay = null
  props.messages.forEach((activity, index) => {
    const d = activity.timestamp ? new Date(activity.timestamp) : null
    const dayKey = d
      ? `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      : `na-${index}`
    if (dayKey !== lastDay && d) {
      lastDay = dayKey
      out.push({
        kind: 'date',
        key: `sep-${dayKey}-${index}`,
        label: formatDayLabel(d)
      })
    }
    out.push({
      kind: 'msg',
      key: `msg-${activity.id}`,
      activity
    })
  })
  return out
})

function formatDayLabel(d) {
  const now = new Date()
  const today =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  if (today) return t('common.conversations.thread.today')
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
  if (isYesterday) return t('common.conversations.thread.yesterday')
  return d.toLocaleDateString(locale.value || undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
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

function submit() {
  const text = draft.value.trim()
  if (!text || props.sending) return
  emit('send', text)
  draft.value = ''
}
</script>
