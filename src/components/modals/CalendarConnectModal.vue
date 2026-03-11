<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent class="w-full sm:max-w-md max-h-[calc(100vh-4rem)] flex flex-col">
        <DialogHeader class="flex-shrink-0">
          <DialogTitle>Connect Calendar</DialogTitle>
        </DialogHeader>

        <div class="flex-1 overflow-y-auto px-2 py-2 w-full">
          <!-- Connecting State -->
          <div v-if="connectingTo" class="text-center py-8 w-full">
      <div
        class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center animate-pulse"
        :class="connectingTo === 'google' ? 'bg-red-100' : 'bg-blue-100'"
      >
        <Calendar v-if="connectingTo === 'google'" class="w-8 h-8 shrink-0 text-red-500" />
        <Calendar v-else class="w-8 h-8 shrink-0 text-blue-500" />
      </div>
      <p class="text-meta mb-2">
        Connecting to {{ connectingTo === 'google' ? 'Google Calendar' : 'Microsoft Outlook' }}...
      </p>
      <p class="text-xs text-gray-400">Please complete authentication in the popup window</p>
    </div>

    <!-- Calendar Options -->
        <div v-else class="space-y-3">
      <!-- Connected Calendars -->
      <div v-if="connectedCalendars.length > 0" class="mb-4">
        <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Connected</p>
        <div class="space-y-2">
          <div
            v-for="cal in connectedCalendars"
            :key="cal.id"
            class="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-lg"
          >
            <div class="flex items-center gap-3">
              <div 
                class="w-10 h-10 rounded-full flex items-center justify-center bg-surface"
              >
                <Calendar v-if="cal.type === 'google'" class="w-5 h-5 shrink-0 text-red-500" />
                <Calendar v-else class="w-5 h-5 shrink-0 text-blue-500" />
              </div>
              <div>
                <p class="text-sm font-medium text-foreground">{{ cal.email }}</p>
                <p class="text-xs text-green-600">
                  <CheckCircle class="w-4 h-4 shrink-0 mr-1 inline" />Connected
                </p>
              </div>
            </div>
            <button
              @click="$emit('disconnect', cal.id)"
              class="text-xs text-red-600 hover:text-red-700 font-medium"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>

      <!-- Google Calendar -->
      <button
        @click="$emit('connect', 'google')"
        class="w-full flex items-center gap-3 p-3 bg-surface border border-border rounded-xl hover:border-gray-300 hover:shadow-sm transition-all group"
      >
        <div class="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors shrink-0">
          <Calendar class="w-5 h-5 shrink-0 text-red-500" />
        </div>
        <div class="flex-1 text-left">
          <p class="font-semibold text-foreground">Google Calendar</p>
          <p class="text-xs text-gray-500">Connect your Google account</p>
        </div>
        <ChevronRight class="w-4 h-4 shrink-0 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
      </button>

      <!-- Microsoft Outlook -->
      <button
        @click="$emit('connect', 'microsoft')"
        class="w-full flex items-center gap-3 p-3 bg-surface border border-border rounded-xl hover:border-gray-300 hover:shadow-sm transition-all group"
      >
        <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors shrink-0">
          <Calendar class="w-5 h-5 shrink-0 text-blue-500" />
        </div>
        <div class="flex-1 text-left">
          <p class="font-semibold text-foreground">Microsoft Outlook</p>
          <p class="text-xs text-gray-500">Connect your Microsoft account</p>
        </div>
        <ChevronRight class="w-4 h-4 shrink-0 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
      </button>
          </div>
        </div>

        <DialogFooter class="flex-shrink-0 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3">
          <Button
            label="Close"
            variant="outline"
            size="small"
            class="rounded-sm w-full sm:w-auto"
            @click="$emit('close')"
          />
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup>
import { Calendar, CheckCircle, ChevronRight } from 'lucide-vue-next'
import { Button } from '@motork/component-library/future/primitives'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle
} from '@motork/component-library/future/primitives'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  connectedCalendars: {
    type: Array,
    required: true
  },
  connectingTo: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['close', 'connect', 'disconnect'])

const handleOpenChange = (isOpen) => {
  if (!isOpen) {
    emit('close')
  }
}
</script>



