<template>
  <div class="flex flex-1 flex-col min-h-0 min-w-0 overflow-hidden">
    <div class="flex flex-1 flex-col min-h-0 px-6 pb-4 md:pb-8">
      <div class="flex flex-1 flex-col min-h-0 bg-background">
      <DataTableWithUnifiedSearch
        class="flex flex-1 flex-col min-h-0"
        ref="datatableShellRef"
        v-model:sorting="sorting"
        active-tab="tasks"
        :placeholder="t('dataTable.searchTasks')"
        :pagination="pagination"
        :assignee-options="assigneeOptions"
        :request-type-options="requestTypeOptions"
        :status-options="tasksStatusOptions"
        :source-options="tasksSourceOptions"
        :priority-options="tasksPriorityOptions"
        :requested-car-brand-options="tasksRequestedCarBrandOptions"
        :sort-menu-items="taskSortMenuItems"
        @update:global-filter="globalFilter = $event"
        @update:column-filters="columnFilters = $event"
        @update:pagination="pagination = $event"
        @wrapper-click="onTableContainerClick"
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
            v-model:sorting="sorting"
            v-model:columnFilters="columnFilters"
            v-model:columnVisibility="columnVisibility"
            v-model:rowSelection="rowSelection"
            :paginationOptions="{
              rowCount: totalFilteredCount,
              pageSizeOptions: [15, 20, 50]
            }"
              class="flex min-h-0 flex-1 flex-col"
          >
            <template #empty-state>
              <div class="empty-state">
                <ListTodo class="empty-state-icon w-8 h-8 shrink-0" />
                <p class="empty-state-text">{{ t('dataTable.tasks.emptyState') }}</p>
              </div>
            </template>
            <template #batch-action-bar>
              <div v-if="hasSelection" class="flex items-center gap-2">
                <div class="flex items-center gap-2 mr-1">
                  <div class="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-blue-600 text-white text-sm font-medium">
                    {{ selectedCount }}
                  </div>
                  <span class="text-white text-fluid-sm font-medium whitespace-nowrap">{{ t('dataTable.tasks.itemsSelected') }}</span>
                </div>
                <div class="h-4 w-px bg-greys-700"></div>
                <Button
                  variant="ghost"
                  size="sm"
                  @click="handleBulkDelete"
                >
                  <Trash2 class="w-4 h-4 shrink-0 mr-2" />
                  {{ t('common.buttons.delete') }}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  @click="clearSelection"
                >
                  <X class="w-4 h-4 shrink-0 mr-2" />
                  {{ t('common.buttons.close') }}
                </Button>
              </div>
            </template>
          </DataTable>
      </DataTableWithUnifiedSearch>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, h, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ListTodo, Trash2, X } from 'lucide-vue-next'
import { DataTable } from '@motork/component-library/future/components'
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@motork/component-library/future/primitives'
import DataTableWithUnifiedSearch from '@/components/shared/layout/DataTableWithUnifiedSearch.vue'
import { formatCurrency, getDeadlineStatus } from '@/utils/formatters'
import { calculateLeadUrgency, getUrgencyDotClass } from '@/composables/useLeadUrgency'
import { useSettingsStore } from '@/stores/settings'
import { useUsersStore } from '@/stores/users'
import { useTasksTableFilters } from '@/composables/useTasksTableFilters'
import { useTableRowSelection } from '@/composables/useTableRowSelection'
import { useTableRowClick } from '@/composables/useTableRowClick'
import { useDataTableData, getNestedProperty } from '@/composables/useDataTableData'
import { DEFAULT_TABLE_PAGE_SIZE } from '@/constants/dataTable'
import { useLeadsStore } from '@/stores/leads'
import { useOpportunitiesStore } from '@/stores/opportunities'
import { useTaskHelpers } from '@/composables/useTaskHelpers'
import { getTaskNextActionDisplay, getTaskTypeCode } from '@/utils/taskActionTitle'
import { getDisplayStage } from '@/utils/stageMapper'
import {
  getTaskTableStatus,
  getTaskTableStatusBadgeClass,
  TASK_TABLE_STATUS,
  translateTaskTableStatus
} from '@/utils/taskStatus'
import {
  formatTaskDueTimeDisplay,
  formatTaskCreatedAtDisplay,
  getTaskDueTimestamp
} from '@/utils/taskTableDates'

