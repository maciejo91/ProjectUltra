<template>
  <div class="h-full flex flex-col lg:flex-row overflow-hidden bg-surface">
    <!-- Card View: when header-over-list layout (desktop), teleport list and right panel to layout slots.
         Only mount Teleports after targets exist (avoids "Failed to locate Teleport target" on Tasks mount).
         Use disabled when route changes so content renders in place before unmount (avoids insertBefore null). -->
    <div v-if="useTeleport && teleportTargetsReady" class="shrink-0 size-0 overflow-hidden">
      <Teleport to="#tasks-list-teleport" :disabled="!useTeleport">
        <div class="h-full flex flex-col overflow-hidden bg-surface">
          <EntityListSidebar
            title="Tasks"
            :items="filteredTasks"
            :selected-id="currentTask ? String(currentTask.compositeId) : null"
            :view-mode="viewMode"
            :initial-search-query="cardSearchQuery"
            @view-change="handleViewChange"
            :selected-class="(task) => task.type === 'lead' ? 'bg-muted border-2 border-emerald-700' : 'bg-muted border-2 border-purple-500'"
            :unselected-class="getUnselectedClass"
            :getName="(task) => {
              const customer = task.customer
              if (customer && customer.name) return customer.name
              if (customer && !customer.name && customer.email) return customer.email.split('@')[0] || 'Unknown'
              return 'Unknown'
            }"
            :getInitials="(task) => {
              const customer = task.customer
              if (customer && customer.initials) return customer.initials
              if (customer && customer.name) {
                const initials = customer.name.split(' ').map(n => n[0]).filter(Boolean).join('').toUpperCase().slice(0, 2)
                return initials || '?'
              }
              return '?'
            }"
            :getVehicleInfo="(task) => {
              if (task.type === 'lead') {
                if (!task.requestedCar) return 'No vehicle specified'
                const car = task.requestedCar
                const parts = [`${car.brand} ${car.model}`]
                if (car.vin) parts.push(car.vin)
                if (car.kilometers !== undefined && car.kilometers !== null) parts.push(`${car.kilometers} km`)
                if (car.status) parts.push(car.status)
                return parts.join(' • ')
              }
              const vehicle = task.vehicle || task.requestedCar
              if (!vehicle) return 'No vehicle specified'
              const parts = [`${vehicle.brand} ${vehicle.model}`]
              if (vehicle.vin) parts.push(vehicle.vin)
              if (vehicle.kilometers !== undefined && vehicle.kilometers !== null) parts.push(`${vehicle.kilometers} km`)
              if (vehicle.status) parts.push(vehicle.status)
              return parts.join(' • ')
            }"
            :avatarClass="(task) => task.type === 'lead' ? 'bg-badge-green text-emerald-800' : 'bg-purple-100 text-purple-600'"
            :show-mobile-close="false"
            @select="selectTask"
            @close="handleBackToTaskList"
            :active-filters="activeFilters"
            :show-closed="showClosed"
            @filter-change="activeFilters = $event"
            @sort-change="handleSortChange"
            @toggle-closed="toggleShowClosed"
          >
            <template #badges="{ item: task }">
              <Badge v-if="task && task.type" :text="task.type === 'lead' ? 'Lead' : 'Opportunity'" size="small" :theme="task.type === 'lead' ? 'green' : 'gray'" />
            </template>
            <template #location="{ item: task }">{{ getCustomerCity(task) || 'Unknown' }}</template>
            <template #source="{ item: task }">{{ task.source || task.customer?.source || 'Unknown' }}</template>
            <template #owner="{ item: task }">
              <template v-if="task.assignee">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-black text-white font-medium flex items-center justify-center text-xs shrink-0" style="font-size: 0.5rem;">{{ getAssigneeInitials(task.assignee) }}</div>
                  <span class="text-gray-600 font-medium">{{ task.assignee }}</span>
                </div>
              </template>
              <span v-else>Unassigned</span>
            </template>
            <template #dates="{ item: task }">
              <template v-if="task.type === 'lead' && task.nextActionDue"><span>Due: {{ getDateDisplay(task.nextActionDue) }}</span></template>
              <template v-else-if="task.type === 'opportunity' && task.nextActionDue"><span>Due: {{ getDateDisplay(task.nextActionDue) }}</span></template>
              <template v-else><span>Due: No deadline</span></template>
            </template>
          </EntityListSidebar>
        </div>
      </Teleport>
      <Teleport to="#tasks-detail-teleport" :disabled="!useTeleport">
        <TaskDetailView
          v-if="currentTask && managementWidget && storeAdapter && addNewConfig"
          :key="currentTask?.compositeId || 'card-empty'"
          :task="currentTask"
          :management-widget="managementWidget"
          :store-adapter="storeAdapter"
          :add-new-config="addNewConfig"
          :filtered-tasks="filteredTasks"
          @task-navigate="handleTaskNavigate"
          @close="handleBackToTaskList"
        />
        <div v-else class="flex-1 flex flex-col w-full min-h-0 overflow-hidden bg-surface">
          <div class="flex-1 flex items-center justify-center w-full p-8">
            <div class="text-center max-w-sm">
              <div class="w-16 h-16 mx-auto mb-4 rounded-lg bg-muted flex items-center justify-center">
                <ListTodo class="w-8 h-8 shrink-0 text-muted-foreground" />
              </div>
              <h3 class="text-content-bold mb-2">No task selected</h3>
              <p class="text-meta">Select a task from the list to view its details and manage activities</p>
            </div>
          </div>
        </div>
      </Teleport>
    </div>

    <!-- Card View - Normal layout (no task selected, or mobile) -->
    <div
      v-if="viewMode === 'card' && (!useTeleport || !teleportTargetsReady)"
      class="flex-1 flex flex-col lg:flex-row overflow-hidden min-w-0"
    >
      <div
        class="flex flex-col overflow-hidden border-r border-border"
        :class="currentTask ? 'hidden lg:flex shrink-0' : 'w-full lg:w-auto lg:shrink-0'"
      >
        <EntityListSidebar
          title="Tasks"
          :items="filteredTasks"
          :selected-id="currentTask ? String(currentTask.compositeId) : null"
          :view-mode="viewMode"
          :initial-search-query="cardSearchQuery"
          @view-change="handleViewChange"
          :selected-class="(task) => task.type === 'lead' ? 'bg-muted border-2 border-emerald-700' : 'bg-muted border-2 border-purple-500'"
          :unselected-class="getUnselectedClass"
          :getName="(task) => {
            const customer = task.customer
            if (customer && customer.name) return customer.name
            if (customer && !customer.name && customer.email) return customer.email.split('@')[0] || 'Unknown'
            return 'Unknown'
          }"
          :getInitials="(task) => {
            const customer = task.customer
            if (customer && customer.initials) return customer.initials
            if (customer && customer.name) {
              const initials = customer.name.split(' ').map(n => n[0]).filter(Boolean).join('').toUpperCase().slice(0, 2)
              return initials || '?'
            }
            return '?'
          }"
          :getVehicleInfo="(task) => {
            if (task.type === 'lead') {
              if (!task.requestedCar) return 'No vehicle specified'
              const car = task.requestedCar
              const parts = [`${car.brand} ${car.model}`]
              if (car.vin) parts.push(car.vin)
              if (car.kilometers !== undefined && car.kilometers !== null) parts.push(`${car.kilometers} km`)
              if (car.status) parts.push(car.status)
              return parts.join(' • ')
            }
            const vehicle = task.vehicle || task.requestedCar
            if (!vehicle) return 'No vehicle specified'
            const parts = [`${vehicle.brand} ${vehicle.model}`]
            if (vehicle.vin) parts.push(vehicle.vin)
            if (vehicle.kilometers !== undefined && vehicle.kilometers !== null) parts.push(`${vehicle.kilometers} km`)
            if (vehicle.status) parts.push(vehicle.status)
            return parts.join(' • ')
          }"
          :avatarClass="(task) => task.type === 'lead' ? 'bg-badge-green text-emerald-800' : 'bg-purple-100 text-purple-600'"
          :show-mobile-close="false"
          @select="selectTask"
          @close="handleBackToTaskList"
          :active-filters="activeFilters"
          :show-closed="showClosed"
          @filter-change="activeFilters = $event"
          @sort-change="handleSortChange"
          @toggle-closed="toggleShowClosed"
        >
          <template #badges="{ item: task }">
            <Badge v-if="task && task.type" :text="task.type === 'lead' ? 'Lead' : 'Opportunity'" size="small" :theme="task.type === 'lead' ? 'green' : 'gray'" />
          </template>
          <template #location="{ item: task }">{{ getCustomerCity(task) || 'Unknown' }}</template>
          <template #source="{ item: task }">{{ task.source || task.customer?.source || 'Unknown' }}</template>
          <template #owner="{ item: task }">
            <template v-if="task.assignee">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-black text-white font-medium flex items-center justify-center text-xs shrink-0" style="font-size: 0.5rem;">{{ getAssigneeInitials(task.assignee) }}</div>
                <span class="text-gray-600 font-medium">{{ task.assignee }}</span>
              </div>
            </template>
            <span v-else>Unassigned</span>
          </template>
          <template #dates="{ item: task }">
            <template v-if="task.type === 'lead' && task.nextActionDue"><span>Due: {{ getDateDisplay(task.nextActionDue) }}</span></template>
            <template v-else-if="task.type === 'opportunity' && task.nextActionDue"><span>Due: {{ getDateDisplay(task.nextActionDue) }}</span></template>
            <template v-else><span>Due: No deadline</span></template>
          </template>
        </EntityListSidebar>
      </div>
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden border-l border-border">
        <TaskDetailView
          v-if="currentTask && managementWidget && storeAdapter && addNewConfig"
          :key="currentTask?.compositeId || 'card-empty'"
          :task="currentTask"
          :management-widget="managementWidget"
          :store-adapter="storeAdapter"
          :add-new-config="addNewConfig"
          :filtered-tasks="filteredTasks"
          @task-navigate="handleTaskNavigate"
          @close="handleBackToTaskList"
        />
        <div v-if="!currentTask" class="hidden lg:flex flex-1 flex-col w-full min-h-0 overflow-hidden bg-surface">
          <div class="flex-1 flex items-center justify-center w-full p-8">
            <div class="text-center max-w-sm">
              <div class="w-16 h-16 mx-auto mb-4 rounded-lg bg-muted flex items-center justify-center">
                <ListTodo class="w-8 h-8 shrink-0 text-muted-foreground" />
              </div>
              <h3 class="text-content-bold mb-2">No task selected</h3>
              <p class="text-meta">Select a task from the list to view its details and manage activities</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Table View - Same structure as Customers: page-container, scroll area with padding, white card. -->
    <div v-if="viewMode === 'table'" class="page-container relative flex flex-col flex-1 overflow-hidden min-w-0 h-full bg-surface border-r border-border">
      <TasksTableView
        :tasks="allTasks"
        :current-task-id="drawerTask?.compositeId"
        :highlight-id="highlightId"
        :show-closed="showClosed"
        :show-mobile-close="false"
        :initial-global-filter="tableSearchQuery"
        :get-vehicle-type="getVehicleType"
        :get-vehicle-type-badge-class="getVehicleTypeBadgeClass"
        :get-owner-info="getOwnerInfo"
        :get-stage-badge-class="getStageBadgeClass"
        :view-mode="viewMode"
        @select="selectTask"
        @toggle-closed="showClosed = $event"
        @reassign="reassignTask"
        @close="handleBackToTaskList"
        @view-change="handleViewChange"
        @update:global-filter="tableSearchQuery = $event"
        class="flex-1 w-full"
      />
    </div>
    
    <!-- Task Drawer Container -->
    <DrawerContainer 
      v-if="viewMode === 'table'"
      :show="showTaskDrawer" 
      @close="handleBackToTaskList"
    >
      <!-- Loading State (when drawer is open but task not loaded yet) -->
      <div v-if="!drawerTask && drawerTaskCompositeId" class="flex items-center justify-center h-full p-8">
        <div class="flex flex-col items-center gap-4">
          <Loader2 class="w-8 h-8 animate-spin text-primary" />
          <p class="text-sm text-muted-foreground">Loading task...</p>
        </div>
      </div>
      
      <!-- TaskDetailView in Drawer (uses allTasks for prev/next; table is independent of TaskFilters) -->
      <TaskDetailView
        v-if="drawerTask && drawerManagementWidget && drawerStoreAdapter && drawerAddNewConfig"
        :key="drawerTask?.compositeId || 'drawer-empty'"
        :task="drawerTask"
        :management-widget="drawerManagementWidget"
        :store-adapter="drawerStoreAdapter"
        :add-new-config="drawerAddNewConfig"
        :filtered-tasks="allTasks"
        :is-drawer-view="true"
        @task-navigate="handleDrawerTaskNavigate"
        @close="handleBackToTaskList"
      />
    </DrawerContainer>
    
    <!-- Reassign Modal -->
    <ReassignUserModal
      :show="showReassignModal"
      @close="showReassignModal = false"
      @confirm="handleReassignConfirm"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, inject, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ListTodo, Loader2 } from 'lucide-vue-next'
