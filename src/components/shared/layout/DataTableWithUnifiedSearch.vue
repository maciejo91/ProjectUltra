<template>
  <div
    class="datatable-unified-shell"
    :class="[includeMarginBottom ? 'mb-8' : '', transparentShell ? '' : 'bg-background']"
  >
    <slot name="before-search" />
    <div class="mb-1">
      <UnifiedSearchBar
        :active-tab="activeTab"
        :placeholder="placeholder"
        :global-filter="globalFilter"
        :pagination="pagination"
        :assignee-options="assigneeOptions"
        :volvo-model-options="volvoModelOptions"
        :brand-options="brandOptions"
        :request-type-options="requestTypeOptions"
        :status-options="statusOptions"
        :source-options="sourceOptions"
        :priority-options="priorityOptions"
        :type-options="typeOptions"
        :requested-car-brand-options="requestedCarBrandOptions"
        :account-type-options="accountTypeOptions"
        @update:global-filter="emit('update:globalFilter', $event)"
        @update:column-filters="emit('update:columnFilters', $event)"
        @update:pagination="emit('update:pagination', $event)"
      />
    </div>
    <div
      ref="tableScrollContainer"
      class="data-table-inner table-search-wrapper"
      @click="emit('wrapperClick', $event)"
    >
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import UnifiedSearchBar from '@/components/shared/UnifiedSearchBar.vue'

defineProps({
  activeTab: { type: String, default: 'opportunities' },
  placeholder: { type: String, default: '' },
  pagination: { type: Object, default: () => ({ pageIndex: 0, pageSize: 10 }) },
  assigneeOptions: { type: Array, default: () => [] },
  volvoModelOptions: { type: Array, default: () => [] },
  brandOptions: { type: Array, default: () => [] },
  requestTypeOptions: { type: Array, default: () => [] },
  statusOptions: { type: Array, default: () => [] },
  sourceOptions: { type: Array, default: () => [] },
  priorityOptions: { type: Array, default: () => [] },
  typeOptions: { type: Array, default: () => [] },
  requestedCarBrandOptions: { type: Array, default: () => [] },
  accountTypeOptions: { type: Array, default: () => [] },
  includeMarginBottom: { type: Boolean, default: true },
  /** When true, no surface on the shell (e.g. dialog on `bg-muted`). */
  transparentShell: { type: Boolean, default: false },
  /** Pass through to UnifiedSearchBar so the query input matches parent state. */
  globalFilter: { type: String, default: undefined },
})

const emit = defineEmits(['update:globalFilter', 'update:columnFilters', 'update:pagination', 'wrapperClick'])

const tableScrollContainer = ref(null)
defineExpose({ tableScrollContainer })
</script>

<style scoped>
:deep([data-radix-avatar-fallback]),
:deep(.avatar-fallback),
:deep(span[class*='AvatarFallback']) {
  background-color: #d4d4d4 !important;
}

:deep(tbody tr) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
}

:deep(tbody tr:last-child) {
  border-bottom: none !important;
}

.data-table-inner.table-search-wrapper :deep([data-slot='table-search']),
.data-table-inner.table-search-wrapper :deep(div:has(> input[placeholder*='Search'])),
.data-table-inner.table-search-wrapper :deep(div:has(> input[type='search'])) {
  display: none !important;
}

:deep([data-slot='table-container']),
:deep(.table-wrapper) {
  border: none !important;
}

:deep(footer select),
:deep(footer button[role='combobox']) {
  background-color: transparent !important;
  border: none !important;
}

/*
 * Motork DataTable filter strip (no data-slot="table-filter" in current library):
 * data-table.vue uses div.bg-muted.flex.flex-wrap.items-center.justify-between.gap-2.rounded-lg.p-1
 */
.data-table-inner.table-search-wrapper
  :deep(div.bg-muted.flex.flex-wrap.items-center.justify-between.gap-2.rounded-lg.p-1) {
  align-items: center;
}

.data-table-inner.table-search-wrapper
  :deep(
    div.bg-muted.flex.flex-wrap.items-center.justify-between.gap-2.rounded-lg.p-1
      > div.flex.flex-wrap.items-center.gap-2:first-child
      > div.flex.flex-wrap.gap-2
  ) {
  align-items: center;
}

/*
 * Filter chip: zero flex gap, 1px overlap between wrappers (removes hairline seams), no wrapper chrome.
 * Scoped to this strip only so other ButtonGroups stay unchanged.
 */
.data-table-inner.table-search-wrapper
  :deep(
    div.bg-muted.flex.flex-wrap.items-center.justify-between.gap-2.rounded-lg.p-1
      [data-slot='button-group'][data-orientation='horizontal']
  ) {
  isolation: isolate;
  filter: drop-shadow(0 1px 2px rgb(0 0 0 / 0.06));
  gap: 0 !important;
  column-gap: 0 !important;
  row-gap: 0 !important;
}

.data-table-inner.table-search-wrapper
  :deep(
    div.bg-muted.flex.flex-wrap.items-center.justify-between.gap-2.rounded-lg.p-1
      [data-slot='button-group'][data-orientation='horizontal'] > *:not(:first-child)
  ) {
  margin-top: 0 !important;
  margin-right: 0 !important;
  margin-bottom: 0 !important;
  margin-left: -1px !important;
  padding: 0 !important;
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  display: flex !important;
  align-items: stretch !important;
}

:deep([data-slot='table-container']) {
  overflow-x: auto !important;
  overflow-y: auto !important;
  max-height: 600px !important;
}

:deep(table) {
  min-width: 100% !important;
}
</style>
