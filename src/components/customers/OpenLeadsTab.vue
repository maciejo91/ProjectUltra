<template>
  <DataTableWithUnifiedSearch
    active-tab="open-leads"
    placeholder="Search leads..."
    :pagination="pagination"
    :assignee-options="assigneeOptions"
    :volvo-model-options="volvoModelOptions"
    :request-type-options="requestTypeOptions"
    :status-options="leadsStatusOptions"
    :source-options="leadsSourceOptions"
    @update:global-filter="globalFilter = $event"
    @update:column-filters="columnFilters = $event"
    @update:pagination="pagination = $event"
    @wrapper-click="onTableContainerClick"
  >
      <DataTable 
        :data="paginatedData" 
        :columns="columns"
        :meta="tableMeta"
        @row-click="handleRowClick"
        :columnFiltersOptions="{
          filterDefs: filterDefinitions
        }"
        v-model:pagination="pagination"
        v-model:sorting="sorting"
        v-model:columnFilters="columnFilters"
        :paginationOptions="{
          rowCount: totalFilteredCount
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
              <div class="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-blue-600 text-white text-sm font-medium">
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
  </DataTableWithUnifiedSearch>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Inbox, Trash2, X } from 'lucide-vue-next'
import { DataTable } from '@motork/component-library/future/components'
import { Button } from '@motork/component-library/future/primitives'
import DataTableWithUnifiedSearch from '@/components/shared/layout/DataTableWithUnifiedSearch.vue'
import { useLeadsStore } from '@/stores/leads'
import { formatDueDate, formatDeadlineFull, getDeadlineStatus } from '@/utils/formatters'
import { useCustomersTable } from '@/composables/useCustomersTable'
import { useTableRowSelection } from '@/composables/useTableRowSelection'
import { useTableRowClick } from '@/composables/useTableRowClick'
import { useDataTableData } from '@/composables/useDataTableData'

const emit = defineEmits(['row-click'])

const leadsStore = useLeadsStore()

const showDisqualified = ref(false)

// Row selection
const { rowSelection, selectedCount, hasSelection, getSelectedRows, clearSelection } = useTableRowSelection((row) => row.id)

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

const getStatusClass = (status) => {
  const statusMap = {
    'Valid - to be called back': 'bg-emerald-100 text-emerald-700',
    'To be called back': 'bg-purple-100 text-purple-700',
    'Not valid': 'bg-rose-100 text-rose-600',
    'Qualified': 'bg-muted text-muted-foreground',
    'Not interested': 'bg-rose-100 text-rose-600',
    'Open': 'bg-blue-100 text-blue-700'
  }
  return statusMap[status] || 'bg-muted text-muted-foreground'
}

const rows = computed(() => {
  let filteredLeads = leadsStore.leads
  if (showDisqualified.value) {
    filteredLeads = leadsStore.leads.filter(lead => lead.isDisqualified === true)
  } else {
    filteredLeads = leadsStore.leads.filter(lead => !lead.isDisqualified)
  }
  
  return filteredLeads.map((lead) => ({
    id: `lead-${lead.id}`,
    stageKey: 'open-leads',
    customer: lead.customer?.name || 'Unknown',
    email: lead.customer?.email || '',
    initials: lead.customer?.initials || lead.customer?.name?.slice(0,2).toUpperCase() || '?',
    nextAction: formatDueDate(lead.nextActionDue) || 'No due date',
    nextActionFull: formatDeadlineFull(lead.nextActionDue),
    deadlineStatus: getDeadlineStatus(lead.nextActionDue),
    car: `${lead.requestedCar?.brand || ''} ${lead.requestedCar?.model || ''}`.trim() || 'N/A',
    carStatus: lead.requestedCar?.stockDays !== undefined && lead.requestedCar?.stockDays !== null ? 'In Stock' : 'Out of Stock',
    carStatusClass: lead.requestedCar?.stockDays !== undefined && lead.requestedCar?.stockDays !== null ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground',
    requestType: lead.requestedCar?.requestType || 'Quotation',
    source: lead.source || 'Marketing',
    assignee: lead.assignee,
    assigneeInitials: lead.assignee ? lead.assignee.slice(0,2).toUpperCase() : 'NA',
    createdAt: formatDate(lead.createdAt),
    lastActivity: formatDate(lead.lastActivity),
    status: lead.status,
    statusClass: getStatusClass(lead.status),
    priority: lead.priority || 'Normal'
  }))
})

const handleRowClick = (row) => {
  if (row.id.startsWith('lead-')) {
    emit('row-click', row)
  }
}

const activeTab = ref('open-leads')
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
const volvoModelOptions = [
  { value: 'XC90', label: 'XC90' },
  { value: 'XC60', label: 'XC60' },
  { value: 'XC40', label: 'XC40' },
  { value: 'ID.4', label: 'ID.4' },
  { value: 'ID.5', label: 'ID.5' },
  { value: 'Golf', label: 'Golf' },
  { value: 'Tiguan', label: 'Tiguan' }
]
const leadsStatusOptions = computed(() => {
  const def = filterDefinitions.value?.find(d => d.key === 'status')
  return def?.options?.map(o => ({ value: o.value, label: o.label })) ?? []
})
const leadsSourceOptions = computed(() => {
  const def = filterDefinitions.value?.find(d => d.key === 'source')
  return def?.options?.map(o => ({ value: o.value, label: o.label })) ?? []
})

// Bulk delete handler
const handleBulkDelete = () => {
  const selectedRows = getSelectedRows(sortedData.value)
  
  if (selectedRows.length === 0) return
  
  if (!confirm(`Are you sure you want to delete ${selectedRows.length} ${selectedRows.length === 1 ? 'lead' : 'leads'}?`)) {
    return
  }
  
  selectedRows.forEach(row => {
    const leadId = row.id.replace('lead-', '')
    leadsStore.deleteLead(leadId)
  })
  
  clearSelection()
}

// Load data on mount
onMounted(async () => {
  await leadsStore.fetchLeads()
})
</script>

