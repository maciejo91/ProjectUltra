<template>
  <div class="flex w-full min-w-0 flex-col bg-background p-4">
    <div
      class="outcome-toggle-group mb-4 flex min-w-0 flex-nowrap items-center gap-2 overflow-x-auto pb-1 scrollbar-hide md:flex-wrap"
    >
      <Toggle
        variant="outline"
        class="outcome-toggle-item h-9 shrink-0 rounded-full border-border px-3 text-sm font-medium"
        :model-value="selectedPill === 'all'"
        @update:model-value="(on) => onPillToggle('all', on)"
      >
        {{ t('entities.activity.pills.all') }}
      </Toggle>
      <Toggle
        variant="outline"
        class="outcome-toggle-item h-9 shrink-0 gap-2 rounded-full border-border px-3 text-sm"
        :model-value="selectedPill === 'notes'"
        @update:model-value="(on) => onPillToggle('notes', on)"
      >
        <FileText class="size-4 shrink-0 text-muted-foreground" />
        <span>{{ t('entities.activity.pills.notes') }}</span>
        <span
          class="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium tabular-nums text-muted-foreground"
          >{{ pillCounts.notes }}</span
        >
      </Toggle>
      <Toggle
        variant="outline"
        class="outcome-toggle-item h-9 shrink-0 gap-2 rounded-full border-border px-3 text-sm"
        :model-value="selectedPill === 'calls'"
        @update:model-value="(on) => onPillToggle('calls', on)"
      >
        <Phone class="size-4 shrink-0 text-muted-foreground" />
        <span>{{ t('entities.activity.pills.calls') }}</span>
        <span
          class="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium tabular-nums text-muted-foreground"
          >{{ pillCounts.calls }}</span
        >
      </Toggle>
      <Toggle
        variant="outline"
        class="outcome-toggle-item h-9 shrink-0 gap-2 rounded-full border-border px-3 text-sm"
        :model-value="selectedPill === 'emails'"
        @update:model-value="(on) => onPillToggle('emails', on)"
      >
        <Mail class="size-4 shrink-0 text-muted-foreground" />
        <span>{{ t('entities.activity.pills.emails') }}</span>
        <span
          class="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium tabular-nums text-muted-foreground"
          >{{ pillCounts.emails }}</span
        >
      </Toggle>
      <Toggle
        variant="outline"
        class="outcome-toggle-item h-9 shrink-0 gap-2 rounded-full border-border px-3 text-sm"
        :model-value="selectedPill === 'tasks'"
        @update:model-value="(on) => onPillToggle('tasks', on)"
      >
        <CalendarCheck class="size-4 shrink-0 text-muted-foreground" />
        <span>{{ t('entities.activity.pills.tasks') }}</span>
        <span
          class="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium tabular-nums text-muted-foreground"
          >{{ pillCounts.tasks }}</span
        >
      </Toggle>
      <Toggle
        variant="outline"
        class="outcome-toggle-item h-9 shrink-0 gap-2 rounded-full border-border px-3 text-sm"
        :model-value="selectedPill === 'messages'"
        @update:model-value="(on) => onPillToggle('messages', on)"
      >
        <MessageCircle class="size-4 shrink-0 text-muted-foreground" />
        <span>{{ t('entities.activity.pills.messages') }}</span>
        <span
          class="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium tabular-nums text-muted-foreground"
          >{{ pillCounts.messages }}</span
        >
      </Toggle>
      <Toggle
        variant="outline"
        class="outcome-toggle-item h-9 shrink-0 gap-2 rounded-full border-border px-3 text-sm"
        :model-value="selectedPill === 'system'"
        @update:model-value="(on) => onPillToggle('system', on)"
      >
        <Info class="size-4 shrink-0 text-muted-foreground" />
        <span>{{ t('entities.activity.pills.system') }}</span>
        <span
          class="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium tabular-nums text-muted-foreground"
          >{{ pillCounts.system }}</span
        >
      </Toggle>
    </div>

    <div class="flex min-w-0 flex-col">
      <ActivityTimeline
        v-if="sortedActivities.length > 0"
        :activities="sortedActivities"
        :date-label="getActivityTimelineDateLabel(sortedActivities, t)"
        @activity-click="handleActivityClick"
        @open-transcript="openTranscriptDialog"
        @add-activity="handleAddActivity"
      />
      <div v-else-if="hasAnyActivities" class="flex flex-col justify-center py-10">
        <div class="text-center">
          <Filter class="mx-auto mb-2 size-8 text-muted-foreground/60" />
          <p class="text-sm text-muted-foreground">{{ t('entities.activity.pills.emptyFiltered') }}</p>
        </div>
      </div>
      <div v-else class="flex flex-col justify-center py-8">
        <div class="text-center">
          <Clock :size="32" class="mx-auto mb-2 text-muted-foreground" />
          <p class="text-sm text-muted-foreground">{{ t('entities.activity.timeline.emptyState') }}</p>
        </div>
      </div>
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
</template>

