<template>
  <div
    v-if="potentialDuplicates.length > 0"
    class="rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 shadow-mk-dashboard-card"
  >
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div class="flex-1 min-w-0">
        <h3 class="text-sm font-semibold text-foreground">Duplicate detected</h3>
        <p class="mt-0.5 text-xs text-muted-foreground">
          The following {{ potentialDuplicates.length > 1 ? 'requests' : 'request' }} may be duplicate{{ potentialDuplicates.length > 1 ? 's' : '' }}:
          <template v-for="(dup, i) in potentialDuplicates" :key="dup.compositeId">
            <span v-if="i > 0">, </span>
            <button
              type="button"
              class="font-medium text-primary hover:underline align-baseline"
              @click="emit('request-navigate', dup.compositeId)"
            >
              {{ getVehicleDisplay(dup) }} – {{ dup.displayStage || dup.stage || '—' }}
            </button>
          </template>
          . Confirm merge to close the duplicate and merge its activities.
        </p>
      </div>
      <div class="flex flex-wrap gap-2 justify-end shrink-0">
        <button
          v-for="dup in potentialDuplicates"
          :key="dup.compositeId"
          type="button"
          class="inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none shrink-0"
          :disabled="mergeLoading"
          @click="emit('merge', dup)"
        >
          Confirm merge
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  potentialDuplicates: {
    type: Array,
    default: () => []
  },
  mergeLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['merge', 'request-navigate'])

function getVehicleDisplay(task) {
  const vehicle = task.requestedCar || task.vehicle
  if (!vehicle) return 'No vehicle'
  const brand = vehicle.brand || ''
  const model = vehicle.model || ''
  const year = vehicle.year ? ` (${vehicle.year})` : ''
  return `${brand} ${model}${year}`.trim() || '—'
}
</script>
