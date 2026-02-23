<template>
  <header class="task-detail-header shrink-0 pt-4 lg:pt-2 px-4 sm:px-6 pb-1">
    <div class="task-detail-header-grid">
      <!-- Row 1: Title + Prev/Next aligned on same line -->
      <div class="task-detail-header-title-row">
        <div class="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          <button
            v-if="task"
            type="button"
            class="lg:hidden w-8 h-8 flex items-center justify-center -ml-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors shrink-0"
            aria-label="Back to task list"
            @click="$emit('close')"
          >
            <ArrowLeft class="w-5 h-5 shrink-0" />
          </button>
          <h3 v-if="task && taskTitle" class="task-detail-title text-sm sm:text-base font-semibold text-foreground truncate leading-tight">
            {{ taskTitle }}
          </h3>
          <h3 v-else-if="task" class="task-detail-title text-sm sm:text-base font-semibold text-foreground truncate leading-tight">
            {{ task.type === 'lead' ? 'Lead Qualification Task' : 'Opportunity Management Task' }}
          </h3>
          <h3 v-else class="task-detail-title text-sm sm:text-base font-semibold text-foreground leading-tight">
            No task selected
          </h3>
        </div>
        <div class="task-detail-header-actions shrink-0">
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
      <!-- Row 2: Badges + Tags (wrap to next line if needed) -->
      <div v-if="task" class="task-detail-header-badges flex items-center gap-1.5 sm:gap-2 flex-wrap">
        <TaskBadges :task="task" />
        <template v-for="tag in normalizedTags" :key="tag.name">
          <span
            v-if="tag.color"
            class="tag-pill inline-flex items-center gap-1 pr-0.5 pl-1.5 py-0.5 rounded text-xs font-medium shrink-0"
            :class="isLightColor(tag.color) ? 'text-foreground' : 'text-white'"
            :style="{ backgroundColor: tag.color }"
          >
            <span class="min-w-0 truncate">{{ tag.name }}</span>
            <button
              type="button"
              class="tag-remove rounded p-0.5 shrink-0 opacity-70 hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
              :aria-label="`Remove tag ${tag.name}`"
              @click.stop="openRemoveTagConfirm(tag.name)"
            >
              <X :size="12" />
            </button>
          </span>
          <span v-else class="tag-pill inline-flex items-center gap-1 pr-0.5 pl-1.5 py-0.5 rounded text-xs font-medium shrink-0 bg-primary/15 text-foreground">
            <span class="min-w-0 truncate">{{ tag.name }}</span>
            <button
              type="button"
              class="tag-remove rounded p-0.5 shrink-0 opacity-70 hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
              :aria-label="`Remove tag ${tag.name}`"
              @click.stop="openRemoveTagConfirm(tag.name)"
            >
              <X :size="12" />
            </button>
          </span>
        </template>
        <button
          @click.stop="showAddTagModal = true"
          class="text-xs text-muted-foreground hover:text-primary font-medium hover:underline transition-colors whitespace-nowrap shrink-0"
        >
          + tag
        </button>
      </div>
      <TaskAssigneeDateBar
      v-if="task && hasAssigneeOrDate"
      :task="task"
      variant="inline"
      class="mt-0.5 pt-0 pb-1 shrink-0 min-w-0"
      @postpone-expected-close="$emit('postpone-expected-close')"
      @reassigned="$emit('reassigned', $event)"
    />
    </div>
    
    <!-- Add Tag Modal -->
    <AddTagModal
      :show="showAddTagModal"
      :existing-tags="existingTagNames"
      @close="showAddTagModal = false"
      @add="handleAddTag"
    />

    <!-- Remove tag confirmation -->
    <Dialog :open="!!tagToRemove" @update:open="handleRemoveTagConfirmOpenChange">
      <DialogPortal>
        <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
        <DialogContent
          class="w-full sm:max-w-md"
          :show-close-button="true"
        >
          <DialogHeader class="shrink-0">
            <DialogTitle>Remove tag</DialogTitle>
            <DialogDescription>
              Remove “{{ tagToRemove }}” from this task? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter class="shrink-0 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3">
            <Button
              variant="outline"
              class="rounded-sm w-full sm:w-auto"
              @click="closeRemoveTagConfirm"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              class="rounded-sm w-full sm:w-auto"
              @click="confirmRemoveTag"
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  </header>
</template>

<script setup>
import { computed, ref } from 'vue'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle
} from '@motork/component-library/future/primitives'
import { ArrowLeft, ChevronLeft, ChevronRight, X } from 'lucide-vue-next'
import TaskBadges from './shared/TaskBadges.vue'
import TaskAssigneeDateBar from './TaskAssigneeDateBar.vue'
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

const emit = defineEmits(['previous', 'next', 'close', 'tag-updated', 'postpone-expected-close', 'reassigned'])

const showAddTagModal = ref(false)
const tagToRemove = ref(null)

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

/** Returns true if the hex color is light (use dark text); false for dark backgrounds (use white text). */
function isLightColor(hex) {
  if (!hex || typeof hex !== 'string') return false
  const m = hex.replace(/^#/, '').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
  if (!m) return false
  const r = parseInt(m[1], 16) / 255
  const g = parseInt(m[2], 16) / 255
  const b = parseInt(m[3], 16) / 255
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luminance > 0.5
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

const hasAssigneeOrDate = computed(() => {
  if (!props.task) return false
  const hasAssignee = !!(props.task.assignee || props.task.owner || props.task.assignedTo)
  const hasDue = props.task.type === 'lead' && props.task.nextActionDue
  const hasExpectedClose = props.task.type === 'opportunity' && props.task.expectedCloseDate
  const isClosed = props.task.stage === 'Closed Won' || props.task.stage === 'Closed Lost' || props.task.isClosed
  return hasAssignee || (hasDue && !isClosed) || hasExpectedClose
})

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

function openRemoveTagConfirm(tagName) {
  tagToRemove.value = tagName
}

function closeRemoveTagConfirm() {
  tagToRemove.value = null
}

function handleRemoveTagConfirmOpenChange(open) {
  if (!open) tagToRemove.value = null
}

function confirmRemoveTag() {
  if (!props.task || !tagToRemove.value) return
  const current = (props.task.tags || []).map((t) =>
    typeof t === 'string' ? { name: t, color: null } : { name: t.name, color: t.color || null }
  )
  const updatedTags = current.filter((t) => t.name !== tagToRemove.value)
  emit('tag-updated', { taskId: props.task.id, taskType: props.task.type, tags: updatedTags })
  tagToRemove.value = null
}

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
