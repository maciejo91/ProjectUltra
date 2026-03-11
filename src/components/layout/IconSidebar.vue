<template>
  <div
    :class="[
      'dark sidebar-container hidden md:flex flex-col items-stretch py-2 gap-2 shrink-0 z-40 h-screen fixed left-0 top-0 border-r border-border overflow-visible',
      { 'sidebar-expanded': expanded }
    ]"
  >
    <!-- Sidebar expand/collapse -->
    <div class="w-full px-2 pt-2 pb-2 shrink-0 border-b border-white/10">
      <button
        type="button"
        :aria-label="expanded ? t('common.layout.closeSidebar') : t('common.layout.openSidebar')"
        :aria-expanded="expanded"
        :class="[
          'relative group flex w-full items-center rounded-md text-white/80 hover:bg-white/10 transition-colors',
          expanded ? 'h-9 gap-3 px-3' : 'h-9 justify-center'
        ]"
        @click="layoutStore.toggleSidebar()"
        @mouseenter="(e) => showSidebarTooltip(e, expanded ? t('common.layout.closeSidebar') : t('common.layout.openSidebar'))"
        @mouseleave="hideSidebarTooltip"
      >
        <PanelLeftClose v-if="expanded" :size="18" class="shrink-0" />
        <PanelLeft v-else :size="18" class="shrink-0" />
        <span v-if="expanded" class="truncate text-sm">{{ t('common.layout.closeSidebar') }}</span>
      </button>
    </div>

    <!-- Logo -->
    <div class="w-full px-2 pt-2 pb-2 shrink-0">
      <router-link
        :to="firstVisibleRoute"
        :class="['relative group flex items-center gap-2', expanded ? 'overflow-hidden' : 'justify-center overflow-visible']"
        @mouseenter="(e) => showSidebarTooltip(e, 'LeadSparK')"
        @mouseleave="hideSidebarTooltip"
      >
        <div
          :class="[
            'flex shrink-0 items-center justify-center rounded-md bg-transparent',
            expanded ? 'h-8 w-8' : 'h-8 w-full'
          ]"
        >
          <img
            src="@/assets/images/leadspark-logo.png"
            alt="LeadSparK"
            :class="expanded ? 'h-6 w-6 object-contain' : 'h-7 w-auto object-contain'"
          />
        </div>
        <span
          v-if="expanded"
          class="truncate text-sm font-semibold text-white"
        >
          LeadSparK
        </span>
      </router-link>
    </div>

    <!-- Add New -->
    <div class="w-full px-2 shrink-0">
      <router-link
        to="/add-new"
        :class="[
          'relative group flex items-center justify-center transition-colors rounded-md border border-border bg-transparent text-white hover:bg-white/10',
          expanded ? 'h-9 w-full gap-2' : 'h-9 w-full rounded-full'
        ]"
        aria-label="Add New Customer"
        title="Add New Customer"
        @mouseenter="(e) => showSidebarTooltip(e, 'Add New Customer')"
        @mouseleave="hideSidebarTooltip"
      >
        <Plus :size="16" class="shrink-0" />
        <span v-if="expanded" class="truncate text-sm font-medium">{{ $t('common.navigation.addNew') }}</span>
      </router-link>
    </div>

    <!-- Nav -->
    <div class="flex min-h-0 flex-1 flex-col gap-1 w-full px-2 overflow-y-auto overflow-x-visible">
      <router-link
        v-if="navigationVisibility.home !== false"
        to="/home"
        :class="[
          'relative group flex items-center gap-3 rounded-md transition-colors cursor-pointer',
          expanded ? 'h-9 px-3' : 'h-8 justify-center',
          isActive('/home') ? 'bg-white/20' : 'hover:bg-white/10'
        ]"
        aria-label="Home"
        title="Home"
        @mouseenter="(e) => showSidebarTooltip(e, 'Home')"
        @mouseleave="hideSidebarTooltip"
      >
        <Home :size="16" class="text-white shrink-0" />
        <span v-if="expanded" class="truncate text-sm text-white">Home</span>
      </router-link>

      <router-link
        v-if="navigationVisibility.customers !== false"
        to="/customers"
        :class="[
          'relative group flex items-center gap-3 rounded-md transition-colors cursor-pointer',
          expanded ? 'h-9 px-3' : 'h-8 justify-center',
          isActive('/customers') ? 'bg-white/20' : 'hover:bg-white/10'
        ]"
        aria-label="Customers"
        title="Customers"
        @mouseenter="(e) => showSidebarTooltip(e, 'Customers')"
        @mouseleave="hideSidebarTooltip"
      >
        <Users :size="16" class="text-white shrink-0" />
        <span v-if="expanded" class="truncate text-sm text-white">Customers</span>
      </router-link>

      <router-link
        v-if="navigationVisibility.lists !== false"
        to="/vehicles"
        :class="[
          'relative group flex items-center gap-3 rounded-md transition-colors cursor-pointer',
          expanded ? 'h-9 px-3' : 'h-8 justify-center',
          isActive('/vehicles') ? 'bg-white/20' : 'hover:bg-white/10'
        ]"
        aria-label="Vehicles"
        title="Vehicles"
        @mouseenter="(e) => showSidebarTooltip(e, 'Vehicles')"
        @mouseleave="hideSidebarTooltip"
      >
        <CarFront :size="16" class="text-white shrink-0" />
        <span v-if="expanded" class="truncate text-sm text-white">Vehicles</span>
      </router-link>

      <!-- Separator -->
      <div class="h-px bg-white/70 my-2 mx-1 shrink-0" aria-hidden="true" />

      <router-link
        v-if="navigationVisibility.requests !== false"
        to="/requests"
        :class="[
          'relative group flex items-center gap-3 rounded-md transition-colors cursor-pointer',
          expanded ? 'h-9 px-3' : 'h-8 justify-center',
          isActive('/requests') ? 'bg-white/20' : 'hover:bg-white/10'
        ]"
        aria-label="Requests"
        :title="$t('common.navigation.requests')"
        @mouseenter="(e) => showSidebarTooltip(e, t('common.navigation.requests'))"
        @mouseleave="hideSidebarTooltip"
      >
        <ArrowDownToLine :size="16" class="text-white shrink-0" />
        <span v-if="expanded" class="truncate text-sm text-white">{{ $t('common.navigation.requests') }}</span>
      </router-link>

      <router-link
        v-if="navigationVisibility.tasks !== false"
        to="/tasks"
        :class="[
          'relative group flex items-center gap-3 rounded-md transition-colors cursor-pointer',
          expanded ? 'h-9 px-3' : 'h-8 justify-center',
          isActive('/tasks') ? 'bg-white/20' : 'hover:bg-white/10'
        ]"
        aria-label="Tasks"
        title="Tasks"
        @mouseenter="(e) => showSidebarTooltip(e, 'Tasks')"
        @mouseleave="hideSidebarTooltip"
      >
        <ListTodo :size="16" class="text-white shrink-0" />
        <span v-if="expanded" class="truncate text-sm text-white">Tasks</span>
        <div v-if="hotLeadsCount > 0" :class="expanded ? 'absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-brand-red rounded-full' : 'absolute -right-1 top-0 w-2 h-2 bg-brand-red rounded-full'" />
      </router-link>

      <router-link
        v-if="navigationVisibility.calendar !== false"
        to="/calendar"
        :class="[
          'relative group flex items-center gap-3 rounded-md transition-colors cursor-pointer',
          expanded ? 'h-9 px-3' : 'h-8 justify-center',
          isActive('/calendar') ? 'bg-white/20' : 'hover:bg-white/10'
        ]"
        aria-label="Calendar"
        title="Calendar"
      >
        <Calendar :size="16" class="text-white shrink-0" />
        <span v-if="expanded" class="truncate text-sm text-white">Calendar</span>
        <span
          class="sidebar-icon-tooltip pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 whitespace-nowrap rounded-md bg-black/90 px-2 py-1 text-sm text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
        >
          Calendar
        </span>
      </router-link>

      <!-- Separator -->
      <div class="h-px bg-white/70 my-2 mx-1 shrink-0" aria-hidden="true" />

      <router-link
        v-if="userStore.canAccessReports() && navigationVisibility.reports !== false"
        to="/reports"
        :class="[
          'relative group flex items-center gap-3 rounded-md transition-colors cursor-pointer',
          expanded ? 'h-9 px-3' : 'h-8 justify-center',
          isActive('/reports') ? 'bg-white/20' : 'hover:bg-white/10'
        ]"
        aria-label="Insights"
        title="Insights"
      >
        <LineChart :size="16" class="text-white shrink-0" />
        <span v-if="expanded" class="truncate text-sm text-white">Insights</span>
        <span
          class="sidebar-icon-tooltip pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 whitespace-nowrap rounded-md bg-black/90 px-2 py-1 text-sm text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
        >
          Insights
        </span>
      </router-link>
    </div>
    
    <!-- Bottom: Search, Settings -->
    <div class="relative z-10 w-full px-2 flex flex-col gap-1 shrink-0">
      <button
        v-if="navigationVisibility.search !== false"
        type="button"
        @click="showSearchModal = true"
        :class="[
          'relative group flex items-center rounded-md transition-colors cursor-pointer hover:bg-white/10',
          expanded ? 'h-9 gap-3 px-3' : 'h-8 w-full justify-center'
        ]"
        aria-label="Search"
        title="Search"
      >
        <Search :size="16" class="text-white shrink-0" />
        <span v-if="expanded" class="truncate text-sm text-white">Search</span>
        <span
          class="sidebar-icon-tooltip pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 whitespace-nowrap rounded-md bg-black/90 px-2 py-1 text-sm text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
        >
          Search
        </span>
      </button>

      <router-link
        v-if="userStore.canAccessSettings()"
        to="/settings"
        :class="[
          'relative group flex items-center rounded-md transition-colors cursor-pointer',
          expanded ? 'h-9 gap-3 px-3' : 'h-8 justify-center',
          isActive('/settings') ? 'bg-white/20' : 'hover:bg-white/10'
        ]"
        aria-label="Settings"
        title="Settings"
      >
        <Settings :size="16" class="text-white shrink-0" />
        <span v-if="expanded" class="truncate text-sm text-white">Settings</span>
        <span
          class="sidebar-icon-tooltip pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 whitespace-nowrap rounded-md bg-black/90 px-2 py-1 text-sm text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
        >
          Settings
        </span>
      </router-link>
    </div>

    <!-- User Avatar -->
    <div class="w-full px-2 pb-2">
      <div class="relative" v-click-outside="() => (showUserMenu = false)">
        <button
          @click.stop="toggleUserMenu"
          :class="[
            'relative group w-full rounded-md flex items-center transition-colors cursor-pointer hover:bg-white/10',
            expanded ? 'h-9 gap-3 px-3' : 'h-8 justify-center'
          ]"
          aria-label="User Menu"
          title="User Menu"
        >
          <div
            class="user-avatar user-avatar-logo rounded-full flex items-center justify-center font-medium text-white shrink-0"
          >
            {{ userInitials }}
          </div>
          <span
            v-if="expanded"
            class="truncate text-sm text-white"
          >
            {{ userStore.currentUser?.name }}
          </span>
          <span
            class="sidebar-icon-tooltip pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 whitespace-nowrap rounded-md bg-black/90 px-2 py-1 text-sm text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
          >
            {{ userStore.currentUser?.name }}
          </span>
        </button>
        
        <!-- User Dropdown Menu -->
        <transition name="dropdown">
          <div 
            v-if="showUserMenu"
            class="sidebar-user-dropdown absolute left-full ml-2 bottom-0 mb-0 w-56 border border-border rounded-md shadow-mk-dashboard-card overflow-hidden z-[100]"
            @click.stop
          >
            <div class="p-3 border-b border-border sidebar-user-dropdown-header">
              <div class="text-sm font-semibold text-foreground">{{ userStore.currentUser.name }}</div>
              <div class="text-xs text-muted-foreground">{{ userStore.currentUser.email }}</div>
            </div>
            <div class="p-2">
              <button 
                @click="switchRole('manager')"
                class="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-red-50 hover:text-brand-red rounded-lg transition-colors flex items-center gap-2"
                :class="{ 'bg-red-50 text-brand-red': userStore.currentUser.role === 'manager' }"
              >
                <Shield :size="16" /> {{ $t('common.actions.switchRole') }} {{ $t('common.roles.manager') }}
              </button>
              <button 
                @click="switchRole('salesman')"
                class="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg transition-colors flex items-center gap-2"
                :class="{ 'bg-red-50 text-brand-red': userStore.currentUser.role === 'salesman' }"
              >
                <User :size="16" /> {{ $t('common.actions.switchRole') }} {{ $t('common.roles.salesman') }}
              </button>
              <button 
                @click="switchRole('operator')"
                class="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg transition-colors flex items-center gap-2"
                :class="{ 'bg-red-50 text-brand-red': userStore.currentUser.role === 'operator' }"
              >
                <Headphones :size="16" /> {{ $t('common.actions.switchRole') }} {{ $t('common.roles.operator') }}
              </button>
            </div>
            <div class="h-px bg-border mx-2"></div>
            <div v-if="navigationVisibility.language !== false" class="p-2">
              <button
                type="button"
                @click="showLanguageSubmenu = !showLanguageSubmenu"
                class="w-full flex items-center justify-between px-3 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg transition-colors"
              >
                <span>{{ $t('common.labels.language') }}</span>
                <ChevronDown :size="14" class="transition-transform" :class="{ 'rotate-180': showLanguageSubmenu }" />
              </button>
              <div v-if="showLanguageSubmenu" class="pl-4 pt-0.5 space-y-0.5">
                <button
                  v-for="lang in languages"
                  :key="lang.code"
                  type="button"
                  @click="changeLanguage(lang.code)"
                  class="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg transition-colors flex items-center gap-2"
                  :class="{ 'bg-red-50 text-brand-red': currentLocale === lang.code }"
                >
                  <span class="text-base">{{ lang.flag }}</span>
                  <span>{{ lang.name }}</span>
                </button>
              </div>
            </div>
            <div class="h-px bg-border mx-2"></div>
            <div class="p-2">
              <button 
                @click="toggleDarkMode"
                class="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg transition-colors flex items-center gap-2"
              >
                <Moon v-if="!isDarkMode" :size="16" />
                <Sun v-else :size="16" />
                {{ isDarkMode ? $t('common.actions.lightMode') : $t('common.actions.darkMode') }}
              </button>
            </div>
            <div class="h-px bg-border mx-2"></div>
            <div class="p-2">
              <button 
                @click="handleLogout"
                class="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg transition-colors flex items-center gap-2"
              >
                <LogOut :size="16" /> {{ $t('common.actions.logout') }}
              </button>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- COMO dropdown (below avatar) -->
    <div v-if="expanded" class="w-full px-2 pb-2 shrink-0">
      <button
        type="button"
        class="flex w-full items-center gap-3 rounded-md border border-border bg-transparent px-3 py-2 text-white hover:bg-white/10 transition-colors"
      >
        <div class="min-w-0 flex-1 text-left">
          <div class="truncate text-sm font-semibold">COMO</div>
          <div class="truncate text-xs text-white/70">Paris</div>
        </div>
        <ChevronDown :size="16" class="shrink-0 text-white/70" />
      </button>
    </div>

    <!-- Floating Search Modal -->
    <FloatingSearchModal
      :show="showSearchModal"
      @close="handleCloseSearchModal"
      @search="handleSearch"
    />

    <!-- Sidebar tooltip (teleported so it is not clipped by overflow) -->
    <Teleport to="body">
      <Transition name="dropdown">
        <div
          v-if="sidebarTooltip"
          class="fixed z-[9999] whitespace-nowrap rounded-md bg-black/90 px-2 py-1 text-sm text-white shadow-sm"
          :style="{
            left: `${sidebarTooltip.left}px`,
            top: `${sidebarTooltip.top}px`,
            transform: 'translateY(-50%)'
          }"
        >
          {{ sidebarTooltip.label }}
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLayoutStore } from '@/stores/layout'
import { useLeadsStore } from '@/stores/leads'
import { useUserStore } from '@/stores/user'
import { useSettingsStore } from '@/stores/settings'
import { useTheme } from '@/composables/useTheme'
import {
  Plus,
  Home,
  ListTodo,
  ArrowDownToLine,
  Users,
  Calendar,
  LineChart,
  Settings,
  CarFront,
  Search,
  Shield,
  User,
  Headphones,
  Moon,
  Sun,
  LogOut,
  ChevronDown,
  PanelLeft,
  PanelLeftClose
} from 'lucide-vue-next'
import FloatingSearchModal from '@/components/shared/FloatingSearchModal.vue'

