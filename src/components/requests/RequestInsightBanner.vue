<template>
  <div
    v-if="message"
    class="mk-ai-insight-banner flex w-full items-start gap-4 rounded-lg px-4 py-3"
  >
    <Sparkles
      :size="24"
      class="mk-sparkles-icon shrink-0 opacity-80"
      aria-hidden
      fill="url(#sparkles-gradient)"
    />
    <p
      class="min-w-0 flex-1 text-sm font-medium leading-relaxed text-foreground whitespace-pre-line"
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
  }
})
</script>
