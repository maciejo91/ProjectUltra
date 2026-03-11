<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent
        class="w-full sm:max-w-md flex flex-col"
        :show-close-button="true"
      >
        <DialogHeader class="shrink-0">
          <DialogTitle>Approve merge?</DialogTitle>
          <DialogDescription v-if="duplicateSummary">
            Merge {{ duplicateSummary }} into this request? The duplicate will be closed and its activities will be merged.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter class="shrink-0 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3">
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-sm border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:pointer-events-none w-full sm:w-auto"
            :disabled="loading"
            @click="handleClose"
          >
            Cancel
          </button>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-sm px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none w-full sm:w-auto"
            :disabled="loading"
            @click="handleConfirm"
          >
            Confirm
          </button>
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup>
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle
} from '@motork/component-library/future/primitives'

defineProps({
  show: {
    type: Boolean,
    default: false
  },
  duplicateSummary: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'confirm'])

function handleOpenChange(isOpen) {
  if (!isOpen) emit('close')
}

function handleClose() {
  emit('close')
}

function handleConfirm() {
  emit('confirm')
}
</script>
