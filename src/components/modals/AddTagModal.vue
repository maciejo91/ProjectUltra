<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent
        class="dialog-natural-height w-full sm:max-w-lg"
        :show-close-button="true"
      >
        <DialogHeader>
          <DialogTitle>{{ modalTitle }}</DialogTitle>
        </DialogHeader>

        <div class="grid gap-4">
          <div class="grid gap-2">
            <Label class="text-sm font-semibold text-foreground">{{ t('requestDetail.addTagModal.tagName') }}</Label>
            <Input
              v-model="tagName"
              type="text"
              :placeholder="t('requestDetail.addTagModal.tagNamePlaceholder')"
              class="w-full h-10"
              @keyup.enter="handleSave"
            />
          </div>

          <div class="grid gap-2">
            <Label class="text-sm font-semibold text-foreground">{{ t('requestDetail.addTagModal.colour') }}</Label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="color in TAG_COLORS"
                :key="color"
                type="button"
                class="w-9 h-9 rounded-full p-0 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 overflow-hidden"
                :class="selectedColor === color ? 'border border-primary p-px bg-transparent' : 'border-2 border-border hover:border-muted-foreground/50'"
                :aria-pressed="selectedColor === color"
                @click="selectedColor = color"
              >
                <span
                  class="block w-full h-full rounded-full"
                  :style="{ backgroundColor: color }"
                />
              </button>
            </div>
          </div>
        </div>

        <DialogFooter class="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <Button
            variant="outline"
            class="rounded-sm w-full sm:w-auto"
            @click="$emit('close')"
          >
            {{ t('requestDetail.addTagModal.cancel') }}
          </Button>
          <Button
            variant="default"
            class="rounded-sm w-full sm:w-auto"
            :disabled="!tagName.trim() || !selectedColor"
            @click="handleSave"
          >
            {{ t('requestDetail.addTagModal.save') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Button,
  Input,
  Label
} from '@motork/component-library/future/primitives'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle
} from '@motork/component-library/future/primitives'

const { t } = useI18n()

// Light/pastel versions of the tag palette (same hues, higher lightness)
const TAG_COLORS = [
  '#fecaca', // red
  '#fed7aa', // orange
  '#fef08a', // yellow
  '#bbf7d0', // green
  '#a5f3fc', // cyan
  '#bfdbfe', // blue
  '#ddd6fe', // violet
  '#fbcfe8'  // pink
]

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  existingTags: {
    type: Array,
    default: () => []
  },
  editTag: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'add', 'update'])

const tagName = ref('')
const selectedColor = ref('')
const originalEditName = ref('')

const modalTitle = computed(() =>
  props.editTag?.name
    ? t('requestDetail.addTagModal.editTitle')
    : t('requestDetail.addTagModal.title')
)

const handleOpenChange = (isOpen) => {
  if (!isOpen) {
    emit('close')
  }
}

function resetForm() {
  tagName.value = ''
  selectedColor.value = TAG_COLORS[0]
  originalEditName.value = ''
}

watch(
  () => [props.show, props.editTag],
  () => {
    if (!props.show) {
      resetForm()
      return
    }
    if (props.editTag?.name) {
      tagName.value = props.editTag.name
      selectedColor.value =
        props.editTag.color && String(props.editTag.color).trim()
          ? props.editTag.color
          : TAG_COLORS[0]
      originalEditName.value = props.editTag.name
    } else {
      tagName.value = ''
      selectedColor.value = TAG_COLORS[0]
      originalEditName.value = ''
    }
  },
  { flush: 'post' }
)

const handleSave = () => {
  const name = tagName.value.trim()
  if (!name || !selectedColor.value) return
  const existing = (props.existingTags || []).map((t) => (typeof t === 'string' ? t : t.name))
  if (originalEditName.value) {
    if (name !== originalEditName.value && existing.includes(name)) return
    emit('update', {
      previousName: originalEditName.value,
      name,
      color: selectedColor.value
    })
  } else {
    if (existing.includes(name)) return
    emit('add', { name, color: selectedColor.value })
  }
  emit('close')
  resetForm()
}
</script>
