<template>
    <DataTable
      v-if="enableRowSelection"
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
      :globalFilterOptions="{
        debounce: 300,
        show: true
      }"
      class="h-full"
    >
      <template #toolbar>
        <slot name="toolbar" />
      </template>

      <template #empty-state>
        <slot name="empty-state">
          <div class="empty-state">
            <Car class="empty-state-icon w-8 h-8 shrink-0" />
            <p class="empty-state-text">No vehicles found</p>
          </div>
        </slot>
      </template>
      <template #batch-action-bar>
        <div v-if="hasSelection" class="flex items-center gap-2">
          <div class="flex items-center gap-2 mr-1">
            <div
              class="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-blue-600 text-white text-sm font-medium"
            >
              {{ selectedCount }}
            </div>
            <span class="text-white text-fluid-sm font-medium whitespace-nowrap">Items selected</span>
          </div>
          <div class="h-4 w-px bg-greys-700"></div>
          <Button variant="ghost" size="sm" @click="handleBulkDelete">
            <Trash2 class="w-4 h-4 shrink-0 mr-2" />
            Delete
          </Button>
          <Button variant="ghost" size="sm" @click="clearSelection">
            <X class="w-4 h-4 shrink-0 mr-2" />
            Close
          </Button>
        </div>
      </template>
    </DataTable>

    <DataTable
      v-else
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
      :paginationOptions="{
        rowCount: rowCount ?? filteredVehicles.length
      }"
      :globalFilterOptions="{
        debounce: 300,
        show: true
      }"
      class="h-full"
    >
      <template #toolbar>
        <slot name="toolbar" />
      </template>

      <template #empty-state>
        <slot name="empty-state">
          <div class="empty-state">
            <Car class="empty-state-icon w-8 h-8 shrink-0" />
            <p class="empty-state-text">No vehicles found</p>
          </div>
        </slot>
      </template>
    </DataTable>
</template>

<script setup>
import { computed } from 'vue'
import { Car, Trash2, X } from 'lucide-vue-next'
import { DataTable } from '@motork/component-library/future/components'
import { Button } from '@motork/component-library/future/primitives'
import { useTableRowSelection } from '@/composables/useTableRowSelection'
import { useVehiclesStore } from '@/stores/vehicles'

const props = defineProps({
  enableRowSelection: {
    type: Boolean,
    default: true
  },
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

const emit = defineEmits([
  'row-click',
  'update:pagination',
  'update:globalFilter',
  'update:sorting',
  'update:columnFilters',
  'update:columnVisibility'
])

const vehiclesStore = useVehiclesStore()

const { rowSelection, selectedCount, hasSelection, getSelectedRows, clearSelection } = useTableRowSelection((row) =>
  String(row.id)
)

const handleBulkDelete = () => {
  const selectedRows = getSelectedRows(props.filteredVehicles)

  if (selectedRows.length === 0) return

  if (
    !confirm(
      `Are you sure you want to delete ${selectedRows.length} ${selectedRows.length === 1 ? 'vehicle' : 'vehicles'}?`
    )
  ) {
    return
  }

  selectedRows.forEach((row) => {
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
