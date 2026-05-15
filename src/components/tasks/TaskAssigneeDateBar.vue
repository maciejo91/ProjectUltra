<template>
  <div
    v-if="task && (isAssigned || (showDueDate && !assigneeOnly) || (showExpectedCloseDate && !assigneeOnly) || (showLastUpdated && !assigneeOnly))"
    class="flex items-center flex-wrap shrink-0"
    :class="variant === 'inline' ? 'gap-2' : 'justify-between gap-2 pt-1.5 pb-1.5 px-4'"
  >
    <div v-if="isAssigned" class="flex items-center gap-2 shrink-0">
      <Popover :open="assigneeDropdownOpen" @update:open="(v) => (assigneeDropdownOpen = v)">
        <PopoverTrigger as-child>
          <button
            type="button"
            class="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Change assignee"
          >
            <div
              class="w-5 h-5 rounded-full flex items-center justify-center shrink-0 p-0.5"
              :class="getRoleAvatarClass(ownerInfo.role)"
            >
              <span class="text-[9px] font-medium leading-none">{{ getInitials(ownerInfo.name) }}</span>
            </div>
            <span class="truncate">{{ ownerInfo.name }}</span>
            <ChevronDown
              :size="12"
              stroke-width="2"
              class="shrink-0 transition-transform ml-1"
              aria-hidden="true"
            />
          </button>
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
    <div
      v-if="showLastUpdated && !assigneeOnly"
      class="shrink-0 flex items-center gap-1 text-sm text-muted-foreground"
    >
      <History class="w-3.5 h-3.5 shrink-0" />
      <span>Last updated: {{ formattedLastUpdated }}</span>
    </div>
    <div
      v-if="showDueDate && !assigneeOnly"
      class="relative shrink-0"
    >
      <button
        type="button"
        class="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        aria-expanded="showDueDateMenu"
        aria-haspopup="true"
        aria-label="Due date"
        @click.stop="showDueDateMenu = !showDueDateMenu"
      >
        <Clock class="w-3.5 h-3.5 shrink-0" />
        <span>{{ dueDateLabel }}: {{ formattedDueDate }}</span>
        <ChevronDown
          :size="12"
          stroke-width="2"
          class="shrink-0 transition-transform ml-1"
          :class="{ 'rotate-180': showDueDateMenu }"
        />
      </button>
      <div
        v-if="showDueDateMenu && dueDateMenuItems.length > 0"
        v-click-outside="() => (showDueDateMenu = false)"
        class="absolute left-0 top-full mt-2 z-50 w-56 bg-white border border-border rounded-lg shadow-nsc-card py-1"
        @click.stop
      >
        <button
          v-for="item in dueDateMenuItems"
          :key="item.key"
          type="button"
          class="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!!item.disabled"
          @click="item.onClick()"
        >
          {{ item.label }}
        </button>
      </div>
    </div>
    <div
      v-if="showExpectedCloseDate && !assigneeOnly"
      class="relative shrink-0"
    >
      <button
        type="button"
        class="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        :class="{ 'cursor-default': isTaskClosed }"
        :aria-expanded="showExpectedCloseMenu && !isTaskClosed"
        aria-haspopup="true"
        aria-label="Expected close date"
        @click.stop="!isTaskClosed && (showExpectedCloseMenu = !showExpectedCloseMenu)"
      >
        <Clock class="w-3.5 h-3.5 shrink-0" />
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
          class="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
import { useI18n } from 'vue-i18n'
import { Popover, PopoverTrigger, PopoverContent } from '@motork/component-library/future/primitives'
import { ChevronDown, Clock, History } from 'lucide-vue-next'
import AssigneeDropdownContent from '@/components/tasks/AssigneeDropdownContent.vue'
import { formatDueDateRelative } from '@/utils/formatters'
import { formatTaskDueTimeDisplay } from '@/utils/taskTableDates'
import { getTaskTableStatus, TASK_TABLE_STATUS } from '@/utils/taskStatus'
import { useUsersStore } from '@/stores/users'
import { useLeadsStore } from '@/stores/leads'
import { useOpportunitiesStore } from '@/stores/opportunities'

const { t, locale } = useI18n()

const props = defineProps({
  task: {
    type: Object,
    default: null
  },
  variant: {
    type: String,
    default: 'bar',
    validator: (v) => ['bar', 'inline'].includes(v)
  },
  assigneeOnly: {
    type: Boolean,
    default: false
  },
  /** When 'lastUpdated', show last updated date with History icon instead of due/expected close */
  dateDisplay: {
    type: String,
    default: 'due',
    validator: (v) => ['due', 'lastUpdated'].includes(v)
  }
})

const emit = defineEmits(['postpone-expected-close', 'reassigned'])

const showExpectedCloseMenu = ref(false)
const showDueDateMenu = ref(false)
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

const showLastUpdated = computed(() => {
  return props.dateDisplay === 'lastUpdated' && !!(props.task?.lastActivity || props.task?.createdAt)
})

const formattedLastUpdated = computed(() => {
  if (!props.task) return ''
  const date = props.task.lastActivity || props.task.createdAt
  return date ? formatDueDateRelative(date, { pastSuffix: 'ago' }) : ''
})

const showDueDate = computed(() => {
  return props.dateDisplay === 'due' && props.task?.type === 'lead' && props.task?.nextActionDue && !isTaskClosed.value
})

const dueDateLabel = computed(() => 'Due Date')

const formattedDueDate = computed(() => {
  if (!props.task?.nextActionDue) return ''
  const { label } = formatTaskDueTimeDisplay(
    props.task,
    props.task.nextActionDue,
    locale.value,
    t
  )
  return label
})

const showExpectedCloseDate = computed(() => {
  return props.dateDisplay === 'due' && props.task?.type === 'opportunity' && props.task?.expectedCloseDate
})

const formattedExpectedCloseDate = computed(() => {
  if (!props.task?.expectedCloseDate) return ''
  return formatDueDateRelative(props.task.expectedCloseDate)
})

const isTaskClosed = computed(() => {
  if (!props.task) return false
  return getTaskTableStatus(props.task) === TASK_TABLE_STATUS.CLOSED
})

const dueDateMenuItems = computed(() => {
  if (props.task?.type !== 'lead') return []
  return [
    {
      key: 'postpone',
      label: 'Postpone',
      onClick: () => {
        showDueDateMenu.value = false
        emit('postpone-expected-close')
      }
    }
  ]
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
