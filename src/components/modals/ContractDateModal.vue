<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent class="w-full sm:max-w-lg max-h-[calc(100vh-4rem)] flex flex-col">
        <DialogHeader class="flex-shrink-0">
          <DialogTitle>Set Contract Signing Date</DialogTitle>
        </DialogHeader>

        <div class="flex-1 overflow-y-auto px-6 py-4 w-full space-y-6">
      <!-- Contract Date -->
      <div class="space-y-2">
        <Label class="block text-sm font-semibold text-foreground">Contract Date</Label>
        <Input 
          type="date"
          v-model="contractDate"
          :max="maxDate"
          class="w-full h-10"
        />
      </div>
      
      <!-- Contract Time -->
      <div class="space-y-2">
        <Label class="block text-sm font-semibold text-foreground">Time (Optional)</Label>
        <Input 
          type="time"
          v-model="contractTime"
          class="w-full h-10"
        />
      </div>
      
      <!-- Notes -->
      <div class="space-y-2">
        <Label class="block text-sm font-semibold text-foreground">Notes (Optional)</Label>
        <Textarea 
          v-model="notes"
          rows="4"
          placeholder="Add any relevant notes about the contract signing..."
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
            label="Set Contract Date"
            variant="primary"
            size="small"
            class="rounded-sm w-full sm:w-auto !bg-green-600 !hover:bg-green-700 !border-green-600"
            :disabled="!contractDate"
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
    required: true
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const contractDate = ref('')
const contractTime = ref('')
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
    contractDate.value = today.toISOString().split('T')[0]
    contractTime.value = today.toTimeString().slice(0, 5)
    notes.value = ''
  }
})

const handleConfirm = () => {
  if (!contractDate.value) return
  
  // Combine date and time
  const datetime = contractTime.value 
    ? `${contractDate.value}T${contractTime.value}:00`
    : `${contractDate.value}T12:00:00`
  
  emit('confirm', {
    contractDate: datetime,
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
