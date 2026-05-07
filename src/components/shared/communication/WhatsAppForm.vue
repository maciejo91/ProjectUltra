<template>
  <div class="space-y-6">
    <!-- Template Selection -->
    <div class="space-y-2">
      <Label class="form-label">Template</Label>
      <Select :model-value="selectedTemplate" @update:model-value="selectTemplate">
        <SelectTrigger class="w-full">
          <SelectValue placeholder="Select a template..." />
        </SelectTrigger>
        <SelectContent align="start">
          <SelectItem v-for="template in templates" :key="template" :value="template">
            {{ template }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Message -->
    <div class="space-y-2">
      <Label class="form-label">Message</Label>
      <Textarea
        v-model="message"
        rows="6"
        placeholder="Type your WhatsApp message here..."
        class="w-full"
      />
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
import { ref, watch } from 'vue'
import {
  Button,
  Textarea,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@motork/component-library/future/primitives'

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
  }
})

const emit = defineEmits(['send', 'cancel', 'update:valid'])

const selectedTemplate = ref(props.initialTemplate)
const message = ref(props.initialMessage)

const templateContent = {
  'Follow-up': 'Hi! I wanted to follow up on our previous conversation. Are you still interested in moving forward? Let me know if you have any questions.',
  'Meeting Confirmation': 'This is a confirmation for our meeting scheduled on [DATE] at [TIME]. Looking forward to speaking with you!',
  'Quote Proposal': 'Thank you for your interest! I\'ve prepared a quote based on your requirements. Please find the details attached. Let me know if you have any questions.',
  'Unable to Reach': 'I tried reaching you but wasn\'t able to connect. Please let me know a good time to call you back, or feel free to reach out at your convenience.'
}

const templates = Object.keys(templateContent)

const onTemplateChange = (nextTemplate) => {
  if (typeof nextTemplate === 'string') selectedTemplate.value = nextTemplate
  const key = selectedTemplate.value
  if (key && templateContent[key]) {
    message.value = templateContent[key]
  }
}

watch(selectedTemplate, (next) => {
  if (!next) return
  const content = templateContent[next]
  if (content) message.value = content
})

function selectTemplate(nextTemplate) {
  onTemplateChange(nextTemplate)
}

function canSubmit() {
  return !!message.value.trim()
}

const handleSend = () => {
  if (!message.value.trim()) return
  emit('send', {
    type: 'whatsapp',
    template: selectedTemplate.value,
    message: message.value
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
