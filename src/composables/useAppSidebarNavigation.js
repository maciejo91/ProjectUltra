import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
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

  const sidebarProfile = computed(() => settingsStore.getSetting('sidebarProfile') || 'admin')
  const storedNavigationVisibility = computed(() => settingsStore.getSetting('navigationVisibility') || {})

  const profileNavigationVisibility = computed(() => {
    const profile = sidebarProfile.value
    if (profile === 'admin') return null

    const v = {
      home: false,
      tasks: false,
      requests: false,
      afterSales: false,
      conversations: false,
      customers: false,
      calendar: false,
      reports: false,
      lists: false,
      search: false,
      language: false,
      marketing: false,
      support: false
    }

    if (profile === 'salesRep') {
      return {
        ...v,
        tasks: true,
        calendar: true,
        conversations: true,
        customers: true,
        lists: true,
        requests: true,
        search: true,
        support: true
      }
    }

    if (profile === 'bdc') {
      return {
        ...v,
        tasks: true,
        calendar: true,
        conversations: true,
        customers: true,
        lists: true,
        requests: true,
        afterSales: true,
        reports: true,
        search: true,
        support: true
      }
    }

    if (profile === 'externalBdc') {
      return {
        ...v,
        tasks: true,
        support: true
      }
    }

    return null
  })

  const navigationVisibility = computed(() => profileNavigationVisibility.value ?? storedNavigationVisibility.value)

  const actionsVisibility = computed(() => {
    const profile = sidebarProfile.value
    const nav = navigationVisibility.value
    if (profile === 'externalBdc') {
      return { addNew: false, search: false }
    }
    return {
      addNew: true,
      search: nav.search !== false
    }
  })

  const bottomNavVisibility = computed(() => {
    const profile = sidebarProfile.value
    const nav = navigationVisibility.value
    return {
      support: nav.support !== false,
      settings: profile === 'admin' && userStore.canAccessSettings()
    }
  })

  const firstVisibleRoute = computed(() => {
    const nav = navigationVisibility.value
    if (nav.calendar !== false) return '/calendar'
    if (nav.tasks !== false) return '/tasks'
    if (nav.conversations !== false) return '/conversations'
    if (nav.customers !== false) return '/customers'
    if (nav.lists !== false) return '/vehicles'
    if (nav.requests !== false) return '/requests'
    if (nav.afterSales !== false) return '/after-sales'
    if (nav.reports !== false && (sidebarProfile.value !== 'admin' || userStore.canAccessReports())) return '/reports'
    return '/tasks'
  })

  const hotLeadsCount = computed(() => leadsStore.hotLeads.length)

  const primaryNavItems = computed(() => {
    const nav = navigationVisibility.value
    const items = []
    if (nav.tasks !== false) {
      items.push({
        name: t('common.navigation.tasks'),
        href: '/tasks',
        icon: ListTodo,
        notificationCount: hotLeadsCount.value > 0 ? hotLeadsCount.value : undefined
      })
    }
    if (nav.calendar !== false) {
      items.push({
        name: t('common.navigation.calendar'),
        href: '/calendar',
        icon: Calendar
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
    if (nav.reports !== false && (sidebarProfile.value !== 'admin' || userStore.canAccessReports())) {
      items.push({
        name: t('common.navigation.reports'),
        href: '/reports',
        icon: BarChart3
      })
    }
    if (nav.marketing !== false) {
      items.push({
        name: t('common.navigation.marketing'),
        href: '/marketing',
        icon: Megaphone
      })
    }
    return items
  })

  const addNewLabel = computed(() => t('common.navigation.addNew'))

  return {
    sidebarProfile,
    navigationVisibility,
    actionsVisibility,
    bottomNavVisibility,
    firstVisibleRoute,
    primaryNavItems,
    dataNavItems,
    addNewLabel
  }
}
