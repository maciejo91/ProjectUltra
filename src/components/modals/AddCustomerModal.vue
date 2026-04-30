<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent class="w-[90vw] max-w-none max-h-[calc(100vh-4rem)] flex flex-col">
        <DialogHeader class="flex-shrink-0">
          <DialogTitle>{{ modalTitle }}</DialogTitle>
        </DialogHeader>

        <div class="flex-1 overflow-y-auto px-6 py-4 w-full space-y-6">
      <!-- Form fields based on active tab -->
      <div v-if="activeTab === 'customers'" class="space-y-6">
        <div class="space-y-2">
          <Label class="block text-sm font-semibold text-foreground">Contact Name</Label>
          <Input 
            v-model="formData.customerName"
            type="text" 
            placeholder="Enter contact name..." 
            class="w-full h-10"
          />
        </div>
        
        <div class="space-y-2">
          <Label class="block text-sm font-semibold text-foreground">Email</Label>
          <Input 
            v-model="formData.email"
            type="email" 
            placeholder="contact@example.com" 
            class="w-full h-10"
          />
        </div>
        
        <div class="space-y-2">
          <Label class="block text-sm font-semibold text-foreground">Phone</Label>
          <Input 
            v-model="formData.phone"
            type="tel" 
            placeholder="+49..." 
            class="w-full h-10"
          />
        </div>
        
        <div class="space-y-2">
          <Label class="block text-sm font-semibold text-foreground">Company (optional)</Label>
          <Input 
            v-model="formData.company"
            type="text" 
            placeholder="Company name..." 
            class="w-full h-10"
          />
        </div>
      </div>
      
      <div v-else-if="activeTab === 'open-leads'" class="space-y-6">
        <div class="space-y-2">
          <Label class="block text-sm font-semibold text-foreground">Customer Name</Label>
          <Input 
            v-model="formData.customerName"
            type="text" 
            placeholder="Enter customer name..." 
            class="w-full h-10"
          />
        </div>
        
        <div class="space-y-2">
          <Label class="block text-sm font-semibold text-foreground">Email</Label>
          <Input 
            v-model="formData.email"
            type="email" 
            placeholder="customer@example.com" 
            class="w-full h-10"
          />
        </div>
        
        <div class="space-y-2">
          <Label class="block text-sm font-semibold text-foreground">Requested Vehicle</Label>
          <Input 
            v-model="formData.vehicle"
            type="text" 
            placeholder="e.g., Volkswagen ID.4" 
            class="w-full h-10"
          />
        </div>
      </div>
      
      <div v-else-if="activeTab === 'open-opportunities' || activeTab === 'in-negotiation'" class="space-y-6">
        <div class="space-y-2">
          <Label class="block text-sm font-semibold text-foreground">Customer Name</Label>
          <Input 
            v-model="formData.customerName"
            type="text" 
            placeholder="Enter customer name..." 
            class="w-full h-10"
          />
        </div>
        
        <div class="space-y-2">
          <Label class="block text-sm font-semibold text-foreground">Vehicle</Label>
          <Input 
            v-model="formData.vehicle"
            type="text" 
            placeholder="e.g., Porsche Taycan" 
            class="w-full h-10"
          />
        </div>
        
        <div class="space-y-2">
          <Label class="block text-sm font-semibold text-foreground">Opportunity Value</Label>
          <Input 
            v-model="formData.value"
            type="number" 
            placeholder="0" 
            class="w-full h-10"
          />
        </div>
      </div>
      
      <div v-else class="space-y-6">
        <div class="space-y-2">
          <Label class="block text-sm font-semibold text-foreground">Customer Name</Label>
          <Input 
            v-model="formData.customerName"
            type="text" 
            placeholder="Enter customer name..." 
            class="w-full h-10"
          />
        </div>
        
        <div class="space-y-2">
          <Label class="block text-sm font-semibold text-foreground">Vehicle</Label>
          <Input 
            v-model="formData.vehicle"
            type="text" 
            placeholder="Vehicle model" 
            class="w-full h-10"
          />
        </div>
        
        <div class="space-y-2">
          <Label class="block text-sm font-semibold text-foreground">Reason</Label>
          <Textarea 
            v-model="formData.reason"
            rows="4"
            :placeholder="`Reason for ${activeTab === 'won' ? 'win' : 'loss'}...`"
            class="w-full min-h-[100px] resize-none"
          />
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
            :label="`Create ${itemType}`"
            variant="primary"
            size="small"
            class="rounded-sm w-full sm:w-auto !bg-brand-red !hover:bg-brand-red-dark !text-white !border-brand-red"
            @click="handleAdd"
          />
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  Button,
  Input,
  Label,
  Textarea
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
  activeTab: {
    type: String,
    required: true
  },
  initialData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'save'])

const formData = ref({
  customerName: '',
  email: '',
  phone: '',
  company: '',
  vehicle: '',
  value: '',
  reason: ''
})

// Reset form when modal opens
watch(() => props.show, (newVal) => {
  if (newVal) {
    formData.value = {
      customerName: props.initialData.customerName || '',
      email: props.initialData.email || '',
      phone: props.initialData.phone || '',
      company: props.initialData.company || '',
      vehicle: props.initialData.vehicle || '',
      value: props.initialData.value || '',
      reason: props.initialData.reason || ''
    }
  }
})

const handleOpenChange = (isOpen) => {
  if (!isOpen) {
    emit('close')
  }
}

const modalTitle = computed(() => {
  const titles = {
    'customers': 'Add New Customer',
    'open-leads': 'Add New Lead',
    'open-opportunities': 'Add New Opportunity',
    'in-negotiation': 'Add Opportunity in Negotiation',
    'won': 'Add Won Opportunity',
    'lost': 'Add Lost Opportunity'
  }
  return titles[props.activeTab] || 'Add New Item'
})

const itemType = computed(() => {
  const types = {
    'customers': 'Customer',
    'open-leads': 'Lead',
    'open-opportunities': 'Opportunity',
    'in-negotiation': 'Opportunity',
    'won': 'Won Opportunity',
    'lost': 'Lost Opportunity'
  }
  return types[props.activeTab] || 'Item'
})

const handleAdd = () => {
  emit('save', { ...formData.value })
  // Reset form after save
  formData.value = {
    customerName: '',
    email: '',
    phone: '',
    company: '',
    vehicle: '',
    value: '',
    reason: ''
  }
}
</script>

