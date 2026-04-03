<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent class="w-full sm:max-w-2xl max-h-[calc(100vh-4rem)] flex flex-col">
        <DialogHeader class="flex-shrink-0">
          <DialogTitle>{{ contact?.requestedCar ? 'Edit Requested Car' : 'Add Requested Car' }}</DialogTitle>
        </DialogHeader>

        <div class="flex-1 overflow-y-auto px-6 py-4 w-full space-y-6">
      <!-- Brand -->
      <div class="space-y-2">
        <Label class="block text-sm font-semibold text-foreground">Brand <span class="text-brand-red">*</span></Label>
        <Input 
          v-model="formData.brand"
          type="text" 
          required
          placeholder="e.g., BMW, Mercedes-Benz, Audi" 
          class="w-full h-10"
        />
      </div>
      
      <!-- Model -->
      <div class="space-y-2">
        <Label class="block text-sm font-semibold text-foreground">Model <span class="text-brand-red">*</span></Label>
        <Input 
          v-model="formData.model"
          type="text" 
          required
          placeholder="e.g., 3 Series, C-Class, A4" 
          class="w-full h-10"
        />
      </div>
      
      <!-- Year -->
      <div class="space-y-2">
        <Label class="block text-sm font-semibold text-foreground">Year <span class="text-brand-red">*</span></Label>
        <Input 
          v-model.number="formData.year"
          type="number" 
          required
          min="1900"
          :max="new Date().getFullYear() + 1"
          placeholder="e.g., 2024" 
          class="w-full h-10"
        />
      </div>
      
      <!-- Price (Optional) -->
      <div class="space-y-2">
        <Label class="block text-sm font-semibold text-foreground">Price (Optional)</Label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
          <Input 
            v-model.number="formData.price"
            type="number" 
            min="0"
            step="1000"
            placeholder="45000" 
            class="w-full h-10 pl-8"
          />
        </div>
      </div>
      
      <!-- Request Type -->
      <div class="space-y-2">
        <Label class="block text-sm font-semibold text-foreground">Request Type</Label>
        <Select v-model="formData.requestType">
          <SelectTrigger class="w-full h-10">
            <SelectValue placeholder="Select request type..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Quotation">Quotation</SelectItem>
            <SelectItem value="Test Drive">Test Drive</SelectItem>
            <SelectItem value="Generic Sales">Generic Sales</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <!-- Request Message -->
      <div class="space-y-2">
        <Label class="block text-sm font-semibold text-foreground">Request Message (Optional)</Label>
        <Textarea 
          v-model="formData.requestMessage"
          rows="5"
          placeholder="Customer's message or notes about the vehicle request..."
          class="w-full min-h-[120px] resize-none"
        />
      </div>
      
      <!-- Image URL (Optional) -->
      <div class="space-y-2">
        <Label class="block text-sm font-semibold text-foreground">Image URL (Optional)</Label>
        <Input 
          v-model="formData.image"
          type="url" 
          placeholder="https://example.com/car-image.jpg" 
          class="w-full h-10"
        />
        <p class="text-sm text-muted-foreground mt-1">Enter a URL to an image of the vehicle</p>
      </div>
      
      <!-- Additional Details (Collapsed by default) -->
      <div class="border-t border pt-4">
        <button 
          type="button"
          @click="showAdvanced = !showAdvanced"
          class="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronDown v-if="showAdvanced" class="w-4 h-4 shrink-0" />
          <ChevronRight v-else class="w-4 h-4 shrink-0" />
          Advanced Details (Optional)
        </button>
        
        <div v-if="showAdvanced" class="mt-4 space-y-6">
          <!-- Dealership -->
          <div class="space-y-2">
            <Label class="block text-sm font-semibold text-foreground">Dealership</Label>
            <Input 
              v-model="formData.dealership"
              type="text" 
              placeholder="e.g., Milano, Berlin" 
              class="w-full h-10"
            />
          </div>
          
          <!-- Fuel Type -->
          <div class="space-y-2">
            <Label class="block text-sm font-semibold text-foreground">Fuel Type</Label>
            <Select v-model="formData.fuelType">
              <SelectTrigger class="w-full h-10">
                <SelectValue placeholder="Select fuel type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Petrol">Petrol</SelectItem>
                <SelectItem value="Diesel">Diesel</SelectItem>
                <SelectItem value="Electric">Electric</SelectItem>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <!-- Gear Type -->
          <div class="space-y-2">
            <Label class="block text-sm font-semibold text-foreground">Gear Type</Label>
            <Select v-model="formData.gearType">
              <SelectTrigger class="w-full h-10">
                <SelectValue placeholder="Select gear type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Manual">Manual</SelectItem>
                <SelectItem value="Automatic">Automatic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <!-- Kilometers -->
          <div class="space-y-2">
            <Label class="block text-sm font-semibold text-foreground">Kilometers</Label>
            <Input 
              v-model.number="formData.kilometers"
              type="number" 
              min="0"
              placeholder="e.g., 50000" 
              class="w-full h-10"
            />
          </div>
          </div>
          </div>
        </div>

        <DialogFooter class="flex-shrink-0 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3">
          <Button
            label="Cancel"
            variant="outline"
            size="small"
            class="rounded-sm w-full sm:w-auto"
            @click="$emit('close')"
          />
          <Button
            :label="contact?.requestedCar ? 'Update Car' : 'Add Car'"
            variant="primary"
            size="small"
            class="rounded-sm w-full sm:w-auto !bg-brand-red !hover:bg-brand-red-dark !text-white !border-brand-red"
            :disabled="!isValid"
            @click="handleSubmit"
          />
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ChevronDown, ChevronRight } from 'lucide-vue-next'
import { 
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
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

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  contact: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'saved'])

