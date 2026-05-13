<template>
  <div>
    <div ref="triggerWrapRef" class="relative w-full">
      <SidebarMenuButton
        :tooltip="userStore.currentUser?.name ?? t('common.layout.userMenu')"
        :aria-label="t('common.layout.userMenu')"
        @click.stop="toggleUserMenu"
      >
        <span class="flex min-w-0 w-full items-center gap-2">
          <div
            class="rounded-full flex size-4 shrink-0 items-center justify-center text-xs font-medium leading-none bg-orange-50 text-orange-600"
          >
            {{ userInitials }}
          </div>
          <span class="min-w-0 truncate text-sm group-data-[collapsible=icon]:hidden">
            {{ userStore.currentUser?.name }}
          </span>
          <ChevronRight
            class="ml-auto size-4 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden"
            aria-hidden="true"
          />
        </span>
      </SidebarMenuButton>

      <Teleport to="body">
        <transition :name="userMenuTransitionName">
          <div
            v-if="showUserMenu"
            ref="popoverPanelRef"
            class="sidebar-user-dropdown fixed overflow-visible rounded-lg border border-border bg-background p-1 shadow-mk-dashboard-card"
            :class="popoverWidthClass"
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

                <transition name="dropdown-nested">
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

                <transition name="dropdown-nested">
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

    <Dialog :open="showSuperAdminDialog" @update:open="handleSuperAdminDialogOpenChange">
      <DialogPortal>
        <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
        <DialogContent
          class="w-full sm:max-w-md max-h-[calc(100vh-4rem)] flex flex-col"
          :show-close-button="true"
        >
          <DialogHeader class="shrink-0">
            <DialogTitle>{{ t('common.layout.demoAccess.passwordTitle') }}</DialogTitle>
            <DialogDescription>
              {{ t('common.layout.demoAccess.passwordDescription') }}
            </DialogDescription>
          </DialogHeader>
          <form class="flex-1 py-4 w-full space-y-4" @submit.prevent="unlockSuperAdmin">
            <div class="space-y-2">
              <Label for="super-admin-password" class="text-foreground">
                {{ t('common.layout.demoAccess.passwordLabel') }}
              </Label>
              <Input
                id="super-admin-password"
                v-model="superAdminPassword"
                type="password"
                autocomplete="off"
                :placeholder="t('common.layout.demoAccess.passwordPlaceholder')"
              />
              <p v-if="superAdminPasswordError" class="text-sm text-destructive">
                {{ t('common.layout.demoAccess.passwordError') }}
              </p>
            </div>
            <DialogFooter class="shrink-0 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3">
              <Button
                type="button"
                variant="outline"
                class="rounded-sm w-full sm:w-auto"
                @click="handleSuperAdminDialogOpenChange(false)"
              >
                {{ t('common.buttons.cancel') }}
              </Button>
              <Button type="submit" variant="default" class="rounded-sm w-full sm:w-auto">
                {{ t('common.layout.demoAccess.unlock') }}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  UserRound,
  Languages,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  LogOut
} from 'lucide-vue-next'
import { useLayoutStore } from '@/stores/layout'
import { useUserStore } from '@/stores/user'
import { useSettingsStore } from '@/stores/settings'
import FloatingSearchModal from '@/components/shared/FloatingSearchModal.vue'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  Input,
  Label,
  SidebarMenuButton,
  useSidebar
} from '@motork/component-library/future/primitives'
import {
  SUPER_ADMIN_PROFILE,
  isDemoAccessPasswordValid,
  isRouteAvailableForDemo
} from '@/utils/demoAccess'

const router = useRouter()
const route = useRoute()
const { locale, t } = useI18n()
const layoutStore = useLayoutStore()
const userStore = useUserStore()
const settingsStore = useSettingsStore()
const { state: sidebarState } = useSidebar()

const isSidebarIconMode = computed(() => sidebarState.value !== 'expanded')

const popoverWidthClass = computed(() =>
  isSidebarIconMode.value ? 'w-56' : 'min-w-56 max-w-none'
)

const userMenuTransitionName = computed(() =>
  isSidebarIconMode.value ? 'dropdown-side' : 'dropdown-above'
)

const navigationVisibility = computed(() => settingsStore.getSetting('navigationVisibility') || {})
const sidebarProfile = computed(() => settingsStore.getSetting('sidebarProfile') || 'admin')

const sidebarProfiles = computed(() => [
  { id: 'salesRep', label: t('common.layout.profiles.salesRep') },
  { id: 'bdc', label: t('common.layout.profiles.bdcOperator') },
  { id: 'admin', label: t('common.layout.profiles.admin') },
  { id: 'externalBdc', label: t('common.layout.profiles.externalBdc') },
  { id: SUPER_ADMIN_PROFILE, label: t('common.layout.profiles.superAdmin') }
])

const showUserMenu = ref(false)
const profileExpanded = ref(false)
const languageExpanded = ref(false)
const showSearchModal = ref(false)
const showSuperAdminDialog = ref(false)
const superAdminPassword = ref('')
const superAdminPasswordError = ref(false)
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
  const zIndex = 100

  if (isSidebarIconMode.value) {
    popoverStyle.value = {
      left: `${rect.right + gap}px`,
      bottom: `${window.innerHeight - rect.bottom}px`,
      width: '14rem',
      top: 'auto',
      zIndex
    }
    return
  }

  popoverStyle.value = {
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    bottom: `${window.innerHeight - rect.top + gap}px`,
    top: 'auto',
    zIndex
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

watch(isSidebarIconMode, () => {
  if (showUserMenu.value) {
    nextTick(() => updatePopoverPosition())
  }
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
  if (profileId === SUPER_ADMIN_PROFILE) {
    superAdminPassword.value = ''
    superAdminPasswordError.value = false
    profileExpanded.value = false
    showUserMenu.value = false
    showSuperAdminDialog.value = true
    return
  }

  settingsStore.setSetting('sidebarProfile', profileId)
  profileExpanded.value = false
  showUserMenu.value = false

  if (!isRouteAvailableForDemo(route, profileId)) {
    router.push('/home')
  }
}

function handleSearch() {
  handleCloseSearchModal()
}

function handleSuperAdminDialogOpenChange(open) {
  showSuperAdminDialog.value = open
  if (!open) {
    superAdminPassword.value = ''
    superAdminPasswordError.value = false
  }
}

function unlockSuperAdmin() {
  if (!isDemoAccessPasswordValid(superAdminPassword.value)) {
    superAdminPasswordError.value = true
    return
  }

  settingsStore.setSetting('sidebarProfile', SUPER_ADMIN_PROFILE)
  handleSuperAdminDialogOpenChange(false)
}
</script>

<style scoped>
.dropdown-side-enter-active,
.dropdown-side-leave-active,
.dropdown-above-enter-active,
.dropdown-above-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-side-enter-from,
.dropdown-side-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.dropdown-above-enter-from,
.dropdown-above-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.dropdown-nested-enter-active,
.dropdown-nested-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-nested-enter-from,
.dropdown-nested-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.sidebar-user-dropdown {
  isolation: isolate;
}
</style>
