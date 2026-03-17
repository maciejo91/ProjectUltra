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
      <Label class="form-label">Attach File</Label>
      <p class="text-sm text-muted-foreground">
        You can select files from LeadSparK negotiations and from your local device. (max size: 25 MB)
      </p>
      <div class="flex flex-wrap gap-2">
        <Button
          variant="outline"
          class="rounded-sm"
          @click="showLeadSparKModal = true"
        >
          From LeadSparK
        </Button>
        <Button
          variant="outline"
          class="rounded-sm"
          @click="deviceInputRef?.click()"
        >
          From device
        </Button>
        <input
          ref="deviceInputRef"
          type="file"
          multiple
          class="hidden"
          @change="onDeviceFilesSelected"
        />
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
            aria-label="Remove attachment"
            @click="removeAttachment(index)"
          >
            <X class="w-4 h-4" />
          </button>
        </li>
      </ul>
    </div>

    <SelectFromLeadSparKModal
      :show="showLeadSparKModal"
      :recent-attachments="recentAttachments"
      @close="showLeadSparKModal = false"
      @select="onLeadSparKSelected"
    />

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
import { ref, watch } from 'vue'
import { X } from 'lucide-vue-next'
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
import SelectFromLeadSparKModal from '@/components/modals/SelectFromLeadSparKModal.vue'

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
const showLeadSparKModal = ref(false)
const deviceInputRef = ref(null)

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

function onDeviceFilesSelected(event) {
  attachmentError.value = ''
  const files = Array.from(event.target.files || [])
  let sizeSoFar = totalAttachmentSize()
  for (const file of files) {
    if (sizeSoFar + file.size > MAX_ATTACHMENT_BYTES) {
      attachmentError.value = 'Total attachment size must not exceed 25 MB.'
      break
    }
    attachments.value.push({ source: 'device', file, name: file.name })
    sizeSoFar += file.size
  }
  event.target.value = ''
}

function onLeadSparKSelected(selected) {
  for (const item of selected) {
    const id = item.id ?? item.fileName
    const fileName = item.fileName || item.content?.replace(/^Attachment: /, '') || 'File'
    if (!attachments.value.some((a) => a.source === 'leadspark' && (a.id ?? a.fileName) === id)) {
      attachments.value.push({ source: 'leadspark', id, fileName })
    }
  }
  showLeadSparKModal.value = false
}

function removeAttachment(index) {
  attachments.value.splice(index, 1)
  attachmentError.value = ''
}

const handleSend = () => {
  if (!message.value.trim()) return
  if (totalAttachmentSize() > MAX_ATTACHMENT_BYTES) {
    attachmentError.value = 'Total attachment size must not exceed 25 MB.'
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
