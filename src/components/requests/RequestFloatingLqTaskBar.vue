<template>
  <div class="relative z-20 flex h-auto max-h-none w-full shrink-0 flex-col px-2 pb-4 pt-2">
    <div class="relative z-20 flex h-auto max-h-none w-full shrink-0 flex-col">
      <div
        ref="panelShellRef"
        :role="isFocusMode ? 'dialog' : undefined"
        :aria-modal="isFocusMode"
        :aria-labelledby="focusTitleId"
        :class="[
          'flex min-h-min w-full shrink-0 flex-col overflow-visible rounded-xl',
          isFocusMode ? 'bg-mk-floating-lq-chrome p-1 shadow-mk-floating-lq-panel' : 'bg-transparent p-0'
        ]"
      >
        <div v-if="view === 'peek'" class="flex w-full min-w-0 shrink-0 flex-col">
          <RequestLeadQualificationTeaser
            ref="teaserRef"
            class="shrink-0"
            floating-elevated
            floating-inverse
            :show-teaser="true"
            :dismissed="false"
            :header-task-title="headerTaskTitle"
            :header-contact-subline="headerContactSubline"
            :call-now-tel-href="callNowTelHref"
            :session-header-title="teaserSessionHeaderTitle"
            :teaser-line="teaserLine"
            :assignee-initials="assigneeInitials"
            :assignment-lead-id="request.id"
            :manage-open="false"
            :internal-timer="false"
            :parent-countdown-label="lqTimer.countdownLabel"
            :timer-expired="lqTimer.isExpired"
            :timer-title="lqTimer.dueAtFullLabel || t('requestDetail.lqfTask.timerTooltip')"
            hide-body-subheader
            :contact-attempts="contactAttempts"
            :max-contact-attempts="maxContactAttempts"
            @manage-task="openFocus"
            @reassigned="$emit('reassigned')"
          />
        </div>

        <RequestLeadQualificationTeaser
          v-else-if="view === 'minimized'"
          ref="minimizedTeaserRef"
          class="w-full shrink-0"
          floating-elevated
          floating-inverse
          :show-teaser="true"
          :dismissed="false"
          :header-task-title="headerTaskTitle"
          :header-contact-subline="headerContactSubline"
          :call-now-tel-href="callNowTelHref"
          :session-header-title="teaserSessionHeaderTitle"
          :teaser-line="teaserLine"
          :assignee-initials="assigneeInitials"
          :assignment-lead-id="request.id"
          :manage-open="true"
          :resume-from-collapsed="true"
          :internal-timer="false"
            :parent-countdown-label="lqTimer.countdownLabel"
            :timer-expired="lqTimer.isExpired"
            :timer-title="lqTimer.dueAtFullLabel || t('requestDetail.lqfTask.timerTooltip')"
          hide-body-subheader
            :contact-attempts="contactAttempts"
            :max-contact-attempts="maxContactAttempts"
            @resume-collapsed="expandFromMinimized"
            @cancel-action="handleFloatingTeaserCancel"
            @reassigned="$emit('reassigned')"
        />

        <div
          v-else
          class="flex min-h-min w-full shrink-0 flex-col overflow-visible rounded-xl"
        >
          <RequestLqTaskHeaderRow
            ref="expandedHeaderRef"
            class="shrink-0"
            :title="expandedHeaderTitle"
            :subtitle="expandedHeaderSubtitle"
            :title-cta-label="expandedHeaderCallCtaLabel"
            :title-cta-href="expandedHeaderCallCtaHref"
            :title-id="focusTitleId"
            :assignee-initials="assigneeInitials"
            :assignment-lead-id="request.id"
            :countdown-label="lqTimer.countdownLabel"
            :timer-aria="t('requestDetail.lqfTask.timerAria')"
            :timer-title="lqTimer.dueAtFullLabel || t('requestDetail.lqfTask.timerTooltip')"
            :timer-expired="lqTimer.isExpired"
            :show-chevron="true"
            chevron-direction="down"
            :chevron-aria-label="t('requestDetail.floatingLq.minimize')"
            on-dark-surface
            show-call-attempts-ring
            :contact-attempts="contactAttempts"
            :max-contact-attempts="maxContactAttempts"
            @chevron-click="collapseToMinimized"
            @reassigned="$emit('reassigned')"
          />

          <RequestLqTaskExpandedOutcomeShell
            :active="view === 'expanded'"
            :flex-fill="false"
            :use-shell-scroll="false"
            :show-animated-border="!outcomeSummary"
          >
            <LeadManagementWidget
              :lead="request"
              :activities="activities"
              embed-outcome-only
              :outcome-summary="outcomeSummary"
              :qualify-inline-success="qualifyInlineSuccess"
              @postpone-expected-close="$emit('postpone-expected-close')"
              @reassigned="$emit('reassigned', $event)"
              @open-purchase-method="$emit('open-purchase-method')"
              @open-trade-in="$emit('open-trade-in')"
              @qualified-inline-success="$emit('qualified-inline-success', $event)"
              @lq-outcome-summary="$emit('lq-outcome-summary', $event)"
            />
          </RequestLqTaskExpandedOutcomeShell>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useId } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLeadsStore } from '@/stores/leads'
