<template>
  <div class="space-y-4">
    <div v-if="showBack && !hideBack" class="flex justify-start">
      <Button variant="ghost" size="sm" class="gap-2 text-muted-foreground" @click="$emit('back')">
        <ChevronLeft class="size-4" />
        Back
      </Button>
    </div>

    <template v-if="showStockSection">
      <div class="space-y-4">
        <div class="relative">
          <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            v-model="searchQuery"
            type="text"
            placeholder="Search to find more..."
            class="w-full pl-9 bg-background border-border"
          />
        </div>

        <div v-if="allRecommendedVehicles.length && !searchQuery.trim()" class="space-y-3">
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <VehicleCard
              v-for="vehicle in allRecommendedVehicles"
              :key="vehicle.id"
              :vehicle="vehicle"
              :badge="vehicle.isRequested ? 'Requested' : 'Recommended'"
              :stock-days="vehicle.stockDays"
              :selected="selectedVehicleId === vehicle.id"
              @select="handleSelectVehicle(vehicle, vehicle.isRequested ? 'requested' : 'recommended')"
            />
          </div>
        </div>

        <template v-if="searchQuery.trim()">
          <div v-if="searchResults.length" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <VehicleCard
              v-for="vehicle in searchResults"
              :key="vehicle.id"
              :vehicle="vehicle"
              badge="In Stock"
              :stock-days="vehicle.stockDays"
              :selected="selectedVehicleId === vehicle.id"
              @select="handleSelectVehicle(vehicle, 'stock')"
            />
          </div>
          <div v-else class="rounded-lg border border-border bg-muted py-8 text-center">
            <Search class="mx-auto mb-2 size-8 text-muted-foreground" />
            <p class="text-sm font-medium text-foreground">No vehicles found</p>
            <p class="text-sm text-muted-foreground mt-0.5">Try different keywords</p>
          </div>
        </template>
      </div>
    </template>

    <div v-if="showConfigureSection" class="space-y-4">
      <div class="rounded-lg border border-border bg-muted p-4 space-y-4">
        <p class="text-sm text-muted-foreground">
          Build a custom configuration with specific options and features.
        </p>
        <div v-if="!showConfigureForm" class="flex justify-start">
          <Button variant="default" size="sm" class="gap-2" @click="showConfigureForm = true">
            <Settings class="size-4" />
            Build Custom Configuration
          </Button>
        </div>
        <div v-else class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="space-y-2">
              <Label class="text-sm font-medium text-foreground">Brand</Label>
              <Input
                v-model="customVehicle.brand"
                type="text"
                placeholder="e.g., Audi"
                class="w-full bg-background border-border"
              />
            </div>
            <div class="space-y-2">
              <Label class="text-sm font-medium text-foreground">Model</Label>
              <Input
                v-model="customVehicle.model"
                type="text"
                placeholder="e.g., e-tron GT"
                class="w-full bg-background border-border"
              />
            </div>
            <div class="space-y-2">
              <Label class="text-sm font-medium text-foreground">Year</Label>
              <Input
                v-model="customVehicle.year"
                type="number"
                placeholder="2024"
                class="w-full bg-background border-border"
              />
            </div>
            <div class="space-y-2">
              <Label class="text-sm font-medium text-foreground">Price (€)</Label>
              <Input
                v-model="customVehicle.price"
                type="number"
                placeholder="98000"
                class="w-full bg-background border-border"
              />
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <Button v-if="showBack && !hideBack" variant="ghost" size="sm" @click="$emit('back')">
              Back
            </Button>
            <Button variant="secondary" size="sm" @click="showConfigureForm = false">
              Hide
            </Button>
            <Button
              variant="default"
              size="sm"
              class="gap-2"
              :disabled="!isCustomVehicleValid"
              @click="handleSelectCustom"
            >
              <Check class="size-4" />
              Use Custom Configuration
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ChevronLeft, Search, Settings } from 'lucide-vue-next'
import { Button, Input, Label } from '@motork/component-library/future/primitives'
import VehicleCard from '@/components/shared/vehicles/VehicleCard.vue'
import { fetchVehicles } from '@/api/vehicles'

