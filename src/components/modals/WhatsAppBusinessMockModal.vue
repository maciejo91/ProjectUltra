<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent
        class="w-full sm:max-w-4xl max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden p-0 bg-[#E8E1D9]"
        :show-close-button="false"
      >
        <div class="shrink-0 flex items-center justify-between gap-3 bg-emerald-900 px-4 py-3">
          <div class="min-w-0">
            <div class="truncate text-sm font-semibold text-white">
              {{ contactName }}
            </div>
          </div>

          <div class="shrink-0 flex items-center gap-2">
            <button
              type="button"
              class="inline-flex h-9 w-9 items-center justify-center rounded-sm text-white/80 hover:text-white hover:bg-white/10"
              :aria-label="t('requestDetail.whatsappBusiness.attach')"
            >
              <Paperclip class="h-4 w-4" />
            </button>
            <button
              type="button"
              class="inline-flex h-9 w-9 items-center justify-center rounded-sm text-white/80 hover:text-white hover:bg-white/10"
              :aria-label="t('common.buttons.close')"
              @click="emit('close')"
            >
              <X class="h-4 w-4" />
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto bg-[#E8E1D9] px-4 pb-5">
          <div v-if="currentStep === 'chat'" class="mx-auto w-full max-w-3xl space-y-6">
            <div v-for="msg in messages" :key="msg.id" class="flex">
              <div
                class="relative max-w-[76%] rounded-md px-3 py-2 text-sm"
                :class="
                  msg.side === 'outbound'
                    ? 'ml-auto bg-[#D5FCC5] text-foreground before:absolute before:right-[-6px] before:top-3 before:h-0 before:w-0 before:border-y-8 before:border-y-transparent before:border-l-8 before:border-l-[#D5FCC5]'
                    : 'mr-auto bg-white text-foreground before:absolute before:left-[-6px] before:top-3 before:h-0 before:w-0 before:border-y-8 before:border-y-transparent before:border-r-8 before:border-r-white'
                "
              >
                <div class="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    class="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground/70 hover:text-muted-foreground hover:bg-black/5"
                    :aria-label="t('common.buttons.more')"
                  >
                    <MoreVertical class="h-3 w-3" />
                  </button>

                  <div class="min-w-0 flex-1 text-right text-[10px] leading-4 text-muted-foreground">
                    {{ msg.userLabel || (msg.side === 'outbound' ? assigneeLabel : contactLabel) }}
                  </div>
                </div>

                <div class="mt-3 whitespace-pre-wrap wrap-break-word">
                  {{ msg.text }}
                </div>

                <div class="mt-2 text-[10px] leading-4 text-muted-foreground">
                  {{ msg.timestampLabel }}
                </div>
              </div>
            </div>

            <div class="rounded-md bg-white px-4 py-3 text-center text-sm text-muted-foreground">
              {{ t('requestDetail.whatsappBusiness.notice') }}
            </div>
          </div>

          <div v-else class="mx-auto w-full max-w-3xl space-y-8 pt-5">
            <div v-for="template in templates" :key="template.id" class="space-y-3">
              <div class="inline-flex rounded-md bg-[#D5FCC5] px-3 py-2 text-sm text-foreground">
                {{ template.title }}
              </div>

              <div class="flex items-stretch gap-4">
                <div class="flex-1 h-10 rounded-md border border-black/5 bg-white px-4 shadow-sm flex items-center">
                  <div class="text-sm text-foreground truncate whitespace-nowrap">
                    {{ template.body }}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  type="button"
                  class="rounded-sm h-10 px-6 bg-[#008069] text-white hover:bg-[#00755D] hover:text-white active:bg-[#006A53] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#008069]/30"
                  @click="sendTemplate(template.id)"
                >
                  {{ t('common.actions.send') }}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div class="shrink-0 bg-[#E8E1D9] px-4 py-3">
          <div v-if="currentStep === 'chat'">
            <div v-if="footerVariant === 'templates'">
              <Button variant="outline" type="button" class="w-full rounded-sm" @click="openTemplates">
                {{ t('requestDetail.whatsappBusiness.chooseTemplate') }}
              </Button>
            </div>
            <div v-else class="flex items-stretch gap-3">
              <input
                v-model="composerMessage"
                type="text"
                class="h-10 flex-1 rounded-sm border border-black/5 bg-white px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008069]/30"
                :placeholder="t('common.conversations.thread.composerPlaceholder')"
                @keydown.enter.prevent="sendComposerMessage"
              />
              <Button
                variant="ghost"
                type="button"
                class="rounded-sm h-10 px-6 bg-[#008069] text-white hover:bg-[#00755D] hover:text-white active:bg-[#006A53] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#008069]/30"
                :disabled="!composerMessage.trim()"
                @click="sendComposerMessage"
              >
                {{ t('common.actions.send') }}
              </Button>
            </div>
          </div>
          <div v-else>
            <Button
              variant="outline"
              type="button"
              class="rounded-sm w-full"
              @click="cancelTemplates"
            >
              {{ t('common.buttons.cancel') }}
            </Button>
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { MoreVertical, Paperclip, X } from 'lucide-vue-next'
import { Button } from '@motork/component-library/future/primitives'
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal
} from '@motork/component-library/future/primitives'

