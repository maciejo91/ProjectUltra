<template>
  <div class="page-container relative flex flex-col overflow-hidden h-full bg-surface">
    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide min-h-0">
        <div class="bg-white mb-8">
          <div class="flex flex-wrap items-center gap-2 py-2 mb-4">
            <TransitionGroup
              tag="div"
              name="chip-move"
              class="outcome-toggle-group flex flex-wrap gap-3"
            >
              <Toggle
                v-for="chip in orderedFilterChips"
                :key="chip.key"
                variant="outline"
                :model-value="selectedSegment === chip.key"
                :aria-pressed="selectedSegment === chip.key"
                class="outcome-toggle-item rounded-sm"
                @update:model-value="(p) => p && (selectedSegment = chip.key)"
              >
                <span class="flex items-center gap-2">
                  <span>{{ chip.label }} ({{ chip.count }})</span>
                  <button
                    type="button"
                    class="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    :aria-label="pinnedSegmentKey === chip.key ? 'Unpin' : 'Pin to front'"
                    @click.stop="togglePin(chip.key)"
                  >
                    <PinOff v-if="pinnedSegmentKey === chip.key" class="size-3.5" aria-hidden />
                    <Pin v-else class="size-3.5" aria-hidden />
                  </button>
                </span>
              </Toggle>
            </TransitionGroup>
          </div>
          <div class="mb-1">
            <UnifiedSearchBar
              active-tab="requests"
              full-width
              placeholder="Search requests..."
              :pagination="pagination"
              :assignee-options="assigneeOptions"
              :status-options="statusOptions"
              :source-options="sourceOptions"
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
                placeholder: 'Search requests...',
                show: true
              }"
              class="h-full"
            >
              <template #empty-state>
                <div class="empty-state">
                  <FileText class="empty-state-icon w-8 h-8 shrink-0 text-muted-foreground" />
                  <p class="empty-state-text text-muted-foreground">{{ emptyStateText }}</p>
                </div>
              </template>
              <template #batch-action-bar>
                <div v-if="hasSelection" class="flex items-center gap-2">
                  <div class="flex items-center gap-2 mr-1">
                    <div class="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-blue-600 text-white text-fluid-xs font-medium">
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

  </div>
</template>

<script setup>
import { ref, computed, h, watch, onUnmounted, onMounted, nextTick, TransitionGroup } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FileText, Pin, PinOff, Trash2, X } from 'lucide-vue-next'
import { DataTable } from '@motork/component-library/future/components'
import { Button, Toggle } from '@motork/component-library/future/primitives'
import UnifiedSearchBar from '@/components/shared/UnifiedSearchBar.vue'
import { useTableRowClick } from '@/composables/useTableRowClick'
import { useRequestsList, SEGMENT_KEYS } from '@/composables/useRequestsList'
import { useDataTableData, getNestedProperty } from '@/composables/useDataTableData'
import { useTasksTableFilters } from '@/composables/useTasksTableFilters'
import { useTableRowSelection } from '@/composables/useTableRowSelection'
import { getStageBadgeClass } from '@/utils/formatters'
import { getDisplayStage } from '@/utils/stageMapper'
import { useUsersStore } from '@/stores/users'
import { useLeadsStore } from '@/stores/leads'
import { useOpportunitiesStore } from '@/stores/opportunities'

const {
  filteredList,
  counts,
  selectedSegment,
  loading,
  SEGMENT_KEYS: SK
} = useRequestsList()

const REQUESTS_PINNED_SEGMENT_KEY = 'project-ultra-requests-pinned-segment'
const selectableSegmentKeys = Object.values(SK).filter(k => k !== SK.ALL)
const getStoredPinnedSegment = () => {
  try {
    const stored = localStorage.getItem(REQUESTS_PINNED_SEGMENT_KEY)
    return stored && selectableSegmentKeys.includes(stored) ? stored : ''
  } catch {
    return ''
  }
}
const pinnedSegmentKey = ref(getStoredPinnedSegment())
watch(pinnedSegmentKey, (key) => {
  try {
    if (key) {
      localStorage.setItem(REQUESTS_PINNED_SEGMENT_KEY, key)
    } else {
      localStorage.removeItem(REQUESTS_PINNED_SEGMENT_KEY)
    }
  } catch {
    // ignore
  }
})

const route = useRoute()
const router = useRouter()
const usersStore = useUsersStore()
const leadsStore = useLeadsStore()
const opportunitiesStore = useOpportunitiesStore()

const tableScrollContainer = ref(null)
const highlightId = computed(() => route.query.highlight || null)

const { rowSelection, selectedCount, hasSelection, getSelectedRows, clearSelection } = useTableRowSelection((row) => row.compositeId)

