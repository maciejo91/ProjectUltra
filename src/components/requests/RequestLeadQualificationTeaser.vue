<template>
  <div
    v-if="showCard"
    class="flex w-full min-w-0 shrink-0 flex-col gap-0 overflow-hidden rounded-xl bg-muted p-1"
  >
    <div
      class="flex w-full shrink-0 items-center justify-between gap-2 px-4 py-1.5"
    >
      <p class="min-w-0 flex-1 text-xs font-medium leading-none text-foreground">
        {{ titleLabel }}
      </p>
      <div class="flex shrink-0 items-center gap-0.5">
        <span
          class="inline-flex size-6 items-center justify-center rounded-full bg-green-100 text-xs font-normal leading-none text-green-600"
          aria-hidden
        >
          {{ assigneeInitials }}
        </span>
        <button
          type="button"
          class="inline-flex h-6 shrink-0 select-none items-center gap-1.5 rounded-full border border-border bg-background px-2 text-xs font-medium tabular-nums text-foreground hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          :aria-label="timerAria"
          :title="timerTitle"
          @click="toggleTimerRunning"
        >
          <Clock class="size-3 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span class="leading-none">{{ countdownLabel }}</span>
        </button>
      </div>
    </div>
    <div
      class="relative flex w-full shrink-0 flex-col gap-0 overflow-hidden rounded-lg border-2 border-transparent bg-background px-4 py-3 shadow-nsc-card"
    >
      <svg
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
            y1="0.5"
            x2="1"
            y2="0.5"
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
        <p class="min-w-0 flex-1 text-base font-medium leading-normal text-foreground">
          {{ teaserLine }}
        </p>
        <div class="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <div
            v-if="isTaskActionInProgress"
            class="inline-flex h-9 w-full items-center justify-center gap-1 rounded-sm border border-border bg-background pl-3 pr-1 text-sm font-medium text-foreground sm:w-auto"
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
              class="h-9 w-full rounded-sm sm:w-40"
              @click="handleManageClick"
            >
              {{ manageLabel }}
            </Button>
            <Button
              variant="secondary"
              class="h-9 w-full rounded-sm sm:w-auto"
              @click="handleNotNowClick"
            >
              {{ notNowLabel }}
            </Button>
          </template>
        </div>
      </div>
    </div>
    <div
      v-if="$slots.outcome || $slots['next-attempt']"
      class="flex w-full min-w-0 shrink-0 flex-col gap-3 px-4 pb-3 pt-3"
    >
      <div v-if="$slots.outcome" class="min-w-0">
        <slot name="outcome" />
      </div>
      <div v-if="$slots['next-attempt']" class="min-w-0">
        <slot name="next-attempt" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useId } from 'vue'
import { useI18n } from 'vue-i18n'
import { Clock, LoaderCircle, X } from 'lucide-vue-next'
import { Button } from '@motork/component-library/future/primitives'

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
  }
})

const emit = defineEmits(['manage-task', 'not-now', 'open-full-task', 'cancel-action'])

const { t } = useI18n()

const showCard = computed(() => props.showTeaser && !props.dismissed && props.teaserLine)

const titleLabel = computed(() => t('requestDetail.lqfTask.title'))
const manageLabel = computed(() => t('requestDetail.lqfTask.manageTask'))
const notNowLabel = computed(() => t('requestDetail.lqfTask.notNow'))
const inProgressLabel = computed(() => t('requestDetail.lqfTask.inProgress'))
const timerAria = computed(() => t('requestDetail.lqfTask.timerAria'))
const timerTitle = computed(() =>
  isTimerRunning.value
    ? t('requestDetail.lqfTask.timerTitleRunning')
    : t('requestDetail.lqfTask.timerTitlePaused')
)

const ONE_HOUR_SECONDS = 60 * 60
const remainingSeconds = ref(ONE_HOUR_SECONDS)
const isTimerRunning = ref(true)
let intervalId = 0

const isManagingTask = ref(false)
const isPostponingTask = ref(false)
const isTaskActionInProgress = computed(
  () => isManagingTask.value || isPostponingTask.value || props.manageOpen || props.postponeOpen
)

const countdownLabel = computed(() => {
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
  if (stopped) return
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

onMounted(() => {
  stopped = false
  nextTick(() => {
    if (prefersReducedMotion() || stopped) return
    orbitStart = performance.now()
    rafId = requestAnimationFrame(runStrokeOrbit)
  })

  intervalId = window.setInterval(tickCountdown, 1000)
})

onUnmounted(() => {
  stopped = true
  if (rafId) cancelAnimationFrame(rafId)
  if (intervalId) window.clearInterval(intervalId)
})
</script>