import { useLeadsStore } from '@/stores/leads'
import { useOpportunitiesStore } from '@/stores/opportunities'
import { useUserStore } from '@/stores/user'
import { useUsersStore } from '@/stores/users'
import { Badge } from '@motork/component-library/future/primitives'
import EntityListSidebar from '@/components/tasks/TasksList.vue'
import TasksTableView from '@/components/tasks/TasksTableView.vue'
import TaskDetailView from '@/components/tasks/TaskDetailView.vue'
import DrawerContainer from '@/components/shared/DrawerContainer.vue'
import { useTaskShell } from '@/composables/useTaskShell'
import { useTaskHelpers } from '@/composables/useTaskHelpers'
import { useTaskFilters } from '@/composables/useTaskFilters'
import { useTaskSorting } from '@/composables/useTaskSorting'
import { formatCurrency } from '@/utils/formatters'
import { getStageBadgeClass } from '@/utils/formatters'
import ReassignUserModal from '@/components/modals/ReassignUserModal.vue'
import { useSettingsStore } from '@/stores/settings'
import { useLayoutStore } from '@/stores/layout'

const route = useRoute()
const router = useRouter()
const headerActionsRef = inject('headerActionsRef', null)
const leadsStore = useLeadsStore()
const opportunitiesStore = useOpportunitiesStore()
const userStore = useUserStore()
const usersStore = useUsersStore()
const settingsStore = useSettingsStore()
const layoutStore = useLayoutStore()

