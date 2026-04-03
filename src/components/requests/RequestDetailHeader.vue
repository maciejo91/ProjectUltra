<template>
  <header
    class="sticky top-0 z-30 flex shrink-0 flex-col border-b border-border bg-background"
  >
    <div
      class="flex w-full min-w-0 flex-col gap-3 px-2 py-3 md:px-4 lg:flex-row lg:items-start lg:justify-between lg:gap-6"
    >
      <div class="flex min-w-0 flex-1 flex-col gap-2">
        <div class="flex min-w-0 flex-col gap-1">
          <div class="flex flex-wrap items-center gap-x-2 gap-y-1.5 min-w-0">
            <Button
              v-if="isFullPage"
              variant="ghost"
              size="icon-sm"
              class="shrink-0 rounded-md"
              :aria-label="t('requestDetail.headerBack')"
              @click="$emit('close')"
            >
              <ChevronLeft class="size-4 text-muted-foreground" />
            </Button>

            <div class="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
              <div class="flex min-w-0 max-w-full flex-wrap items-baseline gap-x-1.5 gap-y-0">
                <DropdownMenu v-if="request" :modal="false">
                  <DropdownMenuTrigger as-child>
                    <button
                      type="button"
                      class="inline-flex max-w-full min-w-0 items-baseline gap-x-1.5 text-left rounded-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <span class="truncate text-base font-semibold text-foreground">{{
                        primaryTitleText
                      }}</span>
                      <span class="shrink-0 text-sm text-muted-foreground">{{
                        typeLabelText
                      }}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent class="min-w-56 p-1.5" align="start">
                    <DropdownMenuItem
                      class="flex cursor-pointer rounded-sm px-2 py-1.5 text-sm"
                      @select="copyTitleToClipboard"
                    >
                      {{ t('requestDetail.copyTitle') }}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <span
                  v-else
                  class="min-w-0 truncate text-base font-semibold text-foreground"
                >
                  {{ primaryTitleText }}
                </span>
              </div>

              <span
                v-if="request"
                class="inline-flex shrink-0 items-center gap-1 text-sm tabular-nums text-muted-foreground"
                :aria-label="`${t('requestDetail.created')}: ${createdLabel}`"
              >
                <Sun class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span>{{ createdLabel }}</span>
              </span>

              <Button
                v-if="request"
                type="button"
                variant="ghost"
                size="icon-sm"
                class="shrink-0 rounded-md size-6"
                :aria-expanded="headerDetailsExpanded"
                :aria-controls="headerDetailsPanelId"
                :aria-label="
                  headerDetailsExpanded
                    ? t('requestDetail.collapseHeaderDetails')
                    : t('requestDetail.expandHeaderDetails')
                "
                @click="headerDetailsExpanded = !headerDetailsExpanded"
              >
                <ChevronDown
                  class="size-3 text-muted-foreground transition-transform duration-200"
                  :class="{ 'rotate-180': headerDetailsExpanded }"
                  aria-hidden
                />
              </Button>
            </div>
          </div>

          <div
            v-if="request && headerDetailsExpanded"
            :id="headerDetailsPanelId"
            class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-2 w-full min-w-0 text-sm"
            :class="isFullPage ? 'pl-8' : ''"
          >
            <span
              class="inline-flex items-center gap-1 shrink-0 tabular-nums"
              :aria-label="`${t('requestDetail.created')}: ${createdLabel}`"
            >
              <Upload class="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <span class="text-foreground">{{ createdLabel }}</span>
            </span>
            <span class="text-muted-foreground shrink-0" aria-hidden>·</span>
            <span
              class="inline-flex items-center gap-1 shrink-0 tabular-nums"
              :aria-label="`${t('requestDetail.lastUpdated')}: ${updatedLabel}`"
            >
              <RefreshCw class="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <span class="text-foreground">{{ updatedLabel }}</span>
            </span>
            <span class="text-muted-foreground shrink-0" aria-hidden>·</span>
            <span class="inline-flex items-baseline gap-1 min-w-0">
              <span class="text-muted-foreground shrink-0">{{
                t('requestDetail.headerDetailLabelSource')
              }}</span>
              <span class="text-foreground min-w-0">{{ sourceLabel }}</span>
            </span>
            <span class="text-muted-foreground shrink-0" aria-hidden>·</span>
            <span class="inline-flex items-baseline gap-1 min-w-0">
              <span class="text-muted-foreground shrink-0">{{
                t('requestDetail.headerDetailLabelChannel')
              }}</span>
              <span class="text-foreground min-w-0">{{ channelDisplay }}</span>
            </span>
            <span class="text-muted-foreground shrink-0" aria-hidden>·</span>
            <span class="inline-flex items-baseline gap-1 min-w-0">
              <span class="text-muted-foreground shrink-0">{{
                t('requestDetail.headerDetailLabelFiscalEntity')
              }}</span>
              <span class="text-foreground min-w-0">{{ fiscalEntityDisplay }}</span>
            </span>
            <span class="text-muted-foreground shrink-0" aria-hidden>·</span>
            <span class="inline-flex items-baseline gap-1 min-w-0">
              <span class="text-muted-foreground shrink-0">{{
                t('requestDetail.headerDetailLabelDealership')
              }}</span>
              <span class="text-foreground min-w-0">{{ dealershipDisplay }}</span>
            </span>
          </div>
        </div>

        <div
          v-if="request"
          class="flex flex-wrap items-center gap-x-3 gap-y-1"
          :class="isFullPage ? 'pl-8' : ''"
        >
          <div class="flex flex-wrap items-center gap-2">
            <div class="flex flex-wrap items-center gap-1">
              <span
                v-if="priorityBadge"
                class="inline-flex items-center rounded-md px-2 py-0.5 text-sm font-medium leading-none"
                :class="priorityBadge.class"
              >
                {{ priorityBadge.label }}
              </span>
              <span
                v-for="tag in displayTags"
                :key="tag"
                class="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-sm font-medium leading-none text-muted-foreground"
              >
                {{ tag }}
              </span>
              <span
                v-for="seg in extraSegments"
                :key="seg"
                class="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-sm font-medium leading-none text-muted-foreground"
              >
                {{ seg }}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              class="size-6 rounded-md text-muted-foreground"
              :aria-label="t('requestDetail.addSegment')"
              @click="$emit('add-segment')"
            >
              <Plus class="size-3" />
            </Button>
          </div>
        </div>
      </div>

      <div
        class="flex shrink-0 flex-col items-stretch gap-2 sm:items-end lg:pt-0.5"
      >
        <div class="flex flex-wrap items-center justify-end gap-2">
          <DropdownMenu v-if="request" :modal="false">
            <DropdownMenuTrigger as-child>
              <button
                type="button"
                class="rounded-full border border-transparent p-0 transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                :aria-label="lifecycleAriaLabel || t('requestDetail.headerLifecycleMenuAria')"
              >
                <RequestHeaderLifecycleStepper :steps="lifecycleSteps" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="min-w-48 max-h-64 overflow-y-auto p-1.5" align="end">
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

        <div
          v-if="request"
          class="flex items-center justify-end gap-2 text-sm text-muted-foreground"
        >
          <span>{{ t('requestDetail.headerOwnedBy') }}</span>
          <Avatar class="size-7 shrink-0 rounded-full">
            <AvatarFallback
              class="bg-secondary text-sm font-medium leading-none text-secondary-foreground"
            >
              {{ assigneeInitials }}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, ref, useId } from 'vue'
