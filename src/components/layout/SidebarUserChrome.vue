<template>
  <div>
    <div ref="triggerWrapRef" class="relative w-full">
      <SidebarMenuButton
        :tooltip="userStore.currentUser?.name ?? t('common.layout.userMenu')"
        :aria-label="t('common.layout.userMenu')"
        @click.stop="toggleUserMenu"
      >
        <div
          class="rounded-full flex size-4 shrink-0 items-center justify-center text-xs font-medium leading-none bg-orange-50 text-orange-600"
        >
          {{ userInitials }}
        </div>
        <span class="truncate text-sm group-data-[collapsible=icon]:hidden">
          {{ userStore.currentUser?.name }}
        </span>
      </SidebarMenuButton>

      <Teleport to="body">
        <transition name="dropdown">
          <div
            v-if="showUserMenu"
            ref="popoverPanelRef"
            class="sidebar-user-dropdown fixed w-56 overflow-visible rounded-lg border border-border bg-background p-1 shadow-mk-dashboard-card"
            :style="popoverStyle"
            @click.stop
          >
            <div class="px-2 py-2">
              <div class="w-full">
                <button
                  type="button"
                  class="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-foreground outline-none ring-sidebar-ring hover:bg-muted focus-visible:ring-2"
                  :class="{ 'bg-muted': profileExpanded }"
                  :aria-expanded="profileExpanded"
                  @click.stop="toggleProfileExpanded"
                >
                  <span class="min-w-0 flex-1 truncate">{{ currentProfileLabel }}</span>
                  <ChevronDown
                    v-if="!profileExpanded"
                    class="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <ChevronUp
                    v-else
                    class="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                </button>

                <transition name="dropdown">
                  <div v-if="profileExpanded" class="mt-1 grid grid-cols-1 gap-1">
                    <button
                      v-for="profile in otherProfiles"
                      :key="profile.id"
                      type="button"
                      class="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-foreground outline-none ring-sidebar-ring hover:bg-muted focus-visible:ring-2"
                      @click="setSidebarProfile(profile.id)"
                    >
                      <span class="truncate">{{ profile.label }}</span>
                    </button>
                  </div>
                </transition>
              </div>
            </div>

            <div class="h-px bg-border my-1" role="presentation" />

            <button
              type="button"
              class="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-foreground outline-none ring-sidebar-ring hover:bg-muted focus-visible:ring-2"
              @click="goToMyProfile"
            >
              <UserRound class="size-4 shrink-0" />
              <span class="truncate">{{ t('common.layout.goToMyProfile') }}</span>
            </button>

            <template v-if="navigationVisibility.language !== false">
              <div class="h-px bg-border my-1" role="presentation" />
              <div class="w-full">
                <button
                  type="button"
                  class="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-foreground outline-none ring-sidebar-ring hover:bg-muted focus-visible:ring-2"
                  :class="{ 'bg-muted': languageExpanded }"
                  :aria-expanded="languageExpanded"
                  @click.stop="toggleLanguageExpanded"
                >
                  <Languages class="size-4 shrink-0" />
                  <span class="min-w-0 flex-1 truncate">{{ currentLanguageLabel }}</span>
                  <ChevronDown
                    v-if="!languageExpanded"
                    class="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <ChevronUp
                    v-else
                    class="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                </button>

                <transition name="dropdown">
                  <div v-if="languageExpanded" class="mt-1 grid grid-cols-1 gap-1 pl-6">
                    <button
                      v-for="lang in otherLanguages"
                      :key="lang.code"
                      type="button"
                      class="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-foreground outline-none ring-sidebar-ring hover:bg-muted focus-visible:ring-2"
                      @click="changeLanguage(lang.code)"
                    >
                      <span class="truncate">{{ lang.name }}</span>
                    </button>
                  </div>
                </transition>
              </div>
            </template>

            <div class="h-px bg-border my-1" role="presentation" />

            <button
              type="button"
              class="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-brand-red outline-none ring-sidebar-ring hover:bg-red-50 focus-visible:ring-2"
              @click="handleLogout"
            >
              <LogOut class="size-4 shrink-0" />
              <span>{{ t('common.actions.signOut') }}</span>
            </button>
          </div>
        </transition>
      </Teleport>
    </div>

    <FloatingSearchModal
      :show="showSearchModal"
      @close="handleCloseSearchModal"
      @search="handleSearch"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { UserRound, Languages, ChevronDown, ChevronUp, LogOut } from 'lucide-vue-next'
