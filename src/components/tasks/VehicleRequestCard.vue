<template>
  <div class="overflow-hidden p-4 rounded-lg bg-white shadow-nsc-card">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-base font-medium text-foreground leading-6">Requested Car</h3>
      <div v-if="source" class="flex items-center gap-2">
        <p class="text-sm text-muted-foreground">
          {{ source }}
        </p>
        <Button
          variant="ghost"
          size="icon"
          class="shrink-0"
          @click="$emit('open-ad')"
        >
          <ExternalLink :size="14" />
        </Button>
      </div>
    </div>

    <div class="flex gap-4">
      <div
        class="w-24 shrink-0 aspect-3/2 rounded-lg overflow-hidden bg-surfaceTertiary"
      >
        <img
          v-if="imageUrl && !imageError"
          :src="imageUrl"
          :alt="`${vehicle.brand} ${vehicle.model}`"
          class="w-full h-full object-cover"
          @error="handleImageError"
        />
        <div
          v-else
          class="w-full h-full flex items-center justify-center"
        >
          <Car :size="32" class="text-muted-foreground" />
        </div>
      </div>

      <div class="min-w-0 flex-1 flex flex-col justify-center">
        <div class="flex flex-wrap items-center gap-2">
          <p class="text-sm font-semibold text-foreground truncate">
            {{ vehicleNameWithYear }}
          </p>
          <span
            v-if="vehicleCondition"
            class="shrink-0 inline-flex px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground"
          >
            {{ vehicleCondition }}
          </span>
        </div>
        <div
          v-if="vehicle.price"
          class="flex items-center gap-2 mt-1 text-sm text-foreground flex-wrap"
        >
          <span v-if="vehicle.price" class="font-semibold">
            €{{ formatPrice(vehicle.price) }}
          </span>
        </div>
        <div
          v-if="displayMileage || vehicle.fuelType || vehicle.gearType"
          class="flex gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap"
        >
          <span v-if="displayMileage">{{ formatMileage(displayMileage) }} km</span>
          <span v-if="vehicle.fuelType">{{ vehicle.fuelType }}</span>
          <span v-if="vehicle.gearType">{{ vehicle.gearType }}</span>
        </div>
      </div>
    </div>

    <!-- Request Message -->
    <div v-if="requestMessage" class="mt-4 pt-4 border-t border-border">
      <p class="text-sm text-foreground leading-5">
        "{{ requestMessage }}"
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Button } from '@motork/component-library/future/primitives'
import { Car, ExternalLink } from 'lucide-vue-next'

const props = defineProps({
  vehicle: {
    type: Object,
    required: true
  },
  requestMessage: {
    type: String,
    default: ''
  },
  source: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['open-ad', 'more-actions', 'edit-vehicle', 'remove-vehicle'])

const imageError = ref(false)

const vehicleName = computed(() => {
  const parts = []
  if (props.vehicle.brand) parts.push(props.vehicle.brand)
  if (props.vehicle.model) parts.push(props.vehicle.model)
  if (props.vehicle.variant) parts.push(props.vehicle.variant)
  return parts.join(' ') || 'Vehicle Details'
})

const vehicleNameWithYear = computed(() => {
  const name = vehicleName.value
  return props.vehicle.year ? `${name} (${props.vehicle.year})` : name
})

// Condition (New/Km0/Used) - aligned with tasks table
const vehicleCondition = computed(() => {
  const v = props.vehicle
  if (!v) return null
  const status = v.status || ''
  const km = v.kilometers ?? v.mileage
  if (km === 0 || (typeof km === 'number' && km < 1) || status === 'New') {
    return (status && status.toLowerCase() === 'new') || km === 0 ? 'Km0' : 'New'
  }
  return status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : 'Used'
})

// Mileage - support both kilometers (mock) and mileage
const displayMileage = computed(() => {
  const v = props.vehicle
  return v?.kilometers ?? v?.mileage
})

const formatPrice = (price) => {
  if (!price) return '0'
  
  // Convert to number if string
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  
  // Format with thousands separator
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numPrice)
}

const formatMileage = (mileage) => {
  if (!mileage) return '0'
  
  // Convert to number if string
  const numMileage = typeof mileage === 'string' ? parseFloat(mileage) : mileage
  
  // Format with thousands separator
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numMileage)
}

const handleImageError = () => {
  imageError.value = true
}
</script>