const handleOpenChange = (isOpen) => {
  if (!isOpen) {
    emit('close')
  }
}

const showAdvanced = ref(false)

const formData = ref({
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  price: null,
  requestType: 'Quotation',
  requestMessage: '',
  image: '',
  dealership: '',
  fuelType: '',
  gearType: '',
  kilometers: null
})

// Initialize form with existing data if editing
watch(() => props.show, (newVal) => {
  if (newVal && props.contact?.requestedCar) {
    const car = props.contact.requestedCar
    formData.value = {
      brand: car.brand || '',
      model: car.model || '',
      year: car.year || new Date().getFullYear(),
      price: car.price || null,
      requestType: car.requestType || 'Quotation',
      requestMessage: car.requestMessage || '',
      image: car.image || '',
      dealership: car.dealership || '',
      fuelType: car.fuelType || '',
      gearType: car.gearType || '',
      kilometers: car.kilometers || null
    }
  } else if (newVal) {
    // Reset form for new car
    formData.value = {
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      price: null,
      requestType: 'Quotation',
      requestMessage: '',
      image: '',
      dealership: '',
      fuelType: '',
      gearType: '',
      kilometers: null
    }
  }
})

const isValid = computed(() => {
  return formData.value.brand.trim() && 
         formData.value.model.trim() && 
         formData.value.year > 1900
})

const handleSubmit = () => {
  if (!isValid.value) return
  
  // Clean up the data (remove empty optional fields)
  const carData = {
    brand: formData.value.brand.trim(),
    model: formData.value.model.trim(),
    year: formData.value.year,
    requestType: formData.value.requestType
  }
  
  // Add optional fields only if they have values
  if (formData.value.price) carData.price = formData.value.price
  if (formData.value.requestMessage) carData.requestMessage = formData.value.requestMessage.trim()
  if (formData.value.image) carData.image = formData.value.image.trim()
  if (formData.value.dealership) carData.dealership = formData.value.dealership.trim()
  if (formData.value.fuelType) carData.fuelType = formData.value.fuelType
  if (formData.value.gearType) carData.gearType = formData.value.gearType
  if (formData.value.kilometers !== null) carData.kilometers = formData.value.kilometers
  
  emit('saved', carData)
}
</script>