// Use task helpers composable
const {
  getDateDisplay,
  getVehicleType,
  getVehicleTypeBadgeClass,
  getOwnerInfo,
  getCustomerCity,
  getLocationDisplay,
  getAssigneeInitials,
  getVehicleStatusDisplay,
  getTaskStatusDisplay,
  getUnselectedClass: getUnselectedClassHelper
} = useTaskHelpers()

// View mode state with localStorage persistence (table is default; card persists when user switches)
const viewMode = ref(
  (() => {
    const stored = localStorage.getItem('tasksViewMode')
    return stored === 'card' || stored === 'table' ? stored : 'table'
  })()
)

watch(
  () => [route.path, route.params.id],
  ([newPath, newId]) => {
    if (newPath === '/tasks' && !newId) {
      viewMode.value = 'table'
      localStorage.setItem('tasksViewMode', 'table')
    }
  },
  { immediate: true, flush: 'post' }
)

// True when list/detail should be teleported to layout slots (card view + task selected on desktop).
// Require route.name === 'task-detail' so teleports are disabled before unmount when navigating away
// (avoids "Cannot read properties of null (reading 'insertBefore')" in moveTeleport).
const useTeleport = computed(
  () => route.name === 'task-detail' && viewMode.value === 'card' && layoutStore.hideHeaderForTaskDetail
)

