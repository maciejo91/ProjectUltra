<template>
  <div class="flex min-w-0 flex-col overflow-x-hidden overflow-y-visible pb-4">
    <section
      v-for="(group, groupIndex) in dayGroups"
      :key="group.dayKey"
      :class="groupIndex > 0 ? 'mt-6' : ''"
    >
      <h3 class="mb-2 text-sm font-medium leading-snug tracking-tight text-muted-foreground">
        {{ group.label }}
      </h3>
      <div class="relative overflow-visible pb-1">
        <div
          class="absolute left-3 top-0 bottom-0 w-px bg-border"
          aria-hidden="true"
        />
        <div class="relative z-10 flex flex-col gap-8">
          <template
            v-for="(activity, indexInGroup) in group.activities"
            :key="activityKey(activity, groupIndex, indexInGroup)"
          >
            <ActivityTimelineItem
              v-if="activity"
              :activity="activity"
              :all-activities="activities"
              :timeline-variant="timelineVariant"
              :show-thread-action="showThreadAction"
              :is-last-in-day-group="isLastInDayGroup(groupIndex, indexInGroup)"
              :is-last-in-timeline="isGlobalLast(groupIndex, indexInGroup)"
              :is-first-in-day-group="indexInGroup === 0"
              :compact-bottom-spacing="
                pairwiseSystemCompact(activities, globalIndex(groupIndex, indexInGroup))
              "
              @activity-click="(a) => emit('activity-click', a)"
              @open-transcript="(a) => emit('open-transcript', a)"
              @add-activity="(action) => emit('add-activity', action)"
              @open-thread="(payload) => emit('open-thread', payload)"
            />
          </template>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  groupActivitiesByTimelineDay,
  isActivityTimelineSystemHeadline
} from '@/composables/useActivityTimelinePresentation'
import ActivityTimelineItem from './ActivityTimelineItem.vue'

const props = defineProps({
  activities: {
    type: Array,
    required: true
  },
  timelineVariant: {
    type: String,
    default: ''
  },
  showThreadAction: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['activity-click', 'open-transcript', 'add-activity', 'open-thread'])

const { t } = useI18n()

const dayGroups = computed(() => groupActivitiesByTimelineDay(props.activities, t))

function activityKey(activity, groupIndex, indexInGroup) {
  if (!activity) return `activity-slot-${groupIndex}-${indexInGroup}`
  return activity.id ?? `activity-${activity.timestamp ?? activity.createdAt ?? groupIndex}-${indexInGroup}`
}

function globalIndex(groupIndex, indexInGroup) {
  let index = 0
  for (let g = 0; g < groupIndex; g++) {
    index += dayGroups.value[g]?.activities.length ?? 0
  }
  return index + indexInGroup
}

function isGlobalLast(groupIndex, indexInGroup) {
  return globalIndex(groupIndex, indexInGroup) === props.activities.length - 1
}

function isLastInDayGroup(groupIndex, indexInGroup) {
  const group = dayGroups.value[groupIndex]
  return indexInGroup === (group?.activities.length ?? 0) - 1
}

function pairwiseSystemCompact(list, index) {
  if (!list?.length || index >= list.length - 1) return false
  const a = list[index]
  const b = list[index + 1]
  if (!a || !b) return false
  return isActivityTimelineSystemHeadline(a) && isActivityTimelineSystemHeadline(b)
}
</script>
