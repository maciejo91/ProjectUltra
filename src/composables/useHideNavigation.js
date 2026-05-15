import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'

const STORAGE_KEY = 'projectultra-hide-navigation'

function isHideNavigationQueryValue(value) {
  if (value == null || value === '') return false
  const normalized = String(value).toLowerCase()
  return normalized === '1' || normalized === 'true' || normalized === 'yes'
}

export function useHideNavigation() {
  const route = useRoute()

  const hideFromQuery = computed(() => isHideNavigationQueryValue(route.query['hide-navigation']))

  watch(
    hideFromQuery,
    (hide) => {
      if (hide) {
        sessionStorage.setItem(STORAGE_KEY, '1')
      }
    },
    { immediate: true }
  )

  const hideNavigation = computed(
    () => hideFromQuery.value || sessionStorage.getItem(STORAGE_KEY) === '1'
  )

  return { hideNavigation }
}