const pagination = ref({ pageIndex: 0, pageSize: 50 })
const sorting = ref([])
const globalFilter = ref('')
const columnFilters = ref([
  { id: 'type-1', field: 'type', value: '', operator: 'eq', pinned: true },
  { id: 'status-1', field: 'status', value: [], operator: 'in', pinned: true },
  { id: 'assignee-1', field: 'assignee', value: '', operator: 'eq', pinned: true }
])
const columnVisibility = ref({
  source: true,
  assignee: true
})

const { filterDefinitions } = useTasksTableFilters({
  showTypeFilter: computed(() => true),
  tasks: filteredList
})

const assigneeOptions = computed(() => {
  const def = filterDefinitions.value?.find(d => d.key === 'assignee')
  return def?.options ?? []
})
const statusOptions = computed(() => {
  const def = filterDefinitions.value?.find(d => d.key === 'status')
  return def?.options ?? []
})
const sourceOptions = computed(() => {
  const def = filterDefinitions.value?.find(d => d.key === 'source')
  return def?.options ?? []
})

// Show filter row when we have filters (Type, Status, Assignee) or search
const hasActiveFilters = computed(() => {
  const hasColumnFilters = Array.isArray(columnFilters.value) && columnFilters.value.length > 0
  const hasSearch = Boolean(globalFilter.value && String(globalFilter.value).trim())
  return hasColumnFilters || hasSearch
})

const filterChips = computed(() => [
  { key: SK.NEW_LEADS, label: 'New Leads', count: counts.value[SK.NEW_LEADS] },
  { key: SK.OPEN_OPPORTUNITIES, label: 'Opportunities Qualified', count: counts.value[SK.OPEN_OPPORTUNITIES] },
  { key: SK.IN_NEGOTIATION, label: 'Opportunities in negotiation', count: counts.value[SK.IN_NEGOTIATION] },
  { key: SK.WON, label: 'Opportunities won', count: counts.value[SK.WON] },
  { key: SK.LOST, label: 'Opportunities lost', count: counts.value[SK.LOST] }
])

const orderedFilterChips = computed(() => {
  const chips = filterChips.value
  if (!pinnedSegmentKey.value) return chips
  const pinned = chips.find((c) => c.key === pinnedSegmentKey.value)
  if (!pinned) return chips
  return [pinned, ...chips.filter((c) => c.key !== pinnedSegmentKey.value)]
})

function togglePin(key) {
  pinnedSegmentKey.value = pinnedSegmentKey.value === key ? '' : key
}

const emptyStateText = computed(() => {
  if (selectedSegment.value === SK.NEW_LEADS) return 'No New Leads'
  if (selectedSegment.value === SK.OPEN_OPPORTUNITIES) return 'No Opportunities Qualified'
  if (selectedSegment.value === SK.IN_NEGOTIATION) return 'No Opportunities in negotiation'
  if (selectedSegment.value === SK.WON) return 'No Opportunities won'
  if (selectedSegment.value === SK.LOST) return 'No Opportunities lost'
  return 'No requests'
})

function getCustomerName(row) {
  const c = row.customer
  if (c?.name) return c.name
  if (c?.email) return c.email.split('@')[0] || '—'
  return '—'
}

function getAssigneeDisplay(row) {
  const name = row.assignee
  if (!name) return 'Unassigned'
  const user = usersStore.users.find(u => u.name === name)
  if (!user) return name
  const line2 = [user.team, user.dealership].filter(Boolean).join(' - ')
  return line2 ? `${name} (${line2})` : name
}

const columns = computed(() => [
  {
    id: 'type',
    accessorKey: 'type',
    header: 'Type',
    meta: { title: 'Type' },
    cell: ({ row }) => {
      const r = row.original
      const typeClass = r.type === 'lead' ? 'bg-badge-green text-emerald-700' : 'bg-purple-50 text-purple-700'
      return h('span', {
        class: `inline-flex items-center px-2 py-0.5 rounded text-fluid-xs font-semibold ${typeClass} w-fit`
      }, r.type === 'lead' ? 'Lead' : 'Opportunity')
    }
  },
  {
    id: 'customer',
    accessorKey: 'customer',
    header: 'Customer',
    meta: { title: 'Customer' },
    cell: ({ row }) => h('span', { class: 'text-foreground' }, getCustomerName(row.original))
  },
  {
    id: 'displayStage',
    accessorKey: 'displayStage',
    header: 'Stage',
    meta: { title: 'Stage' },
    cell: ({ row }) => {
      const stage = row.original.displayStage
      if (!stage) return h('span', { class: 'text-muted-foreground' }, '—')
      const stageClass = getStageBadgeClass(stage)
      return h('span', {
        class: `inline-flex items-center px-2 py-0.5 rounded text-fluid-xs font-semibold ${stageClass} w-fit`
      }, stage)
    }
  },
  {
    id: 'source',
    accessorKey: 'source',
    header: 'Source',
    meta: { title: 'Source' },
    cell: ({ row }) => h('span', { class: 'text-muted-foreground' }, row.original.source || '—')
  },
  {
    id: 'assignee',
    accessorKey: 'assignee',
    header: 'Assigned',
    meta: { title: 'Assigned' },
    cell: ({ row }) => h('span', { class: 'text-muted-foreground' }, getAssigneeDisplay(row.original))
  }
])

