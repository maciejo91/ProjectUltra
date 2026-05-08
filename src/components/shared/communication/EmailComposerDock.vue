<template>
  <div v-if="open" class="fixed inset-x-0 bottom-4 z-50 flex justify-end px-4">
    <div
      class="w-full max-w-xl bg-background rounded-lg shadow-2xl drop-shadow-2xl overflow-hidden"
      :class="minimized ? 'max-w-xs bg-white cursor-pointer' : ''"
      role="button"
      :tabindex="minimized ? 0 : -1"
      @click="minimized && (minimized = false)"
      @keydown.enter.prevent="minimized && (minimized = false)"
      @keydown.space.prevent="minimized && (minimized = false)"
    >
      <div
        class="flex items-center justify-between gap-3 px-3 py-2"
        :class="minimized ? 'bg-white' : 'bg-muted-foreground/20'"
      >
        <div class="min-w-0">
          <div class="text-sm font-semibold text-foreground truncate">
            {{ t('emailForm.composer.title') }}
          </div>
        </div>

        <div class="flex items-center gap-1 shrink-0">
          <button
            type="button"
            class="p-2 rounded-sm text-muted-foreground hover:text-foreground hover:bg-background"
            :aria-label="minimized ? t('emailForm.composer.aria.restore') : t('emailForm.composer.aria.minimize')"
            @click.stop="minimized = !minimized"
          >
            <Minus v-if="!minimized" class="w-4 h-4" />
            <ChevronUp v-else class="w-4 h-4" />
          </button>

          <button
            type="button"
            class="p-2 rounded-sm text-muted-foreground hover:text-foreground hover:bg-background"
            :aria-label="t('emailForm.composer.aria.expand')"
            @click.stop="expanded = true"
          >
            <Maximize2 class="w-4 h-4" />
          </button>

          <button
            type="button"
            class="p-2 rounded-sm text-muted-foreground hover:text-foreground hover:bg-background"
            :aria-label="t('emailForm.composer.aria.close')"
            @click.stop="handleClose"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <div v-show="!minimized" class="p-3">
        <EmailForm
          ref="dockFormRef"
          :show-actions="false"
          :recent-attachments="recentAttachments"
          :initial-from="initialFrom"
          :initial-to="initialTo"
          :recipient-customer-id="recipientCustomerId"
          :draft="draft"
          :show-attach-button="false"
          @update:draft="(next) => (draft.value = next)"
          @send="handleSend"
          @update:valid="(v) => (formValid = v)"
        />

        <div class="pt-3 flex items-center justify-between gap-2">
          <Button
            variant="secondary"
            class="rounded-sm gap-2"
            type="button"
            @click="dockFormRef?.openDeviceFilePicker?.()"
          >
            <Paperclip class="w-4 h-4 shrink-0" aria-hidden="true" />
            {{ t('emailForm.attach.addButton') }}
          </Button>

          <div class="flex items-center gap-2">
            <Button
              variant="outline"
              class="rounded-sm"
              type="button"
              @click="handleClose"
            >
              {{ t('emailForm.actions.cancel') }}
            </Button>
            <Button
              variant="default"
              class="rounded-sm"
              type="button"
              :disabled="!formValid"
              @click="dockFormRef?.submit?.()"
            >
              {{ t('emailForm.actions.send') }}
            </Button>
          </div>
        </div>
      </div>
    </div>

    <Dialog :open="expanded" @update:open="(o) => (expanded = o)">
      <DialogPortal>
        <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
        <DialogContent
          class="w-full sm:max-w-2xl max-h-[calc(100vh-4rem)] flex flex-col"
          :show-close-button="true"
        >
          <DialogHeader class="shrink-0">
            <DialogTitle>{{ t('emailForm.composer.title') }}</DialogTitle>
          </DialogHeader>

          <div class="flex-1 overflow-y-auto py-4 w-full space-y-6">
            <EmailForm
              ref="dialogFormRef"
              :show-actions="false"
              :recent-attachments="recentAttachments"
              :initial-from="initialFrom"
              :initial-to="initialTo"
              :recipient-customer-id="recipientCustomerId"
              :draft="draft"
              :show-attach-button="false"
              @update:draft="(next) => (draft.value = next)"
              @send="handleSend"
              @update:valid="(v) => (formValid = v)"
            />
          </div>

          <DialogFooter class="shrink-0 flex items-center justify-between gap-3">
            <Button
              variant="secondary"
              class="rounded-sm gap-2"
              type="button"
              @click="dialogFormRef?.openDeviceFilePicker?.()"
            >
              <Paperclip class="w-4 h-4 shrink-0" aria-hidden="true" />
              {{ t('emailForm.attach.addButton') }}
            </Button>

            <div class="flex items-center gap-3">
              <Button
                variant="outline"
                class="rounded-sm"
                type="button"
                @click="expanded = false"
              >
                {{ t('emailForm.actions.cancel') }}
              </Button>
              <Button
                variant="default"
                class="rounded-sm"
                type="button"
                :disabled="!formValid"
                @click="dialogFormRef?.submit?.()"
              >
                {{ t('emailForm.actions.send') }}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChevronUp, Maximize2, Minus, Paperclip, X } from 'lucide-vue-next'
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
import EmailForm from '@/components/shared/communication/EmailForm.vue'

const props = defineProps({
  open: { type: Boolean, required: true },
  initialFrom: { type: String, default: '' },
  initialTo: { type: String, default: '' },
  recipientCustomerId: { type: [Number, String], default: null },
  recentAttachments: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:open', 'save'])

const { t } = useI18n()

const minimized = ref(false)
const expanded = ref(false)
const formValid = ref(false)
const dockFormRef = ref(null)
const dialogFormRef = ref(null)

const draft = ref({
  from: '',
  to: '',
  cc: '',
  bcc: '',
  subject: '',
  message: '',
  template: '',
  attachments: [],
  showBcc: false
})

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) return
    minimized.value = false
    expanded.value = false
    formValid.value = false
    draft.value = {
      from: '',
      to: '',
      cc: '',
      bcc: '',
      subject: '',
      message: '',
      template: '',
      attachments: [],
      showBcc: false
    }
  }
)

function handleSend(data) {
  emit('save', data)
  emit('update:open', false)
}

function handleClose() {
  emit('update:open', false)
}
</script>

