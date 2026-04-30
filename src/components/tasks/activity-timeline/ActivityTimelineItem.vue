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
    <div
      class="flex min-w-0 items-center"
      :class="isCommunicationActivity && !isInboundCommunication ? 'justify-end' : 'justify-start'"
    >
      <div :class="isCommunicationActivity ? 'w-full sm:w-2/3' : 'w-full'">
        <div
          class="flex min-w-0 items-center gap-3"
          :class="isCommunicationActivity && !isInboundCommunication ? 'justify-end' : 'justify-start'"
        >
          <div class="relative flex w-6 shrink-0 justify-center">
            <ActivityTimelineIcon :activity="activity" />
          </div>
          <p
            class="min-w-0 text-sm leading-snug wrap-break-word"
            :class="isCommunicationActivity && !isInboundCommunication ? 'text-right' : 'text-left'"
          >
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
      </div>
    </div>

    <div
      v-if="showCard"
      class="ml-9 min-w-0"
      :class="isCommunicationActivity && !isInboundCommunication ? 'flex justify-end' : ''"
    >
      <template v-if="type === 'note' || type === 'ai-summary'">
        <ActivityTimelineCard :accent="cardAccent" surface="background">
          <p class="text-sm leading-relaxed text-foreground wrap-break-word">
            {{ noteOrAiBody }}
          </p>
        </ActivityTimelineCard>
      </template>

      <template v-else-if="type === 'email' || type === 'customer-email'">
        <ActivityTimelineCard
          :accent="cardAccent"
          :surface="isInboundCommunication ? 'muted' : 'background'"
          class="w-full sm:w-2/3"
        >
          <p
            v-if="metadataLine"
            class="mb-2 text-xs leading-snug text-muted-foreground wrap-break-word text-left"
          >
            {{ metadataLine }}
          </p>
          <p
            class="text-sm leading-relaxed text-foreground wrap-break-word text-left"
          >
            {{ activity.content }}
          </p>
          <div
            v-if="type === 'customer-email' || (showThreadAction && threadId)"
            class="mt-3 flex flex-wrap gap-2"
          >
            <Button
              v-if="showThreadAction && threadId"
              variant="outline"
              size="sm"
              class="rounded-sm"
              @click.stop="emit('open-thread', { threadId, kind: threadKind })"
            >
              {{
                threadKind === 'thread'
                  ? t('entities.activity.timeline.viewThread', { count: threadCount })
                  : t('entities.activity.timeline.viewConversation', { count: threadCount })
              }}
            </Button>
          </div>
        </ActivityTimelineCard>
      </template>

      <template
        v-else-if="
          type === 'whatsapp' || type === 'customer-whatsapp' || type === 'sms' || type === 'customer-sms'
        "
      >
        <ActivityTimelineCard
          :accent="cardAccent"
          :surface="isInboundCommunication ? 'muted' : 'background'"
          class="w-full sm:w-2/3"
        >
          <p
            v-if="metadataLine"
            class="mb-2 text-xs leading-snug text-muted-foreground wrap-break-word text-left"
          >
            {{ metadataLine }}
          </p>
          <p
            class="text-sm leading-relaxed text-foreground wrap-break-word text-left"
          >
            {{ activity.content }}
          </p>
          <div
            v-if="type === 'customer-whatsapp' || (showThreadAction && threadId)"
            class="mt-3 flex flex-wrap gap-2"
          >
            <Button
              v-if="showThreadAction && threadId"
              variant="outline"
              size="sm"
              class="rounded-sm"
              @click.stop="emit('open-thread', { threadId, kind: threadKind })"
            >
              {{
                threadKind === 'thread'
                  ? t('entities.activity.timeline.viewThread', { count: threadCount })
                  : t('entities.activity.timeline.viewConversation', { count: threadCount })
              }}
            </Button>
          </div>
        </ActivityTimelineCard>
      </template>

      <template v-else-if="type === 'call'">
        <ActivityTimelineCard accent="call" :show-accent="false">
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
  allActivities: {
    type: Array,
    default: () => []
  },
  showThreadAction: {
    type: Boolean,
    default: true
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

const emit = defineEmits(['activity-click', 'open-transcript', 'add-activity', 'open-thread'])

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

const isCommunicationActivity = computed(() =>
  ['email', 'customer-email', 'whatsapp', 'customer-whatsapp', 'sms', 'customer-sms'].includes(type.value)
)

const isInboundCommunication = computed(() =>
  ['customer-email', 'customer-whatsapp', 'customer-sms'].includes(type.value)
)

const threadId = computed(() => props.activity?.data?.threadId || props.activity?.threadId || null)

const threadKind = computed(() => {
  if (!threadId.value) return null
  return ['email', 'customer-email'].includes(type.value) ? 'thread' : 'conversation'
})

const threadCount = computed(() => {
  if (!threadId.value) return 0
  const list = Array.isArray(props.allActivities) ? props.allActivities : []
  return list.filter((a) => (a?.data?.threadId || a?.threadId) === threadId.value).length
})

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
