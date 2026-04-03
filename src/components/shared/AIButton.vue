<template>
  <button
    :class="[
      'mk-ai-mode-active flex items-center gap-2 rounded-lg',
      (disabled || loading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      size === 'small' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2 text-sm'
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <Spinner
      v-if="loading"
      :class="size === 'small' ? 'size-3.5 shrink-0' : 'size-4 shrink-0'"
      class="text-current"
    />
    <Sparkles
      v-else
      :size="size === 'small' ? 14 : 16"
      class="mk-sparkles-icon shrink-0"
      fill="url(#sparkles-gradient)"
      stroke="none"
    />
    <span>{{ label }}</span>
  </button>
</template>

<script setup>
import { Sparkles } from 'lucide-vue-next'
import { Spinner } from '@motork/component-library/future/primitives'

defineProps({
  label: {
    type: String,
    required: true
  },
  size: {
    type: String,
    default: 'medium',
    validator: (val) => ['small', 'medium'].includes(val)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])
</script>
