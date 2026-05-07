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
        :class="minimized ? 'bg-white' : 'bg-muted'"
      >
        <div class="min-w-0">
          <div class="text-sm font-semibold text-foreground truncate">
            {{ title }}
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
        <SMSForm
          ref="dockFormRef"
          :show-actions="false"
          :show-counter="false"
          :show-channel-toggle="true"
          :channel="channel"
          @update:channel="(c) => (channel = c)"
          :initial-from="initialFrom"
          :initial-to="initialTo"
          :draft="draft"
          @update:draft="(next) => (draft.value = next)"
          @send="handleSend"
          @update:valid="(v) => (formValid = v)"
        />

        <div class="pt-3 flex items-center justify-between gap-3">
          <p class="text-sm text-muted-foreground">
            {{ t('common.actions.smsCharacters', { count: draft.message?.length ?? 0 }) }}
          </p>
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
            <DialogTitle>{{ title }}</DialogTitle>
          </DialogHeader>

          <div class="flex-1 overflow-y-auto py-4 w-full space-y-6">
            <SMSForm
              ref="dialogFormRef"
              :show-actions="false"
              :show-counter="false"
              :show-channel-toggle="true"
              :channel="channel"
              @update:channel="(c) => (channel = c)"
              :initial-from="initialFrom"
              :initial-to="initialTo"
              :draft="draft"
              @update:draft="(next) => (draft.value = next)"
              @send="handleSend"
              @update:valid="(v) => (formValid = v)"
            />
          </div>

          <DialogFooter class="shrink-0 flex items-center justify-between gap-3">
            <p class="text-sm text-muted-foreground">
              {{ t('common.actions.smsCharacters', { count: draft.message?.length ?? 0 }) }}
            </p>
            <div class="flex items-center gap-2">
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
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChevronUp, Maximize2, Minus, X } from 'lucide-vue-next'
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
import SMSForm from '@/components/shared/communication/SMSForm.vue'

const props = defineProps({
  open: { type: Boolean, required: true },
  initialChannel: { type: String, default: 'sms' },
  initialFrom: { type: String, default: '' },
  initialTo: { type: String, default: '' }
})

const emit = defineEmits(['update:open', 'save'])

const { t } = useI18n()

const channel = ref('sms')
const title = computed(() =>
  channel.value === 'whatsapp' ? t('common.actions.newWhatsApp') : t('common.actions.newSms')
)

const minimized = ref(false)
const expanded = ref(false)
const formValid = ref(false)
const dockFormRef = ref(null)
const dialogFormRef = ref(null)

const draft = ref({
  from: '',
  to: '',
  template: '',
  message: ''
})

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) return
    minimized.value = false
    expanded.value = false
    formValid.value = false
    channel.value = String(props.initialChannel || 'sms')
    draft.value = { from: '', to: '', template: '', message: '' }
  }
)

watch(
  () => props.initialChannel,
  (c) => {
    if (!props.open) return
    channel.value = String(c || 'sms')
  },
  { immediate: true }
)

function handleSend(data) {
  emit('save', data)
  emit('update:open', false)
}

function handleClose() {
  emit('update:open', false)
}
</script>

