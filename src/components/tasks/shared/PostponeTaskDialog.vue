<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent class="w-full sm:max-w-md max-h-[calc(100vh-4rem)] flex flex-col">
        <DialogHeader class="flex-shrink-0">
          <DialogTitle>Postpone Task</DialogTitle>
        </DialogHeader>

        <div class="flex-1 overflow-y-auto px-6 py-4 w-full space-y-4">
          <div>
            <Label class="block text-sm font-medium text-foreground mb-2">Postpone Date <span class="text-red-600">*</span></Label>
            <Input
              type="date"
              v-model="postponeForm.date"
              :min="minDate"
              class="w-full"
            />
          </div>

          <div>
            <Label class="block text-sm font-medium text-foreground mb-2">Time (Optional)</Label>
            <Input
              type="time"
              v-model="postponeForm.time"
              class="w-full"
            />
          </div>

          <div>
            <Label class="block text-sm font-medium text-foreground mb-2">Reason (Optional)</Label>
            <Textarea
              v-model="postponeForm.reason"
              rows="3"
              placeholder="Why are you postponing this task?"
              class="w-full"
            />
          </div>
        </div>

        <DialogFooter class="flex-shrink-0 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3">
          <Button
            variant="outline"
            size="small"
            class="rounded-sm w-full sm:w-auto"
            :disabled="saving"
            @click="handleCancel"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            size="small"
            class="rounded-sm w-full sm:w-auto inline-flex items-center justify-center gap-2"
            :disabled="!canSubmit || saving"
            @click="handleConfirm"
          >
            <Spinner v-if="saving" class="size-4 shrink-0" />
            <span>{{ saving ? 'Saving…' : 'Postpone Task' }}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Button, Input, Label, Textarea, Spinner } from '@motork/component-library/future/primitives'
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
  taskType: {
    type: String,
    required: true
  },
  saving: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'confirm'])

const postponeForm = ref({
  date: '',
  time: '',
  reason: ''
})

const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const canSubmit = computed(() => {
  return !!postponeForm.value.date
})

watch(() => props.show, (isOpen) => {
  if (isOpen) {
    // Initialize form with today's date and current time
    const today = new Date()
    postponeForm.value.date = today.toISOString().split('T')[0]
    postponeForm.value.time = today.toTimeString().slice(0, 5)
    postponeForm.value.reason = ''
  }
})

const handleOpenChange = (isOpen) => {
  if (!isOpen) {
    emit('close')
  }
}

const handleCancel = () => {
  emit('close')
}

const handleConfirm = () => {
  if (!canSubmit.value || props.saving) return

  const dateTime = postponeForm.value.time
    ? `${postponeForm.value.date}T${postponeForm.value.time}:00`
    : `${postponeForm.value.date}T12:00:00`

  emit('confirm', {
    taskType: props.taskType,
    date: postponeForm.value.date,
    time: postponeForm.value.time || '12:00',
    dateTime: dateTime,
    reason: postponeForm.value.reason
  })
  // Parent closes dialog after async save completes
}
</script>
