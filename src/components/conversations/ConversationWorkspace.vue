<template>
  <div
    class="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden bg-background lg:flex-row lg:items-stretch"
  >
    <ConversationThreadPanel
      class="min-h-0 min-w-0 flex-1 lg:flex-[2]"
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
