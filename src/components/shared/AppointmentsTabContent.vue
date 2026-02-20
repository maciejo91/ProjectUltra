<template>
  <div class="space-y-4">
    <div v-if="showAddButton" class="flex justify-end">
      <Button
        variant="outline"
        size="sm"
        @click="$emit('add-appointment')"
      >
        Add
      </Button>
    </div>
    <template v-if="appointments.length > 0">
      <UpcomingAppointments
        v-for="app in appointments"
        :key="app.id"
        :title="app.title"
        :date="formatDate(app.start)"
        :location="app.location || app.dealership"
        :customer-name="app.customerName || app.customer"
        :vehicle="app.vehicle"
      />
    </template>
    <div v-else class="text-center py-10 text-muted-foreground text-sm">
      No upcoming appointments.
    </div>
  </div>
</template>

<script setup>
import { Button } from '@motork/component-library/future/primitives'
import UpcomingAppointments from '@/components/customer/profile/UpcomingAppointments.vue'

defineProps({
  appointments: {
    type: Array,
    default: () => []
  },
  showAddButton: {
    type: Boolean,
    default: true
  }
})

defineEmits(['add-appointment'])

function formatDate(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString()
}
</script>
