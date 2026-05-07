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
  },
  surface: {
    type: String,
    default: 'muted' // 'muted' | 'background'
  },
  showAccent: {
    type: Boolean,
    default: true
  }
})

const cardClass = computed(() => {
  const base = `rounded-lg border border-border py-3.5 pl-4 pr-3.5 border-solid${
    props.showAccent ? ' border-l-4' : ''
  }`

  const accents = {
    note: 'border-l-amber-500',
    message: 'border-l-green-500',
    messageGreen: 'border-l-green-500',
    email: 'border-l-purple-500',
    call: 'border-l-blue-600',
    ai: 'border-l-purple-500',
    appointment: 'border-l-purple-500',
    default: 'border-l-muted-foreground/35'
  }

  const noteSurface = props.accent === 'note' ? 'bg-amber-50 border-transparent' : ''
  const bg = props.surface === 'background' ? 'bg-background' : 'bg-muted'
  const accentClass = props.showAccent ? accents[props.accent] || accents.default : ''
  return `${base} ${noteSurface || bg} ${accentClass}`.trim()
})
</script>
