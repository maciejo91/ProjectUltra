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

    <!-- Left: Car, Customer, etc. (2/3). Right: Activity/Other requests (1/3). Page scrolls as one. -->
    <div v-if="showAssociatedTasksOrTimeline" class="p-2">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <!-- Left column: two wrappers (cards on top, Communicate/Data/Tasks below) -->
        <div class="order-1 lg:col-span-2 flex flex-col gap-4">
          <div class="flex flex-col gap-4 bg-muted rounded-lg p-2">
            <DuplicateDetectedCard
              v-if="request && potentialDuplicates.length && !duplicateBannerDismissed"
              :potential-duplicates="potentialDuplicates"
              :merge-loading="mergeLoading"
              @merge="handleMergeClick"
              @request-navigate="(...args) => $emit('request-navigate', ...args)"
              @dismiss="duplicateBannerDismissed = true"
            />
            <LeadOpportunityDetailsCard
              v-if="request"
              :request="request"
              :show-assignee-bar="false"
              @postpone-expected-close="handlePostponeExpectedClose"
              @reassigned="handleReassigned"
            />
            <!-- Requested car (wider) + Customer (narrower) on same row -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <VehicleRequestCard
                v-if="request && (request.requestedCar || request.vehicle)"
                class="md:col-span-2"
                :vehicle="request.requestedCar || request.vehicle"
                :request-message="request.requestMessage || request.requestedCar?.requestMessage"
                :source="request.source"
                :image-url="getCarImageUrl(request.requestedCar || request.vehicle)"
                :save-requested-car="handleRequestedCarSave"
                @open-ad="handleOpenAd"
                @more-actions="handleMoreActions"
              />
              <TaskContactCard
                v-if="request"
                class="md:col-span-1"
                :task="request"
                :task-type="request.type"
                :customer-id="request.customerId || request.customer?.id"
                @action="handleContactAction"
              />
            </div>
            <SuggestedNextActionCard
              v-if="request && !isClosedLead"
              :request="request"
              class="shrink-0"
            />
          </div>
          <div class="flex flex-col bg-muted rounded-lg p-2">
            <RequestActivityCard
              v-if="showTimeline && !isClosedLead"
              :request="request"
              @offer-saved="handleOfferSaved"
              @request-navigate="(...args) => $emit('request-navigate', ...args)"
              @open-trade-in="editingTradeIn = null; showTradeInModal = true"
              @open-task-drawer="$emit('open-task-drawer', $event)"
              @open-financing="editingFinancingOption = null; showFinancingModal = true"
            />
          </div>
        </div>
        <!-- Activity + Other requests (1/3 width, right column) -->
        <div class="order-2 lg:col-span-1 flex flex-col gap-4">
          <div class="flex flex-col bg-muted rounded-lg p-2">
            <RequestRightColumnCard
              :request="request"
              :show-associated-tasks="showAssociatedTasks"
              :activities="requestActivities"
              :expanded-summaries="activityExpandedSummaries"
              @request-navigate="(...args) => $emit('request-navigate', ...args)"
              @activity-click="handleActivityClick"
              @toggle-summary-expanded="toggleActivitySummaryExpanded"
              @add-activity="handleAddActivity"
            />
          </div>
        </div>
      </div>
    </div>
  </RequestDetailShell>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useDuplicateDetection } from '@/composables/useDuplicateDetection'
import { mergeRequestIntoPrimary, getVehicleSummary } from '@/api/mergeRequest'
import { useLeadsStore } from '@/stores/leads'
import { useOpportunitiesStore } from '@/stores/opportunities'
import { useUserStore } from '@/stores/user'
import { useToastStore } from '@/stores/toast'
import RequestDetailShell from './RequestDetailShell.vue'
import LeadOpportunityDetailsCard from '@/components/shared/LeadOpportunityDetailsCard.vue'
import VehicleRequestCard from '@/components/shared/VehicleRequestCard.vue'
import TaskContactCard from '@/components/tasks/TaskContactCard.vue'
import RequestRightColumnCard from './RequestRightColumnCard.vue'
import RequestActivityCard from './RequestActivityCard.vue'
import SuggestedNextActionCard from './SuggestedNextActionCard.vue'
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
import { getCarImageUrl } from '@/utils/vehicleHelpers'

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

const emit = defineEmits(['close', 'request-navigate', 'open-task-drawer'])

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
/** Dismiss duplicate banner for current request only (resets when request changes). */
const duplicateBannerDismissed = ref(false)

/** Activity tab: expanded state for AI summaries (same as task detail). */
const activityExpandedSummaries = ref({})

const { potentialDuplicates } = useDuplicateDetection(computed(() => props.request))

/** Activities for current request (same source logic as task detail). */
const requestActivities = computed(() => {
  const r = props.request
  if (!r) return []
  let list = []
  if (r.type === 'lead') {
    if (leadsStore.currentLead?.id === r.id) {
      list = leadsStore.currentLeadActivities || []
    } else {
      list = r.activities || []
    }
  } else if (r.type === 'opportunity') {
    if (opportunitiesStore.currentOpportunity?.id === r.id) {
      list = opportunitiesStore.currentOpportunityActivities || []
    } else {
      list = r.activities || []
    }
  }
  return [...list].sort((a, b) => {
    const ta = (a.timestamp ? new Date(a.timestamp).getTime() : 0)
    const tb = (b.timestamp ? new Date(b.timestamp).getTime() : 0)
    return tb - ta
  })
})

watch(
  () => props.request?.compositeId,
  () => {
    duplicateBannerDismissed.value = false
  }
)

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

async function handleRequestedCarSave(carData) {
  const r = props.request
  if (!r?.id) return
  try {
    if (r.type === 'lead') {
      await leadsStore.updateLead(r.id, { requestedCar: carData })
      await leadsStore.fetchLeadById(r.id)
    } else {
      await opportunitiesStore.updateOpportunity(r.id, { requestedCar: carData })
      await opportunitiesStore.fetchOpportunityById(r.id)
    }
    toastStore.pushToast('success', 'Requested car updated')
  } catch {
    toastStore.pushToast('error', 'Failed to update requested car')
    throw new Error('Save failed')
  }
}

function handleOpenAd() {
  // TODO: open ad
}

function handleMoreActions() {
  // TODO: more actions menu
}

function handleContactAction() {
  // TODO: contact action
}

function handleActivityClick() {
  // TODO: open activity detail modal when needed
}

function toggleActivitySummaryExpanded(activityId) {
  activityExpandedSummaries.value[activityId] = !activityExpandedSummaries.value[activityId]
}

function handleAddActivity() {
  // Add-activity opens modals on task detail; request detail can wire Note/Attachment etc. later
  toastStore.pushToast('info', 'Add activity – coming soon')
}

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
