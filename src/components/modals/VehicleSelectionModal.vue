<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent class="w-[90vw] max-w-none h-[80vh] max-h-[calc(100vh-4rem)] flex flex-col">
        <DialogHeader class="flex-shrink-0 px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle class="text-foreground">Select Vehicle</DialogTitle>
        </DialogHeader>

        <div class="flex-1 min-h-0 overflow-y-auto px-6 py-0 w-full space-y-6">
          <!-- Stock mode: Recommended + Browse Stock -->
          <template v-if="showStockSection">
            <div v-if="allRecommendedVehicles.length" class="space-y-3">
              <h3 class="text-sm font-bold text-foreground flex items-center gap-2">
                <Sparkles class="size-4 text-primary" />
                Recommended Vehicles
              </h3>
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
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

            <div class="space-y-3">
              <h3 class="text-sm font-bold text-foreground flex items-center gap-2">
                <Package class="size-4 text-primary" />
                Browse Stock
              </h3>
              <div class="flex gap-2">
                <div class="relative flex-1">
                  <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search by brand, model, year..."
                    class="w-full pl-9 bg-background border-border"
                  />
                </div>
              </div>
              <div v-if="filteredStock.length" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                <VehicleCard
                  v-for="vehicle in filteredStock"
                  :key="vehicle.id"
                  :vehicle="vehicle"
                  badge="In Stock"
                  :stock-days="vehicle.stockDays"
                  :selected="selectedVehicleId === vehicle.id"
                  @select="handleSelectVehicle(vehicle, 'stock')"
                />
              </div>
              <div v-else class="rounded-lg border border-border bg-muted py-12 text-center">
                <Search class="mx-auto mb-3 size-10 text-muted-foreground" />
                <p class="text-sm font-medium text-foreground">No vehicles found</p>
                <p class="text-sm text-muted-foreground mt-1">Try different keywords or clear the search</p>
              </div>
            </div>
          </template>

          <!-- Configure mode: Custom vehicle form -->
          <div v-if="showConfigureSection" class="space-y-4">
            <h3 class="text-sm font-bold text-foreground flex items-center gap-2">
              <Settings class="size-4 text-primary" />
              Configure Custom Vehicle
            </h3>
            <div class="rounded-lg border border-border bg-muted p-4 space-y-4">
              <p class="text-sm text-muted-foreground">
                Build a custom configuration with specific options and features.
              </p>
              <div v-if="!showConfigureForm" class="flex justify-start">
                <Button
                  variant="default"
                  size="sm"
                  class="gap-2"
                  @click="showConfigureForm = true"
                >
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
                  <Button
                    variant="secondary"
                    size="sm"
                    @click="showConfigureForm = false"
                  >
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

        <DialogFooter class="flex-shrink-0 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3 px-6 py-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            class="w-full sm:w-auto"
            @click="$emit('close')"
          >
            Cancel
          </Button>
          <Button
            v-if="selectedVehicle"
            variant="default"
            size="sm"
            class="w-full sm:w-auto"
            @click="handleConfirm"
          >
            Confirm Selection
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Check, Package, Search, Settings, Sparkles } from 'lucide-vue-next'
import {
  Button,
  Input,
  Label
} from '@motork/component-library/future/primitives'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle
} from '@motork/component-library/future/primitives'
import VehicleCard from '@/components/shared/vehicles/VehicleCard.vue'
import { fetchVehicles } from '@/api/vehicles'

const props = defineProps({
  show: { type: Boolean, required: true },
  requestedVehicle: { type: Object, default: null },
  requestedCar: { type: Object, default: null },
  opportunity: { type: Object, default: null },
  opportunityId: { type: [Number, String], default: null },
  /** 'full' = Recommended + Stock + Configure; 'stock' = Recommended + Stock only; 'configure' = Configure only */
  mode: { type: String, default: 'full' }
})

const resolvedRequestedVehicle = computed(() =>
  props.requestedVehicle || props.requestedCar || props.opportunity?.selectedVehicle || props.opportunity?.vehicle || props.opportunity?.requestedCar || null
)
const resolvedOpportunityId = computed(() =>
  props.opportunityId ?? props.opportunity?.id ?? null
)

const emit = defineEmits(['close', 'vehicle-selected'])

const handleOpenChange = (isOpen) => {
  if (!isOpen) emit('close')
}

const showStockSection = computed(() =>
  props.mode === 'full' || props.mode === 'stock'
)
const showConfigureSection = computed(() =>
  props.mode === 'full' || props.mode === 'configure'
)

watch(() => props.show, (isOpen) => {
  if (isOpen && props.mode === 'configure') {
    showConfigureForm.value = true
  }
})

// State
const searchQuery = ref('')
const showConfigureForm = ref(props.mode === 'configure')
const selectedVehicle = ref(null)
const selectedVehicleId = ref(null)
const selectedVehicleType = ref(null)
const vehicles = ref([])

// Custom vehicle configuration
const customVehicle = ref({
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  price: 0,
  stockDays: null,
  image: ''
})

// Load vehicles on mount
onMounted(async () => {
  try {
    const result = await fetchVehicles({})
    vehicles.value = result.data || []
  } catch (err) {
    console.error('Failed to load vehicles:', err)
    vehicles.value = []
  }
})

// Check if requested vehicle is in stock
const hasRequestedInStock = computed(() => {
  const rv = resolvedRequestedVehicle.value
  return rv && rv.stockDays != null
})

// Get all recommended vehicles (includes requested vehicle if in stock)
const allRecommendedVehicles = computed(() => {
  const rv = resolvedRequestedVehicle.value
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

// Filter stock vehicles based on search
const filteredStock = computed(() => {
  if (!vehicles.value || vehicles.value.length === 0) return []
  
  let filtered = [...vehicles.value]
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(v => 
      v.brand.toLowerCase().includes(query) ||
      v.model.toLowerCase().includes(query) ||
      v.year.toString().includes(query)
    )
  }
  
  return filtered
})

// Validate custom vehicle
const isCustomVehicleValid = computed(() => {
  return customVehicle.value.brand &&
         customVehicle.value.model &&
         customVehicle.value.year &&
         customVehicle.value.price > 0
})

// Handle vehicle selection
const handleSelectVehicle = (vehicle, type) => {
  selectedVehicle.value = vehicle
  selectedVehicleId.value = vehicle.id || `custom-${Date.now()}`
  selectedVehicleType.value = type
}

// Handle custom vehicle selection
const handleSelectCustom = () => {
  if (!isCustomVehicleValid.value) return
  
  const vehicle = {
    ...customVehicle.value,
    id: `custom-${Date.now()}`,
    isCustom: true
  }
  
  handleSelectVehicle(vehicle, 'custom')
}

// Confirm and emit selection
const handleConfirm = () => {
  if (selectedVehicle.value) {
    emit('vehicle-selected', {
      vehicle: selectedVehicle.value,
      type: selectedVehicleType.value
    })
    emit('close')
    
    // Reset state
    selectedVehicle.value = null
    selectedVehicleId.value = null
    selectedVehicleType.value = null
    searchQuery.value = ''
    showConfigureForm.value = false
    customVehicle.value = {
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      price: 0,
      stockDays: null,
      image: ''
    }
  }
}
</script>

