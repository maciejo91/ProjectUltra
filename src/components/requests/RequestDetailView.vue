<template>
  <RequestDetailShell
    :request="request"
    :filtered-requests="filteredRequests"
    :is-full-page="isFullPage"
    @close="$emit('close')"
    @previous="handlePrevious"
    @next="handleNext"
    @update-status="handleUpdateStatus"
    @postpone-expected-close="handlePostponeExpectedClose"
    @reassigned="handleReassigned"
    @add-tradein="editingTradeIn = null; showTradeInModal = true"
    @add-financing="editingFinancingOption = null; showFinancingModal = true"
  >
    <ComingSoonModal :show="showPostponeModal" @close="showPostponeModal = false" />

    <PurchaseMethodModal
      :show="showFinancingModal"
      :task-type="request?.type || 'lead'"
      :task-id="request?.id"
      :purchase-method="editingFinancingOption"
      standalone
      @save="handleFinancingSave"
      @delete="handleFinancingDelete"
      @close="showFinancingModal = false; editingFinancingOption = null"
    />

    <MergeConfirmModal
      :show="showMergeModal"
      :primary="request"
      :duplicate="duplicateToMerge"
      :duplicate-summary="mergeDuplicateSummary"
      :loading="mergeLoading"
      @close="showMergeModal = false; duplicateToMerge = null"
      @confirm="handleMergeConfirm"
    />

    <AddVehicleModal
      :show="showTradeInModal"
      mode="tradein"
      :task-type="request?.type || 'lead'"
      :task-id="request?.id"
      :item="editingTradeIn"
      :loading="tradeInActionLoading"
      @save="handleTradeInSave"
      @delete="handleTradeInDelete"
      @close="showTradeInModal = false; editingTradeIn = null"
    />

    <!-- Associated Tasks + Timeline – main content left (Suggested action + Communicate), Activity/Other requests right -->
    <div v-if="showAssociatedTasksOrTimeline" class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
      <div v-if="!isClosedLead" :class="showAssociatedTasks ? 'lg:col-span-2' : 'lg:col-span-3'" class="min-w-0 flex flex-col min-h-0 gap-4">
        <DuplicateDetectedCard
          v-if="request && potentialDuplicates.length"
          :potential-duplicates="potentialDuplicates"
          :merge-loading="mergeLoading"
          class="shrink-0"
          @merge="handleMergeClick"
          @request-navigate="(...args) => $emit('request-navigate', ...args)"
        />
        <SuggestedNextActionCard v-if="request" :request="request" class="shrink-0" />
        <RequestActivityCard
          v-if="showTimeline"
          :request="request"
          class="flex-1 min-h-0"
          @offer-saved="handleOfferSaved"
          @request-navigate="(...args) => $emit('request-navigate', ...args)"
        />
      </div>
      <div :class="isClosedLead ? 'lg:col-span-3' : 'lg:col-span-1'" class="min-w-0 flex flex-col min-h-0 gap-4">
        <RequestRightColumnCard
          :request="request"
          :show-associated-tasks="showAssociatedTasks"
          @request-navigate="(...args) => $emit('request-navigate', ...args)"
        />
      </div>
    </div>
  </RequestDetailShell>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDuplicateDetection } from '@/composables/useDuplicateDetection'
import { mergeRequestIntoPrimary, getVehicleSummary } from '@/api/mergeRequest'
import { useLeadsStore } from '@/stores/leads'
import { useOpportunitiesStore } from '@/stores/opportunities'
import { useUserStore } from '@/stores/user'
import { useToastStore } from '@/stores/toast'
import RequestDetailShell from './RequestDetailShell.vue'
import SuggestedNextActionCard from './SuggestedNextActionCard.vue'
import RequestRightColumnCard from './RequestRightColumnCard.vue'
import RequestActivityCard from './RequestActivityCard.vue'
import ComingSoonModal from '@/components/modals/ComingSoonModal.vue'
import PurchaseMethodModal from '@/components/modals/PurchaseMethodModal.vue'
import AddVehicleModal from '@/components/modals/AddVehicleModal.vue'
import MergeConfirmModal from '@/components/modals/MergeConfirmModal.vue'
import DuplicateDetectedCard from './DuplicateDetectedCard.vue'
import {
  getApiStatus,
  getOpportunityUpdateFromDisplayStage
} from '@/utils/stageMapper'
import { LEAD_STAGES } from '@/utils/stageMapper/constants'

const props = defineProps({
  request: {
    type: Object,
    default: null
  },
  filteredRequests: {
    type: Array,
    default: () => []
  },
  isFullPage: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'request-navigate'])

const leadsStore = useLeadsStore()
const opportunitiesStore = useOpportunitiesStore()
const userStore = useUserStore()
const toastStore = useToastStore()

const showPostponeModal = ref(false)
const showTradeInModal = ref(false)
const showFinancingModal = ref(false)
const editingTradeIn = ref(null)
const editingFinancingOption = ref(null)
const tradeInActionLoading = ref(false)
const showMergeModal = ref(false)
const duplicateToMerge = ref(null)
const mergeLoading = ref(false)

