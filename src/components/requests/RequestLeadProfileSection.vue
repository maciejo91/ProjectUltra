<template>
  <TaskContactCard
    v-if="request"
    :task="taskForCard"
    :task-type="request.type"
    :customer-id="request.customerId || request.customer?.id"
    :show-quick-actions="showQuickActions"
    :related-leads="relatedLeads"
    :related-opportunities="relatedOpportunities"
    :related-requests-loading="relatedRequestsLoading"
    :exclude-request-id="request.id"
    :exclude-request-type="request.type"
    :embedded-in-card="embeddedInCard"
    @quick-action="emit('quick-action', $event)"
    @add-tag="emit('add-tag')"
    @edit-customer-tag="emit('edit-customer-tag', $event)"
    @delete-customer-tag="emit('delete-customer-tag', $event)"
  />
</template>

<script setup>
import { computed } from 'vue'
import TaskContactCard from '@/components/tasks/TaskContactCard.vue'

const props = defineProps({
  request: {
    type: Object,
    default: null
  },
  showQuickActions: {
    type: Boolean,
    default: true
  },
  relatedLeads: {
    type: Array,
    default: () => []
  },
  relatedOpportunities: {
    type: Array,
    default: () => []
  },
  relatedRequestsLoading: {
    type: Boolean,
    default: false
  },
  embeddedInCard: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['quick-action', 'add-tag', 'edit-customer-tag', 'delete-customer-tag'])

const taskForCard = computed(() => {
  const r = props.request
  if (!r?.customer) return r
  const loc = r.requestedCar?.dealership || r.vehicle?.dealership
  const name = r.customer.name || ''
  const suffix = loc ? ` (${loc})` : ''
  if (!loc || !name) return r
  return {
    ...r,
    customer: {
      ...r.customer,
      name: `${name}${suffix}`
    }
  }
})

</script>