// Only mount Teleport components after their targets exist in DOM (avoids "Failed to locate Teleport target").
const teleportTargetsReady = ref(false)

// Card view search query (for when switching from table view)
const cardSearchQuery = ref('')

// Table view search query (for preserving search state when switching views)
const tableSearchQuery = ref('')

// Get highlight ID from query string
const highlightId = computed(() => {
  return route.query.highlight || null
})

// Watch for changes and persist
watch(viewMode, (newMode) => {
  localStorage.setItem('tasksViewMode', newMode)
})

// Handle view mode changes with navigation logic
const handleViewChange = (newViewMode, searchQuery = '') => {
  const previousMode = viewMode.value
  
  // Capture current task before navigation (since route change will clear it)
  const taskToHighlight = currentTask.value
  
  viewMode.value = newViewMode
  
  // If switching to card view, set the search query if provided
  if (newViewMode === 'card' && searchQuery) {
    cardSearchQuery.value = searchQuery
  }
  // If switching to card view from table, preserve the table search query as card search
  else if (newViewMode === 'card' && previousMode === 'table' && tableSearchQuery.value) {
    cardSearchQuery.value = tableSearchQuery.value
  }
  
  // If switching to table view from card, preserve the card search query as table search
  if (newViewMode === 'table' && previousMode === 'card' && cardSearchQuery.value) {
    tableSearchQuery.value = cardSearchQuery.value
  }
  
  // If switching to table view while a task is selected, navigate to /tasks with highlight query only
  if (newViewMode === 'table' && taskToHighlight) {
    router.push({ 
      path: '/tasks', 
      query: { highlight: taskToHighlight.compositeId } 
    })
  }
  // If switching to table view without a task selected, clear all query params
  else if (newViewMode === 'table' && !taskToHighlight) {
    router.push({ path: '/tasks', query: {} })
  }
  // If switching to card view and we have a highlight query, navigate to that task
  else if (newViewMode === 'card' && highlightId.value) {
    const [type, id] = highlightId.value.split('-')
    router.push({ 
      path: `/tasks/${id}`, 
      query: { type } 
    })
  }
  // If switching to card view without highlight and no current task, just go to /tasks (no selection)
  else if (newViewMode === 'card' && !highlightId.value && !currentTask.value) {
    router.push({ path: '/tasks', query: {} })
  }
}


