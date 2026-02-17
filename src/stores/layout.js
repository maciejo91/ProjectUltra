import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'projectultra_sidebar_expanded'

export const useLayoutStore = defineStore('layout', () => {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
  const sidebarExpanded = ref(stored !== null ? stored === 'true' : false)
  const searchModalOpen = ref(false)
  /** When true, MainLayout hides the desktop header so task detail (card view) gets full height. */
  const hideHeaderForTaskDetail = ref(false)

  function toggleSidebar() {
    sidebarExpanded.value = !sidebarExpanded.value
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(sidebarExpanded.value))
    }
  }

  function setSidebarExpanded(value) {
    sidebarExpanded.value = Boolean(value)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(sidebarExpanded.value))
    }
  }

  function openSearchModal() {
    searchModalOpen.value = true
  }

  function setSearchModalOpen(value) {
    searchModalOpen.value = Boolean(value)
  }

  function setHideHeaderForTaskDetail(value) {
    hideHeaderForTaskDetail.value = Boolean(value)
  }

  return {
    sidebarExpanded,
    searchModalOpen,
    hideHeaderForTaskDetail,
    toggleSidebar,
    setSidebarExpanded,
    openSearchModal,
    setSearchModalOpen,
    setHideHeaderForTaskDetail
  }
})
