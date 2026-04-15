import { computed, onMounted, onUnmounted, ref } from 'vue'

const ONE_HOUR_SECONDS = 60 * 60

export function useLqTaskCountdown() {
  const remainingSeconds = ref(ONE_HOUR_SECONDS)
  let intervalId = 0

  const countdownLabel = computed(() => {
    const total = Math.max(0, remainingSeconds.value)
    const h = Math.floor(total / 3600)
    const m = Math.floor((total % 3600) / 60)
    const s = total % 60
    const mm = String(m).padStart(2, '0')
    const ss = String(s).padStart(2, '0')
    return `${h}:${mm}:${ss}`
  })

  function tick() {
    if (remainingSeconds.value <= 0) return
    remainingSeconds.value -= 1
  }

  function reset() {
    remainingSeconds.value = ONE_HOUR_SECONDS
  }

  onMounted(() => {
    intervalId = window.setInterval(tick, 1000)
  })

  onUnmounted(() => {
    if (intervalId) window.clearInterval(intervalId)
  })

  return {
    countdownLabel,
    reset
  }
}
