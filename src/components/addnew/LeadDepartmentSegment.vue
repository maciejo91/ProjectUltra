<template>
  <div
    :id="groupId"
    class="ld-dept-seg w-fit max-w-full"
    role="radiogroup"
    :aria-label="ariaLabel"
    @keydown="onGroupKeydown"
  >
    <div class="ld-dept-seg__track" role="presentation">
      <button
        :id="salesId"
        ref="refSales"
        type="button"
        class="ld-dept-seg__opt"
        :class="{ 'ld-dept-seg__opt--on': localValue === 'sales' }"
        role="radio"
        :aria-checked="localValue === 'sales'"
        :tabindex="localValue === 'sales' ? 0 : -1"
        @click="select('sales')"
      >
        <slot name="sales" />
      </button>
      <button
        :id="serviceId"
        ref="refService"
        type="button"
        class="ld-dept-seg__opt"
        :class="{ 'ld-dept-seg__opt--on': localValue === 'service' }"
        role="radio"
        :aria-checked="localValue === 'service'"
        :tabindex="localValue === 'service' ? 0 : -1"
        @click="select('service')"
      >
        <slot name="service" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { nextTick, ref, useId, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
    validator: (v) => v === 'sales' || v === 'service',
  },
  /** Visible group name for screen readers */
  ariaLabel: { type: String, required: true },
})

const emit = defineEmits(['update:modelValue'])

const uid = useId()
const groupId = `ld-dept-rg-${uid}`
const salesId = `${groupId}-sales`
const serviceId = `${groupId}-service`

const localValue = ref(props.modelValue)
watch(
  () => props.modelValue,
  (v) => {
    localValue.value = v
  }
)

const refSales = ref(null)
const refService = ref(null)

function select(v) {
  if (v === localValue.value) return
  localValue.value = v
  emit('update:modelValue', v)
  const target = v === 'sales' ? refSales.value : refService.value
  if (target) target.focus()
}

/** Two options: any arrow key moves to the other option (roving focus handled via tabindex) */
function onGroupKeydown(e) {
  if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(e.key)) return
  e.preventDefault()
  const next = localValue.value === 'sales' ? 'service' : 'sales'
  localValue.value = next
  emit('update:modelValue', next)
  nextTick(() => (next === 'sales' ? refSales : refService).value?.focus())
}
</script>

<style scoped>
/* Add New → Lead details only. Not role=tab, so app-wide tab/underline rules do not apply.
   Figma 1731:173754 (Creation-flow segmented control) */
.ld-dept-seg {
  --dept-seg-track-bg: #f5f5f5;
  --dept-seg-track-pad: 3px;
  --dept-seg-track-gap: 2px;
  --dept-seg-radius-outer: 10px;
  --dept-seg-radius-inner: 8px;
  --dept-seg-fg: #737373;
  --dept-seg-fg-on: #0a0a0a;
  --dept-seg-segment-on: #fff;
  --dept-seg-border-on: rgba(255, 255, 255, 0);
  --dept-seg-shadow-on: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.1);
  --dept-seg-focus: color-mix(in oklab, var(--ring, #3b82f6) 70%, transparent);
}

:global(.dark) .ld-dept-seg {
  --dept-seg-track-bg: color-mix(in oklab, var(--muted) 100%, #000 8%);
  --dept-seg-fg: var(--muted-foreground);
  --dept-seg-fg-on: var(--foreground);
  --dept-seg-segment-on: var(--background);
  --dept-seg-border-on: color-mix(in oklab, var(--border) 40%, transparent);
  --dept-seg-shadow-on: 0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 2px 0 rgba(0, 0, 0, 0.18);
}

/* Shrink to label + icon width per segment, not 50/50 */
.ld-dept-seg__track {
  display: inline-flex;
  flex-direction: row;
  align-items: stretch;
  width: max-content;
  max-width: 100%;
  box-sizing: border-box;
  min-height: 0;
  padding: var(--dept-seg-track-pad);
  gap: var(--dept-seg-track-gap);
  border: none;
  border-radius: var(--dept-seg-radius-outer);
  background: var(--dept-seg-track-bg);
}

.ld-dept-seg__opt {
  position: relative;
  z-index: 0;
  flex: 0 0 auto;
  min-width: min-content;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  margin: 0;
  box-sizing: border-box;
  padding: 4px 6px;
  font: inherit;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 500;
  color: var(--dept-seg-fg);
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--dept-seg-radius-inner);
  cursor: pointer;
  transition:
    color 0.12s ease,
    background 0.12s ease,
    box-shadow 0.12s ease;
  -webkit-tap-highlight-color: transparent;
}

.ld-dept-seg__opt--on {
  z-index: 1;
  color: var(--dept-seg-fg-on);
  background: var(--dept-seg-segment-on);
  border-color: var(--dept-seg-border-on);
  box-shadow: var(--dept-seg-shadow-on);
}

.ld-dept-seg__opt:focus-visible {
  outline: 2px solid var(--dept-seg-focus);
  outline-offset: 2px;
}
</style>
