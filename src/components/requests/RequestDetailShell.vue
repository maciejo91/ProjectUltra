<template>
  <div class="flex flex-col flex-1 min-h-0 overflow-hidden bg-background">
    <RequestDetailHeader
      :request="request"
      :filtered-requests="filteredRequests"
      :is-full-page="isFullPage"
      @close="$emit('close')"
      @previous="$emit('previous')"
      @next="$emit('next')"
      @open-close="$emit('open-close')"
      @open-convert="$emit('open-convert')"
      @reopen-lead="$emit('reopen-lead')"
      @reopen-opportunity="$emit('reopen-opportunity')"
      @postpone-expected-close="$emit('postpone-expected-close')"
      @reassigned="$emit('reassigned', $event)"
    />

    <div v-if="request" class="flex-1 min-h-0 overflow-y-auto">
      <div class="p-4 space-y-6">
        <!-- Row: Requested Vehicle (2/3, same as Suggested action column) + Customer Card (1/3, same as Activity/Other requests column) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch min-h-0 [&>*]:min-h-0">
          <RequestedVehicleHero
            :request="request"
            class="min-h-0 lg:col-span-2"
            @add-tradein="$emit('add-tradein')"
            @add-financing="$emit('add-financing')"
          />
          <RequestCustomerInfo :request="request" class="min-h-0 lg:col-span-1" />
        </div>

        <slot />
      </div>
    </div>

    <div v-else class="flex-1 flex items-center justify-center p-8">
      <p class="text-muted-foreground">No request selected</p>
    </div>
  </div>
</template>

<script setup>
import RequestDetailHeader from './RequestDetailHeader.vue'
import RequestedVehicleHero from './RequestedVehicleHero.vue'
import RequestCustomerInfo from './RequestCustomerInfo.vue'

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
  'open-close',
  'open-convert',
  'reopen-lead',
  'reopen-opportunity',
  'postpone-expected-close',
  'reassigned',
  'add-tradein',
  'add-financing'
])
</script>
