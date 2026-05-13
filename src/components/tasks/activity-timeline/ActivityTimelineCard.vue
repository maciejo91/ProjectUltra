<template>
  <div :class="[shellBaseClass, attrs.class]" v-bind="passthroughAttrs">
    <span
      v-if="showAccent"
      class="w-1 shrink-0 self-stretch"
      :class="accentBarClass"
      aria-hidden="true"
    />
    <div :class="['min-w-0 flex-1', innerPaddingClass]">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed, useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  accent: {
    type: String,
    default: 'default'
  },
  surface: {
    type: String,
    default: 'muted'
  },
  showAccent: {
    type: Boolean,
    default: true
  },
  innerPaddingClass: {
    type: String,
    default: 'py-3.5 pr-3.5 pl-4'
  }
})

const attrs = useAttrs()

const passthroughAttrs = computed(() => {
  const { class: _c, ...rest } = attrs
  return rest
})

const accents = {
  note: 'bg-amber-500',
  message: 'bg-green-500',
  messageGreen: 'bg-green-500',
  sms: 'bg-slate-600',
  email: 'bg-purple-500',
  call: 'bg-blue-600',
  ai: 'bg-purple-500',
  appointment: 'bg-purple-500',
  default: 'bg-muted-foreground/35'
}

const shellBaseClass = computed(() => {
  const layout =
    'flex min-w-0 overflow-hidden rounded-lg border border-solid border-border'
  if (props.accent === 'note') {
    return `${layout} border-foreground/20 bg-background`
  }
  const bg = props.surface === 'background' ? 'bg-background' : 'bg-muted'
  return `${layout} ${bg}`
})

const accentBarClass = computed(() =>
  props.showAccent ? accents[props.accent] || accents.default : ''
)
</script>
