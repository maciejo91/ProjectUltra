<template>
  <RequestDetailShell
    :request="request"
    :filtered-requests="filteredRequests"
    :is-full-page="isFullPage"
    @close="$emit('close')"
    @previous="handlePrevious"
    @next="handleNext"
    @open-close="handleOpenClose"
    @open-convert="showConvertModal = true"
    @reopen-lead="handleReopenLead"
    @reopen-opportunity="handleReopenOpp"
    @postpone-expected-close="handlePostponeExpectedClose"
    @reassigned="handleReassigned"
    @add-tradein="editingTradeIn = null; showTradeInModal = true"
    @add-financing="editingFinancingOption = null; showFinancingModal = true"
  >
    <!-- Modals for status actions (triggered from header dropdown) -->
    <ComingSoonModal :show="showPostponeModal" @close="showPostponeModal = false" />
    <DisqualifyModal
      :show="showDisqualifyModal"
      @confirm="handleDisqualifyConfirm"
      @cancel="showDisqualifyModal = false"
    />

    <CloseAsLostModal
      :show="showCloseAsLostModal"
      @confirm="handleCloseAsLostConfirm"
      @cancel="showCloseAsLostModal = false"
    />

    <Dialog :open="showConvertModal" @update:open="(v) => !v && (showConvertModal = false)">
      <DialogPortal>
        <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
        <DialogContent class="w-full sm:max-w-md" :show-close-button="true">
          <DialogHeader class="shrink-0">
            <DialogTitle>Convert to Opportunity</DialogTitle>
            <DialogDescription>
              Convert this lead to an opportunity? The lead will be marked as converted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter class="shrink-0 flex flex-col sm:flex-row justify-end gap-3">
            <Button variant="outline" class="rounded-sm" @click="showConvertModal = false">
              Cancel
            </Button>
            <Button
              variant="default"
              class="rounded-sm"
              :disabled="converting"
              @click="handleConvert"
            >
              {{ converting ? 'Converting...' : 'Convert' }}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>

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
        <SuggestedNextActionCard v-if="request" :request="request" class="shrink-0" />
        <RequestActivityCard
          v-if="showTimeline"
          :request="request"
          class="flex-1 min-h-0"
          @offer-saved="handleOfferSaved"
          @request-navigate="$emit('request-navigate', $event)"
        />
      </div>
      <div :class="isClosedLead ? 'lg:col-span-3' : 'lg:col-span-1'" class="min-w-0 flex flex-col min-h-0 gap-4">
        <RequestRightColumnCard
          :request="request"
          :show-associated-tasks="showAssociatedTasks"
          @request-navigate="$emit('request-navigate', $event)"
        />
      </div>
    </div>
  </RequestDetailShell>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useLeadsStore } from '@/stores/leads'
import { useOpportunitiesStore } from '@/stores/opportunities'
import { useUserStore } from '@/stores/user'
import { useToastStore } from '@/stores/toast'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle
} from '@motork/component-library/future/primitives'
import RequestDetailShell from './RequestDetailShell.vue'
import SuggestedNextActionCard from './SuggestedNextActionCard.vue'
import RequestRightColumnCard from './RequestRightColumnCard.vue'
import RequestActivityCard from './RequestActivityCard.vue'
import ComingSoonModal from '@/components/modals/ComingSoonModal.vue'
import DisqualifyModal from '@/components/modals/DisqualifyModal.vue'
import CloseAsLostModal from '@/components/modals/CloseAsLostModal.vue'
import PurchaseMethodModal from '@/components/modals/PurchaseMethodModal.vue'
import AddVehicleModal from '@/components/modals/AddVehicleModal.vue'

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

const showDisqualifyModal = ref(false)
const showCloseAsLostModal = ref(false)
const showConvertModal = ref(false)
const showPostponeModal = ref(false)
const converting = ref(false)
const showTradeInModal = ref(false)
const showFinancingModal = ref(false)
const editingTradeIn = ref(null)
const editingFinancingOption = ref(null)
const tradeInActionLoading = ref(false)

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

