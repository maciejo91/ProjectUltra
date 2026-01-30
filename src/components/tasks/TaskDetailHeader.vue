<template>
  <div class="border-b border-border bg-white px-6 h-16 min-h-16 shrink-0">
    <div class="flex items-center justify-between gap-4 w-full h-full">
      <div class="flex flex-col min-w-0">
        <!-- Task Title & Badges & Tags Row -->
        <div class="flex items-center gap-2 min-w-0 flex-wrap">
          <h2 v-if="task && taskTitle" class="text-lg font-medium text-foreground truncate">
            {{ taskTitle }}
          </h2>
          <h2 v-else-if="task" class="text-lg font-medium text-foreground truncate">
            {{ task.type === 'lead' ? 'Lead Qualification Task' : 'Opportunity Management Task' }}
          </h2>
          <h2 v-else class="text-lg font-medium text-foreground">
            No task selected
          </h2>

          <!-- Compact Badges -->
          <div v-if="task" class="shrink-0">
            <TaskBadges :task="task" />
          </div>
          
          <!-- Tags -->
          <div v-if="task" class="flex items-center gap-1.5 shrink-0">
            <Badge 
              v-for="tag in (task.tags || [])" 
              :key="tag"
              :text="tag"
              size="small"
              theme="blue"
            />
            <button
              @click.stop="showAddTagModal = true"
              class="text-xs text-muted-foreground hover:text-primary font-medium hover:underline flex items-center gap-1 transition-colors whitespace-nowrap"
            >
              <Plus class="w-3 h-3" />
              <span>tag</span>
            </button>
          </div>
        </div>
        
        <!-- Assignee Row: only show assignee when assigned; unassigned state is shown in the blue banner below -->
        <div v-if="task && (isAssigned || showDueDate || showExpectedCloseDate)" class="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <!-- Assigned: compact avatar + name + change dropdown -->
          <div v-if="isAssigned" class="flex items-center gap-1.5">
            <div
              class="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[8px] shrink-0"
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
                  class="h-5 w-5"
                  aria-label="Change assignee"
                >
                  <ChevronDown :size="10" stroke-width="2" aria-hidden="true" />
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

          <!-- Separator and Date (separator only when we have assignee + dates) -->
          <template v-if="showDueDate || showExpectedCloseDate">
            <span v-if="isAssigned" class="text-muted-foreground">|</span>
            <!-- Due Date -->
            <div v-if="showDueDate" class="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays class="w-3 h-3 shrink-0" />
              <span>{{ dueDateLabel }}: {{ formattedDueDate }}</span>
            </div>
            
            <!-- Expected Close Date -->
            <div
              v-if="showExpectedCloseDate"
              class="relative"
            >
              <button
                type="button"
                class="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                :class="{ 'cursor-default': isTaskClosed }"
                :aria-expanded="showExpectedCloseMenu && !isTaskClosed"
                aria-haspopup="true"
                aria-label="Expected close date"
                @click.stop="!isTaskClosed && (showExpectedCloseMenu = !showExpectedCloseMenu)"
              >
                <CalendarDays class="w-3 h-3 shrink-0" />
                <span>Expected Close: {{ formattedExpectedCloseDate }}</span>
                <ChevronDown
                  v-if="!isTaskClosed"
                  :size="10"
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
          </template>
        </div>
      </div>
      <div class="flex items-center gap-3 shrink-0">
        <!-- Use MotorK Button component -->
        <Button 
          variant="secondary" 
          size="icon" 
          @click="$emit('previous')" 
          :disabled="!hasPrevious"
        >
          <ChevronLeft :size="16" class="text-muted-foreground" />
        </Button>
        <Button 
          variant="secondary" 
          size="icon" 
          @click="$emit('next')" 
          :disabled="!hasNext"
        >
          <ChevronRight :size="16" class="text-muted-foreground" />
        </Button>
        
        <!-- Close button (only shown in drawer view) -->
        <Button 
          v-if="isDrawerView"
          variant="secondary" 
          size="icon" 
          @click="$emit('close')"
          class="ml-1"
        >
          <X :size="16" class="text-muted-foreground" />
        </Button>
      </div>
    </div>
    
    <!-- Add Tag Modal -->
    <AddTagModal
      :show="showAddTagModal"
      :existing-tags="task?.tags || []"
      @close="showAddTagModal = false"
      @add="handleAddTag"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Button, Badge, Popover, PopoverTrigger, PopoverContent } from '@motork/component-library/future/primitives'
