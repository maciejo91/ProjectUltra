<template>
  <div v-if="task" :class="stacked ? 'flex flex-col gap-2' : 'flex items-center gap-2 flex-wrap'">
    <div v-if="!tagsOnly" class="flex items-center gap-2 flex-wrap min-w-0">
      <TaskBadges :task="task" :attempts-shown-elsewhere="stacked" class="shrink-0" />
      <slot name="after-badges" />
    </div>
    <div v-if="(stacked || tagsOnly) && !badgesOnly" class="flex items-center gap-2 flex-wrap">
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
        <span
          v-else
          class="tag-pill inline-flex items-center gap-1 pr-0.5 pl-1.5 py-0.5 rounded text-xs font-medium shrink-0 bg-primary/15 text-foreground"
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
      </template>
      <button
        type="button"
        @click.stop="showAddTagModal = true"
        class="text-xs text-muted-foreground hover:text-primary font-medium hover:underline transition-colors whitespace-nowrap shrink-0"
      >
        + tag
      </button>
    </div>
    <template v-else-if="!badgesOnly">
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
        <span
          v-else
          class="tag-pill inline-flex items-center gap-1 pr-0.5 pl-1.5 py-0.5 rounded text-xs font-medium shrink-0 bg-primary/15 text-foreground"
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
      </template>
      <button
        type="button"
        @click.stop="showAddTagModal = true"
        class="text-xs text-muted-foreground hover:text-primary font-medium hover:underline transition-colors whitespace-nowrap shrink-0"
      >
        + tag
      </button>
    </template>

    <AddTagModal
      :show="showAddTagModal"
      :existing-tags="existingTagNames"
      @close="showAddTagModal = false"
      @add="handleAddTag"
    />

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
              Remove "{{ tagToRemove }}" from this task? This cannot be undone.
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
  </div>
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
import { X } from 'lucide-vue-next'
import TaskBadges from './shared/TaskBadges.vue'
import AddTagModal from '@/components/modals/AddTagModal.vue'

const props = defineProps({
  task: {
    type: Object,
    default: null
  },
  /** When true, status/type badges and after-badges slot are on first line, tags on second line */
  stacked: {
    type: Boolean,
    default: false
  },
  /** When true, only render badges (and after-badges slot); no tags */
  badgesOnly: {
    type: Boolean,
    default: false
  },
  /** When true, only render tags row (add/remove); no badges */
  tagsOnly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['tag-updated'])

const showAddTagModal = ref(false)
const tagToRemove = ref(null)

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

const normalizedTags = computed(() => {
  const tags = props.task?.tags || []
  return tags.map((t) =>
    typeof t === 'string' ? { name: t, color: null } : { name: t.name, color: t.color || null }
  )
})

const existingTagNames = computed(() => normalizedTags.value.map((t) => t.name))

function handleAddTag(payload) {
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
