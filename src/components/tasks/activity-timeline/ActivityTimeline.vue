<template>
  <div class="flex min-w-0 flex-col overflow-x-hidden">
    <div v-if="dateLabel" class="mb-4">
      <h3 class="text-sm font-medium leading-snug tracking-tight text-muted-foreground">
        {{ dateLabel }}
      </h3>
    </div>
    <div class="relative">
      <div
        class="pointer-events-none absolute bottom-4 left-3 top-4 z-0 w-px -translate-x-1/2 bg-muted-foreground/35"
        aria-hidden="true"
      />
      <div class="relative z-10 flex flex-col">
        <ActivityTimelineItem
          v-for="(activity, index) in activities"
          :key="activity.id ?? `activity-${activity.timestamp ?? activity.createdAt ?? ''}`"
          :activity="activity"
          :is-last="index === activities.length - 1"
          :compact-bottom-spacing="pairwiseSystemCompact(activities, index)"
          @activity-click="(a) => emit('activity-click', a)"
          @open-transcript="(a) => emit('open-transcript', a)"
          @add-activity="(action) => emit('add-activity', action)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { isActivityTimelineSystemHeadline } from '@/composables/useActivityTimelinePresentation'
import ActivityTimelineItem from './ActivityTimelineItem.vue'

function pairwiseSystemCompact(list, index) {
  if (!list?.length || index >= list.length - 1) return false
  return (
    isActivityTimelineSystemHeadline(list[index]) &&
    isActivityTimelineSystemHeadline(list[index + 1])
  )
}

defineProps({
  activities: {
    type: Array,
    required: true
  },
  dateLabel: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['activity-click', 'open-transcript', 'add-activity'])
</script>
