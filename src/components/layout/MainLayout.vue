<template>
  <div class="h-screen flex bg-muted">
    <!-- Left Icon Sidebar (Desktop Only) -->
    <IconSidebar />

    <!-- Mobile Sidebar Drawer -->
    <MobileSidebar :is-open="isMobileSidebarOpen" @close="isMobileSidebarOpen = false" />

    <!-- Main Content Area -->
    <div
      class="flex-1 flex flex-col min-w-0 overflow-hidden main-content-area"
      :class="{ 'sidebar-expanded': layoutStore.sidebarExpanded }"
    >
      <!-- Mobile Header (Mobile Only) -->
      <header class="mobile-header md:hidden h-16 border-b flex items-center px-4 shrink-0 z-50">
        <Transition name="fade-button">
          <button
            v-if="!isMobileSidebarOpen"
            @click="isMobileSidebarOpen = true"
            class="w-11 h-11 flex items-center justify-center text-muted-foreground hover:text-brand-red hover:bg-red-50 rounded-lg transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2"
            aria-label="Open navigation menu"
            :aria-expanded="false"
          >
            <Menu :size="20" />
          </button>
        </Transition>
      </header>

      <!-- Header column shrinks from full width to list width (right edge moves left) when cards view is selected -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div
          class="tasks-header-row flex min-w-0 overflow-hidden"
          :class="layoutStore.hideHeaderForTaskDetail ? 'flex-1 flex-row' : 'shrink-0 flex-row'"
        >
          <aside
            class="tasks-header-aside hidden md:flex shrink-0 overflow-hidden flex-col bg-background border-border transition-[width] duration-300 ease-out"
            :class="layoutStore.hideHeaderForTaskDetail ? 'tasks-header-aside--narrow' : 'tasks-header-aside--full'"
          >
            <div class="tasks-header-inner w-full min-w-0 h-full flex flex-col shrink-0 border-r border-border">
              <AppHeader v-if="route.name !== 'customer-view'" class="shrink-0 border-b border-border" />
              <div class="flex-1 min-h-0 overflow-hidden">
              <div id="tasks-list-teleport" class="h-full w-full min-h-0" />
            </div>
            </div>
          </aside>
          <div
            class="flex-1 flex flex-col min-h-0 min-w-0 relative tasks-detail-column"
            :class="layoutStore.hideHeaderForTaskDetail ? 'border-l border-border' : 'tasks-detail-column--inactive'"
          >
            <div
              class="min-h-0 overflow-hidden hidden md:block"
              :class="layoutStore.hideHeaderForTaskDetail ? 'flex-1 flex flex-col' : 'tasks-detail-teleport-inactive'"
            >
              <div id="tasks-detail-teleport" class="h-full w-full min-h-0 flex flex-col" />
            </div>
          </div>
        </div>
        <!-- Always in DOM so Tasks.vue never unmounts when toggling card view (avoids recursive updates loop) -->
        <main
          class="flex-1 flex flex-col overflow-hidden min-h-0"
          :class="layoutStore.hideHeaderForTaskDetail ? 'main-when-narrow' : ''"
        >
          <div class="main-router-outlet flex-1 flex flex-col min-h-0 overflow-hidden">
            <router-view />
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import { useRoute } from 'vue-router'
import { Menu } from 'lucide-vue-next'
import { useLayoutStore } from '@/stores/layout'
import AppHeader from './AppHeader.vue'
import IconSidebar from './IconSidebar.vue'
import MobileSidebar from './MobileSidebar.vue'

const route = useRoute()
const isMobileSidebarOpen = ref(false)
const layoutStore = useLayoutStore()
const headerActionsRef = ref(null)
provide('headerActionsRef', headerActionsRef)
</script>

<style scoped>
.fade-button-enter-active,
.fade-button-leave-active {
  transition: opacity 0.2s ease;
}

.fade-button-enter-from,
.fade-button-leave-to {
  opacity: 0;
}

/* Header column: full width by default; shrinks to 20rem (right edge moves left) when cards view selected */
@media (min-width: 768px) {
  .tasks-header-aside--full {
    width: 100%;
  }

  .tasks-header-aside--narrow {
    width: 20rem;
  }
}

/* When not in card view, detail column takes no space */
.tasks-detail-column--inactive {
  width: 0;
  min-width: 0;
  overflow: hidden;
}

/* When card view: hide main but keep in DOM so router-view (Tasks.vue) stays mounted and doesn't trigger onBeforeUnmount loop */
.main-when-narrow {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}

/* When not in card-view layout, teleport target stays in DOM but takes no space (avoids Vue patch error) */
.tasks-detail-teleport-inactive {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  pointer-events: none;
}
</style>
