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
              <button
                ref="languageRowRef"
                type="button"
                class="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-foreground outline-none ring-sidebar-ring hover:bg-muted focus-visible:ring-2"
                :class="{ 'bg-muted': languageFlyoutOpen }"
                :aria-expanded="languageFlyoutOpen"
                @click.stop="toggleLanguageFlyout"
              >
                <Languages class="size-4 shrink-0" />
                <span class="min-w-0 flex-1 truncate">{{ currentLanguageLabel }}</span>
                <component :is="languageChevronIcon" class="size-4 shrink-0 text-muted-foreground" />
              </button>
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

      <Teleport to="body">
        <transition name="dropdown">
          <div
            v-if="showUserMenu && languageFlyoutOpen && navigationVisibility.language !== false"
            ref="languageFlyoutRef"
            class="fixed w-44 overflow-y-auto overflow-x-hidden rounded-lg border border-border bg-background p-1 shadow-mk-dashboard-card"
            :style="languageFlyoutStyle"
            @click.stop
          >
            <button
              v-for="lang in languages"
              :key="lang.code"
              type="button"
              class="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-foreground hover:bg-muted"
              @click="changeLanguage(lang.code)"
            >
              <span class="flex size-4 shrink-0 items-center justify-center" aria-hidden="true">
                <span
                  v-if="currentLocale === lang.code"
                  class="size-1.5 rounded-full bg-foreground"
                />
              </span>
              <span>{{ lang.name }}</span>
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
import { UserRound, Languages, ChevronRight, ChevronLeft, ChevronDown, LogOut } from 'lucide-vue-next'
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

const showUserMenu = ref(false)
const languageFlyoutOpen = ref(false)
const showSearchModal = ref(false)
const triggerWrapRef = ref(null)
const popoverPanelRef = ref(null)
const languageRowRef = ref(null)
const languageFlyoutRef = ref(null)
const popoverStyle = ref({})
const languageFlyoutStyle = ref({})
const languageSubPlacement = ref('left')

const languageChevronIcon = computed(() => {
  if (languageSubPlacement.value === 'right') return ChevronLeft
  if (languageSubPlacement.value === 'below' || languageSubPlacement.value === 'above') return ChevronDown
  return ChevronRight
})

let docClickBound = false

const LANGUAGE_PANEL_WIDTH = 176
const GAP = 8
const VIEWPORT_MARGIN = 8

const languages = [
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
  { code: 'nl', name: 'Nederlands' }
]

function estimateLanguagePanelHeight() {
  const row = 40
  const pad = 8
  return languages.length * row + pad
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function updateLanguageFlyoutPosition() {
  const anchor = languageRowRef.value
  if (!anchor) return

  const r = anchor.getBoundingClientRect()
  const w = LANGUAGE_PANEL_WIDTH
  const estH = estimateLanguagePanelHeight()
  const vw = window.innerWidth
  const vh = window.innerHeight

  const spaceLeft = r.left - VIEWPORT_MARGIN
  const spaceRight = vw - r.right - VIEWPORT_MARGIN
  const spaceBelow = vh - r.bottom - VIEWPORT_MARGIN
  const spaceAbove = r.top - VIEWPORT_MARGIN

  let left
  let top
  let maxH

  const fitsLeft = spaceLeft >= w + GAP
  const fitsRight = spaceRight >= w + GAP

  if (fitsLeft && (!fitsRight || spaceLeft >= spaceRight)) {
    languageSubPlacement.value = 'left'
    left = r.left - w - GAP
    top = clamp(r.top, VIEWPORT_MARGIN, vh - VIEWPORT_MARGIN - Math.min(estH, vh - VIEWPORT_MARGIN * 2))
    maxH = vh - top - VIEWPORT_MARGIN
  } else if (fitsRight) {
    languageSubPlacement.value = 'right'
    left = r.right + GAP
    top = clamp(r.top, VIEWPORT_MARGIN, vh - VIEWPORT_MARGIN - Math.min(estH, vh - VIEWPORT_MARGIN * 2))
    maxH = vh - top - VIEWPORT_MARGIN
  } else if (spaceBelow >= Math.min(estH, 160) || spaceBelow >= spaceAbove) {
    languageSubPlacement.value = 'below'
    left = clamp(r.left + r.width / 2 - w / 2, VIEWPORT_MARGIN, vw - w - VIEWPORT_MARGIN)
    top = r.bottom + GAP
    maxH = vh - top - VIEWPORT_MARGIN
  } else if (spaceAbove >= Math.min(estH, 120)) {
    languageSubPlacement.value = 'above'
    left = clamp(r.left + r.width / 2 - w / 2, VIEWPORT_MARGIN, vw - w - VIEWPORT_MARGIN)
    const desiredTop = r.top - estH - GAP
    top = clamp(desiredTop, VIEWPORT_MARGIN, vh - VIEWPORT_MARGIN - 80)
    maxH = r.top - GAP - top
  } else {
    languageSubPlacement.value = 'fallback'
    if (spaceLeft >= spaceRight) {
      left = VIEWPORT_MARGIN
    } else {
      left = vw - w - VIEWPORT_MARGIN
    }
    top = clamp(r.top, VIEWPORT_MARGIN, vh - VIEWPORT_MARGIN - 120)
    maxH = vh - top - VIEWPORT_MARGIN
  }

  left = clamp(left, VIEWPORT_MARGIN, vw - w - VIEWPORT_MARGIN)

  languageFlyoutStyle.value = {
    position: 'fixed',
    left: `${left}px`,
    top: `${top}px`,
    width: `${w}px`,
    maxHeight: `${Math.max(80, Math.min(estH, maxH))}px`,
    zIndex: 110
  }

  nextTick(() => {
    const el = languageFlyoutRef.value
    if (!el) return
    const measured = el.getBoundingClientRect()
    if (measured.bottom > vh - VIEWPORT_MARGIN) {
      const shift = measured.bottom - (vh - VIEWPORT_MARGIN)
      const newTop = Math.max(VIEWPORT_MARGIN, measured.top - shift)
      languageFlyoutStyle.value = {
        ...languageFlyoutStyle.value,
        top: `${newTop}px`,
        maxHeight: `${vh - newTop - VIEWPORT_MARGIN}px`
      }
    }
    if (measured.right > vw - VIEWPORT_MARGIN) {
      languageFlyoutStyle.value = {
        ...languageFlyoutStyle.value,
        left: `${vw - measured.width - VIEWPORT_MARGIN}px`
      }
    }
    if (measured.left < VIEWPORT_MARGIN) {
      languageFlyoutStyle.value = {
        ...languageFlyoutStyle.value,
        left: `${VIEWPORT_MARGIN}px`
      }
    }
  })
}

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
  const langPanel = languageFlyoutRef.value
  if (
    wrap?.contains(e.target) ||
    panel?.contains(e.target) ||
    langPanel?.contains(e.target)
  ) {
    return
  }
  showUserMenu.value = false
}

function onScrollOrResize() {
  if (showUserMenu.value) {
    updatePopoverPosition()
    if (languageFlyoutOpen.value) updateLanguageFlyoutPosition()
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
    languageFlyoutOpen.value = false
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

watch(languageFlyoutOpen, (open) => {
  if (!open) return
  nextTick(() => updateLanguageFlyoutPosition())
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
  languageFlyoutOpen.value = false
  showUserMenu.value = false
}

function toggleLanguageFlyout() {
  languageFlyoutOpen.value = !languageFlyoutOpen.value
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
