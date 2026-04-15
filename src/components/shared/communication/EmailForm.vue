<template>
  <div class="space-y-6">
    <!-- Template Selection -->
    <div class="space-y-2">
      <Label class="form-label">Template</Label>
      <Select v-model="selectedTemplate" @update:model-value="onTemplateChange">
        <SelectTrigger class="w-full h-10">
          <SelectValue placeholder="Select a template..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Follow-up">Follow-up</SelectItem>
          <SelectItem value="Meeting Confirmation">Meeting Confirmation</SelectItem>
          <SelectItem value="Quote Proposal">Quote Proposal</SelectItem>
          <SelectItem value="Unable to Reach">Unable to Reach</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Subject Line -->
    <div class="space-y-2">
      <Label class="form-label">Subject</Label>
      <Input
        v-model="subject"
        type="text"
        placeholder="Email subject..."
        class="w-full"
      />
    </div>

    <!-- Message -->
    <div class="space-y-2">
      <Label class="form-label">Message</Label>
      <Textarea
        v-model="message"
        rows="6"
        placeholder="Type your message here..."
        class="w-full"
      />
    </div>

    <!-- Attach File -->
    <div class="space-y-3">
      <Label class="form-label">{{ t('emailForm.attach.label') }}</Label>
      <div
        class="rounded-lg border border-dashed flex flex-col items-center justify-center gap-3 min-h-32 p-6 transition-colors"
        :class="
          isFileDragActive
            ? 'border-primary bg-primary/5'
            : 'border-border bg-muted/30'
        "
        @dragenter="onAttachDragEnter"
        @dragleave="onAttachDragLeave"
        @dragover.prevent="onAttachDragOver"
        @drop.prevent="onAttachDrop"
      >
        <div class="flex flex-col items-center gap-3 text-center w-full">
          <Button
            variant="outline"
            type="button"
            class="rounded-sm"
            @click="openDeviceFilePicker"
          >
            {{ t('emailForm.attach.browseOrDrop') }}
          </Button>
          <p class="text-sm text-muted-foreground">
            {{ t('emailForm.attach.hint') }}
          </p>
        </div>
        <input
          ref="deviceInputRef"
          type="file"
          multiple
          class="hidden"
          @change="onDeviceFilesSelected"
        />
      </div>

      <div class="space-y-2">
        <p class="text-sm font-medium text-foreground">
          {{ t('emailForm.attach.availableTitle') }}
        </p>
        <ul v-if="availableAttachmentsPreview.length" class="space-y-2">
          <li
            v-for="(item, idx) in availableAttachmentsPreview"
            :key="item.id || item.fileName || idx"
            class="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground"
          >
            <FileText class="w-4 h-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span class="truncate min-w-0">{{ attachmentDisplayName(item) }}</span>
          </li>
        </ul>
        <p v-else class="text-sm text-muted-foreground">
          {{ t('emailForm.attach.availableEmpty') }}
        </p>
      </div>

      <p v-if="attachmentError" class="text-sm text-destructive">{{ attachmentError }}</p>
      <ul v-if="attachments.length" class="space-y-2">
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

    <div v-if="showActions" class="flex justify-end gap-2">
      <Button variant="secondary" @click="$emit('cancel')">
        Cancel
      </Button>
      <Button
        variant="primary"
        :disabled="!canSubmit()"
        @click="handleSend"
      >
        Send
      </Button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { FileText, X } from 'lucide-vue-next'
import {
  Button,
  Input,
  Textarea,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@motork/component-library/future/primitives'

const { t } = useI18n()

const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024

const props = defineProps({
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
  }
})

const emit = defineEmits(['send', 'cancel', 'update:valid'])

const selectedTemplate = ref(props.initialTemplate)
const subject = ref('')
const message = ref(props.initialMessage)
const attachments = ref([])
const attachmentError = ref('')
const deviceInputRef = ref(null)
const isFileDragActive = ref(false)

const availableAttachmentsPreview = computed(() =>
  props.recentAttachments.slice(0, 3)
)

function attachmentDisplayName(item) {
  return item.fileName || item.content?.replace(/^Attachment: /, '') || t('emailForm.attach.fileFallback')
}

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

const onTemplateChange = () => {
  if (selectedTemplate.value && templateContent[selectedTemplate.value]) {
    subject.value = templateContent[selectedTemplate.value].subject
    message.value = templateContent[selectedTemplate.value].message
  }
}

function canSubmit() {
  return !!message.value.trim()
}

function totalAttachmentSize() {
  return attachments.value.reduce((sum, att) => {
    if (att.source === 'device' && att.file) return sum + (att.file.size || 0)
    return sum
  }, 0)
}

function resetAttachDragState() {
  isFileDragActive.value = false
}

function onAttachDragEnter(event) {
  event.preventDefault()
  if (!event.dataTransfer?.types?.includes('Files')) return
  isFileDragActive.value = true
}

function onAttachDragLeave(event) {
  const next = event.relatedTarget
  if (next && event.currentTarget.contains(next)) return
  isFileDragActive.value = false
}

function onAttachDragOver(event) {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
  }
}

function onAttachDrop(event) {
  event.preventDefault()
  resetAttachDragState()
  const files = event.dataTransfer?.files
  if (files?.length) {
    addDeviceFiles(files)
  }
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
  canSubmit
})
</script>
