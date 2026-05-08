<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay />
      <DialogContent class="flex flex-col max-h-screen w-full sm:max-w-lg">
        <DialogHeader class="flex-shrink-0">
          <DialogTitle>Extend Expected Close Date</DialogTitle>
        </DialogHeader>

        <div class="flex-1 overflow-y-auto min-h-0">
          <FieldGroup class="gap-4">
            <Field>
              <FieldLabel for="extend-expected-close-date">Expected Close Date</FieldLabel>
              <Input
                id="extend-expected-close-date"
                type="date"
                v-model="newDate"
                :min="minDate"
              />
            </Field>
            <Field>
              <FieldLabel for="extend-expected-close-reason">Reason (optional)</FieldLabel>
              <Textarea
                id="extend-expected-close-reason"
                v-model="reason"
                :rows="4"
                placeholder="Why are you extending the expected close date?"
              />
            </Field>
          </FieldGroup>
        </div>

        <DialogFooter class="flex-shrink-0 flex flex-col sm:flex-row justify-end gap-3">
          <Button
            variant="outline"
            size="small"
            :disabled="saving"
            @click="handleCancel"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            size="small"
            class="inline-flex items-center justify-center gap-2"
            :disabled="!canSubmit || saving"
            @click="handleConfirm"
          >
            <Spinner v-if="saving" class="size-4 shrink-0" />
            <span>{{ saving ? 'Saving…' : 'Save' }}</span>
          </Button>
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
  Textarea,
  Field,
  FieldGroup,
  FieldLabel,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  Spinner
} from '@motork/component-library/future/primitives'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  opportunity: {
    type: Object,
    required: true
  },
  saving: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'confirm'])

const newDate = ref('')
const reason = ref('')

const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const canSubmit = computed(() => !!newDate.value)

watch(() => props.show, (isOpen) => {
  if (isOpen) {
    const currentDate = props.opportunity.expectedCloseDate
      ? new Date(props.opportunity.expectedCloseDate)
      : new Date()
    if (currentDate < new Date()) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      newDate.value = tomorrow.toISOString().split('T')[0]
    } else {
      newDate.value = currentDate.toISOString().split('T')[0]
    }
    reason.value = ''
  }
})

function handleOpenChange(isOpen) {
  if (!isOpen) emit('close')
}

function handleCancel() {
  emit('close')
}

function handleConfirm() {
  if (!canSubmit.value || props.saving) return
  emit('confirm', {
    expectedCloseDate: newDate.value,
    reason: reason.value
  })
  // Parent closes modal after async save completes
}
</script>
