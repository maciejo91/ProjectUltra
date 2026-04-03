<template>
  <div
    v-if="showCard"
    :class="[
      'flex w-full min-w-0 shrink-0 flex-col gap-0 rounded-xl',
      floatingInverse ? 'bg-mk-floating-lq-chrome' : 'bg-background',
      expandableCollapsedCard
        ? [
            'cursor-pointer select-none p-0 shadow-mk-floating-lq-panel focus-within:ring-2 focus-within:ring-ring',
            floatingInverse ? 'hover:brightness-105' : 'hover:bg-muted/30'
          ]
        : 'p-1',
      !expandableCollapsedCard && floatingElevated && 'shadow-mk-floating-lq-panel',
      manageExpandedMode && 'shadow-mk-floating-lq-panel'
    ]"
    :role="expandableCollapsedCard ? 'region' : undefined"
    :aria-label="expandableCollapsedCard ? t('requestDetail.floatingLq.continue') : undefined"
    :tabindex="expandableCollapsedCard ? 0 : undefined"
    :data-lqf-expand-task="expandableCollapsedCard ? true : undefined"
    @click="onCollapsedShellClick"
    @keydown="onCollapsedShellKeydown"
  >
    <div
      :class="[
        'flex w-full min-w-0 flex-col gap-0',
        expandableCollapsedCard ? 'overflow-hidden rounded-xl' : 'rounded-lg'
      ]"
    >
    <template v-if="manageExpandedMode">
      <RequestLqTaskHeaderRow
        :title="effectiveHeaderTitle"
        :subtitle="manageHeaderSubtitle"
        :title-cta-label="manageHeaderCallCtaLabel"
        :title-cta-href="manageHeaderCallCtaHref"
        :assignee-initials="assigneeInitials"
        :countdown-label="headerCountdownLabel"
        :timer-aria="timerAria"
        :timer-title="timerTitle"
        :show-chevron="true"
        chevron-direction="down"
        :chevron-aria-label="t('requestDetail.floatingLq.minimize')"
        :on-dark-surface="floatingInverse"
        @toggle-timer="onHeaderTimerToggle"
        @chevron-click="$emit('cancel-action')"
      />
      <div class="w-full min-w-0 shrink-0">
        <RequestLqTaskExpandedOutcomeShell :active="true" :flex-fill="false">
          <slot name="outcome" />
        </RequestLqTaskExpandedOutcomeShell>
      </div>
    </template>
    <template v-else>
    <RequestLqTaskHeaderRow
      :title="peekHeaderTitle"
      :subtitle="peekHeaderSubtitle"
      :title-cta-label="peekHeaderCallCtaLabel"
      :title-cta-href="peekHeaderCallCtaHref"
      :assignee-initials="assigneeInitials"
      :countdown-label="headerCountdownLabel"
      :timer-aria="timerAria"
      :timer-title="timerTitle"
      :show-chevron="expandableCollapsedCard"
      chevron-direction="up"
      :chevron-aria-label="t('requestDetail.floatingLq.continue')"
      :on-dark-surface="floatingInverse"
      @toggle-timer="onHeaderTimerToggle"
      @chevron-click="resumeCollapsedTask"
    />
    <div
      :class="[
        'w-full shrink-0',
        !expandableCollapsedCard && 'rounded-lg',
        !expandableCollapsedCard &&
          (!floatingElevated || floatingInverse) &&
          'shadow-nsc-card'
      ]"
    >
      <div
        :class="[
          'relative flex w-full flex-col gap-0 overflow-hidden bg-background px-4 py-5',
          expandableCollapsedCard
            ? 'rounded-none border-t border-border'
            : 'rounded-lg border-2 border-transparent'
        ]"
      >
      <svg
        v-if="!expandableCollapsedCard"
        class="pointer-events-none absolute inset-0 z-10 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            ref="strokeGradientRef"
            :id="strokeGradId"
            gradientUnits="objectBoundingBox"
            gradientTransform="rotate(0 0.5 0.5)"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop offset="0%" stop-color="var(--primary)" stop-opacity="0" />
            <stop offset="28%" stop-color="var(--primary)" stop-opacity="0" />
            <stop offset="50%" stop-color="var(--primary)" stop-opacity="0.82" />
            <stop offset="72%" stop-color="var(--primary)" stop-opacity="0" />
            <stop offset="100%" stop-color="var(--primary)" stop-opacity="0" />
          </linearGradient>
        </defs>
        <rect
          x="1"
          y="1"
          width="calc(100% - 2px)"
          height="calc(100% - 2px)"
          rx="7"
          ry="7"
          fill="none"
          :stroke="`url(#${strokeGradId})`"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <div
        class="relative z-20 flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-2"
      >
        <div class="min-w-0 flex-1 flex flex-col gap-1">
          <p class="text-base font-semibold leading-snug text-foreground">
            {{ bodyTaskTitle }}
          </p>
          <p
            v-if="bodyTaskSubheader"
            class="text-sm leading-normal text-muted-foreground"
          >
            {{ bodyTaskSubheader }}
          </p>
        </div>
        <div class="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <div
            v-if="isTaskActionInProgress"
            class="inline-flex h-10 min-h-10 w-full items-center justify-center gap-1 rounded-sm border border-border bg-background pl-3 pr-1 text-sm font-medium text-foreground sm:w-auto"
            aria-live="polite"
          >
            <LoaderCircle class="size-4 shrink-0 animate-spin text-muted-foreground" aria-hidden="true" />
            <span class="px-1">{{ inProgressLabel }}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              class="size-7 shrink-0 rounded-sm text-muted-foreground hover:text-foreground"
              :aria-label="t('common.buttons.cancel')"
              @click.stop="cancelInProgress"
            >
              <X class="size-4" aria-hidden="true" />
            </Button>
          </div>
          <template v-else>
            <Button
              variant="default"
              size="lg"
              class="w-full rounded-sm sm:min-w-40 sm:w-auto"
              data-lqf-manage-task
              @click="handleManageClick"
            >
              {{ primaryActionButtonLabel }}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              class="w-full rounded-sm sm:w-auto"
              @click="handleNotNowClick"
            >
              {{ notNowLabel }}
            </Button>
          </template>
        </div>
      </div>
      </div>
    </div>
    </template>
    <div
      v-if="!manageExpandedMode && $slots['next-attempt']"
      :class="[
        'flex w-full min-w-0 shrink-0 flex-col gap-3 px-4 pb-5 pt-5',
        floatingInverse && 'border-t border-border bg-background'
      ]"
    >
      <div class="min-w-0">
        <slot name="next-attempt" />
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, useId, useSlots, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { LoaderCircle, X } from 'lucide-vue-next'
import { Button } from '@motork/component-library/future/primitives'
import RequestLqTaskExpandedOutcomeShell from './RequestLqTaskExpandedOutcomeShell.vue'
import RequestLqTaskHeaderRow from './RequestLqTaskHeaderRow.vue'

