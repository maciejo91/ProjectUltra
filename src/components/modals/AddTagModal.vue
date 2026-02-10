<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent
        class="dialog-natural-height w-full sm:max-w-md"
        :show-close-button="true"
      >
        <DialogHeader>
          <DialogTitle>Add tag</DialogTitle>
        </DialogHeader>

        <div class="grid gap-4">
          <div class="grid gap-2">
            <Label class="text-sm font-semibold text-foreground">Tag name</Label>
            <Input
              v-model="tagName"
              type="text"
              placeholder="Tag name"
              class="w-full h-10"
              @keyup.enter="handleSave"
            />
          </div>

          <div class="grid gap-2">
            <Label class="text-sm font-semibold text-foreground">Colour</Label>
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
            Cancel
          </Button>
          <Button
            variant="default"
            class="rounded-sm w-full sm:w-auto"
            :disabled="!tagName.trim() || !selectedColor"
            @click="handleSave"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
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

const TAG_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899'
]

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  existingTags: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'add'])

const tagName = ref('')
const selectedColor = ref('')

const handleOpenChange = (isOpen) => {
  if (!isOpen) {
    emit('close')
  }
}

watch(() => props.show, (newValue) => {
  if (newValue) {
    tagName.value = ''
    selectedColor.value = TAG_COLORS[0]
  }
})

const handleSave = () => {
  const name = tagName.value.trim()
  if (!name || !selectedColor.value) return
  const existing = (props.existingTags || []).map((t) => (typeof t === 'string' ? t : t.name))
  if (existing.includes(name)) return
  emit('add', { name, color: selectedColor.value })
  emit('close')
  tagName.value = ''
  selectedColor.value = TAG_COLORS[0]
}
</script>
