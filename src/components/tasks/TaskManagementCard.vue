<template>
  <div>
    <component
      ref="widgetRef"
      :is="managementWidget"
      v-if="managementWidget"
      :lead="type === 'lead' ? task : undefined"
      :opportunity="type === 'opportunity' ? task : undefined"
      :activities="activities"
      v-bind="filteredAttrs"
      @postpone-expected-close="$emit('postpone-expected-close')"
      @reassigned="$emit('reassigned', $event)"
    />
  </div>
</template>

<script setup>
import { computed, ref, useAttrs } from 'vue'

const widgetRef = ref(null)

const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  type: {
    type: String,
    required: true,
    validator: (value) => ['lead', 'opportunity'].includes(value)
  },
  managementWidget: {
    type: Object,
    default: null
  },
  activities: {
    type: Array,
    default: () => []
  }
})

const attrs = useAttrs()

// Filter out 'lead' attribute when type is 'opportunity' to avoid warnings
const filteredAttrs = computed(() => {
  const filtered = { ...attrs }
  if (props.type === 'opportunity' && 'lead' in filtered) {
    delete filtered.lead
  }
  return filtered
})

// Expose postpone modals for TaskDetailHeader flow (opportunity: expected close; lead: due date)
defineExpose({
  openPostponeExpectedCloseModal() {
    widgetRef.value?.openPostponeExpectedCloseModal?.()
  },
  openPostponeDueDateModal() {
    widgetRef.value?.openPostponeDueDateModal?.()
  }
})

defineOptions({
  inheritAttrs: false
})
</script>

<style scoped>
/* No additional styles needed - wrapper component only */
</style>