const props = defineProps({
  showTeaser: {
    type: Boolean,
    default: false
  },
  dismissed: {
    type: Boolean,
    default: false
  },
  manageOpen: {
    type: Boolean,
    default: false
  },
  postponeOpen: {
    type: Boolean,
    default: false
  },
  teaserLine: {
    type: String,
    default: ''
  },
  assigneeInitials: {
    type: String,
    default: ''
  },
  resumeFromCollapsed: {
    type: Boolean,
    default: false
  },
  internalTimer: {
    type: Boolean,
    default: true
  },
  parentCountdownLabel: {
    type: String,
    default: ''
  },
  parentTimerRunning: {
    type: Boolean,
    default: true
  },
  floatingElevated: {
    type: Boolean,
    default: false
  },
  floatingInverse: {
    type: Boolean,
    default: false
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
  sessionHeaderTitle: {
    type: String,
    default: ''
  }
})

const emit = defineEmits([
  'manage-task',
  'not-now',
  'open-full-task',
  'cancel-action',
  'resume-collapsed',
  'toggle-timer'
])

const { t } = useI18n()
const slots = useSlots()

const hasOutcomeSlot = computed(() => typeof slots.outcome === 'function')
const manageExpandedMode = computed(
  () => props.manageOpen && hasOutcomeSlot.value
)

const ONE_HOUR_SECONDS = 60 * 60
const remainingSeconds = ref(ONE_HOUR_SECONDS)
const isTimerRunning = ref(true)
let intervalId = 0

const countdownLabelInternal = computed(() => {
  const total = Math.max(0, remainingSeconds.value)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return `${h}:${mm}:${ss}`
})

function tickCountdown() {
  if (!isTimerRunning.value) return
  if (remainingSeconds.value <= 0) return
  remainingSeconds.value -= 1
}

function toggleTimerRunning() {
  isTimerRunning.value = !isTimerRunning.value
}

const showCard = computed(() => {
  if (!props.showTeaser || props.dismissed) return false
  const line = (props.teaserLine || '').trim()
  const task = (props.headerTaskTitle || '').trim()
  return !!(line || task)
})

const titleLabel = computed(() => t('requestDetail.lqfTask.title'))
const effectiveHeaderTitle = computed(() => {
  const session = (props.sessionHeaderTitle || '').trim()
  if (session) return session
  const custom = (props.headerTaskTitle || '').trim()
  return custom || titleLabel.value
})

const activeSessionHeader = computed(() => !!(props.sessionHeaderTitle || '').trim())

const callNowCtaLabel = computed(() => t('requestDetail.floatingLq.callNow'))

const manageHeaderSubtitle = computed(() =>
  activeSessionHeader.value ? '' : (props.headerContactSubline || '')
)

const manageHeaderCallCtaLabel = computed(() =>
  activeSessionHeader.value || !props.callNowTelHref ? '' : callNowCtaLabel.value
)

const manageHeaderCallCtaHref = computed(() =>
  activeSessionHeader.value ? '' : props.callNowTelHref
)
const manageLabel = computed(() => t('requestDetail.lqfTask.manageTask'))
const notNowLabel = computed(() => t('requestDetail.lqfTask.notNow'))
const inProgressLabel = computed(() => t('requestDetail.lqfTask.inProgress'))
const timerAria = computed(() => t('requestDetail.lqfTask.timerAria'))
const headerCountdownLabel = computed(() =>
  props.internalTimer ? countdownLabelInternal.value : props.parentCountdownLabel
)

const effectiveTimerRunning = computed(() =>
  props.internalTimer ? isTimerRunning.value : props.parentTimerRunning
)

const timerTitle = computed(() =>
  effectiveTimerRunning.value
    ? t('requestDetail.lqfTask.timerTitleRunning')
    : t('requestDetail.lqfTask.timerTitlePaused')
)

function onHeaderTimerToggle() {
  if (props.internalTimer) toggleTimerRunning()
  else emit('toggle-timer')
}

const isManagingTask = ref(false)
const isPostponingTask = ref(false)
const isTaskActionInProgress = computed(
  () => isManagingTask.value || isPostponingTask.value || props.manageOpen || props.postponeOpen
)

const expandableCollapsedCard = computed(
  () => props.resumeFromCollapsed && isTaskActionInProgress.value
)

const useCompactPeekHeader = computed(
  () => !expandableCollapsedCard.value
)

const peekHeaderTitle = computed(() =>
  useCompactPeekHeader.value ? titleLabel.value : effectiveHeaderTitle.value
)

const peekHeaderSubtitle = computed(() => {
  if (useCompactPeekHeader.value || activeSessionHeader.value) return ''
  return props.headerContactSubline || ''
})

const peekHeaderCallCtaLabel = computed(() => {
  if (useCompactPeekHeader.value || activeSessionHeader.value) return ''
  return props.callNowTelHref ? callNowCtaLabel.value : ''
})

const peekHeaderCallCtaHref = computed(() => {
  if (useCompactPeekHeader.value || activeSessionHeader.value) return ''
  return props.callNowTelHref
})

const bodyTaskTitle = computed(() => {
  const task = (props.headerTaskTitle || '').trim()
  return task || titleLabel.value
})

const bodyTaskSubheader = computed(() => (props.headerContactSubline || '').trim())

const primaryActionButtonLabel = computed(() =>
  props.callNowTelHref ? callNowCtaLabel.value : manageLabel.value
)

function resumeCollapsedTask() {
  emit('resume-collapsed')
}

function onCollapsedShellClick(e) {
  if (!expandableCollapsedCard.value) return
  if (e.target.closest('button')) return
  resumeCollapsedTask()
}

function onCollapsedShellKeydown(e) {
  if (!expandableCollapsedCard.value) return
  if (e.target !== e.currentTarget) return
  if (e.key !== 'Enter' && e.key !== ' ') return
  e.preventDefault()
  resumeCollapsedTask()
}

function handleManageClick() {
  isManagingTask.value = true
  isPostponingTask.value = false
  emit('manage-task')
}

function handleNotNowClick() {
  isPostponingTask.value = true
  isManagingTask.value = false
  emit('not-now')
}

function cancelInProgress() {
  isManagingTask.value = false
  isPostponingTask.value = false
  emit('cancel-action')
}

watch(
  () => props.manageOpen,
  (open) => {
    if (open) isManagingTask.value = false
  }
)

watch(
  () => props.postponeOpen,
  (open) => {
    if (open) isPostponingTask.value = false
  }
)

const strokeGradId = `lqfStrokeGrad-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
const strokeGradientRef = ref(null)
const STROKE_ORBIT_MS = 8000

function easeInOutSine(t) {
  return -(Math.cos(Math.PI * t) - 1) / 2
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

let rafId = 0
let orbitStart = 0
let stopped = false

function runStrokeOrbit(now) {
  if (stopped || expandableCollapsedCard.value) return
  const el = strokeGradientRef.value
  if (!el) {
    rafId = requestAnimationFrame(runStrokeOrbit)
    return
  }
  if (prefersReducedMotion()) {
    el.setAttribute('gradientTransform', 'rotate(0 0.5 0.5)')
    return
  }
  const t = ((now - orbitStart) % STROKE_ORBIT_MS) / STROKE_ORBIT_MS
  const angle = easeInOutSine(t) * 360
  el.setAttribute('gradientTransform', `rotate(${angle} 0.5 0.5)`)
  rafId = requestAnimationFrame(runStrokeOrbit)
}

watch(expandableCollapsedCard, (collapsed) => {
  if (collapsed) {
    if (rafId) cancelAnimationFrame(rafId)
    rafId = 0
    return
  }
  nextTick(() => {
    if (stopped || prefersReducedMotion() || !strokeGradientRef.value) return
    orbitStart = performance.now()
    rafId = requestAnimationFrame(runStrokeOrbit)
  })
})

onMounted(() => {
  stopped = false
  nextTick(() => {
    if (prefersReducedMotion() || stopped || expandableCollapsedCard.value) return
    orbitStart = performance.now()
    rafId = requestAnimationFrame(runStrokeOrbit)
  })

  if (props.internalTimer) {
    intervalId = window.setInterval(tickCountdown, 1000)
  }
})

onUnmounted(() => {
  stopped = true
  if (rafId) cancelAnimationFrame(rafId)
  if (intervalId) window.clearInterval(intervalId)
})
</script>
