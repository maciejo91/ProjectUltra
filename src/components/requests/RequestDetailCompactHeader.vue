<template>
  <header
    :class="headerRootClass"
    :aria-hidden="ariaHidden"
  >
    <template v-if="request">
      <div
        class="grid w-full min-w-0 grid-cols-1 gap-2 lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)] lg:items-center lg:gap-x-3"
      >
        <div class="flex min-w-0 items-center gap-2">
          <Button
            v-if="isFullPage"
            variant="ghost"
            size="icon-sm"
            class="size-10 shrink-0 rounded-md"
            :aria-label="t('requestDetail.headerBack')"
            @click="$emit('close')"
          >
            <ChevronLeft class="size-4 text-muted-foreground" />
          </Button>
          <div
            v-else
            class="size-10 shrink-0"
            aria-hidden="true"
          />
          <div class="flex min-w-0 flex-1 flex-col justify-center gap-0">
            <div class="flex w-full min-w-0 items-center justify-between gap-2">
              <div class="min-w-0 flex-1 overflow-hidden">
                <div class="flex min-w-0 items-center gap-1.5 text-sm leading-none whitespace-nowrap">
                  <span class="font-semibold text-foreground">{{ nameParts.primary || '—' }}</span>
                  <span class="text-sm font-normal text-muted-foreground">
                    <template v-if="customerCityLabel">{{ ' · ' }}{{ customerCityLabel }}</template>
                    {{ ' · ' }}{{ t('requestDetail.headerDetailLabelSource') }}
                  </span>
                  <span class="text-sm font-normal text-foreground">{{ ' ' + headerDetailSourceLabel }}</span>
                  <template v-if="showLeadAiSummary">
                    <span class="text-muted-foreground" aria-hidden>·</span>
                    <Popover
                      :open="aiSummaryOpen"
                      @update:open="(value) => (aiSummaryOpen = value)"
                    >
                      <PopoverTrigger as-child>
                        <button
                          type="button"
                          class="mk-ai-insight-banner inline-flex h-7 min-w-0 flex-1 items-center gap-2 rounded-lg px-3 text-left text-sm font-medium text-foreground hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          :aria-label="t('entities.activity.aiSummaryHeadline')"
                        >
                          <span class="inline-flex shrink-0 origin-center" aria-hidden="true">
                            <Sparkles
                              :size="16"
                              class="mk-sparkles-icon shrink-0"
                              fill="url(#sparkles-gradient)"
                            />
                          </span>
                          <span class="truncate">{{ aiSummaryText }}</span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="start"
                        class="z-50 w-96 max-w-full rounded-lg border border-border bg-background p-3 shadow-mk-dashboard-card"
                      >
                        <RequestInsightBanner compact :message="aiSummaryText" />
                      </PopoverContent>
                    </Popover>
                  </template>
                </div>
              </div>
              <div class="flex shrink-0 flex-wrap items-center justify-end gap-0.5">
                <template v-for="item in quickActionItems" :key="item.kind || item.key">
                  <MessagingQuickActionPopover
                    v-if="item.kind === 'messaging'"
                    @select="$emit('quick-action', $event)"
                  />
                  <Button
                    v-else
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    class="shrink-0 rounded-md"
                    :aria-label="item.label"
                    @click="$emit('quick-action', item.key)"
                  >
                    <component :is="item.icon" class="size-4 text-muted-foreground" />
                  </Button>
                </template>
              </div>
            </div>
          </div>
        </div>

        <div class="flex min-w-0 shrink-0 flex-wrap items-center justify-end gap-1 self-center lg:justify-end">
          <div class="inline-flex h-10 shrink-0 items-center rounded-md px-3">
            <RequestHeaderLifecycleStepper :steps="lifecycleSteps" />
          </div>

          <div class="ml-1 flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              class="rounded-md"
              :disabled="!hasPrevious"
              @click="$emit('previous')"
            >
              <ChevronLeft class="size-4 text-muted-foreground" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              class="rounded-md"
              :disabled="!hasNext"
              @click="$emit('next')"
            >
              <ChevronRight class="size-4 text-muted-foreground" />
            </Button>
            <Button
              v-if="!isFullPage"
              variant="outline"
              size="icon-sm"
              class="rounded-md"
              :aria-label="t('common.buttons.close')"
              @click="$emit('close')"
            >
              <X class="size-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>

      <div
        v-if="showTagsRow"
        class="mt-1 flex w-full min-w-0 flex-wrap items-center gap-1 pl-12"
      >
        <TagPillWithPopover
          v-for="(tag, tagIdx) in headerRequestTags"
          :key="`${tag.name}-${tagIdx}`"
          :tag="tag"
          @edit="emit('edit-request-tag', $event)"
          @delete="emit('delete-request-tag', $event)"
        >
          <template #trigger>
            <button
              v-if="tag.color"
              type="button"
              class="inline-flex max-w-full min-w-0 cursor-pointer items-center truncate rounded-md border-0 px-2 py-0.5 text-sm font-medium leading-none"
              :class="isLightTagColor(tag.color) ? 'text-foreground' : 'text-white'"
              :style="{ backgroundColor: tag.color }"
            >
              {{ tag.name }}
            </button>
            <button
              v-else
              type="button"
              class="inline-flex cursor-pointer items-center rounded-md border-0 px-2 py-0.5 text-sm font-medium leading-none"
              :class="headerTagBadgeClass(tag.name)"
            >
              {{ tag.name }}
            </button>
          </template>
        </TagPillWithPopover>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          class="size-6 shrink-0 rounded-md text-muted-foreground"
          :aria-label="t('requestDetail.contactCard.addTag')"
          @click="emit('add-request-tag')"
        >
          <Plus class="size-3" />
        </Button>
      </div>
    </template>
  </header>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ChevronLeft,
  ChevronRight,
  X,
  Mail,
  PhoneCall,
  StickyNote,
  Plus,
  Sparkles
} from 'lucide-vue-next'
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@motork/component-library/future/primitives'
import RequestHeaderLifecycleStepper from './RequestHeaderLifecycleStepper.vue'
import TagPillWithPopover from '@/components/shared/TagPillWithPopover.vue'
import MessagingQuickActionPopover from '@/components/shared/MessagingQuickActionPopover.vue'
import RequestInsightBanner from './RequestInsightBanner.vue'
import { getDisplayStage, getStageColor } from '@/utils/stageMapper'
import { LEAD_STAGES, OPPORTUNITY_STAGES } from '@/utils/stageMapper/constants'
import { getCustomerCityLabel, getCustomerNameParts } from '@/utils/customerDisplay'

