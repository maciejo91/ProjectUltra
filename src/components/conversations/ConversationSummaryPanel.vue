<template>
  <div
    class="flex h-full min-h-0 w-full min-w-0 shrink-0 flex-col overflow-hidden border-border border-t bg-muted lg:min-w-0 lg:flex-1 lg:border-l lg:border-t-0"
  >
    <div v-if="!displayTask" class="p-4 text-sm text-muted-foreground">
      {{ t('common.conversations.summary.empty') }}
    </div>
    <div
      v-else
      class="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain"
    >
      <div class="flex flex-col gap-2 p-2 pb-4">
        <div
          class="w-full min-w-0 shrink-0 overflow-hidden rounded-lg border border-border bg-background shadow-mk-dashboard-card"
        >
          <div
            class="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 pt-4 pb-2"
          >
            <h4 class="text-sm font-semibold text-foreground">
              {{ t('common.conversations.summary.requestDetails') }}
            </h4>
            <button
              type="button"
              class="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              :aria-label="t('common.conversations.summary.openRequest')"
              @click="openRequestInNewTab"
            >
              <ExternalLink class="size-3" />
            </button>
          </div>
          <div class="space-y-4 px-4 pt-4 pb-4">
            <TaskBadgesAndTags
              :task="displayTask"
              stacked
              class="min-w-0 w-full max-w-full"
              @tag-updated="handleTagUpdated"
            >
              <template #after-badges>
                <span
                  v-if="showScheduledRecallBadge"
                  class="badge-ui inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-sm font-semibold leading-none text-blue-700 uppercase"
                >
                  {{ t('common.conversations.summary.recall') }}
                </span>
                <span
                  v-if="requestTabAttemptsCount > 0"
                  class="badge-ui inline-flex items-center gap-1.5 rounded bg-muted px-2 py-0.5 text-sm font-semibold leading-none text-muted-foreground uppercase"
                >
                  <Phone class="size-2.5 shrink-0" aria-hidden />
                  {{ requestTabAttemptsValue }}
                </span>
              </template>
            </TaskBadgesAndTags>
            <LeadOpportunityDetailsCard
              :request="displayTask"
              :show-assignee-bar="false"
              bare
              class="w-full min-w-0 shrink-0"
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
          @open-ad="() => {}"
          @more-actions="() => {}"
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

        <CustomerContactDetailsCard
          :customer="contactCustomer"
          :account="null"
          :cars="[]"
          :leads="[]"
          :opportunities="[]"
          :show-other-interactions="false"
          :loading="false"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ExternalLink, Phone } from 'lucide-vue-next'
import { useLeadsStore } from '@/stores/leads'
import { useOpportunitiesStore } from '@/stores/opportunities'
import { useSettingsStore } from '@/stores/settings'
import { getDisplayStage } from '@/utils/stageMapper'
import { getRequestAttributionProps } from '@/utils/requestAttribution'
import TaskBadgesAndTags from '@/components/tasks/TaskBadgesAndTags.vue'
import CustomerContactDetailsCard from '@/components/customer/profile/CustomerContactDetailsCard.vue'
import VehicleRequestCard from '@/components/shared/VehicleRequestCard.vue'
import LeadOpportunityDetailsCard from '@/components/shared/LeadOpportunityDetailsCard.vue'
import RequestMessageCard from '@/components/requests/RequestMessageCard.vue'

const props = defineProps({
  threadId: { type: String, default: null }
})

const { t } = useI18n()
const router = useRouter()
const leadsStore = useLeadsStore()
const opportunitiesStore = useOpportunitiesStore()
const settingsStore = useSettingsStore()

const parsedThread = computed(() => {
  if (!props.threadId) return null
  const m = String(props.threadId).match(/^(lead|opportunity)-(\d+)-(email|whatsapp|sms)$/)
  if (!m) return null
  return { entityType: m[1], entityId: parseInt(m[2], 10), channel: m[3] }
})

const displayTask = computed(() => {
  const p = parsedThread.value
  if (!p) return null
  if (p.entityType === 'lead' && leadsStore.currentLead?.id === p.entityId) {
    const lead = leadsStore.currentLead
    return {
      ...lead,
      type: 'lead',
      compositeId: `lead-${lead.id}`,
      displayStage: getDisplayStage(lead, 'lead')
    }
  }
  if (p.entityType === 'opportunity' && opportunitiesStore.currentOpportunity?.id === p.entityId) {
    const opp = opportunitiesStore.currentOpportunity
    return {
      ...opp,
      type: 'opportunity',
      compositeId: `opportunity-${opp.id}`,
      displayStage: getDisplayStage(opp, 'opportunity')
    }
  }
  return null
})

const contactCustomer = computed(() => displayTask.value?.customer ?? null)

const taskAttribution = computed(() => getRequestAttributionProps(displayTask.value))

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

const showScheduledRecallBadge = computed(
  () => displayTask.value?.type === 'lead' && displayTask.value?.scheduledRecallAppointment?.date
)

const maxContactAttempts = computed(() => settingsStore.getSetting('maxContactAttempts') ?? 5)
const requestTabAttemptsCount = computed(() => displayTask.value?.contactAttempts?.length ?? 0)
const requestTabAttemptsValue = computed(
  () => `${requestTabAttemptsCount.value}/${maxContactAttempts.value}`
)

function getCarImageUrl(vehicle) {
  if (!vehicle) return ''
  return vehicle.image || vehicle.imageUrl || ''
}

function openRequestInNewTab() {
  const task = displayTask.value
  if (!task?.id || !task?.type) return
  const href = router.resolve({
    path: `/requests/${task.id}`,
    query: { type: task.type }
  }).href
  window.open(href, '_blank')
}

async function handleTagUpdated(data) {
  const task = displayTask.value
  if (!task) return
  const { tags } = data
  try {
    if (task.type === 'lead') {
      await leadsStore.updateLead(task.id, { tags })
      await leadsStore.fetchLeadById(task.id)
    } else if (task.type === 'opportunity') {
      await opportunitiesStore.updateOpportunity(task.id, { tags })
      await opportunitiesStore.fetchOpportunityById(task.id)
    }
  } catch {
    /* keep UI stable */
  }
}
</script>
