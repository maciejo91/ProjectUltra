export const SUPER_ADMIN_PROFILE = 'superAdmin'

export const DEMO_ACCESS_PASSWORD = 'ADD2026'

const DEMO_ACCESSIBLE_ROUTE_NAMES = new Set([
  'home',
  'home-dashboard',
  'task-detail',
  'request-detail',
  'access-denied'
])

const DEMO_ACCESSIBLE_NAV_KEYS = new Set(['home', 'tasks'])

export function isSuperAdminProfile(profile) {
  return profile === SUPER_ADMIN_PROFILE
}

export function isRouteAvailableForDemo(route, profile) {
  if (isSuperAdminProfile(profile)) return true
  if (!route?.name) return true
  return DEMO_ACCESSIBLE_ROUTE_NAMES.has(route.name)
}

export function isNavItemAvailableForDemo(navKey, profile) {
  if (isSuperAdminProfile(profile)) return true
  return DEMO_ACCESSIBLE_NAV_KEYS.has(navKey)
}

export function isDemoAccessPasswordValid(password) {
  return password === DEMO_ACCESS_PASSWORD
}
