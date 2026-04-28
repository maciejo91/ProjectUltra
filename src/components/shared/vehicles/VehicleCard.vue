<template>
  <div
    @click="$emit('select')"
    :class="[
      'bg-white border rounded-lg shadow-nsc-card overflow-hidden transition-shadow relative cursor-pointer',
      selected ? 'border-primary border-2' : 'border-border'
    ]"
  >
    <!-- Status Badge -->
    <div
      class="absolute top-1 left-1 z-10 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wider"
      :class="badgeBgClass"
    >
      {{ badge }}
    </div>

    <!-- Vehicle Image -->
    <div class="w-full h-16 bg-muted flex items-center justify-center overflow-hidden">
      <img
        v-if="vehicle.image"
        :src="vehicle.image"
        :alt="`${vehicle.brand} ${vehicle.model}`"
        class="w-full h-full object-cover"
      />
      <Car v-else class="size-6 text-muted-foreground" />
    </div>

    <!-- Details -->
    <div class="flex flex-col p-2">
      <div v-if="conditionLabel" class="mb-1 flex flex-wrap items-center gap-1.5">
        <span
          class="inline-flex items-center justify-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold leading-none text-foreground uppercase tracking-wide"
          :class="conditionBadgeClass"
        >
          {{ conditionLabel }}
        </span>
      </div>
      <h4 class="font-bold text-foreground leading-tight line-clamp-2 text-sm">
        {{ vehicle.brand }} {{ vehicle.model }} ({{ vehicle.year }})
      </h4>
      <p class="font-bold text-foreground text-sm mt-0.5">€ {{ formatPrice(vehicle.price) }}</p>

      <!-- Stock pill -->
      <div
        v-if="stockDays !== null && stockDays !== undefined"
        class="flex items-center gap-0.5 px-1 py-0.5 bg-green-50 text-green-700 text-[8px] font-bold rounded border border-green-100 uppercase tracking-tighter w-fit mt-1"
      >
        <CheckCircle2 class="size-3" />
        <span>In stock {{ stockDays }}d</span>
      </div>
      <div
        v-else
        class="flex items-center gap-0.5 px-1 py-0.5 bg-amber-50 text-amber-700 text-[8px] font-bold rounded border border-amber-100 uppercase tracking-tighter w-fit mt-1"
      >
        <Clock class="size-3" />
        <span>Out</span>
      </div>

      <Button
        v-if="!hideSelectButton"
        variant="default"
        size="small"
        class="w-full mt-2"
        @click.stop="$emit('select')"
      >
        Select
      </Button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Car, CheckCircle2, Clock } from 'lucide-vue-next'
import { Button } from '@motork/component-library/future/primitives'
import { getVehicleConditionBadgeClass, getVehicleConditionLabel } from '@/utils/vehicleHelpers'

const props = defineProps({
  vehicle: { type: Object, required: true },
  badge: { type: String, required: true },
  stockDays: { type: Number, default: null },
  selected: { type: Boolean, default: false },
  hideSelectButton: { type: Boolean, default: false }
})

defineEmits(['select'])

const badgeBgClass = computed(() => {
  const m = {
    'Requested': 'bg-blue-600',
    'Recommended': 'bg-gray-600',
    'In Stock': 'bg-green-600',
    'Custom': 'bg-amber-600'
  }
  return m[props.badge] || 'bg-gray-600'
})

const conditionLabel = computed(() => getVehicleConditionLabel(props.vehicle))

const conditionBadgeClass = computed(() => getVehicleConditionBadgeClass(conditionLabel.value))

function formatPrice(price) {
  if (!price) return '0'
  return price.toLocaleString('en-US')
}
</script>
