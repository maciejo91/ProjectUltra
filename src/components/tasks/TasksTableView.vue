<template>
  <div class="flex-1 flex flex-col overflow-hidden min-w-0">
    <!-- Same as Customers: one scroll area with padding, one white card (search + table) -->
    <div class="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide min-h-0">
      <div class="bg-background mb-8">
        <div class="mb-1">
          <UnifiedSearchBar
            active-tab="tasks"
            full-width
            placeholder="Search tasks..."
            :pagination="pagination"
            :assignee-options="assigneeOptions"
            :request-type-options="requestTypeOptions"
            :status-options="tasksStatusOptions"
            :source-options="tasksSourceOptions"
            :priority-options="tasksPriorityOptions"
            :requested-car-brand-options="tasksRequestedCarBrandOptions"
            @update:global-filter="globalFilter = $event"
            @update:column-filters="columnFilters = $event"
            @update:pagination="pagination = $event"
          />
        </div>
        <div
          ref="tableScrollContainer"
          class="data-table-inner table-search-wrapper"
          :class="{ 'hide-table-filter': !hasActiveFilters }"
          @click="onTableContainerClick"
        >
          <DataTable 
            :data="displayedData" 
            :columns="columns"
            :meta="tableMeta"
            :loading="tableLoading"
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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, h, watch, nextTick, onUnmounted } from 'vue'
import { ListTodo, Trash2, X, Triangle, Circle } from 'lucide-vue-next'
import { DataTable } from '@motork/component-library/future/components'
import { Button } from '@motork/component-library/future/primitives'
import UnifiedSearchBar from '@/components/shared/UnifiedSearchBar.vue'
import { formatCurrency, formatDueDateRelative, formatRelativeTime, getDeadlineStatus } from '@/utils/formatters'
import { calculateLeadUrgency, getUrgencyDotClass } from '@/composables/useLeadUrgency'
import { useSettingsStore } from '@/stores/settings'
import { useUsersStore } from '@/stores/users'
import { useTasksTableFilters } from '@/composables/useTasksTableFilters'
import { useTableRowSelection } from '@/composables/useTableRowSelection'
import { useTableRowClick } from '@/composables/useTableRowClick'
import { useDataTableData, getNestedProperty } from '@/composables/useDataTableData'
import { useLeadsStore } from '@/stores/leads'
import { useOpportunitiesStore } from '@/stores/opportunities'
import { useTaskHelpers } from '@/composables/useTaskHelpers'
import { getTaskActionTitle, getTaskDisplayTitle } from '@/utils/taskActionTitle'
import { getDisplayStage } from '@/utils/stageMapper'
import { getTaskStatus } from '@/utils/taskStatus'

const props = defineProps({
  tasks: { type: Array, required: true },
  currentTaskId: { type: String, default: null },
  highlightId: { type: String, default: null },
  showClosed: { type: Boolean, default: false },
  showMobileClose: { type: Boolean, default: false },
  initialGlobalFilter: { type: String, default: '' },
  searchPlaceholder: { type: String, default: 'Search tasks...' },
  viewMode: { type: String, default: 'table' },
  getVehicleType: { type: Function, required: true },
  getVehicleTypeBadgeClass: { type: Function, required: true },
  getOwnerInfo: { type: Function, required: true },
  getStageBadgeClass: { type: Function, required: true }
})

const emit = defineEmits(['select', 'toggle-closed', 'reassign', 'close', 'view-change', 'update:globalFilter'])

const settingsStore = useSettingsStore()
const usersStore = useUsersStore()
const leadsStore = useLeadsStore()
const opportunitiesStore = useOpportunitiesStore()
const { getCustomerCity } = useTaskHelpers()
const searchQuery = ref('')
const tableScrollContainer = ref(null)

const maxContactAttempts = computed(() => settingsStore.getSetting('maxContactAttempts') ?? 5)

