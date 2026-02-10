<template>
  <div class="relative flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
    <div v-if="displayTask" class="flex flex-col flex-1 min-h-0 overflow-hidden">
      <!-- Task Header -->
      <TaskDetailHeader
        :task="displayTask"
        :filtered-tasks="filteredTasks"
        :is-drawer-view="isDrawerView"
        @previous="handlePrevious"
        @next="handleNext"
        @close="$emit('close')"
        @postpone-expected-close="handlePostponeExpectedClose"
        @tag-updated="handleTagUpdated"
        @reassigned="handleReassigned"
      />

      <!-- Center + Right Panels Row -->
      <div class="flex flex-1 min-h-0 overflow-hidden">
        <!-- Center Panel: Task Management Widget Only -->
        <div class="flex-1 flex flex-col min-h-0 overflow-hidden bg-white min-w-0">
          <TaskAssigneeDateBar
            v-if="displayTask"
            :task="displayTask"
            @reassigned="handleReassigned"
            @postpone-expected-close="handlePostponeExpectedClose"
          />
          <div class="flex-1 min-h-0 overflow-y-auto">
            <div class="p-2">
              <TaskManagementCard
                v-if="managementWidget && storeAdapter"
                ref="managementCardRef"
                :task="displayTask"
                :type="displayTask.type"
                :management-widget="managementWidget"
                :activities="allActivities"
                v-bind="$attrs"
              />
            </div>
          </div>
        </div>

        <!-- Right Sidebar with Tabs -->
        <div
          class="right-sidebar flex flex-col min-h-0 overflow-hidden shrink-0 border-l border-border bg-background"
        >
          <Tabs v-model="sidebarTab" class="flex flex-col flex-1 min-h-0 overflow-hidden gap-0">
            <!-- Sidebar Tabs -->
            <TabsList class="flex shrink-0 border-0 bg-background rounded-none w-full relative h-full">
              <TabsTrigger 
                value="request" 
                class="flex items-center gap-2 text-sm font-medium transition-all relative flex-1 justify-center bg-transparent outline-none h-full"
                :class="sidebarTab === 'request' 
                  ? 'text-foreground' 
                  : 'text-muted-foreground hover:text-muted-foreground'"
              >
                <span>Request</span>
                <span 
                  v-if="requestCount > 0"
                  class="flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-xs font-bold leading-none"
                  :class="sidebarTab === 'request' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-200 text-foreground'"
                >
                  {{ requestCount }}
                </span>
                <span 
                  v-if="sidebarTab === 'request'"
                  class="absolute bottom-0 left-0 right-0 h-[2px] bg-primary z-10"
                ></span>
              </TabsTrigger>
              <TabsTrigger 
                value="activity" 
                class="flex items-center gap-2 text-sm font-medium transition-all relative flex-1 justify-center bg-transparent outline-none h-full"
                :class="sidebarTab === 'activity' 
                  ? 'text-foreground' 
                  : 'text-muted-foreground hover:text-muted-foreground'"
              >
                <span>Activity</span>
                <span 
                  v-if="activityCount > 0"
                  class="flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-xs font-bold leading-none"
                  :class="sidebarTab === 'activity' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-200 text-foreground'"
                >
                  {{ activityCount }}
                </span>
                <span 
                  v-if="sidebarTab === 'activity'"
                  class="absolute bottom-0 left-0 right-0 h-[2px] bg-primary z-10"
                ></span>
              </TabsTrigger>
            </TabsList>
            
            <!-- Sidebar Content -->
            <div class="flex-1 min-h-0 flex flex-col overflow-y-auto bg-muted">
              <!-- Request Tab -->
              <TabsContent value="request" class="space-y-2 p-2 mt-0 flex-1 min-h-full">
                <TaskContactCard
                  :task="displayTask"
                  :task-type="displayTask.type"
                  :customer-id="displayTask.customerId || displayTask.customer?.id"
                  @action="handleContactAction"
                />
                <VehicleRequestCard
                  v-if="displayTask.requestedCar || displayTask.vehicle"
                  :vehicle="displayTask.requestedCar || displayTask.vehicle"
                  :request-message="displayTask.requestMessage || displayTask.requestedCar?.requestMessage"
                  :source="displayTask.source"
                  :image-url="getCarImageUrl(displayTask.requestedCar || displayTask.vehicle)"
                  @open-ad="handleOpenAd"
                  @more-actions="handleMoreActions"
                />
                <OtherCustomerRequestsCard
                  :task="displayTask"
                />
                <TradeInsCard
                  v-if="displayTask.type !== 'lead' || (displayTask.tradeIns || []).length > 0"
                  :items="displayTask.tradeIns || []"
                  :add-loading="tradeInActionLoading"
                  @open-add="editingTradeIn = null; showTradeInModal = true"
                  @open-edit="openTradeInEdit"
                />
                <FinancingOptionsCard
                  v-if="displayTask.type !== 'lead' || (displayTask.financingOptions || []).length > 0"
                  :items="displayTask.financingOptions || []"
                  @open-add="editingFinancingOption = null; showFinancingModal = true"
                  @open-edit="openFinancingEdit"
                />
              </TabsContent>
              
              <!-- Activity Tab -->
              <TabsContent value="activity" class="p-2 flex-1 overflow-visible h-full flex flex-col mt-0">
                <TaskActivityCard
                  :activities="allActivities"
                  :expanded-summaries="expandedSummaries"
                  @activity-click="handleActivityClick"
                  @toggle-summary-expanded="toggleSummaryExpanded"
                  @add-activity="handleAddActivity"
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="flex-1 flex items-center justify-center bg-surface">
      <div class="text-center max-w-sm p-8">
        <div class="w-16 h-16 mx-auto mb-4 rounded-lg bg-muted flex items-center justify-center">
          <ListTodo class="w-8 h-8 shrink-0 text-muted-foreground" />
        </div>
        <h3 class="text-lg font-bold text-foreground mb-2">No task selected</h3>
        <p class="text-sm text-muted-foreground">Select a task from the list to view its details and manage activities</p>
      </div>
    </div>
    
    <!-- Activity Modals -->
    <NoteWidget
      modal
      :show="showNoteModal"
      :task-type="displayTask?.type || 'lead'"
      :task-id="displayTask?.id"
      @save="handleNoteSave"
      @close="showNoteModal = false"
    />
    
    <AttachmentWidget
      modal
      :show="showAttachmentModal"
      :task-type="displayTask?.type || 'lead'"
      :task-id="displayTask?.id"
      @save="handleAttachmentSave"
      @close="showAttachmentModal = false"
    />
    
    <AddWhatsAppModal
      :show="showWhatsAppModal"
      @save="handleWhatsAppSave"
      @close="showWhatsAppModal = false"
    />
    
    <AddSMSModal
      :show="showSMSModal"
      @save="handleSMSSave"
      @close="showSMSModal = false"
    />
    
    <AddEmailModal
      :show="showEmailModal"
      @save="handleEmailSave"
      @close="showEmailModal = false"
    />
    
    <ComingSoonModal
      :show="showComingSoonModal"
      title="Call Feature"
      @close="showComingSoonModal = false"
    />
    
    <PurchaseMethodModal
      :show="showFinancingModal"
      :task-type="displayTask?.type || 'lead'"
      :task-id="displayTask?.id"
      :purchase-method="editingFinancingOption"
      standalone
      @save="handleFinancingSave"
      @delete="handleFinancingDelete"
      @close="showFinancingModal = false; editingFinancingOption = null"
    />
    
    <AddVehicleModal
      :show="showTradeInModal"
      mode="tradein"
      :task-type="displayTask?.type || 'lead'"
      :task-id="displayTask?.id"
      :item="editingTradeIn"
      :loading="tradeInActionLoading"
      @save="handleTradeInSave"
      @delete="handleTradeInDelete"
      @close="showTradeInModal = false; editingTradeIn = null"
    />
    
    <OfferModal
      :show="showOfferModal"
      :task-type="displayTask?.type || 'lead'"
      :task-id="displayTask?.id"
      :customer="displayTask?.customer"
      @save="handleOfferSave"
      @close="showOfferModal = false"
    />
    
    <CreateEventModal
      :show="showAppointmentModal"
      :customer="displayTask?.customer"
      :assignee="displayTask?.assignee"
      @create="handleAppointmentSave"
      @cancel="showAppointmentModal = false"
    />
  </div>
