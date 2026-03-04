<template>
  <div class="flex flex-col min-h-0 overflow-hidden border-t border-border bg-background">
    <!-- Lead: Communicate + Data tabs -->
    <Tabs v-if="isLead" v-model="activeTab" class="flex flex-col flex-1 min-h-0 overflow-hidden gap-0">
      <TabsList class="flex shrink-0 border-0 bg-background rounded-none w-full relative h-full">
        <TabsTrigger
          value="communicate"
          class="flex items-center gap-2 text-sm font-medium transition-all relative flex-1 justify-center bg-transparent outline-none h-full"
          :class="activeTab === 'communicate' ? 'text-foreground' : 'text-muted-foreground hover:text-muted-foreground'"
        >
          <span>Communicate</span>
          <span
            v-if="activeTab === 'communicate'"
            class="absolute bottom-0 left-0 right-0 h-[2px] bg-primary z-10"
          />
        </TabsTrigger>
        <TabsTrigger
          value="data"
          class="flex items-center gap-2 text-sm font-medium transition-all relative flex-1 justify-center bg-transparent outline-none h-full"
          :class="activeTab === 'data' ? 'text-foreground' : 'text-muted-foreground hover:text-muted-foreground'"
        >
          <span>Data</span>
          <span
            v-if="activeTab === 'data'"
            class="absolute bottom-0 left-0 right-0 h-[2px] bg-primary z-10"
          />
        </TabsTrigger>
        <TabsTrigger
          v-if="showTasksTab"
          value="tasks"
          class="flex items-center gap-2 text-sm font-medium transition-all relative flex-1 justify-center bg-transparent outline-none h-full"
          :class="activeTab === 'tasks' ? 'text-foreground' : 'text-muted-foreground hover:text-muted-foreground'"
        >
          <span>Tasks</span>
          <span
            v-if="activeTab === 'tasks'"
            class="absolute bottom-0 left-0 right-0 h-[2px] bg-primary z-10"
          />
        </TabsTrigger>
      </TabsList>
      <div class="flex-1 min-h-0 flex flex-col overflow-y-auto bg-muted">
        <TabsContent value="communicate" class="flex-1 overflow-y-auto space-y-2 p-2 mt-0 data-[state=inactive]:hidden min-h-0">
          <div class="rounded-lg flex flex-col bg-background pt-1 px-1 pb-1">
          <CommunicationWidget
            :task-type="request?.type || 'lead'"
            :task-id="request?.id"
            :phone-number="customerPhone"
            :contact-name="customerName"
            :inline="true"
            selection-card-title="Call or send message"
            selection-card-description="Log a call outcome or send an email, SMS or WhatsApp to this customer."
            @save="handleCommunicationSave"
          />
          </div>
        </TabsContent>
        <TabsContent value="data" class="flex-1 overflow-y-auto p-2 mt-0 data-[state=inactive]:hidden min-h-0">
        <RequestDataTabContent
          :activities="requestActivities"
          :task-type="request?.type || 'lead'"
          :task-id="request?.id"
          :customer-initials="customerInitials"
          @note-save="handleNoteSave"
          @note-delete="handleNoteDelete"
          @attachment-save="handleAttachmentSave"
          @attachment-delete="handleAttachmentDelete"
        />
        </TabsContent>
        <TabsContent
          v-if="showTasksTab"
          value="tasks"
          class="flex-1 overflow-hidden mt-0 data-[state=inactive]:hidden flex flex-col min-h-0 p-2"
        >
          <RequestAssociatedTasksCard
            :request="request"
            bare
            :limit="50"
            navigate-to-task-detail
          />
        </TabsContent>
      </div>
    </Tabs>

    <!-- Opportunity: full tabbed layout -->
    <Tabs v-else v-model="activeTab" class="flex flex-col flex-1 min-h-0 overflow-hidden gap-0">
      <TabsList class="flex shrink-0 border-0 bg-background rounded-none w-full relative h-full">
        <TabsTrigger
          value="communicate"
          class="flex items-center gap-2 text-sm font-medium transition-all relative flex-1 justify-center bg-transparent outline-none h-full"
          :class="activeTab === 'communicate' ? 'text-foreground' : 'text-muted-foreground hover:text-muted-foreground'"
        >
          <span>Communicate</span>
          <span
            v-if="activeTab === 'communicate'"
            class="absolute bottom-0 left-0 right-0 h-[2px] bg-primary z-10"
          />
        </TabsTrigger>
        <TabsTrigger
          value="data"
          class="flex items-center gap-2 text-sm font-medium transition-all relative flex-1 justify-center bg-transparent outline-none h-full"
          :class="activeTab === 'data' ? 'text-foreground' : 'text-muted-foreground hover:text-muted-foreground'"
        >
          <span>Data</span>
          <span
            v-if="activeTab === 'data'"
            class="absolute bottom-0 left-0 right-0 h-[2px] bg-primary z-10"
          />
        </TabsTrigger>
        <TabsTrigger
          value="appointments"
          class="flex items-center gap-2 text-sm font-medium transition-all relative flex-1 justify-center bg-transparent outline-none h-full"
          :class="activeTab === 'appointments' ? 'text-foreground' : 'text-muted-foreground hover:text-muted-foreground'"
        >
          <span>Appointments</span>
          <span
            v-if="activeTab === 'appointments'"
            class="absolute bottom-0 left-0 right-0 h-[2px] bg-primary z-10"
          />
        </TabsTrigger>
        <TabsTrigger
          value="offers"
          class="flex items-center gap-2 text-sm font-medium transition-all relative flex-1 justify-center bg-transparent outline-none h-full"
          :class="activeTab === 'offers' ? 'text-foreground' : 'text-muted-foreground hover:text-muted-foreground'"
        >
          <span>Offers</span>
          <span
            v-if="activeTab === 'offers'"
            class="absolute bottom-0 left-0 right-0 h-[2px] bg-primary z-10"
          />
        </TabsTrigger>
        <TabsTrigger
          value="contracts"
          class="flex items-center gap-2 text-sm font-medium transition-all relative flex-1 justify-center bg-transparent outline-none h-full"
          :class="activeTab === 'contracts' ? 'text-foreground' : 'text-muted-foreground hover:text-muted-foreground'"
        >
          <span>Contracts</span>
          <span
            v-if="activeTab === 'contracts'"
            class="absolute bottom-0 left-0 right-0 h-[2px] bg-primary z-10"
          />
        </TabsTrigger>
        <TabsTrigger
          v-if="showTasksTab"
          value="tasks"
          class="flex items-center gap-2 text-sm font-medium transition-all relative flex-1 justify-center bg-transparent outline-none h-full"
          :class="activeTab === 'tasks' ? 'text-foreground' : 'text-muted-foreground hover:text-muted-foreground'"
        >
          <span>Tasks</span>
          <span
            v-if="activeTab === 'tasks'"
            class="absolute bottom-0 left-0 right-0 h-[2px] bg-primary z-10"
          />
        </TabsTrigger>
      </TabsList>

      <div class="flex-1 min-h-0 flex flex-col overflow-y-auto bg-muted">
        <TabsContent value="communicate" class="flex-1 overflow-y-auto space-y-2 p-2 mt-0 data-[state=inactive]:hidden min-h-0">
          <div class="rounded-lg flex flex-col bg-background pt-1 px-1 pb-1">
          <CommunicationWidget
            :task-type="request?.type || 'lead'"
            :task-id="request?.id"
            :phone-number="customerPhone"
            :contact-name="customerName"
            :inline="true"
            selection-card-title="Call or send message"
            selection-card-description="Log a call outcome or send an email, SMS or WhatsApp to this customer."
            @save="handleCommunicationSave"
          />
          </div>
        </TabsContent>

        <TabsContent value="data" class="flex-1 overflow-y-auto p-2 mt-0 data-[state=inactive]:hidden min-h-0">
        <RequestDataTabContent
          :activities="requestActivities"
          :task-type="request?.type || 'opportunity'"
          :task-id="request?.id"
          :customer-initials="customerInitials"
          @note-save="handleNoteSave"
          @note-delete="handleNoteDelete"
          @attachment-save="handleAttachmentSave"
          @attachment-delete="handleAttachmentDelete"
        />
        </TabsContent>

        <TabsContent value="appointments" class="flex-1 overflow-y-auto px-1 py-2 mt-0 data-[state=inactive]:hidden min-h-0">
        <RequestAppointmentsTabContent
          :request="request"
          :appointments="appointments"
          :show-add-button="!!customerId"
          @add-appointment="showCreateAppointmentModal = true"
          @appointment-no-show="handleAppointmentNoShow"
          @appointment-created="handleAppointmentCreated"
        />
        </TabsContent>

        <TabsContent value="offers" class="flex-1 overflow-y-auto p-2 mt-0 data-[state=inactive]:hidden min-h-0">
        <OfferCarousel
          ref="offerCarouselRef"
          :offers="request?.offers || []"
          :opportunity-id="request?.id"
          @offer-activated="handleOfferActivated"
          @offer-accepted="handleOfferAccepted"
          @generate-pdf="handleOfferPDFGenerate"
          @add="showAddOfferModal = true"
        />
        </TabsContent>

        <TabsContent value="contracts" class="flex-1 overflow-y-auto p-2 mt-0 data-[state=inactive]:hidden min-h-0">
        <ContractCarousel
          ref="contractCarouselRef"
          :contracts="contracts"
          :opportunity-id="request?.id"
          :max-contract-date="maxContractDate"
          @generate-pdf="handleContractPDFGenerate"
          @collect-esignatures="handleCollectESignatures"
          @add="showCreateContractModal = true"
        />
        </TabsContent>
        <TabsContent
          v-if="showTasksTab"
          value="tasks"
          class="flex-1 overflow-hidden mt-0 data-[state=inactive]:hidden flex flex-col min-h-0 p-2"
        >
          <RequestAssociatedTasksCard
            :request="request"
            bare
            :limit="50"
            navigate-to-task-detail
          />
        </TabsContent>
      </div>
    </Tabs>

    <ComingSoonModal :show="showPDFComingSoon" @close="showPDFComingSoon = false" />

    <AddOfferModal
      v-if="showAddOfferModal"
      :show="showAddOfferModal"
      :opportunity="request"
      @confirm="handleOfferCreatedFromModal"
      @cancel="showAddOfferModal = false"
    />

    <CreateContractModal
      v-if="showCreateContractModal"
      :show="showCreateContractModal"
      :max-contract-date="maxContractDate"
      @confirm="handleContractCreatedFromModal"
      @cancel="showCreateContractModal = false"
    />

    <CreateEventModal
      v-if="showCreateAppointmentModal"
      :show="showCreateAppointmentModal"
      :customer="request?.customer"
      :assignee="request?.assignee"
      :disabled-fields="['customer']"
      :dealerships="dealerships"
      @create="handleAppointmentCreated"
      @cancel="showCreateAppointmentModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@motork/component-library/future/primitives'
