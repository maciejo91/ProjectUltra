<template>
  <div class="relative flex w-full min-w-0 flex-col overflow-visible">
    <div
      v-if="displayTask"
      class="flex w-full min-w-0 flex-col overflow-x-hidden overflow-visible"
    >
      <!-- Sticky header: scroll parent is split-pane row (drawer: inner column) -->
      <TaskDetailHeader
        class="sticky top-0 z-20"
        :task="displayTask"
        :filtered-tasks="filteredTasks"
        :is-drawer-view="isDrawerView"
        @previous="handlePrevious"
        @next="handleNext"
        @close="$emit('close')"
        @postpone-expected-close="handlePostponeExpectedClose"
        @reassigned="handleReassigned"
      />

      <!-- Center + Right: natural height; page or drawer shell scrolls -->
      <div class="flex w-full min-h-0 flex-col lg:flex-row lg:items-start">
        <!-- Center Panel: Task Management Widget Only -->
        <div class="flex min-h-0 min-w-0 shrink-0 flex-col overflow-x-hidden bg-white lg:flex-1">
          <div class="w-full min-w-0 overflow-x-hidden">
            <div class="min-w-0 p-2">
              <div v-if="showAssignToMeBanner" class="px-2 mb-2">
                <TaskAssignee
                  :task="displayTask"
                  :task-type="displayTask.type"
                  @reassigned="handleReassigned"
                />
              </div>
              <TaskManagementCard
                v-if="managementWidget && storeAdapter"
                ref="managementCardRef"
                v-bind="$attrs"
                :task="displayTask"
                :type="displayTask.type"
                :management-widget="managementWidget"
                :activities="allActivities"
                :qualify-inline-success="qualifyInlineSuccessEffective"
                @postpone-expected-close="handlePostponeExpectedClose"
                @reassigned="handleReassigned"
              />
            </div>
          </div>
        </div>

        <!-- Right Sidebar with Tabs -->
        <div
          class="right-sidebar flex w-full shrink-0 flex-col overflow-x-hidden border-border border-t bg-background lg:w-[320px] lg:min-h-0 lg:min-w-[320px] lg:border-l lg:border-t-0"
        >
          <Tabs v-model="sidebarTab" class="flex w-full flex-col gap-0 overflow-x-hidden">
            <!-- Sidebar Tabs -->
            <TabsList class="relative flex w-full shrink-0 rounded-none border-0 bg-background">
              <TabsTrigger 
                value="request" 
                class="flex items-center gap-2 text-sm font-medium transition-all relative flex-1 justify-center bg-transparent outline-none h-full"
                :class="sidebarTab === 'request' 
                  ? 'text-foreground' 
                  : 'text-muted-foreground hover:text-muted-foreground'"
              >
                <span>Request</span>
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
                  class="flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-sm font-bold leading-none"
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
            
            <!-- Sidebar Content (scrolls with center via row scroll above) -->
            <div class="flex w-full flex-col bg-muted">
              <!-- Request Tab -->
              <TabsContent value="request" class="mt-0 space-y-2 p-2">
                <!-- Details card: badges/tags + request details, with open-in-new-tab in header -->
                <div class="rounded-lg border border-border bg-background shadow-nsc-card shrink-0 w-full min-w-0 overflow-hidden">
                  <div class="shrink-0 flex items-center justify-between gap-2 px-4 pt-4 pb-2 border-b border-border">
                    <h4 class="text-sm font-semibold text-foreground">Request Details</h4>
                    <button
                      type="button"
                      class="shrink-0 p-0.5 rounded text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      aria-label="Open request in new tab"
                      @click="openRequestInNewTab"
                    >
                      <ExternalLink class="size-3" />
                    </button>
                  </div>
                  <div class="px-4 pt-4 pb-4 space-y-4">
                    <TaskBadgesAndTags
                      :task="displayTask"
                      stacked
                      @tag-updated="handleTagUpdated"
                      class="min-w-0 w-full max-w-full"
                    >
                      <template #after-badges>
                        <span
                          v-if="showScheduledRecallBadge"
                          class="inline-flex items-center px-2 py-0.5 rounded text-sm font-semibold uppercase leading-none badge-ui bg-blue-100 text-blue-700"
                        >
                          Recall
                        </span>
                        <span
                          v-if="requestTabAttemptsCount > 0"
                          class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-sm font-semibold uppercase leading-none badge-ui bg-muted text-muted-foreground"
                        >
                          <Phone class="shrink-0 size-2.5" aria-hidden />
                          {{ requestTabAttemptsValue }}
                        </span>
                      </template>
                    </TaskBadgesAndTags>
                    <LeadOpportunityDetailsCard
                      :request="displayTask"
                      :show-assignee-bar="false"
                      bare
                      class="shrink-0 w-full min-w-0"
                    />
                  </div>
                </div>
                <VehicleRequestCard
                  v-if="displayTask.requestedCar || displayTask.vehicle"
                  :vehicle="displayTask.requestedCar || displayTask.vehicle"
                  :request-message="displayTask.requestMessage || displayTask.requestedCar?.requestMessage"
                  :source="displayTask.source"
                  :source-url="displayTask.requestedCar?.listingUrl || displayTask.sourceUrl || ''"
                  :image-url="getCarImageUrl(displayTask.requestedCar || displayTask.vehicle)"
                  :stock-status="displayTask.carStatus || ''"
                  :metrics-funnel-count="displayTask.listingMetrics?.funnelViews"
                  :metrics-tag-count="displayTask.listingMetrics?.tagCount"
                  @open-ad="handleOpenAd"
                  @more-actions="handleMoreActions"
                />
                <RequestMessageCard
                  v-if="showRequestMessageCard"
                  :title="t('requestDetail.messageCard.title')"
                  :message="displayTask.requestMessage || displayTask.requestedCar?.requestMessage || ''"
                  :utm-source="taskAttribution.utmSource"
                  :utm-term="taskAttribution.utmTerm"
                  :utm-campaign="taskAttribution.utmCampaign"
                  :web-spark-campaign="taskAttribution.webSparkCampaign"
                  :advertisement-url="taskAttribution.advertisementUrl"
                  :original-email-url="taskAttribution.originalEmailUrl"
                />
                <TaskContactCard
                  :task="displayTask"
                  :task-type="displayTask.type"
                  :customer-id="displayTask.customerId || displayTask.customer?.id"
                  @action="handleContactAction"
                  @add-tag="openAddCustomerTagModal"
                  @edit-customer-tag="onEditCustomerTag"
                  @delete-customer-tag="onDeleteCustomerTag"
                />
                <TradeInsCard
                  :items="displayTask?.tradeIns ?? []"
                  :add-loading="tradeInActionLoading"
                  @open-add="editingTradeIn = null; showTradeInModal = true"
                  @open-edit="openTradeInEdit"
                />
                <FinancingOptionsCard
                  :items="displayTask?.financingOptions ?? []"
                  @open-add="editingFinancingOption = null; showFinancingModal = true"
                  @open-edit="openFinancingEdit"
                />
                <OtherCustomerRequestsCard
                  :task="displayTask"
                />
              </TabsContent>
              
              <!-- Activity Tab -->
              <TabsContent value="activity" class="mt-0 flex flex-col overflow-visible p-2">
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

    <NoteComposerDock
      v-if="displayTask?.type === 'lead'"
      :open="showSophieNoteComposer"
      :initial-from="userStore.currentUser?.email || ''"
      :initial-to="displayTask?.customer?.email || ''"
      @update:open="setSophieNoteComposerOpen"
      @save="handleNoteSave"
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

    <SMSComposerDock
      v-if="displayTask?.type === 'lead' && !useLegacyCommunicationDialogs"
      :open="showSophieSMSComposer"
      :initial-channel="sophieMessageChannel"
      :initial-from="userStore.currentUser?.phone || userStore.currentUser?.mobile || ''"
      :initial-to="displayTask?.customer?.phone || displayTask?.customer?.mobile || ''"
      @update:open="setSophieSMSComposerOpen"
      @save="handleSMSSave"
    />
    
    <AddEmailModal
      :show="showEmailModal"
      :initial-from="userStore.currentUser?.email || ''"
      :initial-to="displayTask?.customer?.email || ''"
      :recipient-customer-id="displayTask?.customerId ?? displayTask?.customer?.id ?? null"
      @save="handleEmailSave"
      @close="showEmailModal = false"
    />

    <EmailComposerDock
      v-if="displayTask?.type === 'lead' && !useLegacyCommunicationDialogs"
      :open="showSophieEmailComposer"
      :initial-from="userStore.currentUser?.email || ''"
      :initial-to="displayTask?.customer?.email || ''"
      :recipient-customer-id="displayTask?.customerId ?? displayTask?.customer?.id ?? null"
      :recent-attachments="recentAttachments"
      @update:open="setSophieEmailComposerOpen"
      @save="handleEmailSave"
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

    <AddTagModal
      :show="showAddCustomerTagModal"
      :existing-tags="contactAddTagExistingNames"
      :edit-tag="contactTagModalEditTag"
      @close="closeCustomerTagModal"
      @add="handleAddCustomerTag"
      @update="handleUpdateCustomerTag"
    />
  </div>
