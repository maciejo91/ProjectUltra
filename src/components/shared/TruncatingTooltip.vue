<template>
  <Tooltip v-if="isTruncated">
    <TooltipTrigger as-child>
      <div ref="measureRef" :class="wrapperClass">
        <slot />
      </div>
    </TooltipTrigger>
    <TooltipContent
      :side="side"
      :align="align"
      :class="mergedContentClass"
    >
      <p class="text-balance text-sm leading-normal text-foreground">
        {{ text }}
      </p>
    </TooltipContent>
  </Tooltip>
  <div v-else ref="measureRef" :class="wrapperClass">
    <slot />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Tooltip, TooltipContent, TooltipTrigger } from '@motork/component-library/future/primitives'
import { useTextTruncation } from '@/composables/useTextTruncation.js'

const props = defineProps({
  text: { type: String, required: true },
  side: { type: String, default: 'top' },
  align: { type: String, default: 'start' },
  /** Classes on the measurement wrapper (must allow shrink + bounded width in flex layouts). */
  wrapperClass: { type: String, default: 'min-w-0 max-w-full' },
  /** Extra classes merged onto TooltipContent (Motork tokens). */
  contentClass: { type: String, default: '' },
})

const measureRef = ref(null)
const { isTruncated } = useTextTruncation(measureRef, () => props.text)

const mergedContentClass = computed(() =>
  [
    'max-w-sm rounded-md border border-border bg-background p-3 text-sm text-foreground shadow-md',
    props.contentClass,
  ]
    .filter(Boolean)
    .join(' '),
)
</script>
