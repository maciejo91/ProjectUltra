<template>
  <!-- Loading Skeleton -->
  <div v-if="loading" class="p-4">
    <div class="space-y-3">
      <div v-for="n in 5" :key="`row-${n}`" class="flex items-center gap-4">
        <div class="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
        <div class="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
        <div class="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
        <div class="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
        <div class="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
        <div class="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
      </div>
    </div>
  </div>
  
  <!-- Actual Content -->
  <div v-else>
    <div class="mb-1">
    <UnifiedSearchBar
      active-tab="reports"
      placeholder="Search team performance..."
      :pagination="pagination"
      @update:globalFilter="globalFilter = $event"
      @update:columnFilters="columnFilters = $event"
      @update:pagination="pagination = $event"
    />
    </div>
    <div class="data-table-inner table-search-wrapper">
    <DataTable 
      :data="paginatedData" 
      :columns="columns"
      :pagination="pagination"
      :sorting="sorting"
      :pagination-options="{
        rowCount: totalFilteredCount,
        pageSizeOptions: [10, 20, 50]
      }"
      @update:pagination="pagination = $event"
      @update:sorting="sorting = $event"
      class="h-full"
    >
    <template #toolbar>
      <div class="flex items-center gap-2">
        <Trophy :size="16" class="text-foreground" />
        <h3 class="text-lg font-medium text-foreground leading-5">Best performers</h3>
      </div>
    </template>
  </DataTable>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, h } from 'vue'
import { Trophy } from 'lucide-vue-next'
import { DataTable } from '@motork/component-library/future/components'
import { Avatar, AvatarFallback } from '@motork/component-library/future/primitives'
import UnifiedSearchBar from '@/components/shared/UnifiedSearchBar.vue'
import { useDataTableData } from '@/composables/useDataTableData'

const props = defineProps({
  teamMembers: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// DataTable state management
const pagination = ref({
  pageIndex: 0,
  pageSize: 10
})

const sorting = ref([{ id: 'leads', desc: true }])
const globalFilter = ref('')
const columnFilters = ref([])
const filterDefsRef = ref([])

const getInitials = (name) => {
  if (!name) return 'U'
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return parts[0][0].toUpperCase()
}

// DataTable columns configuration
const columns = computed(() => [
  {
    accessorKey: 'name',
    header: () => 'Name',
    meta: { title: 'Name' },
    cell: ({ row }) => {
      const member = row.original
      return h('div', { class: 'flex items-center gap-3' }, [
        h(Avatar, { class: 'h-8 w-8' }, {
          default: () => h(AvatarFallback, 
            { class: 'bg-greys-300 text-foreground text-sm' },
            () => getInitials(member.name)
          )
        }),
        h('span', { class: 'text-sm font-medium text-foreground' }, member.name)
      ])
    }
  },
  {
    accessorKey: 'leads',
    header: () => 'Leads',
    meta: { title: 'Leads' },
    cell: ({ row }) => {
      return h('div', { class: 'text-sm text-foreground' }, row.original.leads)
    }
  },
  {
    accessorKey: 'qualifiedLeads',
    header: () => 'Qualified leads (%)',
    meta: { title: 'Qualified leads (%)' },
    cell: ({ row }) => {
      const member = row.original
      return h('div', { class: 'text-sm text-foreground' }, [
        h('span', member.qualifiedLeads),
        h('span', { class: 'text-muted-foreground text-sm ml-1' }, `(${member.qualifiedPercentage}%)`)
      ])
    }
  },
  {
    accessorKey: 'opportunities',
    header: () => 'Opportunities',
    meta: { title: 'Opportunities' },
    cell: ({ row }) => {
      return h('div', { class: 'text-sm text-foreground' }, row.original.opportunities)
    }
  },
  {
    accessorKey: 'contracts',
    header: () => 'Contracts',
    meta: { title: 'Contracts' },
    cell: ({ row }) => h('div', { class: 'text-sm text-foreground' }, row.original.contracts)
  },
  {
    accessorKey: 'conversionRate',
    header: () => 'Conversion rate',
    meta: { title: 'Conversion rate' },
    cell: ({ row }) => h('div', { class: 'text-sm text-foreground' }, `${row.original.conversionRate}%`)
  }
])

// Filter (global + column), sort, paginate
const searchableFields = (row) => [
  row.name,
  row.leads != null ? String(row.leads) : null,
  row.qualifiedLeads != null ? String(row.qualifiedLeads) : null,
  row.qualifiedPercentage != null ? String(row.qualifiedPercentage) : null,
  row.opportunities != null ? String(row.opportunities) : null,
  (row.contracts ?? row.won) != null ? String(row.contracts ?? row.won) : null,
]
const enrichedTeamMembers = computed(() =>
  (props.teamMembers || []).map((m) => {
    const contracts = m.contracts ?? m.won ?? 0
    const conversionRate = m.leads > 0 ? parseFloat(((contracts / m.leads) * 100).toFixed(1)) : 0
    return { ...m, contracts, conversionRate }
  })
)

const { paginatedData, totalFilteredCount } = useDataTableData({
  rawData: enrichedTeamMembers,
  columns,
  globalFilter,
  columnFilters,
  sorting,
  pagination,
  filterDefs: filterDefsRef,
  searchableFields,
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

/* Hide built-in DataTable search row only (UnifiedSearchBar is above) */
.data-table-inner.table-search-wrapper :deep([data-slot="table-search"]),
.data-table-inner.table-search-wrapper :deep(div:has(> input[placeholder*="Search"])),
.data-table-inner.table-search-wrapper :deep(div:has(> input[type="search"])) {
  display: none !important;
}

/* Search input - white background like reference */
:deep(input[type="search"]),
:deep(input[placeholder*="Search"]),
:deep([data-slot="table-search"] input) {
  background-color: white !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
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

