<template>
  <div class="overflow-hidden px-3 py-2 rounded-lg bg-background border border-border shadow-nsc-card">
    <TaskAssigneeDateBar
      v-if="request"
      :task="request"
      variant="inline"
      date-display="lastUpdated"
      class="pb-2 mb-2 border-b border-border shrink-0 min-w-0"
      @postpone-expected-close="$emit('postpone-expected-close')"
      @reassigned="$emit('reassigned', $event)"
    />
    <div class="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-xs">
      <span><span class="text-muted-foreground">Generic sales:</span> <span class="text-foreground">{{ genericSales || '—' }}</span></span>
      <span class="text-muted-foreground">·</span>
      <span><span class="text-muted-foreground">Source:</span> <span class="text-foreground">{{ source || '—' }}</span></span>
      <span class="text-muted-foreground">·</span>
      <span><span class="text-muted-foreground">Channel:</span> <span class="text-foreground">{{ channel || '—' }}</span></span>
      <span class="text-muted-foreground">·</span>
      <span><span class="text-muted-foreground">Fiscal entity:</span> <span class="text-foreground">{{ fiscalEntity || '—' }}</span></span>
      <span class="text-muted-foreground">·</span>
      <span><span class="text-muted-foreground">Dealership:</span> <span class="text-foreground">{{ dealership || '—' }}</span></span>
      <span class="text-muted-foreground">·</span>
      <span><span class="text-muted-foreground">{{ createdOrImportedLabel }}:</span> <span class="text-foreground">{{ createdOrImportedValue || '—' }}</span></span>
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
