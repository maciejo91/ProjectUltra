import { ref, computed, onMounted } from 'vue'
import { useLeadsStore } from '@/stores/leads'
import { useOpportunitiesStore } from '@/stores/opportunities'
import { useUserStore } from '@/stores/user'
import { getDisplayStage } from '@/utils/stageMapper'
import {
  LEAD_STAGES,
  OPPORTUNITY_STAGES
} from '@/utils/stageMapper/constants'

const OPEN_OPPORTUNITY_STAGES = [
  OPPORTUNITY_STAGES.QUALIFIED,
  OPPORTUNITY_STAGES.AWAITING_APPOINTMENT,
  OPPORTUNITY_STAGES.APPOINTMENT_SCHEDULED
]

export const SEGMENT_KEYS = {
  ALL: 'all',
  NEW_LEADS: 'newLeads',
  OPEN_OPPORTUNITIES: 'openOpportunities',
  IN_NEGOTIATION: 'inNegotiation',
  WON: 'won',
  ALL_OPPORTUNITIES: 'allOpportunities'
}

/**
 * Build combined list of leads and opportunities with type and displayStage.
 * Includes all leads (including disqualified) and all opportunities (including closed) for counts.
 * Applies role filter: operator = leads only, salesman = opportunities only, manager = both.
 */
function buildCombinedList(leads, opportunities, userStore) {
  const leadRows = leads.map(lead => {
    const displayStage = getDisplayStage(lead, 'lead')
    return {
      ...lead,
      type: 'lead',
      compositeId: `lead-${lead.id}`,
      displayStage,
      customer: lead.customer || lead
    }
  })

  const oppRows = opportunities.map(opp => {
    const displayStage = getDisplayStage(opp, 'opportunity')
    return {
      ...opp,
      type: 'opportunity',
      compositeId: `opportunity-${opp.id}`,
      displayStage,
      customer: opp.customer || opp
    }
  })

  if (userStore.isOperator()) {
    return leadRows
  }
  if (userStore.isSalesman()) {
    return oppRows
  }
  return [...leadRows, ...oppRows]
}

function isNewLead(row) {
  return row.type === 'lead' && !row.isDisqualified && row.displayStage === LEAD_STAGES.NEW
}

function isOpenOpportunity(row) {
  return row.type === 'opportunity' && OPEN_OPPORTUNITY_STAGES.includes(row.displayStage)
}

function isInNegotiation(row) {
  return row.type === 'opportunity' && typeof row.displayStage === 'string' && row.displayStage.startsWith(OPPORTUNITY_STAGES.IN_NEGOTIATION)
}

function isWon(row) {
  return row.type === 'opportunity' && row.displayStage === OPPORTUNITY_STAGES.CLOSED_WON
}

function isOpportunityRow(row) {
  return row.type === 'opportunity'
}

/**
 * Composable for Requests page: combined leads + opportunities list, segment counts, and filtered list.
 */
export function useRequestsList() {
  const leadsStore = useLeadsStore()
  const opportunitiesStore = useOpportunitiesStore()
  const userStore = useUserStore()

  const selectedSegment = ref(SEGMENT_KEYS.NEW_LEADS)

  const combinedList = computed(() => {
    return buildCombinedList(
      leadsStore.leads,
      opportunitiesStore.opportunities,
      userStore
    )
  })

  const counts = computed(() => {
    const list = combinedList.value
    return {
      [SEGMENT_KEYS.ALL]: list.length,
      [SEGMENT_KEYS.NEW_LEADS]: list.filter(isNewLead).length,
      [SEGMENT_KEYS.OPEN_OPPORTUNITIES]: list.filter(isOpenOpportunity).length,
      [SEGMENT_KEYS.IN_NEGOTIATION]: list.filter(isInNegotiation).length,
      [SEGMENT_KEYS.WON]: list.filter(isWon).length,
      [SEGMENT_KEYS.ALL_OPPORTUNITIES]: list.filter(isOpportunityRow).length
    }
  })

  const filteredList = computed(() => {
    const list = combinedList.value
    const segment = selectedSegment.value
    if (segment === SEGMENT_KEYS.ALL) return list
    if (segment === SEGMENT_KEYS.NEW_LEADS) return list.filter(isNewLead)
    if (segment === SEGMENT_KEYS.OPEN_OPPORTUNITIES) return list.filter(isOpenOpportunity)
    if (segment === SEGMENT_KEYS.IN_NEGOTIATION) return list.filter(isInNegotiation)
    if (segment === SEGMENT_KEYS.WON) return list.filter(isWon)
    if (segment === SEGMENT_KEYS.ALL_OPPORTUNITIES) return list.filter(isOpportunityRow)
    return list
  })

  async function loadData() {
    await Promise.all([
      leadsStore.fetchLeads(),
      opportunitiesStore.fetchOpportunities()
    ])
  }

  onMounted(() => {
    loadData()
  })

  return {
    combinedList,
    counts,
    filteredList,
    selectedSegment,
    loadData,
    loading: computed(() => leadsStore.loading || opportunitiesStore.loading),
    SEGMENT_KEYS
  }
}
