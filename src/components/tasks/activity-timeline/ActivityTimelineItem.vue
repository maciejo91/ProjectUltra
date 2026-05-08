<template>
  <div
    class="flex flex-col"
    :class="{
      'cursor-pointer transition-opacity hover:opacity-90': clickable,
      'border-b border-border': showRowSeparator,
      'mb-5': !isLast && isSophieAnchoredVariant,
      'py-2': !isLast && !isSophieAnchoredVariant && compactBottomSpacing,
      'py-4': !isLast && !isSophieAnchoredVariant && !compactBottomSpacing,
      'gap-3': isSophieAnchoredVariant,
      'gap-2': !isSophieAnchoredVariant && isSophieCondensedCommunication,
      'gap-2': !isSophieAnchoredVariant && !isSophieCondensedCommunication
    }"
    @click="onRowClick"
  >
      <div
      class="flex min-w-0 items-center"
      :class="isRightAlignedEffective ? 'justify-end' : 'justify-start'"
    >
      <div :class="isCommunicationActivity || isCallActivity ? 'w-full sm:w-2/3' : 'w-full'">
        <div
          class="flex min-w-0 items-center"
          :class="[
            isRightAlignedEffective ? 'justify-end' : 'justify-start',
            isSophieAnchoredVariant ? 'gap-2' : 'gap-3'
          ]"
        >
          <div class="relative flex w-8 shrink-0 justify-center">
            <ActivityTimelineIcon :activity="activity" />
          </div>
          <p
            class="min-w-0 text-sm leading-snug wrap-break-word"
            :class="[
              isRightAlignedEffective ? 'text-right' : 'text-left',
              ''
            ]"
          >
            <span class="inline-flex min-w-0 flex-wrap items-baseline gap-x-1">
              <span
                :class="
                  systemHeadline ? 'font-normal text-muted-foreground' : 'font-medium text-foreground'
                "
              >
                {{ headlineParts.primary }}
              </span>
              <template v-if="type === 'call'">
                <span class="inline-flex flex-wrap items-center gap-1.5">
                  <span
                    v-if="callStatusPill.label"
                    class="rounded-full px-2 py-0.5 text-xs font-medium"
                    :class="callStatusPill.className"
                  >
                    {{ callStatusPill.label }}
                  </span>
                </span>
              </template>
              <span
                v-else-if="headlineParts.secondary"
                class="font-normal"
                :class="secondaryToneClass"
              >
                {{ headlineParts.secondary }}
              </span>
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
      :class="[
        isRightAlignedEffective ? 'flex justify-end' : '',
        outboundCardShiftClass,
        isSophieAnchoredVariant ? 'mt-1' : (isSophieCondensedCommunication ? 'mt-1' : '')
      ]"
    >
      <template v-if="type === 'note'">
        <ActivityTimelineCard
          :accent="cardAccent"
          surface="background"
        >
          <p class="text-sm leading-relaxed text-foreground wrap-break-word">
            {{ noteOrAiBody }}
          </p>
        </ActivityTimelineCard>
      </template>

      <template v-else-if="type === 'ai-summary'">
        <ActivityTimelineCard
          :accent="cardAccent"
          surface="background"
          class="border-foreground/12"
        >
          <p class="text-sm leading-relaxed text-foreground wrap-break-word">
            {{ noteOrAiBody }}
          </p>
        </ActivityTimelineCard>
      </template>

      <template v-else-if="type === 'email' || type === 'customer-email'">
        <ActivityTimelineCard
          :accent="cardAccent"
          :surface="isInboundCommunication ? 'background' : 'muted'"
          :show-accent="!(isSophieAnchoredVariant && !isInboundCommunication)"
          :inner-padding-class="communicationCardInnerPaddingClass"
          :class="[
            isSophieAnchoredVariant && !isInboundCommunication
              ? 'border-transparent bg-muted shadow-none'
              : isInboundCommunication
                ? isSophieAnchoredVariant
                  ? 'border-foreground/5 shadow-mk-dashboard-card'
                  : 'border-foreground/12'
                : 'border-transparent'
          ]"
          class="w-full sm:w-2/3"
        >
          <p
            class="text-sm leading-relaxed wrap-break-word text-left"
            :class="isSophieAnchoredVariant && !isInboundCommunication ? 'text-muted-foreground' : 'text-foreground'"
          >
            {{ activity.content }}
          </p>
          <div
            v-if="type === 'customer-email' || (showThreadAction && threadId)"
            class="flex flex-wrap gap-2"
            :class="isSophieCondensedCommunication ? 'mt-2' : 'mt-3'"
          >
            <Button
              v-if="showThreadAction && threadId"
              variant="link"
              size="sm"
              class="h-auto gap-2 px-0 py-0 font-medium text-primary"
              @click.stop="emit('open-thread', { threadId, kind: threadKind, activity: props.activity })"
            >
              <span>
                {{
                  threadKind === 'thread'
                    ? t('entities.activity.timeline.viewThreadShort')
                    : t('entities.activity.timeline.viewConversationShort')
                }}
              </span>
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
          :surface="isInboundCommunication ? 'background' : 'muted'"
          :show-accent="!(isSophieAnchoredVariant && !isInboundCommunication)"
          :inner-padding-class="communicationCardInnerPaddingClass"
          :class="[
            isSophieAnchoredVariant && !isInboundCommunication
              ? 'border-transparent bg-muted shadow-none'
              : isInboundCommunication
                ? isSophieAnchoredVariant
                  ? 'border-foreground/5 shadow-mk-dashboard-card'
                  : 'border-foreground/12'
                : 'border-transparent'
          ]"
          class="w-full sm:w-2/3"
        >
          <p
            class="text-sm leading-relaxed wrap-break-word text-left"
            :class="isSophieAnchoredVariant && !isInboundCommunication ? 'text-muted-foreground' : 'text-foreground'"
          >
            {{ activity.content }}
          </p>
          <div
            v-if="type === 'customer-whatsapp' || (showThreadAction && threadId)"
            class="flex flex-wrap gap-2"
            :class="isSophieCondensedCommunication ? 'mt-2' : 'mt-3'"
          >
            <Button
              v-if="showThreadAction && threadId"
              variant="link"
              size="sm"
              class="h-auto gap-2 px-0 py-0 font-medium text-primary"
              @click.stop="emit('open-thread', { threadId, kind: threadKind, activity: props.activity })"
            >
              <span>
                {{
                  threadKind === 'thread'
                    ? t('entities.activity.timeline.viewThreadShort')
                    : t('entities.activity.timeline.viewConversationShort')
                }}
              </span>
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
import { ArrowDownLeft, ArrowUpRight } from 'lucide-vue-next'
import { Button } from '@motork/component-library/future/primitives'
import { formatTime } from '@/utils/formatters'
import {
  buildActivityHeadlineParts,
  isActivityTimelineSystemHeadline,
  getActivityCardAccent,
  getCallSummaryText,
  getCallTranscriptLines,
  isActivityClickable,
  shouldShowActivityCard,
  getActivityIconKind
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
  timelineVariant: {
    type: String,
    default: ''
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

const headlineParts = computed(() => buildActivityHeadlineParts(props.activity, t, props.allActivities))
const secondaryToneClass = computed(() => {
  const secondary = headlineParts.value.secondary || ''
  if (type.value !== 'call') return 'text-muted-foreground'
  const v = secondary.toLowerCase()
  if (v.includes('no answer')) return 'text-destructive'
  if (v.includes('answered')) return 'text-emerald-700'
  return 'text-muted-foreground'
})
const iconKind = computed(() => getActivityIconKind(props.activity))

const systemHeadline = computed(() => isActivityTimelineSystemHeadline(props.activity))

const callStatusPill = computed(() => {
  const raw = (props.activity?.message || props.activity?.content || props.activity?.data?.summary || '').toLowerCase()
  if (raw.includes('no answer')) {
    if (isInboundCall.value) {
      return { label: t('entities.activity.timeline.callPills.missed'), className: 'bg-orange-100 text-orange-700' }
    }
    return { label: t('entities.activity.timeline.callPills.noAnswer'), className: 'bg-destructive/15 text-destructive' }
  }
  if (raw.includes('answered')) {
    const original = String(props.activity?.message || props.activity?.content || props.activity?.data?.summary || '')
    const durationMatch =
      original.match(/(\d+\s*m\s*\d+\s*s|\d+\s*s|\d+:\d{2})/i)?.[1] ?? ''
    return { label: durationMatch.trim(), className: 'bg-muted text-muted-foreground' }
  }
  return { label: '', className: '' }
})

const transcriptLines = computed(() => getCallTranscriptLines(props.activity))

const showCard = computed(() => shouldShowActivityCard(props.activity, transcriptLines.value))

const cardAccent = computed(() => getActivityCardAccent(props.activity))

const callSummary = computed(() => getCallSummaryText(props.activity, t))

const noteOrAiBody = computed(() => props.activity.message || props.activity.content || '')

const isCommunicationActivity = computed(() =>
  ['email', 'customer-email', 'whatsapp', 'customer-whatsapp', 'sms', 'customer-sms'].includes(type.value)
)

const isInboundCommunication = computed(() =>
  ['customer-email', 'customer-whatsapp', 'customer-sms'].includes(type.value)
)

const isCallActivity = computed(() => type.value === 'call')

const isInboundCall = computed(() => {
  const a = props.activity
  const explicit = String(a?.data?.direction || '').toLowerCase()
  if (explicit === 'inbound') return true
  if (explicit === 'outbound') return false
  const action = `${a?.action ?? ''} ${a?.message ?? ''} ${a?.content ?? ''}`.toLowerCase()
  if (action.includes('inbound')) return true
  return false
})

const isRightAligned = computed(() => {
  if (isCommunicationActivity.value) return !isInboundCommunication.value
  if (isCallActivity.value) return !isInboundCall.value
  return false
})

const isSophieAnchoredVariant = computed(() => props.timelineVariant === 'sophieAnchored')

const isRightAlignedEffective = computed(() => {
  if (isSophieAnchoredVariant.value) return false
  return isRightAligned.value
})

const showRowSeparator = computed(() => {
  if (isSophieAnchoredVariant.value) return false
  return !props.isLast && !(systemHeadline.value && props.compactBottomSpacing)
})

const isOutboundCommunication = computed(() => {
  if (!isCommunicationActivity.value) return false
  return !isInboundCommunication.value
})

const outboundCardShiftClass = computed(() => {
  if (!isSophieAnchoredVariant.value) return ''
  if (!isOutboundCommunication.value) return ''
  return 'translate-x-6'
})

const showMessagePills = computed(() => {
  if (!isSophieAnchoredVariant.value) return false
  return isCommunicationActivity.value
})

const isSophieCondensedCommunication = computed(() => {
  if (!isSophieAnchoredVariant.value) return false
  return isCommunicationActivity.value
})

const communicationMutedOutboundShell = computed(
  () => isSophieAnchoredVariant.value && !isInboundCommunication.value
)

const communicationCardInnerPaddingClass = computed(() => {
  if (communicationMutedOutboundShell.value) return 'py-3 px-3'
  if (!communicationMutedOutboundShell.value && isSophieCondensedCommunication.value) {
    return 'py-2 pr-3.5 pl-4'
  }
  return 'py-3.5 pr-3.5 pl-4'
})

const communicationChannelPillLabel = computed(() => {
  if (!isCommunicationActivity.value) return ''
  if (['email', 'customer-email'].includes(type.value)) return t('entities.activity.timeline.channels.email')
  if (['sms', 'customer-sms'].includes(type.value)) return t('entities.activity.timeline.channels.sms')
  if (['whatsapp', 'customer-whatsapp'].includes(type.value)) return t('entities.activity.timeline.channels.whatsapp')
  return ''
})

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
