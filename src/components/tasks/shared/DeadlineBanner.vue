<template>
  <div 
    v-if="shouldShow"
    class="flex items-center justify-between px-4 py-2 border-b transition-all duration-200"
    :class="[deadlineStatus.bgClass, deadlineStatus.borderClass]"
  >
    <div class="flex items-center gap-2.5 min-w-0">
      <div 
        class="flex items-center justify-center rounded-full w-5 h-5 shrink-0"
        :class="deadlineStatus.type === 'overdue' ? 'bg-red-100' : 'bg-orange-100'"
      >
        <component 
          :is="statusIcon" 
          :size="12" 
          :class="deadlineStatus.textClass"
        />
      </div>
      
      <div class="flex items-center gap-2 min-w-0">
        <span class="text-sm font-bold uppercase tracking-wider" :class="deadlineStatus.textClass">
          {{ deadlineStatus.type === 'overdue' ? 'Overdue' : 'Urgent' }}
        </span>
        <span class="text-sm text-muted-foreground opacity-30">•</span>
        <span class="text-sm font-medium truncate" :class="deadlineStatus.textClass">
          Next Action: {{ formatDeadlineFull(nextActionDue) }}
        </span>
      </div>
    </div>

    <button
      @click="dismiss"
      class="p-1 rounded-md transition-colors shrink-0"
      :class="[deadlineStatus.textClass, 'hover:bg-black/5']"
      title="Dismiss"
    >
      <X :size="14" />
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { AlertCircle, Zap, X } from 'lucide-vue-next'
import { formatDeadlineFull, getDeadlineStatus } from '@/utils/formatters'

const props = defineProps({
  nextActionDue: {
    type: String,
    default: null
  },
  isClosed: {
    type: Boolean,
    default: false
  },
  showDeadlineBanner: {
    type: Boolean,
    default: true
  },
  taskId: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits(['dismissed'])

// Track dismissed state per component instance
const isDismissed = ref(false)

const deadlineStatus = computed(() => {
  return getDeadlineStatus(props.nextActionDue)
})

const statusIcon = computed(() => {
  if (deadlineStatus.value.type === 'overdue') return AlertCircle
  if (deadlineStatus.value.type === 'urgent') return Zap
  return AlertCircle
})

const shouldShow = computed(() => {
  if (props.isClosed) return false
  if (!props.showDeadlineBanner) return false
  if (isDismissed.value) return false
  // Only show for overdue or urgent
  return deadlineStatus.value.type === 'overdue' || deadlineStatus.value.type === 'urgent'
})

const dismiss = () => {
  isDismissed.value = true
  emit('dismissed')
}
</script>