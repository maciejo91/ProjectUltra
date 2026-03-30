<template>
  <div
    v-if="message"
    class="flex gap-3 rounded-lg border border-border bg-primary/10 px-4 py-3"
  >
    <Sparkles class="size-5 shrink-0 text-primary mt-0.5" aria-hidden />
    <p class="text-sm text-foreground leading-relaxed min-w-0">{{ message }}</p>
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