function handleDisqualified() {
  useLeadsStore().fetchLeadById(props.request.id)
}

function handleCloseAsLost() {
  useOpportunitiesStore().fetchOpportunityById(props.request.id)
}

function handleReopened() {
  if (props.request?.type === 'lead') {
    useLeadsStore().fetchLeadById(props.request.id)
  } else {
    useOpportunitiesStore().fetchOpportunityById(props.request.id)
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

function handleConverted(opportunity) {
  leadsStore.fetchLeads()
  opportunitiesStore.fetchOpportunities()
  if (opportunity?.id) {
    emit('request-navigate', `opportunity-${opportunity.id}`)
  }
}

function handleOpenClose() {
  if (!props.request) return
  if (props.request.type === 'lead') {
    showDisqualifyModal.value = true
  } else if (props.request.type === 'opportunity') {
    showCloseAsLostModal.value = true
  }
}

function handleDisqualifyConfirm({ category, reason }) {
  if (!props.request?.id || props.request.type !== 'lead') return
  leadsStore
    .updateLead(props.request.id, {
      isDisqualified: true,
      disqualifyReason: reason,
      disqualifyCategory: category
    })
    .then(() => {
      showDisqualifyModal.value = false
      toastStore.pushToast('success', 'Lead disqualified')
      leadsStore.fetchLeadById(props.request.id)
    })
    .catch(() => {
      toastStore.pushToast('error', 'Failed to disqualify')
    })
}

function handleCloseAsLostConfirm({ reason, notes }) {
  if (!props.request?.id || props.request.type !== 'opportunity') return
  opportunitiesStore
    .updateOpportunity(props.request.id, {
      stage: 'Closed Lost',
      lostReason: reason,
      lostNotes: notes
    })
    .then(() => {
      showCloseAsLostModal.value = false
      toastStore.pushToast('success', 'Opportunity closed')
      opportunitiesStore.fetchOpportunityById(props.request.id)
    })
    .catch(() => {
      toastStore.pushToast('error', 'Failed to close')
    })
}

function handleReopenLead() {
  if (!props.request?.id || props.request.type !== 'lead') return
  leadsStore
    .updateLead(props.request.id, {
      isDisqualified: false,
      disqualifyReason: null,
      disqualifyCategory: null,
      stage: 'Open',
      status: 'Open'
    })
    .then(() => {
      toastStore.pushToast('success', 'Lead reopened')
      leadsStore.fetchLeadById(props.request.id)
    })
    .catch(() => {
      toastStore.pushToast('error', 'Failed to reopen')
    })
}

function handleReopenOpp() {
  if (!props.request?.id || props.request.type !== 'opportunity') return
  const hasOffers = props.request?.offers?.length > 0
  const targetStage = hasOffers ? 'In Negotiation' : 'Qualified'
  const negotiationSubstatus = hasOffers ? 'Offer Sent' : null
  opportunitiesStore
    .updateOpportunity(props.request.id, {
      stage: targetStage,
      negotiationSubstatus
    })
    .then(() => {
      toastStore.pushToast('success', 'Opportunity reopened')
      opportunitiesStore.fetchOpportunityById(props.request.id)
    })
    .catch(() => {
      toastStore.pushToast('error', 'Failed to reopen')
    })
}

async function handleConvert() {
  if (!props.request?.id || props.request.type !== 'lead') return
  converting.value = true
  try {
    const opportunity = await leadsStore.convertLeadToOpportunity(props.request.id, null)
    opportunitiesStore.addOpportunityToList(opportunity)
    showConvertModal.value = false
    toastStore.pushToast('success', 'Lead converted to opportunity')
    handleConverted(opportunity)
  } catch {
    toastStore.pushToast('error', 'Failed to convert')
  } finally {
    converting.value = false
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