</template>

<script setup>
import { ListTodo, Phone, ExternalLink } from 'lucide-vue-next'
import { ref, computed, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@motork/component-library/future/primitives'
import { useLeadsStore } from '@/stores/leads'
import { useOpportunitiesStore } from '@/stores/opportunities'
import { useUserStore } from '@/stores/user'
import { useToastStore } from '@/stores/toast'
import { useCustomersStore } from '@/stores/customers'
import { useSettingsStore } from '@/stores/settings'
import { getDisplayStage } from '@/utils/stageMapper'
import TaskDetailHeader from './TaskDetailHeader.vue'
import TaskAssignee from './TaskAssignee.vue'
import TaskManagementCard from './TaskManagementCard.vue'
import TaskContactCard from './TaskContactCard.vue'
import OtherCustomerRequestsCard from './OtherCustomerRequestsCard.vue'
import VehicleRequestCard from '@/components/shared/VehicleRequestCard.vue'
import TaskActivityCard from './TaskActivityCard.vue'
import TaskBadgesAndTags from './TaskBadgesAndTags.vue'
import TradeInsCard from '@/components/shared/TradeInsCard.vue'
import FinancingOptionsCard from '@/components/shared/FinancingOptionsCard.vue'
import LeadOpportunityDetailsCard from '@/components/shared/LeadOpportunityDetailsCard.vue'
import RequestMessageCard from '@/components/requests/RequestMessageCard.vue'
import NoteWidget from '@/components/shared/feed/NoteWidget.vue'
import AttachmentWidget from '@/components/shared/feed/AttachmentWidget.vue'
import AddWhatsAppModal from '@/components/modals/AddWhatsAppModal.vue'
import AddSMSModal from '@/components/modals/AddSMSModal.vue'
import AddEmailModal from '@/components/modals/AddEmailModal.vue'
import EmailComposerDock from '@/components/shared/communication/EmailComposerDock.vue'
import SMSComposerDock from '@/components/shared/communication/SMSComposerDock.vue'
import NoteComposerDock from '@/components/shared/feed/NoteComposerDock.vue'
import ComingSoonModal from '@/components/modals/ComingSoonModal.vue'
import PurchaseMethodModal from '@/components/modals/PurchaseMethodModal.vue'
import AddVehicleModal from '@/components/modals/AddVehicleModal.vue'
import OfferModal from '@/components/modals/OfferModal.vue'
import CreateEventModal from '@/components/modals/CreateEventModal.vue'
import AddTagModal from '@/components/modals/AddTagModal.vue'
import { getRequestAttributionProps } from '@/utils/requestAttribution'
import {
  qualifySuccessMatchesOpportunityComposite,
  resolveStoredQualifyInlineSuccess
} from '@/utils/lqOutcomeSummaryFormat'

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
const customersStore = useCustomersStore()
const settingsStore = useSettingsStore()
const router = useRouter()
const { t } = useI18n()

// Use store's current lead/opportunity when id matches so drawer and card view show the same loaded data and stay in sync after LQ actions (no-answer, not interested)
const displayTask = computed(() => {
  const t = props.task
  if (!t) return null
  if (t.type === 'lead') {
    const fromList = leadsStore.leads.find((l) => l.id === t.id)
    const lead =
      leadsStore.currentLead?.id === t.id ? leadsStore.currentLead : fromList || t
    return {
      ...t,
      ...lead,
      type: 'lead',
      compositeId: `lead-${lead.id}`,
      displayStage: getDisplayStage(lead, 'lead')
    }
  }
  if (t.type === 'opportunity') {
    const fromList = opportunitiesStore.opportunities.find((o) => o.id === t.id)
    const opp =
      opportunitiesStore.currentOpportunity?.id === t.id
        ? opportunitiesStore.currentOpportunity
        : fromList || t
    return {
      ...t,
      ...opp,
      type: 'opportunity',
      compositeId: `opportunity-${opp.id}`,
      displayStage: getDisplayStage(opp, 'opportunity')
    }
  }
  return t
})

const useLegacyCommunicationDialogs = computed(() => {
  const customerName = String(displayTask.value?.customer?.name ?? '').trim()
  return displayTask.value?.type === 'lead' && customerName === 'Josh Adams'
})

const qualifyInlineSuccessEffective = computed(() =>
  resolveStoredQualifyInlineSuccess(displayTask.value, leadsStore.lastInlineLeadQualifySuccess)
)

watch(
  () => displayTask.value?.compositeId,
  (next, prev) => {
    if (prev != null && next != null && prev !== next) {
      const stored = leadsStore.lastInlineLeadQualifySuccess
      const successOppId = stored?.opportunityId ?? stored?.opportunity?.id
      if (qualifySuccessMatchesOpportunityComposite(successOppId, next)) {
        return
      }
      leadsStore.clearLastInlineLeadQualifySuccess()
    }
  }
)

const taskAttribution = computed(() => getRequestAttributionProps(displayTask.value))

const contactAddTagExistingNames = computed(() => {
  const tags = displayTask.value?.customer?.tags || []
  return tags.map((x) => (typeof x === 'string' ? x : x.name))
})

const showRequestMessageCard = computed(() => {
  const r = displayTask.value
  if (!r) return false
  const msg = (r.requestMessage || r.requestedCar?.requestMessage || '').trim()
  if (msg) return true
  if (r.utmSource || r.utmTerm || r.utmCampaign || r.webSparkCampaign) return true
  if (r.originalMessageUrl) return true
  if (r.requestedCar?.listingUrl || r.sourceUrl) return true
  if (r.requestedCar?.adSource || r.requestedCar?.adCampaign) return true
  if (r.requestedCar?.adMedium || r.requestedCar?.webSparkCampaign) return true
  return false
})

const showAssignToMeBanner = computed(() => {
  const t = displayTask.value
  if (!t) return false
  const isClosed = t.stage === 'Closed Won' || t.stage === 'Closed Lost' || t.isClosed
  const isUnassigned = !(t.assignee || t.owner || t.assignedTo)
  return !isClosed && isUnassigned
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
const showSophieEmailComposer = ref(false)
const showSophieSMSComposer = ref(false)
const sophieMessageChannel = ref('sms')
const showSophieNoteComposer = ref(false)
const showComingSoonModal = ref(false)
function setSophieEmailComposerOpen(open) {
  showSophieEmailComposer.value = !!open
}

function setSophieSMSComposerOpen(open) {
  showSophieSMSComposer.value = !!open
}

function setSophieNoteComposerOpen(open) {
  showSophieNoteComposer.value = !!open
}

const recentAttachments = computed(() => {
  const task = displayTask.value
  if (!task) return []
  return (task.activities || []).filter((a) => a?.type === 'attachment')
})

const showFinancingModal = ref(false)
const showTradeInModal = ref(false)
const tradeInActionLoading = ref(false)
const editingTradeIn = ref(null)
const editingFinancingOption = ref(null)
const showOfferModal = ref(false)
const showAppointmentModal = ref(false)
const showAddCustomerTagModal = ref(false)
const contactTagModalEditTag = ref(null)
const managementCardRef = ref(null)

// Handle postpone expected close (opportunity) or due date (lead) from header's TaskAssigneeDateBar
function handlePostponeExpectedClose() {
  const task = displayTask.value ?? props.task
  if (task?.type === 'opportunity') {
    managementCardRef.value?.openPostponeExpectedCloseModal?.()
  } else if (task?.type === 'lead') {
    managementCardRef.value?.openPostponeDueDateModal?.()
  } else {
    emit('postpone-expected-close', task)
  }
}

// Activities
const allActivities = computed(() => {
  if (!props.storeAdapter) return []
  const task = displayTask.value
  if (!task) return []
  const storeActs = props.storeAdapter.currentActivities?.value || []
  if (task.type === 'lead' && leadsStore.currentLead?.id === task.id) {
    return storeActs
  }
  if (task.type === 'opportunity' && opportunitiesStore.currentOpportunity?.id === task.id) {
    return storeActs
  }
  if (Array.isArray(task.activities) && task.activities.length) {
    return task.activities
  }
  return []
})

// Badge counts
const activityCount = computed(() => {
  return allActivities.value.length
})

const showScheduledRecallBadge = computed(
  () => displayTask.value?.type === 'lead' && displayTask.value?.scheduledRecallAppointment?.date
)
const maxContactAttempts = computed(() => settingsStore.getSetting('maxContactAttempts') ?? 5)
const requestTabAttemptsCount = computed(() => displayTask.value?.contactAttempts?.length ?? 0)
const requestTabAttemptsValue = computed(
  () => `${requestTabAttemptsCount.value}/${maxContactAttempts.value}`
)
function openRequestInNewTab() {
  let id = null
  let type = null
  const task = displayTask.value
  if (task?.compositeId) {
    const [t, num] = task.compositeId.split('-')
    if (num && (t === 'lead' || t === 'opportunity')) {
      id = num
      type = t
    }
  }
  if (id == null && task?.id != null && task?.type) {
    id = String(task.id)
    type = task.type
  }
  if (id == null && type == null && props.filteredTasks?.length) {
    const first = props.filteredTasks[0]
    if (first?.compositeId) {
      const [t, num] = first.compositeId.split('-')
      if (num && (t === 'lead' || t === 'opportunity')) {
        id = num
        type = t
      }
    } else if (first?.id != null && first?.type) {
      id = String(first.id)
      type = first.type
    }
  }
  if (id == null || !type) return
  const href = router.resolve({
    path: `/requests/${id}`,
    query: { type }
  }).href
  window.open(href, '_blank')
}

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

const handleContactAction = (activityType) => {
  handleAddActivity(activityType)
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
    if (displayTask.value?.type === 'lead') {
      if (useLegacyCommunicationDialogs.value) {
        showWhatsAppModal.value = true
      } else {
        sophieMessageChannel.value = 'whatsapp'
        showSophieSMSComposer.value = true
      }
    } else {
      showWhatsAppModal.value = true
    }
  } else if (activityType === 'sms') {
    if (displayTask.value?.type === 'lead') {
      if (useLegacyCommunicationDialogs.value) {
        showSMSModal.value = true
      } else {
        sophieMessageChannel.value = 'sms'
        showSophieSMSComposer.value = true
      }
    } else {
      showSMSModal.value = true
    }
  } else if (activityType === 'email') {
    if (displayTask.value?.type === 'lead') {
      if (useLegacyCommunicationDialogs.value) {
        showEmailModal.value = true
      } else {
        showSophieEmailComposer.value = true
      }
    } else {
      showEmailModal.value = true
    }
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
  if (data?.type === 'whatsapp') {
    await handleWhatsAppSave(data)
    return
  }
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

function normalizeContactTagListForModal(tags) {
  return (tags || []).map((item) =>
    typeof item === 'string' ? { name: item, color: null } : { name: item.name, color: item.color || null }
  )
}

function openAddCustomerTagModal() {
  contactTagModalEditTag.value = null
  showAddCustomerTagModal.value = true
}

function closeCustomerTagModal() {
  showAddCustomerTagModal.value = false
  contactTagModalEditTag.value = null
}

function onEditCustomerTag(tag) {
  contactTagModalEditTag.value = { name: tag.name, color: tag.color }
  showAddCustomerTagModal.value = true
}

async function onDeleteCustomerTag(tag) {
  const task = displayTask.value
  if (!task) return
  const customerId = task.customer?.id ?? task.customerId
  if (customerId == null || customerId === '') return
  const current = normalizeContactTagListForModal(task.customer?.tags || [])
  const updatedTags = current.filter((item) => item.name !== tag.name)
  try {
    await customersStore.updateCustomer(customerId, { tags: updatedTags }, 'contact')
    if (task.type === 'lead' && props.storeAdapter?.loadLeadById) {
      await props.storeAdapter.loadLeadById(task.id)
    } else if (task.type === 'opportunity' && props.storeAdapter?.loadOpportunityById) {
      await props.storeAdapter.loadOpportunityById(task.id)
    }
  } catch {
    toastStore.pushToast('error', t('requestDetail.contactCard.saveFailed'))
  }
}

const handleAddCustomerTag = async (payload) => {
  const task = displayTask.value
  if (!task) return
  const customerId = task.customer?.id ?? task.customerId
  if (customerId == null || customerId === '') return
  const name = typeof payload === 'string' ? payload : payload.name
  const color = typeof payload === 'object' && payload?.color ? payload.color : null
  const current = normalizeContactTagListForModal(task.customer?.tags || [])
  if (current.some((item) => item.name === name)) {
    closeCustomerTagModal()
    return
  }
  const updatedTags = [...current, { name, color: color || null }]
  try {
    await customersStore.updateCustomer(customerId, { tags: updatedTags }, 'contact')
    if (task.type === 'lead' && props.storeAdapter?.loadLeadById) {
      await props.storeAdapter.loadLeadById(task.id)
    } else if (task.type === 'opportunity' && props.storeAdapter?.loadOpportunityById) {
      await props.storeAdapter.loadOpportunityById(task.id)
    }
    closeCustomerTagModal()
  } catch {
    toastStore.pushToast('error', t('requestDetail.contactCard.saveFailed'))
  }
}

const handleUpdateCustomerTag = async (payload) => {
  const { previousName, name, color } = payload
  const task = displayTask.value
  if (!task) return
  const customerId = task.customer?.id ?? task.customerId
  if (customerId == null || customerId === '') return
  const current = normalizeContactTagListForModal(task.customer?.tags || [])
  const idx = current.findIndex((item) => item.name === previousName)
  if (idx === -1) {
    closeCustomerTagModal()
    return
  }
  if (name !== previousName && current.some((item) => item.name === name)) {
    return
  }
  const updatedTags = current.map((item) =>
    item.name === previousName ? { name, color: color || null } : item
  )
  try {
    await customersStore.updateCustomer(customerId, { tags: updatedTags }, 'contact')
    if (task.type === 'lead' && props.storeAdapter?.loadLeadById) {
      await props.storeAdapter.loadLeadById(task.id)
    } else if (task.type === 'opportunity' && props.storeAdapter?.loadOpportunityById) {
      await props.storeAdapter.loadOpportunityById(task.id)
    }
    closeCustomerTagModal()
  } catch {
    toastStore.pushToast('error', t('requestDetail.contactCard.saveFailed'))
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
/* Right sidebar responsive widths - desktop only (lg and up) */
@media (min-width: 1024px) {
  .right-sidebar {
    width: 320px;
    min-width: 320px;
  }
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
