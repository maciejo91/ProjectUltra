<template>
  <div class="w-full flex flex-col">
    <div class="rounded-md border border-foreground/12 overflow-hidden bg-background">
      <div class="px-2 py-2">
        <Textarea
          v-model="message"
          :placeholder="notePlaceholderText"
          class="min-h-48 border-0 shadow-none focus-visible:ring-0 px-0 resize-none"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Textarea } from '@motork/component-library/future/primitives'

const props = defineProps({
  draft: { type: Object, default: null }
})

const emit = defineEmits(['update:valid', 'update:draft', 'save'])

const { t } = useI18n()
const notePlaceholderText = computed(() => t('common.notes.placeholder'))

const message = ref('')

function applyDraftToLocal(nextDraft) {
  if (!nextDraft) return
  message.value = nextDraft.message ?? nextDraft.content ?? message.value
}

function emitDraftUpdate() {
  if (!props.draft) return
  emit('update:draft', {
    ...(props.draft || {}),
    message: message.value,
    content: message.value
  })
}

watch(
  () => props.draft,
  (next) => {
    if (!next) return
    applyDraftToLocal(next)
  },
  { immediate: true, deep: true }
)

watch(message, () => emitDraftUpdate())

const canSubmit = computed(() => !!message.value.trim())

watch(
  canSubmit,
  (v) => emit('update:valid', v),
  { immediate: true }
)

function submit() {
  if (!canSubmit.value) return
  emit('save', {
    type: 'note',
    content: message.value,
    message: message.value
  })
}

defineExpose({
  submit,
  canSubmit: () => canSubmit.value
})
</script>

