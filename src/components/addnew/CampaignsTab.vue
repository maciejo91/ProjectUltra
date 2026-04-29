<template>
  <div class="mb-8">
  <DataTableWithUnifiedSearch
    active-tab="campaigns"
    placeholder="Search campaigns..."
    :pagination="pagination"
    :status-options="statusOptions"
    @update:global-filter="globalFilter = $event"
    @update:column-filters="columnFilters = $event"
    @update:pagination="pagination = $event"
  >
        <DataTable
          :data="paginatedData"
          :columns="columns"
          :meta="tableMeta"
          :loading="campaignsStore.loading"
          :columnFiltersOptions="{ filterDefs: filterDefinitions }"
          v-model:pagination="pagination"
          v-model:sorting="sorting"
          v-model:columnFilters="columnFilters"
          :paginationOptions="{ rowCount: totalFilteredCount }"
          class="h-full"
        >
          <template #empty-state>
            <div class="empty-state">
              <Inbox class="empty-state-icon w-8 h-8 shrink-0 text-muted-foreground" />
              <p class="empty-state-text text-muted-foreground">No campaign interactions found</p>
            </div>
          </template>
        </DataTable>
  </DataTableWithUnifiedSearch>

    <LinkLeadModal
      :show="showLinkLeadModal"
      :interaction-id="linkingInteraction?.id"
      :customer="linkingInteraction?.customer"
      @linked="handleLinkedLead"
      @close="showLinkLeadModal = false"
    />
    <LinkOpportunityModal
      :show="showLinkOpportunityModal"
      :interaction-id="linkingInteraction?.id"
      :customer="linkingInteraction?.customer"
      @linked="handleLinkedOpportunity"
      @close="showLinkOpportunityModal = false"
    />
    <ConversationViewModal
      :show="showConversationModal"
      :interaction="viewingConversation"
      @close="showConversationModal = false; viewingConversation = null"
    />
  </div>
</template>

<script setup>
import { ref, computed, h, onMounted } from 'vue'
import { Inbox, User, Mail, MessageCircle, ArrowUpRight, ArrowDownLeft, Link2, Eye, ExternalLink } from 'lucide-vue-next'
import { DataTable } from '@motork/component-library/future/components'
import DataTableWithUnifiedSearch from '@/components/shared/layout/DataTableWithUnifiedSearch.vue'
import LinkLeadModal from '@/components/modals/LinkLeadModal.vue'
import LinkOpportunityModal from '@/components/modals/LinkOpportunityModal.vue'
import ConversationViewModal from '@/components/modals/ConversationViewModal.vue'
import { useCampaignsStore } from '@/stores/campaigns'
import { useDataTableData, getNestedProperty } from '@/composables/useDataTableData'

const campaignsStore = useCampaignsStore()

const showLinkLeadModal = ref(false)
const showLinkOpportunityModal = ref(false)
const showConversationModal = ref(false)
const linkingInteraction = ref(null)
const viewingConversation = ref(null)

const pagination = ref({ pageIndex: 0, pageSize: 10 })
const globalFilter = ref('')
const columnFilters = ref([])
const sorting = ref([])

const filterDefinitions = computed(() => [
  {
    key: 'status',
    label: 'Status',
    type: 'multiselect',
    operators: [
      { value: 'in', label: 'is any of' },
      { value: 'notIn', label: 'is none of' }
    ],
    options: [
      { value: 'New', label: 'New' },
      { value: 'Active', label: 'Active' }
    ],
    pinned: true
  },
  {
    key: 'channel',
    label: 'Channel',
    type: 'multiselect',
    operators: [
      { value: 'in', label: 'is any of' },
      { value: 'notIn', label: 'is none of' }
    ],
    options: [
      { value: 'Email', label: 'Email' },
      { value: 'WhatsApp Business', label: 'WhatsApp Business' }
    ],
    pinned: true
  },
  {
    key: 'direction',
    label: 'Direction',
    type: 'multiselect',
    operators: [
      { value: 'in', label: 'is any of' },
      { value: 'notIn', label: 'is none of' }
    ],
    options: [
      { value: 'Inbound', label: 'Inbound' },
      { value: 'Outbound', label: 'Outbound' }
    ],
    pinned: true
  },
  {
    key: 'lastMessageDate',
    label: 'Last message date',
    type: 'inputrange',
    inputType: 'date',
    operators: [
      { value: 'between', label: 'is between' },
      { value: 'gte', label: 'is after' },
      { value: 'lte', label: 'is before' }
    ]
  }
])

const formatDateTime = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const truncateMessage = (msg, max = 40) => {
  if (!msg) return '—'
  return msg.length > max ? msg.slice(0, max) + '...' : msg
}

const openLinkLeadModal = (row) => {
  linkingInteraction.value = row
  showLinkLeadModal.value = true
}

const openLinkOpportunityModal = (row) => {
  linkingInteraction.value = row
  showLinkOpportunityModal.value = true
}

const openConversationModal = (row) => {
  viewingConversation.value = row
  showConversationModal.value = true
}

const handleLinkedLead = async (payload) => {
  if (payload?.interactionId && payload?.leadId != null) {
    await campaignsStore.linkToLead(payload.interactionId, payload.leadId)
  }
  showLinkLeadModal.value = false
  linkingInteraction.value = null
}

const handleLinkedOpportunity = async (payload) => {
  if (payload?.interactionId && payload?.opportunityId != null) {
    await campaignsStore.linkToOpportunity(payload.interactionId, payload.opportunityId)
  }
  showLinkOpportunityModal.value = false
  linkingInteraction.value = null
}

