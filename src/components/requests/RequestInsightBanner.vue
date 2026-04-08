<template>
  <div
    v-if="message"
    :class="[
      'mk-ai-insight-banner flex w-full items-start rounded-lg',
      compact ? 'gap-2 px-3 py-2' : 'gap-4 px-4 py-3'
    ]"
  >
    <span
      :class="[
        'inline-flex shrink-0 origin-center',
        animated && 'mk-sparkles-icon-wrap',
        animated && (generating ? 'mk-sparkles-icon-wrap--generating' : 'mk-sparkles-icon-wrap--ambient'),
      ]"
      aria-hidden
    >
      <Sparkles
        :size="compact ? 20 : 24"
        :class="['mk-sparkles-icon shrink-0', !animated && 'opacity-80']"
        fill="url(#sparkles-gradient)"
      />
    </span>
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
  },
  animated: {
    type: Boolean,
    default: true
  },
  generating: {
    type: Boolean,
    default: false
  }
})
</script>
