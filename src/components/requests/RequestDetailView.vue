<template>
  <RequestDetailShell :request="request">
    <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
    <ComingSoonModal :show="showPostponeModal" @close="showPostponeModal = false" />
    <ComingSoonModal :show="showGenericComingSoon" @close="showGenericComingSoon = false" />

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

    <NoteWidget
      modal
      :show="showNoteModal"
      :task-type="request?.type || 'lead'"
      :task-id="request?.id"
      @save="handleActivityNoteSave"
      @close="showNoteModal = false"
    />

    <AttachmentWidget
      modal
      :show="showAttachmentModal"
      :task-type="request?.type || 'lead'"
      :task-id="request?.id"
      @save="handleActivityAttachmentSave"
      @close="showAttachmentModal = false"
    />

    <AddWhatsAppModal
      :show="showWhatsAppModal"
      @save="handleActivityWhatsAppSave"
      @close="showWhatsAppModal = false"
    />

    <AddSMSModal
      :show="showSMSModal"
      @save="handleActivitySMSSave"
      @close="showSMSModal = false"
    />

    <AddEmailModal
      :show="showEmailModal"
      @save="handleActivityEmailSave"
      @close="showEmailModal = false"
    />

    <ComingSoonModal
      :show="showCallComingSoonModal"
      title="Call Feature"
      @close="showCallComingSoonModal = false"
    />

    <OfferModal
      :show="showOfferModal"
      :task-type="request?.type || 'lead'"
      :task-id="request?.id"
      :customer="request?.customer"
      @save="handleActivityOfferSave"
      @close="showOfferModal = false"
    />

    <CreateEventModal
      :show="showAppointmentModal"
      :customer="request?.customer"
      :assignee="request?.assignee"
      @create="handleActivityAppointmentSave"
      @cancel="showAppointmentModal = false"
    />

    <AddTagModal
      :show="showAddTagModal"
      :existing-tags="addTagModalExistingNames"
      :edit-tag="addTagModalEditTag"
      @close="closeAddTagModal"
      @add="handleAddTagModalAdd"
      @update="handleAddTagModalUpdate"
    />

    <div
      ref="requestDetailBodyRef"
      v-if="showAssociatedTasksOrTimeline"
      class="flex min-h-0 w-full flex-1 flex-col overflow-hidden"
    >
      <div v-if="request" ref="requestHeaderStripRef" class="w-full min-w-0 shrink-0">
        <RequestDetailCompactHeader
          v-if="showCompactRequestHeader"
          :request="request"
          :filtered-requests="filteredRequests"
          :is-full-page="isFullPage"
          :show="true"
          layout="fullWidth"
          :ai-summary="request?.type === 'lead' ? request.aiSummary || '' : ''"
          @close="$emit('close')"
          @previous="handlePrevious"
          @next="handleNext"
          @update-status="handleUpdateStatus"
          @quick-action="handleQuickAction"
          @add-request-tag="openAddRequestTagModal"
          @edit-request-tag="onEditRequestTag"
          @delete-request-tag="onDeleteRequestTag"
        />
        <RequestDetailHeader
          v-else
          :request="request"
          :filtered-requests="filteredRequests"
          :is-full-page="isFullPage"
          @close="$emit('close')"
          @previous="handlePrevious"
          @next="handleNext"
          @update-status="handleUpdateStatus"
          @postpone-expected-close="handlePostponeExpectedClose"
          @reassigned="handleReassigned"
          @add-request-tag="openAddRequestTagModal"
          @edit-request-tag="onEditRequestTag"
          @delete-request-tag="onDeleteRequestTag"
        />
      </div>
      <div
        class="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden p-4"
      >
        <DuplicateDetectedCard
          v-if="request && potentialDuplicates.length && !duplicateBannerDismissed"
          class="shrink-0"
          :potential-duplicates="potentialDuplicates"
          @request-navigate="(...args) => $emit('request-navigate', ...args)"
          @dismiss="duplicateBannerDismissed = true"
        />
      <div
        ref="requestDetailRowRef"
        :class="[
          'flex min-h-0 flex-1 flex-col gap-4 overflow-x-hidden overscroll-contain lg:flex-row lg:items-stretch lg:gap-4 lg:min-h-0',
          'max-lg:min-h-0 max-lg:flex-1 max-lg:overflow-y-auto',
          'lg:overflow-hidden',
          requestFloatingBarScrollPadding.row
        ]"
      >
        <div
          class="order-1 relative flex min-h-0 min-w-0 flex-col gap-4 lg:min-h-0 lg:min-w-0 lg:flex-1"
        >
          <div
            ref="requestMainColumnScrollRef"
            :class="[
              'flex min-h-0 min-w-0 flex-1 flex-col gap-4 max-lg:overflow-visible',
              'lg:overflow-y-auto lg:overflow-x-hidden lg:overscroll-contain lg:min-h-0',
              requestFloatingBarScrollPadding.main
            ]"
          >
          <div class="flex min-w-0 shrink-0 flex-col gap-4">
            <div
              ref="requestCustomerSectionRef"
              class="flex min-w-0 shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-background shadow-mk-dashboard-card"
            >
              <RequestLeadProfileSection
                v-if="request"
                embedded-in-card
                class="shrink-0"
                :request="request"
                :related-leads="customerRelatedLeads"
                :related-opportunities="customerRelatedOpps"
                :related-services="customerRelatedServices"
                :related-requests-loading="loadingCustomerRelatedRequests"
                @quick-action="handleQuickAction"
                @add-tag="openAddCustomerTagModal"
                @edit-customer-tag="onEditCustomerTag"
                @delete-customer-tag="onDeleteCustomerTag"
              />
            </div>

            <div
              class="flex min-w-0 shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-background shadow-mk-dashboard-card"
            >
              <div class="shrink-0 px-4 pt-2">
                <RequestMainTabs class="shrink-0" v-model="mainTab" :tabs="mainTabs" />
              </div>

              <div class="flex shrink-0 flex-col gap-4 border-t border-border p-4">
              <template v-if="mainTab === 'overview' || mainTab === 'tasks'">
                <div class="flex flex-col gap-4">
                <RequestInsightBanner
                  v-if="mainTab === 'overview' && overviewAiInsightMessage"
                  class="shrink-0"
                  :message="overviewAiInsightMessage"
                  :generating="overviewAiInsightGenerating"
                />
                <RequestLeadQualificationTeaser
                  v-if="request?.type === 'lead' && !useFloatingLqBar"
                  class="w-full min-w-0 shrink-0"
                  floating-elevated
                  :show-teaser="lqfShowTeaser"
                  :dismissed="lqfTeaserDismissed"
                  :header-task-title="lqfHeaderTaskTitle"
                  :header-contact-subline="lqfHeaderContactSubline"
                  :call-now-tel-href="lqfCallNowTelHref"
                  :session-header-title="lqfSessionHeaderActive ? lqfCallingSessionTitle : ''"
                  :teaser-line="lqfTeaserLine"
                  :assignee-initials="lqfAssigneeInitials"
                  :assignment-lead-id="request?.id"
                  :manage-open="lqfInlineManageOpen"
                  :hide-manage-call-now-cta="lqfHideManageCallNowCta"
                  :outcome-shell-animated="lqfOutcomeShellAnimated"
                  :contact-attempts="lqfContactAttemptsCount"
                  :max-contact-attempts="lqfMaxContactAttemptsLimit"
                  hide-body-subheader
                  @manage-task="handleLqfManageTask"
                  @open-full-task="handleOpenTaskDrawer()"
                  @cancel-action="lqfInlineManageOpen = false"
                  @reassigned="handleReassigned"
                >
                  <template v-if="lqfInlineManageOpen" #outcome>
                    <LeadManagementWidget
                      :lead="request"
                      :activities="requestActivities"
                      embed-outcome-only
                      :outcome-summary="leadLqOutcomeSummary"
                      :qualify-inline-success="qualifyInlineSuccessForRequest"
                      @postpone-expected-close="handlePostponeExpectedClose"
                      @reassigned="handleReassigned"
                      @open-purchase-method="handleLqfOpenPurchaseMethod"
                      @open-trade-in="handleLqfOpenTradeIn"
                      @qualified-inline-success="handleLeadQualifyInlineSuccess"
                      @lq-outcome-summary="handleLqOutcomeSummary"
                    />
                  </template>
                </RequestLeadQualificationTeaser>
                <LeadLqOutcomeSummaryCard
                  v-if="lqOutcomeOverviewVisible"
                  v-bind="lqOutcomeOverviewDisplay"
                  class="w-full min-w-0 shrink-0"
                />
                <SuggestedNextActionCard
                  v-if="request && !isClosedLead && request.type === 'opportunity' && (mainTab === 'overview' || mainTab === 'tasks')"
                  :request="request"
                  class="shrink-0"
                />
                </div>
              </template>

              <template v-else-if="mainTab === 'activity'">
                <div class="flex min-w-0 flex-col">
                  <TaskActivityCard
                    v-if="showTimeline && request"
                    :activities="requestActivities"
                    :expanded-summaries="activityExpandedSummaries"
                    @toggle-summary-expanded="handleActivitySummaryToggle"
                    @add-activity="handleTaskAddActivity"
                  />
                </div>
              </template>

              <template v-else-if="mainTab === 'conversations'">
                <RequestConversationsTabContent
                  :activities="conversationActivitiesForRequest"
                  @send-message="showEmailModal = true"
                />
              </template>

              <template v-else-if="mainTab === 'tradeIns'">
                <RequestTabEmptyState
                  v-if="tradeInsCount === 0"
                  :icon="Car"
                  :title="t('requestDetail.emptyStates.tradeIns.title')"
                  :description="t('requestDetail.emptyStates.tradeIns.description')"
                  :action-label="t('requestDetail.emptyStates.tradeIns.action')"
                  @action="editingTradeIn = null; showTradeInModal = true"
                />
                <div v-else class="flex flex-col gap-4">
                  <TradeInsCard
                    :items="request?.tradeIns || []"
                    :add-loading="tradeInActionLoading"
                    @open-add="editingTradeIn = null; showTradeInModal = true"
                    @open-edit="openTradeInEdit"
                  />
                </div>
              </template>

              <template v-else-if="mainTab === 'purchaseMethod'">
                <RequestTabEmptyState
                  v-if="financingOptionsCount === 0"
                  :icon="CreditCard"
                  :title="t('requestDetail.emptyStates.purchaseMethod.title')"
                  :description="t('requestDetail.emptyStates.purchaseMethod.description')"
                  :action-label="t('requestDetail.emptyStates.purchaseMethod.action')"
                  @action="editingFinancingOption = null; showFinancingModal = true"
                />
                <div v-else class="flex flex-col gap-4">
                  <FinancingOptionsCard
                    :items="request?.financingOptions || []"
                    @open-add="editingFinancingOption = null; showFinancingModal = true"
                    @open-edit="openFinancingEdit"
                  />
                </div>
              </template>

              <template v-else-if="mainTab === 'attachments'">
                <RequestTabEmptyState
                  v-if="attachmentsCount === 0"
                  file-drop
                  :drop-headline="t('requestDetail.emptyStates.attachments.dropZoneHeadline')"
                  :drop-headline-active="t('requestDetail.emptyStates.attachments.dropZoneActive')"
                  :drop-hint="t('requestDetail.emptyStates.attachments.dropHint')"
                  :icon="Upload"
                  :title="t('requestDetail.emptyStates.attachments.title')"
                  :description="t('requestDetail.emptyStates.attachments.description')"
                  :action-label="t('requestDetail.emptyStates.attachments.action')"
                  @action="showAttachmentModal = true"
                  @files-dropped="handleAttachmentsTabDroppedFiles"
                />
                <div
                  v-else
                  class="flex min-h-56 flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 text-center transition-colors md:min-h-64"
                  :class="
                    attachmentsListDragActive
                      ? 'border-primary bg-primary/10 shadow-sm'
                      : 'border-primary/35 bg-muted/50'
                  "
                  @dragenter="onAttachmentsListDragEnter"
                  @dragleave="onAttachmentsListDragLeave"
                  @dragover="onAttachmentsListDragOver"
                  @drop="onAttachmentsListDrop"
                >
                  <div
                    class="mb-4 flex size-12 shrink-0 items-center justify-center rounded-full bg-muted"
                    aria-hidden="true"
                  >
                    <Upload class="size-6 text-muted-foreground" />
                  </div>
                  <h3 class="mb-1 text-base font-semibold text-foreground">
                    {{
                      attachmentsListDragActive
                        ? t('requestDetail.emptyStates.attachments.dropZoneActive')
                        : t('requestDetail.emptyStates.attachments.dropZoneHeadline')
                    }}
                  </h3>
                  <p class="max-w-md text-sm text-muted-foreground">
                    {{ t('requestDetail.emptyStates.attachments.hasItems', { count: attachmentsCount }) }}
                  </p>
                  <p class="max-w-md text-sm text-muted-foreground">
                    {{ t('requestDetail.emptyStates.attachments.dropHint') }}
                  </p>
                  <Button
                    variant="outline"
                    class="rounded-sm w-full sm:w-auto"
                    @click="showAttachmentModal = true"
                  >
                    {{ t('forms.modals.addAttachment') }}
                  </Button>
                </div>
              </template>

              </div>
            </div>
          </div>
          <RequestFloatingLqTaskBar
            v-if="useFloatingLqBar && lqfShowTeaser && !lqfTeaserDismissed && request"
            :request="request"
            :activities="requestActivities"
            :header-task-title="lqfHeaderTaskTitle"
            :header-contact-subline="lqfHeaderContactSubline"
            :call-now-tel-href="lqfCallNowTelHref"
            :calling-session-title="floatingLqCallingTitle"
            :outcome-summary="leadLqOutcomeSummary"
            :qualify-inline-success="qualifyInlineSuccessForRequest"
            :teaser-line="lqfTeaserLine"
            :assignee-initials="lqfAssigneeInitials"
            :contact-attempts="lqfContactAttemptsCount"
            :max-contact-attempts="lqfMaxContactAttemptsLimit"
            @update:focus-mode="floatingLqFocusMode = $event"
            @postpone-expected-close="handlePostponeExpectedClose"
            @reassigned="handleReassigned"
            @open-purchase-method="handleLqfOpenPurchaseMethod"
            @open-trade-in="handleLqfOpenTradeIn"
            @qualified-inline-success="handleLeadQualifyInlineSuccess"
            @lq-outcome-summary="handleLqOutcomeSummary"
          />
          </div>
        </div>

        <div
          class="order-2 flex min-h-0 min-w-0 flex-col lg:sticky lg:top-0 lg:w-1/4 lg:shrink-0 lg:self-stretch lg:min-h-0 lg:overscroll-contain"
        >
          <div
            :class="[
              'flex flex-col gap-4 lg:min-h-0 lg:flex-1',
              floatingLqFocusMode ? 'lg:overflow-hidden' : 'lg:overflow-y-auto lg:overscroll-contain'
            ]"
          >
            <VehicleRequestCard
              v-if="request && (request.requestedCar || request.vehicle)"
              class="shrink-0"
              :heading="t('requestDetail.vehicleCard.title')"
              :vehicle="request.requestedCar || request.vehicle"
              :request-message="request.requestMessage || request.requestedCar?.requestMessage"
              :request-context="requestedVehicleRequestContext"
              :dealership-needs-warning="!!request.dealershipNeedsWarning"
              :source="request.source"
              :source-url="request.requestedCar?.listingUrl || request.sourceUrl || ''"
              :image-url="getCarImageUrl(request.requestedCar || request.vehicle)"
              :save-requested-car="handleRequestedCarSave"
              :stock-status="request.carStatus || ''"
              :metrics-funnel-count="request.listingMetrics?.funnelViews"
              :metrics-tag-count="request.listingMetrics?.tagCount"
              hide-request-message
              @open-ad="handleOpenAd"
              @more-actions="handleMoreActions"
            />
            <RequestMessageCard
              v-if="request && showRequestDetailsCard"
              class="shrink-0"
              :title="t('requestDetail.messageCard.title')"
              :message="request.requestMessage || request.requestedCar?.requestMessage || ''"
              :utm-source="requestAttribution.utmSource"
              :utm-term="requestAttribution.utmTerm"
              :utm-campaign="requestAttribution.utmCampaign"
              :web-spark-campaign="requestAttribution.webSparkCampaign"
              :advertisement-url="requestAttribution.advertisementUrl"
              :original-email-url="requestAttribution.originalEmailUrl"
            />
          </div>
        </div>
      </div>
    </div>
    </div>
    </div>
  </RequestDetailShell>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { Car, CreditCard, Upload } from 'lucide-vue-next'
