<template>
  <div v-if="task" :class="stacked && !badgesOnly && !tagsOnly ? 'flex flex-col gap-2' : 'flex items-center gap-2 flex-wrap'">
    <div v-if="!tagsOnly" class="flex items-center gap-2 flex-wrap min-w-0 w-full">
      <TaskBadges :task="task" :attempts-shown-elsewhere="stacked" class="shrink-0" />
      <slot name="after-badges" />
    </div>
    <div v-if="(stacked || tagsOnly) && !badgesOnly" class="flex items-center gap-2 flex-wrap">
      <template v-for="tag in normalizedTags" :key="tag.name">
        <TagPillWithPopover
          :tag="tag"
          @edit="openEditTag(tag)"
          @delete="handleDeleteTag(tag)"
        >
          <template #trigger>
            <button
              v-if="tag.color"
              type="button"
              class="tag-pill inline-flex max-w-full min-w-0 cursor-pointer items-center gap-1 rounded border-0 py-0.5 pl-1.5 pr-0.5 text-sm font-medium shrink-0"
              :class="isLightColor(tag.color) ? 'text-foreground' : 'text-white'"
              :style="{ backgroundColor: tag.color }"
            >
              <span class="min-w-0 truncate">{{ tag.name }}</span>
            </button>
            <button
              v-else
              type="button"
              class="tag-pill inline-flex cursor-pointer items-center gap-1 rounded border-0 bg-primary/15 py-0.5 pl-1.5 pr-0.5 text-sm font-medium text-foreground shrink-0"
            >
              <span class="min-w-0 truncate">{{ tag.name }}</span>
            </button>
          </template>
        </TagPillWithPopover>
      </template>
      <button
        type="button"
        @click.stop="openAddTag"
        class="text-sm text-muted-foreground hover:text-primary font-medium hover:underline transition-colors whitespace-nowrap shrink-0"
      >
        + tag
      </button>
    </div>
    <template v-else-if="!badgesOnly">
      <template v-for="tag in normalizedTags" :key="tag.name">
        <TagPillWithPopover
          :tag="tag"
          @edit="openEditTag(tag)"
          @delete="handleDeleteTag(tag)"
        >
          <template #trigger>
            <button
              v-if="tag.color"
              type="button"
              class="tag-pill inline-flex max-w-full min-w-0 cursor-pointer items-center gap-1 rounded border-0 py-0.5 pl-1.5 pr-0.5 text-sm font-medium shrink-0"
              :class="isLightColor(tag.color) ? 'text-foreground' : 'text-white'"
              :style="{ backgroundColor: tag.color }"
            >
              <span class="min-w-0 truncate">{{ tag.name }}</span>
            </button>
            <button
              v-else
              type="button"
              class="tag-pill inline-flex cursor-pointer items-center gap-1 rounded border-0 bg-primary/15 py-0.5 pl-1.5 pr-0.5 text-sm font-medium text-foreground shrink-0"
            >
              <span class="min-w-0 truncate">{{ tag.name }}</span>
            </button>
          </template>
        </TagPillWithPopover>
      </template>
      <button
        type="button"
        @click.stop="openAddTag"
        class="text-sm text-muted-foreground hover:text-primary font-medium hover:underline transition-colors whitespace-nowrap shrink-0"
      >
        + tag
      </button>
    </template>

    <AddTagModal
      :show="showAddTagModal"
      :existing-tags="existingTagNames"
      :edit-tag="tagBeingEdited"
      @close="closeAddTagModal"
      @add="handleAddTag"
      @update="handleUpdateTag"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import TaskBadges from './shared/TaskBadges.vue'
import AddTagModal from '@/components/modals/AddTagModal.vue'
import TagPillWithPopover from '@/components/shared/TagPillWithPopover.vue'

const props = defineProps({
  task: {
    type: Object,
    default: null
  },
  stacked: {
    type: Boolean,
    default: false
  },
  badgesOnly: {
    type: Boolean,
    default: false
  },
  tagsOnly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['tag-updated'])

const showAddTagModal = ref(false)
const tagBeingEdited = ref(null)

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

function openAddTag() {
  tagBeingEdited.value = null
  showAddTagModal.value = true
}

function openEditTag(tag) {
  tagBeingEdited.value = { name: tag.name, color: tag.color }
  showAddTagModal.value = true
}

function closeAddTagModal() {
  showAddTagModal.value = false
  tagBeingEdited.value = null
}

function handleAddTag(payload) {
  if (!props.task) return
  const name = typeof payload === 'string' ? payload : payload.name
  const color = typeof payload === 'object' && payload?.color ? payload.color : null
  const current = (props.task.tags || []).map((t) =>
    typeof t === 'string' ? { name: t, color: null } : { name: t.name, color: t.color || null }
  )
  if (current.some((t) => t.name === name)) {
    closeAddTagModal()
    return
  }
  const updatedTags = [...current, { name, color }]
  emit('tag-updated', { taskId: props.task.id, taskType: props.task.type, tags: updatedTags })
  closeAddTagModal()
}

function handleUpdateTag(payload) {
  if (!props.task) return
  const { previousName, name, color } = payload
  const current = (props.task.tags || []).map((t) =>
    typeof t === 'string' ? { name: t, color: null } : { name: t.name, color: t.color || null }
  )
  const idx = current.findIndex((t) => t.name === previousName)
  if (idx === -1) {
    closeAddTagModal()
    return
  }
  if (name !== previousName && current.some((t) => t.name === name)) {
    return
  }
  const updatedTags = current.map((t) =>
    t.name === previousName ? { name, color: color || null } : t
  )
  emit('tag-updated', { taskId: props.task.id, taskType: props.task.type, tags: updatedTags })
  closeAddTagModal()
}

function handleDeleteTag(tag) {
  if (!props.task) return
  const current = (props.task.tags || []).map((t) =>
    typeof t === 'string' ? { name: t, color: null } : { name: t.name, color: t.color || null }
  )
  const updatedTags = current.filter((t) => t.name !== tag.name)
  emit('tag-updated', { taskId: props.task.id, taskType: props.task.type, tags: updatedTags })
}
</script>
