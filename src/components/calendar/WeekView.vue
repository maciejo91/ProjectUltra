<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { startOfWeek } from '@/composables/useCalendarView'
import CalendarEventBlock from './CalendarEventBlock.vue'

const props = defineProps({
  currentDate: { type: Date, required: true },
  events: { type: Array, default: () => [] },
  daysToShow: { type: Number, default: 7 },
})

const emit = defineEmits(['create-range', 'event-click'])

const startHour = 0
const endHour = 23
const slotMinutes = 30
const slotHeight = 64
const headerHeight = 44

const containerRef = ref(null)
const isDragging = ref(false)
const dragStart = ref(null)
const dragCurrent = ref(null)
const currentTimeOffset = ref(null)
let currentTimeIntervalId = null

const weekDays = computed(() => {
  const base = startOfWeek(props.currentDate)
  const count = Math.min(7, Math.max(1, props.daysToShow))
  const result = []
  for (let i = 0; i < count; i++) {
    const date = new Date(base)
    date.setDate(base.getDate() + i)
    result.push({
      label: date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' }),
      date,
    })
  }
  return result
})

const totalSlots = computed(
  () => ((endHour - startHour + 1) * 60) / slotMinutes
)

const timeLabels = computed(() => {
  const labels = []
  for (let i = 0; i < totalSlots.value; i++) {
    const mins = startHour * 60 + i * slotMinutes
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setMinutes(mins)
    labels.push(
      mins % 60 === 0
        ? d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
        : ''
    )
  }
  return labels
})

const getDayIndex = (date, days) =>
  days.findIndex(
    (d) =>
      date.getFullYear() === d.date.getFullYear() &&
      date.getMonth() === d.date.getMonth() &&
      date.getDate() === d.date.getDate()
  )

const getMinutesFromStart = (date) => {
  const mins = date.getHours() * 60 + date.getMinutes()
  return Math.max(0, mins - startHour * 60)
}

const normalizedEvents = computed(() =>
  props.events.map((event) => {
    const dayIndex = getDayIndex(event.startTime, weekDays.value)
    const top = getMinutesFromStart(event.startTime) * (slotHeight / slotMinutes)
    const dur = Math.max(
      slotMinutes,
      getMinutesFromStart(event.endTime) - getMinutesFromStart(event.startTime)
    )
    return {
      ...event,
      dayIndex,
      top,
      height: (dur / slotMinutes) * slotHeight,
    }
  })
)

const columnsWithEvents = computed(() => {
  const cols = weekDays.value.map(() => ({ events: [] }))
  normalizedEvents.value.forEach((ev) => {
    if (ev.dayIndex >= 0 && ev.dayIndex < cols.length) {
      cols[ev.dayIndex].events.push(ev)
    }
  })
  return cols
})

const draggingStyle = computed(() => {
  if (!dragStart.value || !dragCurrent.value || dragStart.value.dayIndex !== dragCurrent.value.dayIndex)
    return null
  const startSlot = Math.min(dragStart.value.slotIndex, dragCurrent.value.slotIndex)
  const endSlot = Math.max(dragStart.value.slotIndex, dragCurrent.value.slotIndex) + 1
  return {
    dayIndex: dragStart.value.dayIndex,
    top: startSlot * slotHeight,
    height: Math.max(slotHeight, (endSlot - startSlot) * slotHeight),
  }
})

const getSlotTime = (dayIndex, slotIndex) => {
  const base = startOfWeek(props.currentDate)
  base.setDate(base.getDate() + dayIndex)
  const mins = slotIndex * slotMinutes
  base.setHours(startHour + Math.floor(mins / 60), mins % 60, 0, 0)
  return base
}

const handleMouseDownSlot = (dayIndex, slotIndex) => {
  isDragging.value = true
  dragStart.value = { dayIndex, slotIndex }
  dragCurrent.value = { dayIndex, slotIndex }
}

const handleMouseEnterSlot = (dayIndex, slotIndex) => {
  if (!isDragging.value || !dragStart.value || dayIndex !== dragStart.value.dayIndex) return
  dragCurrent.value = { dayIndex, slotIndex }
}

const handleMouseUp = () => {
  if (!isDragging.value || !dragStart.value || !dragCurrent.value) {
    resetDrag()
    return
  }
  if (dragStart.value.dayIndex !== dragCurrent.value.dayIndex) {
    resetDrag()
    return
  }
  const { dayIndex } = dragStart.value
  const startSlot = Math.min(dragStart.value.slotIndex, dragCurrent.value.slotIndex)
  const endSlot = Math.max(dragStart.value.slotIndex, dragCurrent.value.slotIndex) + 1
  emit('create-range', {
    start: getSlotTime(dayIndex, startSlot),
    end: getSlotTime(dayIndex, endSlot),
  })
  resetDrag()
}

