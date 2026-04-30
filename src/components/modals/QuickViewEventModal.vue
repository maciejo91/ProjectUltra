<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent class="w-[90vw] max-w-none max-h-[calc(100vh-4rem)] flex flex-col p-0">
        <!-- Custom header with event type styling -->
        <div
          class="flex-shrink-0 px-6 py-5 border-b border flex items-center justify-between bg-surface"
          :class="getEventTypeHeaderClass(event?.type)"
        >
          <div class="flex-1 min-w-0 pr-4">
            <div class="flex items-center gap-2 mb-1">
              <span class="badge-ui" :class="getEventTypeBadgeClass(event?.type)">
                {{ getEventTypeLabel(event?.type) }}
              </span>
              <span
                v-if="event?.status === 'cancelled'"
                class="badge-ui bg-red-100 text-red-700"
              >
                Cancelled
              </span>
              <span
                v-else-if="event?.status === 'no-show'"
                class="badge-ui bg-orange-100 text-orange-700"
              >
                No-show
              </span>
            </div>
            <h3 class="text-xl font-bold tracking-tight truncate" :class="getEventTypeTextClass(event?.type)">
              {{ event?.title }}
            </h3>
          </div>
        </div>

        <!-- Event Details -->
        <div class="flex-1 overflow-y-auto p-6 w-full">
          <CalendarEventDetails v-if="event" :event="event" />
        </div>

        <DialogFooter class="flex-shrink-0 px-6 py-4 bg-muted flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3 border-t border">
          <button
            v-if="event?.id"
            @click="$emit('delete', event.id)"
            class="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-2 mr-auto order-1"
          >
            <Trash2 class="w-3 h-3 shrink-0" />
            <span>Delete</span>
          </button>

          <Button
            label="Cancel"
            variant="outline"
            size="small"
            class="rounded-sm w-full sm:w-auto order-3 sm:order-2"
            @click="$emit('close')"
          />

          <Button
            label="Edit"
            variant="primary"
            size="small"
            class="rounded-sm w-full sm:w-auto order-2 sm:order-3 !bg-brand-red !hover:bg-brand-red-dark !text-white !border-brand-red"
            @click="$emit('edit')"
          >
            <template #icon-left>
              <PenLine class="w-4 h-4 shrink-0" />
            </template>
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup>
import { Trash2, PenLine } from 'lucide-vue-next'
import { Button } from '@motork/component-library/future/primitives'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogOverlay,
  DialogPortal
} from '@motork/component-library/future/primitives'
import CalendarEventDetails from '@/components/calendar/CalendarEventDetails.vue'
import { getEventTypeLabel, getEventTypeHeaderClass, getEventTypeBadgeClass, getEventTypeTextClass } from '@/utils/calendarHelpers'

defineProps({
  show: {
    type: Boolean,
    required: true
  },
  event: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'edit', 'delete'])

const handleOpenChange = (isOpen) => {
  if (!isOpen) {
    emit('close')
  }
}
</script>

