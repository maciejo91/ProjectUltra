<template>
  <div class="w-full flex flex-col divide-y divide-border">
    <div class="flex items-center gap-3 py-1">
      <span class="w-14 text-sm text-muted-foreground shrink-0">{{ t('emailForm.fields.from') }}</span>
      <Input
        v-model="from"
        type="tel"
        :placeholder="t('common.actions.smsFromPlaceholder')"
        class="border-0 shadow-none focus-visible:ring-0 px-0 h-8 min-h-8"
      />
    </div>

    <div class="flex items-center gap-3 py-1">
      <span class="w-14 text-sm text-muted-foreground shrink-0">{{ t('emailForm.fields.to') }}</span>
      <Input
        v-model="to"
        type="tel"
        :placeholder="t('common.actions.smsToPlaceholder')"
        class="border-0 shadow-none focus-visible:ring-0 px-0 h-8 min-h-8"
      />
    </div>

    <div class="flex items-center gap-3 py-1">
      <span class="w-14 text-sm text-muted-foreground shrink-0">{{ t('common.actions.template') }}</span>
      <Select :model-value="selectedTemplate" @update:model-value="selectTemplate">
        <SelectTrigger class="h-8 min-h-8 w-full border-0 bg-transparent px-0 shadow-none">
          <SelectValue :placeholder="t('common.actions.selectTemplate')" />
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
        :placeholder="t('common.actions.typeSms')"
        maxlength="160"
        class="min-h-48 border-0 shadow-none focus-visible:ring-0 px-0 resize-none"
      />
      <p v-if="showCounter" class="text-sm text-muted-foreground mt-2">
        {{ t('common.actions.smsCharacters', { count: message.length }) }}
      </p>
    </div>

    <div v-if="showActions" class="py-2">
      <div class="flex items-center justify-end gap-2">
        <Button variant="outline" type="button" class="rounded-sm" @click="$emit('cancel')">
          {{ t('common.buttons.cancel') }}
        </Button>
        <Button
          variant="default"
          type="button"
          class="rounded-sm"
          :disabled="!canSubmit()"
          @click="handleSend"
        >
          {{ t('common.actions.send') }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
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

const props = defineProps({
  draft: {
    type: Object,
    default: null
  },
  initialFrom: {
    type: String,
    default: ''
  },
  initialTo: {
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
  showCounter: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['send', 'cancel', 'update:valid', 'update:draft'])

const from = ref(props.draft?.from ?? props.initialFrom)
const to = ref(props.draft?.to ?? props.initialTo)
const selectedTemplate = ref(props.draft?.template ?? props.initialTemplate)
const message = ref(props.draft?.message ?? props.initialMessage)
const isTemplatePopoverOpen = ref(false)

const templateContent = {
  'Follow-up': 'Hi! Following up on our conversation. Still interested? Let me know if you have questions.',
  'Meeting Confirmation': 'Confirming our meeting on [DATE] at [TIME]. Looking forward to it!',
  'Quote Proposal': 'Your quote is ready! I\'ll send you the details. Questions? Just ask.',
  'Unable to Reach': 'Tried to reach you. When\'s a good time to call back?'
}

const templates = Object.keys(templateContent)

function buildDraftPayload() {
  return {
    from: from.value,
    to: to.value,
    template: selectedTemplate.value,
    message: message.value
  }
}

const isSyncingFromParent = ref(false)
let lastEmittedDraftJson = ''

function emitDraftUpdate() {
  if (!props.draft) return
  if (isSyncingFromParent.value) return

  const payload = { ...(props.draft || {}), ...buildDraftPayload() }
  const json = JSON.stringify(payload)
  if (json === lastEmittedDraftJson) return
  lastEmittedDraftJson = json
  emit('update:draft', payload)
}

const onTemplateChange = (nextTemplate) => {
  if (typeof nextTemplate === 'string') selectedTemplate.value = nextTemplate
  const key = selectedTemplate.value
  const content = key ? templateContent[key] : null
  if (content) message.value = content
}

watch(selectedTemplate, (next) => {
  if (!next) return
  const content = templateContent[next]
  if (content) message.value = content
})

function selectTemplate(nextTemplate) {
  onTemplateChange(nextTemplate)
  isTemplatePopoverOpen.value = false
}

watch(
  () => props.draft,
  (next) => {
    if (!next) return
    isSyncingFromParent.value = true
    const incomingJson = JSON.stringify({ ...(next || {}), ...buildDraftPayload() })
    if (incomingJson === lastEmittedDraftJson) {
      isSyncingFromParent.value = false
      return
    }
    if (typeof next.from === 'string') from.value = next.from
    if (typeof next.to === 'string') to.value = next.to
    if (typeof next.template === 'string') selectedTemplate.value = next.template
    if (typeof next.message === 'string') message.value = next.message
    isSyncingFromParent.value = false
  },
  { immediate: true }
)

watch([from, to, selectedTemplate, message], () => {
  emitDraftUpdate()
})

function canSubmit() {
  return !!message.value.trim()
}

const handleSend = () => {
  if (!message.value.trim()) return
  emit('send', {
    type: 'sms',
    from: from.value,
    to: to.value,
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
