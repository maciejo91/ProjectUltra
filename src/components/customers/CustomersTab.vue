<template>
  <div class="mb-8">
    <div class="bg-white">
      <div class="mb-1">
      <UnifiedSearchBar
        active-tab="customers"
        placeholder="Search customers..."
        :pagination="pagination"
        :source-options="customersSourceOptions"
        :account-type-options="accountTypeOptions"
        @update:globalFilter="globalFilter = $event"
        @update:columnFilters="columnFilters = $event"
        @update:pagination="pagination = $event"
      />
      </div>
      <div
        class="data-table-inner table-search-wrapper"
        :class="{ 'hide-table-filter': !hasActiveFilters }"
        @click="onTableContainerClick"
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
import { useCustomersStore } from '@/stores/customers'
import { useLeadsStore } from '@/stores/leads'
import { useOpportunitiesStore } from '@/stores/opportunities'
import { useCustomersTable } from '@/composables/useCustomersTable'
import { useTableRowSelection } from '@/composables/useTableRowSelection'
import { useTableRowClick } from '@/composables/useTableRowClick'
import { useDataTableData, getNestedProperty } from '@/composables/useDataTableData'

const customersStore = useCustomersStore()
const leadsStore = useLeadsStore()
const opportunitiesStore = useOpportunitiesStore()

const contactFilterType = ref('all') // 'all', 'contacts', 'accounts'

// Row selection
const { rowSelection, selectedCount, hasSelection, getSelectedRows, clearSelection } = useTableRowSelection((row) => row.id)

const emit = defineEmits(['row-click'])

// DataTable state (local to this tab)
const pagination = ref({ pageIndex: 0, pageSize: 10 })
const globalFilter = ref('')
const columnFilters = ref([])
const sorting = ref([])

// Helper to extract location from address
const getLocation = (address) => {
  if (!address) return 'N/A'
  const parts = address.split(',')
  if (parts.length > 1) {
    const cityPart = parts[parts.length - 1].trim()
    const city = cityPart.replace(/^\d+\s*/, '').trim()
    return city || address
  }
  return address
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const d = new Date(dateString)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const rows = computed(() => {
  let filteredCustomers = customersStore.customers
  if (contactFilterType.value === 'contacts') {
    filteredCustomers = customersStore.contacts
  } else if (contactFilterType.value === 'accounts') {
    filteredCustomers = customersStore.accounts
  }
  
  return filteredCustomers.map((customer) => ({
    id: `customer-${customer.id}`,
    stageKey: 'customers',
    customer: customer.name,
    accountType: customer.company && customer.company !== '' ? 'Account' : 'Contact',
    telephone: customer.phone,
    location: getLocation(customer.address),
    interestScore: customer.interestScore ?? null,
    createdAt: formatDate(customer.createdAt),
    name: customer.name,
    source: customer.source || 'N/A',
    leads: leadsStore.leads.filter((l) => l.customerId === customer.id).length,
    opportunities: opportunitiesStore.opportunities.filter((opp) => opp.customerId === customer.id).length,
    initials: customer.initials || customer.name.slice(0, 2).toUpperCase(),
    type: customer.company && customer.company !== '' ? 'account' : 'contact',
    customerId: customer.id
  }))
})

const handleRowClick = (row) => {
  if (row.stageKey === 'customers') {
    emit('row-click', row)
  }
}

const activeTab = ref('customers')
const { columns, filterDefinitions, tableMeta } = useCustomersTable(activeTab, handleRowClick)

const getCustomerFilterValue = (row, key) => {
  if (key === 'accountType') return row.accountType
  if (key === 'source') return row.source
  return getNestedProperty(row, key)
}
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
    row.name,
    row.telephone,
    row.location,
    row.interestScore != null ? String(row.interestScore) : null,
    row.accountType,
    row.createdAt,
    row.leads != null ? String(row.leads) : null,
    row.opportunities != null ? String(row.opportunities) : null
  ],
  getFilterValue: getCustomerFilterValue
})

const { onTableContainerClick } = useTableRowClick(paginatedData, handleRowClick)

const customersSourceOptions = computed(() => {
  const def = filterDefinitions.value?.find(d => d.key === 'source')
  return def?.options?.map(o => ({ value: o.value, label: o.label })) ?? []
})

const accountTypeOptions = computed(() => {
  const def = filterDefinitions.value?.find(d => d.key === 'accountType')
  return def?.options?.map(o => ({ value: o.value, label: o.label })) ?? []
})

const hasActiveFilters = computed(() => {
  const hasColumnFilters = Array.isArray(columnFilters.value) && columnFilters.value.length > 0
  const hasSearch = Boolean(globalFilter.value && String(globalFilter.value).trim())
  return hasColumnFilters || hasSearch
})

// Bulk delete handler
const handleBulkDelete = () => {
  const selectedRows = getSelectedRows(sortedData.value)
  
  if (selectedRows.length === 0) return
  
  if (!confirm(`Are you sure you want to delete ${selectedRows.length} ${selectedRows.length === 1 ? 'customer' : 'customers'}?`)) {
    return
  }
  
  selectedRows.forEach(row => {
    const customerId = row.id.replace('customer-', '')
    const customer = customersStore.customers.find(c => c.id === parseInt(customerId))
    const customerType = customer?.type || (customer?.company ? 'account' : 'contact')
    customersStore.removeCustomer(customerId, customerType)
  })
  
  clearSelection()
}

// Load data on mount
onMounted(async () => {
  await customersStore.fetchCustomers()
  await leadsStore.fetchLeads()
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

/* Hide filter row when no filter is applied */
.hide-table-filter :deep([data-slot="table-filter"]) {
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

