<template>
  <div class="space-y-6">
    <div v-if="activities.length > 0" class="space-y-3 pb-6">
      <ConversationItem
        v-for="activity in activities"
        :key="activity.id"
        :activity="activity"
      />
    </div>

    <div
      v-else
      class="text-center py-16 bg-background rounded-xl border border-dashed border-border mx-2"
    >
      <div class="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <MessageCircle class="w-6 h-6 text-muted-foreground" />
      </div>
      <h4 class="text-foreground font-medium mb-1">No conversations yet</h4>
      <p class="text-muted-foreground text-sm">
        No email or WhatsApp conversations on this request.
      </p>
    </div>
  </div>
</template>

<script setup>
import { MessageCircle } from 'lucide-vue-next'
import ConversationItem from './ConversationItem.vue'

defineProps({
  activities: {
    type: Array,
    default: () => []
  }
})
</script>
