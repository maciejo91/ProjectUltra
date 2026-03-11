import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * Holds request rows for next/previous navigation on the request detail page.
 * Set when navigating to a request (from Requests table, customer profile, etc.)
 * so the arrows work regardless of history state.
 */
export const useRequestNavigationStore = defineStore('requestNavigation', () => {
  const requestRows = ref([])

  function setRequestRows(rows) {
    requestRows.value = Array.isArray(rows) ? rows : []
  }

  function clearRequestRows() {
    requestRows.value = []
  }

  return {
    requestRows,
    setRequestRows,
    clearRequestRows
  }
})
