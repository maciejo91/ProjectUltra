<template>
  <div class="data-table-inner table-search-wrapper">
  <DataTable 
    :data="filteredVehicles" 
    :columns="columns"
    :loading="loading"
    :meta="tableMeta"
    @row-click="$emit('row-click', $event)"
    :columnFiltersOptions="{
      filterDefs: filterDefinitions
    }"
    v-model:pagination="paginationModel"
    v-model:globalFilter="globalFilterModel"
    v-model:sorting="sortingModel"
    v-model:columnFilters="columnFiltersModel"
    v-model:columnVisibility="columnVisibilityModel"
    v-model:rowSelection="rowSelection"
    :paginationOptions="{
      rowCount: rowCount ?? filteredVehicles.length
    }"
    :globalFilterOptions="{ debounce: 300 }"
    class="h-full"
  >
    <!-- Toolbar slot for action buttons -->
    <template #toolbar>
      <slot name="toolbar" />
    </template>
    
    <template #empty-state>
      <div class="empty-state">
        <Car class="empty-state-icon w-8 h-8 shrink-0" />
        <p class="empty-state-text">No vehicles found</p>
      </div>
    </template>
    <template #batch-action-bar>
      <div v-if="hasSelection" class="flex items-center gap-2">
        <div class="flex items-center gap-2 mr-1">
          <div class="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-blue-600 text-white text-xs font-medium">
            {{ selectedCount }}
          </div>
          <span class="text-white text-fluid-sm font-medium whitespace-nowrap">Items selected</span>
        </div>
        <div class="h-4 w-px bg-greys-700"></div>
        <Button
          variant="ghost"
          size="sm"
          @click="handleBulkDelete"
        >
          <Trash2 class="w-4 h-4 shrink-0 mr-2" />
          Delete
        </Button>
        <Button
          variant="ghost"
          size="sm"
          @click="clearSelection"
        >
          <X class="w-4 h-4 shrink-0 mr-2" />
          Close
        </Button>
      </div>
    </template>
  </DataTable>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Car, Trash2, X } from 'lucide-vue-next'
import { DataTable } from '@motork/component-library/future/components'
import { Button } from '@motork/component-library/future/primitives'
import { useTableRowSelection } from '@/composables/useTableRowSelection'
import { useVehiclesStore } from '@/stores/vehicles'

const props = defineProps({
  filteredVehicles: {
    type: Array,
    required: true
  },
  columns: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  tableMeta: {
    type: Object,
    required: true
  },
  filterDefinitions: {
    type: Array,
    required: true
  },
  pagination: {
    type: Object,
    required: true
  },
  globalFilter: {
    type: String,
    required: true
  },
  sorting: {
    type: Array,
    required: true
  },
  columnFilters: {
    type: Array,
    required: true
  },
  columnVisibility: {
    type: Object,
    default: () => ({})
  },
  rowCount: {
    type: Number,
    default: undefined
  }
})

const emit = defineEmits(['row-click', 'update:pagination', 'update:globalFilter', 'update:sorting', 'update:columnFilters', 'update:columnVisibility'])

const vehiclesStore = useVehiclesStore()

// Row selection - Motork automatically adds the checkbox column when v-model:rowSelection is bound
const { rowSelection, selectedCount, hasSelection, getSelectedRows, clearSelection } = useTableRowSelection((row) => String(row.id))

// Bulk delete handler
const handleBulkDelete = () => {
  const selectedRows = getSelectedRows(props.filteredVehicles)
  
  if (selectedRows.length === 0) return
  
  if (!confirm(`Are you sure you want to delete ${selectedRows.length} ${selectedRows.length === 1 ? 'vehicle' : 'vehicles'}?`)) {
    return
  }
  
  selectedRows.forEach(row => {
    vehiclesStore.deleteVehicle(row.id)
  })
  
  clearSelection()
}

const paginationModel = computed({
  get: () => props.pagination,
  set: (value) => emit('update:pagination', value)
})

const globalFilterModel = computed({
  get: () => props.globalFilter,
  set: (value) => emit('update:globalFilter', value)
})

const sortingModel = computed({
  get: () => props.sorting,
  set: (value) => emit('update:sorting', value)
})

const columnFiltersModel = computed({
  get: () => props.columnFilters,
  set: (value) => emit('update:columnFilters', value)
})

const columnVisibilityModel = computed({
  get: () => props.columnVisibility,
  set: (value) => emit('update:columnVisibility', value)
})
</script>

<style scoped>
/* DataTable styling overrides to match reference design */
:deep(thead),
:deep(thead th),
:deep(thead tr),
:deep(thead tr th) {
  background-color: transparent !important;
  background: transparent !important;
  border-color: rgba(0, 0, 0, 0.05) !important;
}

:deep(div[data-slot='frame-panel'].relative.bg-clip-padding) {
  border-top-left-radius: 10px !important;
  border-top-right-radius: 10px !important;
}

:deep(footer.flex.items-center.justify-between) {
  border-bottom-left-radius: 10px !important;
  border-bottom-right-radius: 10px !important;
}

:deep([data-radix-avatar-fallback]),
:deep(.avatar-fallback),
:deep(span[class*='AvatarFallback']) {
  background-color: #d4d4d4 !important;
}

/* Table border overrides - make borders very subtle */
:deep(table),
:deep(tbody),
:deep(tbody tr),
:deep(tbody td),
:deep(thead),
:deep(thead th) {
  border-color: rgba(0, 0, 0, 0.05) !important;
}

:deep(tbody tr) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
}

:deep(tbody tr:last-child) {
  border-bottom: none !important;
}

/* Remove any dark borders from table container */
:deep([data-slot="table-container"]),
:deep(.table-wrapper) {
  border: none !important;
}

/* Pagination dropdown - transparent in footer */
:deep(footer select),
:deep(footer button[role="combobox"]) {
  background-color: transparent !important;
  border: none !important;
}

/* Hide built-in DataTable search row only (UnifiedSearchBar is above) – scope to this wrapper */
.data-table-inner.table-search-wrapper :deep([data-slot="table-search"]),
.data-table-inner.table-search-wrapper :deep(div:has(> input[placeholder*="Search"])),
.data-table-inner.table-search-wrapper :deep(div:has(> input[type="search"])) {
  display: none !important;
}

/* Filter button - white background like reference */
:deep(button[aria-label*="filter"]),
:deep(button[aria-label*="Filter"]),
:deep([data-slot="table-filter"] button) {
  background-color: white !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
}

/* Enable horizontal and vertical scrolling */
:deep([data-slot="table-container"]) {
  overflow-x: auto !important;
  overflow-y: auto !important;
  max-height: 600px !important;
}

:deep(table) {
  min-width: 100% !important;
}
</style>

