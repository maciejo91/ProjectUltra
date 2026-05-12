<template>
  <div class="relative shrink-0" :class="widthClass">
    <div
      class="flex h-8 items-center rounded-lg border px-2.5 py-1 pl-7"
      :class="muted ? 'border-border bg-muted' : 'border-input bg-background'"
    >
      <span
        class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
      >
        €
      </span>
      <Input
        :model-value="modelValue"
        type="number"
        step="any"
        min="0"
        :disabled="disabled"
        :class="inputTextClass"
        class="h-7 min-w-0 flex-1 border-0 bg-transparent p-0 text-right text-sm shadow-none focus-visible:ring-0"
        @update:model-value="emit('update:modelValue', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Input } from '@motork/component-library/future/primitives'

const props = defineProps({
  modelValue: { type: [Number, String], default: '' },
  widthClass: { type: String, default: 'w-32' },
  disabled: { type: Boolean, default: false },
  /** Read-only appearance (muted + border) */
  muted: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const inputTextClass = computed(() =>
  props.muted ? 'text-muted-foreground' : 'text-foreground'
)
</script>
