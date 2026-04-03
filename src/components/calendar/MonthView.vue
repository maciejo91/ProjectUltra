<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentDate: { type: Date, required: true },
  events: { type: Array, default: () => [] },
})

const emit = defineEmits(['create-range', 'event-click'])

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const monthStart = computed(() => {
  const d = new Date(props.currentDate)
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
})

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

const gridCells = computed(() => {
  const start = new Date(monthStart.value)
  const day = start.getDay()
  const offset = day === 0 ? 6 : day - 1
  start.setDate(start.getDate() - offset)
  const today = new Date()
  const cells = []
  for (let i = 0; i < 42; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    const dayEvents = props.events.filter((e) => isSameDay(e.startTime, date))
    cells.push({
      date,
      inCurrentMonth: date.getMonth() === monthStart.value.getMonth(),
      isToday: isSameDay(date, today),
      events: dayEvents,
    })
  }
  return cells
})

const handleCellClick = (cell) => {
  const start = new Date(cell.date)
  start.setHours(9, 0, 0, 0)
  const end = new Date(cell.date)
  end.setHours(10, 0, 0, 0)
  emit('create-range', { start, end })
}

const handleEventClick = (id) => {
  emit('event-click', id)
}
</script>

<template>
  <div class="h-full w-full overflow-y-auto bg-background">
    <div class="min-w-0 w-full h-full flex flex-col">
      <div class="grid grid-cols-7 divide-x divide-border border-b border-border bg-background sticky top-0 z-20">
        <div
          v-for="label in daysOfWeek"
          :key="label"
          class="px-2 sm:px-3 py-3 flex items-center justify-center"
        >
          <span class="text-sm font-medium text-muted-foreground">
            {{ label }}
          </span>
        </div>
      </div>

      <div class="flex-1 grid grid-cols-7 grid-rows-6 divide-x divide-border divide-y divide-border">
        <div
          v-for="cell in gridCells"
          :key="cell.date.toISOString()"
          class="p-1.5 flex flex-col gap-0.5 cursor-pointer hover:bg-muted/50 min-h-20 sm:min-h-24"
          :class="cell.inCurrentMonth ? 'bg-background' : 'bg-muted/40'"
          @click="handleCellClick(cell)"
        >
          <span
            class="inline-flex items-center justify-center size-6 rounded-full text-sm shrink-0"
            :class="
              cell.isToday
                ? 'bg-foreground text-background'
                : cell.inCurrentMonth
                  ? 'text-foreground'
                  : 'text-muted-foreground'
            "
          >
            {{ cell.date.getDate() }}
          </span>

          <div class="flex flex-col gap-0.5 overflow-hidden">
            <button
              v-for="event in cell.events.slice(0, 3)"
              :key="event.id"
              type="button"
              class="w-full text-left rounded-md px-2 py-1 text-sm font-medium truncate cursor-pointer overflow-hidden"
              :class="event.cssClass || 'calendar-event-other'"
              @click.stop="handleEventClick(event.id)"
            >
              <span class="truncate block">{{ event.title }}</span>
              <span v-if="event.location" class="text-muted-foreground truncate block">{{ event.location }}</span>
            </button>
            <span
              v-if="cell.events.length > 3"
              class="text-sm text-muted-foreground px-1.5"
            >
              +{{ cell.events.length - 3 }} more
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