const activeFilters = ref([]) // Array of active filter keys: ['lead', 'due-in-24h', etc.] - no filters by default
const sortOption = ref('none') // 'none' = no sort, 'recent-first', 'oldest-first'
const showClosed = ref(false) // Toggle to show/hide closed leads and closed opportunities; default false (hidden by default)

function toggleShowClosed() {
  showClosed.value = !showClosed.value
}

function updateTeleportTargetsReady() {
  teleportTargetsReady.value = !!(
    document.getElementById('tasks-list-teleport') &&
    document.getElementById('tasks-detail-teleport')
  )
}

watch(
  () => useTeleport.value,
  async () => {
    await nextTick()
    updateTeleportTargetsReady()
  },
  { immediate: true }
)

onMounted(() => {
  if (headerActionsRef) {
    headerActionsRef.value = {
      type: 'tasks',
      viewModeRef: viewMode,
      onViewChange: handleViewChange
    }
  }
  updateTeleportTargetsReady()
})

onBeforeUnmount(() => {
  if (headerActionsRef) headerActionsRef.value = null
})

const showTaskListMobile = ref(false)
const showReassignModal = ref(false)
const taskToReassign = ref(null)
const showTaskDrawer = ref(false) // Control drawer visibility in table view
const drawerTaskCompositeId = ref(null) // 'lead-1' or 'opportunity-1' - used to resolve live task from store