import { Button } from '@motork/component-library/future/primitives'
import { useDuplicateDetection } from '@/composables/useDuplicateDetection'
import { useLeadsStore } from '@/stores/leads'
import { useOpportunitiesStore } from '@/stores/opportunities'
import { useCustomersStore } from '@/stores/customers'
import { useUserStore } from '@/stores/user'
import { useToastStore } from '@/stores/toast'
import { useLeadLqTeaser } from '@/composables/useLeadLqTeaser'
import { useFileDropZone } from '@/composables/useFileDropZone'
import { isFloatingLqTaskPrototypeLead } from '@/utils/requestPrototypeFlags'
import RequestFloatingLqTaskBar from './RequestFloatingLqTaskBar.vue'
import RequestDetailShell from './RequestDetailShell.vue'
import RequestDetailHeader from './RequestDetailHeader.vue'
import RequestDetailCompactHeader from './RequestDetailCompactHeader.vue'
import VehicleRequestCard from '@/components/shared/VehicleRequestCard.vue'
import RequestMainTabs from './RequestMainTabs.vue'
import RequestConversationsTabContent from './RequestConversationsTabContent.vue'
import RequestTabEmptyState from './RequestTabEmptyState.vue'
import RequestLeadProfileSection from './RequestLeadProfileSection.vue'
import RequestInsightBanner from './RequestInsightBanner.vue'
import RequestLeadQualificationTeaser from './RequestLeadQualificationTeaser.vue'
import RequestMessageCard from './RequestMessageCard.vue'
import SuggestedNextActionCard from './SuggestedNextActionCard.vue'
import TaskActivityCard from '@/components/tasks/TaskActivityCard.vue'
import NoteWidget from '@/components/shared/feed/NoteWidget.vue'
import AttachmentWidget from '@/components/shared/feed/AttachmentWidget.vue'
import AddWhatsAppModal from '@/components/modals/AddWhatsAppModal.vue'
import AddSMSModal from '@/components/modals/AddSMSModal.vue'
import AddEmailModal from '@/components/modals/AddEmailModal.vue'
import OfferModal from '@/components/modals/OfferModal.vue'
import CreateEventModal from '@/components/modals/CreateEventModal.vue'
import ComingSoonModal from '@/components/modals/ComingSoonModal.vue'
import AddTagModal from '@/components/modals/AddTagModal.vue'
import PurchaseMethodModal from '@/components/modals/PurchaseMethodModal.vue'
import AddVehicleModal from '@/components/modals/AddVehicleModal.vue'
import DuplicateDetectedCard from './DuplicateDetectedCard.vue'
import LeadManagementWidget from '@/components/tasks/lead/LeadManagementWidget.vue'
import LeadLqOutcomeSummaryCard from '@/components/tasks/lead/LeadLqOutcomeSummaryCard.vue'
import {
  buildLqOutcomeSummaryDisplay,
  qualifySuccessMatchesOpportunityComposite,
  resolveStoredQualifyInlineSuccess
} from '@/utils/lqOutcomeSummaryFormat'
import TradeInsCard from '@/components/shared/TradeInsCard.vue'
import FinancingOptionsCard from '@/components/shared/FinancingOptionsCard.vue'
import {
  getApiStatus,
  getDisplayStage,
  getOpportunityUpdateFromDisplayStage
} from '@/utils/stageMapper'
import { LEAD_STAGES } from '@/utils/stageMapper/constants'
import { getCarImageUrl } from '@/utils/vehicleHelpers'
import { getRequestAttributionProps } from '@/utils/requestAttribution'
import {
  fetchLeadsByCustomerId,
  fetchOpportunitiesByCustomerId,
  fetchServiceHistoryByCustomerId
} from '@/api/contacts'

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

