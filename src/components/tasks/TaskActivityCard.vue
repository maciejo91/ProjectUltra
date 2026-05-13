<template>
  <div class="flex w-full min-w-0 flex-col bg-background p-4">
    <div class="mb-4 flex min-w-0 overflow-x-auto pb-1 scrollbar-hide">
      <SegmentedControl
        v-model="selectedPill"
        :aria-label="t('entities.activity.pills.ariaLabel')"
        :options="pillOptions"
      >
        <template #all>
          <span class="inline-flex items-center justify-center gap-1.5">
            <span>{{ t('entities.activity.pills.all') }}</span>
          </span>
        </template>
        <template #interactions>
          <span class="inline-flex items-center justify-center gap-1.5">
            <MessagesSquare class="size-4 shrink-0" aria-hidden="true" />
            <span>{{ t('entities.activity.pills.interactions') }}</span>
          </span>
        </template>
        <template #system>
          <span class="inline-flex items-center justify-center gap-1.5">
            <Info class="size-4 shrink-0" aria-hidden="true" />
            <span>{{ t('entities.activity.pills.system') }}</span>
          </span>
        </template>
      </SegmentedControl>
    </div>

    <div class="flex min-w-0 flex-col">
      <ActivityTimeline
        v-if="sortedActivities.length > 0"
        :activities="sortedActivities"
        :date-label="getActivityTimelineDateLabel(sortedActivities, t)"
        :timeline-variant="timelineVariant"
        :show-thread-action="true"
        @activity-click="handleActivityClick"
        @open-transcript="openTranscriptDialog"
        @open-thread="openThreadDialog"
        @add-activity="handleAddActivity"
      />
      <RequestTabEmptyState
        v-else-if="hasAnyActivities"
        :icon="Filter"
        :title="t('entities.activity.pills.emptyFilteredTitle')"
        :description="t('entities.activity.pills.emptyFilteredDescription')"
      />
      <RequestTabEmptyState
        v-else
        :icon="Clock"
        :title="t('entities.activity.timeline.emptyState')"
        :description="t('entities.activity.timeline.emptyStateDescription')"
      />
    </div>
  </div>

  <Dialog :open="!!transcriptDialogActivity" @update:open="(open) => !open && (transcriptDialogActivity = null)">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent
        class="flex max-h-[calc(100vh-4rem)] w-full flex-col sm:max-w-2xl"
        :show-close-button="true"
      >
        <DialogHeader class="shrink-0">
          <DialogTitle>{{ t('common.call.transcript') }}</DialogTitle>
        </DialogHeader>
        <div class="flex-1 w-full space-y-3 overflow-y-auto py-4">
          <div
            v-for="(line, idx) in transcriptDialogLines"
            :key="idx"
            class="flex gap-2 font-mono text-sm"
          >
            <span
              :class="
                line.speaker === 'Lead'
                  ? 'shrink-0 font-semibold text-emerald-700'
                  : 'shrink-0 font-semibold text-green-600'
              "
              >{{ line.speaker }}:</span
            >
            <span class="wrap-break-word text-foreground">{{ line.text }}</span>
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </Dialog>

  <Dialog
    :open="!!threadDialogId"
    @update:open="handleThreadDialogOpenChange"
  >
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent
        class="flex max-h-[calc(100vh-4rem)] w-full flex-col sm:max-w-2xl"
        :show-close-button="true"
      >
        <DialogHeader class="shrink-0">
          <DialogTitle>
            {{
              threadDialogKind === 'conversation'
                ? t('entities.activity.timeline.conversationTitle')
                : t('entities.activity.timeline.threadTitle')
            }}
          </DialogTitle>
        </DialogHeader>
        <div class="flex-1 w-full overflow-y-auto py-4">
          <ActivityTimeline
            v-if="threadDialogActivities.length > 0"
            :activities="threadDialogActivities"
            :date-label="''"
            :timeline-variant="timelineVariant"
            :show-thread-action="false"
            @activity-click="handleActivityClick"
            @open-transcript="openTranscriptDialog"
            @add-activity="handleAddActivity"
            @open-thread="() => {}"
          />
        </div>
      </DialogContent>
    </DialogPortal>
  </Dialog>

  <WhatsAppBusinessMockModal
    :show="showWhatsAppConversationModal"
    :contact-name="whatsAppConversationContactName"
    :assignee-name="whatsAppConversationAssigneeName"
    :conversation-messages="whatsAppConversationMessages"
    footer-variant="composer"
    @close="closeWhatsAppConversationModal"
    @choose-template="() => {}"
  />
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  MessagesSquare,
  Clock,
  Info,
  Filter
} from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle
} from '@motork/component-library/future/primitives'
import { useI18n } from 'vue-i18n'
import {
  getActivityTimelineDateLabel,
  getActivityIconKind,
  getCallTranscriptLines
} from '@/composables/useActivityTimelinePresentation'
import ActivityTimeline from '@/components/tasks/activity-timeline/ActivityTimeline.vue'
import RequestTabEmptyState from '@/components/requests/RequestTabEmptyState.vue'
import SegmentedControl from '@/components/shared/SegmentedControl.vue'
import WhatsAppBusinessMockModal from '@/components/modals/WhatsAppBusinessMockModal.vue'

const { t } = useI18n()

