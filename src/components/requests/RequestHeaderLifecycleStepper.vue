<template>
  <div
    class="inline-flex items-center gap-2 px-0 text-sm font-medium text-foreground"
    aria-hidden="true"
  >
    <template v-for="(step, index) in steps" :key="step.key">
      <span v-if="index > 0" class="text-muted-foreground tabular-nums" aria-hidden>-</span>
      <span class="inline-flex items-center gap-1.5 shrink-0">
        <span
          v-if="step.state === 'complete'"
          class="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-muted-foreground text-background"
          aria-hidden="true"
        >
          <Check class="size-2.5 stroke-3" />
        </span>
        <span
          v-else-if="step.state === 'current'"
          class="relative size-4 shrink-0 overflow-hidden rounded-full border-2 border-primary bg-background"
          aria-hidden="true"
        >
          <span class="absolute inset-y-0 left-0 w-1/2 bg-primary" />
        </span>
        <span
          v-else
          class="inline-flex size-4 shrink-0 rounded-full border-2 border-muted-foreground/35 bg-transparent"
          aria-hidden="true"
        />
        <span
          :class="step.state === 'upcoming' ? 'text-muted-foreground' : 'text-foreground'"
        >
          {{ step.label }}
        </span>
      </span>
    </template>
  </div>
</template>

<script setup>
import { Check } from 'lucide-vue-next'

defineProps({
  steps: {
    type: Array,
    required: true
  }
})
</script>
