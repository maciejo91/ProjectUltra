<template>
  <div 
    ref="cardRef"
    class="task-card bg-white rounded-xl p-4 flex flex-col cursor-pointer relative transition-all border group border-black/5"
    :class="[cardClass, selectedBorderClass]"
    @click="$emit('select', itemId)"
  >
    <!-- Top row: Urgency (left) + Due Date (right) -->
    <div class="flex items-center justify-between gap-2 w-full shrink-0 mb-1">
      <div class="flex items-center gap-1.5 min-w-0">
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
        <span
          v-else-if="showHotFallbackBadge"
          class="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground leading-none shrink-0"
        >
          <span class="shrink-0 rounded-full size-2 bg-red-500" aria-hidden />
          Hot
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
      <div class="flex items-center gap-1 mb-0.5">
        <h3 class="font-medium text-foreground text-sm break-words">{{ cardTitle }}</h3>
      </div>
      <div v-if="showCustomerSubtitle" class="flex items-center gap-2 overflow-hidden flex-wrap">
        <span class="text-muted-foreground text-sm truncate">
          {{ getName(item) }}
        </span>
      </div>
      <p
        v-if="callAttemptsCount > 0"
        class="text-muted-foreground text-xs mt-0.5"
      >
        Attempts {{ callAttemptsValue }}
      </p>
    </div>

    <!-- Badges: full-width row -->
    <div class="mt-2 w-full shrink-0">
      <TaskBadges :task="item" :urgency-shown-elsewhere="true" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatDueDate, getDeadlineStatus } from '@/utils/formatters'
import { getTaskDisplayTitle } from '@/utils/taskActionTitle'
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
    default: 'bg-white border-2 border-blue-500'
  },
  unselectedClass: {
    type: [String, Function],
    default: 'bg-white hover:border-muted-foreground/30'
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
  return props.item?.type === 'opportunity' ? 'task-card-selected task-card-selected-opportunity' : 'task-card-selected'
})


const displayTitleFallback = computed(() => {
  const t = props.item
  if (!t) return 'Task'
  const name = t.customer?.name?.trim()
  if (name) return name
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
    text: formatDueDate(date),
    status
  }
})

const expectedCloseDate = computed(() => {
  if (props.item.type !== 'opportunity' || !props.item.expectedCloseDate) return null
  
  const date = props.item.expectedCloseDate
  const status = getDeadlineStatus(date)
  
  return {
    text: formatDueDate(date),
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

const maxContactAttempts = computed(() => settingsStore.getSetting('maxContactAttempts') ?? 5)
const callAttemptsCount = computed(() => props.item.contactAttempts?.length ?? 0)
const callAttemptsValue = computed(() => `${callAttemptsCount.value}/${maxContactAttempts.value}`)

const urgencyEnabled = computed(() => settingsStore.getSetting('urgencyEnabled') !== false)
const showUrgencyBadge = computed(() => urgencyEnabled.value && props.item?.urgencyLevel)
const showHotFallbackBadge = computed(() => !urgencyEnabled.value && props.item?.priority === 'Hot')
const urgencyDotClass = computed(() => getUrgencyDotClass(props.item?.urgencyLevel))
</script>

<style scoped>
.task-card {
  box-shadow: var(--nsc-card-shadow);
}

.task-card.task-card-selected {
  border: 2px solid #0470e9 !important;
}

.task-card.task-card-selected.task-card-selected-opportunity {
  border-color: #7c3aed !important;
}
</style>
