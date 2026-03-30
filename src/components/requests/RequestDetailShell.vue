<template>
  <div class="flex flex-col flex-1 min-h-0 bg-[#F5F5F5]">
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
      @more-action="$emit('more-action', $event)"
    />

    <div
      v-if="request"
      class="flex flex-1 min-h-0 flex-col bg-[#F5F5F5]"
    >
      <slot />
    </div>

    <div v-else class="flex-1 flex items-center justify-center p-8 bg-[#F5F5F5]">
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
  'add-segment',
  'more-action'
])
</script>
