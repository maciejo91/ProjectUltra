<template>
  <div class="rounded-lg border border-border bg-card overflow-hidden shadow-mk-dashboard-card h-full flex flex-col">
    <div class="flex flex-col md:flex-row flex-1 min-h-0">
      <!-- Vehicle Image -->
      <div
        class="md:w-1/4 aspect-4/3 relative shrink-0 overflow-hidden"
        :class="usesLogoImage ? 'flex items-center justify-center border border-black/5 bg-white' : 'bg-muted'"
      >
        <img
          v-if="effectiveImageUrl"
          :src="effectiveImageUrl"
          :alt="vehicleDisplayName"
          :class="usesLogoImage ? 'size-24 bg-white object-contain' : 'w-full h-full object-cover'"
          @error="handleImageError"
        />
        <div
          v-else
          class="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground"
        >
          <Car class="size-8 md:size-10" />
          <span v-if="!hasVehicle" class="text-sm font-medium">General Request</span>
          <span v-else class="text-sm">No image</span>
        </div>
      </div>

      <!-- Vehicle Details -->
      <div class="flex-1 p-4 flex flex-col gap-3 min-w-0 min-h-0">
        <div class="flex items-start justify-between gap-4">
          <div class="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <span
              v-if="hasVehicle && vehicleConditionLabel"
              class="inline-flex shrink-0 items-center justify-center rounded-md px-2 py-0.5 text-sm font-medium leading-5 text-foreground"
              :class="vehicleConditionBadgeClass"
            >
              {{ vehicleConditionLabel }}
            </span>
            <h2 class="min-w-0 text-base font-semibold text-foreground leading-tight">
              {{ vehicleDisplayName }}
            </h2>
          </div>
          <p v-if="displayPrice" class="text-base font-semibold text-foreground shrink-0 pt-1 pr-2">
            €{{ formatPrice(displayPrice) }}
          </p>
        </div>
        <div v-if="vehicleSpecs.length" class="flex flex-wrap gap-2">
          <span
            v-for="(spec, idx) in vehicleSpecs"
            :key="idx"
            class="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-sm font-medium text-muted-foreground"
          >
            {{ spec }}
          </span>
        </div>

        <div
          v-if="requestMessage"
          class="pt-3 border-t border-border"
        >
          <p class="text-sm text-muted-foreground italic line-clamp-2">
            "{{ requestMessage }}"
          </p>
        </div>

        <p v-if="source" class="text-sm text-muted-foreground">
          Source: {{ source }}
        </p>
        <div v-if="showAddActions" class="mt-auto pt-3 border-t border-border flex flex-wrap gap-2 justify-end">
          <Button
            variant="ghost"
            size="sm"
            class="inline-flex items-center rounded-md bg-muted px-2 py-0.5 h-auto text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 border-0 gap-1"
            @click="$emit('add-tradein')"
          >
            <Plus class="size-3 shrink-0" />
            Add trade-in
          </Button>
          <Button
            variant="ghost"
            size="sm"
            class="inline-flex items-center rounded-md bg-muted px-2 py-0.5 h-auto text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 border-0 gap-1"
            @click="$emit('add-financing')"
          >
            <Plus class="size-3 shrink-0" />
            Add financing
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Car, Plus } from 'lucide-vue-next'
import { Button } from '@motork/component-library/future/primitives'
import { DEFAULT_CAR_IMAGE } from '@/utils/mockDataHelpers'
import audiA6Allroad40TdiImage from '@/assets/images/mock-vehicles/audi-a6-allroad-40-tdi.png'
import { getVehicleConditionBadgeClass, getVehicleConditionLabel } from '@/utils/vehicleHelpers'

const props = defineProps({
  request: {
    type: Object,
    default: null
  }
})

defineEmits(['add-tradein', 'add-financing'])

const showAddActions = computed(() => !!props.request?.id)

const imageError = ref(false)
const fallbackFailed = ref(false)

watch(() => props.request, () => {
  imageError.value = false
  fallbackFailed.value = false
}, { immediate: true })

const vehicle = computed(() => {
  if (!props.request) return {}
  return props.request.requestedCar || props.request.vehicle || {}
})

const vehicleConditionLabel = computed(() => getVehicleConditionLabel(vehicle.value))

const vehicleConditionBadgeClass = computed(() =>
  getVehicleConditionBadgeClass(vehicleConditionLabel.value)
)

const isNewVehicle = computed(() => String(vehicleConditionLabel.value || '').toLowerCase() === 'new')

const usesAudiDisplayVehicle = computed(() => !isNewVehicle.value)

const vehicleDisplayName = computed(() => {
  const v = vehicle.value
  if (isNewVehicle.value && String(v.brand || '').toLowerCase() !== 'bmw') return 'BMW iX xDrive50'
  if (usesAudiDisplayVehicle.value) return 'Audi A6 Allroad'
  if (!v.brand && !v.model) return 'General Request'
  const parts = [v.brand, v.model, v.variant].filter(Boolean)
  return parts.join(' ') || 'Vehicle Details'
})

const requestMessage = computed(() => {
  return props.request?.requestMessage || vehicle.value?.requestMessage || ''
})

const source = computed(() => props.request?.source || '')

const hasVehicle = computed(() => {
  const v = vehicle.value
  return !!(v?.brand || v?.model)
})

const usesLogoImage = computed(() => {
  const v = vehicle.value
  return isNewVehicle.value || (!usesAudiDisplayVehicle.value && (v?.imageDisplayMode === 'logo' || v?.imageType === 'logo'))
})

const imageUrl = computed(() => {
  const v = vehicle.value
  if (isNewVehicle.value) return '/brands/bmw-white.svg'
  if (usesAudiDisplayVehicle.value) return audiA6Allroad40TdiImage
  const url = v?.image || v?.imageUrl || ''
  return url || (hasVehicle.value ? DEFAULT_CAR_IMAGE : '')
})

const displayPrice = computed(() => usesAudiDisplayVehicle.value ? 19000 : vehicle.value.price)

const effectiveImageUrl = computed(() => {
  if (fallbackFailed.value || (!hasVehicle.value && imageError.value)) return ''
  if (imageError.value && hasVehicle.value) return DEFAULT_CAR_IMAGE
  return imageUrl.value
})

const vehicleSpecs = computed(() => {
  if (usesAudiDisplayVehicle.value) {
    return ['2023', 'Petrol', 'Automatic', '10,237 km']
  }
  const v = vehicle.value
  const specs = []
  if (v.year) specs.push(v.year)
  if (v.fuelType) specs.push(v.fuelType)
  if (v.gearType) specs.push(v.gearType)
  if (v.kilometers ?? v.mileage) {
    specs.push(`${formatMileage(v.kilometers ?? v.mileage)} km`)
  }
  return specs
})

function handleImageError() {
  if (imageError.value && hasVehicle.value) {
    fallbackFailed.value = true
  } else {
    imageError.value = true
  }
}

function formatPrice(price) {
  if (price == null) return '0'
  const num = typeof price === 'string' ? parseFloat(price) : price
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num)
}

function formatMileage(val) {
  if (val == null) return ''
  const num = typeof val === 'string' ? parseFloat(val) : val
  return new Intl.NumberFormat('en-US').format(num)
}
</script>