</template>

<script setup>
import { ListTodo } from 'lucide-vue-next'
import { ref, computed, nextTick } from 'vue'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@motork/component-library/future/primitives'
import { useLeadsStore } from '@/stores/leads'
import { useOpportunitiesStore } from '@/stores/opportunities'
import { useUserStore } from '@/stores/user'
import { useToastStore } from '@/stores/toast'
import { getDisplayStage } from '@/utils/stageMapper'
import TaskDetailHeader from './TaskDetailHeader.vue'
import TaskAssigneeDateBar from './TaskAssigneeDateBar.vue'
import TaskManagementCard from './TaskManagementCard.vue'
import TaskContactCard from './TaskContactCard.vue'
import OtherCustomerRequestsCard from './OtherCustomerRequestsCard.vue'
import VehicleRequestCard from './VehicleRequestCard.vue'
import TaskActivityCard from './TaskActivityCard.vue'
import TradeInsCard from '@/components/shared/TradeInsCard.vue'
import FinancingOptionsCard from '@/components/shared/FinancingOptionsCard.vue'
import NoteWidget from '@/components/customer/activities/NoteWidget.vue'
import AttachmentWidget from '@/components/customer/activities/AttachmentWidget.vue'
import AddWhatsAppModal from '@/components/modals/AddWhatsAppModal.vue'
import AddSMSModal from '@/components/modals/AddSMSModal.vue'
import AddEmailModal from '@/components/modals/AddEmailModal.vue'
import ComingSoonModal from '@/components/modals/ComingSoonModal.vue'
import PurchaseMethodModal from '@/components/modals/PurchaseMethodModal.vue'
import AddVehicleModal from '@/components/modals/AddVehicleModal.vue'
import OfferModal from '@/components/modals/OfferModal.vue'
import CreateEventModal from '@/components/modals/CreateEventModal.vue'