const resetDrag = () => {
  isDragging.value = false
  dragStart.value = null
  dragCurrent.value = null
}

const handleWindowMouseUp = () => {
  if (isDragging.value) handleMouseUp()
}

const updateCurrentTimeOffset = () => {
  const now = new Date()
  if (now.getHours() < startHour || now.getHours() > endHour) {
    currentTimeOffset.value = null
    return
  }
  currentTimeOffset.value =
    (getMinutesFromStart(now) / slotMinutes) * slotHeight
}

onMounted(() => {
  window.addEventListener('mouseup', handleWindowMouseUp)
  updateCurrentTimeOffset()
  currentTimeIntervalId = setInterval(updateCurrentTimeOffset, 60000)
  if (containerRef.value && currentTimeOffset.value != null) {
    containerRef.value.scrollTop = Math.max(0, currentTimeOffset.value - 160)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('mouseup', handleWindowMouseUp)
  if (currentTimeIntervalId) clearInterval(currentTimeIntervalId)
})
</script>

<template>
  <div ref="containerRef" class="h-full w-full overflow-y-auto">
    <div class="min-w-0 w-full relative">
      <div
        class="grid border-b border-border bg-background sticky top-0 z-20"
        :style="{ gridTemplateColumns: '4rem minmax(0, 1fr)' }"
      >
        <div />
        <div
          class="grid divide-x divide-border"
          :style="{ gridTemplateColumns: `repeat(${props.daysToShow}, minmax(0, 1fr))` }"
        >
          <div
            v-for="day in weekDays"
            :key="day.date.toISOString()"
            class="px-2 sm:px-3 py-3 flex items-center justify-center"
          >
            <span class="text-sm font-medium text-muted-foreground truncate">
              {{ day.label }}
            </span>
          </div>
        </div>
      </div>

      <div class="grid" :style="{ gridTemplateColumns: '4rem minmax(0, 1fr)' }">
        <div class="bg-background border-r border-border">
          <div
            v-for="(label, idx) in timeLabels"
            :key="`t-${idx}`"
            class="h-16 text-sm text-muted-foreground pr-2 relative flex items-end justify-end"
          >
            <span v-if="label" class="pb-0.5">{{ label }}</span>
          </div>
        </div>

        <div class="relative bg-background border-l border-border">
          <div
            class="grid divide-x divide-border"
            :style="{
              gridTemplateColumns: `repeat(${props.daysToShow}, minmax(0, 1fr))`,
              minHeight: `${totalSlots * slotHeight}px`,
            }"
          >
            <div
              v-for="(col, dayIdx) in columnsWithEvents"
              :key="dayIdx"
              class="relative border-r border-border"
            >
              <div
                v-for="slotIdx in totalSlots"
                :key="`s-${dayIdx}-${slotIdx}`"
                class="h-16 cursor-pointer border-b border-border/60"
                :class="{ 'border-b-border': (slotIdx - 1) % 2 === 0 }"
                @mousedown.prevent="handleMouseDownSlot(dayIdx, slotIdx - 1)"
                @mouseenter.prevent="handleMouseEnterSlot(dayIdx, slotIdx - 1)"
              />
              <div
                v-if="draggingStyle && draggingStyle.dayIndex === dayIdx"
                class="absolute left-1 right-1 rounded-md bg-primary/10 border border-primary/50 pointer-events-none"
                :style="{ top: `${draggingStyle.top}px`, height: `${draggingStyle.height}px` }"
              />
              <div class="absolute inset-x-1 top-0">
                <div
                  v-for="ev in col.events"
                  :key="ev.id"
                  class="absolute left-0 right-0"
                  :style="{ top: `${ev.top}px`, height: `${ev.height}px` }"
                >
                  <CalendarEventBlock
                    :event="ev"
                    class="w-full h-full"
                    @click="emit('event-click', ev.id)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="currentTimeOffset != null"
        class="pointer-events-none absolute right-0 left-16 flex items-center z-10"
        :style="{ top: `${headerHeight + currentTimeOffset}px` }"
      >
        <span class="inline-flex size-2 rounded-full bg-calendar-current-time" />
        <div class="flex-1 h-px bg-calendar-current-time" />
      </div>
    </div>
  </div>
</template>