<script setup>
import { ref, computed } from 'vue'
import { Toggle } from '@motork/component-library/future/primitives'
import {
  FileText,
  Mail,
  Phone,
  Clock,
  CalendarCheck,
  MessageCircle,
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
  getCallTranscriptLines
} from '@/composables/useActivityTimelinePresentation'
import ActivityTimeline from '@/components/tasks/activity-timeline/ActivityTimeline.vue'

const { t } = useI18n()

const props = defineProps({
  activities: {
    type: Array,
    default: () => []
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
  /** @type {'all' | 'notes' | 'calls' | 'emails' | 'tasks' | 'messages' | 'system'} */ ('all')
)
const transcriptDialogActivity = ref(null)

const transcriptDialogLines = computed(() =>
  transcriptDialogActivity.value ? getCallTranscriptLines(transcriptDialogActivity.value) : []
)

const activityList = computed(() => (Array.isArray(props.activities) ? props.activities : []))

const hasAnyActivities = computed(() => activityList.value.length > 0)

function getActivityFilterCategory(activity) {
  if (
    ['email', 'sms', 'whatsapp', 'call', 'customer-email', 'customer-whatsapp', 'customer-sms'].includes(
      activity.type
    )
  ) {
    return 'communication'
  }
  if (activity.type === 'note') return 'notes'
  if (activity.type === 'appointment') return 'appointments'
  if (activity.type === 'transcription' || activity.transcription) return 'system-updates'
  if (
    activity.type === 'system' ||
    activity.type === 'created' ||
    activity.type === 'status' ||
    activity.type === 'lead-created' ||
    activity.type === 'lead-assigned' ||
    activity.type === 'lead-updated'
  ) {
    return 'system-updates'
  }
  if (activity.type === 'opportunity-created') return 'system-updates'
  if (activity.type === 'ai-summary') return 'notes'
  return null
}

function activityMatchesPill(activity, pill) {
  if (pill === 'all') return true
  if (pill === 'notes') return ['note', 'ai-summary'].includes(activity.type)
  if (pill === 'calls') return activity.type === 'call'
  if (pill === 'emails') return ['email', 'customer-email'].includes(activity.type)
  if (pill === 'tasks') return activity.type === 'appointment'
  if (pill === 'messages') {
    return ['sms', 'customer-sms', 'whatsapp', 'customer-whatsapp'].includes(activity.type)
  }
  if (pill === 'system') return getActivityFilterCategory(activity) === 'system-updates'
  return true
}

const pillCounts = computed(() => {
  const list = activityList.value
  const count = (pred) => list.filter(pred).length
  return {
    notes: count((a) => ['note', 'ai-summary'].includes(a.type)),
    calls: count((a) => a.type === 'call'),
    emails: count((a) => ['email', 'customer-email'].includes(a.type)),
    tasks: count((a) => a.type === 'appointment'),
    messages: count((a) =>
      ['sms', 'customer-sms', 'whatsapp', 'customer-whatsapp'].includes(a.type)
    ),
    system: count((a) => getActivityFilterCategory(a) === 'system-updates')
  }
})

function onPillToggle(pill, on) {
  if (on) {
    selectedPill.value = pill
    return
  }
  if (selectedPill.value === pill) {
    selectedPill.value = 'all'
  }
}

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