function getVehicleConditionDisplay(task) {
  const vehicle = task.type === 'lead' ? task.requestedCar : (task.vehicle || task.requestedCar)
  if (!vehicle) return null
  const status = vehicle.status || ''
  const km = vehicle.kilometers
  if (km === 0 || (typeof km === 'number' && km < 1) || status === 'New') {
    return (status && status.toLowerCase() === 'new') || km === 0 ? 'Km0' : 'New'
  }
  return status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : 'Used'
}

function getAssigneeDepartmentLocation(task) {
  if (!task?.assignee) return { name: 'Unassigned', line2: '' }
  const user = usersStore.users.find(u => u.name === task.assignee)
  if (!user) return { name: task.assignee, line2: '' }
  const line2 = [user.team, user.dealership].filter(Boolean).join(' - ') || ''
  return { name: task.assignee, line2 }
}

function getRequestMessageSnippet(task) {
  const msg = task.requestedCar?.requestMessage ?? task.requestMessage
  if (!msg || typeof msg !== 'string') return '—'
  return msg.length > 32 ? `${msg.slice(0, 29)}...` : msg
}

// Row selection
const { rowSelection, selectedCount, hasSelection, getSelectedRows, clearSelection } = useTableRowSelection((row) => row.compositeId)

// DataTable state management
const pagination = ref({
  pageIndex: 0,
  pageSize: 10
})

const globalFilter = ref(props.initialGlobalFilter || '')
const sorting = ref([])
const columnFilters = ref([
  { id: 'showClosed-1', field: 'showClosed', value: props.showClosed ? 'yes' : '', operator: 'eq', pinned: true },
  { id: 'type-1', field: 'type', value: '', operator: 'eq', pinned: true },
  { id: 'status-1', field: 'status', value: [], operator: 'in', pinned: true }
])
// Default visible: Task, Due time, Customer, Vehicle, Attempts, Assignee, Created at, Status (task-level). Hidden: Request status, Type, Urgency, VIN, Request message, Source
const columnVisibility = ref({
  taskTitle: true,
  dueDate: true,
  customer: true,
  vehicle: true,
  contactAttempts: true,
  assignee: true,
  createdAt: true,
  taskStatus: true,
  requestStatus: false,
  type: false,
  urgencyLevel: false,
  vin: false,
  requestMessage: false,
  source: false
})

// Watch globalFilter changes and emit to parent
watch(globalFilter, (newValue) => {
  emit('update:globalFilter', newValue)
})

// Sync showClosed filter from prop (e.g. when switching from card view)
watch(
  () => props.showClosed,
  (showClosed) => {
    const filters = [...columnFilters.value]
    const idx = filters.findIndex((f) => (f.field ?? f.key) === 'showClosed')
    const newVal = showClosed ? 'yes' : ''
    if (idx >= 0 && filters[idx]?.value !== newVal) {
      filters[idx] = { ...filters[idx], value: newVal }
      columnFilters.value = filters
    }
  },
  { immediate: true }
)

// When user changes showClosed filter in table, emit to parent
watch(
  columnFilters,
  (filters) => {
    const f = Array.isArray(filters) ? filters.find((x) => (x.field ?? x.key) === 'showClosed') : null
    const val = f?.value
    const isYes = val === 'yes' || val === true
    if (isYes !== props.showClosed) {
      emit('toggle-closed')
    }
  },
  { deep: true }
)

// Show filter row when we have filters (including default Show Closed, Type, Status) or search
const hasActiveFilters = computed(() => {
  const hasColumnFilters = Array.isArray(columnFilters.value) && columnFilters.value.length > 0
  const hasSearch = Boolean(globalFilter.value && String(globalFilter.value).trim())
  return hasColumnFilters || hasSearch
})

