<template>
  <div 
    class="animate-fade-in relative"
    :class="{ 'bg-surface border border-border rounded-xl p-5 shadow-nsc-card mb-6': !hideHeader }"
  >
    <div v-if="!hideHeader" class="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-surface border-t border-l border-border rotate-45"></div>
    <div v-if="!hideHeader" class="flex justify-between items-center mb-4">
      <h5 class="text-sm font-semibold text-foreground">{{ item ? 'Edit Trade-In' : 'Add Trade-In' }}</h5>
      <button @click="$emit('cancel')" class="text-muted-foreground hover:text-muted-foreground"><X class="w-4 h-4 shrink-0" /></button>
    </div>

    <div class="space-y-4">
      <!-- Vehicle Information -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label class="text-sm font-medium text-muted-foreground mb-1">Brand <span class="text-brand-red">*</span></Label>
          <Input 
            v-model="vehicleData.brand"
            type="text" 
            placeholder="e.g., Volkswagen" 
            required
          />
        </div>
        <div>
          <Label class="text-sm font-medium text-muted-foreground mb-1">Model <span class="text-brand-red">*</span></Label>
          <Input 
            v-model="vehicleData.model"
            type="text" 
            placeholder="e.g., ID.4" 
            required
          />
        </div>
        <div>
          <Label class="text-sm font-medium text-muted-foreground mb-1">Year <span class="text-brand-red">*</span></Label>
          <Input 
            v-model="vehicleData.year"
            type="number" 
            placeholder="e.g., 2024" 
            min="1900"
            :max="new Date().getFullYear() + 1"
            required
          />
        </div>
      </div>

      <!-- Version/Trim -->
      <div>
        <Label class="text-sm font-medium text-muted-foreground mb-1">Version/Trim</Label>
        <Input 
          v-model="vehicleData.version"
          type="text" 
          placeholder="e.g., Premium Plus" 
        />
      </div>

      <!-- Identification -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label class="text-sm font-medium text-muted-foreground mb-1">VIN</Label>
          <Input 
            v-model="vehicleData.vin"
            type="text" 
            placeholder="Vehicle Identification Number" 
          />
        </div>
        <div>
          <Label class="text-sm font-medium text-muted-foreground mb-1">Plates</Label>
          <Input 
            v-model="vehicleData.plates"
            type="text" 
            placeholder="License plate number" 
          />
        </div>
      </div>

      <!-- Vehicle Details -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label class="text-sm font-medium text-muted-foreground mb-1">Fuel Type</Label>
          <Select v-model="vehicleData.fuelType">
            <SelectTrigger class="w-full h-10">
              <SelectValue placeholder="Select fuel type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Petrol">Petrol</SelectItem>
              <SelectItem value="Diesel">Diesel</SelectItem>
              <SelectItem value="Electric">Electric</SelectItem>
              <SelectItem value="Hybrid">Hybrid</SelectItem>
              <SelectItem value="Plug-in Hybrid">Plug-in Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label class="text-sm font-medium text-muted-foreground mb-1">Gear Type</Label>
          <Select v-model="vehicleData.gearType">
            <SelectTrigger class="w-full h-10">
              <SelectValue placeholder="Select gear type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Manual">Manual</SelectItem>
              <SelectItem value="Automatic">Automatic</SelectItem>
              <SelectItem value="CVT">CVT</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label class="text-sm font-medium text-muted-foreground mb-1">Mileage (km)</Label>
          <Input 
            v-model.number="vehicleData.kilometers"
            type="number" 
            placeholder="0" 
            min="0"
          />
        </div>
      </div>

      <!-- Registration -->
      <div>
        <Label class="text-sm font-medium text-muted-foreground mb-1">Registration Year/Month</Label>
        <Input 
          v-model="vehicleData.registration"
          type="text"
        />
      </div>

      <!-- Valuation Card (collapsed by default) -->
      <div class="border border-border rounded-lg bg-muted">
        <button
          type="button"
          @click="showValuation = !showValuation"
          class="w-full flex items-center justify-between p-4 text-left hover:bg-surface transition-colors rounded-lg"
        >
          <h3 class="text-sm font-medium text-foreground">Valuation Information</h3>
          <i 
            :class="[
              'fa-solid transition-transform duration-200 text-muted-foreground',
              showValuation ? 'fa-chevron-up' : 'fa-chevron-down'
            ]"
          ></i>
        </button>
        
        <div v-if="showValuation" class="px-4 pb-4 space-y-4 border-t border-border pt-4">
          <!-- Trade-In Price -->
          <div>
            <Label class="text-sm font-medium text-muted-foreground mb-1">Trade-In Price (€)</Label>
            <Input 
              v-model.number="valuationData.tradeInPrice"
              type="number" 
              placeholder="0.00" 
              min="0"
              step="0.01"
            />
          </div>

          <!-- Evaluation Range -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label class="text-sm font-medium text-muted-foreground mb-1">Evaluation Range - Low (€)</Label>
              <Input 
                v-model.number="valuationData.evaluationRangeLow"
                type="number" 
                placeholder="0.00" 
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground mb-1">Evaluation Range - High (€)</Label>
              <Input 
                v-model.number="valuationData.evaluationRangeHigh"
                type="number" 
                placeholder="0.00" 
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <!-- Provider and Evaluation Date -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label class="text-sm font-medium text-muted-foreground mb-1">Provider</Label>
              <Select v-model="valuationData.provider">
                <SelectTrigger class="w-full h-10">
                  <SelectValue placeholder="Select provider..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Eurotax">Eurotax</SelectItem>
                  <SelectItem value="Infocar">Infocar</SelectItem>
                  <SelectItem value="Manual">Manual</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground mb-1">Evaluation Date</Label>
              <Input 
                v-model="valuationData.evaluationDate"
                type="date" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!hideActions" class="flex justify-end gap-2 mt-6 border-t border-border pt-4">
      <Button
        label="Cancel"
        variant="outline"
        size="small"
        class="rounded-sm"
        @click="$emit('cancel')"
      />
      <Button
        label="Save"
        variant="primary"
        size="small"
        class="rounded-sm !bg-brand-red !hover:bg-brand-red-dark !text-white !border-brand-red"
        :disabled="!isValid"
        @click="handleSave"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { X } from 'lucide-vue-next'