const getRequestFilterValue = (row, key) => {
  if (key === 'status') {
    return getDisplayStage(row, row.type === 'lead' ? 'lead' : 'opportunity') ?? row.displayStage ?? row.stage ?? row.status ?? ''
  }
  if (key === 'assignee') {
    const val = row.assignee
    return val || '__unassigned__'
  }
  return getNestedProperty(row, key)
}


watch(selectedSegment, () => {
  pagination.value.pageIndex = 0
})

const { paginatedData, sortedData, totalFilteredCount } = useDataTableData({
  rawData: filteredList,
  columns: columns,
  globalFilter,
  columnFilters,
  sorting,
  pagination,
  filterDefs: filterDefinitions,
  searchableFields: (row) => [
    getCustomerName(row),
    row.customer?.email,
    row.customer?.phone,
    row.displayStage,
    row.source,
    row.assignee,
    row.compositeId,
    row.id
  ],
  getFilterValue: getRequestFilterValue
})

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

watch(
  [globalFilter, columnFilters, sorting, pagination],
  applySimulatedBackendFetch,
  { immediate: true, deep: true }
)

watch(
  filteredList,
  () => {
    displayedData.value = [...paginatedData.value]
    tableLoading.value = false
  },
  { deep: true }
)

onUnmounted(() => {
  if (fetchTimeout) clearTimeout(fetchTimeout)
})

const handleBulkDelete = () => {
  const selected = getSelectedRows(sortedData.value)
  if (selected.length === 0) return
  if (!confirm(`Are you sure you want to delete ${selected.length} ${selected.length === 1 ? 'request' : 'requests'}?`)) {
    return
  }
  selected.forEach((row) => {
    if (row.type === 'lead') {
      leadsStore.deleteLead(row.id)
    } else {
      opportunitiesStore.deleteOpportunity(row.id)
    }
  })
  clearSelection()
}

const isHighlighted = (row) => {
  return highlightId.value && row?.compositeId === highlightId.value
}
const tableMeta = computed(() => ({
  class: {
    tr: (row) => {
      const base = 'hover:bg-muted transition-colors cursor-pointer'
      return isHighlighted(row?.original) ? `${base} bg-blue-50 border-l-4 border-l-blue-500` : base
    }
  }
}))

const { onTableContainerClick } = useTableRowClick(displayedData, (row) => {
  if (!row?.compositeId) return
  const [type, id] = row.compositeId.split('-')
  router.push({ path: `/requests/${id}`, query: { type, from: 'requests' } })
  if (row.type === 'lead') {
    leadsStore.fetchLeadById(row.id)
  } else {
    opportunitiesStore.fetchOpportunityById(row.id)
  }
})

watch(
  highlightId,
  async (id) => {
    if (!id || !tableScrollContainer.value) return
    const idx = sortedData.value.findIndex(r => r.compositeId === id)
    if (idx === -1) return
    const pageSize = pagination.value.pageSize || 50
    const pageIndex = Math.floor(idx / pageSize)
    if (pagination.value.pageIndex !== pageIndex) {
      pagination.value = { ...pagination.value, pageIndex }
    }
    await nextTick()
    const rows = tableScrollContainer.value.querySelectorAll('tbody tr')
    const rowIndexOnPage = idx % pageSize
    const rowEl = rows[rowIndexOnPage]
    if (rowEl) {
      rowEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  },
  { immediate: true }
)

function applySegmentFromQuery() {
  const segment = route.query.segment
  if (segment === 'all') {
    selectedSegment.value = SK.NEW_LEADS
  } else if (segment && selectableSegmentKeys.includes(segment)) {
    selectedSegment.value = segment
  }
}

onMounted(() => {
  applySegmentFromQuery()
  const openId = route.query.open
  if (openId && (openId.startsWith('lead-') || openId.startsWith('opportunity-'))) {
    const [type, idStr] = openId.split('-')
    const id = parseInt(idStr, 10)
    if (id) {
      router.replace({ path: `/requests/${id}`, query: { type, from: 'requests' } })
      if (type === 'lead') leadsStore.fetchLeadById(id)
      else opportunitiesStore.fetchOpportunityById(id)
    }
  }
})

watch(() => route.query.segment, (segment) => {
  if (segment === 'all') {
    selectedSegment.value = SK.NEW_LEADS
  } else if (segment && selectableSegmentKeys.includes(segment)) {
    selectedSegment.value = segment
  }
})

</script>

<style scoped>
.chip-move-move {
  transition: transform 0.35s ease;
}

.data-table-inner.table-search-wrapper :deep([data-slot="table-search"]),
.data-table-inner.table-search-wrapper :deep(div:has(> input[placeholder*="Search"])),
.data-table-inner.table-search-wrapper :deep(div:has(> input[type="search"])) {
  display: none !important;
}
</style>
