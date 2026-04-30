<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent class="w-[90vw] max-w-none max-h-[calc(100vh-4rem)] flex flex-col p-0">
        <DialogHeader class="flex-shrink-0 p-6 pb-4 border-b border">
          <DialogTitle>Send PDF by Email</DialogTitle>
        </DialogHeader>

        <div class="flex-1 overflow-y-auto p-6 w-full space-y-4">
          <!-- Recipient Email -->
          <div>
            <Label class="text-sm font-semibold text-foreground mb-2 block">
              Recipient Email <span class="text-red-500">*</span>
            </Label>
            <Input
              v-model="emailData.to"
              type="email"
              placeholder="customer@example.com"
              required
              :disabled="sending"
            />
          </div>

          <!-- Subject -->
          <div>
            <Label class="text-sm font-semibold text-foreground mb-2 block">
              Subject <span class="text-red-500">*</span>
            </Label>
            <Input
              v-model="emailData.subject"
              type="text"
              placeholder="Contract/Offer Document"
              required
              :disabled="sending"
            />
          </div>

          <!-- Optional Message -->
          <div>
            <Label class="text-sm font-semibold text-foreground mb-2 block">
              Message (Optional)
            </Label>
            <textarea
              v-model="emailData.message"
              class="w-full min-h-[100px] px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Add a personal message to the email..."
              :disabled="sending"
            ></textarea>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>

          <!-- Success Message -->
          <div v-if="success" class="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p class="text-sm text-green-600">
              <CheckCircle class="w-4 h-4 shrink-0 mr-2" />
              PDF sent successfully!
            </p>
          </div>
        </div>

        <DialogFooter class="flex-shrink-0 p-6 pt-4 bg-muted flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3 border-t border">
          <Button
            label="Cancel"
            variant="outline"
            size="small"
            class="rounded-sm w-full sm:w-auto"
            :disabled="sending"
            @click="$emit('close')"
          />
          <Button
            label="Send Email"
            variant="primary"
            size="small"
            class="rounded-sm w-full sm:w-auto !bg-brand-red !hover:bg-brand-red-dark !text-white !border-brand-red"
            :disabled="!isValid || sending"
            @click="handleSend"
          >
            <template v-if="sending">
              <Loader2 class="w-4 h-4 shrink-0 mr-2 animate-spin" />
              Sending...
            </template>
            <template v-else>
              <Mail class="w-4 h-4 shrink-0 mr-2" />
            </template>
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { CheckCircle, Loader2, Mail } from 'lucide-vue-next'
import { Button, Input, Label } from '@motork/component-library/future/primitives'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle
} from '@motork/component-library/future/primitives'
import { useContractPDF } from '@/composables/useContractPDF'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  pdfId: {
    type: String,
    required: true
  },
  recipientEmail: {
    type: String,
    default: ''
  },
  defaultSubject: {
    type: String,
    default: 'Contract/Offer Document'
  }
})

const emit = defineEmits(['close', 'sent'])

const { sendPDFByEmail, isLoading, error: pdfError } = useContractPDF()

const emailData = ref({
  to: '',
  subject: '',
  message: ''
})

const sending = ref(false)
const error = ref(null)
const success = ref(false)

const isValid = computed(() => {
  return emailData.value.to && emailData.value.to.includes('@') && emailData.value.subject
})

// Initialize with defaults
watch(() => props.show, (isOpen) => {
  if (isOpen) {
    emailData.value = {
      to: props.recipientEmail || '',
      subject: props.defaultSubject || 'Contract/Offer Document',
      message: ''
    }
    error.value = null
    success.value = false
  }
})

const handleOpenChange = (isOpen) => {
  if (!isOpen) {
    emit('close')
  }
}

const handleSend = async () => {
  if (!isValid.value) return

  sending.value = true
  error.value = null
  success.value = false

  try {
    await sendPDFByEmail(props.pdfId, {
      to: emailData.value.to,
      subject: emailData.value.subject,
      message: emailData.value.message || undefined
    })

    success.value = true
    
    // Emit success and close after a short delay
    setTimeout(() => {
      emit('sent', {
        pdfId: props.pdfId,
        email: emailData.value.to
      })
      emit('close')
    }, 1500)
  } catch (err) {
    error.value = err.message || 'Failed to send email. Please try again.'
  } finally {
    sending.value = false
  }
}
</script>