const router = useRouter()
const route = useRoute()
const { locale, t } = useI18n()
const layoutStore = useLayoutStore()
const leadsStore = useLeadsStore()
const userStore = useUserStore()
const settingsStore = useSettingsStore()
const { isDark, toggleTheme } = useTheme()

watch(
  () => layoutStore.searchModalOpen,
  (open) => {
    showSearchModal.value = open
  }
)

function handleCloseSearchModal() {
  showSearchModal.value = false
  layoutStore.setSearchModalOpen(false)
}

const expanded = computed(() => layoutStore.sidebarExpanded)
const navigationVisibility = computed(() => settingsStore.getSetting('navigationVisibility') || {})

// Computed property to get the first visible route from the navbar
const firstVisibleRoute = computed(() => {
  const nav = navigationVisibility.value
  
  // Check routes in order of appearance
  if (nav.home !== false) return '/home'
  if (nav.tasks !== false) return '/tasks'
  if (nav.customers !== false) return '/customers'
  if (nav.requests !== false) return '/requests'
  if (nav.tasks !== false) return '/tasks'
  if (nav.calendar !== false) return '/calendar'
  if (userStore.canAccessReports() && nav.reports !== false) return '/reports'
  if (nav.lists !== false) return '/vehicles'
  
  // Fallback to tasks (home) if all are hidden
  return '/tasks'
})

