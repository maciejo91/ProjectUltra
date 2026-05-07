<template>
  <div class="w-full flex flex-col divide-y divide-border">
    <div class="flex items-center gap-3 py-1">
      <span class="w-14 text-sm text-muted-foreground shrink-0">{{ t('emailForm.fields.from') }}</span>
      <Input
        v-model="from"
        type="email"
        :placeholder="t('emailForm.placeholders.from')"
        class="border-0 shadow-none focus-visible:ring-0 px-0 h-8 min-h-8"
      />
    </div>

    <div class="flex items-center gap-3 py-1">
      <span class="w-14 text-sm text-muted-foreground shrink-0">{{ t('emailForm.fields.to') }}</span>
      <Input
        v-model="to"
        type="text"
        :placeholder="t('emailForm.placeholders.to')"
        class="border-0 shadow-none focus-visible:ring-0 px-0 h-8 min-h-8"
      />
      <button
        type="button"
        class="text-sm text-muted-foreground hover:text-foreground"
        @click="showBcc = !showBcc"
      >
        {{ t('emailForm.fields.bcc') }}
      </button>
    </div>

    <div class="flex items-center gap-3 py-1">
      <span class="w-14 text-sm text-muted-foreground shrink-0">{{ t('emailForm.fields.cc') }}</span>
      <Input
        v-model="cc"
        type="text"
        :placeholder="t('emailForm.placeholders.cc')"
        class="border-0 shadow-none focus-visible:ring-0 px-0 h-8 min-h-8"
      />
    </div>

    <div v-if="showBcc" class="flex items-center gap-3 py-1">
      <span class="w-14 text-sm text-muted-foreground shrink-0">{{ t('emailForm.fields.bcc') }}</span>
      <Input
        v-model="bcc"
        type="text"
        :placeholder="t('emailForm.placeholders.bcc')"
        class="border-0 shadow-none focus-visible:ring-0 px-0 h-8 min-h-8"
      />
    </div>

    <div class="flex items-center gap-3 py-1">
      <span class="w-14 text-sm text-muted-foreground shrink-0">{{ t('emailForm.fields.subject') }}</span>
      <Input
        v-model="subject"
        type="text"
        :placeholder="t('emailForm.placeholders.subject')"
        class="border-0 shadow-none focus-visible:ring-0 px-0 h-8 min-h-8"
      />
    </div>

    <div class="flex items-center gap-3 py-1">
      <span class="w-14 text-sm text-muted-foreground shrink-0">{{ t('emailForm.fields.template') }}</span>
      <Select :model-value="selectedTemplate" @update:model-value="selectTemplate">
        <SelectTrigger class="h-8 min-h-8 w-full border-0 bg-transparent px-0 shadow-none">
          <SelectValue :placeholder="t('emailForm.placeholders.template')" />
        </SelectTrigger>
        <SelectContent align="start">
          <SelectItem v-for="template in templates" :key="template" :value="template">
            {{ template }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div class="py-2">
      <Textarea
        v-model="message"
        :placeholder="t('emailForm.placeholders.message')"
        class="min-h-48 border-0 shadow-none focus-visible:ring-0 px-0 resize-none"
      />
    </div>

    <div class="py-2">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div v-if="showAttachButton" class="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              type="button"
              class="rounded-sm gap-2"
              @click="openDeviceFilePicker"
            >
              <Paperclip class="w-4 h-4 shrink-0" aria-hidden="true" />
              {{ t('emailForm.attach.addButton') }}
            </Button>
            <input
              ref="deviceInputRef"
              type="file"
              multiple
              class="hidden"
              @change="onDeviceFilesSelected"
            />
          </div>
          <input
            v-else
            ref="deviceInputRef"
            type="file"
            multiple
            class="hidden"
            @change="onDeviceFilesSelected"
          />

          <div v-if="showActions" class="flex items-center justify-end gap-2">
            <Button variant="outline" type="button" class="rounded-sm" @click="$emit('cancel')">
              {{ t('emailForm.actions.cancel') }}
            </Button>
            <Button variant="default" type="button" class="rounded-sm" :disabled="!canSubmit()" @click="handleSend">
              {{ t('emailForm.actions.send') }}
            </Button>
          </div>
        </div>

        <p v-if="attachmentError" class="text-sm text-destructive mt-2">{{ attachmentError }}</p>
        <ul v-if="attachments.length" class="mt-3 space-y-2">
          <li
            v-for="(att, index) in attachments"
            :key="att.source === 'device' ? att.name + index : (att.id ?? att.fileName) + index"
            class="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground"
          >
            <span class="truncate min-w-0">{{ att.fileName || att.name }}</span>
            <button
              type="button"
              class="shrink-0 text-muted-foreground hover:text-foreground p-1"
              :aria-label="t('emailForm.attach.removeAria')"
              @click="removeAttachment(index)"
            >
              <X class="w-4 h-4" />
            </button>
          </li>
        </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { Paperclip, X } from 'lucide-vue-next'
import { fetchContactById } from '@/api/contacts'
import { fetchAccountById } from '@/api/accounts'
import { useUserStore } from '@/stores/user'
import {
  Button,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@motork/component-library/future/primitives'

const { t } = useI18n()

const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024

const props = defineProps({
  draft: {
    type: Object,
    default: null
  },
  showAttachButton: {
    type: Boolean,
    default: true
  },
  initialTo: {
    type: String,
    default: ''
  },
  initialFrom: {
    type: String,
    default: ''
  },
  initialCc: {
    type: String,
    default: ''
  },
  initialBcc: {
    type: String,
    default: ''
  },
  initialTemplate: {
    type: String,
    default: ''
  },
  initialMessage: {
    type: String,
    default: ''
  },
  showActions: {
    type: Boolean,
    default: true
  },
  recentAttachments: {
    type: Array,
    default: () => []
  },
  recipientCustomerId: {
    type: [Number, String],
    default: null
  }
})

const emit = defineEmits(['send', 'cancel', 'update:valid', 'update:draft'])

const userStore = useUserStore()
const { currentUser } = storeToRefs(userStore)

const selectedTemplate = ref(props.initialTemplate)
const from = ref('')
const to = ref('')
const cc = ref(props.initialCc)
const bcc = ref(props.initialBcc)
const showBcc = ref(false)
const subject = ref('')
const message = ref(props.initialMessage)
const attachments = ref([])
const attachmentError = ref('')
const deviceInputRef = ref(null)
const isTemplatePopoverOpen = ref(false)

let recipientEmailRequestId = 0

async function resolveRecipientEmail() {
  const direct = String(props.initialTo || '').trim()
  if (direct) return direct
  const cid = props.recipientCustomerId
  if (cid == null || cid === '') return ''
  try {
    const contact = await fetchContactById(cid)
    return contact?.email || ''
  } catch {
    try {
      const account = await fetchAccountById(cid)
      return account?.email || ''
    } catch {
      return ''
    }
  }
}

function applyDraftToLocal(nextDraft) {
  if (!nextDraft) return
  selectedTemplate.value = nextDraft.template ?? selectedTemplate.value
  from.value = nextDraft.from ?? from.value
  to.value = nextDraft.to ?? to.value
  cc.value = nextDraft.cc ?? cc.value
  bcc.value = nextDraft.bcc ?? bcc.value
  showBcc.value = !!nextDraft.showBcc
  subject.value = nextDraft.subject ?? subject.value
  message.value = nextDraft.message ?? message.value
  attachments.value = Array.isArray(nextDraft.attachments) ? [...nextDraft.attachments] : attachments.value
}

function buildDraftPayload() {
  return {
    template: selectedTemplate.value,
    from: from.value,
    to: to.value,
    cc: cc.value,
    bcc: bcc.value,
    showBcc: showBcc.value,
    subject: subject.value,
    message: message.value,
    attachments: [...attachments.value]
  }
}

const isSyncingFromParent = ref(false)
let lastEmittedDraftJson = ''

function emitDraftUpdate() {
  if (!props.draft) return
  if (isSyncingFromParent.value) return

  const payload = {
    ...(props.draft || {}),
    ...buildDraftPayload()
  }

  const json = JSON.stringify(payload)
  if (json === lastEmittedDraftJson) return
  lastEmittedDraftJson = json
  emit('update:draft', payload)
}

function syncComposerParticipants() {
  if (props.draft?.from) {
    from.value = String(props.draft.from || '').trim().replace(/@{2,}/g, '@')
    return
  }
  const nextFromRaw = String(props.initialFrom || '').trim() || currentUser.value?.email || ''
  from.value = String(nextFromRaw || '').trim().replace(/@{2,}/g, '@')
}

watch(
  () => [
    props.initialFrom,
    props.initialTo,
    props.recipientCustomerId,
    currentUser.value?.email
  ],
  async () => {
    syncComposerParticipants()
    if (props.draft?.to) {
      to.value = props.draft.to
      return
    }
    const req = ++recipientEmailRequestId
    const resolved = await resolveRecipientEmail()
    if (req !== recipientEmailRequestId) return
    to.value = resolved
  },
  { immediate: true }
)

watch(
  () => props.draft,
  (next) => {
    if (!next) return
    const incomingJson = JSON.stringify({ ...(next || {}), ...buildDraftPayload() })
    if (incomingJson === lastEmittedDraftJson) return

    isSyncingFromParent.value = true
    applyDraftToLocal(next)
    isSyncingFromParent.value = false
  },
  { immediate: true }
)

watch(
  [selectedTemplate, from, to, cc, bcc, showBcc, subject, message, attachments],
  () => {
    emitDraftUpdate()
  },
  { deep: true }
)

const templateContent = {
  'Follow-up': {
    subject: 'Following up on your inquiry',
    message: 'Hi! I wanted to follow up on our previous conversation. Are you still interested in moving forward? Let me know if you have any questions.'
  },
  'Meeting Confirmation': {
    subject: 'Meeting Confirmation',
    message: 'This is a confirmation for our meeting scheduled on [DATE] at [TIME]. Looking forward to speaking with you!'
  },
  'Quote Proposal': {
    subject: 'Your Quote Proposal',
    message: 'Thank you for your interest! I\'ve prepared a quote based on your requirements. Please find the details attached. Let me know if you have any questions.'
  },
  'Unable to Reach': {
    subject: 'Tried to reach you',
    message: 'I tried reaching you but wasn\'t able to connect. Please let me know a good time to call you back, or feel free to reach out at your convenience.'
  }
}

const templates = Object.keys(templateContent)

const onTemplateChange = (nextTemplate) => {
  if (typeof nextTemplate === 'string') selectedTemplate.value = nextTemplate
  const key = selectedTemplate.value
  if (key && templateContent[key]) {
    subject.value = templateContent[key].subject
    message.value = templateContent[key].message
  }
}

function selectTemplate(nextTemplate) {
  onTemplateChange(nextTemplate)
  isTemplatePopoverOpen.value = false
}

watch(selectedTemplate, (next) => {
  if (!next) return
  const payload = templateContent[next]
  if (!payload) return
  subject.value = payload.subject
  message.value = payload.message
})

function canSubmit() {
  return !!message.value.trim()
}

function totalAttachmentSize() {
  return attachments.value.reduce((sum, att) => {
    if (att.source === 'device' && att.file) return sum + (att.file.size || 0)
    return sum
  }, 0)
}

function openDeviceFilePicker() {
  deviceInputRef.value?.click()
}

function addDeviceFiles(fileList) {
  attachmentError.value = ''
  const files = Array.from(fileList || [])
  let sizeSoFar = totalAttachmentSize()
  for (const file of files) {
    if (sizeSoFar + file.size > MAX_ATTACHMENT_BYTES) {
      attachmentError.value = t('emailForm.attach.errorMaxSize')
      break
    }
    attachments.value.push({ source: 'device', file, name: file.name })
    sizeSoFar += file.size
  }
}

function onDeviceFilesSelected(event) {
  addDeviceFiles(event.target.files)
  event.target.value = ''
}

function removeAttachment(index) {
  attachments.value.splice(index, 1)
  attachmentError.value = ''
}

const handleSend = () => {
  if (!message.value.trim()) return
  if (totalAttachmentSize() > MAX_ATTACHMENT_BYTES) {
    attachmentError.value = t('emailForm.attach.errorMaxSize')
    return
  }
  emit('send', {
    type: 'email',
    template: selectedTemplate.value,
    from: from.value,
    to: to.value,
    cc: cc.value,
    bcc: bcc.value,
    subject: subject.value,
    message: message.value,
    attachments: [...attachments.value]
  })
}

watch(message, () => {
  emit('update:valid', canSubmit())
}, { immediate: true })

defineExpose({
  submit: handleSend,
  canSubmit,
  openDeviceFilePicker
})
</script>