import { useToastStore } from '@/stores/toast'
import { useI18n } from 'vue-i18n'
import {
  ChevronLeft,
  ChevronRight,
  X,
  ChevronDown,
  Upload,
  RefreshCw,
  Plus,
  Sun
} from 'lucide-vue-next'
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Avatar,
  AvatarFallback
} from '@motork/component-library/future/primitives'
import RequestHeaderLifecycleStepper from './RequestHeaderLifecycleStepper.vue'
import { getDisplayStage, getStageColor } from '@/utils/stageMapper'
import { LEAD_STAGES, OPPORTUNITY_STAGES } from '@/utils/stageMapper/constants'

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
  }
})

const emit = defineEmits([
  'close',
  'previous',
  'next',
  'update-status',
  'postpone-expected-close',
  'reassigned',
  'add-segment'
])

const { t, locale } = useI18n()
const toastStore = useToastStore()

const headerDetailsExpanded = ref(false)
const headerDetailsPanelId = `request-header-details-${useId().replace(/:/g, '')}`

const channelDisplay = computed(() => {
  if (!props.request?.channel) return '—'
  return String(props.request.channel)
})

const fiscalEntityDisplay = computed(() => {
  if (!props.request?.fiscalEntity) return '—'
  return String(props.request.fiscalEntity)
})