const { t } = useI18n()

const props = defineProps({
  show: { type: Boolean, required: true },
  contactName: { type: String, default: '' },
  assigneeName: { type: String, default: '' },
  footerVariant: { type: String, default: 'templates' }, // 'templates' | 'composer'
  conversationMessages: { type: Array, default: null } // [{ id, side, text, timestampLabel, userLabel? }]
})

const emit = defineEmits(['close', 'choose-template'])

function handleOpenChange(open) {
  if (!open) emit('close')
}

const currentStep = ref('chat')
const composerMessage = ref('')
const dynamicMessages = ref([])

function openTemplates() {
  if (props.footerVariant !== 'templates') return
  currentStep.value = 'templates'
}

function cancelTemplates() {
  currentStep.value = 'chat'
}

function sendTemplate(templateId) {
  emit('choose-template', templateId)
  currentStep.value = 'chat'
}

function sendComposerMessage() {
  const text = composerMessage.value.trim()
  if (!text) return
  dynamicMessages.value.push({
    id: `c-${Date.now()}`,
    side: 'outbound',
    text,
    timestampLabel: new Date().toLocaleString(),
    userLabel: props.assigneeName || ''
  })
  composerMessage.value = ''
}

const fallbackUserLabel = computed(() => t('common.call.user'))
const contactLabel = computed(() => props.contactName || fallbackUserLabel.value)
const assigneeLabel = computed(() => props.assigneeName || fallbackUserLabel.value)

const templates = computed(() => [
  {
    id: 'generic-start',
    title: t('requestDetail.whatsappBusiness.templates.items.genericStart.title'),
    body: t('requestDetail.whatsappBusiness.templates.items.genericStart.body')
  },
  {
    id: 'start-new',
    title: t('requestDetail.whatsappBusiness.templates.items.startNew.title'),
    body: t('requestDetail.whatsappBusiness.templates.items.startNew.body')
  },
  {
    id: 'hello',
    title: t('requestDetail.whatsappBusiness.templates.items.hello.title'),
    body: t('requestDetail.whatsappBusiness.templates.items.hello.body')
  }
])

const seededMessages = computed(() => [
  {
    id: 'm1',
    side: 'outbound',
    text: t('requestDetail.whatsappBusiness.mock.outbound1'),
    timestampLabel: t('requestDetail.whatsappBusiness.mock.timestamp1')
  },
  {
    id: 'm2',
    side: 'inbound',
    text: t('requestDetail.whatsappBusiness.mock.inbound1'),
    timestampLabel: t('requestDetail.whatsappBusiness.mock.timestamp2')
  },
  {
    id: 'm3',
    side: 'outbound',
    text: t('requestDetail.whatsappBusiness.mock.outbound2'),
    timestampLabel: t('requestDetail.whatsappBusiness.mock.timestamp3')
  }
])

const messages = computed(() => {
  if (Array.isArray(props.conversationMessages) && props.conversationMessages.length > 0) {
    return [...props.conversationMessages, ...dynamicMessages.value]
  }
  return [...seededMessages.value, ...dynamicMessages.value]
})

watch(
  () => props.show,
  (open) => {
    if (!open) return
    currentStep.value = 'chat'
    composerMessage.value = ''
    dynamicMessages.value = []
  }
)
</script>

