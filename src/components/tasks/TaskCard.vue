<template>
  <div 
    ref="cardRef"
    class="task-card bg-muted rounded-xl p-4 flex flex-col cursor-pointer relative transition-all border group border-black/5"
    :class="[cardClass, selectedBorderClass]"
    @click="$emit('select', itemId)"
  >
    <!-- Top row: Status (left) | Urgency | Due Date (right) -->
    <div class="flex items-center justify-between gap-2 w-full shrink-0 mb-1">
      <div class="flex items-center gap-2 shrink-0 min-w-0">
        <span
          v-if="taskStatusLabel"
          class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold shrink-0 w-fit"
          :class="taskStatusClass"
        >
          {{ taskStatusLabel }}
        </span>
        <span
          v-if="showUrgencyBadge"
          class="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground leading-none shrink-0"
        >
          <span
            :class="['shrink-0 rounded-full size-2', urgencyDotClass]"
            aria-hidden
          />
          {{ item.urgencyLevel }}
        </span>
      </div>
      <span
        v-if="displayDate"
        class="text-xs font-medium uppercase leading-none shrink-0"
        :class="displayDate.status.textClass"
      >
        {{ displayDate.text }}
      </span>
    </div>

    <div class="flex flex-col min-w-0 flex-1 pr-2">
      <div class="flex items-center gap-x-2 gap-y-0 overflow-hidden flex-wrap mb-0.5 leading-none pt-2 pb-1">
        <h3 class="font-medium text-foreground text-sm break-words shrink-0 m-0">{{ cardTitle }}</h3>
        <span
          v-if="showCustomerSubtitle"
          class="text-muted-foreground text-sm truncate shrink-0"
        >
          {{ getName(item) }}
        </span>
      </div>
    </div>

    <!-- Badges on new line below title (stage/status + recall + attempts) – commented out -->
    <!--
    <div class="mt-2 w-full shrink-0 flex items-center gap-2 flex-wrap">
      <TaskBadges :task="item" :attempts-shown-elsewhere="true" />
      <span
        v-if="showScheduledRecallBadge"
        class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase leading-none badge-ui bg-blue-100 text-blue-700"
      >
        Recall
      </span>
      <span
        v-if="callAttemptsCount > 0"
        class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase leading-none badge-ui bg-muted text-muted-foreground"
      >
        {{ callAttemptsValue }}
      </span>
    </div>
    -->
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatDueDateRelative, getDeadlineStatus } from '@/utils/formatters'
import { getTaskDisplayTitle } from '@/utils/taskActionTitle'
import { getTaskStatus } from '@/utils/taskStatus'
import { useSettingsStore } from '@/stores/settings'
import { getUrgencyDotClass } from '@/composables/useLeadUrgency'
import TaskBadges from './shared/TaskBadges.vue'

const settingsStore = useSettingsStore()

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  },
  selectedClass: {
    type: [String, Function],
    default: 'bg-muted border-2 border-blue-500'
  },
  unselectedClass: {
    type: [String, Function],
    default: 'bg-muted hover:border-muted-foreground/30'
  },
  getName: {
    type: Function,
    required: true
  }
})

defineEmits(['select'])

const itemId = computed(() => {
  return props.item.compositeId || `${props.item.type || 'task'}-${props.item.id}` || props.item.id
})

const isSelected = computed(() => props.selected)

const cardClass = computed(() => {
  if (isSelected.value) {
    const selected = typeof props.selectedClass === 'function' 
      ? props.selectedClass(props.item) 
      : props.selectedClass
    return selected
  }
  return typeof props.unselectedClass === 'function' 
    ? props.unselectedClass(props.item) 
    : props.unselectedClass
})

const selectedBorderClass = computed(() => {
  if (!isSelected.value) return ''
  if (props.item?.type === 'opportunity') return 'task-card-selected task-card-selected-opportunity'
  if (props.item?.type === 'lead') return 'task-card-selected task-card-selected-lead'
  return 'task-card-selected'
})


const displayTitleFallback = computed(() => {
  const t = props.item
  if (!t) return 'Task'
  return t.type === 'lead' ? 'Lead' : t.type === 'opportunity' ? 'Opportunity' : 'Task'
})

function removeDashesFromTitle(str) {
  if (!str || typeof str !== 'string') return str
  return str.replace(/\s*[–—]\s*/g, ' ').replace(/\s+/g, ' ').trim()
}

const rawTitle = computed(() => getTaskDisplayTitle(props.item) || displayTitleFallback.value)

const cardTitle = computed(() => removeDashesFromTitle(rawTitle.value))

const customerName = computed(() => props.item?.customer?.name?.trim() || '')

const showCustomerSubtitle = computed(() => {
  if (!customerName.value) return false
  const title = cardTitle.value || ''
  return !title.includes(customerName.value)
})

const deadline = computed(() => {
  const date = props.item.nextActionDue || props.item.dueDate
  if (!date) return null
  
  const status = getDeadlineStatus(date)
  
  return {
    text: formatDueDateRelative(date),
    status
  }
})

const expectedCloseDate = computed(() => {
  if (props.item.type !== 'opportunity' || !props.item.expectedCloseDate) return null
  
  const date = props.item.expectedCloseDate
  const status = getDeadlineStatus(date)
  
  return {
    text: formatDueDateRelative(date),
    status
  }
})

// Display expected close date for opportunities, or deadline for leads/opportunities without expected close date
const displayDate = computed(() => {
  if (props.item.type === 'opportunity' && expectedCloseDate.value) {
    return expectedCloseDate.value
  }
  return deadline.value
})

const showScheduledRecallBadge = computed(() =>
  props.item?.type === 'lead' && props.item?.scheduledRecallAppointment?.date
)

const maxContactAttempts = computed(() => settingsStore.getSetting('maxContactAttempts') ?? 5)

// Status column value (Overdue / In progress / Open) – same as tasks table Status column
const taskStatus = computed(() => getTaskStatus(props.item, maxContactAttempts.value))
const taskStatusLabel = computed(() => {
  const labels = { overdue: 'Overdue', in_progress: 'In progress', open: 'Open' }
  return labels[taskStatus.value] || ''
})
const taskStatusClass = computed(() => {
  const status = taskStatus.value
  return status === 'overdue' ? 'mk-task-status-overdue' : (status === 'in_progress' ? 'mk-task-status-in-progress' : 'mk-task-status-open')
})

// Use store.settings so reactivity to saved settings is guaranteed when user returns from Settings
// Only show urgency when explicitly enabled (default is off)
const urgencyEnabled = computed(() => settingsStore.settings?.urgencyEnabled === true)
const showUrgencyBadge = computed(() => Boolean(urgencyEnabled.value && props.item?.urgencyLevel))
const urgencyDotClass = computed(() => getUrgencyDotClass(props.item?.urgencyLevel))

const callAttemptsCount = computed(() => props.item?.contactAttempts?.length ?? 0)
const callAttemptsValue = computed(() => `${callAttemptsCount.value}/${maxContactAttempts.value}`)
</script>

<style scoped>
.task-card {
  box-shadow: var(--nsc-card-shadow);
}

.task-card.task-card-selected {
  border: 2px solid var(--brand-primary) !important;
}

.task-card.task-card-selected.task-card-selected-lead {
  border-color: #047857 !important;
}

.task-card.task-card-selected.task-card-selected-opportunity {
  border-color: #7c3aed !important;
}
</style>
