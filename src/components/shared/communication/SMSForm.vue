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

    <!-- Message -->
    <div class="space-y-2">
      <Label class="form-label">Message</Label>
      <Textarea
        v-model="message"
        rows="5"
        placeholder="Type your SMS message here..."
        maxlength="160"
        class="w-full"
      />
      <p class="text-xs text-muted-foreground mt-1">{{ message.length }}/160 characters</p>
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
const message = ref(props.initialMessage)

const templateContent = {
  'Follow-up': 'Hi! Following up on our conversation. Still interested? Let me know if you have questions.',
  'Meeting Confirmation': 'Confirming our meeting on [DATE] at [TIME]. Looking forward to it!',
  'Quote Proposal': 'Your quote is ready! I\'ll send you the details. Questions? Just ask.',
  'Unable to Reach': 'Tried to reach you. When\'s a good time to call back?'
}

const onTemplateChange = () => {
  if (selectedTemplate.value && templateContent[selectedTemplate.value]) {
    message.value = templateContent[selectedTemplate.value]
  }
}

function canSubmit() {
  return !!message.value.trim()
}

const handleSend = () => {
  if (!message.value.trim()) return
  emit('send', {
    type: 'sms',
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