const showUserMenu = ref(false)
const showLanguageSubmenu = ref(false)
const showSearchModal = ref(false)

const sidebarTooltip = ref(null)

function showSidebarTooltip(event, label) {
  const el = event?.currentTarget
  if (!el || !label) return
  const rect = el.getBoundingClientRect()
  sidebarTooltip.value = {
    label,
    left: rect.right + 8,
    top: rect.top + rect.height / 2
  }
}

function hideSidebarTooltip() {
  sidebarTooltip.value = null
}

watch(showUserMenu, (open) => {
  if (!open) showLanguageSubmenu.value = false
})

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' }
]

const hotLeadsCount = computed(() => leadsStore.hotLeads.length)
const isDarkMode = computed(() => isDark())
const currentLocale = computed(() => locale.value)

const userInitials = computed(() => {
  if (!userStore.currentUser || !userStore.currentUser.name) {
    return 'U'
  }
  const nameParts = userStore.currentUser.name.split(' ')
  if (nameParts.length >= 2) {
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
  }
  return nameParts[0][0].toUpperCase()
})

const isActive = (path) => {
  return route.path.startsWith(path)
}

const changeLanguage = (langCode) => {
  locale.value = langCode
  localStorage.setItem('app-locale', langCode)
  showLanguageSubmenu.value = false
  showUserMenu.value = false
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const switchRole = (role) => {
  userStore.switchRole(role)
  showUserMenu.value = false
  router.push('/home')
}

const handleLogout = () => {
  showUserMenu.value = false
  // TODO: Implement logout functionality
}

const toggleDarkMode = () => {
  toggleTheme()
}

const handleSearch = (query) => {
  handleCloseSearchModal()
}
</script>

<style scoped>
/* Dropdown animations */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

/* User dropdown: solid opaque panel so it never looks transparent or under another layer */
.sidebar-user-dropdown {
  isolation: isolate;
  background-color: var(--background, var(--base-background));
}

.sidebar-user-dropdown-header {
  background-color: var(--muted, var(--base-muted));
}

/* User Avatar Logo - Responsive sizing */
.user-avatar-logo {
  width: 1.5rem;
  height: 1.5rem;
  min-width: 1.5rem;
  min-height: 1.5rem;
  font-size: 0.75rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
