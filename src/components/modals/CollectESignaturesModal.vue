<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent class="w-full sm:max-w-lg max-h-[calc(100vh-4rem)] flex flex-col">
        <DialogHeader class="flex-shrink-0">
          <DialogTitle>Collect e-signatures, finalize contract</DialogTitle>
          <p class="text-sm text-muted-foreground mt-1">
            Get the formal contract signed electronically by the customer. Finalize all contractual terms and conditions. Ensure all required signatures are collected. Set the official Contract Date when customer signs.
          </p>
        </DialogHeader>

        <div class="flex-1 overflow-y-auto px-6 py-4 w-full space-y-6">
          <!-- Collect e-signatures form inline -->
          <div class="space-y-4">
            <!-- Contract Date -->
            <div>
              <Label class="block text-sm font-medium text-muted-foreground mb-2">Contract Date <span class="text-red-600">*</span></Label>
              <Input 
                type="date"
                v-model="contractDate"
                :max="maxContractDateComputed"
                class="w-full"
              />
            </div>
            
            <!-- Contract Time -->
            <div>
              <Label class="block text-sm font-medium text-muted-foreground mb-2">Time (Optional)</Label>
              <Input 
                type="time"
                v-model="contractTime"
                class="w-full"
              />
            </div>
            
            <!-- Notes -->
            <div>
              <Label class="block text-sm font-medium text-muted-foreground mb-2">Notes (Optional)</Label>
              <Textarea 
                v-model="notes"
                rows="4"
                placeholder="Add any relevant notes about the contract signing..."
                class="w-full"
              />
            </div>
          </div>
        </div>

        <DialogFooter class="flex-shrink-0 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3">
          <Button
            variant="outline"
            class="rounded-sm w-full sm:w-auto"
            @click="handleCancel"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            class="rounded-sm w-full sm:w-auto"
            :disabled="!canSubmit"
            @click="handleConfirm"
          >
            Confirm
          </Button>
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
  },
  contract: {
    type: Object,
    default: null
  },
  maxContractDate: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const contractDate = ref('')
const contractTime = ref('')
const notes = ref('')

// Max date is today if not provided
const maxContractDateComputed = computed(() => {
  if (props.maxContractDate) return props.maxContractDate
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const canSubmit = computed(() => {
  return !!contractDate.value
})

// Reset form when modal opens
watch(() => props.show, (newVal) => {
  if (newVal) {
    // Default to today
    const today = new Date()
    contractDate.value = today.toISOString().split('T')[0]
    contractTime.value = today.toTimeString().slice(0, 5)
    notes.value = ''
    
    // If contract has existing date, use it
    if (props.contract?.contractDate) {
      const date = new Date(props.contract.contractDate)
      contractDate.value = date.toISOString().split('T')[0]
      if (date.getHours() || date.getMinutes()) {
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        contractTime.value = `${hours}:${minutes}`
      }
    }
    if (props.contract?.contractNotes) {
      notes.value = props.contract.contractNotes
    }
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
    contractTime: contractTime.value,
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
