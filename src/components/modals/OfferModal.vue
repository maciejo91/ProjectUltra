<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent class="w-full sm:max-w-2xl min-h-[32rem] max-h-[calc(100vh-4rem)] flex flex-col p-0">
        <DialogHeader class="flex-shrink-0 p-6 pb-4 border-b border">
          <DialogTitle>Create Offer</DialogTitle>
        </DialogHeader>

        <div class="flex-1 overflow-y-auto p-6 w-full">
          <OfferWidget
            :item="item"
            :task-type="taskType"
            :task-id="taskId"
            :selected-vehicle="requestedCar"
            :customer="customer"
            :hide-header="true"
            :hide-actions="true"
            ref="widgetRef"
            @save="handleSave"
            @cancel="$emit('close')"
          />
        </div>

        <DialogFooter class="flex-shrink-0 p-6 pt-4 bg-muted flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3 border-t border">
          <Button
            label="Cancel"
            variant="outline"
            size="small"
            class="rounded-sm w-full sm:w-auto"
            @click="$emit('close')"
          />
          <Button
            :label="item ? 'Update Offer' : 'Create Offer'"
            variant="primary"
            size="small"
            class="rounded-sm w-full sm:w-auto !bg-brand-red !hover:bg-brand-red-dark !text-white !border-brand-red"
            :disabled="!isValid"
            @click="triggerSave"
          />
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Button } from '@motork/component-library/future/primitives'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle
} from '@motork/component-library/future/primitives'
import OfferWidget from '@/components/customer/activities/OfferWidget.vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  item: {
    type: Object,
    default: null
  },
  taskType: {
    type: String,
    default: 'opportunity'
  },
  taskId: {
    type: [String, Number],
    required: true
  },
  requestedCar: {
    type: Object,
    default: null
  },
  recommendedCars: {
    type: Array,
    default: () => []
  },
  customer: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save'])

const widgetRef = ref(null)

// Check if form is valid (widget exposes isValid/canSave)
const isValid = computed(() => {
  return widgetRef.value?.isValid || false
})

const triggerSave = () => {
  // Trigger the widget's submit method
  widgetRef.value?.submit()
}

const handleOpenChange = (isOpen) => {
  if (!isOpen) {
    emit('close')
  }
}

const handleSave = (data) => {
  emit('save', data)
  emit('close')
}
</script>