import { ChevronLeft, ChevronRight, X, ChevronDown, Plus, CalendarDays } from 'lucide-vue-next'
import TaskBadges from './shared/TaskBadges.vue'
import { getTaskActionTitle } from '@/utils/taskActionTitle'
import { formatDueDate } from '@/utils/formatters'
import AddTagModal from '@/components/modals/AddTagModal.vue'
import AssigneeDropdownContent from '@/components/tasks/AssigneeDropdownContent.vue'
import { useUsersStore } from '@/stores/users'
import { useLeadsStore } from '@/stores/leads'
import { useOpportunitiesStore } from '@/stores/opportunities'

const props = defineProps({
  task: { 
    type: Object, 
    default: null 
  },
  filteredTasks: { 
    type: Array, 
    default: () => [] 
  },
  isDrawerView: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['previous', 'next', 'close', 'postpone-expected-close', 'tag-updated', 'reassigned'])

const showExpectedCloseMenu = ref(false)
const showAddTagModal = ref(false)
const assigneeDropdownOpen = ref(false)

const usersStore = useUsersStore()
const leadsStore = useLeadsStore()
const opportunitiesStore = useOpportunitiesStore()

// Check if task is assigned
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

// Due date for leads
const showDueDate = computed(() => {
  return props.task?.type === 'lead' && props.task?.nextActionDue && !isTaskClosed.value
})

const dueDateLabel = computed(() => {
  return 'Due Date'
})

const formattedDueDate = computed(() => {
  if (!props.task?.nextActionDue) return ''
  return formatDueDate(props.task.nextActionDue)
})

// Expected close date for opportunities
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

const hasPrevious = computed(() => {
  if (!props.task || !props.filteredTasks.length) return false
  const index = props.filteredTasks.findIndex(t => {
    // Handle both composite IDs and regular IDs
    const taskId = props.task.compositeId || props.task.id
    const compareId = t.compositeId || t.id
    return compareId === taskId
  })
  return index > 0
})

const hasNext = computed(() => {
  if (!props.task || !props.filteredTasks.length) return false
  const index = props.filteredTasks.findIndex(t => {
    const taskId = props.task.compositeId || props.task.id
    const compareId = t.compositeId || t.id
    return compareId === taskId
  })
  return index >= 0 && index < props.filteredTasks.length - 1
})

const taskTitle = computed(() => {
  if (!props.task) return null
  return getTaskActionTitle(props.task)
})

// Handle tag addition
const handleAddTag = async (payload) => {
  if (!props.task) return
  const tagName = typeof payload === 'string' ? payload : payload.name
  const currentTags = props.task.tags || []
  
  if (currentTags.includes(tagName)) {
    showAddTagModal.value = false
    return
  }
  
  const updatedTags = [...currentTags, tagName]
  
  try {
    // Emit event to parent to handle tag update
    emit('tag-updated', { taskId: props.task.id, taskType: props.task.type, tags: updatedTags })
    showAddTagModal.value = false
  } catch (error) {
    console.error('Error adding tag:', error)
  }
}

</script>

<style scoped>
/* Fluid typography for responsive text sizes */
.text-lg {
  font-size: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  line-height: 1.4;
}

.text-sm {
  font-size: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
  line-height: 1.5;
}
</style>
