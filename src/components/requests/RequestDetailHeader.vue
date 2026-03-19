<template>
  <header class="shrink-0 flex items-center justify-between gap-4 px-4 py-3 border-b border-border bg-background">
    <div class="flex items-center gap-1.5 min-w-0 flex-1">
      <Button
        v-if="isFullPage"
        variant="ghost"
        size="icon"
        class="rounded-sm shrink-0 -ml-0.5"
        aria-label="Back to requests"
        @click="$emit('close')"
      >
        <ChevronLeft class="size-4 text-muted-foreground" />
      </Button>
      <div class="flex flex-col min-w-0 flex-1">
        <div class="flex items-center gap-2 min-w-0 flex-wrap">
          <span class="text-fluid-sm font-medium text-foreground truncate min-w-0">
            {{ titleText }}
          </span>
          <span
            v-if="request"
            class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium shrink-0"
            :class="request.type === 'lead' ? 'bg-badge-green text-emerald-700' : 'bg-purple-50 text-purple-700'"
          >
            {{ request.type === 'lead' ? 'Lead' : 'Opportunity' }}
          </span>
          <DropdownMenu v-if="request" :modal="false">
            <DropdownMenuTrigger as-child>
              <button
                type="button"
                class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                :class="stageClass"
              >
                {{ displayStage }}
                <ChevronDown class="size-3 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="min-w-48 max-h-64 overflow-y-auto p-1.5" align="start">
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
          <TaskAssigneeDateBar
            v-if="request"
            :task="request"
            variant="inline"
            date-display="lastUpdated"
            class="shrink-0"
            @postpone-expected-close="$emit('postpone-expected-close')"
            @reassigned="$emit('reassigned', $event)"
          />
        </div>
      </div>
    </div>
    <div class="flex items-center gap-2 shrink-0">
      <Button
        variant="outline"
        size="icon"
        class="rounded-sm"
        :disabled="!hasPrevious"
        @click="$emit('previous')"
      >
        <ChevronLeft class="size-4 text-muted-foreground" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        class="rounded-sm"
        :disabled="!hasNext"
        @click="$emit('next')"
      >
        <ChevronRight class="size-4 text-muted-foreground" />
      </Button>
      <Button
        v-if="!isFullPage"
        variant="outline"
        size="icon"
        class="rounded-sm"
        aria-label="Close"
        @click="$emit('close')"
      >
        <X class="size-4 text-muted-foreground" />
      </Button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { ChevronLeft, ChevronRight, X, ChevronDown } from 'lucide-vue-next'
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@motork/component-library/future/primitives'
import TaskAssigneeDateBar from '@/components/tasks/TaskAssigneeDateBar.vue'
import { getDisplayStage, getStageColor } from '@/utils/stageMapper'
import { getStageBadgeClass } from '@/utils/formatters'
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
  'reassigned'
])

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
    (r) => String(r.compositeId) === idStr || (r.type === props.request?.type && String(r.id) === String(props.request?.id))
  )
})

const hasPrevious = computed(() => currentIndex.value > 0)
const hasNext = computed(() =>
  currentIndex.value >= 0 && currentIndex.value < props.filteredRequests.length - 1
)

const customerName = computed(() => {
  const c = props.request?.customer
  if (!c) return 'Customer'
  if (c.name) return c.name
  if (c.firstName || c.lastName) return [c.firstName, c.lastName].filter(Boolean).join(' ').trim()
  if (c.email) return c.email.split('@')[0] || 'Customer'
  return 'Customer'
})

const vehicleDisplayName = computed(() => {
  const v = props.request?.requestedCar || props.request?.vehicle || {}
  if (!v.brand && !v.model) return 'a vehicle'
  const parts = [v.brand, v.model, v.variant].filter(Boolean)
  return parts.join(' ') || 'a vehicle'
})

const titleText = computed(() => {
  return `${customerName.value} requests ${vehicleDisplayName.value}`
})

</script>
