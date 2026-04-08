<template>
  <header
    :class="headerRootClass"
    :aria-hidden="ariaHidden"
  >
    <template v-if="request">
      <div
        class="grid w-full min-w-0 grid-cols-1 gap-2 lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)] lg:items-start lg:gap-x-3"
      >
        <div class="flex min-w-0 items-start gap-2">
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
          <div class="flex min-w-0 flex-1 flex-col gap-0">
            <div class="flex w-full min-w-0 items-center justify-between gap-2">
              <div class="min-w-0 flex-1 overflow-hidden">
                <p class="truncate text-sm leading-tight whitespace-nowrap">
                  <span class="font-semibold text-foreground">{{ nameParts.primary || '—' }}</span>
                  <span class="text-sm font-normal text-muted-foreground">
                    <template v-if="customerCityLabel">{{ ' · ' }}{{ customerCityLabel }}</template>
                    <template v-if="nameParts.location">{{ ' · ' }}{{ nameParts.location }}</template>
                    {{ ' · ' }}{{ t('requestDetail.headerDetailLabelSource') }}
                  </span>
                  <span class="text-sm font-normal text-foreground">{{ ' ' + sourceLabel }}</span>
                </p>
              </div>
              <div class="flex shrink-0 flex-wrap items-center justify-end gap-0.5">
                <Button
                  v-for="item in quickActionItems"
                  :key="item.key"
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  class="shrink-0 rounded-md"
                  :aria-label="item.label"
                  @click="$emit('quick-action', item.key)"
                >
                  <component :is="item.icon" class="size-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
            <RequestInsightBanner
              v-if="showLeadAiSummary"
              compact
              class="mt-1.5"
              :message="aiSummary"
            />
          </div>
        </div>

        <div
          class="flex min-w-0 shrink-0 flex-wrap items-center justify-end gap-2 lg:justify-end"
        >
          <DropdownMenu :modal="false">
            <DropdownMenuTrigger as-child>
              <button
                type="button"
                class="shrink-0 rounded-full border border-transparent p-0 transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                :aria-label="lifecycleAriaLabel || t('requestDetail.headerLifecycleMenuAria')"
              >
                <RequestHeaderLifecycleStepper :steps="lifecycleSteps" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="max-h-64 min-w-48 overflow-y-auto p-1.5" align="end">
              <DropdownMenuItem
                v-for="stage in statusOptions"
                :key="stage"
                class="flex cursor-pointer items-center rounded-sm px-2 py-1.5"
                @select="emit('update-status', stage)"
              >
                <span
                  class="inline-flex items-center rounded px-1.5 py-0.5 text-sm font-medium leading-none"
                  :class="[
                    getStageColorClass(stage),
                    stage === displayStage && 'ring-1 ring-ring ring-inset'
                  ]"
                >
                  {{ stage }}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div class="flex shrink-0 items-center gap-2">
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
    </template>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ChevronLeft,
  ChevronRight,
  X,
  Mail,
  MessageCircle,
  PhoneCall,
  Plus,
  StickyNote
} from 'lucide-vue-next'
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@motork/component-library/future/primitives'
import RequestHeaderLifecycleStepper from './RequestHeaderLifecycleStepper.vue'
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
  }
})

const emit = defineEmits(['close', 'previous', 'next', 'update-status', 'quick-action'])

const { t } = useI18n()

const isFullWidthLayout = computed(() => props.layout === 'fullWidth')

const headerRootClass = computed(() => {
  const base =
    'flex min-w-0 shrink-0 flex-wrap items-center gap-2 border-b border-border bg-background px-2 py-2 md:gap-3 md:px-4'
  if (isFullWidthLayout.value) {
    return [base, 'w-full']
  }
  return [
    base,
    'sticky top-0 z-40',
    props.show
      ? ''
      : 'pointer-events-none h-0 overflow-hidden border-0 py-0 opacity-0'
  ]
})

const ariaHidden = computed(() => {
  if (isFullWidthLayout.value) return false
  return !props.show
})

const nameParts = computed(() => getCustomerNameParts(props.request?.customer?.name))

const customerCityLabel = computed(() => getCustomerCityLabel(props.request?.customer))

const sourceLabel = computed(() => props.request?.source || '—')

const showLeadAiSummary = computed(
  () => props.request?.type === 'lead' && Boolean(props.aiSummary?.trim())
)

const quickActionItems = computed(() => [
  { key: 'phone', icon: PhoneCall, label: t('requestDetail.quickActions.phone') },
  { key: 'email', icon: Mail, label: t('requestDetail.quickActions.email') },
  { key: 'whatsapp', icon: MessageCircle, label: t('requestDetail.quickActions.whatsapp') },
  { key: 'document', icon: StickyNote, label: t('requestDetail.quickActions.document') },
  { key: 'more', icon: Plus, label: t('requestDetail.quickActions.more') }
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