// Use task filters composable
const { allTasks, allTasksIncludingClosed, applyFilters, shouldShowTypeFilter } = useTaskFilters(showClosed)

const drawerTask = computed(() => {
  if (!drawerTaskCompositeId.value) return null
  return allTasks.value.find(t => t.compositeId === drawerTaskCompositeId.value) ||
    allTasksIncludingClosed.value.find(t => t.compositeId === drawerTaskCompositeId.value) ||
    null
})

// Use task sorting composable
const { sortTasks } = useTaskSorting()

// Filter and sort tasks
const filteredTasks = computed(() => {
  // Apply all active filters
  let tasks = applyFilters(allTasks.value, activeFilters.value)
  
  // Apply sort
  tasks = sortTasks(tasks, sortOption.value)
  
  return tasks
})

// Get current task based on route ID and query param type (include closed so task detail stays open after close/postpone)
const currentTask = computed(() => {
  if (!route.params.id) return null

  const taskId = parseInt(route.params.id)
  if (isNaN(taskId)) return null

  const routeType = route.query.type

  const fromList = (list) => {
    if (routeType) {
      const compositeId = `${routeType}-${taskId}`
      return list.find(t => t.compositeId === compositeId) || null
    }
    const leadCompositeId = `lead-${taskId}`
    const oppCompositeId = `opportunity-${taskId}`
    return list.find(t => t.compositeId === leadCompositeId || t.compositeId === oppCompositeId) || null
  }

  return fromList(allTasks.value) || fromList(allTasksIncludingClosed.value) || null
})

// Get current activities based on task type
const currentActivities = computed(() => {
  if (!currentTask.value) return []
  if (currentTask.value.type === 'lead') {
    return leadsStore.currentLeadActivities
  } else {
    return opportunitiesStore.currentOpportunityActivities
  }
})

// Use composable to get EntityDetailLayout props (same as Customer.vue)
const taskShellProps = useTaskShell(currentTask)
const managementWidget = taskShellProps.managementWidget
const storeAdapter = taskShellProps.storeAdapter
const addNewConfig = taskShellProps.addNewConfig

// Computed ref for drawer task (for useTaskShell)
const drawerTaskRef = computed(() => drawerTask.value)

// Get task shell props for drawer task
const drawerTaskShellPropsRaw = useTaskShell(drawerTaskRef)

// Unwrap the computed refs for use in template
const drawerManagementWidget = computed(() => drawerTaskShellPropsRaw.managementWidget.value)
const drawerStoreAdapter = computed(() => drawerTaskShellPropsRaw.storeAdapter.value)
const drawerAddNewConfig = computed(() => drawerTaskShellPropsRaw.addNewConfig.value)

// Get unselected class based on task type (function from composable)
const getUnselectedClass = getUnselectedClassHelper

// Load data on mount
onMounted(() => {
  leadsStore.fetchLeads()
  opportunitiesStore.fetchOpportunities()
  
  const taskId = route.params.id
  if (taskId) {
    loadTaskById(taskId)
  }
})

// Watch for route changes (including type to ensure we load the correct task)
watch(() => [route.params.id, route.query.type], ([newId, newType], [oldId, oldType]) => {
  if (newId && (newId !== oldId || newType !== oldType)) {
    loadTaskById(newId)
  }
})