import CommunicationWidget from '@/components/shared/communication/CommunicationWidget.vue'
import RequestAppointmentsTabContent from './RequestAppointmentsTabContent.vue'
import RequestDataTabContent from './RequestDataTabContent.vue'
import RequestAssociatedTasksCard from './RequestAssociatedTasksCard.vue'
import OfferCarousel from '@/components/shared/OfferCarousel.vue'
import ContractCarousel from '@/components/shared/ContractCarousel.vue'
import ComingSoonModal from '@/components/modals/ComingSoonModal.vue'
import AddOfferModal from '@/components/modals/AddOfferModal.vue'
import CreateContractModal from '@/components/modals/CreateContractModal.vue'
import CreateEventModal from '@/components/modals/CreateEventModal.vue'
import { fetchAppointmentsByCustomerId, createCalendarEvent, fetchCalendarFilterOptions } from '@/api/calendar'
import { useLeadsStore } from '@/stores/leads'
import { useOpportunitiesStore } from '@/stores/opportunities'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  request: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['offer-saved', 'appointment-created', 'request-navigate'])

const showTasksTab = computed(() => !!(props.request?.customer || props.request?.customerId))
const activeTab = ref('communicate')

watch(showTasksTab, (show) => {
  if (!show && activeTab.value === 'tasks') {
    activeTab.value = 'communicate'
  }
})
const showCreateAppointmentModal = ref(false)
const appointments = ref([])
const dealerships = ref([])
const showPDFComingSoon = ref(false)
const showAddOfferModal = ref(false)
const showCreateContractModal = ref(false)
const offerCarouselRef = ref(null)
const contractCarouselRef = ref(null)
const leadsStore = useLeadsStore()
const opportunitiesStore = useOpportunitiesStore()
const userStore = useUserStore()

