<template>
  <div
    class="rounded-lg"
    :class="[
      isAssigned ? 'bg-muted' : 'bg-blue-50',
      !isAssigned && 'border border-primary'
    ]"
  >
    <div
      class="rounded-lg px-3 py-2 shadow-nsc-card flex items-center justify-between gap-2 flex-wrap"
      :class="isAssigned ? 'bg-white border border-border' : 'bg-transparent'"
    >
      <!-- ASSIGNED STATE: Compact owner info (avatar + name + team + dealership) -->
      <div v-if="isAssigned" class="flex items-center justify-between gap-2 w-full">
        <div class="flex items-center gap-2 min-w-0 flex-1">
          <div
            class="w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
            :class="getRoleAvatarClass(ownerInfo.role)"
          >
            {{ getInitials(ownerInfo.name) }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-foreground truncate leading-tight">
              {{ ownerInfo.name }}
              <span class="font-normal text-muted-foreground">• {{ ownerInfo.team }}</span>
            </p>
            <p class="text-sm text-muted-foreground truncate leading-tight">
              {{ ownerInfo.dealership }}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          @click="showReassignModal = true"
          class="shrink-0 text-sm px-2 py-1"
        >
          Change
        </Button>
      </div>

      <!-- UNASSIGNED STATE: info + message left, split button group right -->
      <template v-else>
        <div class="flex items-center gap-2 min-w-0 flex-1">
          <Info :size="14" class="shrink-0 text-primary" aria-hidden="true" stroke-width="2" />
          <p class="text-sm font-medium text-foreground">{{ t('common.assignee.taskUnassigned') }}</p>
        </div>
        <ButtonGroup
          class="assignee-button-group flex items-stretch gap-0 rounded-lg overflow-hidden border border-primary bg-primary"
        >
          <Button
            variant="default"
            size="sm"
            class="rounded-l-lg rounded-r-none border-0 border-r border-white/20 bg-primary shadow-none"
            @click="assignToSelf"
          >
            {{ t('common.assignee.assignToMe') }}
          </Button>
          <ButtonGroupSeparator class="w-px shrink-0 self-stretch bg-white/20" />
          <Popover :open="assigneeDropdownOpen" @update:open="(v) => (assigneeDropdownOpen = v)">
            <PopoverTrigger as-child>
              <Button
                variant="default"
                size="icon-sm"
                class="-ml-px rounded-l-none rounded-r-lg border-0 bg-primary shadow-none"
                :aria-label="t('common.assignee.assignToSomeone')"
              >
                <ChevronDown :size="14" stroke-width="2" aria-hidden="true" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              class="w-auto p-0 rounded-lg shadow-nsc-card bg-background"
              side="bottom"
              align="end"
            >
              <AssigneeDropdownContent @select="handleAssigneeFromDropdown" />
            </PopoverContent>
          </Popover>
        </ButtonGroup>
      </template>
    </div>
  </div>

  <ReassignUserModal
    :show="showReassignModal"
    :title="isAssigned ? 'Reassign task' : 'Assign task'"
    :confirm-label="isAssigned ? 'Reassign' : 'Assign'"
    @close="showReassignModal = false"
    @confirm="handleReassign"
  />
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Button,
  ButtonGroup,
  ButtonGroupSeparator,
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@motork/component-library/future/primitives'
import { Info, ChevronDown } from 'lucide-vue-next'
import ReassignUserModal from '@/components/modals/ReassignUserModal.vue'
import AssigneeDropdownContent from '@/components/tasks/AssigneeDropdownContent.vue'
import { useUsersStore } from '@/stores/users'
import { useUserStore } from '@/stores/user'
import { useLeadsStore } from '@/stores/leads'
import { useOpportunitiesStore } from '@/stores/opportunities'

const { t } = useI18n()
const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  taskType: {
    type: String,
    default: 'lead'
  }
})

const emit = defineEmits(['reassigned'])

const usersStore = useUsersStore()
const userStore = useUserStore()
const leadsStore = useLeadsStore()
const opportunitiesStore = useOpportunitiesStore()