const { t } = useI18n()
const leadsStore = useLeadsStore()
const opportunitiesStore = useOpportunitiesStore()
const customersStore = useCustomersStore()
const userStore = useUserStore()
const toastStore = useToastStore()

const showPostponeModal = ref(false)
const showGenericComingSoon = ref(false)
const showTradeInModal = ref(false)
const showFinancingModal = ref(false)
const editingTradeIn = ref(null)
const editingFinancingOption = ref(null)
const tradeInActionLoading = ref(false)
const duplicateBannerDismissed = ref(false)
const requestMainColumnScrollRef = ref(null)
const requestDetailRowRef = ref(null)
const requestDetailBodyRef = ref(null)
const requestHeaderStripRef = ref(null)
const requestCustomerSectionRef = ref(null)
const showCompactRequestHeader = ref(false)
let removeRequestHeaderCompactScrollListeners = null
let requestHeaderCompactWindowResize = null
let compactHeaderResizeObserver = null
let compactHeaderRafPending = false
const mainTab = ref('overview')
const lqfTeaserDismissed = ref(false)
const lqfInlineManageOpen = ref(false)
const leadLqOutcomeSummary = ref(null)
const floatingLqFocusMode = ref(false)

const qualifyInlineSuccessForRequest = computed(() =>
  resolveStoredQualifyInlineSuccess(props.request, leadsStore.lastInlineLeadQualifySuccess)
)

