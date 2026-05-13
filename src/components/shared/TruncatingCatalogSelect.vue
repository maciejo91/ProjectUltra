<template>
  <Select
    :class="selectClass"
    :model-value="modelValue"
    :disabled="disabled"
    @update:model-value="(v) => emit('update:modelValue', v)"
  >
    <Tooltip v-if="isTruncated">
      <TooltipTrigger as-child>
        <SelectTrigger :class="triggerClass">
          <SelectValue class="sr-only" />
          <span ref="measureRef" class="min-w-0 flex-1 truncate text-left text-sm text-foreground">
            {{ displayLabel }}
          </span>
        </SelectTrigger>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        align="start"
        class="max-w-sm rounded-md border border-border bg-background p-3 text-sm text-foreground shadow-md"
      >
        <p class="text-balance leading-normal text-foreground">
          {{ displayLabel }}
        </p>
      </TooltipContent>
    </Tooltip>
    <SelectTrigger v-else :class="triggerClass">
      <SelectValue class="sr-only" />
      <span ref="measureRef" class="min-w-0 flex-1 truncate text-left text-sm text-foreground">
        {{ displayLabel }}
      </span>
    </SelectTrigger>
    <SelectContent>
      <SelectItem
        v-for="opt in options"
        :key="opt.value"
        :value="opt.value"
      >
        {{ opt.label }}
      </SelectItem>
    </SelectContent>
  </Select>
</template>

<script setup>
import { ref } from 'vue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@motork/component-library/future/primitives'
import { useTextTruncation } from '@/composables/useTextTruncation.js'

const props = defineProps({
  modelValue: { type: String, required: true },
  displayLabel: { type: String, required: true },
  /** `{ value, label }[]` — `value` is the Select model string. */
  options: { type: Array, required: true },
  disabled: { type: Boolean, default: false },
  selectClass: { type: String, default: 'w-40 min-w-0 shrink-0' },
  triggerClass: {
    type: String,
    default:
      'flex h-8 min-w-0 w-40 shrink-0 items-center justify-between gap-1.5 overflow-hidden rounded-lg border border-border bg-background px-2.5 text-sm text-foreground shadow-none',
  },
})

const emit = defineEmits(['update:modelValue'])

const measureRef = ref(null)
const { isTruncated } = useTextTruncation(measureRef, () => props.displayLabel)
</script>
