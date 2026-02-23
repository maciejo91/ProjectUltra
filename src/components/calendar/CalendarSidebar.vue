<script setup>
import MiniCalendar from './MiniCalendar.vue'
import CalendarFiltersCard from './CalendarFiltersCard.vue'
import EventTypesCard from './EventTypesCard.vue'

defineProps({
  currentDate: { type: Date, required: true },
  filters: { type: Object, required: true },
  filterOptions: { type: Object, default: () => ({}) },
  activeTypeIds: { type: Array, default: () => [] },
})

defineEmits(['update:currentDate', 'update:filters', 'update:activeTypeIds'])
</script>

<template>
  <div class="flex flex-col gap-4 w-full">
    <div class="bg-background rounded-lg shadow-mk-dashboard-card overflow-hidden">
      <MiniCalendar
        :model-value="currentDate"
        @update:model-value="$emit('update:currentDate', $event)"
      />
    </div>
    <CalendarFiltersCard
      :filters="filters"
      :dealerships="filterOptions.dealerships || []"
      :teams="filterOptions.teams || []"
      @update:filters="$emit('update:filters', $event)"
    />
    <EventTypesCard
      :event-types="filterOptions.eventTypes || []"
      :active-type-ids="activeTypeIds"
      @update:active-type-ids="$emit('update:activeTypeIds', $event)"
    />
  </div>
</template>
