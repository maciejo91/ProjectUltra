import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLayoutStore = defineStore('layout', () => {
  const searchModalOpen = ref(false)
  const hideHeaderForTaskDetail = ref(false)

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
    searchModalOpen,
    hideHeaderForTaskDetail,
    openSearchModal,
    setSearchModalOpen,
    setHideHeaderForTaskDetail
  }
})