import { useLayoutStore } from '@/stores/layout'
import { useUserStore } from '@/stores/user'
import { useSettingsStore } from '@/stores/settings'
import FloatingSearchModal from '@/components/shared/FloatingSearchModal.vue'
import { SidebarMenuButton } from '@motork/component-library/future/primitives'

const router = useRouter()
const { locale, t } = useI18n()
const layoutStore = useLayoutStore()
const userStore = useUserStore()
const settingsStore = useSettingsStore()

const navigationVisibility = computed(() => settingsStore.getSetting('navigationVisibility') || {})
const sidebarProfile = computed(() => settingsStore.getSetting('sidebarProfile') || 'admin')

const sidebarProfiles = computed(() => [
  { id: 'salesRep', label: t('common.layout.profiles.salesRep') },
  { id: 'bdc', label: t('common.layout.profiles.bdcOperator') },
  { id: 'admin', label: t('common.layout.profiles.admin') },
  { id: 'externalBdc', label: t('common.layout.profiles.externalBdc') }
])

const showUserMenu = ref(false)
const profileExpanded = ref(false)
const languageExpanded = ref(false)
const showSearchModal = ref(false)
const triggerWrapRef = ref(null)
const popoverPanelRef = ref(null)
const popoverStyle = ref({})

let docClickBound = false

const languages = [
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
  { code: 'nl', name: 'Nederlands' }
]

function updatePopoverPosition() {
  const wrap = triggerWrapRef.value
  if (!wrap) return
  const rect = wrap.getBoundingClientRect()
  const gap = 8
  popoverStyle.value = {
    left: `${rect.right + gap}px`,
    bottom: `${window.innerHeight - rect.bottom}px`,
    width: '14rem',
    zIndex: 100
  }
}

function onDocClickCapture(e) {
  const wrap = triggerWrapRef.value
  const panel = popoverPanelRef.value
  if (wrap?.contains(e.target) || panel?.contains(e.target)) {
    return
  }
  showUserMenu.value = false
}

function onScrollOrResize() {
  if (showUserMenu.value) {
    updatePopoverPosition()
  }
}

function bindOutsideClose() {
  if (docClickBound) return
  docClickBound = true
  setTimeout(() => {
    document.addEventListener('click', onDocClickCapture, true)
  }, 0)
}

function unbindOutsideClose() {
  if (!docClickBound) return
  docClickBound = false
  document.removeEventListener('click', onDocClickCapture, true)
}

watch(showUserMenu, (open) => {
  if (!open) {
    profileExpanded.value = false
    languageExpanded.value = false
    unbindOutsideClose()
    window.removeEventListener('scroll', onScrollOrResize, true)
    window.removeEventListener('resize', onScrollOrResize)
    return
  }
  nextTick(() => {
    updatePopoverPosition()
    window.addEventListener('scroll', onScrollOrResize, true)
    window.addEventListener('resize', onScrollOrResize)
    bindOutsideClose()
  })
})

onUnmounted(() => {
  unbindOutsideClose()
  window.removeEventListener('scroll', onScrollOrResize, true)
  window.removeEventListener('resize', onScrollOrResize)
})

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

const currentLocale = computed(() => locale.value)

const currentLanguageLabel = computed(() => {
  const found = languages.find((l) => l.code === currentLocale.value)
  return found?.name ?? 'English'
})

const currentProfileLabel = computed(() => {
  const found = sidebarProfiles.value.find((p) => p.id === sidebarProfile.value)
  return found?.label ?? t('common.layout.switchProfile')
})

const otherProfiles = computed(() =>
  sidebarProfiles.value.filter((p) => p.id !== sidebarProfile.value)
)

const otherLanguages = computed(() =>
  languages.filter((l) => l.code !== currentLocale.value)
)

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

function changeLanguage(langCode) {
  locale.value = langCode
  localStorage.setItem('app-locale', langCode)
  languageExpanded.value = false
  showUserMenu.value = false
}

function toggleLanguageExpanded() {
  languageExpanded.value = !languageExpanded.value
}

function toggleProfileExpanded() {
  profileExpanded.value = !profileExpanded.value
}

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
}

function goToMyProfile() {
  showUserMenu.value = false
  router.push('/settings/prototype')
}

function handleLogout() {
  showUserMenu.value = false
}

function setSidebarProfile(profileId) {
  settingsStore.setSetting('sidebarProfile', profileId)
  profileExpanded.value = false
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
}
</style>