// Table has its own filters (column filters); TaskFilters button/chips apply to card view only.
const { filterDefinitions } = useTasksTableFilters({
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
const tasksPriorityOptions = [
  { value: 'Hot', label: 'Hot' },
  { value: 'Normal', label: 'Normal' }
]
const tasksRequestedCarBrandOptions = computed(() => {
  const def = filterDefinitions.value?.find(d => d.key === 'requestedCarBrand')
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


// Helper to get car price (requestedCar or vehicle)
const getCarPrice = (task) => {
  const vehicle = task.type === 'lead' ? task.requestedCar : (task.vehicle || task.requestedCar)
  return vehicle?.price
}

// DataTable columns order: Task title, Due date, Customer, Urgency (when enabled), Type, Status, Vehicle, VIN, Request message, Created, Attempts, Source, Assigned
const columns = computed(() => {
  const urgencyEnabled = settingsStore.getSetting('urgencyEnabled') !== false
  const urgencyColumn = {
    id: 'urgencyLevel',
    accessorKey: 'urgencyLevel',
    header: 'Urgency',
    meta: { title: 'Urgency' },
    cell: ({ row }) => {
      const task = row.original
      if (!task.urgencyLevel) {
        return h('span', { class: 'text-meta' }, '—')
      }
      const dotClass = getUrgencyDotClass(task.urgencyLevel)
      return h('span', {
        class: 'inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground leading-none'
      }, [
        h('span', { class: ['shrink-0 rounded-full size-2', dotClass].join(' '), 'aria-hidden': 'true' }),
        task.urgencyLevel
      ])
    }
  }
  return [
  {
    id: 'taskTitle',
    accessorKey: 'taskTitle',
    header: 'Task',
    meta: {
      title: 'Task',
      onOpen: (row) => handleRowClick(row.original)
    },
    cell: ({ row }) => {
      const task = row.original
      const displayTitle = getTaskDisplayTitle(task)
      const subtitle = task.type === 'lead' ? 'Lead' : 'Opportunity'
      return h('div', { class: 'flex flex-col min-w-0' }, [
        h('div', { class: 'text-content font-semibold text-foreground truncate' }, displayTitle || '—'),
        h('div', { class: 'text-meta truncate' }, subtitle)
      ])
    }
  },
  {
    id: 'dueDate',
    accessorKey: 'nextActionDue',
    header: 'Due time',
    meta: { title: 'Due time' },
    cell: ({ row }) => {
      const task = row.original
      const date = task.type === 'opportunity' && task.expectedCloseDate
        ? task.expectedCloseDate
        : (task.nextActionDue ?? task.dueDate)
      const hasRecall = task.type === 'lead' && task.scheduledRecallAppointment?.date
      if (!date && !hasRecall) {
        return h('span', { class: 'text-meta' }, 'Not set')
      }
      const parts = []
      if (date) {
        const status = getDeadlineStatus(date)
        const pillClass = status.type === 'overdue' ? 'mk-due-pill-overdue' : (status.type === 'urgent' || status.type === 'today' ? 'mk-due-pill-urgent' : 'mk-due-pill-normal')
        const text = formatDueDateRelative(date)
        parts.push(h('span', {
          class: `inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium uppercase leading-none ${pillClass}`
        }, text))
      }
      if (hasRecall) {
        parts.push(h('span', {
          class: 'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium uppercase leading-none bg-blue-50 text-blue-700 ml-1'
        }, [h('span', { class: 'shrink-0 rounded-full size-1.5 bg-blue-500', 'aria-hidden': 'true' }), 'Recall']))
      }
      return h('div', { class: 'flex flex-wrap items-center gap-1' }, parts)
    }
  },
  {
    id: 'customer',
    accessorKey: 'customer',
    header: 'Customer',
    meta: { title: 'Customer' },
    cell: ({ row }) => {
      const task = row.original
      const city = getCustomerCity(task)
      return h('div', { class: 'flex flex-col min-w-0' }, [
        h('div', { class: 'text-content font-semibold text-foreground truncate' }, task.customer?.name || '—'),
        h('div', { class: 'text-meta truncate' }, city || '—')
      ])
    }
  },
  ...(urgencyEnabled ? [urgencyColumn] : []),
  {
    id: 'type',
    accessorKey: 'type',
    header: 'Type',
    meta: { title: 'Type' },
    cell: ({ row }) => {
      const task = row.original
      const typeClass = task.type === 'lead' ? 'bg-badge-green text-emerald-700' : 'bg-purple-50 text-purple-700'
      return h('span', {
        class: `inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${typeClass} w-fit`
      }, task.type === 'lead' ? 'Lead' : 'Opportunity')
    }
  },
  {
    id: 'requestStatus',
    accessorKey: 'status',
    header: 'Request status',
    meta: { title: 'Request status' },
    cell: ({ row }) => {
      const task = row.original
      const displayStage = getDisplayStage(task, task.type === 'lead' ? 'lead' : 'opportunity')
      const stageClass = props.getStageBadgeClass(displayStage)
      return displayStage
        ? h('span', {
            class: `inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${stageClass} w-fit`
          }, displayStage)
        : h('span', { class: 'text-meta' }, '—')
    }
  },
  {
    id: 'vehicle',
    accessorKey: 'carInfo',
    header: 'Vehicle',
    meta: { title: 'Vehicle' },
    cell: ({ row }) => {
      const task = row.original
      const vehicleInfo = getVehicleInfo(task)
      if (vehicleInfo === 'No vehicle specified') {
        return h('span', { class: 'text-meta' }, '—')
      }
      const price = getCarPrice(task)
      const condition = getVehicleConditionDisplay(task)
      const priceStr = price != null && price !== '' ? `€${formatCurrency(price)}` : ''
      const conditionStr = condition ? ` (${condition})` : ''
      const metaLine = [priceStr, conditionStr].filter(Boolean).join('')
      return h('div', { class: 'flex flex-col min-w-0' }, [
        h('div', { class: 'text-content font-medium text-foreground truncate' }, vehicleInfo),
        h('div', { class: 'text-meta' }, metaLine || '—')
      ])
    }
  },
  {
    id: 'vin',
    accessorKey: 'vin',
    header: 'VIN',
    meta: { title: 'VIN' },
    cell: ({ row }) => {
      const task = row.original
      const vehicle = task.type === 'lead' ? task.requestedCar : (task.vehicle || task.requestedCar)
      const vin = vehicle?.vin ?? task.requestedCar?.vin
      if (!vin) return h('span', { class: 'text-meta' }, '—')
      return h('div', { class: 'text-meta text-xs truncate font-mono min-w-0' }, vin)
    }
  },
  {
    id: 'requestMessage',
    accessorKey: 'requestMessage',
    header: 'Request message',
    meta: { title: 'Request message' },
    cell: ({ row }) => {
      const snippet = getRequestMessageSnippet(row.original)
      return h('span', { class: 'text-meta truncate max-w-32 inline-block' }, snippet)
    }
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: 'Created at',
    meta: { title: 'Created at' },
    cell: ({ row }) => {
      const task = row.original
      if (!task.createdAt) return h('span', { class: 'text-meta' }, '—')
      return h('span', { class: 'text-meta' }, formatRelativeTime(task.createdAt))
    }
  },
  {
    id: 'contactAttempts',
    accessorKey: 'contactAttempts',
    header: 'Attempts',
    meta: { title: 'Attempts' },
    cell: ({ row }) => {
      const task = row.original
      const attempts = task.contactAttempts?.length || 0
      const max = maxContactAttempts.value
      const circumference = 2 * Math.PI * 12
      const offset = max > 0 ? circumference * (1 - attempts / max) : circumference
      return h('div', { class: 'mk-attempts-progress' }, [
        h('svg', {
          class: 'mk-attempts-progress-ring size-8 -rotate-90',
          viewBox: '0 0 32 32',
          'aria-hidden': 'true'
        }, [
          h('circle', {
            class: 'mk-attempts-progress-track',
            cx: 16,
            cy: 16,
            r: 12,
            fill: 'none',
            'stroke-width': 3
          }),
          h('circle', {
            class: 'mk-attempts-progress-fill',
            cx: 16,
            cy: 16,
            r: 12,
            fill: 'none',
            'stroke-width': 3,
            'stroke-dasharray': circumference,
            'stroke-dashoffset': offset
          })
        ]),
        h('span', { class: 'mk-attempts-progress-text text-xs font-medium text-foreground' }, `${attempts}/${max}`)
      ])
    }
  },
  {
    id: 'source',
    accessorKey: 'source',
    header: 'Source',
    meta: { title: 'Source' },
    cell: ({ row }) => {
      const task = row.original
      const main = task.source || '—'
      const details = task.sourceDetails ? ` ${task.sourceDetails}` : ''
      const badge = task.taskStatusBadge
      return h('div', { class: 'flex flex-col gap-1 min-w-0' }, [
        h('span', { class: 'text-meta' }, `${main}${details}`.trim()),
        ...(badge ? [h('span', {
          class: 'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-700 w-fit'
        }, badge)] : [])
      ])
    }
  },
  {
    id: 'assignee',
    accessorKey: 'assignee',
    header: 'Assignee',
    meta: { title: 'Assignee' },
    cell: ({ row }) => {
      const task = row.original
      const { name, line2 } = getAssigneeDepartmentLocation(task)
      return h('div', { class: 'flex flex-col min-w-0' }, [
        h('div', { class: 'text-content font-medium text-foreground truncate' }, name),
        ...(line2 ? [h('div', { class: 'text-meta truncate' }, line2)] : [])
      ])
    }
  },
  {
    id: 'taskStatus',
    accessorKey: 'taskStatus',
    header: 'Status',
    meta: { title: 'Status' },
    cell: ({ row }) => {
      const task = row.original
      const status = getTaskStatus(task, maxContactAttempts.value)
      const labels = { overdue: 'Overdue', in_progress: 'In progress', open: 'Open' }
      const statusClass = status === 'overdue' ? 'mk-task-status-overdue' : (status === 'in_progress' ? 'mk-task-status-in-progress' : 'mk-task-status-open')
      const icon = status === 'overdue' ? h(Triangle, { class: 'shrink-0 size-3.5', 'aria-hidden': 'true' }) : h(Circle, { class: 'shrink-0 size-3.5', 'aria-hidden': 'true' })
      return h('span', {
        class: `inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold ${statusClass} w-fit`
      }, [icon, labels[status]])
    }
  }
  ]
  })

// Filter → sort → paginate for DataTable - maps filter keys to row values (aligned with columns)
const getTaskFilterValue = (row, key) => {
  if (key === 'taskTitle') {
    return getTaskActionTitle(row) ?? ''
  }
  if (key === 'requestedCarBrand') {
    const car = row.type === 'lead' ? row.requestedCar : (row.vehicle || row.requestedCar)
    return car?.brand
  }
  if (key === 'status') {
    return getDisplayStage(row, row.type === 'lead' ? 'lead' : 'opportunity') ?? row.displayStage ?? row.status ?? row.stage
  }
  if (key === 'assignee') {
    const val = row.assignee
    return val || '__unassigned__'
  }
  if (key === 'nextActionDue') {
    return row.nextActionDue ?? row.dueDate
  }
  return getNestedProperty(row, key)
}

/** Due-date display label for table and search (formatDueDateRelative style; "Not set" excluded from search). */
function getDueDateSearchLabel(row) {
  const raw = row.type === 'opportunity' && row.expectedCloseDate
    ? row.expectedCloseDate
    : (row.nextActionDue ?? row.dueDate)
  if (!raw) return null
  const label = formatDueDateRelative(raw)
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
  searchableFields: (row) => {
    const urgencyEnabled = settingsStore.getSetting('urgencyEnabled') !== false
    const urgencyField =
      urgencyEnabled
        ? (row.type === 'lead' ? (row.urgencyLevel ?? calculateLeadUrgency(row).level ?? null) : (row.urgencyLevel ?? null))
        : null
    return [
      row.customer?.name,
      row.customer?.email,
      row.customer?.phone,
      getCustomerCity(row),
      getVehicleInfo(row),
      (row.vehicle || row.requestedCar)?.vin,
      row.type === 'lead' ? (row.displayStage ?? row.status) : (row.displayStage ?? row.stage),
      row.type,
      row.source,
      row.sourceDetails,
      row.assignee,
      getDueDateSearchLabel(row),
      getCarPrice(row) != null ? String(getCarPrice(row)) : null,
      row.contactAttempts?.length,
      row.createdAt,
      ...(urgencyEnabled ? [urgencyField] : []),
      row.compositeId,
      row.id,
      getTaskActionTitle(row),
      row.requestedCar?.requestMessage,
      row.requestMessage,
      row.taskStatusBadge
    ]
  },
  getFilterValue: getTaskFilterValue
})

// Simulate backend filtering: show loading state only when user changes filters/sort/pagination (not when tasks list reference changes e.g. opening drawer)
const BACKEND_FILTER_DELAY_MS = 250
const tableLoading = ref(true)
const displayedData = ref([])
let fetchTimeout = null

function applySimulatedBackendFetch() {
  if (fetchTimeout) clearTimeout(fetchTimeout)
  tableLoading.value = true
  fetchTimeout = setTimeout(() => {
    displayedData.value = [...paginatedData.value]
    tableLoading.value = false
    fetchTimeout = null
  }, BACKEND_FILTER_DELAY_MS)
}

// User-initiated changes: show loading then update table
watch(
  [globalFilter, columnFilters, sorting, pagination],
  applySimulatedBackendFetch,
  { immediate: true, deep: true }
)

// Tasks list changed (e.g. one lead updated when opening drawer): refresh table data without loading
watch(
  () => props.tasks,
  () => {
    displayedData.value = [...paginatedData.value]
    tableLoading.value = false
  },
  { deep: true }
)

onUnmounted(() => {
  if (fetchTimeout) clearTimeout(fetchTimeout)
})

const handleRowClick = (record) => {
  emit('select', record.compositeId)
}

const { onTableContainerClick } = useTableRowClick(displayedData, handleRowClick)

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

// Scroll selected task row into view when selection changes
watch(
  () => [props.currentTaskId, props.highlightId],
  async ([currentTaskId, highlightId]) => {
    const targetId = currentTaskId || highlightId
    if (!targetId || !tableScrollContainer.value) return
    const idx = sortedData.value.findIndex((t) => t.compositeId === targetId)
    if (idx === -1) return
    const pageSize = pagination.value.pageSize || 10
    const pageIndex = Math.floor(idx / pageSize)
    if (pagination.value.pageIndex !== pageIndex) {
      pagination.value = { ...pagination.value, pageIndex }
    }
    await nextTick()
    const rows = tableScrollContainer.value.querySelectorAll('tbody tr')
    const rowIndexOnPage = idx % pageSize
    const row = rows[rowIndexOnPage]
    if (row) {
      row.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  },
  { immediate: true }
)

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

/* Pagination dropdown - transparent in footer */
:deep(footer select),
:deep(footer button[role="combobox"]) {
  background-color: transparent !important;
  border: none !important;
}

/* Filter row: flex so pills sit in one row */
.data-table-inner.table-search-wrapper :deep([data-slot="table-filter"]) {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

/* Filter button - same styling (light bg, subtle border) */
:deep(button[aria-label*="filter"]),
:deep(button[aria-label*="Filter"]),
:deep([data-slot="table-filter"] button) {
  background-color: var(--background) !important;
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

