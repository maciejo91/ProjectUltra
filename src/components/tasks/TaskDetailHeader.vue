<template>
  <div class="border-b border-border bg-white px-6 h-16 min-h-16 shrink-0">
    <div class="flex items-center justify-between gap-4 w-full h-full">
      <div class="flex flex-col min-w-0">
        <!-- Task Title + Badges + Tags + Add tag: same line -->
        <div class="flex items-center gap-2 min-w-0 flex-wrap">
          <h3 v-if="task && taskTitle" class="task-detail-title font-bold text-foreground break-words">
            {{ taskTitle }}
          </h3>
          <h3 v-else-if="task" class="task-detail-title font-bold text-foreground break-words">
            {{ task.type === 'lead' ? 'Lead Qualification Task' : 'Opportunity Management Task' }}
          </h3>
          <h3 v-else class="task-detail-title font-bold text-foreground">
            No task selected
          </h3>
          <template v-if="task">
            <TaskBadges :task="task" />
            <template v-for="tag in normalizedTags" :key="tag.name">
              <span
                v-if="tag.color"
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white shrink-0"
                :style="{ backgroundColor: tag.color }"
              >
                {{ tag.name }}
              </span>
              <Badge
                v-else
                :text="tag.name"
                size="small"
                theme="blue"
              />
            </template>
            <button
              @click.stop="showAddTagModal = true"
              class="text-xs text-muted-foreground hover:text-primary font-medium hover:underline transition-colors whitespace-nowrap"
            >
              + tag
            </button>
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
      :existing-tags="existingTagNames"
      @close="showAddTagModal = false"
      @add="handleAddTag"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Button, Badge } from '@motork/component-library/future/primitives'
import { ChevronLeft, ChevronRight, X } from 'lucide-vue-next'
import TaskBadges from './shared/TaskBadges.vue'
import { getTaskDisplayTitle } from '@/utils/taskActionTitle'
import AddTagModal from '@/components/modals/AddTagModal.vue'

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

const showAddTagModal = ref(false)

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

function removeDashesFromTitle(str) {
  if (!str || typeof str !== 'string') return str
  return str.replace(/\s*[–—]\s*/g, ' ').replace(/\s+/g, ' ').trim()
}

const taskTitle = computed(() => {
  if (!props.task) return null
  return removeDashesFromTitle(getTaskDisplayTitle(props.task))
})

// Normalize tags to { name, color }[] for display (support legacy string[] from mock)
const normalizedTags = computed(() => {
  const tags = props.task?.tags || []
  return tags.map((t) =>
    typeof t === 'string' ? { name: t, color: null } : { name: t.name, color: t.color || null }
  )
})

const existingTagNames = computed(() => normalizedTags.value.map((t) => t.name))

// Handle tag addition: payload is { name, color } from AddTagModal
const handleAddTag = async (payload) => {
  if (!props.task) return
  const name = typeof payload === 'string' ? payload : payload.name
  const color = typeof payload === 'object' && payload?.color ? payload.color : null
  const current = (props.task.tags || []).map((t) =>
    typeof t === 'string' ? { name: t, color: null } : { name: t.name, color: t.color || null }
  )
  if (current.some((t) => t.name === name)) {
    showAddTagModal.value = false
    return
  }
  const updatedTags = [...current, { name, color }]
  emit('tag-updated', { taskId: props.task.id, taskType: props.task.type, tags: updatedTags })
  showAddTagModal.value = false
}

</script>

<style scoped>
/* Match TaskCard title: same font size and line-height */
.task-detail-title {
  font-size: 1rem;
  line-height: 1.5rem;
}

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