const requestActivities = computed(() => {
  if (!props.request) return []
  let list = []
  if (props.request.type === 'lead') {
    if (leadsStore.currentLead?.id === props.request.id) {
      list = leadsStore.currentLeadActivities || []
    }
  } else if (props.request.type === 'opportunity') {
    if (opportunitiesStore.currentOpportunity?.id === props.request.id) {
      list = opportunitiesStore.currentOpportunityActivities || []
    }
  }
  return [...list]
})

const customerName = computed(() => {
  const c = props.request?.customer
  if (!c) return 'Customer'
  if (c.name) return c.name
  if (c.firstName || c.lastName) return [c.firstName, c.lastName].filter(Boolean).join(' ').trim()
  if (c.email) return c.email.split('@')[0] || 'Customer'
  return 'Customer'
})

const customerPhone = computed(() => props.request?.customer?.phone || '')
const customerInitials = computed(() => {
  const c = props.request?.customer
  if (c?.initials) return c.initials
  if (c?.name) return c.name.split(/\s+/).map((n) => n[0]).join('').slice(0, 2).toUpperCase()
  return '?'
})
const customerId = computed(() => {
  const c = props.request?.customer
  return c?.id ?? props.request?.customerId ?? null
})

const isOpportunity = computed(() => props.request?.type === 'opportunity')
const isLead = computed(() => props.request?.type === 'lead')

