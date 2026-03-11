<template>
  <div class="h-full flex flex-col overflow-hidden bg-surface">
    <RequestDetailView
      v-if="request"
      :key="request?.compositeId || 'empty'"
      :request="request"
      :filtered-requests="filteredRequests"
      :is-full-page="true"
      @close="handleBack"
      @request-navigate="handleRequestNavigate"
    />
    <div v-else class="flex-1 flex items-center justify-center p-8">
      <div class="text-center">
        <p class="text-muted-foreground">{{ loading ? 'Loading...' : 'Request not found' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RequestDetailView from '@/components/requests/RequestDetailView.vue'
import { useRequestsList } from '@/composables/useRequestsList'
import { useLeadsStore } from '@/stores/leads'
import { getDisplayStage } from '@/utils/stageMapper'
import { useRequestNavigationStore } from '@/stores/requestNavigation'
import { useOpportunitiesStore } from '@/stores/opportunities'

const route = useRoute()
const router = useRouter()
const { filteredList, combinedList } = useRequestsList()
const requestNavigationStore = useRequestNavigationStore()
const leadsStore = useLeadsStore()
const opportunitiesStore = useOpportunitiesStore()

const requestId = computed(() => parseInt(route.params.id, 10))
const requestType = computed(() => route.query.type || 'lead')
const compositeId = computed(() => `${requestType.value}-${requestId.value}`)

const request = computed(() => {
  const found = filteredList.value.find(r => r.compositeId === compositeId.value)
  if (found) return found
  const type = requestType.value
  const id = requestId.value
  if (type === 'lead') {
    const lead = leadsStore.leads.find(l => l.id === id)
    if (lead) {
      return {
        ...lead,
        type: 'lead',
        compositeId: `lead-${lead.id}`,
        displayStage: getDisplayStage(lead, 'lead'),
        customer: lead.customer || lead
      }
    }
  } else {
    const opp = opportunitiesStore.opportunities.find(o => o.id === id)
    if (opp) {
      return {
        ...opp,
        type: 'opportunity',
        compositeId: `opportunity-${opp.id}`,
        displayStage: getDisplayStage(opp, 'opportunity'),
        customer: opp.customer || opp
      }
    }
  }
  return null
})

const requestRowsFromState = computed(() => {
  const state = window.history?.state
  return state?.requestRows ?? []
})

const filteredRequests = computed(() => {
  const fromStore = requestNavigationStore.requestRows
  const fromState = requestRowsFromState.value
  const primary = fromStore?.length ? fromStore : (fromState?.length ? fromState : filteredList.value)
  const currentId = compositeId.value
  if (primary?.length && currentId && !primary.some((r) => String(r.compositeId) === String(currentId))) {
    return combinedList.value
  }
  return primary
})

const loading = computed(() => {
  const type = requestType.value
  const id = requestId.value
  if (!id) return false
  if (type === 'lead') {
    const lead = leadsStore.leads.find(l => l.id === id)
    return !lead
  }
  const opp = opportunitiesStore.opportunities.find(o => o.id === id)
  return !opp
})

watch(
  [requestId, requestType],
  () => {
    if (!requestId.value) return
    if (requestType.value === 'lead') {
      leadsStore.fetchLeadById(requestId.value)
    } else {
      opportunitiesStore.fetchOpportunityById(requestId.value)
    }
  },
  { immediate: true }
)

function handleBack() {
  const from = route.query.from
  if (from === 'customer' && request.value?.customerId) {
    router.push({ path: `/customer/${request.value.customerId}` })
    return
  }
  const query = from === 'requests' && request.value?.compositeId
    ? { highlight: request.value.compositeId }
    : {}
  router.push({ path: '/requests', query })
}

function handleRequestNavigate(compositeId, requestRowsOverride) {
  const [type, id] = (compositeId || '').split('-')
  if (!id) return
  const rows = requestRowsOverride?.length ? requestRowsOverride : filteredRequests.value
  requestNavigationStore.setRequestRows(rows)
  const from = route.query.from || 'requests'
  router.push({
    path: `/requests/${id}`,
    query: { type, from },
    state: rows.length ? { requestRows: rows } : undefined
  })
}
</script>
