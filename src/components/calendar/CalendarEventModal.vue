<script setup>
import { computed } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@motork/component-library/future/primitives'
import CalendarEventForm from './CalendarEventForm.vue'

const props = defineProps({
  open: { type: Boolean, required: true },
  initialRange: { type: Object, default: null },
  event: { type: Object, default: null },
  eventTypes: { type: Array, default: () => [] },
  users: { type: Array, default: () => [] },
  defaultUserId: { type: [String, Number], default: '' },
})

const emit = defineEmits(['save', 'delete', 'close'])

const headerTitle = computed(() => (props.event ? 'Edit event' : 'New event'))

const handleSave = (payload) => {
  emit('save', payload)
}

const handleDelete = (id) => {
  emit('delete', id)
}

const handleOpenChange = (isOpen) => {
  if (!isOpen) emit('close')
}
</script>

<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent
        class="w-[90vw] max-w-none max-h-[calc(100vh-4rem)] flex flex-col"
        :show-close-button="true"
      >
        <DialogHeader class="shrink-0">
          <DialogTitle class="text-foreground">{{ headerTitle }}</DialogTitle>
        </DialogHeader>
        <div class="flex-1 overflow-y-auto py-4 w-full">
          <CalendarEventForm
            :event="event"
            :initial-range="initialRange"
            :event-types="eventTypes"
            :users="users"
            :default-user-id="defaultUserId"
            @save="handleSave"
            @delete="handleDelete"
            @cancel="emit('close')"
          />
        </div>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>
