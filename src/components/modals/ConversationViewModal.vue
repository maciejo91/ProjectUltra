<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent class="w-full sm:max-w-2xl max-h-[calc(100vh-4rem)] flex flex-col" :show-close-button="true">
        <DialogHeader class="shrink-0">
          <DialogTitle>Conversation</DialogTitle>
          <DialogDescription v-if="interaction?.customer?.name" class="text-muted-foreground">
            {{ interaction.customer.name }} · {{ interaction?.channel }}
          </DialogDescription>
        </DialogHeader>

        <div class="flex-1 overflow-y-auto py-4 w-full space-y-3">
          <ConversationItem
            v-for="msg in messages"
            :key="msg.id"
            :activity="msg"
          />
          <div
            v-if="!messages || messages.length === 0"
            class="text-center py-8 text-muted-foreground text-sm"
          >
            No messages in this conversation
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup>
import { computed } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle
} from '@motork/component-library/future/primitives'
import ConversationItem from '@/components/requests/ConversationItem.vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  interaction: { type: Object, default: null }
})

const emit = defineEmits(['close'])

const messages = computed(() => props.interaction?.messages ?? [])

function handleOpenChange(open) {
  if (!open) emit('close')
}
</script>