const dealershipDisplay = computed(() => {
  const r = props.request
  if (!r) return '—'
  const d =
    r.dealership ??
    r.requestedCar?.dealership ??
    r.vehicle?.dealership ??
    null
  if (!d) return '—'
  return String(d)
})

function formatHeaderDateTime(iso) {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString(locale.value, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

async function copyTitleToClipboard() {
  const text = titleText.value
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    toastStore.pushToast('success', t('requestDetail.titleCopied'))
  } catch {
    toastStore.pushToast('error', t('requestDetail.titleCopyFailed'))
  }
}

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

const sourceLabel = computed(() => props.request?.source || '—')
const requestTypeLabel = computed(
  () => props.request?.requestType || props.request?.genericSales || '—'
)

const entityLabel = computed(() => {
  if (!props.request) return ''
  return props.request.type === 'lead'
    ? t('entities.lead.title')
    : t('entities.opportunity.title')
})

const primaryTitleText = computed(() => {
  if (!props.request) return ''
  return t('requestDetail.headerPrimary', {
    entity: entityLabel.value,
    source: sourceLabel.value
  })
})

const typeLabelText = computed(() => {
  if (!props.request) return ''
  return t('requestDetail.headerTypeLabel', {
    requestType: requestTypeLabel.value
  })
})

const titleText = computed(() => {
  if (!props.request) return ''
  return t('requestDetail.headerTitle', {
    entity: entityLabel.value,
    source: sourceLabel.value,
    requestType: requestTypeLabel.value
  })
})

const createdLabel = computed(() => {
  const d = props.request?.createdAt || props.request?.importedAt
  return formatHeaderDateTime(d)
})

const updatedLabel = computed(() => {
  const d = props.request?.lastActivity || props.request?.updatedAt
  return formatHeaderDateTime(d)
})

const priorityBadge = computed(() => {
  const p = props.request?.priority
  if (!p || typeof p !== 'string') return null
  const key = p.toLowerCase()
  if (key === 'hot') {
    return { label: p, class: 'bg-destructive/15 text-destructive' }
  }
  if (key === 'warm') {
    return { label: p, class: 'bg-amber-100 text-amber-900' }
  }
  return { label: p, class: 'bg-muted text-muted-foreground' }
})

const displayTags = computed(() => {
  const tags = props.request?.tags
  if (!Array.isArray(tags)) return []
  return tags.filter(Boolean).slice(0, 6)
})

const extraSegments = computed(() => {
  const r = props.request
  if (!r) return []
  const out = []
  if (r.channel === 'Paid' || r.channel === 'paid') out.push('ADV')
  const st = (r.carStatus || '').toLowerCase()
  if (
    st.includes('oem') ||
    (Array.isArray(r.tags) && r.tags.some((x) => String(x).toUpperCase() === 'OEM'))
  ) {
    out.push('OEM')
  }
  return out
})

const assigneeInitials = computed(() => {
  const r = props.request
  if (!r) return '?'
  if (r.assigneeInitials) return String(r.assigneeInitials).slice(0, 3)
  const name = r.assignee
  if (!name || typeof name !== 'string') return '?'
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})
</script>
