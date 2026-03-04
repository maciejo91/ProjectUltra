<template>
  <div :class="embedInSection ? '' : 'rounded-lg border border-border bg-muted flex flex-col overflow-hidden'">
    <!-- When embedded: grey area under card (lead-style). Else: standalone block with title. -->
    <div :class="embedInSection ? 'space-y-3' : 'p-4'">
      <template v-if="!embedInSection">
        <h4 class="font-bold text-foreground text-sm">No Follow-Up Task</h4>
        <p class="text-sm text-muted-foreground mt-0.5">
          5+ days in negotiation with no future appointment scheduled. Schedule an appointment to move forward or close as lost.
        </p>
      </template>
      <template v-else>
        <p class="text-sm font-medium text-foreground leading-normal">What's next?</p>
      </template>
      <div class="flex flex-wrap items-center gap-3" :class="embedInSection ? '' : 'mt-4'">
        <Button
          variant="default"
          class="rounded-sm shrink-0"
          :class="{ 'ring-2 ring-primary ring-offset-2': selectedAction === 'schedule' }"
          @click="selectedAction = selectedAction === 'schedule' ? null : 'schedule'"
        >
          <CalendarDays class="w-4 h-4 shrink-0 mr-2" />
          Schedule Appointment
        </Button>
        <Button
          variant="outline"
          class="rounded-sm shrink-0"
          :class="{ 'ring-2 ring-primary ring-offset-2 border-primary': selectedAction === 'postpone' }"
          @click="selectedAction = selectedAction === 'postpone' ? null : 'postpone'"
        >
          <Clock class="w-4 h-4 shrink-0 mr-2" />
          Postpone
        </Button>
        <SecondaryActionsDropdown
          v-if="secondaryActions && secondaryActions.length > 0"
          :actions="secondaryActions"
          class="shrink-0"
          @action-selected="(a) => {
            $emit('secondary-action', a)
            if (a?.key === 'schedule-appointment') selectedAction = 'schedule'
            else if (a?.key === 'close-lost') selectedAction = 'close-lost'
          }"
        />
      </div>
    </div>

    <!-- Same UX as schedule: expanded content below (no card around this block) -->
    <div class="mk-expanded-cards-area space-y-4" :class="embedInSection ? 'pt-4' : 'px-4 pb-4'">
      <div v-if="selectedAction === 'schedule'" class="space-y-4">
        <OpportunityScheduleForm
          ref="scheduleFormRef"
          :opportunity="opportunity"
          mode="schedule"
          @submit="$emit('schedule-submit', $event)"
          @cancel="selectedAction = null"
        />
      </div>
      <div v-if="selectedAction === 'postpone'" class="space-y-4">
        <PostponeWithAssigneeCard
          title="Postpone task"
          :assignee-options="assigneeOptions"
          :default-assignee-key="defaultAssigneeKey"
          assignee-placeholder="Assign to..."
          :show-quick-time-options="false"
          :saving="postponeSaving"
          show-reason-field
          @confirm="(data) => { $emit('postpone-confirm', data); selectedAction = null }"
          @cancel="selectedAction = null"
        />
      </div>
      <div v-if="selectedAction === 'close-lost'" class="space-y-4">
        <div class="bg-white rounded-lg shadow-nsc-card overflow-hidden p-6">
          <h5 class="font-semibold text-foreground text-sm mb-4">Close as Lost</h5>
          <CloseAsLostForm
            ref="closeFormRef"
            close-button-label="Close as Lost"
            @close="handleCloseAsLost"
          />
          <div class="flex justify-end gap-2 mt-4">
            <Button variant="outline" class="rounded-sm" @click="selectedAction = null">Cancel</Button>
            <Button
              variant="default"
              class="rounded-sm"
              :disabled="!canSubmitCloseForm"
              @click="closeFormRef?.submit()"
            >
              Close as Lost
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Clock, CalendarDays } from 'lucide-vue-next'
import { Button } from '@motork/component-library/future/primitives'
import { useUsersStore } from '@/stores/users'
import SecondaryActionsDropdown from '@/components/shared/SecondaryActionsDropdown.vue'
import PostponeWithAssigneeCard from '@/components/tasks/shared/PostponeWithAssigneeCard.vue'
import OpportunityScheduleForm from '@/components/tasks/opportunity/OpportunityScheduleForm.vue'
import CloseAsLostForm from '@/components/shared/CloseAsLostForm.vue'

const props = defineProps({
  opportunity: { type: Object, required: true },
  secondaryActions: { type: Array, default: () => [] },
  postponeSaving: { type: Boolean, default: false },
  /** When true, render only actions + expanded area (no title/description, no outer card); used under "Manage Offers & Follow Up" */
  embedInSection: { type: Boolean, default: false }
})

const emit = defineEmits([
  'secondary-action',
  'postpone-confirm',
  'schedule-submit',
  'close-as-lost',
  'reassigned'
])

const usersStore = useUsersStore()
const NEXT_ATTEMPT_NONE_KEY = '__none__'
const assigneeOptions = computed(() => {
  const noneOption = { _key: NEXT_ATTEMPT_NONE_KEY, type: 'none', label: 'Unassigned' }
  const users = (usersStore.assignableUsers || []).map(u => ({
    ...u,
    type: 'user',
    _key: `user-${u.id}`,
    label: u.name
  }))
  const teams = (usersStore.assignableTeams || []).map(t => ({
    ...t,
    type: 'team',
    _key: `team-${t.id}`,
    label: t.name
  }))
  return [noneOption, ...users, ...teams]
})
const defaultAssigneeKey = computed(() => {
  const name = props.opportunity?.assignee
  if (!name) return NEXT_ATTEMPT_NONE_KEY
  const user = usersStore.assignableUsers?.find(u => u.name === name)
  if (user) return `user-${user.id}`
  const team = usersStore.assignableTeams?.find(t => t.name === name)
  if (team) return `team-${team.id}`
  return NEXT_ATTEMPT_NONE_KEY
})

const selectedAction = ref(null)
const scheduleFormRef = ref(null)
const closeFormRef = ref(null)

const canSubmitCloseForm = computed(() => {
  const form = closeFormRef.value
  if (!form) return false
  const c = form.canSubmit
  return c?.value ?? c ?? false
})

function handleCloseAsLost(reason) {
  emit('close-as-lost', {
    opportunity: props.opportunity,
    reason
  })
}

defineExpose({
  scheduleFormRef,
  closeFormRef
})
</script>
