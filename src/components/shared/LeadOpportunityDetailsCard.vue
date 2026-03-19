<template>
  <div class="@container overflow-hidden px-3 py-2 rounded-lg bg-background border border-border shadow-nsc-card">
    <TaskAssigneeDateBar
      v-if="request && showAssigneeBar"
      :task="request"
      variant="inline"
      date-display="lastUpdated"
      class="pb-2 mb-2 border-b border-border shrink-0 min-w-0"
      @postpone-expected-close="$emit('postpone-expected-close')"
      @reassigned="$emit('reassigned', $event)"
    />
    <div class="grid grid-cols-2 @[20rem]:grid-cols-3 @[28rem]:grid-cols-4 @[36rem]:grid-cols-5 @[44rem]:grid-cols-6 gap-x-4 @[20rem]:gap-x-2 gap-y-1.5 text-xs">
      <div><span class="font-semibold text-muted-foreground">Generic sales:</span> <span class="text-foreground">{{ genericSales || '—' }}</span></div>
      <div><span class="font-semibold text-muted-foreground">Source:</span> <span class="text-foreground">{{ source || '—' }}</span></div>
      <div><span class="font-semibold text-muted-foreground">Channel:</span> <span class="text-foreground">{{ channel || '—' }}</span></div>
      <div><span class="font-semibold text-muted-foreground">Fiscal entity:</span> <span class="text-foreground">{{ fiscalEntity || '—' }}</span></div>
      <div><span class="font-semibold text-muted-foreground">Dealership:</span> <span class="text-foreground">{{ dealership || '—' }}</span></div>
      <div><span class="font-semibold text-muted-foreground">{{ createdOrImportedLabel }}:</span> <span class="text-foreground">{{ createdOrImportedValue || '—' }}</span></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatDate } from '@/utils/formatters'
import TaskAssigneeDateBar from '@/components/tasks/TaskAssigneeDateBar.vue'

defineEmits(['postpone-expected-close', 'reassigned'])

const props = defineProps({
  /** Request or task (lead/opportunity) */
  request: {
    type: Object,
    default: null
  },
  /** When false, only the details line is shown (e.g. in task detail Request tab) */
  showAssigneeBar: {
    type: Boolean,
    default: true
  }
})

const genericSales = computed(() => {
  const r = props.request
  return r?.requestType ?? r?.genericSales ?? null
})

const source = computed(() => props.request?.source ?? null)

const channel = computed(() => props.request?.channel ?? null)

const fiscalEntity = computed(() => props.request?.fiscalEntity ?? null)

const dealership = computed(() => {
  const r = props.request
  return r?.dealership ?? r?.requestedCar?.dealership ?? r?.vehicle?.dealership ?? null
})

const createdOrImportedLabel = computed(() => {
  const r = props.request
  if (r?.importedAt) return 'Imported date'
  return 'Created date'
})

const createdOrImportedValue = computed(() => {
  const r = props.request
  const date = r?.importedAt ?? r?.createdAt
  return date ? formatDate(date) : ''
})
</script>
