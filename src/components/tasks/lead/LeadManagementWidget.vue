<template>
  <div class="relative h-auto max-h-none w-full shrink-0">
  <PostponeTaskDialog
    :show="showPostponeDueDateDialog"
    task-type="lead"
    :saving="outcomeSaving"
    @close="showPostponeDueDateDialog = false"
    @confirm="handlePostponeDueDateConfirm"
  />
  <div
    v-if="isConvertingToOpportunity"
    class="flex min-h-[200px] items-center justify-center rounded-lg bg-muted/80"
    aria-busy="true"
    :aria-label="convertingAriaLabel"
  >
    <Spinner class="size-8 text-foreground" />
  </div>

  <template v-else-if="embedOutcomeOnly">
    <LeadQualifySuccessCard
      v-if="qualifyInlineSuccessResolved"
      :opportunity="qualifyInlineSuccessResolved.opportunity"
      :actor-name="qualifyInlineSuccessResolved.actorName"
      :performed-at="qualifyInlineSuccessResolved.performedAt"
      class="w-full min-w-0 shrink-0"
    />
    <LeadLqOutcomeSummaryCard
      v-else-if="leadState.isClosed.value && embedClosedHasSummary"
      v-bind="embedClosedSummaryDisplay"
      show-reopen
      @reopen="handleReopen"
    />
    <LQTask
      v-else-if="leadState.showLQWidget.value"
      :key="lead.id"
      :lead="lead"
      :activities="activities"
      :show-deadline-banner="leadState.showDeadlineBanner.value"
      :outcome-saving="outcomeSaving"
      hide-contact-card
      @update:outcome-saving="outcomeSaving = $event"
      @postponed="onPostponed"
      @validated="handleValidated"
      @qualified="onQualified"
      @disqualified="onDisqualified"
      @call-attempt-logged="handleCallAttemptLogged"
      @note-saved="handleNoteSaved"
      @open-purchase-method="handleOpenPurchaseMethod"
      @open-trade-in="handleOpenTradeIn"
      @appointment-scheduled="handleAppointmentScheduled"
      @postpone-expected-close="$emit('postpone-expected-close')"
      @reassigned="$emit('reassigned', $event)"
      @lq-outcome-summary="$emit('lq-outcome-summary', $event)"
    />
    <PrimaryActionWidget
      v-else-if="leadState.primaryAction.value"
      :action="leadState.primaryAction.value"
      :color-scheme="leadState.primaryAction.value.colorScheme"
      @action-clicked="leadState.primaryAction.value.handler"
    />
  </template>

  <TaskManagementWidget v-else :task="lead" hide-title hide-border>
    <template #primary-action>
      <!-- Assign to me banner is shown in TaskDetailView above the assignee/due date row -->
      <LeadQualifySuccessCard
        v-if="qualifyInlineSuccessResolved"
        :opportunity="qualifyInlineSuccessResolved.opportunity"
        :actor-name="qualifyInlineSuccessResolved.actorName"
        :performed-at="qualifyInlineSuccessResolved.performedAt"
        class="w-full min-w-0 shrink-0"
      />
      <LQTask
        v-else-if="!leadState.isClosed.value && leadState.showLQWidget.value"
        :key="lead.id"
        :lead="lead"
        :activities="activities"
        :show-deadline-banner="leadState.showDeadlineBanner.value"
        :outcome-saving="outcomeSaving"
        @update:outcome-saving="outcomeSaving = $event"
        @postponed="onPostponed"
        @validated="handleValidated"
        @qualified="onQualified"
        @disqualified="onDisqualified"
        @call-attempt-logged="handleCallAttemptLogged"
        @note-saved="handleNoteSaved"
        @open-purchase-method="handleOpenPurchaseMethod"
        @open-trade-in="handleOpenTradeIn"
        @appointment-scheduled="handleAppointmentScheduled"
        @postpone-expected-close="$emit('postpone-expected-close')"
        @reassigned="$emit('reassigned', $event)"
        @lq-outcome-summary="$emit('lq-outcome-summary', $event)"
      />

      <PrimaryActionWidget
        v-else-if="!qualifyInlineSuccessResolved && !leadState.isClosed.value && leadState.primaryAction.value"
        :action="leadState.primaryAction.value"
        :color-scheme="leadState.primaryAction.value.colorScheme"
        @action-clicked="leadState.primaryAction.value.handler"
      />
    </template>

    <template #task-widgets>
      <!-- No lead widgets here for now (LQTask lives in Primary Action) -->
    </template>

    <template #closed-state>
      <LeadLqOutcomeSummaryCard
        v-if="leadState.isClosed.value && taskClosedSummaryDisplay.title"
        v-bind="taskClosedSummaryDisplay"
        show-reopen
        @reopen="handleReopen"
      />
    </template>
  </TaskManagementWidget>
  </div>
</template>

<script setup>
import { computed, ref, toRef } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Spinner } from '@motork/component-library/future/primitives'
import { useLeadsStore } from '@/stores/leads'
import { useUserStore } from '@/stores/user'
import { useLeadActions } from '@/composables/useLeadActions'
import { useLeadManagementHandlers } from '@/composables/useLeadManagementHandlers'

