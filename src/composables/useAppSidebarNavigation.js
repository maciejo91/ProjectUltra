import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Home,
  Users,
  CarFront,
  ArrowDownToLine,
  ListTodo,
  Calendar,
  LineChart
} from 'lucide-vue-next'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'
import { useLeadsStore } from '@/stores/leads'

export function useAppSidebarNavigation() {
  const { t } = useI18n()
  const settingsStore = useSettingsStore()
  const userStore = useUserStore()
  const leadsStore = useLeadsStore()

  const navigationVisibility = computed(() => settingsStore.getSetting('navigationVisibility') || {})

  const firstVisibleRoute = computed(() => {
    const nav = navigationVisibility.value
    if (nav.home !== false) return '/home'
    if (nav.tasks !== false) return '/tasks'
    if (nav.customers !== false) return '/customers'
    if (nav.requests !== false) return '/requests'
    if (nav.calendar !== false) return '/calendar'
    if (userStore.canAccessReports() && nav.reports !== false) return '/reports'
    if (nav.lists !== false) return '/vehicles'
    return '/tasks'
  })

  const hotLeadsCount = computed(() => leadsStore.hotLeads.length)

  const navigationItems = computed(() => {
    const nav = navigationVisibility.value
    const items = []

    const push = (entry) => {
      items.push({
        ...entry,
        enabled: entry.enabled !== false
      })
    }

    if (nav.home !== false) {
      push({
        name: t('common.navigation.home'),
        href: '/home',
        icon: Home
      })
    }
    if (nav.customers !== false) {
      push({
        name: t('common.navigation.customers'),
        href: '/customers',
        icon: Users
      })
    }
    if (nav.lists !== false) {
      push({
        name: t('common.navigation.vehicles'),
        href: '/vehicles',
        icon: CarFront
      })
    }
    if (nav.requests !== false) {
      push({
        name: t('common.navigation.requests'),
        href: '/requests',
        icon: ArrowDownToLine
      })
    }
    if (nav.tasks !== false) {
      push({
        name: t('common.navigation.tasks'),
        href: '/tasks',
        icon: ListTodo,
        notificationCount: hotLeadsCount.value > 0 ? hotLeadsCount.value : undefined
      })
    }
    if (nav.calendar !== false) {
      push({
        name: t('common.navigation.calendar'),
        href: '/calendar',
        icon: Calendar
      })
    }
    if (userStore.canAccessReports() && nav.reports !== false) {
      push({
        name: t('common.navigation.reports'),
        href: '/reports',
        icon: LineChart
      })
    }

    return items.filter((i) => i.enabled !== false)
  })

  const addNewLabel = computed(() => t('common.navigation.addNew'))

  return {
    navigationVisibility,
    firstVisibleRoute,
    navigationItems,
    addNewLabel
  }
}
