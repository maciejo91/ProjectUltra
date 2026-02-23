<template>
  <header class="shrink-0 flex items-center justify-between gap-4 px-4 py-3 border-b border-border bg-background">
    <div class="flex flex-col min-w-0 flex-1">
      <div class="flex items-center gap-2 min-w-0">
        <span class="text-fluid-sm font-medium text-foreground truncate">
          {{ titleText }}
        </span>
        <span
          v-if="request"
          class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border shrink-0"
          :class="request.type === 'lead' ? 'bg-badge-green text-emerald-700 border-emerald-200' : 'bg-purple-50 text-purple-700 border-purple-200'"
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
          <DropdownMenuContent class="w-48" align="start">
            <DropdownMenuItem
              v-if="showCloseAction"
              class="flex cursor-pointer items-center gap-2"
              @select="emit('open-close')"
            >
              <XCircle class="size-4 shrink-0" />
              Close
            </DropdownMenuItem>
            <DropdownMenuItem
              v-if="showConvertAction"
              class="flex cursor-pointer items-center gap-2"
              @select="emit('open-convert')"
            >
              <Sparkles class="size-4 shrink-0" />
              Convert to Opportunity
            </DropdownMenuItem>
            <DropdownMenuItem
              v-if="showReopenLeadAction"
              class="flex cursor-pointer items-center gap-2"
              @select="emit('reopen-lead')"
            >
              <RotateCcw class="size-4 shrink-0" />
              Reopen as Lead
            </DropdownMenuItem>
            <DropdownMenuItem
              v-if="showReopenOppAction"
              class="flex cursor-pointer items-center gap-2"
              @select="emit('reopen-opportunity')"
            >
              <RotateCcw class="size-4 shrink-0" />
              Reopen as Opportunity
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <TaskAssigneeDateBar
        v-if="request && hasAssignee"
        :task="request"
        variant="inline"
        assignee-only
        class="mt-0.5 pt-0 pb-1 shrink-0 min-w-0"
        @reassigned="$emit('reassigned', $event)"
      />
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
        variant="outline"
        size="icon"
        class="rounded-sm"
        @click="$emit('close')"
      >
        <X class="size-4 text-muted-foreground" />
      </Button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { ChevronLeft, ChevronRight, X, ChevronDown, XCircle, Sparkles, RotateCcw } from 'lucide-vue-next'
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@motork/component-library/future/primitives'
import TaskAssigneeDateBar from '@/components/tasks/TaskAssigneeDateBar.vue'
import { getDisplayStage } from '@/utils/stageMapper'
import { getStageBadgeClass } from '@/utils/formatters'
import { OPPORTUNITY_STAGES } from '@/utils/stageMapper/constants'

const props = defineProps({
  request: {
    type: Object,
    default: null
  },
  filteredRequests: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'close',
  'previous',
  'next',
  'open-close',
  'open-convert',
  'reopen-lead',
  'reopen-opportunity',
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

const isLeadClosed = computed(() => {
  if (props.request?.type !== 'lead') return false
  return props.request.isDisqualified === true
})

const isOppClosed = computed(() => {
  if (props.request?.type !== 'opportunity') return false
  const stage = props.request.displayStage || props.request.stage
  return [
    OPPORTUNITY_STAGES.CLOSED_WON,
    OPPORTUNITY_STAGES.CLOSED_LOST,
    OPPORTUNITY_STAGES.ABANDONED
  ].includes(stage)
})

const showCloseAction = computed(() => {
  if (!props.request) return false
  if (props.request.type === 'lead') return !isLeadClosed.value
  if (props.request.type === 'opportunity') return !isOppClosed.value
  return false
})

const showConvertAction = computed(
  () => props.request?.type === 'lead' && !isLeadClosed.value
)

const showReopenLeadAction = computed(
  () => props.request?.type === 'lead' && isLeadClosed.value
)

const showReopenOppAction = computed(
  () => props.request?.type === 'opportunity' && isOppClosed.value
)

const currentIndex = computed(() => {
  if (!props.request?.compositeId || !props.filteredRequests?.length) return -1
  return props.filteredRequests.findIndex(r => r.compositeId === props.request.compositeId)
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

const hasAssignee = computed(() => {
  return !!(props.request?.assignee || props.request?.owner || props.request?.assignedTo)
})
</script>
