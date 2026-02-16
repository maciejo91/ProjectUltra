<template>
  <!-- Backdrop -->
  <transition name="fade">
    <div 
      v-if="isOpen"
      class="fixed inset-0 bg-black/50 z-40 md:hidden"
      @click="$emit('close')"
    ></div>
  </transition>
  
  <!-- Sidebar Drawer -->
  <transition name="slide">
    <div
      v-if="isOpen"
      class="mobile-sidebar-container mobile-sidebar-drawer fixed top-0 left-0 bottom-0 w-64 z-50 md:hidden overflow-y-auto safe-area-top safe-area-bottom flex flex-col"
    >
      <!-- Header -->
      <div class="p-3 sm:p-4 border-b border-white/10 flex items-center justify-between shrink-0">
        <router-link :to="firstVisibleRoute" @click="$emit('close')" class="flex items-center gap-2 sm:gap-3">
          <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-md flex items-center justify-center bg-transparent">
            <img 
              src="@/assets/images/leadspark-logo.png" 
              alt="LeadSparK" 
              class="h-8 w-auto sm:h-9 object-contain rounded-md"
            />
          </div>
          <span class="text-white font-bold text-sm sm:text-base">LeadSparK</span>
        </router-link>
        <button 
          @click="handleClose"
          class="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors shrink-0 rounded-md"
          aria-label="Close menu"
        >
          <X :size="18" class="sm:hidden" />
          <X :size="20" class="hidden sm:block" />
        </button>
      </div>
      
      <!-- Navigation Items -->
      <div class="flex-1 flex flex-col py-2 sm:py-3">
        <!-- Add New Button -->
        <div class="px-3 mb-2 sm:mb-3">
          <router-link
            to="/add-new"
            @click="$emit('close')"
            class="w-full flex items-center justify-center gap-2 px-3 py-2.5 sm:px-4 sm:py-3 text-white bg-brand-red hover:bg-brand-redDark rounded-md transition-colors font-medium text-sm sm:text-base"
          >
            <Plus :size="16" class="sm:hidden shrink-0" />
            <Plus :size="18" class="hidden sm:block shrink-0" />
            <span>Add New Customer</span>
          </router-link>
        </div>

        <!-- Primary Navigation -->
        <div class="px-3 space-y-0.5 sm:space-y-1 flex-1">
          <!-- Home -->
          <router-link
            v-if="navigationVisibility.home !== false"
            to="/tasks"
            @click="$emit('close')"
            class="mobile-sidebar-link"
            :class="{ 'mobile-sidebar-link-active': isActive('/tasks') }"
          >
            <Home :size="18" class="shrink-0 sm:hidden" />
            <Home :size="20" class="shrink-0 hidden sm:block" />
            <span>Home</span>
          </router-link>

          <!-- Tasks -->
          <router-link 
            v-if="navigationVisibility.tasks !== false"
            to="/tasks" 
            @click="$emit('close')"
            class="mobile-sidebar-link"
            :class="{ 'mobile-sidebar-link-active': isActive('/tasks') }"
          >
            <List :size="18" class="shrink-0 sm:hidden" />
            <List :size="20" class="shrink-0 hidden sm:block" />
            <span>Tasks</span>
            <div v-if="hotLeadsCount > 0" class="ml-auto w-2 h-2 rounded-full bg-brand-red"></div>
          </router-link>
          
          <!-- Customers -->
          <router-link 
            v-if="navigationVisibility.customers !== false"
            to="/customers" 
            @click="$emit('close')"
            class="mobile-sidebar-link"
            :class="{ 'mobile-sidebar-link-active': isActive('/customers') }"
          >
            <Users :size="18" class="shrink-0 sm:hidden" />
            <Users :size="20" class="shrink-0 hidden sm:block" />
            <span>Customers</span>
          </router-link>
          
          <!-- Calendar -->
          <router-link 
            v-if="navigationVisibility.calendar !== false"
            to="/calendar" 
            @click="$emit('close')"
            class="mobile-sidebar-link"
            :class="{ 'mobile-sidebar-link-active': isActive('/calendar') }"
          >
            <Calendar :size="18" class="shrink-0 sm:hidden" />
            <Calendar :size="20" class="shrink-0 hidden sm:block" />
            <span>Calendar</span>
          </router-link>
          
          <!-- Reports -->
          <router-link 
            v-if="userStore.canAccessReports() && navigationVisibility.reports !== false"
            to="/reports" 
            @click="$emit('close')"
            class="mobile-sidebar-link"
            :class="{ 'mobile-sidebar-link-active': isActive('/reports') }"
          >
            <LineChart :size="18" class="shrink-0 sm:hidden" />
            <LineChart :size="20" class="shrink-0 hidden sm:block" />
            <span>Reports</span>
          </router-link>

          <!-- Lists Submenu -->
          <button
            v-if="navigationVisibility.lists !== false"
            @click="toggleListsMenu"
            class="mobile-sidebar-link w-full"
            :class="{ 'mobile-sidebar-link-active': isActive('/vehicles') || showListsMenu }"
          >
            <List :size="18" class="shrink-0 sm:hidden" />
            <List :size="20" class="shrink-0 hidden sm:block" />
            <span>Lists</span>
            <ChevronDown :size="14" class="ml-auto transition-transform sm:hidden" :class="{ 'rotate-180': showListsMenu }" />
            <ChevronDown :size="16" class="ml-auto transition-transform hidden sm:block" :class="{ 'rotate-180': showListsMenu }" />
          </button>
          
          <!-- Lists Submenu Items -->
          <div v-if="showListsMenu" class="pl-8 sm:pl-9 space-y-0.5 sm:space-y-1">
            <router-link 
              to="/vehicles"
              @click="$emit('close')"
              class="mobile-sidebar-link mobile-sidebar-submenu-link"
              :class="{ 'mobile-sidebar-link-active': isActive('/vehicles') }"
            >
              <CarFront :size="16" class="shrink-0 sm:hidden" />
              <CarFront :size="18" class="shrink-0 hidden sm:block" />
              <span>Vehicles</span>
            </router-link>
          </div>
        </div>

        <!-- Divider -->
        <div class="h-px bg-white/10 mx-3 my-2 sm:my-3"></div>
        
        <!-- Bottom Navigation -->
        <div class="px-3 space-y-0.5 sm:space-y-1">
          <!-- Search -->
          <button
            @click="handleSearch"
            class="mobile-sidebar-link w-full"
          >
            <Search :size="18" class="shrink-0 sm:hidden" />
            <Search :size="20" class="shrink-0 hidden sm:block" />
            <span>Search</span>
          </button>

          <!-- Language Selector -->
          <button
            v-if="navigationVisibility.language !== false"
            @click="toggleLanguageMenu"
            class="mobile-sidebar-link w-full"
            :class="{ 'mobile-sidebar-link-active': showLanguageMenu }"
          >
            <Globe :size="18" class="shrink-0 sm:hidden" />
            <Globe :size="20" class="shrink-0 hidden sm:block" />
            <span>Language</span>
            <ChevronDown :size="14" class="ml-auto transition-transform sm:hidden" :class="{ 'rotate-180': showLanguageMenu }" />
            <ChevronDown :size="16" class="ml-auto transition-transform hidden sm:block" :class="{ 'rotate-180': showLanguageMenu }" />
          </button>

          <!-- Language Submenu -->
          <div v-if="showLanguageMenu" class="pl-8 sm:pl-9 space-y-0.5 sm:space-y-1">
            <button
              v-for="lang in languages"
              :key="lang.code"
              @click="changeLanguage(lang.code)"
              class="mobile-sidebar-link mobile-sidebar-submenu-link w-full"
              :class="{ 'mobile-sidebar-link-active': currentLocale === lang.code }"
            >
              <span class="text-sm sm:text-base shrink-0">{{ lang.flag }}</span>
              <span>{{ lang.name }}</span>
            </button>
          </div>

          <!-- Settings -->
          <router-link 
            v-if="userStore.canAccessSettings()"
            to="/settings" 
            @click="$emit('close')"
            class="mobile-sidebar-link"
            :class="{ 'mobile-sidebar-link-active': isActive('/settings') }"
          >
            <Settings :size="18" class="shrink-0 sm:hidden" />
            <Settings :size="20" class="shrink-0 hidden sm:block" />
            <span>Settings</span>
          </router-link>
        </div>

        <!-- Divider -->
        <div class="h-px bg-white/10 mx-3 my-2 sm:my-3"></div>

        <!-- User Menu -->
        <div class="px-3 pb-2 sm:pb-0">
          <button
            @click="toggleUserMenu"
            class="mobile-sidebar-link w-full"
            :class="{ 'mobile-sidebar-link-active': showUserMenu }"
          >
            <div 
              class="user-avatar user-avatar-mobile rounded-full flex items-center justify-center font-medium text-white shrink-0"
            >
              {{ userInitials }}
            </div>
            <span class="truncate text-sm sm:text-base">{{ userStore.currentUser?.name || 'User' }}</span>
            <ChevronDown :size="14" class="ml-auto transition-transform sm:hidden" :class="{ 'rotate-180': showUserMenu }" />
            <ChevronDown :size="16" class="ml-auto transition-transform hidden sm:block" :class="{ 'rotate-180': showUserMenu }" />
          </button>

          <!-- User Submenu -->
          <div v-if="showUserMenu" class="pl-8 sm:pl-9 space-y-0.5 sm:space-y-1 mt-0.5 sm:mt-1">
            <!-- Role Switching -->
            <button 
              @click="switchRole('manager')"
              class="mobile-sidebar-link mobile-sidebar-submenu-link w-full"
              :class="{ 'mobile-sidebar-link-active': userStore.currentUser?.role === 'manager' }"
            >
              <Shield :size="16" class="shrink-0 sm:hidden" />
              <Shield :size="18" class="shrink-0 hidden sm:block" />
              <span>{{ $t('common.roles.manager') }}</span>
            </button>
            <button 
              @click="switchRole('salesman')"
              class="mobile-sidebar-link mobile-sidebar-submenu-link w-full"
              :class="{ 'mobile-sidebar-link-active': userStore.currentUser?.role === 'salesman' }"
            >
              <User :size="16" class="shrink-0 sm:hidden" />
              <User :size="18" class="shrink-0 hidden sm:block" />
              <span>{{ $t('common.roles.salesman') }}</span>
            </button>
            <button 
              @click="switchRole('operator')"
              class="mobile-sidebar-link mobile-sidebar-submenu-link w-full"
              :class="{ 'mobile-sidebar-link-active': userStore.currentUser?.role === 'operator' }"
            >
              <Headphones :size="16" class="shrink-0 sm:hidden" />
              <Headphones :size="18" class="shrink-0 hidden sm:block" />
              <span>{{ $t('common.roles.operator') }}</span>
            </button>

            <!-- Dark Mode Toggle -->
            <div class="h-px bg-white/10 my-0.5 sm:my-1"></div>
            <button 
              @click="toggleDarkMode"
              class="mobile-sidebar-link mobile-sidebar-submenu-link w-full"
            >
              <Moon v-if="!isDarkMode" :size="16" class="shrink-0 sm:hidden" />
              <Moon v-if="!isDarkMode" :size="18" class="shrink-0 hidden sm:block" />
              <Sun v-if="isDarkMode" :size="16" class="shrink-0 sm:hidden" />
              <Sun v-if="isDarkMode" :size="18" class="shrink-0 hidden sm:block" />
              <span>{{ isDarkMode ? $t('common.actions.lightMode') : $t('common.actions.darkMode') }}</span>
            </button>

            <!-- Logout -->
            <div class="h-px bg-white/10 my-0.5 sm:my-1"></div>
            <button 
              @click="handleLogout"
              class="mobile-sidebar-link mobile-sidebar-submenu-link w-full"
            >
              <LogOut :size="16" class="shrink-0 sm:hidden" />
              <LogOut :size="18" class="shrink-0 hidden sm:block" />
              <span>{{ $t('common.actions.logout') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>

  <!-- Search Modal -->
  <FloatingSearchModal 
    :show="showSearchModal" 
    @close="showSearchModal = false"
    @search="handleSearchQuery"
  />
</template>

<script setup>
import { ref, computed } from 'vue'
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
  LogOut,
  X,
  ChevronDown
} from 'lucide-vue-next'
import FloatingSearchModal from '@/components/shared/FloatingSearchModal.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['close'])

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
  emit('close')
  router.push('/tasks')
}

