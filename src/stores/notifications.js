import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import * as notificationsApi from '@/api/notifications'

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref([])
  const loading = ref(false)
  const error = ref(null)

  const notificationCount = computed(() => notifications.value.length)
  const unreadCount = computed(() => notifications.value.filter((n) => n?.isRead === false).length)

  function markAllAsRead() {
    notifications.value = notifications.value.map((n) => ({ ...n, isRead: true }))
  }

  async function fetchNotifications({ limit } = {}) {
    loading.value = true
    error.value = null
    try {
      notifications.value = await notificationsApi.fetchNotifications({ limit })
    } catch (e) {
      error.value = e
      notifications.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    notifications,
    loading,
    error,
    notificationCount,
    unreadCount,
    markAllAsRead,
    fetchNotifications
  }
})

