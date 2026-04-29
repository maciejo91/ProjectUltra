<template>
  <DataTableWithUnifiedSearch
    ref="datatableShellRef"
    active-tab="customers"
    placeholder="Search customers..."
    :pagination="pagination"
    :source-options="customersSourceOptions"
    :account-type-options="accountTypeOptions"
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
        v-model:rowSelection="rowSelection"
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
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { Inbox, Trash2, X } from 'lucide-vue-next'
import { DataTable } from '@motork/component-library/future/components'
import { Button } from '@motork/component-library/future/primitives'
import DataTableWithUnifiedSearch from '@/components/shared/layout/DataTableWithUnifiedSearch.vue'
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

// DataTable state (local to this tab) - default filters: Source, Account type
const pagination = ref({ pageIndex: 0, pageSize: 10 })
const globalFilter = ref('')
const columnFilters = ref([
  { id: 'source-1', field: 'source', value: '', operator: 'eq', pinned: true },
  { id: 'accountType-1', field: 'accountType', value: '', operator: 'eq', pinned: true }
])
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

const props = defineProps({
  highlightId: { type: String, default: '' }
})

const activeTab = ref('customers')
const datatableShellRef = ref(null)
const { columns, filterDefinitions, tableMeta: baseTableMeta } = useCustomersTable(activeTab, handleRowClick, { rows })

const isHighlighted = (row) => {
  const id = props.highlightId
  if (!id || !row?.id) return false
  return row.id === id
}
const tableMeta = computed(() => {
  const base = baseTableMeta.value
  const baseTr = base?.class?.tr
  return {
    ...base,
    class: {
      ...base?.class,
      tr: typeof baseTr === 'function'
        ? (row) => {
            const baseClasses = baseTr(row) || ''
            return isHighlighted(row?.original) ? `${baseClasses} bg-blue-50 border-l-4 border-l-blue-500` : baseClasses
          }
        : (row) => {
            const baseClasses = typeof baseTr === 'string' ? baseTr : 'cursor-pointer hover:bg-muted transition-colors border-black/5'
            return isHighlighted(row?.original) ? `${baseClasses} bg-blue-50 border-l-4 border-l-blue-500` : baseClasses
          }
    }
  }
})

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

watch(
  () => props.highlightId,
  async (id) => {
    const tableScrollContainer = datatableShellRef.value?.tableScrollContainer
    if (!id || !tableScrollContainer) return
    const idx = sortedData.value.findIndex(r => r.id === id)
    if (idx === -1) return
    const pageSize = pagination.value.pageSize || 10
    const pageIndex = Math.floor(idx / pageSize)
    if (pagination.value.pageIndex !== pageIndex) {
      pagination.value = { ...pagination.value, pageIndex }
    }
    await nextTick()
    const rows = tableScrollContainer.querySelectorAll('tbody tr')
    const rowIndexOnPage = idx % pageSize
    const rowEl = rows[rowIndexOnPage]
    if (rowEl) {
      rowEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  },
  { immediate: true }
)

defineExpose({ paginatedData })

const customersSourceOptions = computed(() => {
  const def = filterDefinitions.value?.find(d => d.key === 'source')
  return def?.options?.map(o => ({ value: o.value, label: o.label })) ?? []
})

const accountTypeOptions = computed(() => {
  const def = filterDefinitions.value?.find(d => d.key === 'accountType')
  return def?.options?.map(o => ({ value: o.value, label: o.label })) ?? []
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

