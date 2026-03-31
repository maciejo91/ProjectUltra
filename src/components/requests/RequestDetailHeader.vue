<template>
  <header
    class="sticky top-0 z-30 flex shrink-0 flex-col border-b border-border bg-background"
  >
    <div
      class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 w-full min-w-0 px-4 pt-1.5 pb-1.5"
    >
      <div class="flex min-w-0 flex-1">
        <div class="flex flex-col min-w-0 flex-1 space-y-0">
          <div class="flex items-center gap-2 min-w-0">
            <Button
              v-if="isFullPage"
              variant="ghost"
              size="icon-sm"
              class="rounded-md shrink-0"
              :aria-label="t('requestDetail.headerBack')"
              @click="$emit('close')"
            >
              <ChevronLeft class="size-4 text-muted-foreground" />
            </Button>
            <div class="flex flex-wrap items-baseline gap-2 min-w-0">
              <DropdownMenu v-if="request" :modal="false">
                <DropdownMenuTrigger as-child>
                  <button
                    type="button"
                    class="inline-flex items-baseline gap-2 min-w-0 max-w-full text-left rounded-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                  <span class="text-base font-medium text-foreground truncate">{{
                    primaryTitleText
                  }}</span>
                  <span class="text-xs text-muted-foreground shrink-0">{{
                    typeLabelText
                  }}</span>
                  <ChevronDown class="size-3 shrink-0 text-muted-foreground" />
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
                class="text-base font-medium text-foreground truncate min-w-0"
              >
                {{ primaryTitleText }}
              </span>
            </div>
          </div>

          <div
            v-if="request"
            class="flex flex-wrap items-center gap-x-4 gap-y-1"
            :class="isFullPage ? 'pl-8' : ''"
          >
            <div class="flex flex-wrap items-center gap-2">
              <div class="flex flex-wrap items-center gap-1">
                <span
                  v-if="priorityBadge"
                  class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium leading-none"
                  :class="priorityBadge.class"
                >
                  {{ priorityBadge.label }}
                </span>
                <span
                  v-for="tag in displayTags"
                  :key="tag"
                  class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium leading-none bg-muted text-muted-foreground"
                >
                  {{ tag }}
                </span>
                <span
                  v-for="seg in extraSegments"
                  :key="seg"
                  class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium leading-none bg-muted text-muted-foreground"
                >
                  {{ seg }}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                class="rounded-md size-6 text-muted-foreground"
                :aria-label="t('requestDetail.addSegment')"
                @click="$emit('add-segment')"
              >
                <Plus class="size-3" />
              </Button>
            </div>

            <span
              class="inline-flex items-center gap-2 text-xs text-muted-foreground tabular-nums"
              :aria-label="`${t('requestDetail.created')}: ${createdLabel}`"
            >
              <Info class="size-4 shrink-0" aria-hidden />
              <span>{{ createdLabel }}</span>
            </span>
            <span
              class="inline-flex items-center gap-2 text-xs text-muted-foreground tabular-nums"
              :aria-label="`${t('requestDetail.lastUpdated')}: ${updatedLabel}`"
            >
              <RefreshCw class="size-4 shrink-0" aria-hidden />
              <span>{{ updatedLabel }}</span>
            </span>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-end gap-2 shrink-0">
        <DropdownMenu v-if="request" :modal="false">
          <DropdownMenuTrigger as-child>
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              :class="stageClass"
            >
              {{ displayStage }}
              <ChevronDown class="size-3 shrink-0" />
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
                class="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium leading-none"
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

        <span
          v-if="request && showWorkflowPill"
          class="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary"
        >
          <Loader2 class="size-3 shrink-0 animate-spin" aria-hidden />
          {{ t('requestDetail.statusInProgress') }}
        </span>

        <Avatar v-if="request" class="size-6 shrink-0 rounded-full">
          <AvatarFallback
            class="bg-secondary text-secondary-foreground text-xs font-normal leading-none"
          >
            {{ assigneeInitials }}
          </AvatarFallback>
        </Avatar>

        <DropdownMenu v-if="request" :modal="false">
          <DropdownMenuTrigger as-child>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              class="rounded-md shrink-0 size-6"
              :aria-label="t('requestDetail.moreMenu')"
            >
              <MoreVertical class="size-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="min-w-40 p-1.5">
            <DropdownMenuItem class="rounded-sm" @select="$emit('more-action', 'share')">
              {{ t('requestDetail.moreMenuShare') }}
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
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useToastStore } from '@/stores/toast'
import { useI18n } from 'vue-i18n'
import {
  ChevronLeft,
  ChevronRight,
  X,
  ChevronDown,
  Info,
  RefreshCw,
  Plus,
  MoreVertical,
  Loader2
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
import { getDisplayStage, getStageColor } from '@/utils/stageMapper'
import { getStageBadgeClass } from '@/utils/formatters'
import { formatDateTime } from '@/utils/formatters'
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
  'add-segment',
  'more-action'
])

const { t } = useI18n()
const toastStore = useToastStore()

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

const stageClass = computed(() => {
  return getStageBadgeClass(displayStage.value)
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
  return d ? formatDateTime(d) : '—'
})

const updatedLabel = computed(() => {
  const d = props.request?.lastActivity || props.request?.updatedAt
  return d ? formatDateTime(d) : '—'
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
  if (st.includes('oem') || (Array.isArray(r.tags) && r.tags.some((x) => String(x).toUpperCase() === 'OEM'))) {
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

const showWorkflowPill = computed(() => {
  const r = props.request
  if (!r) return false
  if (r.type === 'lead' && r.isDisqualified) return false
  return true
})
</script>
