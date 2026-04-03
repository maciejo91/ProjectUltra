<template>
  <div class="flex min-h-0 flex-1 flex-col overflow-hidden bg-muted">
    <RequestDetailHeader
      :request="request"
      :filtered-requests="filteredRequests"
      :is-full-page="isFullPage"
      @close="$emit('close')"
      @previous="$emit('previous')"
      @next="$emit('next')"
      @update-status="$emit('update-status', $event)"
      @postpone-expected-close="$emit('postpone-expected-close')"
      @reassigned="$emit('reassigned', $event)"
      @add-segment="$emit('add-segment')"
    />

    <div
      v-if="request"
      class="flex min-h-0 flex-1 flex-col overflow-hidden bg-muted"
    >
      <slot />
    </div>

    <div v-else class="flex flex-1 items-center justify-center bg-muted p-8">
      <p class="text-muted-foreground">No request selected</p>
    </div>
  </div>
</template>

<script setup>
import RequestDetailHeader from './RequestDetailHeader.vue'

defineProps({
  request: {
    type: Object,
    default: null
  },
  filteredRequests: {
    type: Array,
    default: () => []
  },
  isFullPage: {
    type: Boolean,
    default: false
  }
})

defineEmits([
  'close',
  'previous',
  'next',
  'update-status',
  'postpone-expected-close',
  'reassigned',
  'add-segment'
])
</script>