function handleLeadQualifyInlineSuccess() {
  leadLqOutcomeSummary.value = null
}

function handleLqOutcomeSummary(payload) {
  leadLqOutcomeSummary.value = payload
  if (payload) {
    leadsStore.clearLastInlineLeadQualifySuccess()
  }
}
const showNoteModal = ref(false)
const showAttachmentModal = ref(false)
const showWhatsAppModal = ref(false)
const showSMSModal = ref(false)
const showEmailModal = ref(false)
const showCallComingSoonModal = ref(false)
const showOfferModal = ref(false)
const showAppointmentModal = ref(false)
const showAddTagModal = ref(false)
const addTagModalKind = ref('customer')
const addTagModalEditTag = ref(null)
const activityExpandedSummaries = ref({})

const customerRelatedLeads = ref([])
const customerRelatedOpps = ref([])
const customerRelatedServices = ref([])
const loadingCustomerRelatedRequests = ref(false)

const leadRef = computed(() => (props.request?.type === 'lead' ? props.request : null))

const requestAttribution = computed(() => getRequestAttributionProps(props.request))

const requestedVehicleRequestContext = computed(() => {
  const r = props.request
  if (!r) return {}
  return {
    channel: r.channel,
    source: r.source,
    sourceDetails: r.sourceDetails,
    fiscalEntity: r.fiscalEntity,
    requestType: r.requestType
  }
})

const showRequestDetailsCard = computed(() => {
  const r = props.request
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

const useFloatingLqBar = computed(() => isFloatingLqTaskPrototypeLead(props.request))
const {
  showTeaser: lqfShowTeaser,
  teaserLine: lqfTeaserLine,
  headerTaskTitle: lqfHeaderTaskTitle,
  headerContactSubline: lqfHeaderContactSubline,
  callNowTelHref: lqfCallNowTelHref,
  callingSessionTitle: lqfCallingSessionTitle,
  contactAttemptsCount: lqfContactAttemptsCount,
  maxContactAttemptsLimit: lqfMaxContactAttemptsLimit
} = useLeadLqTeaser(leadRef)

const showFloatingLqOverviewExtras = computed(
  () =>
    useFloatingLqBar.value &&
    lqfShowTeaser.value &&
    !lqfTeaserDismissed.value &&
    props.request?.type === 'lead'
)

const overviewAiInsightMessage = computed(() => {
  const r = props.request
  if (!r || r.type !== 'lead') return ''
  if (r.aiSummary?.trim()) return r.aiSummary.trim()
  if (showFloatingLqOverviewExtras.value) return t('requestDetail.aiOverviewSummary')
  return ''
})

const overviewAiInsightGenerating = computed(() => {
  const r = props.request
  if (!r || r.type !== 'lead') return false
  return !Boolean(r.aiSummary?.trim())
})

const requestFloatingBarScrollPadding = computed(() => {
  const tight =
    useFloatingLqBar.value && lqfShowTeaser.value && !lqfTeaserDismissed.value
  return tight
    ? { row: 'max-lg:pb-4', main: 'lg:pb-4' }
    : { row: 'max-lg:pb-32', main: 'lg:pb-32' }
})

watch(
  () => lqfShowTeaser.value,
  (show) => {
    if (!show) {
      lqfInlineManageOpen.value = false
    }
  }
)

watch(
  () => {
    const r = props.request
    if (!r) return ''
    return `${r.type}-${r.id}-${r.customerId ?? r.customer?.id ?? ''}`
  },
  async () => {
    const r = props.request
    if (!r) {
      customerRelatedLeads.value = []
      customerRelatedOpps.value = []
      customerRelatedServices.value = []
      return
    }
    const cid = r.customerId || r.customer?.id
    if (cid == null || cid === '') {
      customerRelatedLeads.value = []
      customerRelatedOpps.value = []
      customerRelatedServices.value = []
      return
    }
    loadingCustomerRelatedRequests.value = true
    try {
      const accountId =
        r.customer?.accountId || r.customer?.account_id || r.accountId || r.account_id
      const [leadsRes, oppsRes, servicesRes] = await Promise.all([
        fetchLeadsByCustomerId(cid, accountId),
        fetchOpportunitiesByCustomerId(cid, accountId),
        fetchServiceHistoryByCustomerId(cid, accountId)
      ])
      customerRelatedLeads.value = leadsRes.data || []
      customerRelatedOpps.value = oppsRes.data || []
      customerRelatedServices.value = servicesRes.data || []
    } finally {
      loadingCustomerRelatedRequests.value = false
    }
  },
  { immediate: true }
)

const lqfAssigneeInitials = computed(() => {
  const r = props.request
  if (!r) return '?'
  if (r.assigneeInitials) return String(r.assigneeInitials).slice(0, 3)
  const name = r.assignee
  if (!name || typeof name !== 'string') return '?'
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const { potentialDuplicates } = useDuplicateDetection(computed(() => props.request))

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
    const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0
    const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0
    return tb - ta
  })
})