const { potentialDuplicates } = useDuplicateDetection(computed(() => props.request))

const mergeDuplicateSummary = computed(() => {
  const d = duplicateToMerge.value
  if (!d) return ''
  return getVehicleSummary(d)
})

const activityAuthor = computed(() => userStore.currentUser?.name || 'You')

/** Show Associated Tasks card when customer exists (other requests for same customer) */
const showAssociatedTasks = computed(() => {
  const r = props.request
  return !!(r?.customer || r?.customerId)
})

/** Show Timeline for all requests */
const showTimeline = computed(() => !!props.request)

/** Closed lead: hide communicate, let Activity/Other requests span full width */
const isClosedLead = computed(
  () => props.request?.type === 'lead' && props.request?.isDisqualified === true
)

const showAssociatedTasksOrTimeline = computed(
  () => showAssociatedTasks.value || showTimeline.value
)

function handlePrevious() {
  if (!props.request?.compositeId || !props.filteredRequests?.length) return
  const idx = props.filteredRequests.findIndex(r => r.compositeId === props.request.compositeId)
  if (idx > 0) {
    const prev = props.filteredRequests[idx - 1]
    emit('request-navigate', prev.compositeId)
  }
}

function handleNext() {
  if (!props.request?.compositeId || !props.filteredRequests?.length) return
  const idx = props.filteredRequests.findIndex(r => r.compositeId === props.request.compositeId)
  if (idx >= 0 && idx < props.filteredRequests.length - 1) {
    const next = props.filteredRequests[idx + 1]
    emit('request-navigate', next.compositeId)
  }
}

function handleOfferSaved() {
  if (props.request?.type === 'opportunity') {
    useOpportunitiesStore().fetchOpportunityById(props.request.id)
  }
}

function handleEventCreated() {
  if (props.request?.type === 'lead') {
    useLeadsStore().fetchLeadById(props.request.id)
  } else {
    useOpportunitiesStore().fetchOpportunityById(props.request.id)
  }
}

function handleMergeClick(duplicate) {
  duplicateToMerge.value = duplicate
  showMergeModal.value = true
}

async function handleMergeConfirm(payload) {
  const master = payload?.master ?? props.request
  const toMerge = payload?.toMerge ?? duplicateToMerge.value
  if (!master?.id || !toMerge) return
  mergeLoading.value = true
  try {
    await mergeRequestIntoPrimary(master, toMerge)
    toastStore.pushToast('success', 'Duplicate merged successfully')
    showMergeModal.value = false
    duplicateToMerge.value = null
    if (props.request.type === 'lead') {
      await leadsStore.fetchLeadById(props.request.id)
      leadsStore.fetchLeads()
    } else {
      await opportunitiesStore.fetchOpportunityById(props.request.id)
      opportunitiesStore.fetchOpportunities()
    }
  } catch (err) {
    toastStore.pushToast('error', 'Failed to merge duplicate')
  } finally {
    mergeLoading.value = false
  }
}

function handleReassigned() {
  if (props.request?.type === 'lead') {
    leadsStore.fetchLeadById(props.request.id)
  } else if (props.request?.type === 'opportunity') {
    opportunitiesStore.fetchOpportunityById(props.request.id)
  }
}

function handlePostponeExpectedClose() {
  showPostponeModal.value = true
}

function handleUpdateStatus(displayStage) {
  if (!props.request?.id) return
  const closedLeadStages = [
    LEAD_STAGES.CLOSED_INVALID,
    LEAD_STAGES.CLOSED_NOT_INTERESTED,
    LEAD_STAGES.CLOSED_DUPLICATE
  ]
  if (props.request.type === 'lead') {
    const apiStatus = getApiStatus(displayStage, 'lead')
    const isClosed = closedLeadStages.includes(displayStage)
    leadsStore
      .updateLead(props.request.id, {
        isDisqualified: isClosed,
        disqualifyReason: null,
        disqualifyCategory: null,
        stage: apiStatus,
        status: apiStatus
      })
      .then(() => {
        toastStore.pushToast('success', 'Status updated')
        leadsStore.fetchLeadById(props.request.id)
      })
      .catch(() => {
        toastStore.pushToast('error', 'Failed to update status')
      })
  } else if (props.request.type === 'opportunity') {
    const payload = getOpportunityUpdateFromDisplayStage(displayStage)
    opportunitiesStore
      .updateOpportunity(props.request.id, payload)
      .then(() => {
        toastStore.pushToast('success', 'Status updated')
        opportunitiesStore.fetchOpportunityById(props.request.id)
      })
      .catch(() => {
        toastStore.pushToast('error', 'Failed to update status')
      })
  }
}

