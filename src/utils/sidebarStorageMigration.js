const LEGACY_EXPANDED_KEY = 'projectultra_sidebar_expanded'
const LEGACY_COLLAPSED_KEY = 'sidebarState'
const COOKIE_NAME = 'sidebar_state'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7

function setSidebarCookie(open) {
  if (typeof document === 'undefined') return
  document.cookie = `${COOKIE_NAME}=${open}; path=/; max-age=${COOKIE_MAX_AGE}`
}

export function migrateSidebarStorage() {
  if (typeof document === 'undefined') return
  if (document.cookie.includes(`${COOKIE_NAME}=`)) {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(LEGACY_COLLAPSED_KEY)
      localStorage.removeItem(LEGACY_EXPANDED_KEY)
    }
    return
  }
  let open = true
  if (typeof localStorage !== 'undefined') {
    const legacyExpanded = localStorage.getItem(LEGACY_EXPANDED_KEY)
    const legacyCollapsed = localStorage.getItem(LEGACY_COLLAPSED_KEY)
    if (legacyExpanded !== null) {
      open = legacyExpanded === 'true'
    } else if (legacyCollapsed !== null) {
      try {
        const collapsed = JSON.parse(legacyCollapsed) === true
        open = !collapsed
      } catch {
        open = true
      }
    } else {
      open = false
    }
    localStorage.removeItem(LEGACY_COLLAPSED_KEY)
    localStorage.removeItem(LEGACY_EXPANDED_KEY)
  } else {
    open = false
  }
  setSidebarCookie(open)
}