const columns = computed(() => [
  {
    id: 'customer',
    accessorKey: 'customer',
    header: 'Customer',
    meta: { title: 'Customer' },
    cell: ({ row }) => {
      const c = row.original.customer
      const name = c?.name || '—'
      return h('span', { class: 'flex items-center gap-2 text-foreground' }, [
        h(User, { class: 'w-4 h-4 shrink-0 text-muted-foreground' }),
        name
      ])
    }
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    meta: { title: 'Status' },
    cell: ({ row }) => {
      const status = row.original.status
      return h('span', {
        class: 'inline-flex items-center px-2 py-0.5 rounded text-fluid-xs font-semibold bg-blue-100 text-blue-700 w-fit'
      }, status || '—')
    }
  },
  {
    id: 'channel',
    accessorKey: 'channel',
    header: 'Channel',
    meta: { title: 'Channel' },
    cell: ({ row }) => {
      const ch = row.original.channel
      const isEmail = ch === 'Email'
      const Icon = isEmail ? Mail : MessageCircle
      const label = ch || '—'
      return h('span', { class: 'flex items-center gap-2 text-muted-foreground' }, [
        h(Icon, { class: 'w-4 h-4 shrink-0' }),
        label
      ])
    }
  },
  {
    id: 'direction',
    accessorKey: 'direction',
    header: 'Direction',
    meta: { title: 'Direction' },
    cell: ({ row }) => {
      const dir = row.original.direction
      const ch = row.original.channel
      const isWhatsapp = ch === 'WhatsApp Business' || ch === 'WhatsApp'
      const Icon = dir === 'Inbound' ? ArrowUpRight : ArrowDownLeft
      const label = dir || '—'
      const iconAreaClass = isWhatsapp
        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
      return h('span', { class: 'flex items-center gap-2' }, [
        h('span', {
          class: `shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${iconAreaClass}`
        }, [h(Icon, { class: 'w-4 h-4' })]),
        h('span', { class: 'text-muted-foreground' }, label)
      ])
    }
  },
  {
    id: 'lastMessageDate',
    accessorKey: 'lastMessageDate',
    header: 'Last message date',
    meta: { title: 'Last message date' },
    cell: ({ row }) => h('span', { class: 'text-muted-foreground' }, formatDateTime(row.original.lastMessageDate))
  },
  {
    id: 'lastMessage',
    accessorKey: 'lastMessage',
    header: 'Last message',
    meta: { title: 'Last message' },
    cell: ({ row }) => {
      const r = row.original
      const msg = truncateMessage(r.lastMessage)
      return h('span', { class: 'flex items-center gap-2 text-muted-foreground' }, [
        h('button', {
          type: 'button',
          class: 'shrink-0 p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground',
          onClick: (e) => {
            e.stopPropagation()
            openConversationModal(r)
          },
          title: 'View conversation'
        }, [h(Eye, { class: 'w-4 h-4' })]),
        h('span', { class: 'truncate block max-w-xs' }, msg)
      ])
    }
  },
  {
    id: 'lead',
    accessorKey: 'leadId',
    header: 'Lead',
    meta: { title: 'Lead' },
    cell: ({ row }) => {
      const r = row.original
      if (r.leadId) {
        const href = `/requests/${r.leadId}?type=lead`
        return h('a', {
          href,
          target: '_blank',
          rel: 'noopener noreferrer',
          class: 'inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline cursor-pointer',
          onClick: (e) => e.stopPropagation()
        }, ['Linked lead', h(ExternalLink, { class: 'w-4 h-4 shrink-0' })])
      }
      return h('button', {
        type: 'button',
        class: 'inline-flex items-center gap-1.5 rounded-sm border border-input bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer',
        onClick: (e) => {
          e.stopPropagation()
          openLinkLeadModal(r)
        }
      }, [h(Link2, { class: 'w-4 h-4 shrink-0' }), ' Link lead'])
    }
  },
  {
    id: 'opportunity',
    accessorKey: 'opportunityId',
    header: 'Opportunity',
    meta: { title: 'Opportunity' },
    cell: ({ row }) => {
      const r = row.original
      if (r.opportunityId) {
        const href = `/requests/${r.opportunityId}?type=opportunity`
        return h('a', {
          href,
          target: '_blank',
          rel: 'noopener noreferrer',
          class: 'inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline cursor-pointer',
          onClick: (e) => e.stopPropagation()
        }, ['Linked opportunity', h(ExternalLink, { class: 'w-4 h-4 shrink-0' })])
      }
      return h('button', {
        type: 'button',
        class: 'inline-flex items-center gap-1.5 rounded-sm border border-input bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer',
        onClick: (e) => {
          e.stopPropagation()
          openLinkOpportunityModal(r)
        }
      }, [h(Link2, { class: 'w-4 h-4 shrink-0' }), ' Link opportunity'])
    }
  }
])

const tableMeta = computed(() => ({
  class: {
    tr: () => 'hover:bg-muted transition-colors'
  }
}))

const rawData = computed(() => campaignsStore.interactions)

const { paginatedData, sortedData, totalFilteredCount } = useDataTableData({
  rawData,
  columns,
  globalFilter,
  columnFilters,
  sorting,
  pagination,
  filterDefs: filterDefinitions,
  searchableFields: (row) => [
    row.customer?.name,
    row.status,
    row.channel,
    row.direction,
    row.lastMessage,
    row.lastMessageDate
  ],
  getFilterValue: (row, key) => {
    if (key === 'lastMessageDate') return row.lastMessageDate
    return getNestedProperty(row, key)
  }
})

const statusOptions = computed(() =>
  filterDefinitions.value?.find((d) => d.key === 'status')?.options ?? []
)

onMounted(async () => {
  await campaignsStore.fetchInteractions()
})
</script>
