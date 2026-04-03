<template>
  <div
    class="rounded-lg flex flex-col bg-muted"
  >
    <div
      class="bg-white rounded-lg shadow-nsc-card overflow-hidden"
    >
      <div class="p-4">
        <div class="flex justify-between items-start mb-3">
          <div>
            <h4 class="font-bold text-foreground text-sm">{{ title }}</h4>
            <p class="text-sm text-muted-foreground mt-0.5">{{ description }}</p>
          </div>
          <slot name="badge" />
        </div>
        
        <div class="flex gap-3 flex-wrap">
          <slot name="actions" />
          <button
            v-if="showPostpone"
            @click="$emit('postpone')"
            class="bg-white border border-D1D5DB text-brand-dark font-medium px-4 py-2 rounded-btn text-sm flex items-center gap-2 transition-colors hover:bg-muted"
          >
            <Clock class="w-4 h-4 shrink-0" />
            <span>Postpone</span>
          </button>
        </div>
        
        <slot name="survey" />
        <slot name="content" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { Clock } from 'lucide-vue-next'

defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  colorScheme: {
    type: Object,
    required: false,
    default: () => ({ background: '', border: '' })
  },
  showPostpone: {
    type: Boolean,
    default: true
  }
})

defineEmits(['postpone'])
</script>



