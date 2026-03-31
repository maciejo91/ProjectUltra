import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Home,
  UserSquare,
  CarFront,
  Tag,
  MessageSquare,
  Wrench,
  ListTodo,
  Calendar,
  BarChart3,
  Megaphone
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
    if (nav.calendar !== false) return '/calendar'
    if (nav.tasks !== false) return '/tasks'
    if (nav.conversations !== false) return '/conversations'
    if (nav.customers !== false) return '/customers'
    if (nav.lists !== false) return '/vehicles'
    if (nav.requests !== false) return '/requests'
    if (nav.afterSales !== false) return '/after-sales'
    if (userStore.canAccessReports() && nav.reports !== false) return '/reports'
    return '/tasks'
  })

  const hotLeadsCount = computed(() => leadsStore.hotLeads.length)

  const primaryNavItems = computed(() => {
    const nav = navigationVisibility.value
    const items = []
    if (nav.home !== false) {
      items.push({
        name: t('common.navigation.home'),
        href: '/home',
        icon: Home
      })
    }
    if (nav.calendar !== false) {
      items.push({
        name: t('common.navigation.calendar'),
        href: '/calendar',
        icon: Calendar
      })
    }
    if (nav.tasks !== false) {
      items.push({
        name: t('common.navigation.tasks'),
        href: '/tasks',
        icon: ListTodo,
        notificationCount: hotLeadsCount.value > 0 ? hotLeadsCount.value : undefined
      })
    }
    if (nav.conversations !== false) {
      items.push({
        name: t('common.navigation.conversations'),
        href: '/conversations',
        icon: MessageSquare
      })
    }
    return items
  })

  const dataNavItems = computed(() => {
    const nav = navigationVisibility.value
    const items = []
    if (nav.customers !== false) {
      items.push({
        name: t('common.navigation.customers'),
        href: '/customers',
        icon: UserSquare
      })
    }
    if (nav.lists !== false) {
      items.push({
        name: t('common.navigation.vehicles'),
        href: '/vehicles',
        icon: CarFront
      })
    }
    if (nav.requests !== false) {
      items.push({
        name: t('common.navigation.sales'),
        href: '/requests',
        icon: Tag
      })
    }
    if (nav.afterSales !== false) {
      items.push({
        name: t('common.navigation.afterSales'),
        href: '/after-sales',
        icon: Wrench
      })
    }
    if (userStore.canAccessReports() && nav.reports !== false) {
      items.push({
        name: t('common.navigation.reports'),
        href: '/reports',
        icon: BarChart3
      })
    }
    if (nav.marketing !== false) {
      items.push({
        kind: 'comingSoon',
        id: 'marketing',
        name: t('common.navigation.marketing'),
        icon: Megaphone
      })
    }
    return items
  })

  const addNewLabel = computed(() => t('common.navigation.addNew'))

  return {
    navigationVisibility,
    firstVisibleRoute,
    primaryNavItems,
    dataNavItems,
    addNewLabel
  }
}
