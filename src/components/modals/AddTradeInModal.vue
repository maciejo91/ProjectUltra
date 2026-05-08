<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent class="w-full sm:max-w-2xl max-h-[calc(100vh-4rem)] flex flex-col">
        <DialogHeader class="flex-shrink-0">
          <DialogTitle>Add Trade-In</DialogTitle>
        </DialogHeader>

        <div class="flex-1 overflow-y-auto px-6 py-4 w-full">
          <TradeInWidget
            ref="widgetRef"
            hide-header
            hide-actions
            :task-id="taskId ?? 0"
            :task-type="taskType"
            @save="handleSave"
            @cancel="$emit('close')"
          />
        </div>

        <DialogFooter class="flex-shrink-0 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3">
          <Button
            label="Cancel"
            variant="outline"
            size="small"
            @click="$emit('close')"
          />
          <Button
            label="Save"
            variant="default"
            size="small"
            @click="handleSaveClick"
          />
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue'
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle
} from '@motork/component-library/future/primitives'
import TradeInWidget from '@/components/customer/activities/TradeInWidget.vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  taskId: {
    type: [Number, String],
    default: null
  },
  taskType: {
    type: String,
    default: 'lead'
  }
})

const emit = defineEmits(['close', 'save'])

const widgetRef = ref(null)

function handleSave(data) {
  emit('save', {
    type: 'tradein',
    data
  })
  emit('close')
}

function handleSaveClick() {
  if (!widgetRef.value?.canSubmit?.()) return
  widgetRef.value.submit()
}

const handleOpenChange = (isOpen) => {
  if (!isOpen) {
    emit('close')
  }
}
</script>
