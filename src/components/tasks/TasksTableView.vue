<template>
  <div class="page-container flex-1 flex flex-col overflow-hidden min-w-0">
    <!-- Header: Title + View Toggle + Show Closed -->
    <header class="page-header shrink-0">
      <div class="page-header-main">
        <div class="page-header-content">
          <div class="page-header-title-container">
            <h1 class="page-header-title">Tasks</h1>
          </div>
          
          <!-- Right Actions: View Toggle + Show Closed -->
          <div class="page-header-actions">
            <!-- View Toggle: Cards (left) → Table (right); highlighted = current view -->
            <div class="bg-white p-0.5 rounded-btn inline-flex gap-0.5">
              <Button
                variant="secondary"
                size="icon"
                @click="$emit('view-change', 'card')"
                :class="[
                  'h-7 w-7',
                  viewMode === 'card'
                    ? 'bg-brand-gray text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                ]"
                title="Card View"
                :aria-pressed="viewMode === 'card'"
              >
                <LayoutGrid :size="14" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                @click="$emit('view-change', 'table')"
                :class="[
                  'h-7 w-7',
                  viewMode === 'table'
                    ? 'bg-brand-gray text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                ]"
                title="Table View"
                :aria-pressed="viewMode === 'table'"
              >
                <Table :size="14" />
              </Button>
            </div>
            
            <!-- Show Closed Toggle -->
            <button
              @click="$emit('toggle-closed', !showClosed)"
              class="group flex items-center gap-2 rounded-xl border border-border px-3 py-1.5 bg-surface text-sm font-medium text-muted-foreground hover:border-red-100 hover:bg-red-50 hover:text-brand-red transition-all"
            >
              <EyeOff class="w-4 h-4 shrink-0 text-muted-foreground group-hover:text-brand-red" />
              <span class="hidden sm:inline">Show Closed</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Search bar with AI mode: above filter bar and table -->
    <div class="shrink-0 px-4 md:px-8 pt-4 pb-1 bg-white">
      <UnifiedSearchBar
        active-tab="opportunities"
        placeholder="Search tasks..."
        :pagination="pagination"
        :assignee-options="assigneeOptions"
        :request-type-options="requestTypeOptions"
        :status-options="tasksStatusOptions"
        :source-options="tasksSourceOptions"
        @update:global-filter="globalFilter = $event"
        @update:column-filters="columnFilters = $event"
        @update:pagination="pagination = $event"
      />
    </div>

    <!-- Table: scrollable area (hide built-in search row inside this wrapper only) -->
    <div class="flex-1 overflow-y-auto px-4 md:px-8 pb-4 md:pb-8 bg-white min-h-0 data-table-inner table-search-wrapper">
      <DataTable 
            :data="paginatedData" 
            :columns="columns"
            :meta="tableMeta"
            @row-click="handleRowClick"
            :columnFiltersOptions="{
              filterDefs: filterDefinitions
            }"
            v-model:pagination="pagination"
            v-model:globalFilter="globalFilter"
            v-model:sorting="sorting"
            v-model:columnFilters="columnFilters"
            v-model:columnVisibility="columnVisibility"
            v-model:rowSelection="rowSelection"
            :paginationOptions="{
              rowCount: totalFilteredCount
            }"
            :globalFilterOptions="{
              debounce: 300,
              placeholder: 'Q Search or ask a question',
              show: true
            }"
            class="h-full"
          >
            <template #empty-state>
              <div class="empty-state">
                <ListTodo class="empty-state-icon w-8 h-8 shrink-0" />
                <p class="empty-state-text">No tasks found</p>
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
  </div>
</template>

