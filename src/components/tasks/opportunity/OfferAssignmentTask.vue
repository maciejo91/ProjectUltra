<template>
  <div class="space-y-4">
    <div class="bg-white rounded-lg shadow-nsc-card overflow-hidden p-6">
      <h4 class="font-bold text-foreground text-sm mb-1">Create Offer</h4>
      <p class="text-sm text-muted-foreground">
        Customer showed up for the appointment. Create an offer to proceed with the opportunity.
      </p>
    </div>

    <div class="flex justify-end">
      <Button variant="default" @click="$emit('open-create-offer-modal')">
        Create Offer
      </Button>
    </div>
  </div>
</template>

<script setup>
import { Button } from '@motork/component-library/future/primitives'

defineProps({
  opportunity: { type: Object, required: true },
  scheduledAppointment: { type: Object, required: true }
})

defineEmits(['offer-created', 'open-create-offer-modal'])
</script>
