<template>
  <div
    v-if="task"
    class="rounded-lg flex flex-col bg-muted"
    :class="containerClass"
  >
    <!-- Title Section -->
    <div v-if="!hideTitle" class="px-4 py-4 flex items-center justify-between shrink-0">
      <div class="flex items-center gap-2">
        <ClipboardCheck class="w-4 h-4 shrink-0 text-foreground" />
        <h2 class="text-sm font-medium text-foreground leading-5">Manage next steps</h2>
      </div>
    </div>

    <!-- Content: no inner white card so action cards are not rendered inside a card -->
    <div class="flex flex-col pt-2 px-2 pb-2">
      <slot name="deadline-banner" />
      <div class="space-y-6">
        <slot name="primary-action" />
        <slot name="task-widgets" />
        <slot name="closed-state" />
        <slot name="secondary-actions" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ClipboardCheck } from 'lucide-vue-next'

defineProps({
  task: {
    type: Object,
    required: true
  },
  containerClass: {
    type: String,
    default: ''
  },
  hideTitle: {
    type: Boolean,
    default: false
  },
  hideBorder: {
    type: Boolean,
    default: false
  }
})
</script>



