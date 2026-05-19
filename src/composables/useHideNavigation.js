import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const STORAGE_KEY = 'projectultra-hide-navigation'
const LOCALE_BACKUP_KEY = 'projectultra-locale-before-embed'
const EMBED_LOCALE = 'it'

function isHideNavigationQueryValue(value) {
  if (value == null || value === '') return false
  const normalized = String(value).toLowerCase()
  return normalized === '1' || normalized === 'true' || normalized === 'yes'
}

export function useHideNavigation() {
  const route = useRoute()
  const { locale } = useI18n()

  const hideFromQuery = computed(() => isHideNavigationQueryValue(route.query['hide-navigation']))

  const hideNavigation = computed(
    () => hideFromQuery.value || sessionStorage.getItem(STORAGE_KEY) === '1'
  )

  watch(
    hideFromQuery,
    (hide) => {
      if (hide) {
        sessionStorage.setItem(STORAGE_KEY, '1')
      }
    },
    { immediate: true }
  )

  watch(
    hideNavigation,
    (hide) => {
      if (hide) {
        if (!sessionStorage.getItem(LOCALE_BACKUP_KEY)) {
          sessionStorage.setItem(LOCALE_BACKUP_KEY, locale.value)
        }
        locale.value = EMBED_LOCALE
        return
      }
      const previousLocale = sessionStorage.getItem(LOCALE_BACKUP_KEY)
      if (previousLocale) {
        locale.value = previousLocale
        sessionStorage.removeItem(LOCALE_BACKUP_KEY)
      }
    },
    { immediate: true }
  )

  return { hideNavigation }
}
