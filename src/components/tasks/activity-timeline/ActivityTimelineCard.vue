<template>
  <div :class="cardClass">
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  accent: {
    type: String,
    default: 'default'
  }
})

const cardClass = computed(() => {
  const base =
    'rounded-lg border border-border bg-[#F6F7FA] py-3.5 pl-4 pr-3.5 border-l-4 border-solid'
  const accents = {
    note: 'border-l-orange-500',
    message: 'border-l-blue-500',
    messageGreen: 'border-l-green-500',
    call: 'border-l-green-600',
    ai: 'border-l-purple-500',
    appointment: 'border-l-purple-500',
    default: 'border-l-muted-foreground/35'
  }
  const left = accents[props.accent] || accents.default
  return `${base} ${left}`
})
</script>
