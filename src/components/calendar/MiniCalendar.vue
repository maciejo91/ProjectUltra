<script setup>
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { Button } from '@motork/component-library/future/primitives'

const props = defineProps({
  modelValue: { type: Date, required: true },
  preserveDayWhenChangingMonth: { type: Boolean, default: false },
})

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

const monthStart = computed(() => {
  const d = new Date(props.modelValue)
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
    })
  }
  return result
})

const goToPreviousMonth = () => {
  if (props.preserveDayWhenChangingMonth) {
    emit('update:modelValue', addMonthsClampingDay(props.modelValue, -1))
    return
  }
  const d = new Date(monthStart.value)
  d.setMonth(d.getMonth() - 1)
  emit('update:modelValue', d)
}

const goToNextMonth = () => {
  if (props.preserveDayWhenChangingMonth) {
    emit('update:modelValue', addMonthsClampingDay(props.modelValue, 1))
    return
  }
  const d = new Date(monthStart.value)
  d.setMonth(d.getMonth() + 1)
  emit('update:modelValue', d)
}

const selectDate = (date) => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
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
        class="relative flex items-center justify-center py-1.5 rounded-md text-sm cursor-pointer transition-colors min-h-9"
        :class="[
          day.inCurrentMonth ? 'text-foreground' : 'text-muted-foreground',
          day.isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
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