const props = defineProps({
  task: { 
    type: Object, 
    default: null 
  },
  managementWidget: { 
    type: Object, 
    default: null 
  },
  storeAdapter: { 
    type: Object, 
    default: null 
  },
  addNewConfig: { 
    type: Object, 
    default: null 
  },
  filteredTasks: { 
    type: Array, 
    default: () => [] 
  },
  isDrawerView: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['task-navigate', 'close', 'postpone-expected-close'])

const leadsStore = useLeadsStore()
const opportunitiesStore = useOpportunitiesStore()
const userStore = useUserStore()
const toastStore = useToastStore()

// Use store's current lead/opportunity when id matches so drawer and card view show the same loaded data and stay in sync after LQ actions (no-answer, not interested)
const displayTask = computed(() => {
  const t = props.task
  if (!t) return null
  if (t.type === 'lead' && leadsStore.currentLead?.id === t.id) {
    const lead = leadsStore.currentLead
    return {
      ...lead,
      type: 'lead',
      compositeId: `lead-${lead.id}`,
      displayStage: getDisplayStage(lead, 'lead')
    }
  }
  if (t.type === 'opportunity' && opportunitiesStore.currentOpportunity?.id === t.id) {
    const opp = opportunitiesStore.currentOpportunity
    return {
      ...opp,
      type: 'opportunity',
      compositeId: `opportunity-${opp.id}`,
      displayStage: getDisplayStage(opp, 'opportunity')
    }
  }
  return t
})

const activityAuthor = computed(() =>
  displayTask.value?.assignee || userStore.currentUser?.name || 'You'
)

// Sidebar tab state
const sidebarTab = ref('request')

// Expanded summaries state for activity details
const expandedSummaries = ref({})

// Activity modals
const showNoteModal = ref(false)
const showAttachmentModal = ref(false)
const showWhatsAppModal = ref(false)
const showSMSModal = ref(false)
const showEmailModal = ref(false)
const showComingSoonModal = ref(false)
const showFinancingModal = ref(false)
const showTradeInModal = ref(false)
const tradeInActionLoading = ref(false)
const editingTradeIn = ref(null)
const editingFinancingOption = ref(null)
const showOfferModal = ref(false)
const showAppointmentModal = ref(false)
const managementCardRef = ref(null)

// Handle postpone expected close date
function handlePostponeExpectedClose() {
  // Emit event - parent (Tasks.vue) will need to handle this
  // For now, we'll use a simpler approach: the event bubbles up
  emit('postpone-expected-close', displayTask.value ?? props.task)
}

// Activities
const allActivities = computed(() => {
  if (!props.storeAdapter) return []
  return props.storeAdapter.currentActivities?.value || []
})

// Badge counts
const activityCount = computed(() => {
  return allActivities.value.length
})

const requestCount = computed(() => {
  if (!displayTask.value?.customer) return 0

  const customerEmail = displayTask.value.customer.email
  const customerPhone = displayTask.value.customer.phone
  const currentTaskId = displayTask.value.compositeId || `${displayTask.value.type}-${displayTask.value.id}`
  
  // Combine all leads and opportunities
  const allTasks = [
    ...(leadsStore.leads || []).map(lead => ({ ...lead, type: 'lead', compositeId: `lead-${lead.id}` })),
    ...(opportunitiesStore.opportunities || []).map(opp => ({ ...opp, type: 'opportunity', compositeId: `opportunity-${opp.id}` }))
  ]
  
  // Filter by same customer (email or phone match) and exclude current task
  const relatedTasks = allTasks.filter(task => {
    if (task.compositeId === currentTaskId) return false
    if (!task.customer) return false
    
    return task.customer.email === customerEmail || task.customer.phone === customerPhone
  })
  
  return relatedTasks.length
})

// Navigation handlers
const handlePrevious = () => {
  emit('task-navigate', 'previous')
}

const handleNext = () => {
  emit('task-navigate', 'next')
}

// Activity interaction
const handleActivityClick = (activity) => {
  // Switch to activity tab if not already there
  if (sidebarTab.value !== 'activity') {
    sidebarTab.value = 'activity'
  }
  // TODO: open modal for detailed activity view
}

const toggleSummaryExpanded = (activityId) => {
  expandedSummaries.value[activityId] = !expandedSummaries.value[activityId]
}

// Action handlers
const getCarImageUrl = (vehicle) => {
  if (!vehicle) return ''
  return vehicle.image || vehicle.imageUrl || ''
}

const handleOpenAd = () => {
  // TODO: open ad
}

const handleMoreActions = () => {
  // TODO: more actions menu
}

const handleContactAction = () => {
  // TODO: contact action
}

function openTradeInEdit(t) {
  editingTradeIn.value = t
  nextTick(() => {
    showTradeInModal.value = true
  })
}

function openFinancingEdit(f) {
  editingFinancingOption.value = f
  nextTick(() => {
    showFinancingModal.value = true
  })
}

// Handle add activity from TaskActivityCard
const handleAddActivity = (activityType) => {
  if (activityType === 'note') {
    showNoteModal.value = true
  } else if (activityType === 'attachment') {
    showAttachmentModal.value = true
  } else if (activityType === 'whatsapp') {
    showWhatsAppModal.value = true
  } else if (activityType === 'sms') {
    showSMSModal.value = true
  } else if (activityType === 'email') {
    showEmailModal.value = true
  } else if (activityType === 'call') {
    showComingSoonModal.value = true
  } else if (activityType === 'financing') {
    editingFinancingOption.value = null
    showFinancingModal.value = true
  } else if (activityType === 'tradein') {
    editingTradeIn.value = null
    showTradeInModal.value = true
  } else if (activityType === 'purchase') {
    showOfferModal.value = true
  } else if (activityType === 'appointment') {
    showAppointmentModal.value = true
  }
}

// Activity modal save handlers
const handleNoteSave = async (noteData) => {
  if (!props.storeAdapter || !props.task) return
  try {
    await props.storeAdapter.addActivity(props.task.id, {
      type: 'note',
      user: activityAuthor.value,
      action: 'added a note',
      content: noteData.content || noteData.message,
      message: noteData.content || noteData.message,
      timestamp: new Date().toISOString()
    })
    showNoteModal.value = false
  } catch (error) {
    console.error('Error saving note:', error)
  }
}

async function handleAddTradeIn(item) {
  if (!props.storeAdapter || !props.task) return
  try {
    const list = [...(props.task.tradeIns || []), item]
    if (props.task.type === 'lead') {
      await props.storeAdapter.updateLead?.(props.task.id, { tradeIns: list })
      await props.storeAdapter.loadLeadById?.(props.task.id)
    } else {
      await props.storeAdapter.updateOpportunity?.(props.task.id, { tradeIns: list })
      await props.storeAdapter.loadOpportunityById?.(props.task.id)
    }
  } catch (error) {
    console.error('Error adding trade-in:', error)
  }
}

async function handleAddFinancingOption(item) {
  if (!props.storeAdapter || !props.task) return
  try {
    const list = [...(props.task.financingOptions || []), item]
    if (props.task.type === 'lead') {
      await props.storeAdapter.updateLead?.(props.task.id, { financingOptions: list })
      await props.storeAdapter.loadLeadById?.(props.task.id)
    } else {
      await props.storeAdapter.updateOpportunity?.(props.task.id, { financingOptions: list })
      await props.storeAdapter.loadOpportunityById?.(props.task.id)
    }
  } catch (error) {
    console.error('Error adding financing option:', error)
  }
}

const handleAttachmentSave = async (attachmentData) => {
  if (!props.storeAdapter || !props.task) return
  try {
    await props.storeAdapter.addActivity(props.task.id, {
      type: 'attachment',
      user: activityAuthor.value,
      action: 'uploaded an attachment',
      fileName: attachmentData.fileName,
      file: attachmentData.file,
      content: `Attachment: ${attachmentData.fileName}`,
      timestamp: new Date().toISOString()
    })
    showAttachmentModal.value = false
  } catch (error) {
    console.error('Error saving attachment:', error)
  }
}

const handleWhatsAppSave = async (data) => {
  if (!props.storeAdapter || !props.task) return
  try {
    await props.storeAdapter.addActivity(props.task.id, {
      type: 'whatsapp',
      user: activityAuthor.value,
      action: 'sent a WhatsApp message',
      message: data.message,
      content: data.message,
      template: data.template,
      timestamp: new Date().toISOString()
    })
    showWhatsAppModal.value = false
  } catch (error) {
    console.error('Error saving WhatsApp:', error)
  }
}

const handleSMSSave = async (data) => {
  if (!props.storeAdapter || !props.task) return
  try {
    await props.storeAdapter.addActivity(props.task.id, {
      type: 'sms',
      user: activityAuthor.value,
      action: 'sent an SMS',
      message: data.message,
      content: data.message,
      template: data.template,
      timestamp: new Date().toISOString()
    })
    showSMSModal.value = false
  } catch (error) {
    console.error('Error saving SMS:', error)
  }
}

const handleEmailSave = async (data) => {
  if (!props.storeAdapter || !props.task) return
  try {
    await props.storeAdapter.addActivity(props.task.id, {
      type: 'email',
      user: activityAuthor.value,
      action: 'sent an email',
      subject: data.subject,
      message: data.message,
      content: data.message,
      template: data.template,
      timestamp: new Date().toISOString()
    })
    showEmailModal.value = false
  } catch (error) {
    console.error('Error saving email:', error)
  }
}

const handleFinancingSave = async (data) => {
  if (!props.storeAdapter || !props.task) return
  try {
    const typeLabel = data.type === 'FIN' ? 'Captive Financing' : data.type === 'LEA' ? 'Leasing' : data.type === 'LTR' ? 'Long-Term Rental' : data.type || 'Financing'
    const duration = data.fields?.duration ?? data.termMonths ?? null
    const content = duration ? `${typeLabel} ${duration} months` : typeLabel
    await props.storeAdapter.addActivity(props.task.id, {
      type: 'financing',
      user: activityAuthor.value,
      action: editingFinancingOption.value ? 'updated a financing proposal' : 'added a financing proposal',
      content: data.successMessage || content,
      data: { type: data.type, ...(data.fields || {}) },
      timestamp: new Date().toISOString()
    })
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
    const list = props.task.financingOptions || []
    const updatedList = editingFinancingOption.value
      ? list.map((f) => (String(f.id) === String(fullItem.id) ? fullItem : f))
      : [...list, fullItem]
    if (props.task.type === 'lead') {
      await props.storeAdapter.updateLead?.(props.task.id, { financingOptions: updatedList })
      await props.storeAdapter.loadLeadById?.(props.task.id)
    } else {
      await props.storeAdapter.updateOpportunity?.(props.task.id, { financingOptions: updatedList })
      await props.storeAdapter.loadOpportunityById?.(props.task.id)
    }
    showFinancingModal.value = false
    editingFinancingOption.value = null
  } catch (error) {
    console.error('Error saving financing:', error)
  }
}

async function handleFinancingDelete() {
  const toRemove = editingFinancingOption.value
  if (!toRemove || !props.storeAdapter || !props.task) return
  const newList = (props.task.financingOptions || []).filter((f) => String(f.id) !== String(toRemove.id))
  showFinancingModal.value = false
  editingFinancingOption.value = null
  try {
    if (props.task.type === 'lead') {
      await props.storeAdapter.updateLead?.(props.task.id, { financingOptions: newList })
    } else {
      await props.storeAdapter.updateOpportunity?.(props.task.id, { financingOptions: newList })
    }
  } catch (error) {
    toastStore.pushToast('error', 'Failed to delete financing option')
  }
}

const handleTradeInSave = async (data) => {
  if (!props.storeAdapter || !props.task) return
  tradeInActionLoading.value = true
  try {
    const v = data.vehicle || {}
    const parts = [v.brand, v.model].filter(Boolean)
    const label = (parts.length ? parts.join(' ') + (v.year ? ` (${v.year})` : '') : 'Trade-in') || 'Trade-in'
    const valuation = data.valuation?.tradeInPrice ?? 0
    await props.storeAdapter.addActivity(props.task.id, {
      type: 'tradein',
      user: activityAuthor.value,
      action: data.isEdit ? 'updated a trade-in' : 'added a trade-in',
      content: label,
      data: { vehicle: data.vehicle, valuation: data.valuation },
      timestamp: new Date().toISOString()
    })
    const fullItem = {
      id: data.id || `ti-${Date.now()}`,
      label: label || 'Trade-in',
      valuation: typeof valuation === 'number' ? valuation : parseFloat(valuation) || 0,
      vehicle: data.vehicle,
      valuationDetail: data.valuation
    }
    const list = props.task.tradeIns || []
    const updatedList = data.isEdit
      ? list.map((t) => (String(t.id) === String(fullItem.id) ? fullItem : t))
      : [...list, fullItem]
    if (props.task.type === 'lead') {
      await props.storeAdapter.updateLead?.(props.task.id, { tradeIns: updatedList })
      await props.storeAdapter.loadLeadById?.(props.task.id)
    } else {
      await props.storeAdapter.updateOpportunity?.(props.task.id, { tradeIns: updatedList })
      await props.storeAdapter.loadOpportunityById?.(props.task.id)
    }
    showTradeInModal.value = false
    editingTradeIn.value = null
  } catch (error) {
    console.error('Error saving trade-in:', error)
  } finally {
    tradeInActionLoading.value = false
  }
}

async function handleTradeInDelete() {
  const toRemove = editingTradeIn.value
  if (!toRemove || !props.storeAdapter || !props.task) return
  const newList = (props.task.tradeIns || []).filter((t) => String(t.id) !== String(toRemove.id))
  showTradeInModal.value = false
  editingTradeIn.value = null
  tradeInActionLoading.value = true
  try {
    if (props.task.type === 'lead') {
      await props.storeAdapter.updateLead?.(props.task.id, { tradeIns: newList })
    } else {
      await props.storeAdapter.updateOpportunity?.(props.task.id, { tradeIns: newList })
    }
  } catch (error) {
    toastStore.pushToast('error', 'Failed to delete trade-in')
  } finally {
    tradeInActionLoading.value = false
  }
}

const handleOfferSave = async (data) => {
  if (!props.storeAdapter || !props.task) return
  try {
    await props.storeAdapter.addActivity(props.task.id, {
      type: 'offer',
      user: activityAuthor.value,
      action: data.action || 'created an offer',
      content: data.content || `Offer: €${data.data?.price || 0}`,
      data: data.data,
      timestamp: new Date().toISOString()
    })
    showOfferModal.value = false
  } catch (error) {
    console.error('Error saving offer:', error)
  }
}

const handleAppointmentSave = async (data) => {
  if (!props.storeAdapter || !props.task) return
  try {
    await props.storeAdapter.addActivity(props.task.id, {
      type: 'appointment',
      user: activityAuthor.value,
      action: 'scheduled an appointment',
      content: `Appointment: ${data.type || 'Meeting'} on ${data.date || ''}`,
      data: data,
      timestamp: new Date().toISOString()
    })
    showAppointmentModal.value = false
  } catch (error) {
    console.error('Error saving appointment:', error)
  }
}

// Handle tag updates
const handleTagUpdated = async (data) => {
  if (!props.storeAdapter || !props.task) return
  
  try {
    const { tags } = data
    if (props.task.type === 'lead') {
      await props.storeAdapter.updateLead?.(props.task.id, { tags })
      // Reload the task to get updated data
      if (props.storeAdapter.loadLeadById) {
        await props.storeAdapter.loadLeadById(props.task.id)
      }
    } else if (props.task.type === 'opportunity') {
      await props.storeAdapter.updateOpportunity?.(props.task.id, { tags })
      // Reload the task to get updated data
      if (props.storeAdapter.loadOpportunityById) {
        await props.storeAdapter.loadOpportunityById(props.task.id)
      }
    }
  } catch (error) {
    console.error('Error updating tag:', error)
  }
}

// Handle reassignment
const handleReassigned = async (assignee) => {
  if (!props.storeAdapter || !props.task) return
  
  try {
    // Reload the task to get updated assignee data
    if (props.task.type === 'lead' && props.storeAdapter.loadLeadById) {
      await props.storeAdapter.loadLeadById(props.task.id)
    } else if (props.task.type === 'opportunity' && props.storeAdapter.loadOpportunityById) {
      await props.storeAdapter.loadOpportunityById(props.task.id)
    }
  } catch (error) {
    console.error('Error reloading task after reassignment:', error)
  }
}
</script>

<style scoped>
/* Right sidebar responsive widths */
.right-sidebar {
  width: 320px;
  min-width: 320px;
}

@media (min-width: 1440px) {
  .right-sidebar {
    width: 360px;
    min-width: 360px;
  }
}

@media (min-width: 1600px) {
  .right-sidebar {
    width: 420px;
    min-width: 420px;
  }
}

/* Tab styling overrides to ensure proper appearance */
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

:deep([role="tab"]:not(:last-child)) {
  border-right: none !important;
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
