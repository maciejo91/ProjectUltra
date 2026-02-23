<script setup>
import { computed } from 'vue'
import VueCal from 'vue-cal'
import 'vue-cal/dist/vuecal.css'

const props = defineProps({
  currentDate: { type: Date, required: true },
  currentView: { type: String, default: 'week' },
  events: { type: Array, default: () => [] },
})

const emit = defineEmits(['create-range', 'event-click', 'update:current-date'])

const vueCalEvents = computed(() =>
  props.events.map((ev) => ({
    id: ev.id,
    start: ev.startTime,
    end: ev.endTime,
    title: ev.title,
    class: ev.cssClass || 'calendar-event-other',
    content: ev.location ? `${ev.title} (${ev.location})` : ev.title,
    ...ev,
  }))
)

const handleEventClick = (event) => {
  if (event?.id) emit('event-click', event.id)
}

const handleCellClick = ({ date, hours, minutes }) => {
  const start = new Date(date)
  start.setHours(hours, minutes || 0, 0, 0)
  const end = new Date(start)
  end.setHours(hours, (minutes || 0) + 60, 0, 0)
  emit('create-range', { start, end })
}

const handleDateChange = ({ startDate }) => {
  if (startDate) emit('update:current-date', new Date(startDate))
}
</script>

<template>
  <div class="vuecal-wrapper h-full w-full min-h-80 overflow-hidden">
    <VueCal
      :events="vueCalEvents"
      :view="currentView"
      :selected-date="currentDate"
      :min-event-width="40"
      :snap-to-time="30"
      :locale="'en-GB'"
      :twelve-hour="false"
      :hide-weekends="false"
      :events-on-month-view="'short'"
      :week-starts-on="1"
      class="vuecal-theme-project"
      @cell-click="handleCellClick"
      @event-click="handleEventClick"
      @view-change="handleDateChange"
    />
  </div>
</template>

<style scoped>
.vuecal-wrapper :deep(.vuecal) {
  height: 100%;
  min-height: 20rem;
}

.vuecal-wrapper :deep(.vuecal__header) {
  display: none;
}
</style>
