<template>
  <div class="relative">
  <PostponeTaskDialog
    :show="showPostponeDueDateDialog"
    task-type="lead"
    @close="showPostponeDueDateDialog = false"
    @confirm="handlePostponeDueDateConfirm"
  />
  <!-- Loader only while converting to opportunity; forms hidden until opportunity shows -->
  <div
    v-if="isConvertingToOpportunity"
    class="flex items-center justify-center min-h-[200px] rounded-lg bg-muted/80"
    aria-busy="true"
    aria-label="Converting to opportunity"
  >
    <Spinner class="size-8 text-foreground" />
  </div>

  <TaskManagementWidget v-else :task="lead" hide-title hide-border>
    <template #primary-action>
      <!-- Assign to me banner is shown in TaskDetailView above the assignee/due date row -->
      <!-- Primary action = LQTask -->
      <LQTask
        v-if="!leadState.isClosed.value && leadState.showLQWidget.value"
        :key="lead.id"
        :lead="lead"
        :activities="activities"
        :show-deadline-banner="leadState.showDeadlineBanner.value"
        :outcome-saving="outcomeSaving"
        @update:outcome-saving="outcomeSaving = $event"
        @postponed="onPostponed"
        @validated="handleValidated"
        @qualified="handleQualified"
        @disqualified="onDisqualified"
        @call-attempt-logged="handleCallAttemptLogged"
        @note-saved="handleNoteSaved"
        @open-purchase-method="handleOpenPurchaseMethod"
        @open-trade-in="handleOpenTradeIn"
        @appointment-scheduled="handleAppointmentScheduled"
        @postpone-expected-close="$emit('postpone-expected-close')"
        @reassigned="$emit('reassigned', $event)"
      />

      <!-- Fallback: if LQTask is not shown for a stage, show the generic primary action -->
      <PrimaryActionWidget
        v-else-if="!leadState.isClosed.value && leadState.primaryAction.value"
        :action="leadState.primaryAction.value"
        :color-scheme="leadState.primaryAction.value.colorScheme"
        @action-clicked="leadState.primaryAction.value.handler"
      />
    </template>

    <template #task-widgets>
      <!-- No lead widgets here for now (LQTask lives in Primary Action) -->
    </template>

    <template #closed-state>
      <!-- Closed / outcome state: show outcome and Reopen so user can act without the drawer closing -->
      <div
        v-if="leadState.isClosed.value"
        class="bg-muted/50 border border-border rounded-lg p-4"
      >
        <div class="flex justify-between items-start mb-3">
          <div>
            <h4 class="font-bold text-foreground text-sm">Outcome</h4>
            <p class="text-xs text-muted-foreground mt-0.5">
              {{ leadState.displayStage.value }}
              <span v-if="lead.disqualifyReason"> – {{ lead.disqualifyReason }}</span>
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          size="small"
          @click="handleReopen"
          class="flex items-center gap-2"
        >
          <span>Reopen Lead</span>
          <RotateCcw class="w-4 h-4 shrink-0" />
        </Button>
      </div>
    </template>
  </TaskManagementWidget>
  </div>
</template>

<script setup>
import { RotateCcw } from 'lucide-vue-next'
import { ref, toRef } from 'vue'
import { Button, Spinner } from '@motork/component-library/future/primitives'
import { useLeadsStore } from '@/stores/leads'
import { useLeadActions } from '@/composables/useLeadActions'
import { useLeadManagementHandlers } from '@/composables/useLeadManagementHandlers'

// Components
import TaskManagementWidget from '@/components/tasks/shared/TaskManagementWidget.vue'
import PrimaryActionWidget from '@/components/tasks/shared/PrimaryActionWidget.vue'
import TaskAssignee from '@/components/tasks/TaskAssignee.vue'
import LQTask from '@/components/tasks/lead/LQTask.vue'
import PostponeTaskDialog from '@/components/tasks/shared/PostponeTaskDialog.vue'

const props = defineProps({
  lead: {
    type: Object,
    required: true
  },
  activities: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['open-purchase-method', 'open-trade-in', 'postpone-expected-close', 'reassigned'])

const leadsStore = useLeadsStore()

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

