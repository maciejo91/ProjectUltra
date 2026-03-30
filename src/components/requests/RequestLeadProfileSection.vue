<template>
  <TaskContactCard
    v-if="request"
    :task="taskForCard"
    :task-type="request.type"
    :customer-id="request.customerId || request.customer?.id"
    :show-quick-actions="showQuickActions"
    @quick-action="emit('quick-action', $event)"
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
  }
})

const emit = defineEmits(['quick-action'])

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
