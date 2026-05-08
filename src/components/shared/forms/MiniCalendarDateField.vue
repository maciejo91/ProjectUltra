<template>
  <div class="flex w-full min-w-0 items-center gap-2" :class="wrapperClass">
    <Input
      :id="id"
      type="text"
      inputmode="numeric"
      autocomplete="off"
      :model-value="modelValue"
      :disabled="disabled"
      :placeholder="placeholder"
      :aria-label="ariaLabel"
      class="min-w-0 flex-1 rounded-[10px] text-sm"
      :class="mergedInputClass"
      @update:model-value="onInputUpdate"
      @blur="onInputBlur"
    />
    <Popover :open="open" @update:open="(v) => (open = v)">
      <PopoverTrigger as-child>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          class="shrink-0"
          :class="mergedCalendarButtonClass"
          :disabled="disabled"
          :aria-label="calendarOpenAriaLabel"
          :aria-expanded="open"
        >
          <CalendarIcon class="size-3 text-muted-foreground" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        class="w-auto p-0"
        :class="popoverContentClass"
        align="end"
        @open-auto-focus.prevent
      >
        <MiniCalendar
          :model-value="draftDate"
          :decouple-navigation="true"
          class="gap-2 p-0"
          @update:model-value="onPickDate"
        />
      </PopoverContent>
    </Popover>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Calendar as CalendarIcon } from 'lucide-vue-next'
import {
  Button,
  Input,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@motork/component-library/future/primitives'
import MiniCalendar from '@/components/calendar/MiniCalendar.vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '00.00.0000' },
  disabled: { type: Boolean, default: false },
  id: { type: String, default: undefined },
  /** Primary label for the text field (screen readers). */
  ariaLabel: { type: String, default: undefined },
  /** Extra classes on the outer flex wrapper */
  wrapperClass: { type: String, default: '' },
  /** Extra classes on the text input (e.g. h-10 w-full in modals) */
  inputClass: { type: String, default: '' },
  /** Extra classes on the calendar trigger (default pairs with input height) */
  calendarButtonClass: { type: String, default: '' },
  /** Extra classes on popover content (e.g. z-[110] inside dialogs) */
  popoverContentClass: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const mergedInputClass = computed(() => props.inputClass || 'h-8 w-full min-w-0')

const mergedCalendarButtonClass = computed(
  () => props.calendarButtonClass || 'rounded-[10px]',
)

const calendarOpenAriaLabel = computed(() => {
  if (props.ariaLabel) return `${props.ariaLabel} — open calendar`
  return 'Open calendar'
})

/** Day-first: DD.MM.YYYY or DD/MM/YYYY (also accepts DD-MM-YYYY with same order). */
function parseDdMmYyyy(s) {
  if (!s || !String(s).trim()) return null
  const parts = String(s).trim().split(/[./-]/)
  if (parts.length !== 3) return null
  const day = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10)
  const year = parseInt(parts[2], 10)
  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) return null
  const d = new Date(year, month - 1, day)
  d.setHours(0, 0, 0, 0)
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null
  return d
}

/** ISO YYYY-MM-DD (same wire format as <input type="date"> elsewhere in the app). */
function parseIsoYyyyMmDd(s) {
  const t = String(s || '').trim()
  const m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (!m) return null
  const year = parseInt(m[1], 10)
  const month = parseInt(m[2], 10)
  const day = parseInt(m[3], 10)
  const d = new Date(year, month - 1, day)
  d.setHours(0, 0, 0, 0)
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null
  return d
}

function parseFlexibleDate(s) {
  return parseIsoYyyyMmDd(s) || parseDdMmYyyy(s)
}

function formatDdMmYyyy(date) {
  const d = date.getDate().toString().padStart(2, '0')
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const y = date.getFullYear()
  return `${d}.${m}.${y}`
}

function startOfToday() {
  const t = new Date()
  t.setHours(0, 0, 0, 0)
  return t
}

const open = ref(false)
const draftDate = ref(startOfToday())

watch(open, (isOpen) => {
  if (isOpen) {
    draftDate.value = parseFlexibleDate(props.modelValue) || startOfToday()
  }
})

function onInputUpdate(v) {
  emit('update:modelValue', v)
}

/** Normalize valid dates to DD.MM.YYYY; leave invalid or empty text for the user to fix. */
function onInputBlur() {
  const raw = String(props.modelValue || '').trim()
  if (!raw) return
  const d = parseFlexibleDate(raw)
  if (d) emit('update:modelValue', formatDdMmYyyy(d))
}

function onPickDate(d) {
  draftDate.value = d
  emit('update:modelValue', formatDdMmYyyy(d))
  open.value = false
}
</script>