<script setup>
import { ref, computed, h } from 'vue'
import { Table, LayoutGrid, Flame, Sun, CheckCircle, Circle, EyeOff, ListTodo, Trash2, X } from 'lucide-vue-next'
import { DataTable } from '@motork/component-library/future/components'
import { Button } from '@motork/component-library/future/primitives'
import UnifiedSearchBar from '@/components/shared/UnifiedSearchBar.vue'
import { formatCurrency, formatDeadlineFull, formatDate, getDeadlineStatus } from '@/utils/formatters'
import { calculateLeadUrgency, getUrgencyIcon, getUrgencyColorClass } from '@/composables/useLeadUrgency'
import { useSettingsStore } from '@/stores/settings'
import { useTasksTableFilters } from '@/composables/useTasksTableFilters'
import { useTableRowSelection } from '@/composables/useTableRowSelection'
import { useDataTableData, getNestedProperty } from '@/composables/useDataTableData'
import { useLeadsStore } from '@/stores/leads'
import { useOpportunitiesStore } from '@/stores/opportunities'

const props = defineProps({
  tasks: { type: Array, required: true },
  currentTaskId: { type: String, default: null },
  highlightId: { type: String, default: null },
  showClosed: { type: Boolean, default: false },
  showMobileClose: { type: Boolean, default: false },
  searchPlaceholder: { type: String, default: 'Search tasks...' },
  viewMode: { type: String, default: 'table' },
  getVehicleType: { type: Function, required: true },
  getVehicleTypeBadgeClass: { type: Function, required: true },
  getOwnerInfo: { type: Function, required: true },
  getStageBadgeClass: { type: Function, required: true }
})

const emit = defineEmits(['select', 'toggle-closed', 'reassign', 'close', 'view-change'])

const settingsStore = useSettingsStore()
const leadsStore = useLeadsStore()
const opportunitiesStore = useOpportunitiesStore()
const searchQuery = ref('')

// Row selection
const { rowSelection, selectedCount, hasSelection, getSelectedRows, clearSelection } = useTableRowSelection((row) => row.compositeId)

// DataTable state management
const pagination = ref({
  pageIndex: 0,
  pageSize: 10
})

const globalFilter = ref('')
const sorting = ref([])
const columnFilters = ref([])
const columnVisibility = ref({})

// Table has its own filters (column filters); TaskFilters button/chips apply to card view only.
const { filterDefinitions } = useTasksTableFilters({
  typeFilter: computed(() => 'all'),
  showTypeFilter: computed(() => true),
  tasks: computed(() => props.tasks)
})

const assigneeOptions = computed(() => {
  const names = [...new Set(props.tasks.map(t => t.assignee).filter(Boolean))]
  return names.map(name => ({ value: name, label: name }))
})
const requestTypeOptions = [
  { value: 'Test Drive', label: 'Test Drive' },
  { value: 'Quotation', label: 'Quotation' },
  { value: 'Generic sales', label: 'Generic sales' }
]
const tasksStatusOptions = computed(() => {
  const def = filterDefinitions.value?.find(d => d.key === 'status')
  return def?.options?.map(o => ({ value: o.value, label: o.label })) ?? []
})
const tasksSourceOptions = computed(() => {
  const def = filterDefinitions.value?.find(d => d.key === 'source')
  return def?.options?.map(o => ({ value: o.value, label: o.label })) ?? []
})

const isSelected = (task) => {
  // Check both currentTaskId (when task detail is shown) and highlightId (when switching from card to table)
  return task.compositeId === props.currentTaskId || task.compositeId === props.highlightId
}

const getVehicleInfo = (task) => {
  if (task.type === 'lead') {
    return task.requestedCar ? `${task.requestedCar.brand} ${task.requestedCar.model}` : 'No vehicle specified'
  }
  // For opportunities: prefer vehicle over requestedCar
  const vehicle = task.vehicle || task.requestedCar
  return vehicle ? `${vehicle.brand} ${vehicle.model}` : 'No vehicle specified'
}

const getDateDisplay = (date) => {
  if (!date) return 'Not set'
  
  const now = new Date()
  const dueDate = new Date(date)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const due = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())
  
  const diffTime = due - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`
  if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`
  
  return formatDeadlineFull(date)
}

