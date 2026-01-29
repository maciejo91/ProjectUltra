<template>
  <div class="space-y-6">
    <!-- Template Selection -->
    <div class="space-y-2">
      <Label class="block text-sm font-semibold text-foreground">Template</Label>
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
      <Label class="block text-sm font-semibold text-foreground">Subject</Label>
      <Input 
        v-model="subject"
        type="text"
        placeholder="Email subject..."
        class="w-full h-10"
      />
    </div>

    <!-- Message -->
    <div class="space-y-2">
      <Label class="block text-sm font-semibold text-foreground">Message</Label>
      <Textarea 
        v-model="message"
        rows="6"
        placeholder="Type your message here..."
        class="w-full min-h-[150px] resize-none"
      />
    </div>

    <div v-if="showActions" class="flex justify-end gap-3">
      <Button
        variant="outline"
        size="small"
        class="rounded-sm"
        @click="$emit('cancel')"
      >
        Cancel
      </Button>
      <Button
        variant="default"
        size="small"
        class="rounded-sm"
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
  Input,
  Textarea,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
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
const subject = ref('')
const message = ref(props.initialMessage)

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

const handleSend = () => {
  if (!message.value.trim()) return
  emit('send', {
    type: 'email',
    template: selectedTemplate.value,
    subject: subject.value,
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
