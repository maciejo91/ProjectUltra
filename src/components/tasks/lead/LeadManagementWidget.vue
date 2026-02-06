<template>
  <div class="relative">
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
      <!-- Blue banner with Assign to me only when unassigned; assigned state is in header -->
      <TaskAssignee
        v-if="!leadState.isClosed.value && !(lead.assignee || lead.owner || lead.assignedTo)"
        :task="lead"
        task-type="lead"
        @reassigned="handleOwnerReassigned"
        class="mb-3"
      />
      
      <!-- Primary action = LQTask -->
      <LQTask
        v-if="!leadState.isClosed.value && leadState.showLQWidget.value" 
        :key="lead.id"
        :lead="lead"
        :show-deadline-banner="leadState.showDeadlineBanner.value"
        @postponed="handlePostponed"
        @validated="handleValidated"
        @qualified="handleQualified"
        @disqualified="handleDisqualified"
        @call-attempt-logged="handleCallAttemptLogged"
        @note-saved="handleNoteSaved"
        @open-purchase-method="handleOpenPurchaseMethod"
        @open-trade-in="handleOpenTradeIn"
        @appointment-scheduled="handleAppointmentScheduled"
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
      <!-- Closed States -->
      <div
        v-if="leadState.isClosed.value"
        class="bg-muted/50 border border-border rounded-lg p-4"
      >
        <div class="flex justify-between items-start mb-3">
          <div>
            <h4 class="font-bold text-foreground text-sm">Lead Closed</h4>
            <p class="text-xs text-muted-foreground mt-0.5">
              Status: {{ leadState.displayStage.value }}
              <span v-if="lead.disqualifyReason"> - {{ lead.disqualifyReason }}</span>
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
import { toRef } from 'vue'
import { Button, Spinner } from '@motork/component-library/future/primitives'
import { useLeadsStore } from '@/stores/leads'
import { useLeadActions } from '@/composables/useLeadActions'
import { useLeadManagementHandlers } from '@/composables/useLeadManagementHandlers'

// Components
import TaskManagementWidget from '@/components/tasks/shared/TaskManagementWidget.vue'
import PrimaryActionWidget from '@/components/tasks/shared/PrimaryActionWidget.vue'
import TaskAssignee from '@/components/tasks/TaskAssignee.vue'
import LQTask from '@/components/tasks/lead/LQTask.vue'

const props = defineProps({
  lead: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['open-purchase-method', 'open-trade-in'])

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

