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
  
  <div v-else>
    <DataTableWithUnifiedSearch
      active-tab="reports"
      :placeholder="t('dataTable.searchReports')"
      :pagination="pagination"
      :include-margin-bottom="false"
      @update:global-filter="globalFilter = $event"
      @update:column-filters="columnFilters = $event"
      @update:pagination="pagination = $event"
    >
      <DataTable
        :data="paginatedData"
        :columns="columns"
        v-model:pagination="pagination"
        v-model:sorting="sorting"
        v-model:column-filters="columnFilters"
        :column-filters-options="{
          filterDefs: filterDefinitions
        }"
        :pagination-options="{
          rowCount: totalFilteredCount,
          pageSizeOptions: [10, 20, 50]
        }"
        class="h-full"
      >
        <template #toolbar>
          <div class="flex items-center gap-2">
            <Trophy :size="16" class="text-foreground" />
            <h3 class="text-lg font-medium text-foreground leading-5">{{ t('dataTable.reports.bestPerformers') }}</h3>
          </div>
        </template>
      </DataTable>
    </DataTableWithUnifiedSearch>
  </div>
</template>

<script setup>
import { ref, computed, h } from 'vue'
import { useI18n } from 'vue-i18n'
import { Trophy } from 'lucide-vue-next'
import { DataTable } from '@motork/component-library/future/components'
import { Avatar, AvatarFallback } from '@motork/component-library/future/primitives'
import DataTableWithUnifiedSearch from '@/components/shared/layout/DataTableWithUnifiedSearch.vue'
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

const { t } = useI18n()
const reportColumnLabel = (key) => t(`dataTable.reports.columns.${key}`)

// DataTable state management
const pagination = ref({
  pageIndex: 0,
  pageSize: 10
})

const sorting = ref([{ id: 'leads', desc: true }])
const globalFilter = ref('')
const columnFilters = ref([])

const numericRangeOperators = computed(() => [
  { value: 'between', label: t('dataTable.filters.operators.isBetween') },
  { value: 'gte', label: t('dataTable.filters.operators.isAtLeast') },
  { value: 'lte', label: t('dataTable.filters.operators.isAtMost') }
])

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
    header: () => reportColumnLabel('name'),
    meta: { title: reportColumnLabel('name') },
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
    header: () => reportColumnLabel('leads'),
    meta: { title: reportColumnLabel('leads') },
    cell: ({ row }) => {
      return h('div', { class: 'text-sm text-foreground' }, row.original.leads)
    }
  },
  {
    accessorKey: 'qualifiedLeads',
    header: () => reportColumnLabel('qualifiedLeadsPercent'),
    meta: { title: reportColumnLabel('qualifiedLeadsPercent') },
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
    header: () => reportColumnLabel('opportunities'),
    meta: { title: reportColumnLabel('opportunities') },
    cell: ({ row }) => {
      return h('div', { class: 'text-sm text-foreground' }, row.original.opportunities)
    }
  },
  {
    accessorKey: 'contracts',
    header: () => reportColumnLabel('contracts'),
    meta: { title: reportColumnLabel('contracts') },
    cell: ({ row }) => h('div', { class: 'text-sm text-foreground' }, row.original.contracts)
  },
  {
    accessorKey: 'conversionRate',
    header: () => reportColumnLabel('conversionRate'),
    meta: { title: reportColumnLabel('conversionRate') },
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

const filterDefinitions = computed(() => {
  const members = enrichedTeamMembers.value ?? []
  const nameOptions = [...new Set(members.map((m) => m.name).filter(Boolean))].sort()
  return [
    {
      key: 'name',
      label: reportColumnLabel('name'),
      type: 'multiselect',
      operators: [
        { value: 'in', label: t('dataTable.filters.operators.isAnyOf') },
        { value: 'notIn', label: t('dataTable.filters.operators.isNoneOf') }
      ],
      options: nameOptions.map((n) => ({ value: n, label: n }))
    },
    {
      key: 'leads',
      label: reportColumnLabel('leads'),
      type: 'inputrange',
      inputType: 'number',
      operators: numericRangeOperators.value
    },
    {
      key: 'qualifiedLeads',
      label: reportColumnLabel('qualifiedLeads'),
      type: 'inputrange',
      inputType: 'number',
      operators: numericRangeOperators.value
    },
    {
      key: 'opportunities',
      label: reportColumnLabel('opportunities'),
      type: 'inputrange',
      inputType: 'number',
      operators: numericRangeOperators.value
    },
    {
      key: 'contracts',
      label: reportColumnLabel('contracts'),
      type: 'inputrange',
      inputType: 'number',
      operators: numericRangeOperators.value
    },
    {
      key: 'conversionRate',
      label: reportColumnLabel('conversionRate'),
      type: 'inputrange',
      inputType: 'number',
      operators: numericRangeOperators.value
    }
  ]
})

const { paginatedData, totalFilteredCount } = useDataTableData({
  rawData: enrichedTeamMembers,
  columns,
  globalFilter,
  columnFilters,
  sorting,
  pagination,
  filterDefs: filterDefinitions,
  searchableFields,
})
</script>

