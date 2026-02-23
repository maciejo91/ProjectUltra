<template>
  <div class="mb-8">
    <div class="bg-white">
      <div class="mb-1">
        <UnifiedSearchBar
        active-tab="opportunities"
        placeholder="Search won..."
        :pagination="pagination"
        :assignee-options="assigneeOptions"
        :request-type-options="requestTypeOptions"
        :status-options="wonStatusOptions"
        :source-options="wonSourceOptions"
        @update:globalFilter="globalFilter = $event"
        @update:columnFilters="columnFilters = $event"
        @update:pagination="pagination = $event"
      />
      </div>
      <div class="data-table-inner table-search-wrapper" @click="onTableContainerClick">
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
        v-model:rowSelection="rowSelection"
        :paginationOptions="{
          rowCount: totalFilteredCount
        }"
        :globalFilterOptions="{
          debounce: 300,
          show: true
        }"
        class="h-full"
      >
        <template #empty-state>
          <div class="empty-state">
            <Inbox class="empty-state-icon w-8 h-8 shrink-0" />
            <p class="empty-state-text">No records found</p>
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Inbox, Trash2, X } from 'lucide-vue-next'
import { DataTable } from '@motork/component-library/future/components'
import { Button } from '@motork/component-library/future/primitives'
import UnifiedSearchBar from '@/components/shared/UnifiedSearchBar.vue'
import { useOpportunitiesStore } from '@/stores/opportunities'
import { formatDueDate, formatDeadlineFull, getDeadlineStatus } from '@/utils/formatters'
import { useCustomersTable } from '@/composables/useCustomersTable'
import { getDisplayStage } from '@/utils/stageMapper'
import { useTableRowSelection } from '@/composables/useTableRowSelection'
import { useTableRowClick } from '@/composables/useTableRowClick'
import { useDataTableData } from '@/composables/useDataTableData'

const opportunitiesStore = useOpportunitiesStore()

// Row selection
const { rowSelection, selectedCount, hasSelection, getSelectedRows, clearSelection } = useTableRowSelection((row) => row.id)

const emit = defineEmits(['row-click'])

// DataTable state (local to this tab)
const pagination = ref({ pageIndex: 0, pageSize: 10 })
const globalFilter = ref('')
const columnFilters = ref([])
const sorting = ref([])

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const d = new Date(dateString)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const rows = computed(() => {
  return opportunitiesStore.opportunities
    .filter(opp => opp.stage === 'Closed Won')
    .map((opp) => {
      const lastAppointment = opp.scheduledAppointment?.start || null
      return {
        id: `opp-${opp.id}`,
        stageKey: 'won',
        customer: opp.customer?.name || 'Unknown',
        email: opp.customer?.email || '',
        initials: opp.customer?.initials || opp.customer?.name?.slice(0,2).toUpperCase() || '?',
        nextAction: formatDueDate(opp.expectedCloseDate) || 'No due date',
        nextActionFull: formatDeadlineFull(opp.expectedCloseDate),
        deadlineStatus: getDeadlineStatus(opp.expectedCloseDate),
        car: `${opp.vehicle?.brand || ''} ${opp.vehicle?.model || ''}`.trim() || 'N/A',
        carStatus: opp.vehicle?.stockDays !== undefined && opp.vehicle?.stockDays !== null ? 'In Stock' : 'Out of Stock',
        carStatusClass: opp.vehicle?.stockDays !== undefined && opp.vehicle?.stockDays !== null ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground',
        requestType: opp.requestType || 'Opportunity',
        source: opp.source || 'Marketing',
        assignee: opp.assignee,
        assigneeInitials: opp.assignee ? opp.assignee.slice(0,2).toUpperCase() : 'NA',
        createdAt: formatDate(opp.createdAt),
        lastAppointment: lastAppointment ? formatDate(lastAppointment) : 'N/A',
        status: getDisplayStage(opp, 'opportunity'),
        statusClass: 'bg-emerald-100 text-emerald-700',
        priority: opp.priority || 'Normal'
      }
    })
})


const handleRowClick = (row) => {
  if (row.id.startsWith('opp-')) {
    emit('row-click', row)
  }
}

const activeTab = ref('won')
const { columns, filterDefinitions, tableMeta } = useCustomersTable(activeTab, handleRowClick, { rows })

const { paginatedData, sortedData, totalFilteredCount } = useDataTableData({
  rawData: rows,
  columns,
  globalFilter,
  columnFilters,
  sorting,
  pagination,
  filterDefs: filterDefinitions,
  searchableFields: (row) => [
    row.customer,
    row.email,
    row.status,
    row.car,
    row.carStatus,
    row.requestType,
    row.source,
    row.assignee,
    row.nextActionFull ?? row.nextAction,
    row.createdAt,
    row.lastActivity
  ]
})

const { onTableContainerClick } = useTableRowClick(paginatedData, handleRowClick)

const assigneeOptions = computed(() => {
  const names = [...new Set(rows.value.map(r => r.assignee).filter(Boolean))]
  return names.map(name => ({ value: name, label: name }))
})
const requestTypeOptions = [
  { value: 'Test Drive', label: 'Test Drive' },
  { value: 'Quotation', label: 'Quotation' },
  { value: 'Generic sales', label: 'Generic sales' }
]
const wonStatusOptions = computed(() => {
  const def = filterDefinitions.value?.find(d => d.key === 'status')
  return def?.options?.map(o => ({ value: o.value, label: o.label })) ?? []
})
const wonSourceOptions = computed(() => {
  const def = filterDefinitions.value?.find(d => d.key === 'source')
  return def?.options?.map(o => ({ value: o.value, label: o.label })) ?? []
})

// Bulk delete handler
const handleBulkDelete = () => {
  const selectedRows = getSelectedRows(sortedData.value)
  
  if (selectedRows.length === 0) return
  
  if (!confirm(`Are you sure you want to delete ${selectedRows.length} ${selectedRows.length === 1 ? 'opportunity' : 'opportunities'}?`)) {
    return
  }
  
  selectedRows.forEach(row => {
    const oppId = row.id.replace('opp-', '')
    opportunitiesStore.deleteOpportunity(oppId)
  })
  
  clearSelection()
}

// Load data on mount
onMounted(async () => {
  await opportunitiesStore.fetchOpportunities()
})
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

/* Hide built-in DataTable search row only (UnifiedSearchBar is used above the table) */
.data-table-inner.table-search-wrapper :deep([data-slot="table-search"]),
.data-table-inner.table-search-wrapper :deep(div:has(> input[placeholder*="Search"])),
.data-table-inner.table-search-wrapper :deep(div:has(> input[type="search"])) {
  display: none !important;
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

