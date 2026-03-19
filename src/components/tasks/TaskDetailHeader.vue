<template>
  <header class="task-detail-header shrink-0 pt-4 lg:pt-2 px-4 sm:px-6 pb-1">
    <div class="task-detail-header-grid">
      <!-- Single row: Title + Assignee + date (left) | Prev/Next/Close (right) -->
      <div class="task-detail-header-title-row">
        <div class="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
          <Button
            v-if="task"
            variant="ghost"
            size="icon"
            class="lg:hidden shrink-0 -ml-0.5"
            aria-label="Back to task list"
            @click="$emit('close')"
          >
            <ChevronLeft class="size-4 text-muted-foreground" />
          </Button>
          <h3 v-if="task && taskTitle" class="task-detail-title text-sm sm:text-base font-semibold text-foreground truncate leading-tight shrink min-w-0">
            {{ taskTitle }}
          </h3>
          <h3 v-else-if="task" class="task-detail-title text-sm sm:text-base font-semibold text-foreground truncate leading-tight shrink min-w-0">
            {{ task.type === 'lead' ? 'Lead Qualification Task' : 'Opportunity Management Task' }}
          </h3>
          <h3 v-else class="task-detail-title text-sm sm:text-base font-semibold text-foreground leading-tight shrink min-w-0">
            No task selected
          </h3>
          <span
            v-if="task && taskStatusLabel"
            class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold shrink-0 w-fit"
            :class="taskStatusClass"
          >
            {{ taskStatusLabel }}
          </span>
          <TaskAssigneeDateBar
            v-if="task && hasAssigneeOrDate"
            :task="task"
            variant="inline"
            class="shrink-0"
            @postpone-expected-close="$emit('postpone-expected-close')"
            @reassigned="$emit('reassigned', $event)"
          />
        </div>
        <div class="task-detail-header-actions shrink-0 flex justify-end">
          <Button 
            variant="secondary" 
            size="icon" 
            class="task-detail-header-btn"
            @click="$emit('previous')" 
            :disabled="!hasPrevious"
          >
            <ChevronLeft :size="16" class="text-muted-foreground" />
          </Button>
          <Button 
            variant="secondary" 
            size="icon" 
            class="task-detail-header-btn"
            @click="$emit('next')" 
            :disabled="!hasNext"
          >
            <ChevronRight :size="16" class="text-muted-foreground" />
          </Button>
          <Button 
            v-if="isDrawerView"
            variant="secondary" 
            size="icon" 
            class="task-detail-header-btn ml-0.5 sm:ml-1"
            @click="$emit('close')"
          >
            <X :size="16" class="text-muted-foreground" />
          </Button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { Button } from '@motork/component-library/future/primitives'
import { ChevronLeft, ChevronRight, X } from 'lucide-vue-next'
import TaskAssigneeDateBar from './TaskAssigneeDateBar.vue'
import { getTaskDisplayTitle } from '@/utils/taskActionTitle'
import { getTaskStatus } from '@/utils/taskStatus'
import { useSettingsStore } from '@/stores/settings'

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

defineEmits(['previous', 'next', 'close', 'postpone-expected-close', 'reassigned'])

const settingsStore = useSettingsStore()
const maxContactAttempts = computed(() => settingsStore.getSetting('maxContactAttempts') ?? 5)
const taskStatus = computed(() => (props.task ? getTaskStatus(props.task, maxContactAttempts.value) : 'open'))
const taskStatusLabel = computed(() => {
  const labels = { overdue: 'Overdue', in_progress: 'In progress', open: 'Open' }
  return labels[taskStatus.value] || ''
})
const taskStatusClass = computed(() => {
  const status = taskStatus.value
  return status === 'overdue' ? 'mk-task-status-overdue' : (status === 'in_progress' ? 'mk-task-status-in-progress' : 'mk-task-status-open')
})

const hasPrevious = computed(() => {
  if (!props.task || !props.filteredTasks.length) return false
  const index = props.filteredTasks.findIndex(t => {
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

function removeDashesFromTitle(str) {
  if (!str || typeof str !== 'string') return str
  return str.replace(/\s*[–—]\s*/g, ' ').replace(/\s+/g, ' ').trim()
}

const taskTitle = computed(() => {
  if (!props.task) return null
  return removeDashesFromTitle(getTaskDisplayTitle(props.task))
})

const hasAssigneeOrDate = computed(() => {
  if (!props.task) return false
  const hasAssignee = !!(props.task.assignee || props.task.owner || props.task.assignedTo)
  const hasDue = props.task.type === 'lead' && props.task.nextActionDue
  const hasExpectedClose = props.task.type === 'opportunity' && props.task.expectedCloseDate
  const isClosed = props.task.stage === 'Closed Won' || props.task.stage === 'Closed Lost' || props.task.isClosed
  return hasAssignee || (hasDue && !isClosed) || hasExpectedClose
})
</script>

<style scoped>
/* Compact header – smaller than page header */
.task-detail-header {
  background-color: var(--background);
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-direction: column;
}

.task-detail-header-grid {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 100%;
}

.task-detail-header-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  min-height: 2.25rem;
}

.task-detail-header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