const props = defineProps({
  activities: {
    type: Array,
    default: () => []
  },
  timelineVariant: {
    type: String,
    default: ''
  },
  expandedSummaries: {
    type: Object,
    default: () => ({})
  },
  showAddAppointment: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['activity-click', 'toggle-summary-expanded', 'add-activity', 'add-appointment'])

const selectedPill = ref(
  /** @type {'all' | 'interactions' | 'system'} */ ('all')
)

const pillOptions = [
  { value: 'all', label: 'All' },
  { value: 'interactions', label: 'Interactions' },
  { value: 'system', label: 'System' }
]
const transcriptDialogActivity = ref(null)
const threadDialogId = ref(null)
const threadDialogKind = ref(/** @type {null | 'thread' | 'conversation'} */ (null))

const showWhatsAppConversationModal = ref(false)
const whatsAppConversationContactName = ref('')
const whatsAppConversationAssigneeName = ref('')
const whatsAppConversationMessages = ref([])

function closeWhatsAppConversationModal() {
  showWhatsAppConversationModal.value = false
}

const transcriptDialogLines = computed(() =>
  transcriptDialogActivity.value ? getCallTranscriptLines(transcriptDialogActivity.value) : []
)

function handleThreadDialogOpenChange(open) {
  if (open) return
  threadDialogId.value = null
  threadDialogKind.value = null
}

const threadDialogActivities = computed(() => {
  if (!threadDialogId.value) return []
  return activityList.value
    .filter((a) => (a?.data?.threadId || a?.threadId) === threadDialogId.value)
    .slice()
    .sort((a, b) => {
      const timeA = new Date(a.timestamp || a.createdAt || 0).getTime()
      const timeB = new Date(b.timestamp || b.createdAt || 0).getTime()
      return timeB - timeA
    })
})

const activityList = computed(() => (Array.isArray(props.activities) ? props.activities : []))

const hasAnyActivities = computed(() => activityList.value.length > 0)

function getActivityFilterCategory(activity) {
  if (getActivityIconKind(activity) === 'system') return 'system-updates'
  if (
    ['email', 'sms', 'whatsapp', 'call', 'customer-email', 'customer-whatsapp', 'customer-sms'].includes(
      activity.type
    )
  ) {
    return 'communication'
  }
  if (activity.type === 'note') return 'notes'
  if (activity.type === 'appointment') return 'appointments'
  if (activity.type === 'ai-summary') return 'notes'
  return null
}

function activityMatchesPill(activity, pill) {
  if (pill === 'all') return true
  if (pill === 'system') return getActivityFilterCategory(activity) === 'system-updates'
  if (pill === 'interactions') return getActivityFilterCategory(activity) !== 'system-updates'
  return true
}

const pillCounts = computed(() => {
  const list = activityList.value
  const count = (pred) => list.filter(pred).length
  return {
    interactions: count((a) => getActivityFilterCategory(a) !== 'system-updates'),
    system: count((a) => getActivityFilterCategory(a) === 'system-updates')
  }
})

const sortedActivities = computed(() => {
  const pill = selectedPill.value
  let filtered = activityList.value.filter((a) => activityMatchesPill(a, pill))
  return filtered.sort((a, b) => {
    const timeA = new Date(a.timestamp || a.createdAt || 0).getTime()
    const timeB = new Date(b.timestamp || b.createdAt || 0).getTime()
    return timeB - timeA
  })
})

function openTranscriptDialog(activity) {
  transcriptDialogActivity.value = activity
}

function openThreadDialog(payload) {
  const activity = payload?.activity || null
  const isWhatsAppConversation =
    payload?.kind === 'conversation' &&
    ['whatsapp', 'customer-whatsapp'].includes(String(activity?.type || ''))

  if (isWhatsAppConversation) {
    threadDialogId.value = null
    threadDialogKind.value = null
    const threadId = payload?.threadId || null
    const conversationActivities = threadId
      ? activityList.value.filter((a) => (a?.data?.threadId || a?.threadId) === threadId)
      : [activity].filter(Boolean)

    const onlyWhatsApp = conversationActivities.filter((a) =>
      ['whatsapp', 'customer-whatsapp'].includes(String(a?.type || ''))
    )

    const sortedAsc = onlyWhatsApp
      .slice()
      .sort(
        (a, b) =>
          new Date(a.timestamp || a.createdAt || 0) - new Date(b.timestamp || b.createdAt || 0)
      )

    whatsAppConversationMessages.value = sortedAsc.map((a, idx) => {
      const inbound = String(a?.type || '').startsWith('customer-')
      return {
        id: a.id ?? `wa-${idx}-${a.timestamp ?? a.createdAt ?? ''}`,
        side: inbound ? 'inbound' : 'outbound',
        text: a.content || a.message || '',
        timestampLabel: a.time || '',
        userLabel: a.user || ''
      }
    })

    const inferredCustomer =
      sortedAsc.find((a) => String(a?.type || '').startsWith('customer-'))?.user ||
      activity?.user ||
      ''

    whatsAppConversationContactName.value =
      activity?.customerName || activity?.contactName || activity?.data?.contactName || inferredCustomer
    whatsAppConversationAssigneeName.value = ''
    showWhatsAppConversationModal.value = true
    return
  }

  threadDialogId.value = payload?.threadId || null
  threadDialogKind.value = payload?.kind || null
}

const handleActivityClick = (activity) => {
  if (['note', 'email', 'whatsapp', 'customer-email', 'customer-whatsapp'].includes(activity.type)) {
    emit('activity-click', activity)
  }
}

const handleAddActivity = (action) => {
  emit('add-activity', action)
}
</script>

<style scoped>
.wrap-break-word {
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
}
</style>