import { useLqTaskCountdown } from '@/composables/useLqTaskCountdown'
import { getDisplayStage, LEAD_STAGES } from '@/utils/stageMapper'
import RequestLeadQualificationTeaser from './RequestLeadQualificationTeaser.vue'
import RequestLqTaskExpandedOutcomeShell from './RequestLqTaskExpandedOutcomeShell.vue'
import RequestLqTaskHeaderRow from './RequestLqTaskHeaderRow.vue'
import LeadManagementWidget from '@/components/tasks/lead/LeadManagementWidget.vue'

const props = defineProps({
  request: {
    type: Object,
    required: true
  },
  activities: {
    type: Array,
    default: () => []
  },
  teaserLine: {
    type: String,
    default: ''
  },
  assigneeInitials: {
    type: String,
    default: ''
  },
  headerTaskTitle: {
    type: String,
    default: ''
  },
  headerContactSubline: {
    type: String,
    default: ''
  },
  callNowTelHref: {
    type: String,
    default: ''
  },
  callingSessionTitle: {
    type: String,
    default: ''
  },
  outcomeSummary: {
    type: Object,
    default: null
  },
  qualifyInlineSuccess: {
    type: Object,
    default: null
  },
  contactAttempts: {
    type: Number,
    default: 0
  },
  maxContactAttempts: {
    type: Number,
    default: 5
  }
})

const emit = defineEmits([
  'update:focus-mode',
  'postpone-expected-close',
  'reassigned',
  'open-purchase-method',
  'open-trade-in',
  'qualified-inline-success',
  'lq-outcome-summary'
])

const { t } = useI18n()
const leadsStore = useLeadsStore()
const lqTimer = useLqTaskCountdown(() => props.request?.nextActionDue ?? null)

const view = ref('peek')

const teaserSessionHeaderTitle = computed(() =>
  view.value === 'peek' ? '' : (props.callingSessionTitle || '').trim()
)

const expandedHeaderTitle = computed(() => {
  const session = (props.callingSessionTitle || '').trim()
  if (session) return session
  const custom = (props.headerTaskTitle || '').trim()
  return custom || t('requestDetail.lqfTask.title')
})

const expandedHeaderIsCallingSession = computed(() => !!(props.callingSessionTitle || '').trim())

const isAwaitingScheduledCallback = computed(() => {
  const r = props.request
  if (!r || r.type !== 'lead') return false
  const stage = getDisplayStage(r, 'lead')
  return stage === LEAD_STAGES.TO_BE_CALLED_BACK || stage === LEAD_STAGES.VALID_TO_BE_CALLED_BACK
})

const expandedHeaderSubtitle = computed(() =>
  expandedHeaderIsCallingSession.value ? '' : (props.headerContactSubline || '')
)

const expandedHeaderCallCtaLabel = computed(() =>
  expandedHeaderIsCallingSession.value ||
  !props.callNowTelHref ||
  props.outcomeSummary ||
  isAwaitingScheduledCallback.value
    ? ''
    : t('requestDetail.floatingLq.callNow')
)

const expandedHeaderCallCtaHref = computed(() =>
  expandedHeaderIsCallingSession.value || props.outcomeSummary || isAwaitingScheduledCallback.value
    ? ''
    : props.callNowTelHref
)

const focusTitleId = useId()
const panelShellRef = ref(null)
const teaserRef = ref(null)
const minimizedTeaserRef = ref(null)
const expandedHeaderRef = ref(null)

const isFocusMode = computed(() => view.value === 'expanded')

watch(
  isFocusMode,
  (v) => {
    emit('update:focus-mode', v)
  },
  { immediate: true }
)

async function openFocus() {
  const r = props.request
  if (r?.id && r.type === 'lead') {
    try {
      await leadsStore.fetchLeadById(r.id)
    } catch {
      /* LQTask falls back to request payload when store load fails */
    }
  }
  view.value = 'expanded'
  nextTick(() => {
    focusFirstInPanel()
    attachTrap()
  })
}

function collapseToMinimized() {
  detachTrap()
  view.value = 'minimized'
  nextTick(() => {
    const root = minimizedTeaserRef.value?.$el
    const btn = root?.querySelector('[data-lqf-expand-task]')
    if (btn && typeof btn.focus === 'function') btn.focus()
  })
}

function expandFromMinimized() {
  view.value = 'expanded'
  nextTick(() => {
    focusFirstInPanel()
    attachTrap()
  })
}

function handleFloatingTeaserCancel() {
  view.value = 'peek'
}

function focusFirstInPanel() {
  expandedHeaderRef.value?.focusForPanelTrap()
}

let trapHandler = null
function attachTrap() {
  detachTrap()
  trapHandler = (e) => {
    if (!isFocusMode.value) return
    if (e.key === 'Escape') {
      e.preventDefault()
      collapseToMinimized()
      return
    }
    if (e.key !== 'Tab' || !panelShellRef.value) return
    const root = panelShellRef.value
    const selectors =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    const nodes = Array.from(root.querySelectorAll(selectors)).filter(
      (n) => !n.hasAttribute('disabled') && n.offsetParent !== null
    )
    if (nodes.length === 0) return
    const first = nodes[0]
    const last = nodes[nodes.length - 1]
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    } else if (document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }
  document.addEventListener('keydown', trapHandler)
}

function detachTrap() {
  if (trapHandler) {
    document.removeEventListener('keydown', trapHandler)
    trapHandler = null
  }
}

onBeforeUnmount(() => {
  detachTrap()
  emit('update:focus-mode', false)
})

watch(
  () => [props.request?.compositeId, props.request?.nextActionDue],
  () => {
    detachTrap()
    view.value = 'peek'
    lqTimer.reset()
  }
)
</script>