const showReassignModal = ref(false)
const assigneeDropdownOpen = ref(false)

// Current user
const currentUser = computed(() => userStore.currentUser)

// Check if task is assigned
const isAssigned = computed(() => {
  return !!(props.task.assignee || props.task.owner || props.task.assignedTo)
})

const ownerInfo = computed(() => {
  const assigneeName = props.task.assignee || props.task.owner || props.task.assignedTo || 'Unassigned'
  const assigneeUser = usersStore.users?.find((u) => u.name === assigneeName)
  return {
    name: assigneeName,
    team: assigneeUser?.team || props.task.assigneeTeam || props.task.team || 'No team',
    dealership: assigneeUser?.dealership || props.task.assigneeDealership || 'MotorK Dealership',
    role: assigneeUser?.role || props.task.assigneeRole || 'salesman'
  }
})

// Helper functions
const getInitials = (name) => {
  if (!name || name === 'Unassigned') return '?'
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

const getRoleAvatarClass = (role) => {
  const classes = {
    'manager': 'bg-blue-100 text-blue-700',
    'salesman': 'bg-purple-100 text-purple-700',
    'operator': 'bg-orange-100 text-orange-700'
  }
  return classes[role] || 'bg-muted text-muted-foreground'
}

// Assign to self
const assignToSelf = async () => {
  if (!currentUser.value) return
  
  try {
    if (props.taskType === 'lead') {
      await leadsStore.updateLead(props.task.id, { 
        assignee: currentUser.value.name,
        assigneeType: 'user',
        assigneeTeam: currentUser.value.team,
        assigneeDealership: currentUser.value.dealership,
        assigneeRole: currentUser.value.role
      })
    } else if (props.taskType === 'opportunity') {
      await opportunitiesStore.updateOpportunity(props.task.id, { 
        assignee: currentUser.value.name,
        assigneeType: 'user',
        assigneeTeam: currentUser.value.team,
        assigneeDealership: currentUser.value.dealership,
        assigneeRole: currentUser.value.role
      })
    }
    
    emit('reassigned', currentUser.value)
  } catch (error) {
    console.error('Error assigning to self:', error)
  }
}

const clearAssignmentPayload = {
  assignee: null,
  assigneeType: null,
  assigneeTeam: null,
  assigneeDealership: null,
  assigneeRole: null,
  teamId: null
}

async function clearAssignment() {
  if (props.taskType === 'lead') {
    await leadsStore.updateLead(props.task.id, clearAssignmentPayload)
  } else if (props.taskType === 'opportunity') {
    await opportunitiesStore.updateOpportunity(props.task.id, clearAssignmentPayload)
  }
  emit('reassigned', null)
}

async function applyAssignment(assignee) {
  const updateData = {
    assignee: assignee.name,
    assigneeType: assignee.type,
    assigneeTeam: assignee.team ?? assignee.name,
    assigneeDealership: assignee.dealership,
    assigneeRole: assignee.role
  }
  if (assignee.type === 'team') {
    updateData.teamId = assignee.id
  }
  if (props.taskType === 'lead') {
    await leadsStore.updateLead(props.task.id, updateData)
  } else if (props.taskType === 'opportunity') {
    await opportunitiesStore.updateOpportunity(props.task.id, updateData)
  }
  emit('reassigned', assignee)
}

function handleAssigneeFromDropdown(assignee) {
  if (assignee === null) {
    clearAssignment().catch((err) => console.error('Error removing assignee:', err))
  } else {
    applyAssignment(assignee).catch((err) => console.error('Error assigning:', err))
  }
  assigneeDropdownOpen.value = false
}

async function handleReassign(assignee) {
  try {
    if (assignee === null) {
      await clearAssignment()
    } else {
      await applyAssignment(assignee)
    }
    showReassignModal.value = false
  } catch (error) {
    console.error('Error reassigning:', error)
  }
}
</script>

<style scoped>
/* Compact styling - minimal height */
</style>
