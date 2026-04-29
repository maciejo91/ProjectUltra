<template>
  <div
    class="flex flex-col gap-3"
    :class="{
      'cursor-pointer transition-opacity hover:opacity-90': clickable,
      'mb-2': !isLast && compactBottomSpacing,
      'mb-8': !isLast && !compactBottomSpacing
    }"
    @click="onRowClick"
  >
    <div class="flex items-center gap-3">
      <div class="relative flex w-6 shrink-0 justify-center">
        <ActivityTimelineIcon :activity="activity" />
      </div>
      <p class="min-w-0 flex-1 text-sm leading-snug wrap-break-word">
        <span class="inline-flex min-w-0 flex-wrap items-baseline gap-x-1">
          <span
            :class="
              systemHeadline ? 'font-normal text-muted-foreground' : 'font-medium text-foreground'
            "
          >
            {{ headlineParts.primary }}
          </span>
          <span v-if="headlineParts.secondary" class="font-normal text-muted-foreground">{{
            headlineParts.secondary
          }}</span>
        </span>
        <span v-if="timeLabel" class="text-xs font-normal tabular-nums text-muted-foreground">
          · {{ timeLabel }}
        </span>
      </p>
    </div>

    <div v-if="showCard" class="ml-9 min-w-0">
      <template v-if="type === 'note' || type === 'ai-summary'">
        <ActivityTimelineCard :accent="cardAccent">
          <p class="text-sm leading-relaxed text-foreground wrap-break-word">
            {{ noteOrAiBody }}
          </p>
        </ActivityTimelineCard>
      </template>

      <template v-else-if="type === 'email' || type === 'customer-email'">
        <ActivityTimelineCard :accent="cardAccent">
          <p
            v-if="metadataLine"
            class="mb-2 text-xs leading-snug text-muted-foreground wrap-break-word"
          >
            {{ metadataLine }}
          </p>
          <p class="text-sm leading-relaxed text-foreground wrap-break-word">
            {{ activity.content }}
          </p>
          <div v-if="type === 'customer-email'" class="mt-3 flex justify-start">
            <Button
              variant="outline"
              size="sm"
              class="rounded-sm"
              @click.stop="emit('add-activity', 'email')"
            >
              <Reply class="size-3.5 shrink-0" />
              {{ t('entities.activity.reply') }}
            </Button>
          </div>
        </ActivityTimelineCard>
      </template>

      <template
        v-else-if="
          type === 'whatsapp' || type === 'customer-whatsapp' || type === 'sms' || type === 'customer-sms'
        "
      >
        <ActivityTimelineCard accent="messageGreen">
          <p
            v-if="metadataLine"
            class="mb-2 text-xs leading-snug text-muted-foreground wrap-break-word"
          >
            {{ metadataLine }}
          </p>
          <p class="text-sm leading-relaxed text-foreground wrap-break-word">
            {{ activity.content }}
          </p>
          <div v-if="type === 'customer-whatsapp'" class="mt-3 flex justify-start">
            <Button
              variant="outline"
              size="sm"
              class="rounded-sm"
              @click.stop="emit('add-activity', 'whatsapp')"
            >
              <Reply class="size-3.5 shrink-0" />
              {{ t('entities.activity.reply') }}
            </Button>
          </div>
        </ActivityTimelineCard>
      </template>

      <template v-else-if="type === 'call'">
        <ActivityTimelineCard accent="call">
          <p class="text-sm leading-relaxed text-foreground wrap-break-word">
            {{ callSummary }}
          </p>
          <Button
            v-if="transcriptLines.length > 0"
            variant="outline"
            size="sm"
            class="mt-3 rounded-sm"
            @click.stop="emit('open-transcript', activity)"
          >
            {{ t('common.call.showTranscript') }}
          </Button>
        </ActivityTimelineCard>
      </template>

      <template v-else-if="type === 'appointment'">
        <ActivityTimelineCard accent="appointment">
          <p class="text-sm font-medium leading-snug text-foreground">
            {{ activity.title || activity.message || t('entities.activity.timeline.appointmentFallback') }}
          </p>
          <div
            v-if="activity.location || activity.customerName || activity.vehicle"
            class="mt-2 space-y-1 text-sm leading-snug text-muted-foreground"
          >
            <p v-if="activity.location" class="wrap-break-word">{{ activity.location }}</p>
            <p v-if="activity.customerName" class="wrap-break-word">{{ activity.customerName }}</p>
            <p v-if="activity.vehicle" class="wrap-break-word">{{ activity.vehicle }}</p>
          </div>
        </ActivityTimelineCard>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@motork/component-library/future/primitives'
import { Reply } from 'lucide-vue-next'
import { formatTime } from '@/utils/formatters'
import {
  buildActivityHeadlineParts,
  isActivityTimelineSystemHeadline,
  getActivityCardAccent,
  getActivityMetadataLine,
  getCallSummaryText,
  getCallTranscriptLines,
  isActivityClickable,
  shouldShowActivityCard
} from '@/composables/useActivityTimelinePresentation'
import ActivityTimelineIcon from './ActivityTimelineIcon.vue'
import ActivityTimelineCard from './ActivityTimelineCard.vue'

const props = defineProps({
  activity: {
    type: Object,
    required: true
  },
  isLast: {
    type: Boolean,
    default: false
  },
  compactBottomSpacing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['activity-click', 'open-transcript', 'add-activity'])

const { t } = useI18n()

const type = computed(() => props.activity.type)

const timeLabel = computed(() => {
  const a = props.activity
  if (a.time) return a.time
  const ts = a.timestamp || a.createdAt
  return ts ? formatTime(ts) : ''
})

const headlineParts = computed(() => buildActivityHeadlineParts(props.activity, t))

const systemHeadline = computed(() => isActivityTimelineSystemHeadline(props.activity))

const transcriptLines = computed(() => getCallTranscriptLines(props.activity))

const showCard = computed(() => shouldShowActivityCard(props.activity, transcriptLines.value))

const cardAccent = computed(() => getActivityCardAccent(props.activity))

const metadataLine = computed(() => getActivityMetadataLine(props.activity, t))

const callSummary = computed(() => getCallSummaryText(props.activity, t))

const noteOrAiBody = computed(() => props.activity.message || props.activity.content || '')

const clickable = computed(() => isActivityClickable(props.activity))

function onRowClick() {
  if (clickable.value) {
    emit('activity-click', props.activity)
  }
}
</script>

<style scoped>
.wrap-break-word {
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
}
</style>