const { t, locale } = useI18n()

const taskColumnLabel = (key) => t(`dataTable.tasks.columns.${key}`)

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
const datatableShellRef = ref(null)
let isTableMounted = false

const maxContactAttempts = computed(() => settingsStore.getSetting('maxContactAttempts') ?? 5)

function getVehicleConditionDisplay(task) {
  const vehicle = task.type === 'lead' ? task.requestedCar : (task.vehicle || task.requestedCar)
  if (!vehicle) return null
  const status = vehicle.status || ''
  const km = vehicle.kilometers
  if (km === 0 || (typeof km === 'number' && km < 1) || status === 'New') {
    return (status && status.toLowerCase() === 'new') || km === 0 ? 'Km0' : 'New'
  }
  return status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : t('dataTable.tasks.values.used')
}

function getAssigneeDepartmentLocation(task) {
  if (!task?.assignee) return { name: t('dataTable.tasks.values.unassigned'), line2: '' }
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

function renderTaskDateLabel({ label, tooltip, className }) {
  const text = h('span', { class: className }, label)
  if (!tooltip || tooltip === label) return text
  return h(TooltipProvider, { delayDuration: 200 }, {
    default: () => h(Tooltip, {}, {
      default: () => [
        h(TooltipTrigger, { asChild: true }, { default: () => text }),
        h(TooltipContent, { side: 'top' }, { default: () => tooltip })
      ]
    })
  })
}

function renderDueTimePill({ label, tooltip, pillClass }) {
  const pill = h('span', {
    class: `inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm font-medium uppercase leading-none ${pillClass}`
  }, label)
  if (!tooltip || tooltip === label) return pill
  return h(TooltipProvider, { delayDuration: 200 }, {
    default: () => h(Tooltip, {}, {
      default: () => [
        h(TooltipTrigger, { asChild: true }, { default: () => pill }),
        h(TooltipContent, { side: 'top' }, { default: () => tooltip })
      ]
    })
  })
}

// Row selection
const { rowSelection, selectedCount, hasSelection, getSelectedRows, clearSelection } = useTableRowSelection((row) => row.compositeId)

// DataTable state management
const pagination = ref({
  pageIndex: 0,
  pageSize: DEFAULT_TABLE_PAGE_SIZE
})

const globalFilter = ref(props.initialGlobalFilter || '')
const sorting = ref([])

const taskSortMenuItems = computed(() => [
  { value: 'default', sorting: [], optionId: 'default' },
  { value: 'createdAt-desc', sorting: [{ id: 'createdAt', desc: true }], optionId: 'createdNewest' },
  { value: 'createdAt-asc', sorting: [{ id: 'createdAt', desc: false }], optionId: 'createdOldest' },
  { value: 'dueDate-asc', sorting: [{ id: 'dueDate', desc: false }], optionId: 'dueSoonest' },
  { value: 'dueDate-desc', sorting: [{ id: 'dueDate', desc: true }], optionId: 'dueLatest' },
  { value: 'nextAction-asc', sorting: [{ id: 'nextAction', desc: false }], optionId: 'taskAz' },
  { value: 'nextAction-desc', sorting: [{ id: 'nextAction', desc: true }], optionId: 'taskZa' },
  { value: 'customer-asc', sorting: [{ id: 'customer', desc: false }], optionId: 'customerAz' },
  { value: 'customer-desc', sorting: [{ id: 'customer', desc: true }], optionId: 'customerZa' },
  { value: 'assignee-asc', sorting: [{ id: 'assignee', desc: false }], optionId: 'assigneeAz' },
  { value: 'assignee-desc', sorting: [{ id: 'assignee', desc: true }], optionId: 'assigneeZa' },
  { value: 'contactAttempts-asc', sorting: [{ id: 'contactAttempts', desc: false }], optionId: 'attemptsLowHigh' },
  { value: 'contactAttempts-desc', sorting: [{ id: 'contactAttempts', desc: true }], optionId: 'attemptsHighLow' },
  { value: 'vehicle-asc', sorting: [{ id: 'vehicle', desc: false }], optionId: 'vehicleAz' },
  { value: 'vehicle-desc', sorting: [{ id: 'vehicle', desc: true }], optionId: 'vehicleZa' },
])

const columnFilters = ref([
  { id: 'showClosed-1', field: 'showClosed', value: props.showClosed ? 'yes' : '', operator: 'eq', pinned: true },
  { id: 'taskType-1', field: 'taskType', value: '', operator: 'eq', pinned: true },
  { id: 'status-1', field: 'status', value: [], operator: 'in', pinned: true }
])
// Default visible: Task type, Next action, Due time, Customer, Vehicle, Attempts, Assignee, Created at, Status. Hidden: Request status, Type, Urgency, VIN, Request message, Source
const columnVisibility = ref({
  taskType: true,
  nextAction: true,
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

// Table has its own filters (column filters); TaskFilters button/chips apply to card view only.
const { filterDefinitions } = useTasksTableFilters({
  showTypeFilter: computed(() => true),
  tasks: computed(() => props.tasks)
})

const assigneeOptions = computed(() => {
  const names = [...new Set(props.tasks.map(t => t.assignee).filter(Boolean))]
  return names.map(name => ({ value: name, label: name }))
})
const requestTypeOptions = computed(() => [
  { value: 'Test Drive', label: t('dataTable.tasks.requestTypes.testDrive') },
  { value: 'Quotation', label: t('dataTable.tasks.requestTypes.quotation') },
  { value: 'Generic sales', label: t('dataTable.tasks.requestTypes.genericSales') }
])
const tasksStatusOptions = computed(() => {
  const def = filterDefinitions.value?.find(d => d.key === 'status')
  return def?.options?.map(o => ({ value: o.value, label: o.label })) ?? []
})
const tasksSourceOptions = computed(() => {
  const def = filterDefinitions.value?.find(d => d.key === 'source')
  return def?.options?.map(o => ({ value: o.value, label: o.label })) ?? []
})
const tasksPriorityOptions = computed(() => [
  { value: 'Hot', label: t('dataTable.tasks.priority.hot') },
  { value: 'Normal', label: t('dataTable.tasks.priority.normal') }
])
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
  const urgencyEnabled = settingsStore.getSetting('urgencyEnabled') === true
  const urgencyColumn = {
    id: 'urgencyLevel',
    accessorKey: 'urgencyLevel',
    header: taskColumnLabel('urgency'),
    meta: { title: taskColumnLabel('urgency') },
    cell: ({ row }) => {
      const task = row.original
      if (!task.urgencyLevel) {
        return h('span', { class: 'text-meta' }, '—')
      }
      const dotClass = getUrgencyDotClass(task.urgencyLevel)
      return h('span', {
        class: 'inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground leading-none'
      }, [
        h('span', { class: ['shrink-0 rounded-full size-2', dotClass].join(' '), 'aria-hidden': 'true' }),
        task.urgencyLevel
      ])
    }
  }
  return [
  {
    id: 'taskType',
    accessorKey: 'taskType',
    accessorFn: (row) => getTaskTypeCode(row) ?? '',
    header: taskColumnLabel('taskType'),
    meta: { title: taskColumnLabel('taskType') },
    size: 56,
    minSize: 48,
    maxSize: 72,
    cell: ({ row }) => {
      const task = row.original
      const code = getTaskTypeCode(task)
      if (!code) {
        return h('span', { class: 'text-meta text-xs' }, '\u2014')
      }
      return h('span', {
        class: 'inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground w-fit uppercase tracking-wide'
      }, code)
    }
  },
  {
    id: 'nextAction',
    accessorKey: 'nextAction',
    accessorFn: (row) => {
      if (getTaskTableStatus(row) === TASK_TABLE_STATUS.CLOSED) return ''
      return getTaskNextActionDisplay(row) ?? ''
    },
    header: taskColumnLabel('nextAction'),
    meta: {
      title: taskColumnLabel('nextAction'),
      onOpen: (row) => handleRowClick(row.original)
    },
    cell: ({ row }) => {
      const task = row.original
      if (getTaskTableStatus(task) === TASK_TABLE_STATUS.CLOSED) {
        return h('span', { class: 'text-meta' }, '\u2014')
      }
      const label = getTaskNextActionDisplay(task)
      return h('div', { class: 'text-content font-medium text-foreground truncate min-w-0' }, label || '\u2014')
    }
  },
  {
    id: 'dueDate',
    accessorKey: 'nextActionDue',
    accessorFn: (row) => {
      const raw = getTaskDueTimestamp(row)
      return raw ? new Date(raw).getTime() : null
    },
    header: taskColumnLabel('dueTime'),
    meta: { title: taskColumnLabel('dueTime') },
    cell: ({ row }) => {
      const task = row.original
      const date = getTaskDueTimestamp(task)
      if (!date) {
        return h('span', { class: 'text-meta' }, t('dataTable.tasks.values.notSet'))
      }
      const { label, tooltip, pillClass } = formatTaskDueTimeDisplay(task, date, locale.value, t)
      return renderDueTimePill({ label, tooltip, pillClass })
    }
  },
  {
    id: 'customer',
    accessorKey: 'customer',
    header: taskColumnLabel('customer'),
    meta: { title: taskColumnLabel('customer') },
    size: 200,
    minSize: 160,
    maxSize: 280,
    cell: ({ row }) => {
      const task = row.original
      const city = getCustomerCity(task)
      return h('div', { class: 'flex flex-col min-w-0' }, [
        h('div', { class: 'text-content font-medium text-foreground truncate' }, task.customer?.name || '—'),
        h('div', { class: 'text-meta truncate' }, city || '—')
      ])
    }
  },
  ...(urgencyEnabled ? [urgencyColumn] : []),
  {
    id: 'type',
    accessorKey: 'type',
    header: taskColumnLabel('type'),
    meta: { title: taskColumnLabel('type') },
    cell: ({ row }) => {
      const task = row.original
      const typeClass = task.type === 'lead' ? 'bg-badge-green text-emerald-700' : 'bg-purple-50 text-purple-700'
      return h('span', {
        class: `inline-flex items-center px-2 py-0.5 rounded text-sm font-medium ${typeClass} w-fit`
      }, task.type === 'lead' ? 'Lead' : 'Opportunity')
    }
  },
  {
    id: 'requestStatus',
    accessorKey: 'status',
    header: taskColumnLabel('requestStatus'),
    meta: { title: taskColumnLabel('requestStatus') },
    cell: ({ row }) => {
      const task = row.original
      const tableStatus = getTaskTableStatus(task)
      const stageClass = getTaskTableStatusBadgeClass(tableStatus)
      const label = translateTaskTableStatus(tableStatus, t)
      return h('span', {
        class: `inline-flex items-center px-2 py-0.5 rounded text-sm font-medium ${stageClass} w-fit`
      }, label)
    }
  },
  {
    id: 'vehicle',
    accessorKey: 'carInfo',
    header: taskColumnLabel('vehicle'),
    meta: { title: taskColumnLabel('vehicle') },
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
    header: taskColumnLabel('vin'),
    meta: { title: taskColumnLabel('vin') },
    cell: ({ row }) => {
      const task = row.original
      const vehicle = task.type === 'lead' ? task.requestedCar : (task.vehicle || task.requestedCar)
      const vin = vehicle?.vin ?? task.requestedCar?.vin
      if (!vin) return h('span', { class: 'text-meta' }, '—')
      return h('div', { class: 'text-meta text-sm truncate font-mono min-w-0' }, vin)
    }
  },
  {
    id: 'requestMessage',
    accessorKey: 'requestMessage',
    header: taskColumnLabel('requestMessage'),
    meta: { title: taskColumnLabel('requestMessage') },
    cell: ({ row }) => {
      const snippet = getRequestMessageSnippet(row.original)
      return h('span', { class: 'text-meta truncate max-w-32 inline-block' }, snippet)
    }
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: taskColumnLabel('createdAt'),
    meta: { title: taskColumnLabel('createdAt') },
    cell: ({ row }) => {
      const task = row.original
      if (!task.createdAt) return h('span', { class: 'text-meta' }, '—')
      const { label, tooltip } = formatTaskCreatedAtDisplay(task.createdAt, locale.value, t)
      return renderTaskDateLabel({
        label,
        tooltip,
        className: 'text-meta text-foreground'
      })
    }
  },
  {
    id: 'contactAttempts',
    accessorKey: 'contactAttempts',
    accessorFn: (row) => row.contactAttempts?.length ?? 0,
    header: taskColumnLabel('attempts'),
    meta: { title: taskColumnLabel('attempts') },
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
        h('span', { class: 'mk-attempts-progress-text text-sm font-medium text-foreground' }, `${attempts}/${max}`)
      ])
    }
  },
  {
    id: 'source',
    accessorKey: 'source',
    header: taskColumnLabel('source'),
    meta: { title: taskColumnLabel('source') },
    cell: ({ row }) => {
      const task = row.original
      const main = task.source || '—'
      const details = task.sourceDetails ? ` ${task.sourceDetails}` : ''
      const badge = task.taskStatusBadge
      return h('div', { class: 'flex flex-col gap-1 min-w-0' }, [
        h('span', { class: 'text-meta' }, `${main}${details}`.trim()),
        ...(badge ? [h('span', {
          class: 'inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-emerald-100 text-emerald-700 w-fit'
        }, badge)] : [])
      ])
    }
  },
  {
    id: 'assignee',
    accessorKey: 'assignee',
    header: taskColumnLabel('assignee'),
    meta: { title: taskColumnLabel('assignee') },
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
    header: taskColumnLabel('status'),
    meta: { title: taskColumnLabel('status') },
    cell: ({ row }) => {
      const task = row.original
      const tableStatus = getTaskTableStatus(task)
      const stageClass = getTaskTableStatusBadgeClass(tableStatus)
      const label = translateTaskTableStatus(tableStatus, t)
      return h('span', {
        class: `inline-flex items-center px-2 py-0.5 rounded text-sm font-medium ${stageClass} w-fit`
      }, label)
    }
  }
  ]
  })