// Helper function to get car status
const getCarStatus = (task) => {
  const vehicle = task.type === 'lead' ? task.requestedCar : task.vehicle
  if (!vehicle) return { status: 'N/A', class: 'bg-muted text-muted-foreground' }
  const isInStock = vehicle.stockDays !== undefined && vehicle.stockDays !== null
  return {
    status: isInStock ? 'In Stock' : 'Out of Stock',
    class: isInStock ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
  }
}

// Helper function to get request type
const getRequestType = (task) => {
  if (task.type === 'lead') {
    return task.requestedCar?.requestType || task.requestType || 'N/A'
  }
  return task.requestType || 'Opportunity'
}

// Helper to get car price (requestedCar or vehicle)
const getCarPrice = (task) => {
  const vehicle = task.type === 'lead' ? task.requestedCar : (task.vehicle || task.requestedCar)
  return vehicle?.price
}

// DataTable columns configuration (order: type, customer, carInfo, dueDate, price, leadSource, contactAttempts, assignee, createdAt, status, urgency)
const columns = computed(() => [
  {
    id: 'type',
    accessorKey: 'type',
    header: 'Task type',
    meta: {
      title: 'Task type',
      onOpen: (row) => handleRowClick(row.original)
    },
    cell: ({ row }) => {
      const task = row.original
      const typeClass = task.type === 'lead' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
      return h('span', {
        class: `inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${typeClass}`
      }, task.type === 'lead' ? 'Lead' : 'Opportunity')
    }
  },
  {
    id: 'customer',
    accessorKey: 'customer',
    header: 'Customer',
    meta: { title: 'Customer' },
    cell: ({ row }) => {
      const task = row.original
      return h('div', { class: 'flex items-center gap-2 md:gap-3' }, [
        h('div', {
          class: `w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${task.type === 'lead' ? 'bg-orange-100 text-orange-600' : 'bg-purple-100 text-purple-600'}`
        }, task.customer.initials),
        h('div', { class: 'min-w-0' }, [
          h('div', { class: 'text-content font-semibold text-foreground truncate max-w-32 md:max-w-none' }, task.customer.name),
          h('div', { class: 'text-meta truncate hidden sm:block' }, task.customer.phone || 'N/A')
        ])
      ])
    }
  },
  {
    id: 'carInfo',
    accessorKey: 'carInfo',
    header: 'Car Info',
    meta: { title: 'Car Info' },
    cell: ({ row }) => {
      const task = row.original
      const vehicleInfo = getVehicleInfo(task)
      const carStatus = getCarStatus(task)
      const requestType = getRequestType(task)
      const vehicle = task.type === 'lead' ? task.requestedCar : (task.vehicle || task.requestedCar)

      if (vehicleInfo === 'No vehicle specified') {
        return h('span', { class: 'text-meta' }, 'N/A')
      }

      const condition = vehicle?.condition ? vehicle.condition.charAt(0).toUpperCase() + vehicle.condition.slice(1).toLowerCase() : null
      const mileage = vehicle?.kilometers ? `${vehicle.kilometers.toLocaleString()} km` : null
      const quotationNumber = task.quotationNumber || task.quotation || null
      const shouldShowRequestType = requestType && requestType !== 'N/A' && (requestType !== 'Quotation' || quotationNumber)

      return h('div', { class: 'flex flex-col gap-1' }, [
        h('div', { class: 'flex items-center gap-2' }, [
          h('i', { class: 'fa-brands fa-volkswagen text-muted-foreground text-sm' }),
          h('span', { class: 'text-content font-medium text-foreground truncate max-w-32' }, vehicleInfo)
        ]),
        h('div', { class: 'flex items-center gap-2 flex-wrap' }, [
          h('span', { class: `inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${carStatus.class}` }, carStatus.status),
          condition && h('span', { class: 'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700' }, condition),
          mileage && h('span', { class: 'text-meta text-xs' }, mileage),
          shouldShowRequestType && h('span', { class: 'text-meta text-xs' }, requestType)
        ])
      ])
    }
  },
  {
    id: 'dueDate',
    accessorKey: 'nextActionDue',
    header: 'Due Date',
    meta: { title: 'Due Date' },
    cell: ({ row }) => {
      const task = row.original
      const date = task.nextActionDue ?? task.dueDate
      if (!date) {
        return h('span', { class: 'text-meta' }, 'Not set')
      }
      const status = getDeadlineStatus(date)
      return h('span', {
        class: `inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${status.bgClass} ${status.textClass} ${status.borderClass}`
      }, getDateDisplay(date))
    }
  },
  {
    id: 'price',
    accessorKey: 'price',
    accessorFn: (row) => getCarPrice(row) ?? 0,
    header: 'Price',
    meta: { title: 'Price' },
    cell: ({ row }) => {
      const task = row.original
      const price = getCarPrice(task)
      if (price == null || price === '') {
        return h('span', { class: 'text-meta' }, '—')
      }
      return h('span', { class: 'text-content font-medium text-foreground' }, `€ ${formatCurrency(price)}`)
    }
  },
  {
    id: 'source',
    accessorKey: 'source',
    header: 'Lead Source',
    meta: { title: 'Lead Source' },
    cell: ({ row }) => {
      const task = row.original
      return h('span', {
        class: 'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-muted text-muted-foreground'
      }, task.source || 'N/A')
    }
  },
  {
    id: 'contactAttempts',
    accessorKey: 'contactAttempts',
    header: 'Contact Attempts',
    meta: { title: 'Contact Attempts' },
    cell: ({ row }) => {
      const task = row.original
      const attempts = task.contactAttempts?.length || 0
      return h('span', { class: 'text-content font-medium text-foreground' }, attempts)
    }
  },
  {
    id: 'assignee',
    accessorKey: 'assignee',
    header: 'Assignee',
    meta: { title: 'Assignee' },
    cell: ({ row }) => {
      const task = row.original
      const owner = props.getOwnerInfo(task)
      return h('div', { class: 'flex items-center gap-2' }, [
        h('div', {
          class: 'w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0'
        }, owner.initials),
        h('span', { class: 'text-meta truncate max-w-20' }, owner.name)
      ])
    }
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: 'Creation Date',
    meta: { title: 'Creation Date' },
    cell: ({ row }) => {
      const task = row.original
      if (!task.createdAt) return h('span', { class: 'text-meta' }, 'N/A')
      return h('span', { class: 'text-meta' }, formatDate(task.createdAt))
    }
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    meta: { title: 'Status' },
    cell: ({ row }) => {
      const task = row.original
      const stageStatus = task.type === 'lead' ? task.status : (task.displayStage || task.stage)
      const stageClass = props.getStageBadgeClass(stageStatus)
      return h('span', {
        class: `inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${stageClass}`
      }, stageStatus)
    }
  },
  ...(settingsStore.getSetting('urgencyEnabled') !== false ? [{
    id: 'urgencyLevel',
    accessorKey: 'urgencyLevel',
    header: 'Urgency',
    meta: { title: 'Urgency' },
    cell: ({ row }) => {
      const task = row.original
      if (task.type !== 'lead') {
        return h('span', { class: 'text-meta' }, '—')
      }
      let urgencyLevel = task.urgencyLevel
      if (!urgencyLevel) {
        const urgencyResult = calculateLeadUrgency(task)
        urgencyLevel = urgencyResult.level
      }
      const colorClass = getUrgencyColorClass(urgencyLevel)
      const iconName = getUrgencyIcon(urgencyLevel)
      const urgencyIconComponents = { Flame, Sun, CheckCircle, Circle }
      const IconComp = urgencyIconComponents[iconName] || Circle
      return h('span', {
        class: `inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${colorClass}`
      }, [h(IconComp, { class: 'size-3 shrink-0' }), h('span', {}, urgencyLevel)])
    }
  }] : [])
])