// Watch for task changes to load activities
watch(currentTask, (task) => {
  if (task) {
    if (task.type === 'lead') {
      leadsStore.fetchLeadById(task.id)
    } else {
      opportunitiesStore.fetchOpportunityById(task.id)
    }
  }
}, { immediate: true })

// On desktop only: header over list column so task detail gets full height
const isDesktop = ref(typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches)
if (typeof window !== 'undefined') {
  const mq = window.matchMedia('(min-width: 768px)')
  mq.addEventListener('change', (e) => { 
    isDesktop.value = e.matches 
    // If switching to mobile and in table view, force card view
    if (!e.matches && viewMode.value === 'table') {
      viewMode.value = 'card'
    }
  })
}

// Ensure mobile starts in card view
onMounted(() => {
  if (!isDesktop.value && viewMode.value === 'table') {
    viewMode.value = 'card'
  }
})

watch(
  () => isDesktop.value && viewMode.value === 'card',
  (hide) => { layoutStore.setHideHeaderForTaskDetail(hide) },
  { immediate: true }
)

onBeforeUnmount(() => {
  layoutStore.setHideHeaderForTaskDetail(false)
})

// Watch for drawer task changes to load activities
watch(drawerTask, (task) => {
  if (task) {
    if (task.type === 'lead') {
      leadsStore.fetchLeadById(task.id)
    } else {
      opportunitiesStore.fetchOpportunityById(task.id)
    }
  }
}, { immediate: true })

// Sync drawer with route when in table view (e.g. after qualify → opportunity, or selection)
// Keeps drawer state in sync with URL; also open drawer when a row is highlighted (e.g. ?highlight= or after row click)
watch(
  () => [viewMode.value, route.params.id, route.query.type, route.query.highlight],
  () => {
    if (viewMode.value !== 'table') return
    
    if (route.params.id && route.query.type) {
      const compositeId = `${route.query.type}-${route.params.id}`
      drawerTaskCompositeId.value = compositeId
      // Drawer will show once the task is loaded via the drawerTask watch below
    } else if (route.query.highlight) {
      // When a table row is highlighted (e.g. switch from card view or deep link), open drawer for that record
      drawerTaskCompositeId.value = route.query.highlight
    } else {
      showTaskDrawer.value = false
      drawerTaskCompositeId.value = null
    }
  },
  { immediate: true }
)

// Watch drawerTask to open drawer only when task is actually loaded
let drawerLoadTimeout = null
watch(drawerTask, (task) => {
  if (viewMode.value !== 'table') return
  
  // Clear any existing timeout
  if (drawerLoadTimeout) {
    clearTimeout(drawerLoadTimeout)
    drawerLoadTimeout = null
  }
  
  // Open drawer when we have a selected/highlighted task (from route id/type or highlight query)
  if (task && drawerTaskCompositeId.value) {
    showTaskDrawer.value = true
  } else if (!task && drawerTaskCompositeId.value) {
    // Task not found yet - keep drawer closed until task loads
    showTaskDrawer.value = false
    
    // Set timeout to close drawer if task doesn't load within 5 seconds
    drawerLoadTimeout = setTimeout(() => {
      if (!drawerTask.value && drawerTaskCompositeId.value) {
        handleBackToTaskList()
      }
    }, 5000)
  }
}, { immediate: true })


const loadTaskById = (id) => {
  const taskId = parseInt(id)
  const routeType = route.query.type
  
  // Use compositeId for matching to avoid loading wrong task type
  let task = null
  if (routeType) {
    const compositeId = `${routeType}-${taskId}`
    task = allTasks.value.find(t => t.compositeId === compositeId)
  } else {
    // Fallback: try to find by ID (but prefer with compositeId)
    task = allTasks.value.find(t => t.id === taskId)
  }

  if (task) {
    if (task.type === 'lead') {
      leadsStore.fetchLeadById(taskId)
    } else {
      opportunitiesStore.fetchOpportunityById(taskId)
    }
  } else if (routeType === 'opportunity') {
    // Fallback: task not in list (e.g. newly created) – fetch by ID and refresh list
    opportunitiesStore.fetchOpportunityById(taskId).then(() => {
      opportunitiesStore.fetchOpportunities()
    })
  } else if (routeType === 'lead') {
    // Fallback for leads
    leadsStore.fetchLeadById(taskId).then(() => {
      leadsStore.fetchLeads()
    })
  }
}