import { 
  Button,
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@motork/component-library/future/primitives'

const props = defineProps({
  item: {
    type: Object,
    default: null
  },
  taskType: {
    type: String,
    default: 'lead'
  },
  taskId: {
    type: Number,
    required: true
  },
  hideActions: {
    type: Boolean,
    default: false
  },
  hideHeader: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['save', 'cancel'])

const showValuation = ref(false)

const vehicleData = ref({
  brand: '',
  model: '',
  year: '',
  version: '',
  vin: '',
  plates: '',
  fuelType: '',
  gearType: '',
  kilometers: '',
  registration: ''
})

const valuationData = ref({
  tradeInPrice: null,
  evaluationRangeLow: null,
  evaluationRangeHigh: null,
  provider: '',
  evaluationDate: ''
})

const isValid = computed(() => {
  return !!vehicleData.value.brand && !!vehicleData.value.model && !!vehicleData.value.year
})

onMounted(() => {
  if (props.item && props.item.data) {
    // Load vehicle data from existing item
    vehicleData.value = {
      brand: props.item.data.brand || '',
      model: props.item.data.model || '',
      year: props.item.data.year || '',
      version: props.item.data.version || '',
      vin: props.item.data.vin || '',
      plates: props.item.data.plate || props.item.data.plates || '',
      fuelType: props.item.data.fuelType || '',
      gearType: props.item.data.gearType || '',
      kilometers: props.item.data.km || props.item.data.kilometers || '',
      registration: props.item.data.date || props.item.data.registration || ''
    }

    // Load valuation data if exists
    if (props.item.data.tradeInPrice !== undefined) {
      valuationData.value = {
        tradeInPrice: props.item.data.tradeInPrice || null,
        evaluationRangeLow: props.item.data.evaluationRangeLow || null,
        evaluationRangeHigh: props.item.data.evaluationRangeHigh || null,
        provider: props.item.data.provider || '',
        evaluationDate: props.item.data.evaluationDate || ''
      }
      showValuation.value = true
    }
  }
})

const handleSave = () => {
  if (!isValid.value) return

  const data = {
    id: props.item?.id || Date.now(),
    type: 'tradein',
    action: props.item ? 'updated a trade-in' : 'added a trade-in',
    timestamp: props.item?.timestamp || new Date().toISOString(),
    isEdit: !!props.item,
    data: {
      brand: vehicleData.value.brand,
      model: vehicleData.value.model,
      year: parseInt(vehicleData.value.year) || null,
      version: vehicleData.value.version || null,
      vin: vehicleData.value.vin || null,
      plate: vehicleData.value.plates || null,
      plates: vehicleData.value.plates || null,
      fuelType: vehicleData.value.fuelType || null,
      gearType: vehicleData.value.gearType || null,
      km: parseInt(vehicleData.value.kilometers) || 0,
      kilometers: parseInt(vehicleData.value.kilometers) || 0,
      date: vehicleData.value.registration || null,
      registration: vehicleData.value.registration || null,
      // Valuation data
      tradeInPrice: valuationData.value.tradeInPrice,
      evaluationRangeLow: valuationData.value.evaluationRangeLow,
      evaluationRangeHigh: valuationData.value.evaluationRangeHigh,
      provider: valuationData.value.provider || null,
      evaluationDate: valuationData.value.evaluationDate || null
    }
  }

  emit('save', data)
}

defineExpose({
  submit: handleSave,
  canSubmit: () => isValid.value
})
</script>
