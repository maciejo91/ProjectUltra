<template>
  <div
    class="flex h-full min-h-0 w-full min-w-0 flex-col gap-3 overflow-hidden bg-muted p-3 lg:flex-row lg:items-stretch"
  >
    <ConversationThreadPanel
      class="min-h-0 min-w-0 flex-1 lg:min-h-0"
      :thread-meta="threadMeta"
      :messages="messages"
      :loading="loadingMessages"
      :sending="sending"
      @send="$emit('send', $event)"
    />
    <ConversationSummaryPanel :thread-id="threadId" />
  </div>
</template>

<script setup>
import ConversationThreadPanel from './ConversationThreadPanel.vue'
import ConversationSummaryPanel from './ConversationSummaryPanel.vue'

defineProps({
  threadId: { type: String, default: null },
  threadMeta: { type: Object, default: null },
  messages: { type: Array, default: () => [] },
  loadingMessages: { type: Boolean, default: false },
  sending: { type: Boolean, default: false }
})

defineEmits(['send'])
</script>
