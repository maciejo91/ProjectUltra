<template>
  <div
    v-if="potentialDuplicates.length > 0"
    class="rounded-lg border border-primary/20 bg-primary/10 px-4 py-3"
  >
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div class="flex-1 min-w-0">
        <h3 class="text-sm font-semibold text-foreground">Duplicate customer detected</h3>
        <p class="mt-0.5 text-sm text-muted-foreground">
          The following {{ potentialDuplicates.length > 1 ? 'customers' : 'customer' }} may be duplicate{{ potentialDuplicates.length > 1 ? 's' : '' }}:
          <template v-for="(dup, i) in potentialDuplicates" :key="dup.id">
            <span v-if="i > 0">, </span>
            <button
              type="button"
              class="font-medium text-primary hover:underline align-baseline"
              @click="emit('customer-navigate', dup.id, dup.type)"
            >
              {{ getCustomerDisplay(dup) }}
            </button>
          </template>
          . Confirm merge to consolidate records and reassign requests.
        </p>
      </div>
      <div class="flex flex-wrap gap-2 justify-end shrink-0">
        <button
          v-for="dup in potentialDuplicates"
          :key="dup.id"
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

const emit = defineEmits(['merge', 'customer-navigate'])

function getCustomerDisplay(customer) {
  return customer?.name || `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim() || customer?.email || '—'
}
</script>