const selectTask = (compositeId) => {
  // compositeId is in format "lead-1" or "opportunity-1"
  const [type, id] = compositeId.split('-')
  
  // If in table view, open full-page request details (not a drawer)
  if (viewMode.value === 'table') {
    router.push({ path: `/requests/${id}`, query: { type, from: 'tasks' } })
    return
  }
  
  // Card view behavior: Switch to card view and navigate
  viewMode.value = 'card'
  
  // Navigate to the task
  router.push({ path: `/tasks/${id}`, query: { type } })
}

const handleBackToTaskList = () => {
  // If drawer is open (table view), navigate to /tasks and clear all query params
  if (showTaskDrawer.value) {
    router.push({ path: '/tasks', query: {} })
    return
  }
  
  // Card view: navigate back to task list (no task selected), clear query params
  router.push({ path: '/tasks', query: {} })
}

const handleTaskNavigate = (direction) => {
  if (!currentTask.value) return
  
  const index = filteredTasks.value.findIndex(t => {
    const currentCompositeId = currentTask.value.compositeId || `${currentTask.value.type}-${currentTask.value.id}`
    const taskCompositeId = t.compositeId || `${t.type}-${t.id}`
    return taskCompositeId === currentCompositeId
  })
  
  if (index === -1) return
  
  if (direction === 'previous' && index > 0) {
    const prevTask = filteredTasks.value[index - 1]
    selectTask(prevTask.compositeId)
  } else if (direction === 'next' && index < filteredTasks.value.length - 1) {
    const nextTask = filteredTasks.value[index + 1]
    selectTask(nextTask.compositeId)
  }
}

const handleDrawerTaskNavigate = (direction) => {
  if (!drawerTask.value) return
  
  // Drawer uses allTasks for prev/next (same as :filtered-tasks passed to drawer)
  const tasks = allTasks.value
  const index = tasks.findIndex(t => {
    const currentCompositeId = drawerTask.value.compositeId || `${drawerTask.value.type}-${drawerTask.value.id}`
    const taskCompositeId = t.compositeId || `${t.type}-${t.id}`
    return taskCompositeId === currentCompositeId
  })
  
  if (index === -1) return
  
  if (direction === 'previous' && index > 0) {
    selectTask(tasks[index - 1].compositeId)
  } else if (direction === 'next' && index < tasks.length - 1) {
    selectTask(tasks[index + 1].compositeId)
  }
}

const reassignTask = (task) => {
  taskToReassign.value = task
  showReassignModal.value = true
}

const handleSortChange = (sort) => {
  sortOption.value = sort
}

const handleReassignConfirm = async (assignee) => {
  if (!taskToReassign.value) return
  
  const task = taskToReassign.value
  const assigneeName = assignee.name
  
  if (task.type === 'lead') {
    await leadsStore.updateLead(task.id, { 
      assignee: assigneeName,
      assigneeType: assignee.type,
      teamId: assignee.type === 'team' ? assignee.id : null
    })
  } else if (task.type === 'opportunity') {
    await opportunitiesStore.updateOpportunity(task.id, { 
      assignee: assigneeName,
      assigneeType: assignee.type,
      teamId: assignee.type === 'team' ? assignee.id : null
    })
  }
  
  showReassignModal.value = false
  taskToReassign.value = null
}

</script>

<style scoped>
.view-fade-enter-active,
.view-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.view-fade-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.view-fade-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

</style>