async function loadAppointments() {
  const id = customerId.value
  if (!id) {
    appointments.value = []
    return
  }
  try {
    appointments.value = await fetchAppointmentsByCustomerId(id) || []
  } catch {
    appointments.value = []
  }
}

watch(customerId, loadAppointments, { immediate: true })

onMounted(async () => {
  try {
    const opts = await fetchCalendarFilterOptions()
    dealerships.value = opts.dealerships || []
  } catch {
    dealerships.value = []
  }
})

async function handleAppointmentCreated(eventData) {
  try {
    if (!eventData || (typeof eventData === 'object' && !eventData.start)) {
      // From RequestAppointmentsTabContent (no-show flow, confirm, reschedule)
      await loadAppointments()
      if (props.request?.type === 'opportunity') {
        await opportunitiesStore.fetchOpportunityById(props.request.id)
      }
      emit('appointment-created')
      return
    }
    const payload = {
      ...eventData,
      customerId: customerId.value,
      customer: props.request?.customer?.name || customerName.value
    }
    await createCalendarEvent(payload)
    await loadAppointments()
    emit('appointment-created')
  } catch (err) {
    console.error('Failed to create appointment:', err)
  } finally {
    showCreateAppointmentModal.value = false
  }
}

function handleAppointmentNoShow() {
  if (props.request?.type === 'opportunity') {
    opportunitiesStore.fetchOpportunityById(props.request.id)
  }
  loadAppointments()
  emit('appointment-created')
}

const contracts = computed(() => {
  const opp = props.request
  if (!opp) return []
  if (Array.isArray(opp.contracts) && opp.contracts.length > 0) return opp.contracts
  if (!opp.contractDate) return []
  return [{
    id: opp.id || `contract-${opp.contractDate}`,
    contractDate: opp.contractDate,
    contractNotes: opp.contractNotes,
    contractSigned: opp.contractSigned,
    esignatureCollectedDate: opp.esignatureCollectedDate,
    version: opp.contractVersion || 1,
    status: opp.contractSigned || opp.esignatureCollectedDate ? 'signed' : 'active'
  }]
})

const maxContractDate = computed(() => {
  const d = new Date()
  return d.toISOString().slice(0, 10)
})

async function handleNoteSave(data) {
  if (!props.request?.id) return
  const activity = {
    type: 'note',
    user: userStore.currentUser?.name || 'You',
    action: data.action || 'added a note',
    content: data.content || data.message || '',
    timestamp: data.timestamp || new Date().toISOString()
  }
  if (data.isEdit && data.id) {
    if (props.request.type === 'lead') {
      await leadsStore.updateActivity(props.request.id, data.id, activity)
    } else if (props.request.type === 'opportunity') {
      await opportunitiesStore.updateActivity(props.request.id, data.id, activity)
    }
  } else {
    if (props.request.type === 'lead') {
      await leadsStore.addActivity(props.request.id, activity)
    } else if (props.request.type === 'opportunity') {
      await opportunitiesStore.addActivity(props.request.id, activity)
    }
  }
  if (props.request.type === 'lead') await leadsStore.fetchLeadById(props.request.id)
  else if (props.request.type === 'opportunity') await opportunitiesStore.fetchOpportunityById(props.request.id)
}

async function handleNoteDelete(item) {
  if (!props.request?.id || !item?.id) return
  if (props.request.type === 'lead') {
    await leadsStore.deleteActivity(props.request.id, item.id)
    await leadsStore.fetchLeadById(props.request.id)
  } else if (props.request.type === 'opportunity') {
    await opportunitiesStore.deleteActivity(props.request.id, item.id)
    await opportunitiesStore.fetchOpportunityById(props.request.id)
  }
}