// Components
import TaskManagementWidget from '@/components/tasks/shared/TaskManagementWidget.vue'
import PrimaryActionWidget from '@/components/tasks/shared/PrimaryActionWidget.vue'
import LQTask from '@/components/tasks/lead/LQTask.vue'
import PostponeTaskDialog from '@/components/tasks/shared/PostponeTaskDialog.vue'
import LeadLqOutcomeSummaryCard from '@/components/tasks/lead/LeadLqOutcomeSummaryCard.vue'
import LeadQualifySuccessCard from '@/components/tasks/lead/LeadQualifySuccessCard.vue'
import {
  buildLqOutcomeSummaryDisplay,
  buildClosedLeadSummaryFromLead,
  resolveStoredQualifyInlineSuccess
} from '@/utils/lqOutcomeSummaryFormat'

const props = defineProps({
  lead: {
    type: Object,
    required: true
  },
  activities: {
    type: Array,
    default: () => []
  },
  embedOutcomeOnly: {
    type: Boolean,
    default: false
  },
  outcomeSummary: {
    type: Object,
    default: null
  },
  qualifyInlineSuccess: {
    type: Object,
    default: null
  }
})

const emit = defineEmits([
  'open-purchase-method',
  'open-trade-in',
  'postpone-expected-close',
  'reassigned',
  'qualified-inline-success',
  'lq-outcome-summary'
])

const route = useRoute()
const { t } = useI18n()
const leadsStore = useLeadsStore()
const userStore = useUserStore()

const skipQualifyRedirect = computed(
  () =>
    route.name === 'request-detail' ||
    route.path.startsWith('/requests/') ||
    route.path.startsWith('/tasks')
)
const convertingAriaLabel = computed(() => t('requestDetail.qualifySuccess.convertingAria'))

const qualifyInlineSuccessResolved = computed(() => {
  if (props.qualifyInlineSuccess) return props.qualifyInlineSuccess
  const lead = props.lead
  if (!lead) return null
  return resolveStoredQualifyInlineSuccess(
    { type: 'lead', id: lead.id, opportunityId: lead.opportunityId ?? null },
    leadsStore.lastInlineLeadQualifySuccess
  )
})

const embedClosedSummaryDisplay = computed(() => {
  if (props.outcomeSummary) {
    return buildLqOutcomeSummaryDisplay(props.outcomeSummary, t)
  }
  return buildClosedLeadSummaryFromLead(props.lead, t)
})

const embedClosedHasSummary = computed(() => {
  const d = embedClosedSummaryDisplay.value
  return Boolean(d.title || (d.lines && d.lines.length))
})

const taskClosedSummaryDisplay = computed(() => {
  if (props.outcomeSummary) {
    return buildLqOutcomeSummaryDisplay(props.outcomeSummary, t)
  }
  return buildClosedLeadSummaryFromLead(props.lead, t)
})

// Helper to get current lead (try store first, fallback to props)
const getCurrentLead = () => {
  const storeLead = leadsStore.currentLead
  return (storeLead && storeLead.id === props.lead?.id) ? storeLead : props.lead
}

// Action handlers (empty for now, primary action is handled by LQTask)
const actionHandlers = {
  'call-to-verify': () => { /* Handled by LQTask */ },
  'call-prospect': () => { /* Handled by LQTask */ },
  'complete-conversion': () => { /* Handled by LQTask */ },
  'reopen': () => { /* Handled by handleReopen */ }
}

// Use lead actions composable - matches opportunity pattern
const leadState = useLeadActions(toRef(props, 'lead'), actionHandlers)

// Loading state while saving outcome (close / postpone) so user sees spinner before outcome card
const outcomeSaving = ref(false)
const showPostponeDueDateDialog = ref(false)

// Use handlers composable
const {
  isConvertingToOpportunity,
  handlePostponed,
  handleValidated,
  handleQualified,
  handleCallAttemptLogged,
  handleNoteSaved,
  handleOpenPurchaseMethod,
  handleOpenTradeIn,
  handleAppointmentScheduled,
  handleDisqualified,
  handleReopen
} = useLeadManagementHandlers({
  getLead: getCurrentLead,
  leadState,
  emit
})

async function onQualified(payload) {
  const skip = skipQualifyRedirect.value
  const sourceLeadId = props.lead?.id
  await handleQualified(payload, {
    skipRedirect: skip,
    onOpportunityCreated: skip
      ? (opportunity) => {
          const performedAt = new Date()
          const actorName = userStore.currentUser?.name || ''
          leadsStore.setLastInlineLeadQualifySuccess({
            sourceLeadId,
            opportunityId: opportunity?.id ?? null,
            opportunity,
            actorName,
            performedAt
          })
          emit('qualified-inline-success', {
            opportunity,
            actorName,
            performedAt
          })
          emit('lq-outcome-summary', null)
        }
      : undefined
  })
}

async function onDisqualified(data) {
  outcomeSaving.value = true
  try {
    await handleDisqualified(data)
  } finally {
    outcomeSaving.value = false
  }
}

async function onPostponed(data) {
  outcomeSaving.value = true
  try {
    await handlePostponed(data)
  } finally {
    outcomeSaving.value = false
  }
}

function openPostponeDueDateModal() {
  showPostponeDueDateDialog.value = true
}

async function handlePostponeDueDateConfirm(data) {
  outcomeSaving.value = true
  try {
    await handlePostponed({ date: data.date, time: data.time || '12:00', reason: data.reason })
    showPostponeDueDateDialog.value = false
  } finally {
    outcomeSaving.value = false
  }
}

defineExpose({ openPostponeDueDateModal })

// Handle owner reassignment from TaskAssignee component
const handleOwnerReassigned = async (assignee) => {
  // Reload the lead to get updated assignee data
  if (props.lead?.id) {
    await leadsStore.loadLeadById(props.lead.id)
  }
}
</script>

<style scoped>
</style>

