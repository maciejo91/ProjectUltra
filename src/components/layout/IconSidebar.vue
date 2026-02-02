<template>
  <div 
    :class="[
      'sidebar-container hidden md:flex flex-col items-stretch py-2 gap-2 shrink-0 z-20 h-screen fixed left-0 top-0 border-r border-border'
    ]"
  >
    <!-- Logo at Top -->
    <div class="w-full px-2 pt-2 pb-2">
      <router-link :to="firstVisibleRoute" class="block">
        <div class="w-full h-8 rounded-md flex items-center justify-center">
          <img 
            src="@/assets/images/logo.svg" 
            alt="ProjectUltra Logo" 
            class="h-7 w-auto object-contain rounded-md"
          />
        </div>
      </router-link>
    </div>

    <!-- Create New Button -->
    <div class="w-full px-2">
      <router-link
        to="/add-new"
        class="relative group w-full h-8 bg-brand-red rounded-md flex items-center justify-center hover:bg-brand-redDark transition-colors"
        aria-label="Add New Customer"
        title="Add New Customer"
      >
        <Plus
          :size="16"
          class="text-white shrink-0"
        />
        <span
          class="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 whitespace-nowrap rounded-md bg-black/90 px-2 py-1 text-sm text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
        >
          Add New Customer
        </span>
      </router-link>
    </div>
    
    <!-- Navigation Icons -->
    <div class="flex flex-col gap-2 flex-1 w-full px-2">
      <!-- Home -->
      <router-link
        v-if="navigationVisibility.home !== false"
        to="/tasks"
        :class="[
          'relative group w-full h-8 rounded-md flex items-center justify-center transition-colors cursor-pointer',
          isActive('/tasks') ? 'bg-white/20' : 'hover:bg-white/10',
        ]"
        aria-label="Home"
        title="Home"
      >
        <Home
          :size="16"
          class="text-white shrink-0"
        />
        <span
          class="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 whitespace-nowrap rounded-md bg-black/90 px-2 py-1 text-sm text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
        >
          Home
        </span>
      </router-link>
      
      <!-- Tasks -->
      <router-link 
        v-if="navigationVisibility.tasks !== false"
        to="/tasks" 
        :class="[
          'relative group w-full h-8 rounded-md flex items-center justify-center transition-colors cursor-pointer',
          isActive('/tasks') ? 'bg-white/20' : 'hover:bg-white/10',
        ]"
        aria-label="Tasks"
        title="Tasks"
      >
        <List
          :size="16"
          class="text-white shrink-0"
        />
        <div v-if="hotLeadsCount > 0" class="absolute -right-1 top-0 w-2 h-2 bg-brand-red rounded-full"></div>
        <span
          class="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 whitespace-nowrap rounded-md bg-black/90 px-2 py-1 text-sm text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
        >
          Tasks
        </span>
      </router-link>
      
      <!-- Customers -->
      <router-link 
        v-if="navigationVisibility.customers !== false"
        to="/customers" 
        :class="[
          'relative group w-full h-8 rounded-md flex items-center justify-center transition-colors cursor-pointer',
          isActive('/customers') ? 'bg-white/20' : 'hover:bg-white/10',
        ]"
        aria-label="Customers"
        title="Customers"
      >
        <Users
          :size="16"
          class="text-white shrink-0"
        />
        <span
          class="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 whitespace-nowrap rounded-md bg-black/90 px-2 py-1 text-sm text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
        >
          Customers
        </span>
      </router-link>
      
      <!-- Calendar -->
      <router-link 
        v-if="navigationVisibility.calendar !== false"
        to="/calendar" 
        :class="[
          'relative group w-full h-8 rounded-md flex items-center justify-center transition-colors cursor-pointer',
          isActive('/calendar') ? 'bg-white/20' : 'hover:bg-white/10',
        ]"
        aria-label="Calendar"
        title="Calendar"
      >
        <Calendar
          :size="16"
          class="text-white shrink-0"
        />
        <span
          class="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 whitespace-nowrap rounded-md bg-black/90 px-2 py-1 text-sm text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
        >
          Calendar
        </span>
      </router-link>
      
      <!-- Reports -->
      <router-link 
        v-if="userStore.canAccessReports() && navigationVisibility.reports !== false"
        to="/reports" 
        :class="[
          'relative group w-full h-8 rounded-md flex items-center justify-center transition-colors cursor-pointer',
          isActive('/reports') ? 'bg-white/20' : 'hover:bg-white/10',
        ]"
        aria-label="Reports"
        title="Reports"
      >
        <LineChart
          :size="16"
          class="text-white shrink-0"
        />
        <span
          class="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 whitespace-nowrap rounded-md bg-black/90 px-2 py-1 text-sm text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
        >
          Reports
        </span>
      </router-link>
      
      <!-- Lists Icon with Dropdown -->
      <div v-if="navigationVisibility.lists !== false" class="relative" v-click-outside="() => (showListsMenu = false)">
        <button
          @click.stop="toggleListsMenu"
          :class="[
            'relative group w-full h-8 rounded-md flex items-center justify-center transition-colors cursor-pointer',
            (isActive('/vehicles') || showListsMenu) ? 'bg-white/20' : 'hover:bg-white/10',
          ]"
          aria-label="Lists"
          title="Lists"
        >
          <List
            :size="16"
            class="text-white shrink-0"
          />
          <span
            class="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 whitespace-nowrap rounded-md bg-black/90 px-2 py-1 text-sm text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
          >
            Lists
          </span>
        </button>
        
        <!-- Lists Dropdown Menu -->
        <transition name="dropdown">
          <div 
            v-if="showListsMenu"
            class="absolute left-full ml-2 bottom-0 mb-0 w-48 bg-white border border-border rounded-md shadow-mk-dashboard-card overflow-hidden z-50"
            @click.stop
          >
            <router-link 
              to="/vehicles"
              @click="showListsMenu = false"
              class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
              :class="{ 'bg-red-50 text-brand-red': isActive('/vehicles') }"
            >
              <CarFront :size="20" class="text-gray-400" :class="{ 'text-brand-red': isActive('/vehicles') }" /> Vehicles
            </router-link>
          </div>
        </transition>
      </div>
    </div>
    
    <!-- Bottom Icons -->
    <div class="w-full px-2 flex flex-col gap-2">
      <!-- Search Icon -->
      <button
        v-if="navigationVisibility.search !== false"
        @click="showSearchModal = true"
        :class="[
          'relative group w-full h-8 rounded-md flex items-center justify-center transition-colors cursor-pointer',
          'hover:bg-white/10',
        ]"
        aria-label="Search"
        title="Search"
      >
        <Search
          :size="16"
          class="text-white shrink-0"
        />
        <span
          class="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 whitespace-nowrap rounded-md bg-black/90 px-2 py-1 text-sm text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
        >
          Search
        </span>
      </button>

      <!-- Language Selector -->
      <div v-if="navigationVisibility.language !== false" class="relative" v-click-outside="() => (showLanguageMenu = false)">
        <button
          @click.stop="toggleLanguageMenu"
          :class="[
            'relative group w-full h-8 rounded-md flex items-center justify-center transition-colors cursor-pointer',
            showLanguageMenu ? 'bg-white/20' : 'hover:bg-white/10',
          ]"
          aria-label="Language"
          title="Language"
        >
          <Globe
            :size="16"
            class="text-white shrink-0"
          />
          <span
            class="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 whitespace-nowrap rounded-md bg-black/90 px-2 py-1 text-sm text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
          >
            Language
          </span>
        </button>
        
        <!-- Language Dropdown Menu -->
        <transition name="dropdown">
          <div 
            v-if="showLanguageMenu"
            class="absolute left-full ml-2 bottom-0 mb-0 w-48 bg-white border border-border rounded-md shadow-mk-dashboard-card overflow-hidden z-50"
            @click.stop
          >
            <button 
              v-for="lang in languages"
              :key="lang.code"
              @click="changeLanguage(lang.code)"
              class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
              :class="{ 'bg-red-50 text-brand-red': currentLocale === lang.code }"
            >
              <span class="text-base">{{ lang.flag }}</span>
              <span>{{ lang.name }}</span>
            </button>
          </div>
        </transition>
      </div>
      
      <!-- Settings Icon -->
      <router-link
        v-if="userStore.canAccessSettings()"
        to="/settings"
        :class="[
          'relative group w-full h-8 rounded-md flex items-center justify-center transition-colors cursor-pointer',
          isActive('/settings') ? 'bg-white/20' : 'hover:bg-white/10',
        ]"
        aria-label="Settings"
        title="Settings"
      >
        <Settings
          :size="16"
          class="text-white shrink-0"
        />
        <span
          class="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 whitespace-nowrap rounded-md bg-black/90 px-2 py-1 text-sm text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
        >
          Settings
        </span>
      </router-link>
    </div>

    <!-- User Avatar at Bottom with Dropdown -->
    <div class="w-full px-2 pb-2">
      <div class="relative" v-click-outside="() => (showUserMenu = false)">
        <button
          @click.stop="toggleUserMenu"
          class="w-full h-8 rounded-md flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="User Menu"
          title="User Menu"
        >
          <div 
            class="user-avatar user-avatar-logo rounded-full flex items-center justify-center font-medium text-white"
          >
            {{ userInitials }}
          </div>
        </button>
        
        <!-- User Dropdown Menu -->
        <transition name="dropdown">
          <div 
            v-if="showUserMenu"
            class="absolute left-full ml-2 bottom-0 mb-0 w-56 bg-white border border-border rounded-md shadow-mk-dashboard-card overflow-hidden z-50"
            @click.stop
          >
            <div class="p-3 border-b border-border bg-muted">
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

    <!-- Floating Search Modal -->
    <FloatingSearchModal 
      :show="showSearchModal" 
      @close="showSearchModal = false"
      @search="handleSearch"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLeadsStore } from '@/stores/leads'
