import { ref, watch, nextTick, onBeforeUnmount, toValue } from 'vue'

/**
 * Detects horizontal text overflow (ellipsis) on a measured element.
 * @param {import('vue').Ref<HTMLElement | null | undefined>} measureRef
 * @param {import('vue').MaybeRefOrGetter<unknown>} textSource - when this changes, re-measure after layout
 * @returns {{ isTruncated: import('vue').Ref<boolean>, measure: () => void }}
 */
export function useTextTruncation(measureRef, textSource) {
  const isTruncated = ref(false)
  let observer

  function measure() {
    const el = measureRef?.value
    if (!(el instanceof HTMLElement)) {
      isTruncated.value = false
      return
    }
    const pad = 1
    isTruncated.value = el.scrollWidth > el.clientWidth + pad
  }

  function attach(el) {
    observer?.disconnect()
    if (!(el instanceof HTMLElement)) return
    observer = new ResizeObserver(() => measure())
    observer.observe(el)
    measure()
  }

  function scheduleMeasure() {
    nextTick(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => measure())
      })
    })
  }

  watch(
    () => toValue(textSource),
    () => scheduleMeasure(),
    { flush: 'post' },
  )

  watch(
    measureRef,
    (el) => {
      observer?.disconnect()
      observer = undefined
      if (el instanceof HTMLElement) attach(el)
      else measure()
    },
    { flush: 'post' },
  )

  onBeforeUnmount(() => {
    observer?.disconnect()
  })

  return { isTruncated, measure }
}