async function handleAttachmentSave(data) {
  if (!props.request?.id) return
  const activity = {
    type: 'attachment',
    user: userStore.currentUser?.name || 'You',
    action: data.action || 'uploaded an attachment',
    content: data.content || (data.fileName ? `Attachment: ${data.fileName}` : ''),
    fileName: data.fileName,
    data: data.data || {},
    timestamp: data.timestamp || new Date().toISOString()
  }
  if (data.isEdit && data.id) {
    if (props.request.type === 'lead') {
      await leadsStore.updateActivity(props.request.id, data.id, activity)
    } else if (props.request.type === 'opportunity') {
      await opportunitiesStore.updateActivity(props.request.id, data.id, activity)
    }
  } else {
    if (props.request.type === 'lead') {
      await leadsStore.addActivity(props.request.id, activity)
    } else if (props.request.type === 'opportunity') {
      await opportunitiesStore.addActivity(props.request.id, activity)
    }
  }
  if (props.request.type === 'lead') await leadsStore.fetchLeadById(props.request.id)
  else if (props.request.type === 'opportunity') await opportunitiesStore.fetchOpportunityById(props.request.id)
}

async function handleAttachmentDelete(item) {
  if (!props.request?.id || !item?.id) return
  if (props.request.type === 'lead') {
    await leadsStore.deleteActivity(props.request.id, item.id)
    await leadsStore.fetchLeadById(props.request.id)
  } else if (props.request.type === 'opportunity') {
    await opportunitiesStore.deleteActivity(props.request.id, item.id)
    await opportunitiesStore.fetchOpportunityById(props.request.id)
  }
}

async function handleCommunicationSave(data) {
  if (!props.request?.id) return
  const commType = data.communicationType || data.type
  const actionByType = commType === 'email' ? 'sent an email' : commType === 'whatsapp' ? 'sent a WhatsApp message' : commType === 'sms' ? 'sent an SMS' : 'logged communication'
  const activity = {
    type: commType,
    user: userStore.currentUser?.name || 'You',
    action: actionByType,
    content: data.content || data.message || data.notes || 'Communication logged',
    subject: data.subject,
    template: data.template,
    ...(data.timestamp && { timestamp: data.timestamp })
  }
  if (!activity.timestamp) activity.timestamp = new Date().toISOString()

  if (props.request.type === 'lead') {
    await leadsStore.addActivity(props.request.id, activity)
    await leadsStore.fetchLeadById(props.request.id)
  } else if (props.request.type === 'opportunity') {
    await opportunitiesStore.addActivity(props.request.id, activity)
    await opportunitiesStore.fetchOpportunityById(props.request.id)
  }
}

async function handleOfferActivated(offer) {
  if (!props.request?.id) return
  try {
    await opportunitiesStore.activateOffer(props.request.id, offer.id)
    await opportunitiesStore.fetchOpportunityById(props.request.id)
    emit('offer-saved')
  } finally {
    offerCarouselRef.value?.setOfferLoading?.(offer.id, false)
  }
}

async function handleOfferAccepted(offer, isRemoval = false) {
  if (!props.request?.id) return
  try {
    const opp = props.request
    const offers = (opp.offers || []).map((o) =>
      o.id === offer.id
        ? {
            ...o,
            acceptance_status: isRemoval ? 'pending' : 'accepted',
            acceptance_date: isRemoval ? null : new Date().toISOString(),
            acceptance_method: isRemoval ? null : 'manual'
          }
        : o
    )
    await opportunitiesStore.updateOpportunity(props.request.id, { offers })
    await opportunitiesStore.fetchOpportunityById(props.request.id)
    emit('offer-saved')
  } finally {
    offerCarouselRef.value?.setOfferLoading?.(offer.id, false)
  }
}

function handleOfferPDFGenerate() {
  showPDFComingSoon.value = true
}

