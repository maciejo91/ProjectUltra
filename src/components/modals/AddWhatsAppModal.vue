<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent
        class="w-full sm:max-w-lg max-h-[calc(100vh-4rem)] flex flex-col"
        :show-close-button="true"
      >
        <DialogHeader class="shrink-0">
          <DialogTitle>Send WhatsApp Message</DialogTitle>
        </DialogHeader>

        <div class="flex-1 overflow-y-auto py-4 w-full space-y-6">
          <WhatsAppForm
            ref="formRef"
            :show-actions="false"
            @send="handleSend"
            @update:valid="(v) => (formValid = v)"
          />
        </div>

        <DialogFooter class="shrink-0 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3">
          <Button
            variant="outline"
            class="rounded-sm w-full sm:w-auto"
            @click="$emit('close')"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            class="rounded-sm w-full sm:w-auto"
            :disabled="!formValid"
            @click="formRef?.submit?.()"
          >
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue'
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
import WhatsAppForm from '@/components/shared/communication/WhatsAppForm.vue'

defineProps({
  show: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['close', 'save'])

const formRef = ref(null)
const formValid = ref(false)

const handleSend = (data) => {
  emit('save', data)
  emit('close')
}

const handleOpenChange = (isOpen) => {
  if (!isOpen) {
    emit('close')
  }
}
</script>