const conversationActivitiesForRequest = computed(() => {
  const list = requestActivities.value.filter(
    (a) =>
      a.type === 'customer-email' ||
      a.type === 'customer-whatsapp' ||
      a.type === 'email' ||
      a.type === 'whatsapp'
  )
  return [...list].sort(
    (a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime()
  )
})

const showAssociatedTasks = computed(() => {
  const r = props.request
  return !!(r?.customer || r?.customerId)
})

const attachmentsCount = computed(
  () => requestActivities.value.filter((a) => a.type === 'attachment').length
)

const tradeInsCount = computed(() => props.request?.tradeIns?.length || 0)

const financingOptionsCount = computed(() => props.request?.financingOptions?.length || 0)

const overviewTabCount = computed(() => {
  let n = 0
  if (potentialDuplicates.value?.length) n += 1
  if (lqfShowTeaser.value && !lqfTeaserDismissed.value && props.request?.type === 'lead') n += 1
  return n
})

const mainTabs = computed(() => [
  { key: 'overview', label: t('requestDetail.tabs.overview'), count: overviewTabCount.value },
  { key: 'conversations', label: t('requestDetail.tabs.conversations') },
  { key: 'tradeIns', label: t('requestDetail.tabs.tradeIns'), count: tradeInsCount.value },
  { key: 'purchaseMethod', label: t('requestDetail.tabs.purchaseMethod'), count: financingOptionsCount.value },
  { key: 'attachments', label: t('requestDetail.tabs.attachments'), count: attachmentsCount.value },
  { key: 'tasks', label: t('requestDetail.tabs.tasks'), count: tasksTabCount.value },
  { key: 'activity', label: t('requestDetail.tabs.activity'), count: requestActivities.value.length }
])

watch(
  () => props.request?.compositeId,
  (next, prev) => {
    duplicateBannerDismissed.value = false
    if (prev != null && next != null && prev !== next) {
      const stored = leadsStore.lastInlineLeadQualifySuccess
      const successOppId = stored?.opportunityId ?? stored?.opportunity?.id
      if (qualifySuccessMatchesOpportunityComposite(successOppId, next)) {
        return
      }
      lqfTeaserDismissed.value = false
      lqfInlineManageOpen.value = false
      leadsStore.clearLastInlineLeadQualifySuccess()
      leadLqOutcomeSummary.value = null
      floatingLqFocusMode.value = false
      mainTab.value = 'overview'
    }
  }
)

const activityAuthor = computed(() => userStore.currentUser?.name || 'You')

const showTimeline = computed(() => !!props.request)

const isClosedLead = computed(
  () => props.request?.type === 'lead' && props.request?.isDisqualified === true
)

const lqfSessionHeaderActive = computed(() => {
  if (!lqfInlineManageOpen.value) return false
  if (qualifyInlineSuccessForRequest.value) return false
  if (leadLqOutcomeSummary.value) return false
  if (isClosedLead.value) return false
  return true
})

const floatingLqCallingTitle = computed(() => {
  if (qualifyInlineSuccessForRequest.value) return ''
  if (leadLqOutcomeSummary.value) return ''
  if (isClosedLead.value) return ''
  return lqfCallingSessionTitle.value
})

const lqOutcomeOverviewDisplay = computed(() => {
  if (!leadLqOutcomeSummary.value) {
    return { title: '', lines: [], reason: null }
  }
  return buildLqOutcomeSummaryDisplay(leadLqOutcomeSummary.value, t)
})

const lqOutcomeOverviewVisible = computed(
  () =>
    Boolean(leadLqOutcomeSummary.value) &&
    !qualifyInlineSuccessForRequest.value &&
    Boolean(lqOutcomeOverviewDisplay.value.title) &&
    !lqfInlineManageOpen.value &&
    !(useFloatingLqBar.value && floatingLqFocusMode.value)
)

const lqfHideManageCallNowCta = computed(() => {
  if (qualifyInlineSuccessForRequest.value || leadLqOutcomeSummary.value) return true
  const r = props.request
  if (!r || r.type !== 'lead') return false
  const stage = getDisplayStage(r, 'lead')
  return stage === LEAD_STAGES.TO_BE_CALLED_BACK || stage === LEAD_STAGES.VALID_TO_BE_CALLED_BACK
})

const lqfOutcomeShellAnimated = computed(() => !leadLqOutcomeSummary.value)

watch(isClosedLead, (closed, wasClosed) => {
  if (wasClosed === true && closed === false) {
    leadLqOutcomeSummary.value = null
  }
})

const tasksTabCount = computed(() => {
  const r = props.request
  if (!r) return 0
  if (r.type === 'lead') {
    return lqfShowTeaser.value && !lqfTeaserDismissed.value ? 1 : 0
  }
  if (r.type === 'opportunity' && !isClosedLead.value) {
    return 1
  }
  return 0
})

const showAssociatedTasksOrTimeline = computed(
  () => showAssociatedTasks.value || showTimeline.value
)

function isCustomerSectionScrolledPast(scrollRoot, sectionEl) {
  if (!scrollRoot || !sectionEl) return false
  if (scrollRoot.scrollHeight <= scrollRoot.clientHeight + 1) return false
  const rootRect = scrollRoot.getBoundingClientRect()
  const y =
    sectionEl.getBoundingClientRect().top -
    rootRect.top +
    scrollRoot.scrollTop
  const sectionBottomInContent = y + sectionEl.offsetHeight
  return scrollRoot.scrollTop >= sectionBottomInContent - 1
}

function getScrollRootForHeader() {
  if (typeof window === 'undefined') return requestMainColumnScrollRef.value
  return window.matchMedia('(min-width: 1024px)').matches
    ? requestMainColumnScrollRef.value
    : requestDetailRowRef.value
}

function updateCompactHeaderVisibility() {
  const section = requestCustomerSectionRef.value
  const mainCol = getScrollRootForHeader()
  const body = requestDetailBodyRef.value
  if (!section) {
    showCompactRequestHeader.value = false
    return
  }
  if (isCustomerSectionScrolledPast(mainCol, section)) {
    showCompactRequestHeader.value = true
    return
  }
  if (isCustomerSectionScrolledPast(body, section)) {
    showCompactRequestHeader.value = true
    return
  }
  showCompactRequestHeader.value = false
}

function scheduleCompactHeaderUpdate() {
  if (compactHeaderRafPending) return
  compactHeaderRafPending = true
  requestAnimationFrame(() => {
    compactHeaderRafPending = false
    updateCompactHeaderVisibility()
  })
}

function attachScrollListenersToScrollableAncestors(el, onScroll) {
  const cleanups = []
  let node = el
  while (node && node !== document.documentElement) {
    const style = window.getComputedStyle(node)
    const oy = style.overflowY
    const canScroll =
      (oy === 'auto' || oy === 'scroll' || oy === 'overlay') &&
      node.scrollHeight > node.clientHeight + 1
    if (canScroll) {
      node.addEventListener('scroll', onScroll, { passive: true })
      cleanups.push(() => node.removeEventListener('scroll', onScroll))
    }
    node = node.parentElement
  }
  return cleanups
}

function attachRequestHeaderCompactTracking() {
  if (removeRequestHeaderCompactScrollListeners) {
    removeRequestHeaderCompactScrollListeners()
    removeRequestHeaderCompactScrollListeners = null
  }
  if (compactHeaderResizeObserver) {
    compactHeaderResizeObserver.disconnect()
    compactHeaderResizeObserver = null
  }
  if (requestHeaderCompactWindowResize) {
    window.removeEventListener('resize', requestHeaderCompactWindowResize)
    requestHeaderCompactWindowResize = null
  }

  const onScroll = () => scheduleCompactHeaderUpdate()
  const cleanups = []
  window.addEventListener('scroll', onScroll, true)
  cleanups.push(() => window.removeEventListener('scroll', onScroll, true))

  const mainCol = requestMainColumnScrollRef.value
  const row = requestDetailRowRef.value
  const body = requestDetailBodyRef.value
  if (mainCol) {
    mainCol.addEventListener('scroll', onScroll, { passive: true })
    cleanups.push(() => mainCol.removeEventListener('scroll', onScroll))
    cleanups.push(...attachScrollListenersToScrollableAncestors(mainCol, onScroll))
  }
  if (row) {
    row.addEventListener('scroll', onScroll, { passive: true })
    cleanups.push(() => row.removeEventListener('scroll', onScroll))
    cleanups.push(...attachScrollListenersToScrollableAncestors(row, onScroll))
  }
  if (body) {
    body.addEventListener('scroll', onScroll, { passive: true })
    cleanups.push(() => body.removeEventListener('scroll', onScroll))
  }

  removeRequestHeaderCompactScrollListeners = () => cleanups.forEach((fn) => fn())

  requestHeaderCompactWindowResize = () => scheduleCompactHeaderUpdate()
  window.addEventListener('resize', requestHeaderCompactWindowResize)

  const section = requestCustomerSectionRef.value
  const strip = requestHeaderStripRef.value
  compactHeaderResizeObserver = new ResizeObserver(() => scheduleCompactHeaderUpdate())
  if (section) compactHeaderResizeObserver.observe(section)
  if (strip) compactHeaderResizeObserver.observe(strip)

  scheduleCompactHeaderUpdate()
}

function setupRequestHeaderCompactTracking() {
  showCompactRequestHeader.value = false
  requestAnimationFrame(() => {
    attachRequestHeaderCompactTracking()
  })
}

watch(
  () => [props.request?.compositeId, showAssociatedTasksOrTimeline.value],
  async () => {
    showCompactRequestHeader.value = false
    await nextTick()
    setupRequestHeaderCompactTracking()
  },
  { flush: 'post' }
)

onMounted(async () => {
  await nextTick()
  setupRequestHeaderCompactTracking()
})

onBeforeUnmount(() => {
  if (removeRequestHeaderCompactScrollListeners) {
    removeRequestHeaderCompactScrollListeners()
    removeRequestHeaderCompactScrollListeners = null
  }
  if (compactHeaderResizeObserver) {
    compactHeaderResizeObserver.disconnect()
    compactHeaderResizeObserver = null
  }
  if (requestHeaderCompactWindowResize) {
    window.removeEventListener('resize', requestHeaderCompactWindowResize)
    requestHeaderCompactWindowResize = null
  }
})

async function handleRequestedCarSave(payload) {
  const r = props.request
  if (!r?.id) return
  let updates
  if (payload && typeof payload === 'object' && 'requestedCar' in payload) {
    const { requestedCar, ...rest } = payload
    updates = { requestedCar, ...rest }
  } else {
    updates = { requestedCar: payload }
  }
  try {
    if (r.type === 'lead') {
      await leadsStore.updateLead(r.id, updates)
      await leadsStore.fetchLeadById(r.id)
    } else {
      await opportunitiesStore.updateOpportunity(r.id, updates)
      await opportunitiesStore.fetchOpportunityById(r.id)
    }
    toastStore.pushToast('success', 'Requested car updated')
  } catch {
    toastStore.pushToast('error', 'Failed to update requested car')
    throw new Error('Save failed')
  }
}

function handleOpenAd() {}

function handleMoreActions() {}

function normalizeContactTagList(tags) {
  return (tags || []).map((t) =>
    typeof t === 'string' ? { name: t, color: null } : { name: t.name, color: t.color || null }
  )
}

const addTagModalExistingNames = computed(() => {
  if (addTagModalKind.value === 'request') {
    const tags = props.request?.tags || []
    return tags.map((x) => (typeof x === 'string' ? x : x.name))
  }
  const tags = props.request?.customer?.tags || []
  return tags.map((x) => (typeof x === 'string' ? x : x.name))
})

function openAddCustomerTagModal() {
  addTagModalEditTag.value = null
  addTagModalKind.value = 'customer'
  showAddTagModal.value = true
}

function openAddRequestTagModal() {
  addTagModalEditTag.value = null
  addTagModalKind.value = 'request'
  showAddTagModal.value = true
}

function closeAddTagModal() {
  showAddTagModal.value = false
  addTagModalKind.value = 'customer'
  addTagModalEditTag.value = null
}

function onEditRequestTag(tag) {
  addTagModalEditTag.value = { name: tag.name, color: tag.color }
  addTagModalKind.value = 'request'
  showAddTagModal.value = true
}

function onEditCustomerTag(tag) {
  addTagModalEditTag.value = { name: tag.name, color: tag.color }
  addTagModalKind.value = 'customer'
  showAddTagModal.value = true
}

async function onDeleteRequestTag(tag) {
  const r = props.request
  if (!r?.id) return
  const current = normalizeContactTagList(r.tags || [])
  const updatedTags = current.filter((t) => t.name !== tag.name)
  try {
    if (r.type === 'lead') {
      await leadsStore.updateLead(r.id, { tags: updatedTags })
      await leadsStore.fetchLeadById(r.id)
    } else if (r.type === 'opportunity') {
      await opportunitiesStore.updateOpportunity(r.id, { tags: updatedTags })
      await opportunitiesStore.fetchOpportunityById(r.id)
    }
  } catch {
    toastStore.pushToast('error', t('requestDetail.contactCard.saveFailed'))
  }
}

async function onDeleteCustomerTag(tag) {
  const r = props.request
  if (!r) return
  const customerId = r.customer?.id ?? r.customerId
  if (customerId == null || customerId === '') return
  const current = normalizeContactTagList(r.customer?.tags || [])
  const updatedTags = current.filter((t) => t.name !== tag.name)
  try {
    await customersStore.updateCustomer(customerId, { tags: updatedTags }, 'contact')
    if (r.type === 'lead') {
      await leadsStore.fetchLeadById(r.id)
    } else if (r.type === 'opportunity') {
      await opportunitiesStore.fetchOpportunityById(r.id)
    }
  } catch {
    toastStore.pushToast('error', t('requestDetail.contactCard.saveFailed'))
  }
}

async function handleAddTagModalAdd(payload) {
  if (addTagModalKind.value === 'request') {
    await handleAddRequestTag(payload)
  } else {
    await handleAddCustomerTag(payload)
  }
}

async function handleAddTagModalUpdate(payload) {
  const { previousName, name, color } = payload
  if (addTagModalKind.value === 'request') {
    await handleUpdateRequestTag({ previousName, name, color })
  } else {
    await handleUpdateCustomerTag({ previousName, name, color })
  }
}

async function handleUpdateRequestTag({ previousName, name, color }) {
  const r = props.request
  if (!r?.id) return
  const current = normalizeContactTagList(r.tags || [])
  const idx = current.findIndex((t) => t.name === previousName)
  if (idx === -1) {
    closeAddTagModal()
    return
  }
  if (name !== previousName && current.some((t) => t.name === name)) {
    return
  }
  const updatedTags = current.map((t) =>
    t.name === previousName ? { name, color: color || null } : t
  )
  try {
    if (r.type === 'lead') {
      await leadsStore.updateLead(r.id, { tags: updatedTags })
      await leadsStore.fetchLeadById(r.id)
    } else if (r.type === 'opportunity') {
      await opportunitiesStore.updateOpportunity(r.id, { tags: updatedTags })
      await opportunitiesStore.fetchOpportunityById(r.id)
    }
    closeAddTagModal()
  } catch {
    toastStore.pushToast('error', t('requestDetail.contactCard.saveFailed'))
  }
}

async function handleUpdateCustomerTag({ previousName, name, color }) {
  const r = props.request
  if (!r) return
  const customerId = r.customer?.id ?? r.customerId
  if (customerId == null || customerId === '') return
  const current = normalizeContactTagList(r.customer?.tags || [])
  const idx = current.findIndex((t) => t.name === previousName)
  if (idx === -1) {
    closeAddTagModal()
    return
  }
  if (name !== previousName && current.some((t) => t.name === name)) {
    return
  }
  const updatedTags = current.map((t) =>
    t.name === previousName ? { name, color: color || null } : t
  )
  try {
    await customersStore.updateCustomer(customerId, { tags: updatedTags }, 'contact')
    if (r.type === 'lead') {
      await leadsStore.fetchLeadById(r.id)
    } else if (r.type === 'opportunity') {
      await opportunitiesStore.fetchOpportunityById(r.id)
    }
    closeAddTagModal()
  } catch {
    toastStore.pushToast('error', t('requestDetail.contactCard.saveFailed'))
  }
}

async function handleAddRequestTag(payload) {
  const r = props.request
  if (!r?.id) return
  const name = typeof payload === 'string' ? payload : payload.name
  const color = typeof payload === 'object' && payload?.color ? payload.color : null
  const current = normalizeContactTagList(r.tags || [])
  if (current.some((t) => t.name === name)) {
    closeAddTagModal()
    return
  }
  const updatedTags = [...current, { name, color: color || null }]
  try {
    if (r.type === 'lead') {
      await leadsStore.updateLead(r.id, { tags: updatedTags })
      await leadsStore.fetchLeadById(r.id)
    } else if (r.type === 'opportunity') {
      await opportunitiesStore.updateOpportunity(r.id, { tags: updatedTags })
      await opportunitiesStore.fetchOpportunityById(r.id)
    }
    closeAddTagModal()
  } catch {
    toastStore.pushToast('error', t('requestDetail.contactCard.saveFailed'))
  }
}

async function handleAddCustomerTag(payload) {
  const r = props.request
  if (!r) return
  const customerId = r.customer?.id ?? r.customerId
  if (customerId == null || customerId === '') return
  const name = typeof payload === 'string' ? payload : payload.name
  const color = typeof payload === 'object' && payload?.color ? payload.color : null
  const current = normalizeContactTagList(r.customer?.tags || [])
  if (current.some((t) => t.name === name)) {
    closeAddTagModal()
    return
  }
  const updatedTags = [...current, { name, color: color || null }]
  try {
    await customersStore.updateCustomer(customerId, { tags: updatedTags }, 'contact')
    if (r.type === 'lead') {
      await leadsStore.fetchLeadById(r.id)
    } else if (r.type === 'opportunity') {
      await opportunitiesStore.fetchOpportunityById(r.id)
    }
    closeAddTagModal()
  } catch {
    toastStore.pushToast('error', t('requestDetail.contactCard.saveFailed'))
  }
}

function handleQuickAction(key) {
  if (key === 'phone') {
    showCallComingSoonModal.value = true
    return
  }
  if (key === 'email') {
    showEmailModal.value = true
    return
  }
  if (key === 'sms') {
    showSMSModal.value = true
    return
  }
  if (key === 'whatsapp') {
    showWhatsAppModal.value = true
    return
  }
  if (key === 'note') {
    showNoteModal.value = true
    return
  }
  showGenericComingSoon.value = true
}

function handleOpenTaskDrawer(task) {
  const t = task ?? props.request
  if (!t?.compositeId) return
  emit('open-task-drawer', t)
}

async function handleLqfManageTask() {
  if (!props.request?.id || props.request.type !== 'lead') return
  lqfInlineManageOpen.value = true
  try {
    await leadsStore.fetchLeadById(props.request.id)
  } catch {
    // LQTask falls back to request payload when store load fails
  }
}

function handleLqfOpenPurchaseMethod() {
  editingFinancingOption.value = null
  showFinancingModal.value = true
}

function handleLqfOpenTradeIn() {
  editingTradeIn.value = null
  showTradeInModal.value = true
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

function navigationIndexInRows(rows, req) {
  if (!req?.compositeId || !rows?.length) return -1
  const idStr = String(req.compositeId)
  return rows.findIndex(
    (r) =>
      String(r.compositeId) === idStr ||
      (r.type === req.type && String(r.id) === String(req.id))
  )
}

function navigationTargetCompositeId(row) {
  if (row?.compositeId) return String(row.compositeId)
  if (row?.type != null && row.id != null) return `${row.type}-${row.id}`
  return ''
}

function handlePrevious() {
  if (!props.request?.compositeId || !props.filteredRequests?.length) return
  const idx = navigationIndexInRows(props.filteredRequests, props.request)
  if (idx > 0) {
    const prev = props.filteredRequests[idx - 1]
    const targetId = navigationTargetCompositeId(prev)
    if (targetId) emit('request-navigate', targetId)
  }
}

function handleNext() {
  if (!props.request?.compositeId || !props.filteredRequests?.length) return
  const idx = navigationIndexInRows(props.filteredRequests, props.request)
  if (idx >= 0 && idx < props.filteredRequests.length - 1) {
    const next = props.filteredRequests[idx + 1]
    const targetId = navigationTargetCompositeId(next)
    if (targetId) emit('request-navigate', targetId)
  }
}

function handleActivitySummaryToggle(activityId) {
  activityExpandedSummaries.value = {
    ...activityExpandedSummaries.value,
    [activityId]: !activityExpandedSummaries.value[activityId]
  }
}

function handleTaskAddActivity(activityType) {
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
    showCallComingSoonModal.value = true
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

async function handleActivityNoteSave(noteData) {
  const r = props.request
  if (!r?.id) return
  try {
    const payload = {
      type: 'note',
      user: activityAuthor.value,
      action: 'added a note',
      content: noteData.content || noteData.message,
      message: noteData.content || noteData.message,
      timestamp: new Date().toISOString()
    }
    if (r.type === 'lead') {
      await leadsStore.addActivity(r.id, payload)
      await leadsStore.fetchLeadById(r.id)
    } else {
      await opportunitiesStore.addActivity(r.id, payload)
      await opportunitiesStore.fetchOpportunityById(r.id)
    }
    showNoteModal.value = false
  } catch (err) {
    console.error('Error saving note:', err)
  }
}

async function handleActivityAttachmentSave(attachmentData) {
  const r = props.request
  if (!r?.id) return
  try {
    const payload = {
      type: 'attachment',
      user: activityAuthor.value,
      action: 'uploaded an attachment',
      fileName: attachmentData.fileName,
      file: attachmentData.file,
      content: `Attachment: ${attachmentData.fileName}`,
      timestamp: new Date().toISOString()
    }
    if (r.type === 'lead') {
      await leadsStore.addActivity(r.id, payload)
      await leadsStore.fetchLeadById(r.id)
    } else {
      await opportunitiesStore.addActivity(r.id, payload)
      await opportunitiesStore.fetchOpportunityById(r.id)
    }
    showAttachmentModal.value = false
  } catch (err) {
    console.error('Error saving attachment:', err)
  }
}

async function handleAttachmentsTabDroppedFiles(files) {
  if (!files?.length) return
  for (const file of files) {
    await handleActivityAttachmentSave({
      fileName: file.name,
      file
    })
  }
}

const {
  isFileDragActive: attachmentsListDragActive,
  onFileDragEnter: onAttachmentsListDragEnter,
  onFileDragLeave: onAttachmentsListDragLeave,
  onFileDragOver: onAttachmentsListDragOver,
  onFileDrop: onAttachmentsListDrop
} = useFileDropZone({
  onFiles: handleAttachmentsTabDroppedFiles
})

async function handleActivityWhatsAppSave(data) {
  const r = props.request
  if (!r?.id) return
  try {
    const payload = {
      type: 'whatsapp',
      user: activityAuthor.value,
      action: 'sent a WhatsApp message',
      message: data.message,
      content: data.message,
      template: data.template,
      timestamp: new Date().toISOString()
    }
    if (r.type === 'lead') {
      await leadsStore.addActivity(r.id, payload)
      await leadsStore.fetchLeadById(r.id)
    } else {
      await opportunitiesStore.addActivity(r.id, payload)
      await opportunitiesStore.fetchOpportunityById(r.id)
    }
    showWhatsAppModal.value = false
  } catch (err) {
    console.error('Error saving WhatsApp:', err)
  }
}

async function handleActivitySMSSave(data) {
  const r = props.request
  if (!r?.id) return
  try {
    const payload = {
      type: 'sms',
      user: activityAuthor.value,
      action: 'sent an SMS',
      message: data.message,
      content: data.message,
      template: data.template,
      timestamp: new Date().toISOString()
    }
    if (r.type === 'lead') {
      await leadsStore.addActivity(r.id, payload)
      await leadsStore.fetchLeadById(r.id)
    } else {
      await opportunitiesStore.addActivity(r.id, payload)
      await opportunitiesStore.fetchOpportunityById(r.id)
    }
    showSMSModal.value = false
  } catch (err) {
    console.error('Error saving SMS:', err)
  }
}

async function handleActivityEmailSave(data) {
  const r = props.request
  if (!r?.id) return
  try {
    const payload = {
      type: 'email',
      user: activityAuthor.value,
      action: 'sent an email',
      subject: data.subject,
      message: data.message,
      content: data.message,
      template: data.template,
      timestamp: new Date().toISOString()
    }
    if (r.type === 'lead') {
      await leadsStore.addActivity(r.id, payload)
      await leadsStore.fetchLeadById(r.id)
    } else {
      await opportunitiesStore.addActivity(r.id, payload)
      await opportunitiesStore.fetchOpportunityById(r.id)
    }
    showEmailModal.value = false
  } catch (err) {
    console.error('Error saving email:', err)
  }
}

async function handleActivityOfferSave(data) {
  const r = props.request
  if (!r?.id) return
  try {
    const activityPayload = {
      type: 'offer',
      user: activityAuthor.value,
      action: data.action || 'created an offer',
      content: data.content || `Offer: €${data.data?.price || 0}`,
      data: data.data,
      timestamp: new Date().toISOString()
    }
    if (r.type === 'lead') {
      await leadsStore.addActivity(r.id, activityPayload)
      await leadsStore.fetchLeadById(r.id)
    } else {
      await opportunitiesStore.addActivity(r.id, activityPayload)
      await opportunitiesStore.fetchOpportunityById(r.id)
    }
    showOfferModal.value = false
  } catch (err) {
    console.error('Error saving offer:', err)
  }
}

async function handleActivityAppointmentSave(data) {
  const r = props.request
  if (!r?.id) return
  try {
    const payload = {
      type: 'appointment',
      user: activityAuthor.value,
      action: 'scheduled an appointment',
      content: `Appointment: ${data.type || 'Meeting'} on ${data.date || ''}`,
      data,
      timestamp: new Date().toISOString()
    }
    if (r.type === 'lead') {
      await leadsStore.addActivity(r.id, payload)
      await leadsStore.fetchLeadById(r.id)
    } else {
      await opportunitiesStore.addActivity(r.id, payload)
      await opportunitiesStore.fetchOpportunityById(r.id)
    }
    showAppointmentModal.value = false
  } catch (err) {
    console.error('Error saving appointment:', err)
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
    const label =
      (parts.length ? parts.join(' ') + (v.year ? ` (${v.year})` : '') : 'Trade-in') || 'Trade-in'
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
    const typeLabel =
      data.type === 'FIN'
        ? 'Captive Financing'
        : data.type === 'LEA'
          ? 'Leasing'
          : data.type === 'LTR'
            ? 'Long-Term Rental'
            : data.type || 'Financing'
    const duration = data.fields?.duration ?? data.termMonths ?? null
    const content = duration ? `${typeLabel} ${duration} months` : typeLabel
    const activity = {
      type: 'financing',
      user: activityAuthor.value,
      action: editingFinancingOption.value
        ? 'updated a financing proposal'
        : 'added a financing proposal',
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
