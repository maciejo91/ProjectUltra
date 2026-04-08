<template>
  <div
    :class="[
      'relative flex min-h-0 flex-col rounded-lg shadow-nsc-card',
      flexFill && (useShellScroll ? 'flex-1' : 'w-full shrink-0')
    ]"
  >
    <div
      :class="[
        'relative flex min-h-0 flex-col rounded-lg border-2 border-transparent bg-background',
        shellOverflowClass,
        flexFill && useShellScroll && 'flex-1'
      ]"
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
        :class="[
          'relative z-20 m-1 flex min-h-0 flex-col rounded-md bg-muted',
          shellOverflowClass,
          flexFill && useShellScroll && 'flex-1'
        ]"
      >
        <div
          :class="[
            'min-h-0 px-2 pb-3 pt-2',
            contentScrollClass
          ]"
        >
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, useId, watch } from 'vue'

const props = defineProps({
  active: {
    type: Boolean,
    default: false
  },
  flexFill: {
    type: Boolean,
    default: false
  },
  useShellScroll: {
    type: Boolean,
    default: true
  }
})

const shellOverflowClass = computed(() =>
  props.useShellScroll ? 'overflow-hidden' : 'overflow-visible'
)

const contentScrollClass = computed(() => {
  if (!props.useShellScroll) {
    return 'overflow-visible'
  }
  if (props.flexFill) {
    return 'min-h-0 flex-1 overflow-y-auto'
  }
  return 'max-h-[calc(100vh-4rem)] overflow-y-auto'
})

const strokeGradId = `lqfExpandedShellGrad-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
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
  if (stopped || !props.active) return
  const el = strokeGradientRef.value
  if (!el) {
    rafId = requestAnimationFrame(runStrokeOrbit)
    return
  }
  if (prefersReducedMotion()) {
    el.setAttribute('gradientTransform', 'rotate(0 0.5 0.5)')
    return
  }
  const tt = ((now - orbitStart) % STROKE_ORBIT_MS) / STROKE_ORBIT_MS
  const angle = easeInOutSine(tt) * 360
  el.setAttribute('gradientTransform', `rotate(${angle} 0.5 0.5)`)
  rafId = requestAnimationFrame(runStrokeOrbit)
}

function startOrbit() {
  stopped = false
  nextTick(() => {
    if (stopped || !props.active || prefersReducedMotion()) return
    orbitStart = performance.now()
    rafId = requestAnimationFrame(runStrokeOrbit)
  })
}

function stopOrbit() {
  stopped = true
  if (rafId) cancelAnimationFrame(rafId)
  rafId = 0
}

watch(
  () => props.active,
  (v) => {
    if (v) {
      startOrbit()
    } else {
      stopOrbit()
    }
  }
)

onMounted(() => {
  if (props.active) startOrbit()
})

onUnmounted(() => {
  stopOrbit()
})
</script>