const props = defineProps({
  request: {
    type: Object,
    default: null
  },
  filteredRequests: {
    type: Array,
    default: () => []
  },
  isFullPage: {
    type: Boolean,
    default: false
  },
  show: {
    type: Boolean,
    default: false
  },
  layout: {
    type: String,
    default: 'sticky'
  },
  aiSummary: {
    type: String,
    default: ''
  },
  showTags: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([
  'close',
  'previous',
  'next',
  'update-status',
  'quick-action',
  'add-request-tag',
  'edit-request-tag',
  'delete-request-tag'
])

const { t } = useI18n()
const aiSummaryOpen = ref(false)

const isFullWidthLayout = computed(() => props.layout === 'fullWidth')
const isCompactStickyLayout = computed(() => props.layout === 'sticky')
const showTagsRow = computed(() => props.showTags && isFullWidthLayout.value)

const headerRootClass = computed(() => {
  const base = isFullWidthLayout.value
    ? 'flex min-w-0 shrink-0 flex-wrap items-center gap-2 border-b border-border bg-background px-2 py-2 md:gap-3 md:px-4'
    : 'flex min-w-0 shrink-0 flex-wrap items-center gap-2 border-b border-border bg-background px-2 py-1 md:gap-3 md:px-4'
  if (isFullWidthLayout.value) {
    return [base, 'w-full']
  }
  return [
    base,
    'sticky top-0 z-50 shadow-sm',
    props.show
      ? ''
      : 'pointer-events-none h-0 overflow-hidden border-0 py-0 opacity-0'
  ]
})

const ariaHidden = computed(() => {
  if (isFullWidthLayout.value) return false
  return !props.show
})

const headerRequestTags = computed(() => {
  const tags = props.request?.tags
  if (!Array.isArray(tags)) return []
  return tags
    .filter(Boolean)
    .slice(0, 6)
    .map((item) =>
      typeof item === 'string'
        ? { name: item, color: null }
        : { name: item.name, color: item.color || null }
    )
})

function isLightTagColor(hex) {
  if (!hex || typeof hex !== 'string') return false
  const m = hex.replace(/^#/, '').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
  if (!m) return false
  const r = parseInt(m[1], 16) / 255
  const g = parseInt(m[2], 16) / 255
  const b = parseInt(m[3], 16) / 255
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luminance > 0.5
}

function headerTagBadgeClass(name) {
  const s = String(name).toLowerCase()
  if (s.includes('vip')) {
    return 'bg-purple-100 text-purple-600'
  }
  if (s.includes('green') || s.includes('eco') || s.includes('electric')) {
    return 'bg-green-100 text-green-600'
  }
  return 'bg-muted text-muted-foreground'
}

const nameParts = computed(() => getCustomerNameParts(props.request?.customer?.name))

const customerCityLabel = computed(() => getCustomerCityLabel(props.request?.customer))

const headerDetailSourceLabel = computed(() => {
  const r = props.request
  if (!r) return '—'
  return r.sourceCategory ?? (r.source || '—')
})

const aiSummaryText = computed(() => props.aiSummary?.trim() || '')
const showLeadAiSummary = computed(
  () => props.request?.type === 'lead' && Boolean(aiSummaryText.value)
)

const quickActionItems = computed(() => [
  { key: 'phone', icon: PhoneCall, label: t('requestDetail.quickActions.phone') },
  { key: 'email', icon: Mail, label: t('requestDetail.quickActions.email') },
  { kind: 'messaging' },
  { key: 'note', icon: StickyNote, label: t('requestDetail.quickActions.addNote') }
])

const displayStage = computed(() => {
  if (!props.request) return ''
  return getDisplayStage(props.request, props.request.type || 'lead') || 'Open'
})

function isTerminalClosedStage(stage, type) {
  if (!stage) return false
  if (type === 'lead') {
    return [
      LEAD_STAGES.CLOSED_INVALID,
      LEAD_STAGES.CLOSED_NOT_INTERESTED,
      LEAD_STAGES.CLOSED_DUPLICATE
    ].includes(stage)
  }
  return [
    OPPORTUNITY_STAGES.CLOSED_WON,
    OPPORTUNITY_STAGES.CLOSED_LOST,
    OPPORTUNITY_STAGES.ABANDONED
  ].includes(stage)
}

function isOpenPhaseStage(stage, type) {
  if (type === 'lead') {
    return stage === LEAD_STAGES.NEW
  }
  return (
    stage === OPPORTUNITY_STAGES.QUALIFIED ||
    stage === OPPORTUNITY_STAGES.AWAITING_APPOINTMENT
  )
}

const lifecycleSteps = computed(() => {
  if (!props.request) return []
  const type = props.request.type || 'lead'
  const stage = displayStage.value
  let openState = 'upcoming'
  let midState = 'upcoming'
  let closedState = 'upcoming'

  if (isTerminalClosedStage(stage, type)) {
    openState = 'complete'
    midState = 'complete'
    closedState = 'complete'
  } else if (isOpenPhaseStage(stage, type)) {
    openState = 'current'
  } else {
    openState = 'complete'
    midState = 'current'
  }

  return [
    { key: 'open', label: t('requestDetail.headerLifecycleOpen'), state: openState },
    { key: 'mid', label: t('requestDetail.headerLifecycleInProgress'), state: midState },
    { key: 'closed', label: t('requestDetail.headerLifecycleClosed'), state: closedState }
  ]
})

const lifecycleAriaLabel = computed(() => {
  if (!lifecycleSteps.value.length) return ''
  return lifecycleSteps.value
    .map((s) => {
      const stateKey =
        s.state === 'complete'
          ? 'requestDetail.headerLifecycleStateComplete'
          : s.state === 'current'
            ? 'requestDetail.headerLifecycleStateCurrent'
            : 'requestDetail.headerLifecycleStateUpcoming'
      return `${s.label}: ${t(stateKey)}`
    })
    .join(', ')
})

function getStageColorClass(stage) {
  if (!props.request) return 'bg-muted text-muted-foreground'
  return getStageColor(stage, props.request.type || 'lead')
}

const statusOptions = computed(() => {
  if (!props.request) return []
  if (props.request.type === 'lead') {
    return Object.values(LEAD_STAGES)
  }
  return [
    OPPORTUNITY_STAGES.QUALIFIED,
    OPPORTUNITY_STAGES.AWAITING_APPOINTMENT,
    OPPORTUNITY_STAGES.APPOINTMENT_SCHEDULED,
    OPPORTUNITY_STAGES.IN_NEGOTIATION,
    `${OPPORTUNITY_STAGES.IN_NEGOTIATION} - Offer Sent`,
    `${OPPORTUNITY_STAGES.IN_NEGOTIATION} - Awaiting Offer`,
    OPPORTUNITY_STAGES.OFFER_FEEDBACK_MISSING,
    OPPORTUNITY_STAGES.CONTRACT_PENDING,
    OPPORTUNITY_STAGES.CLOSED_WON,
    OPPORTUNITY_STAGES.CLOSED_LOST,
    OPPORTUNITY_STAGES.ABANDONED
  ]
})

const currentIndex = computed(() => {
  const requestId = props.request?.compositeId
  if (!requestId || !props.filteredRequests?.length) return -1
  const idStr = String(requestId)
  return props.filteredRequests.findIndex(
    (r) =>
      String(r.compositeId) === idStr ||
      (r.type === props.request?.type && String(r.id) === String(props.request?.id))
  )
})

const hasPrevious = computed(() => currentIndex.value > 0)
const hasNext = computed(
  () => currentIndex.value >= 0 && currentIndex.value < props.filteredRequests.length - 1
)
</script>
