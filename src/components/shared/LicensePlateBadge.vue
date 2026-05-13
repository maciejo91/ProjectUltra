<template>
  <div
    v-if="showChip"
    class="inline-flex max-w-full min-w-0 items-center gap-1 overflow-hidden rounded-sm border border-border bg-background py-0.5 pl-0.5 pr-2"
  >
    <span
      class="h-4 w-1.5 shrink-0 rounded-bl-sm rounded-tl-sm bg-primary"
      aria-hidden="true"
    />
    <TruncatingTooltip
      v-if="truncate"
      :text="tooltipText"
      wrapper-class="min-w-0 max-w-full flex-1"
    >
      <span
        class="block min-w-0 truncate text-sm font-semibold leading-4 text-foreground"
        :class="{ uppercase }"
      >
        {{ visibleText }}
      </span>
    </TruncatingTooltip>
    <span
      v-else
      class="block text-sm font-semibold leading-4 text-foreground whitespace-nowrap"
      :class="{ uppercase }"
    >
      {{ visibleText }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import TruncatingTooltip from '@/components/shared/TruncatingTooltip.vue'

const props = defineProps({
  plate: { type: String, default: '' },
  /** When true, plate text is shown in uppercase (visual + tooltip when truncated). */
  uppercase: { type: Boolean, default: false },
  /** When true, long plates truncate with a tooltip (narrow layouts). */
  truncate: { type: Boolean, default: false },
  /**
   * Shown inside the chip when `plate` is empty (e.g. "—").
   * Omit to hide the chip when there is no plate.
   */
  placeholder: { type: String, default: undefined },
})

const trimmed = computed(() => String(props.plate ?? '').trim())

const visibleText = computed(() => {
  if (trimmed.value) {
    return props.uppercase ? trimmed.value.toUpperCase() : trimmed.value
  }
  if (props.placeholder !== undefined && props.placeholder !== null) {
    return props.placeholder
  }
  return ''
})

const tooltipText = computed(() => visibleText.value)

const showChip = computed(() => {
  if (trimmed.value) return true
  return props.placeholder !== undefined && props.placeholder !== null && props.placeholder !== ''
})
</script>
