<template>
  <div class="mk-attempts-progress shrink-0" role="img" :aria-label="ariaLabel">
    <svg
      class="mk-attempts-progress-ring size-8 -rotate-90"
      viewBox="0 0 32 32"
      aria-hidden="true"
    >
      <circle
        class="mk-attempts-progress-track"
        cx="16"
        cy="16"
        r="12"
        fill="none"
        stroke-width="2.5"
      />
      <circle
        class="mk-attempts-progress-fill"
        cx="16"
        cy="16"
        r="12"
        fill="none"
        stroke-width="2.5"
        :stroke-dasharray="RING_CIRCUMFERENCE"
        :stroke-dashoffset="dashOffset"
      />
    </svg>
    <span class="mk-attempts-progress-text text-xs font-medium text-foreground">
      {{ attempts }}/{{ maxDisplay }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const RING_CIRCUMFERENCE = 2 * Math.PI * 12

const props = defineProps({
  attempts: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 5
  },
  ariaLabel: {
    type: String,
    required: true
  }
})

const maxDisplay = computed(() => (props.max > 0 ? props.max : 5))

const dashOffset = computed(() => {
  const max = maxDisplay.value
  const n = props.attempts
  return max > 0 ? RING_CIRCUMFERENCE * (1 - n / max) : RING_CIRCUMFERENCE
})
</script>
