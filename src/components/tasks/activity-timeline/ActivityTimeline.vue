<template>
  <div class="flex min-w-0 flex-col overflow-x-hidden">
    <div v-if="dateLabel" class="mb-4">
      <h3 class="text-sm font-medium leading-snug tracking-tight text-muted-foreground">
        {{ dateLabel }}
      </h3>
    </div>
    <div class="relative">
      <div
        v-if="timelineVariant === 'sophieAnchored' && activities.length > 0"
        class="absolute left-4 top-0 bottom-0 w-px bg-border"
        aria-hidden="true"
      />
      <div class="relative z-10 flex flex-col">
        <ActivityTimelineItem
          v-for="(activity, index) in activities"
          :key="activity.id ?? `activity-${activity.timestamp ?? activity.createdAt ?? ''}`"
          :activity="activity"
          :all-activities="activities"
          :timeline-variant="timelineVariant"
          :show-thread-action="showThreadAction"
          :is-last="index === activities.length - 1"
          :compact-bottom-spacing="pairwiseSystemCompact(activities, index)"
          @activity-click="(a) => emit('activity-click', a)"
          @open-transcript="(a) => emit('open-transcript', a)"
          @add-activity="(action) => emit('add-activity', action)"
          @open-thread="(payload) => emit('open-thread', payload)"
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
  timelineVariant: {
    type: String,
    default: ''
  },
  dateLabel: {
    type: String,
    default: ''
  },
  showThreadAction: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['activity-click', 'open-transcript', 'add-activity', 'open-thread'])
</script>
