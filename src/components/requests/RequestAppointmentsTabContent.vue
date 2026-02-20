<template>
  <div class="space-y-4">
    <div v-if="showAddButton" class="flex justify-end">
      <Button variant="outline" size="sm" @click="$emit('add-appointment')">
        Add
      </Button>
    </div>
    <template v-if="appointments.length > 0">
      <AppointmentCardWithNoShow
        v-for="app in appointments"
        :key="app.id"
        :appointment="app"
        :request="request"
        :is-future="isAppointmentFuture(app)"
        @appointment-no-show="$emit('appointment-no-show', $event)"
      />
    </template>
    <div v-else class="text-center py-10 text-muted-foreground text-sm">
      No upcoming appointments.
    </div>
  </div>
</template>

<script setup>
import { Button } from '@motork/component-library/future/primitives'
import AppointmentCardWithNoShow from './AppointmentCardWithNoShow.vue'

const props = defineProps({
  request: {
    type: Object,
    default: null
  },
  appointments: {
    type: Array,
    default: () => []
  },
  showAddButton: {
    type: Boolean,
    default: true
  }
})

defineEmits(['add-appointment', 'appointment-no-show', 'appointment-created'])

function isAppointmentFuture(app) {
  if (!app?.start) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const appDate = new Date(app.start)
  return appDate >= today
}
</script>
