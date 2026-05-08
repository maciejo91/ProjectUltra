<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent class="w-full sm:max-w-lg max-h-[calc(100vh-4rem)] flex flex-col">
        <DialogHeader class="flex-shrink-0">
          <DialogTitle>Mark as Delivered</DialogTitle>
        </DialogHeader>

        <div class="flex-1 overflow-y-auto px-6 py-4 w-full space-y-6">
      <!-- Delivery Date -->
      <div class="space-y-2">
        <Label class="block text-sm font-semibold text-foreground">Delivery Date</Label>
        <Input 
          type="date"
          v-model="deliveryDate"
          :max="maxDate"
          class="w-full h-10"
        />
      </div>
      
      <!-- Delivery Time -->
      <div class="space-y-2">
        <Label class="block text-sm font-semibold text-foreground">Time (Optional)</Label>
        <Input 
          type="time"
          v-model="deliveryTime"
          class="w-full h-10"
        />
      </div>
      
      <!-- Delivery Location -->
      <div class="space-y-2">
        <Label class="block text-sm font-semibold text-foreground">Delivery Location</Label>
        <Select v-model="deliveryLocation">
          <SelectTrigger class="w-full h-10">
            <SelectValue placeholder="Select location..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Dealership">At Dealership</SelectItem>
            <SelectItem value="Customer Address">Customer Address</SelectItem>
            <SelectItem value="Other">Other Location</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <!-- Notes -->
      <div class="space-y-2">
        <Label class="block text-sm font-semibold text-foreground">Delivery Notes</Label>
        <Textarea 
          v-model="notes"
          rows="4"
          placeholder="Add any relevant delivery details, customer feedback, etc..."
          class="w-full min-h-[100px] resize-none"
        />
      </div>
        </div>

        <DialogFooter class="flex-shrink-0 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3">
          <Button
            label="Cancel"
            variant="outline"
            size="small"
            class="rounded-sm w-full sm:w-auto"
            @click="handleCancel"
          />
          <Button 
            label="Mark as Delivered"
            variant="primary"
            size="small"
            class="rounded-sm w-full sm:w-auto !bg-green-600 !hover:bg-green-700 !border-green-600"
            :disabled="!deliveryDate || !deliveryLocation"
            @click="handleConfirm"
          />
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { 
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
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
    required: true
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const deliveryDate = ref('')
const deliveryTime = ref('')
const deliveryLocation = ref('')
const notes = ref('')

// Max date is today
const maxDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

// Reset form when modal opens
watch(() => props.show, (newVal) => {
  if (newVal) {
    // Default to today
    const today = new Date()
    deliveryDate.value = today.toISOString().split('T')[0]
    deliveryTime.value = today.toTimeString().slice(0, 5)
    deliveryLocation.value = ''
    notes.value = ''
  }
})

const handleConfirm = () => {
  if (!deliveryDate.value || !deliveryLocation.value) return
  
  // Combine date and time
  const datetime = deliveryTime.value 
    ? `${deliveryDate.value}T${deliveryTime.value}:00`
    : `${deliveryDate.value}T12:00:00`
  
  emit('confirm', {
    deliveryDate: datetime,
    location: deliveryLocation.value,
    notes: notes.value
  })
}

const handleCancel = () => {
  emit('cancel')
}

const handleOpenChange = (isOpen) => {
  if (!isOpen) {
    handleCancel()
  }
}
</script>
