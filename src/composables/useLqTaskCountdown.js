import { computed, onMounted, onUnmounted, ref, unref, watch } from 'vue'
import { formatTaskTableDateTimeFull, isDueTimeExpired } from '@/utils/taskTableDates'

/**
 * Countdown to lead nextActionDue (same timestamp as tasks table Due time column).
 * @param {import('vue').MaybeRefOrGetter<string|null|undefined>} nextActionDueSource
 */
export function useLqTaskCountdown(nextActionDueSource) {
  const now = ref(Date.now())
  let intervalId = 0

  const dueTimestamp = computed(() => {
    const raw = typeof nextActionDueSource === 'function'
      ? nextActionDueSource()
      : unref(nextActionDueSource)
    if (!raw) return null
    const ms = new Date(raw).getTime()
    return Number.isNaN(ms) ? null : raw
  })

  const dueMs = computed(() => {
    if (!dueTimestamp.value) return null
    return new Date(dueTimestamp.value).getTime()
  })

  const isExpired = computed(() => {
    if (!dueTimestamp.value) return false
    return isDueTimeExpired(dueTimestamp.value)
  })

  const remainingSeconds = computed(() => {
    if (dueMs.value == null) return 0
    return Math.max(0, Math.floor((dueMs.value - now.value) / 1000))
  })

  const countdownLabel = computed(() => {
    if (!dueTimestamp.value) return '--:--:--'
    const total = remainingSeconds.value
    const h = Math.floor(total / 3600)
    const m = Math.floor((total % 3600) / 60)
    const s = total % 60
    return `${String(Math.min(h, 99))}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  })

  const dueAtFullLabel = computed(() => {
    if (!dueTimestamp.value) return ''
    return formatTaskTableDateTimeFull(dueTimestamp.value)
  })

  function syncNow() {
    now.value = Date.now()
  }

  function reset() {
    syncNow()
  }

  onMounted(() => {
    intervalId = window.setInterval(syncNow, 1000)
  })

  onUnmounted(() => {
    if (intervalId) window.clearInterval(intervalId)
  })

  watch(dueTimestamp, () => {
    syncNow()
  })

  return {
    countdownLabel,
    isExpired,
    dueAtFullLabel,
    reset
  }
}