// Filter → sort → paginate for DataTable - maps filter keys to row values (aligned with columns)
const getTaskFilterValue = (row, key) => {
  if (key === 'nextAction') {
    if (getTaskTableStatus(row) === TASK_TABLE_STATUS.CLOSED) return ''
    return getTaskNextActionDisplay(row) ?? ''
  }
  if (key === 'taskType') {
    return getTaskTypeCode(row) ?? ''
  }
  if (key === 'requestedCarBrand') {
    const car = row.type === 'lead' ? row.requestedCar : (row.vehicle || row.requestedCar)
    return car?.brand
  }
  if (key === 'status') {
    return getTaskTableStatus(row)
  }
  if (key === 'assignee') {
    const val = row.assignee
    return val || '__unassigned__'
  }
  if (key === 'dueDate' || key === 'nextActionDue') {
    const raw = getTaskDueTimestamp(row)
    return raw ? new Date(raw).getTime() : null
  }
  if (key === 'contactAttempts') {
    return row.contactAttempts?.length ?? 0
  }
  return getNestedProperty(row, key)
}

function getDueDateSearchLabel(row) {
  const raw = getTaskDueTimestamp(row)
  if (!raw) return null
  const { label } = formatTaskDueTimeDisplay(row, raw, locale.value, t)
  return label
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
    const urgencyEnabled = settingsStore.getSetting('urgencyEnabled') === true
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
      getTaskNextActionDisplay(row),
      getTaskTypeCode(row),
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

onMounted(() => {
  isTableMounted = true
})

onUnmounted(() => {
  isTableMounted = false
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
    if (!isTableMounted) return
    const targetId = currentTaskId || highlightId
    const tableScrollContainer = datatableShellRef.value?.tableScrollContainer
    if (!targetId || !tableScrollContainer) return
    const idx = sortedData.value.findIndex((t) => t.compositeId === targetId)
    if (idx === -1) return
    const pageSize = pagination.value.pageSize || DEFAULT_TABLE_PAGE_SIZE
    const pageIndex = Math.floor(idx / pageSize)
    if (pagination.value.pageIndex !== pageIndex) {
      pagination.value = { ...pagination.value, pageIndex }
    }
    await nextTick()
    if (!isTableMounted) return
    const scrollRoot =
      tableScrollContainer.querySelector('[data-slot="frame-panel"]') ?? tableScrollContainer
    const rows = tableScrollContainer.querySelectorAll('tbody tr')
    const rowIndexOnPage = idx % pageSize
    const row = rows[rowIndexOnPage]
    if (row && scrollRoot.contains(row)) {
      row.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  },
  { immediate: true, flush: 'post' }
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

