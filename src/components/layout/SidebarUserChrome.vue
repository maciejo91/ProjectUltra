<template>
  <div class="w-full py-2">
    <div class="relative" v-click-outside="() => (showUserMenu = false)">
      <button
        type="button"
        @click.stop="toggleUserMenu"
        class="relative flex h-10 w-full items-center gap-2 rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent focus-visible:ring-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-0"
        :aria-label="t('common.layout.userMenu')"
      >
        <div
          class="user-avatar-logo rounded-full flex items-center justify-center font-medium shrink-0 bg-orange-50 text-orange-600"
        >
          {{ userInitials }}
        </div>
        <span class="truncate text-sm group-data-[collapsible=icon]:hidden">
          {{ userStore.currentUser?.name }}
        </span>
      </button>

      <transition name="dropdown">
        <div
          v-if="showUserMenu"
          class="sidebar-user-dropdown absolute left-full ml-2 bottom-0 mb-0 w-56 border border-border rounded-md shadow-mk-dashboard-card overflow-hidden z-100"
          @click.stop
        >
          <div class="p-3 border-b border-border sidebar-user-dropdown-header">
            <div class="text-sm font-semibold text-foreground">{{ userStore.currentUser.name }}</div>
            <div class="text-sm text-muted-foreground">{{ userStore.currentUser.email }}</div>
          </div>
          <div class="p-2">
            <button
              type="button"
              @click="switchRole('manager')"
              class="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-red-50 hover:text-brand-red rounded-lg transition-colors flex items-center gap-2"
              :class="{ 'bg-red-50 text-brand-red': userStore.currentUser.role === 'manager' }"
            >
              <Shield :size="16" /> {{ $t('common.actions.switchRole') }} {{ $t('common.roles.manager') }}
            </button>
            <button
              type="button"
              @click="switchRole('salesman')"
              class="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg transition-colors flex items-center gap-2"
              :class="{ 'bg-red-50 text-brand-red': userStore.currentUser.role === 'salesman' }"
            >
              <User :size="16" /> {{ $t('common.actions.switchRole') }} {{ $t('common.roles.salesman') }}
            </button>
            <button
              type="button"
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
              type="button"
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
              type="button"
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

  <FloatingSearchModal
    :show="showSearchModal"
    @close="handleCloseSearchModal"
    @search="handleSearch"
  />
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Shield, User, Headphones, Moon, Sun, LogOut, ChevronDown } from 'lucide-vue-next'
import { useLayoutStore } from '@/stores/layout'
import { useUserStore } from '@/stores/user'
import { useSettingsStore } from '@/stores/settings'
import { useTheme } from '@/composables/useTheme'
import FloatingSearchModal from '@/components/shared/FloatingSearchModal.vue'

const router = useRouter()
const { locale, t } = useI18n()
const layoutStore = useLayoutStore()
const userStore = useUserStore()
const settingsStore = useSettingsStore()
const { isDark, toggleTheme } = useTheme()

const navigationVisibility = computed(() => settingsStore.getSetting('navigationVisibility') || {})

const showUserMenu = ref(false)
const showLanguageSubmenu = ref(false)
const showSearchModal = ref(false)

watch(
  () => layoutStore.searchModalOpen,
  (open) => {
    showSearchModal.value = open
  }
)

watch(showUserMenu, (open) => {
  if (!open) showLanguageSubmenu.value = false
})

function handleCloseSearchModal() {
  showSearchModal.value = false
  layoutStore.setSearchModalOpen(false)
}

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

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' }
]

function changeLanguage(langCode) {
  locale.value = langCode
  localStorage.setItem('app-locale', langCode)
  showLanguageSubmenu.value = false
  showUserMenu.value = false
}

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
}

function switchRole(role) {
  userStore.switchRole(role)
  showUserMenu.value = false
  router.push('/home')
}

function handleLogout() {
  showUserMenu.value = false
}

function toggleDarkMode() {
  toggleTheme()
}

function handleSearch() {
  handleCloseSearchModal()
}
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.sidebar-user-dropdown {
  isolation: isolate;
  background-color: var(--background, var(--base-background));
}

.sidebar-user-dropdown-header {
  background-color: var(--muted, var(--base-muted));
}

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