async function handleOfferCreatedFromModal(offerPayload) {
  if (!offerPayload?.data || !props.request?.id) return
  try {
    await opportunitiesStore.addOffer(props.request.id, {
      vehicleBrand: offerPayload.data?.brand || '',
      vehicleModel: offerPayload.data?.model || '',
      vehicleYear: offerPayload.data?.year || '',
      price: offerPayload.data?.price || 0,
      data: offerPayload.data
    })
    await opportunitiesStore.addActivity(props.request.id, {
      type: 'offer',
      user: userStore.currentUser?.name || 'You',
      action: 'created an offer',
      content: `Offer created: ${offerPayload.data?.brand} ${offerPayload.data?.model} (${offerPayload.data?.year}) - € ${(offerPayload.data?.price || 0).toLocaleString()}`,
      data: offerPayload.data,
      timestamp: new Date().toISOString()
    })
    showAddOfferModal.value = false
    emit('offer-saved')
  } catch (err) {
    console.error('Failed to create offer:', err)
  }
}

async function handleContractCreatedFromModal(payload) {
  if (!payload?.contractDate || !props.request?.id) return
  try {
    const opp = props.request
    const acceptedOffer = opp.offers?.find(o => o.status === 'accepted' || o.acceptance_status === 'accepted')
    await opportunitiesStore.addContract(opp.id, {
      contractDate: payload.contractDate,
      contractTime: payload.contractTime,
      notes: payload.notes,
      lockedOfferId: acceptedOffer?.id,
      lockedTradeInLabel: acceptedOffer?.data?.selectedTradeInLabel,
      lockedFinancingLabel: acceptedOffer?.data?.selectedFinancingLabel,
      lockedPrice: acceptedOffer?.price
    })
    const datetime = payload.contractTime
      ? `${payload.contractDate}T${payload.contractTime}:00`
      : `${payload.contractDate}T12:00:00`
    await opportunitiesStore.addActivity(opp.id, {
      type: 'contract',
      user: userStore.currentUser?.name || 'You',
      action: 'created a contract',
      content: `Contract created: ${new Date(datetime).toLocaleString()}${acceptedOffer ? ` (Locked terms from Offer #${acceptedOffer.id})` : ''}`,
      data: {
        contractDate: datetime,
        notes: payload.notes,
        lockedOfferId: acceptedOffer?.id
      },
      timestamp: new Date().toISOString()
    })
    showCreateContractModal.value = false
    emit('offer-saved')
  } catch (err) {
    console.error('Failed to create contract:', err)
  }
}

function handleContractPDFGenerate() {
  showPDFComingSoon.value = true
}

async function handleCollectESignatures(data) {
  if (!props.request?.id) return
  const contract = data.contract || data
  try {
    const formData = data.formData || {}
    const updates = {
      contractSigned: true,
      ...(formData.contractDate && { contractDate: formData.contractDate }),
      ...(formData.notes && { contractNotes: formData.notes })
    }
    if (!props.request.esignatureCollectedDate) {
      updates.esignatureCollectedDate = formData.contractDate || new Date().toISOString()
    }
    await opportunitiesStore.updateOpportunity(props.request.id, updates)
    await opportunitiesStore.addActivity(props.request.id, {
      type: 'contract',
      user: userStore.currentUser?.name || 'You',
      action: 'collected e-signatures',
      content: `E-signatures collected for contract${contract.version ? ` v${contract.version}` : ''}`,
      data: { contractDate: formData.contractDate || contract.contractDate },
      timestamp: new Date().toISOString()
    })
    await opportunitiesStore.fetchOpportunityById(props.request.id)
  } catch (err) {
    console.error('Failed to collect e-signatures:', err)
  } finally {
    contractCarouselRef.value?.setContractLoading?.(contract?.id || contract?.contractDate, false)
  }
}
</script>

<style scoped>
/* Tab styling to match task detail page */
:deep([role="tablist"]) {
  border: none !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
  padding: 0 !important;
  margin: 0 !important;
  gap: 0 !important;
  height: auto !important;
  min-height: 48px !important;
}

:deep([role="tab"]) {
  background: transparent !important;
  border: none !important;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
  border-bottom: none !important;
  margin: 0 !important;
  padding: 12px 16px !important;
  position: relative !important;
  box-shadow: none !important;
  height: 100% !important;
  min-height: 48px !important;
}

:deep([role="tab"]::before),
:deep([role="tab"]::after) {
  display: none !important;
  box-shadow: none !important;
}

:deep([role="tab"] *) {
  box-shadow: none !important;
}

:deep([role="tab"][data-state="active"]) {
  color: var(--color-text-foreground) !important;
  box-shadow: none !important;
}

:deep([role="tab"][data-state="inactive"]) {
  color: var(--color-text-muted-foreground) !important;
  box-shadow: none !important;
}
</style>