async function handleTradeInSave(data) {
  const r = props.request
  if (!r?.id) return
  tradeInActionLoading.value = true
  try {
    const v = data.vehicle || {}
    const parts = [v.brand, v.model].filter(Boolean)
    const label = (parts.length ? parts.join(' ') + (v.year ? ` (${v.year})` : '') : 'Trade-in') || 'Trade-in'
    const valuation = data.valuation?.tradeInPrice ?? 0
    const activity = {
      type: 'tradein',
      user: activityAuthor.value,
      action: data.isEdit ? 'updated a trade-in' : 'added a trade-in',
      content: label,
      data: { vehicle: data.vehicle, valuation: data.valuation },
      timestamp: new Date().toISOString()
    }
    const fullItem = {
      id: data.id || `ti-${Date.now()}`,
      label: label || 'Trade-in',
      valuation: typeof valuation === 'number' ? valuation : parseFloat(valuation) || 0,
      vehicle: data.vehicle,
      valuationDetail: data.valuation
    }
    const list = r.tradeIns || []
    const updatedList = data.isEdit
      ? list.map((t) => (String(t.id) === String(fullItem.id) ? fullItem : t))
      : [...list, fullItem]
    if (r.type === 'lead') {
      await leadsStore.addActivity(r.id, activity)
      await leadsStore.updateLead(r.id, { tradeIns: updatedList })
      await leadsStore.fetchLeadById(r.id)
    } else {
      await opportunitiesStore.addActivity(r.id, activity)
      await opportunitiesStore.updateOpportunity(r.id, { tradeIns: updatedList })
      await opportunitiesStore.fetchOpportunityById(r.id)
    }
    showTradeInModal.value = false
    editingTradeIn.value = null
  } catch (err) {
    console.error('Error saving trade-in:', err)
  } finally {
    tradeInActionLoading.value = false
  }
}

async function handleTradeInDelete() {
  const toRemove = editingTradeIn.value
  const r = props.request
  if (!toRemove || !r?.id) return
  const newList = (r.tradeIns || []).filter((t) => String(t.id) !== String(toRemove.id))
  showTradeInModal.value = false
  editingTradeIn.value = null
  tradeInActionLoading.value = true
  try {
    if (r.type === 'lead') {
      await leadsStore.updateLead(r.id, { tradeIns: newList })
      await leadsStore.fetchLeadById(r.id)
    } else {
      await opportunitiesStore.updateOpportunity(r.id, { tradeIns: newList })
      await opportunitiesStore.fetchOpportunityById(r.id)
    }
  } catch {
    toastStore.pushToast('error', 'Failed to delete trade-in')
  } finally {
    tradeInActionLoading.value = false
  }
}

async function handleFinancingSave(data) {
  const r = props.request
  if (!r?.id) return
  try {
    const typeLabel = data.type === 'FIN' ? 'Captive Financing' : data.type === 'LEA' ? 'Leasing' : data.type === 'LTR' ? 'Long-Term Rental' : data.type || 'Financing'
    const duration = data.fields?.duration ?? data.termMonths ?? null
    const content = duration ? `${typeLabel} ${duration} months` : typeLabel
    const activity = {
      type: 'financing',
      user: activityAuthor.value,
      action: editingFinancingOption.value ? 'updated a financing proposal' : 'added a financing proposal',
      content: data.successMessage || content,
      data: { type: data.type, ...(data.fields || {}) },
      timestamp: new Date().toISOString()
    }
    const foLabel = data.label ?? (duration ? `${typeLabel} - ${duration} months` : typeLabel)
    const fullItem = {
      id: data.id || `fo-${Date.now()}`,
      label: foLabel,
      termMonths: duration || null,
      type: data.type,
      fields: data.fields ? { ...data.fields } : {},
      currency: data.currency || 'EUR',
      offerValidFrom: data.offerValidFrom ?? null,
      offerValidTo: data.offerValidTo ?? null
    }
    const list = r.financingOptions || []
    const updatedList = editingFinancingOption.value
      ? list.map((f) => (String(f.id) === String(fullItem.id) ? fullItem : f))
      : [...list, fullItem]
    if (r.type === 'lead') {
      await leadsStore.addActivity(r.id, activity)
      await leadsStore.updateLead(r.id, { financingOptions: updatedList })
      await leadsStore.fetchLeadById(r.id)
    } else {
      await opportunitiesStore.addActivity(r.id, activity)
      await opportunitiesStore.updateOpportunity(r.id, { financingOptions: updatedList })
      await opportunitiesStore.fetchOpportunityById(r.id)
    }
    showFinancingModal.value = false
    editingFinancingOption.value = null
  } catch (err) {
    console.error('Error saving financing:', err)
  }
}

async function handleFinancingDelete() {
  const toRemove = editingFinancingOption.value
  const r = props.request
  if (!toRemove || !r?.id) return
  const newList = (r.financingOptions || []).filter((f) => String(f.id) !== String(toRemove.id))
  showFinancingModal.value = false
  editingFinancingOption.value = null
  try {
    if (r.type === 'lead') {
      await leadsStore.updateLead(r.id, { financingOptions: newList })
      await leadsStore.fetchLeadById(r.id)
    } else {
      await opportunitiesStore.updateOpportunity(r.id, { financingOptions: newList })
      await opportunitiesStore.fetchOpportunityById(r.id)
    }
  } catch {
    toastStore.pushToast('error', 'Failed to delete financing option')
  }
}
</script>
