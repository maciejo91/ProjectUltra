<template>
  <div
    :id="groupId"
    class="mk-seg w-fit max-w-full"
    role="radiogroup"
    :aria-label="ariaLabel"
    @keydown="onGroupKeydown"
  >
    <div class="mk-seg__track" role="presentation">
      <button
        v-for="(opt, idx) in options"
        :id="optionId(opt.value)"
        :key="opt.value"
        :ref="(el) => setOptionRef(el, idx)"
        type="button"
        class="mk-seg__opt"
        :class="{ 'mk-seg__opt--on': localValue === opt.value }"
        role="radio"
        :aria-checked="localValue === opt.value"
        :tabindex="localValue === opt.value ? 0 : -1"
        @click="select(opt.value)"
      >
        <slot :name="opt.value">
          <span class="inline-flex items-center justify-center gap-1.5">
            <span>{{ opt.label }}</span>
          </span>
        </slot>
      </button>
    </div>
  </div>
</template>

<script setup>
import { nextTick, ref, useId, watch } from 'vue'

const props = defineProps({
  modelValue: { type: String, required: true },
  options: {
    type: Array,
    required: true,
    validator: (v) =>
      Array.isArray(v) &&
      v.length >= 2 &&
      v.every((x) => x && typeof x.value === 'string' && typeof x.label === 'string'),
  },
  /** Visible group name for screen readers */
  ariaLabel: { type: String, required: true },
})

const emit = defineEmits(['update:modelValue'])

const uid = useId()
const groupId = `mk-seg-rg-${uid}`

const localValue = ref(props.modelValue)
watch(
  () => props.modelValue,
  (v) => {
    localValue.value = v
  },
)

const optionRefs = ref([])

function setOptionRef(el, idx) {
  if (!el) return
  optionRefs.value[idx] = el
}

function optionId(value) {
  return `${groupId}-${String(value)}`
}

function select(v) {
  if (v === localValue.value) return
  localValue.value = v
  emit('update:modelValue', v)
  const idx = props.options.findIndex((o) => o.value === v)
  const target = optionRefs.value[idx]
  if (target) target.focus()
}

function onGroupKeydown(e) {
  if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(e.key)) return
  e.preventDefault()
  const idx = Math.max(
    0,
    props.options.findIndex((o) => o.value === localValue.value),
  )
  const dir = e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1
  const nextIdx = (idx + dir + props.options.length) % props.options.length
  const next = props.options[nextIdx]?.value
  if (!next) return
  localValue.value = next
  emit('update:modelValue', next)
  nextTick(() => optionRefs.value[nextIdx]?.focus())
}
</script>

<style scoped>
/* Exact styles from creation-flow segmented control (Figma 1731:173754). */
.mk-seg {
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

::global(.dark) .mk-seg {
  --dept-seg-track-bg: color-mix(in oklab, var(--muted) 100%, #000 8%);
  --dept-seg-fg: var(--muted-foreground);
  --dept-seg-fg-on: var(--foreground);
  --dept-seg-segment-on: var(--background);
  --dept-seg-border-on: color-mix(in oklab, var(--border) 40%, transparent);
  --dept-seg-shadow-on: 0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 2px 0 rgba(0, 0, 0, 0.18);
}

.mk-seg__track {
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

.mk-seg__opt {
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
  padding: 4px 10px;
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

.mk-seg__opt--on {
  z-index: 1;
  color: var(--dept-seg-fg-on);
  background: var(--dept-seg-segment-on);
  border-color: var(--dept-seg-border-on);
  box-shadow: var(--dept-seg-shadow-on);
}

.mk-seg__opt:focus-visible {
  outline: 2px solid var(--dept-seg-focus);
  outline-offset: 2px;
}
</style>

