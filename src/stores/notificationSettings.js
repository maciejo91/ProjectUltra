import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import * as notificationSettingsApi from '@/api/notificationSettings'

export const useNotificationSettingsStore = defineStore('notificationSettings', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  const activeCount = computed(() =>
    items.value.filter(
      (x) =>
        Boolean(x?.channels?.email) ||
        Boolean(x?.channels?.inApp) ||
        Boolean(x?.channels?.mobileApp)
    ).length
  )

  async function fetchSettings() {
    loading.value = true
    error.value = null
    try {
      items.value = await notificationSettingsApi.fetchNotificationSettings()
    } catch (e) {
      error.value = e
      items.value = []
    } finally {
      loading.value = false
    }
  }

  async function setChannelEnabled(id, channel, enabled) {
    const idx = items.value.findIndex((x) => x?.id === id)
    if (idx < 0) return

    const previous = items.value[idx]
    const nextChannels = {
      ...(previous?.channels || {}),
      [channel]: Boolean(enabled)
    }
    items.value.splice(idx, 1, { ...previous, channels: nextChannels })

    try {
      await notificationSettingsApi.updateNotificationSetting(id, { channels: nextChannels })
    } catch (e) {
      items.value.splice(idx, 1, previous)
      error.value = e
    }
  }

  return {
    items,
    loading,
    error,
    activeCount,
    fetchSettings,
    setChannelEnabled
  }
})