const props = defineProps({
  requestedVehicle: { type: Object, default: null },
  opportunityId: { type: [Number, String], default: null },
  /** 'stock' | 'configure' | 'full' */
  mode: { type: String, default: 'full' },
  showBack: { type: Boolean, default: false },
  /** When true, Back is handled by parent (e.g. footer); hide inline Back buttons. */
  hideBack: { type: Boolean, default: false }
})

const emit = defineEmits(['vehicle-selected', 'back', 'selection-change'])

const showStockSection = computed(() =>
  props.mode === 'full' || props.mode === 'stock'
)
const showConfigureSection = computed(() =>
  props.mode === 'full' || props.mode === 'configure'
)

const searchQuery = ref('')
const showConfigureForm = ref(props.mode === 'configure')
const selectedVehicle = ref(null)
const selectedVehicleId = ref(null)
const selectedVehicleType = ref(null)
const vehicles = ref([])

const customVehicle = ref({
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  price: 0,
  stockDays: null,
  image: ''
})

onMounted(async () => {
  try {
    const result = await fetchVehicles({})
    vehicles.value = result.data || []
  } catch (err) {
    vehicles.value = []
  }
})

watch(() => props.mode, (m) => {
  if (m === 'configure') showConfigureForm.value = true
})

watch(selectedVehicle, (v) => {
  emit('selection-change', { hasSelection: !!v })
}, { immediate: true })

defineExpose({ confirmSelection })

const hasRequestedInStock = computed(() => {
  const rv = props.requestedVehicle
  return rv && rv.stockDays != null
})

const allRecommendedVehicles = computed(() => {
  const rv = props.requestedVehicle
  const recommended = []
  if (rv && hasRequestedInStock.value) {
    recommended.push({ ...rv, isRequested: true })
  }
  if (vehicles.value?.length) {
    const alternatives = vehicles.value.filter((v) => {
      if (!rv) return true
      return v.brand !== rv.brand || v.model !== rv.model
    })
    const limit = (rv && hasRequestedInStock.value) ? 3 : 4
    recommended.push(...alternatives.slice(0, limit))
  }
  return recommended
})

const filteredStock = computed(() => {
  if (!vehicles.value?.length) return []
  let filtered = [...vehicles.value]
  const q = searchQuery.value?.trim()
  if (q) {
    const lower = q.toLowerCase()
    filtered = filtered.filter(
      (v) =>
        v.brand?.toLowerCase().includes(lower) ||
        v.model?.toLowerCase().includes(lower) ||
        String(v.year ?? '').includes(q) ||
        v.vin?.toLowerCase().includes(lower)
    )
  }
  return filtered
})

const recommendedIds = computed(() =>
  new Set(allRecommendedVehicles.value.map((v) => v.id).filter(Boolean))
)

const searchResults = computed(() => {
  const q = searchQuery.value?.trim()
  if (!q) return []
  return filteredStock.value
})

const isCustomVehicleValid = computed(
  () =>
    customVehicle.value.brand &&
    customVehicle.value.model &&
    customVehicle.value.year &&
    customVehicle.value.price > 0
)

function handleSelectVehicle(vehicle, type) {
  selectedVehicle.value = vehicle
  selectedVehicleId.value = vehicle.id || `custom-${Date.now()}`
  selectedVehicleType.value = type
}

function confirmSelection() {
  if (!selectedVehicle.value) return
  emit('vehicle-selected', {
    vehicle: selectedVehicle.value,
    type: selectedVehicleType.value
  })
}

function handleSelectCustom() {
  if (!isCustomVehicleValid.value) return
  const vehicle = {
    ...customVehicle.value,
    id: `custom-${Date.now()}`,
    isCustom: true
  }
  emit('vehicle-selected', { vehicle, type: 'custom' })
}
</script>