const handleLogout = () => {
  showUserMenu.value = false
  emit('close')
  // TODO: Implement logout functionality
}

const toggleDarkMode = () => {
  toggleTheme()
}

const handleSearch = () => {
  showSearchModal.value = true
}

const handleSearchQuery = (query) => {
  // Global search is not implemented yet
  // TODO: Implement global search functionality
}

const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
@reference "tailwindcss";

.mobile-sidebar-link {
  @apply flex items-center gap-2.5 sm:gap-3 px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-white/90 hover:text-white hover:bg-white/10 rounded-md transition-colors;
}

.mobile-sidebar-submenu-link {
  @apply text-xs sm:text-sm py-1.5 sm:py-2;
}

.mobile-sidebar-link-active {
  @apply text-white bg-white/20;
}

.user-avatar-mobile {
  width: 1.5rem;
  height: 1.5rem;
  min-width: 1.5rem;
  min-height: 1.5rem;
  font-size: 0.625rem;
  line-height: 1;
}

@media (min-width: 640px) {
  .user-avatar-mobile {
    width: 1.75rem;
    height: 1.75rem;
    min-width: 1.75rem;
    min-height: 1.75rem;
    font-size: 0.75rem;
  }
}

.safe-area-top {
  padding-top: env(safe-area-inset-top);
}

.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

/* Transition animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>

