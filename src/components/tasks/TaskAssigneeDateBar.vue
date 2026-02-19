<template>
  <div
    v-if="task && (isAssigned || showDueDate || showExpectedCloseDate)"
    class="flex items-center flex-wrap shrink-0"
    :class="variant === 'inline' ? 'gap-2' : 'justify-between gap-2 pt-1.5 pb-1.5 px-4'"
  >
    <div v-if="isAssigned" class="flex items-center gap-2 shrink-0">
      <div
        class="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
        :class="getRoleAvatarClass(ownerInfo.role)"
      >
        {{ getInitials(ownerInfo.name) }}
      </div>
      <span class="text-xs font-medium text-foreground truncate">{{ ownerInfo.name }}</span>
      <Popover :open="assigneeDropdownOpen" @update:open="(v) => (assigneeDropdownOpen = v)">
        <PopoverTrigger as-child>
          <Button
            variant="ghost"
            size="icon-sm"
            class="h-6 w-6"
            aria-label="Change assignee"
          >
            <ChevronDown :size="12" stroke-width="2" aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          class="w-auto p-0 rounded-lg shadow-nsc-card bg-background"
          side="bottom"
          align="end"
        >
          <AssigneeDropdownContent show-remove-assignee @select="handleAssigneeFromDropdown" />
        </PopoverContent>
      </Popover>
    </div>
    <span v-if="variant === 'inline' && isAssigned && (showDueDate || showExpectedCloseDate)" class="text-muted-foreground/60 shrink-0">|</span>
    <div v-if="showDueDate" class="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
      <CalendarDays class="w-4 h-4 shrink-0" />
      <span>{{ dueDateLabel }}: {{ formattedDueDate }}</span>
    </div>
    <div
      v-if="showExpectedCloseDate"
      class="relative shrink-0"
    >
      <button
        type="button"
        class="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        :class="{ 'cursor-default': isTaskClosed }"
        :aria-expanded="showExpectedCloseMenu && !isTaskClosed"
        aria-haspopup="true"
        aria-label="Expected close date"
        @click.stop="!isTaskClosed && (showExpectedCloseMenu = !showExpectedCloseMenu)"
      >
        <CalendarDays class="w-4 h-4 shrink-0" />
        <span>Expected Close: {{ formattedExpectedCloseDate }}</span>
        <ChevronDown
          v-if="!isTaskClosed"
          :size="12"
          stroke-width="2"
          class="shrink-0 transition-transform ml-1"
          :class="{ 'rotate-180': showExpectedCloseMenu }"
        />
      </button>
      <div
        v-if="showExpectedCloseMenu && !isTaskClosed && expectedCloseMenuItems.length > 0"
        v-click-outside="() => (showExpectedCloseMenu = false)"
        class="absolute left-0 top-full mt-2 z-50 w-56 bg-white border border-border rounded-lg shadow-nsc-card py-1"
        @click.stop
      >
        <button
          v-for="item in expectedCloseMenuItems"
          :key="item.key"
          type="button"
          class="w-full px-3 py-2 text-left text-xs text-foreground hover:bg-muted flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!!item.disabled"
          @click="item.onClick()"
        >
          {{ item.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Button, Popover, PopoverTrigger, PopoverContent } from '@motork/component-library/future/primitives'
import { ChevronDown, CalendarDays } from 'lucide-vue-next'
import AssigneeDropdownContent from '@/components/tasks/AssigneeDropdownContent.vue'
import { formatDueDate } from '@/utils/formatters'
import { useUsersStore } from '@/stores/users'
import { useLeadsStore } from '@/stores/leads'
import { useOpportunitiesStore } from '@/stores/opportunities'

const props = defineProps({
  task: {
    type: Object,
    default: null
  },
  variant: {
    type: String,
    default: 'bar',
    validator: (v) => ['bar', 'inline'].includes(v)
  }
})

const emit = defineEmits(['postpone-expected-close', 'reassigned'])

const showExpectedCloseMenu = ref(false)
const assigneeDropdownOpen = ref(false)

const usersStore = useUsersStore()
const leadsStore = useLeadsStore()
const opportunitiesStore = useOpportunitiesStore()

const isAssigned = computed(() => {
  return !!(props.task?.assignee || props.task?.owner || props.task?.assignedTo)
})

const ownerInfo = computed(() => {
  const assigneeName = props.task?.assignee || props.task?.owner || props.task?.assignedTo || 'Unassigned'
  const assigneeUser = usersStore.users?.find((u) => u.name === assigneeName)
  return {
    name: assigneeName,
    team: assigneeUser?.team || props.task?.assigneeTeam || props.task?.team || 'No team',
    dealership: assigneeUser?.dealership || props.task?.assigneeDealership || 'MotorK Dealership',
    role: assigneeUser?.role || props.task?.assigneeRole || 'salesman'
  }
})

function getInitials(name) {
  if (!name || name === 'Unassigned') return '?'
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

function getRoleAvatarClass(role) {
  const classes = {
    manager: 'bg-blue-100 text-blue-700',
    salesman: 'bg-purple-100 text-purple-700',
    operator: 'bg-orange-100 text-orange-700'
  }
  return classes[role] || 'bg-muted text-muted-foreground'
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
  if (!props.task) return
  if (props.task.type === 'lead') {
    await leadsStore.updateLead(props.task.id, clearAssignmentPayload)
  } else if (props.task.type === 'opportunity') {
    await opportunitiesStore.updateOpportunity(props.task.id, clearAssignmentPayload)
  }
  emit('reassigned', null)
}

async function applyAssignment(assignee) {
  if (!props.task) return
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
  if (props.task.type === 'lead') {
    await leadsStore.updateLead(props.task.id, updateData)
  } else if (props.task.type === 'opportunity') {
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

const showDueDate = computed(() => {
  return props.task?.type === 'lead' && props.task?.nextActionDue && !isTaskClosed.value
})

const dueDateLabel = computed(() => 'Due Date')

const formattedDueDate = computed(() => {
  if (!props.task?.nextActionDue) return ''
  return formatDueDate(props.task.nextActionDue)
})

const showExpectedCloseDate = computed(() => {
  return props.task?.type === 'opportunity' && props.task?.expectedCloseDate
})

const formattedExpectedCloseDate = computed(() => {
  if (!props.task?.expectedCloseDate) return ''
  return formatDueDate(props.task.expectedCloseDate)
})

const isTaskClosed = computed(() => {
  return props.task?.stage === 'Closed Won' || props.task?.stage === 'Closed Lost' || props.task?.isClosed
})

const expectedCloseMenuItems = computed(() => {
  if (props.task?.type !== 'opportunity') return []
  return [
    {
      key: 'postpone',
      label: 'Postpone',
      onClick: () => {
        showExpectedCloseMenu.value = false
        emit('postpone-expected-close')
      }
    }
  ]
})
</script>