import { useUserStore } from '@/stores/user'
import { useSettingsStore } from '@/stores/settings'
import { useTheme } from '@/composables/useTheme'
import { 
  Plus, 
  Home, 
  List, 
  Users, 
  Calendar, 
  LineChart, 
  Settings,
  CarFront,
  Search,
  Globe,
  Shield,
  User,
  Headphones,
  Moon,
  Sun,
  LogOut
} from 'lucide-vue-next'
import FloatingSearchModal from '@/components/shared/FloatingSearchModal.vue'

const router = useRouter()
const route = useRoute()
const { locale, t } = useI18n()
const leadsStore = useLeadsStore()
const userStore = useUserStore()
const settingsStore = useSettingsStore()
const { isDark, toggleTheme } = useTheme()

const navigationVisibility = computed(() => settingsStore.getSetting('navigationVisibility') || {})

// Computed property to get the first visible route from the navbar
const firstVisibleRoute = computed(() => {
  const nav = navigationVisibility.value
  
  // Check routes in order of appearance
  if (nav.home !== false) return '/tasks'
  if (nav.tasks !== false) return '/tasks'
  if (nav.customers !== false) return '/customers'
  if (nav.calendar !== false) return '/calendar'
  if (userStore.canAccessReports() && nav.reports !== false) return '/reports'
  if (nav.lists !== false) return '/vehicles'
  
  // Fallback to tasks (home) if all are hidden
  return '/tasks'
})

