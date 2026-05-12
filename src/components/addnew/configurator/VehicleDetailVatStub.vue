<template>
  <div
    class="flex h-8 w-40 shrink-0 items-center justify-between gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm text-foreground"
    role="presentation"
  >
    <span class="min-w-0 truncate">{{ label }}</span>
    <ChevronDown class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
  </div>
</template>

<script setup>
import { ChevronDown } from 'lucide-vue-next'

defineProps({
  label: { type: String, required: true },
})
</script>