// Filter → sort → paginate for DataTable (guide pattern) - must be after columns
const getTaskFilterValue = (row, key) => {
  if (key === 'requestedCarBrand') {
    const car = row.type === 'lead' ? row.requestedCar : row.vehicle
    return car?.brand
  }
  if (key === 'status') {
    return row.type === 'lead' ? row.status : (row.displayStage ?? row.stage)
  }
  return getNestedProperty(row, key)
}

/** Due-date display label for table and search (same as getDateDisplay; "Not set" excluded from search). */
function getDueDateSearchLabel(row) {
  const raw = row.nextActionDue ?? row.dueDate
  if (!raw) return null
  const label = getDateDisplay(raw)
  return label === 'Not set' ? null : label
}

const { paginatedData, sortedData, totalFilteredCount } = useDataTableData({
  rawData: computed(() => props.tasks),
  columns,
  globalFilter,
  columnFilters,
  sorting,
  pagination,
  filterDefs: filterDefinitions,
  searchableFields: (row) => [
    row.customer?.name,
    row.customer?.email,
    row.customer?.phone,
    getVehicleInfo(row),
    row.type === 'lead' ? row.status : (row.displayStage ?? row.stage),
    row.type,
    row.source,
    row.assignee,
    getDueDateSearchLabel(row),
    getCarPrice(row) != null ? String(getCarPrice(row)) : null,
    row.contactAttempts?.length,
    row.createdAt,
    row.type === 'lead' ? (calculateLeadUrgency(row).level ?? null) : null,
    row.compositeId,
    row.id
  ],
  getFilterValue: getTaskFilterValue
})

