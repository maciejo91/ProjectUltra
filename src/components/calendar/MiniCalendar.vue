<script setup>
import { computed, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { Button } from '@motork/component-library/future/primitives'

const props = defineProps({
  modelValue: { type: Date, required: true },
  preserveDayWhenChangingMonth: { type: Boolean, default: false },
  /**
   * When true, prev/next month only change the visible month; modelValue updates only when a day is clicked.
   * Use in popover date fields so browsing months does not overwrite the bound value.
   */
  decoupleNavigation: { type: Boolean, default: false },
  /** Inclusive minimum selectable day (local midnight). */
  minDate: { type: Date, default: null },
  /** Inclusive maximum selectable day (local midnight). */
  maxDate: { type: Date, default: null },
})

function startOfLocalDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function isDayBeforeMin(date) {
  if (!props.minDate) return false
  return startOfLocalDay(date) < startOfLocalDay(props.minDate)
}

function isDayAfterMax(date) {
  if (!props.maxDate) return false
  return startOfLocalDay(date) > startOfLocalDay(props.maxDate)
}

function addMonthsClampingDay(date, deltaMonths) {
  const d = new Date(date)
  const day = d.getDate()
  d.setDate(1)
  d.setMonth(d.getMonth() + deltaMonths)
  const lastDayOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  d.setDate(Math.min(day, lastDayOfMonth))
  d.setHours(0, 0, 0, 0)
  return d
}

const emit = defineEmits(['update:modelValue'])

/** First day of month shown in the grid; only used when decoupleNavigation is true. */
const navigationMonth = ref(null)

watch(
  () => props.modelValue,
  () => {
    if (props.decoupleNavigation) navigationMonth.value = null
  },
)

const monthStart = computed(() => {
  const src =
    props.decoupleNavigation && navigationMonth.value != null
      ? navigationMonth.value
      : props.modelValue
  const d = new Date(src)
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
})

const monthLabel = computed(() =>
  monthStart.value.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
)

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const gridDays = computed(() => {
  const start = new Date(monthStart.value)
  const day = start.getDay()
  const offset = day === 0 ? 6 : day - 1
  start.setDate(start.getDate() - offset)
  const today = new Date()
  const result = []
  for (let i = 0; i < 42; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    const beforeMin = isDayBeforeMin(date)
    const afterMax = isDayAfterMax(date)
    result.push({
      date,
      inCurrentMonth: date.getMonth() === monthStart.value.getMonth(),
      isToday:
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate(),
      isSelected:
        date.getFullYear() === props.modelValue.getFullYear() &&
        date.getMonth() === props.modelValue.getMonth() &&
        date.getDate() === props.modelValue.getDate(),
      isDisabled: beforeMin || afterMax,
    })
  }
  return result
})

const goToPreviousMonth = () => {
  if (props.decoupleNavigation) {
    const d = new Date(monthStart.value)
    d.setMonth(d.getMonth() - 1)
    navigationMonth.value = d
    return
  }
  if (props.preserveDayWhenChangingMonth) {
    emit('update:modelValue', addMonthsClampingDay(props.modelValue, -1))
    return
  }
  const d = new Date(monthStart.value)
  d.setMonth(d.getMonth() - 1)
  emit('update:modelValue', d)
}

const goToNextMonth = () => {
  if (props.decoupleNavigation) {
    const d = new Date(monthStart.value)
    d.setMonth(d.getMonth() + 1)
    navigationMonth.value = d
    return
  }
  if (props.preserveDayWhenChangingMonth) {
    emit('update:modelValue', addMonthsClampingDay(props.modelValue, 1))
    return
  }
  const d = new Date(monthStart.value)
  d.setMonth(d.getMonth() + 1)
  emit('update:modelValue', d)
}

const selectDate = (date) => {
  if (isDayBeforeMin(date) || isDayAfterMax(date)) return
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  if (props.decoupleNavigation) {
    const ms = new Date(d.getFullYear(), d.getMonth(), 1)
    ms.setHours(0, 0, 0, 0)
    navigationMonth.value = ms
  }
  emit('update:modelValue', d)
}
</script>

<template>
  <div class="flex flex-col gap-3 p-4">
    <div class="flex items-center justify-between">
      <p class="text-sm font-medium text-foreground">{{ monthLabel }}</p>
      <div class="flex items-center gap-1.5">
        <Button variant="secondary" size="icon-sm" @click="goToPreviousMonth">
          <ChevronLeft :size="14" />
        </Button>
        <Button variant="secondary" size="icon-sm" @click="goToNextMonth">
          <ChevronRight :size="14" />
        </Button>
      </div>
    </div>

    <div class="grid grid-cols-7 gap-1 text-center">
      <span
        v-for="label in daysOfWeek"
        :key="label"
        class="text-sm font-medium text-muted-foreground py-1"
      >
        {{ label }}
      </span>
    </div>

    <div class="grid grid-cols-7 gap-1 text-center">
      <button
        v-for="day in gridDays"
        :key="day.date.toISOString()"
        type="button"
        :disabled="day.isDisabled"
        class="relative flex items-center justify-center py-1.5 rounded-md text-sm transition-colors min-h-9 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
        :class="[
          day.inCurrentMonth ? 'text-foreground' : 'text-muted-foreground',
          day.isSelected ? 'bg-primary text-primary-foreground' : !day.isDisabled && 'cursor-pointer hover:bg-muted',
        ]"
        @click="selectDate(day.date)"
      >
        <span
          v-if="day.isToday && !day.isSelected"
          class="absolute inset-0 rounded-md border border-border pointer-events-none"
        />
        <span class="relative z-10">{{ day.date.getDate() }}</span>
      </button>
    </div>
  </div>
</template>
