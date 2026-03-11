<template>
  <div
    v-if="show && message"
    class="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm mb-4"
  >
    <AlertCircle class="w-4 h-4 shrink-0 text-amber-600" />
    <span>{{ message }}</span>
  </div>
</template>

<script setup>
import { AlertCircle } from 'lucide-vue-next'

defineProps({
  show: {
    type: Boolean,
    default: true
  },
  message: {
    type: String,
    default: ''
  }
})
</script>