const handleRowClick = (record) => {
  // Set search filter to task ID to highlight the clicked record
  globalFilter.value = String(record.id)
  
  emit('select', record.compositeId)
}

// Bulk delete handler
const handleBulkDelete = () => {
  const selectedTasks = getSelectedRows(sortedData.value)
  
  if (selectedTasks.length === 0) return
  
  if (!confirm(`Are you sure you want to delete ${selectedTasks.length} ${selectedTasks.length === 1 ? 'task' : 'tasks'}?`)) {
    return
  }
  
  selectedTasks.forEach(task => {
    if (task.type === 'lead') {
      leadsStore.deleteLead(task.id)
    } else {
      opportunitiesStore.deleteOpportunity(task.id)
    }
  })
  
  clearSelection()
}

// Table meta with row click handler and highlighting
const tableMeta = computed(() => ({
  class: {
    tr: (row) => {
      const baseClasses = 'cursor-pointer hover:bg-muted transition-colors'
      const task = row.original
      if (isSelected(task)) {
        // Highlight selected/highlighted row with a subtle background and border
        return `${baseClasses} bg-blue-50 border-l-4 border-l-blue-500`
      }
      return baseClasses
    }
  }
}))

</script>

<style scoped>
/* Component-specific styles only - global table styles are in main.css */

/* Avatar fallback - use greys-300 color */
:deep([data-radix-avatar-fallback]),
:deep(.avatar-fallback),
:deep(span[class*='AvatarFallback']) {
  background-color: #d4d4d4 !important;
}

/* Table border overrides - make borders very subtle (border-black/5) */
:deep(tbody tr) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
}

:deep(tbody tr:last-child) {
  border-bottom: none !important;
}

/* Hide built-in DataTable search row only (UnifiedSearchBar is above) – scope to table container */
.data-table-inner.table-search-wrapper :deep([data-slot="table-search"]),
.data-table-inner.table-search-wrapper :deep(div:has(> input[placeholder*="Search"])),
.data-table-inner.table-search-wrapper :deep(div:has(> input[type="search"])) {
  display: none !important;
}

/* Remove any dark borders from table container */
:deep([data-slot="table-container"]),
:deep(.table-wrapper) {
  border: none !important;
}

/* Frame panel - should have gray background */
:deep([data-slot="frame-panel"]) {
  background-color: rgba(245, 245, 245, 1) !important;
}

/* Pagination dropdown - transparent in footer */
:deep(footer select),
:deep(footer button[role="combobox"]) {
  background-color: transparent !important;
  border: none !important;
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

