<template>
  <div :class="[inlineWidth ? 'w-fit min-w-0' : 'w-full min-w-0', wrapperClass]">
    <InputGroup
      :class="[
        'flex h-10 min-w-0 overflow-hidden border border-border bg-background text-sm text-foreground',
        inlineWidth ? 'w-fit' : 'w-full',
        groupClass || 'rounded-lg',
      ]"
    >
      <InputGroupInput
        :id="id"
        type="text"
        :inputmode="allowKeyboardEntry ? 'numeric' : undefined"
        autocomplete="off"
        :model-value="displayModelValue"
        :disabled="disabled || !allowKeyboardEntry"
        :placeholder="resolvedPlaceholder"
        :aria-label="ariaLabel"
        class="h-full min-h-0 min-w-0 flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        :class="mergedInputClass"
        @update:model-value="onInputUpdate"
        @blur="onInputBlur"
      />
      <InputGroupAddon align="inline-end">
        <Popover :open="open" @update:open="(v) => (open = v)">
          <PopoverTrigger as-child>
            <InputGroupButton
              type="button"
              size="icon-sm"
              variant="ghost"
              :class="mergedCalendarButtonClass"
              :disabled="disabled"
              :aria-label="calendarOpenAriaLabel"
              :aria-expanded="open"
            >
              <CalendarIcon class="size-4 text-muted-foreground" aria-hidden="true" />
            </InputGroupButton>
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
              :min-date="minDateParsed"
              :max-date="maxDateParsed"
              class="gap-2 p-0"
              @update:model-value="onPickDate"
            />
          </PopoverContent>
        </Popover>
      </InputGroupAddon>
    </InputGroup>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Calendar as CalendarIcon } from 'lucide-vue-next'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@motork/component-library/future/primitives'
import MiniCalendar from '@/components/calendar/MiniCalendar.vue'
import {
  parseMotorkDateField,
  formatMotorkDateFieldEu,
  parseIsoYyyyMmDd,
} from '@/utils/motorkDateField.js'

const props = defineProps({
  modelValue: { type: String, default: '' },
  /** Shown when set to a non-empty string; otherwise `00.00.0000`. */
  placeholder: { type: String, default: undefined },
  disabled: { type: Boolean, default: false },
  /**
   * When false, the text field is disabled and only the calendar can change the value.
   */
  allowKeyboardEntry: { type: Boolean, default: true },
  /**
   * Minimum date (YYYY-MM-DD), same as native `input[type=date]` `min`.
   */
  minDate: { type: String, default: undefined },
  /**
   * Maximum date (YYYY-MM-DD), same as native `max`.
   */
  maxDate: { type: String, default: undefined },
  id: { type: String, default: undefined },
  ariaLabel: { type: String, default: undefined },
  wrapperClass: { type: String, default: '' },
  groupClass: { type: String, default: '' },
  inputClass: { type: String, default: '' },
  calendarButtonClass: { type: String, default: '' },
  popoverContentClass: { type: String, default: '' },
  /**
   * When true, the field shrinks to content width (`width: fit-content`) instead of filling the row.
   */
  inlineWidth: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const minDateParsed = computed(() => {
  if (!props.minDate || !String(props.minDate).trim()) return null
  return parseIsoYyyyMmDd(String(props.minDate).trim())
})

const maxDateParsed = computed(() => {
  if (!props.maxDate || !String(props.maxDate).trim()) return null
  return parseIsoYyyyMmDd(String(props.maxDate).trim())
})

const resolvedPlaceholder = computed(() => {
  if (props.placeholder !== undefined && props.placeholder !== '') {
    return props.placeholder
  }
  return '00.00.0000'
})

/** Show EU in the input; map legacy ISO-only values to EU for display. */
const displayModelValue = computed(() => {
  const v = props.modelValue
  if (v == null || v === '') return ''
  const str = String(v).trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const d = parseIsoYyyyMmDd(str)
    return d ? formatMotorkDateFieldEu(d) : str
  }
  return str
})

const mergedInputClass = computed(
  () =>
    props.inputClass ||
    'min-w-0 pr-2 pl-3',
)

const mergedCalendarButtonClass = computed(() => props.calendarButtonClass || '')

const calendarOpenAriaLabel = computed(() => {
  if (props.ariaLabel) return `${props.ariaLabel} — open calendar`
  return 'Open calendar'
})

function startOfToday() {
  const t = new Date()
  t.setHours(0, 0, 0, 0)
  return t
}

const open = ref(false)
const draftDate = ref(startOfToday())

watch(open, (isOpen) => {
  if (isOpen) {
    draftDate.value = parseMotorkDateField(props.modelValue) || startOfToday()
  }
})

/** Progressive DD.MM.YYYY mask; pasted ISO → EU. */
function maskDateInputEu(raw) {
  const s = String(raw ?? '')
  const iso = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/)
  if (iso) {
    const y = iso[1]
    const m = iso[2].padStart(2, '0')
    const d = iso[3].padStart(2, '0')
    return `${d}.${m}.${y}`
  }
  const digits = s.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`
}

function onInputUpdate(v) {
  emit('update:modelValue', maskDateInputEu(v))
}

function onInputBlur() {
  const raw = String(props.modelValue || '').trim()
  if (!raw) return
  const d = parseMotorkDateField(raw)
  if (!d) return
  emit('update:modelValue', formatMotorkDateFieldEu(d))
}

function onPickDate(d) {
  draftDate.value = d
  emit('update:modelValue', formatMotorkDateFieldEu(d))
  open.value = false
}
</script>
