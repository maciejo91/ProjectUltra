<template>
  <div v-if="show" class="lg:hidden border-b border shrink-0 bg-brand-gray">
    <div class="px-4 py-3 flex items-center justify-between gap-3">
      <!-- Back Button -->
      <Button
        variant="ghost"
        size="icon"
        class="shrink-0"
        :aria-label="backLabel"
        @click="handleBack"
      >
        <ChevronLeft class="size-4 text-muted-foreground" />
      </Button>
      
      <!-- Optional Title Slot -->
      <div v-if="$slots.title" class="flex-1 flex items-center justify-center">
        <slot name="title" />
      </div>
      
      <!-- Optional Actions Slot -->
      <div v-if="$slots.actions" class="flex items-center gap-2">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ChevronLeft } from 'lucide-vue-next'
import { Button } from '@motork/component-library/future/primitives'
defineProps({
  show: {
    type: Boolean,
    required: true
  },
  backLabel: {
    type: String,
    default: 'Back'
  }
})

const emit = defineEmits(['back'])

const handleBack = () => {
  emit('back')
}
</script>

