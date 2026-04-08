<template>
  <div
    v-if="message"
    :class="[
      'mk-ai-insight-banner flex w-full items-start rounded-lg',
      compact ? 'gap-2 px-3 py-2' : 'gap-4 px-4 py-3'
    ]"
  >
    <Sparkles
      :size="compact ? 20 : 24"
      class="mk-sparkles-icon shrink-0 opacity-80"
      aria-hidden
      fill="url(#sparkles-gradient)"
    />
    <p
      :class="[
        'min-w-0 flex-1 text-sm font-medium text-foreground whitespace-pre-line',
        compact ? 'leading-snug' : 'leading-relaxed'
      ]"
    >
      {{ message }}
    </p>
  </div>
</template>

<script setup>
import { Sparkles } from 'lucide-vue-next'

defineProps({
  message: {
    type: String,
    default: ''
  },
  compact: {
    type: Boolean,
    default: false
  }
})
</script>