const showListsMenu = ref(false)
const showLanguageMenu = ref(false)
const showUserMenu = ref(false)
const showSearchModal = ref(false)

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

const toggleListsMenu = () => {
  showListsMenu.value = !showListsMenu.value
}

const toggleLanguageMenu = () => {
  showLanguageMenu.value = !showLanguageMenu.value
}

const changeLanguage = (langCode) => {
  locale.value = langCode
  localStorage.setItem('app-locale', langCode)
  showLanguageMenu.value = false
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const switchRole = (role) => {
  userStore.switchRole(role)
  showUserMenu.value = false
  router.push('/tasks')
}

const handleLogout = () => {
  showUserMenu.value = false
  // TODO: Implement logout functionality
}

const toggleDarkMode = () => {
  toggleTheme()
}

const handleSearch = (query) => {
  // Global search is not implemented yet; this is a no-op hook
  // that can be connected to a backend or in-memory search later.
  // TODO: Implement global search functionality
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

/* User Avatar Logo - Responsive sizing */
.user-avatar-logo {
  width: 1.75rem;
  height: 1.75rem;
  min-width: 1.75rem;
  min-height: 1.75rem;
  /* Font size scales with container: 50% of container size, clamped between 0.625rem and 0.875rem */
  font-size: clamp(0.625rem, 1rem, 0.875rem);
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
