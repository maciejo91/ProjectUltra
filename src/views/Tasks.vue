<template>
  <div class="h-full flex flex-col lg:flex-row overflow-hidden bg-surface">
    <!-- Unified Mobile Header - Shows when task is selected (both views) -->
    <MobileDetailHeader
      :show="!!currentTask || (viewMode === 'table' && !!drawerTask)"
      back-label="Back to task list"
      @back="handleBackToTaskList"
    />

    <!-- Card View - Similar structure to table view -->
    <div v-if="viewMode === 'card'" class="flex-1 flex flex-col lg:flex-row overflow-hidden min-w-0">
      <!-- Card List (left side on desktop, full screen on mobile when no task selected) -->
      <div 
        class="flex flex-col overflow-hidden"
        :class="currentTask ? 'hidden lg:flex shrink-0' : 'w-full lg:w-auto lg:shrink-0'"
      >
        <EntityListSidebar
          title="Tasks"
          :items="filteredTasks"
          :selected-id="currentTask ? String(currentTask.compositeId) : null"
          :view-mode="viewMode"
          :initial-search-query="cardSearchQuery"
          @view-change="handleViewChange"
          :selected-class="(task) => task.type === 'lead' ? 'bg-surface border-2 border-blue-500' : 'bg-surface border-2 border-purple-500'"
          :unselected-class="getUnselectedClass"
          :getName="(task) => {
            // Ensure customer exists and has name
            const customer = task.customer
            if (customer && customer.name) {
              return customer.name
            }
            // Generate from name if initials exist but name doesn't (shouldn't happen, but defensive)
            if (customer && !customer.name && customer.email) {
              return customer.email.split('@')[0] || 'Unknown'
            }
            return 'Unknown'
          }"
          :getInitials="(task) => {
            // Ensure customer exists
            const customer = task.customer
            if (customer && customer.initials) {
              return customer.initials
            }
            // Generate from name if available
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
              if (car.kilometers !== undefined && car.kilometers !== null) {
                parts.push(`${car.kilometers} km`)
              }
              if (car.status) {
                parts.push(car.status)
              }
              return parts.join(' • ')
            }
            // For opportunities: prefer vehicle over requestedCar
            const vehicle = task.vehicle || task.requestedCar
            if (!vehicle) return 'No vehicle specified'
            const parts = [`${vehicle.brand} ${vehicle.model}`]
            if (vehicle.kilometers !== undefined && vehicle.kilometers !== null) {
              parts.push(`${vehicle.kilometers} km`)
            }
            if (vehicle.status) {
              parts.push(vehicle.status)
            }
            return parts.join(' • ')
          }"
          :avatarClass="(task) => task.type === 'lead' ? 'bg-orange-100 text-orange-600' : 'bg-purple-100 text-purple-600'"
          :show-mobile-close="false"
          @select="selectTask"
          @close="handleBackToTaskList"
          :active-filters="activeFilters"
          @filter-change="activeFilters = $event"
          @sort-change="handleSortChange"
        >
          <template #badges="{ item: task }">
            <!-- Type Badge -->
            <Badge
              v-if="task && task.type"
              :text="task.type === 'lead' ? 'Lead' : 'Opportunity'"
              size="small"
              :theme="task.type === 'lead' ? 'blue' : 'gray'"
            />
            
            <!-- Urgency Badge (for leads when urgency is enabled) -->
            <span
              v-if="task && task.type === 'lead' && settingsStore.getSetting('urgencyEnabled') !== false && task.urgencyLevel"
              :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border', getUrgencyColorClass(task.urgencyLevel)]"
            >
              <component :is="getUrgencyIconComponent(task.urgencyLevel)" class="size-3 shrink-0" />
              {{ task.urgencyLevel }}
            </span>
            
            <!-- Hot Badge (for leads, fallback if urgency disabled) -->
            <Badge
              v-if="task && task.priority === 'Hot' && (settingsStore.getSetting('urgencyEnabled') === false || task.type !== 'lead')"
              text="HOT"
              size="small"
              theme="red"
            />
          </template>
          
          <template #location="{ item: task }">
            {{ getCustomerCity(task) || 'Unknown' }}
          </template>
          
          <template #source="{ item: task }">
            {{ task.source || task.customer?.source || 'Unknown' }}
          </template>
          
          <template #owner="{ item: task }">
            <template v-if="task.assignee">
              <div class="flex items-center gap-2">
                <div 
                  class="w-3 h-3 rounded-full bg-black text-white font-medium flex items-center justify-center text-xs shrink-0"
                  style="font-size: 0.5rem;"
                >
                  {{ getAssigneeInitials(task.assignee) }}
                </div>
                <span class="text-gray-600 font-medium">{{ task.assignee }}</span>
              </div>
            </template>
            <span v-else>Unassigned</span>
          </template>
          
          <template #dates="{ item: task }">
            <template v-if="task.type === 'lead' && task.nextActionDue">
              <span>Due: {{ getDateDisplay(task.nextActionDue) }}</span>
            </template>
            <template v-else-if="task.type === 'opportunity' && task.nextActionDue">
              <span>Due: {{ getDateDisplay(task.nextActionDue) }}</span>
            </template>
            <template v-else>
              <span>Due: No deadline</span>
            </template>
          </template>
          
        </EntityListSidebar>
      </div>
      
      <!-- Task Detail Panel for Card View (right side on desktop, full screen on mobile) -->
      <TaskDetailView
        v-if="currentTask && managementWidget && storeAdapter && addNewConfig"
        :key="currentTask?.compositeId || 'card-empty'"
        :task="currentTask"
        :management-widget="managementWidget"
        :store-adapter="storeAdapter"
        :add-new-config="addNewConfig"
        :filtered-tasks="filteredTasks"
        @task-navigate="handleTaskNavigate"
      />
      
      <!-- Empty State for Card View (right side on desktop, hidden on mobile) -->
      <div v-if="!currentTask" class="hidden lg:flex flex-1 flex-col overflow-hidden lg:border-l border">
        <div class="flex-1 flex items-center justify-center p-8">
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
    
    <!-- Table View - Takes remaining space, drawer shown on top when task selected.
         Table uses allTasks only; TaskFilters (button + chips) apply to card view list only. -->
    <div v-if="viewMode === 'table'" class="flex-1 flex flex-col overflow-hidden min-w-0 relative">
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Flame, Sun, CheckCircle, Circle, ListTodo, Loader2 } from 'lucide-vue-next'
import { useLeadsStore } from '@/stores/leads'
import { useOpportunitiesStore } from '@/stores/opportunities'
import { useUserStore } from '@/stores/user'
import { useUsersStore } from '@/stores/users'
import { Badge } from '@motork/component-library/future/primitives'
import EntityListSidebar from '@/components/tasks/TasksList.vue'
import TasksTableView from '@/components/tasks/TasksTableView.vue'
import TaskDetailView from '@/components/tasks/TaskDetailView.vue'
import MobileDetailHeader from '@/components/shared/layout/MobileDetailHeader.vue'
import DrawerContainer from '@/components/shared/DrawerContainer.vue'
import { useTaskShell } from '@/composables/useTaskShell'
import { useTaskHelpers } from '@/composables/useTaskHelpers'
import { useTaskFilters } from '@/composables/useTaskFilters'
import { useTaskSorting } from '@/composables/useTaskSorting'
import { formatCurrency } from '@/utils/formatters'
import { getStageBadgeClass } from '@/utils/formatters'
import ReassignUserModal from '@/components/modals/ReassignUserModal.vue'
import { getUrgencyIcon, getUrgencyColorClass } from '@/composables/useLeadUrgency'
import { useSettingsStore } from '@/stores/settings'

const urgencyIconComponents = { Flame, Sun, CheckCircle, Circle }
function getUrgencyIconComponent(level) {
  return urgencyIconComponents[getUrgencyIcon(level)] || Circle
}

const route = useRoute()
const router = useRouter()
const leadsStore = useLeadsStore()
const opportunitiesStore = useOpportunitiesStore()
const userStore = useUserStore()
const usersStore = useUsersStore()
const settingsStore = useSettingsStore()

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

// View mode state with localStorage persistence (default to table)
const viewMode = ref(localStorage.getItem('tasksViewMode') || 'table')

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
const sortOption = ref('') // '', 'urgent-first', 'assigned-to-me', 'assigned-to-my-team', 'recent-first'
const showClosed = ref(false) // Toggle to show/hide closed (disqualified) leads
const showTaskListMobile = ref(false)
const showReassignModal = ref(false)
const taskToReassign = ref(null)
const showTaskDrawer = ref(false) // Control drawer visibility in table view
const drawerTaskCompositeId = ref(null) // 'lead-1' or 'opportunity-1' - used to resolve live task from store

// Use task filters composable
const { allTasks, applyFilters, shouldShowTypeFilter } = useTaskFilters(showClosed)

const drawerTask = computed(() => {
  if (!drawerTaskCompositeId.value) return null
  return allTasks.value.find(t => t.compositeId === drawerTaskCompositeId.value) || null
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

// Get current task based on route ID and query param type
const currentTask = computed(() => {
  // If no ID in route, return null (show list only)
  if (!route.params.id) {
    return null
  }
  
  const taskId = parseInt(route.params.id)
  // If taskId is NaN or invalid, return null
  if (isNaN(taskId)) {
    return null
  }
  
  const routeType = route.query.type // 'lead' or 'opportunity' from query param
  
  // Always use compositeId for matching to avoid conflicts between leads and opportunities with same ID
  if (routeType) {
    const compositeId = `${routeType}-${taskId}`
    return allTasks.value.find(t => t.compositeId === compositeId) || null
  }
  
  // If no type specified, try to find by compositeId in filtered list first
  const typeFilters = activeFilters.value.filter(f => f === 'lead' || f === 'opportunity')
  const filtered = typeFilters.length > 0
    ? allTasks.value.filter(t => typeFilters.includes(t.type))
    : allTasks.value
  
  // Try both lead and opportunity compositeIds
  const leadCompositeId = `lead-${taskId}`
  const oppCompositeId = `opportunity-${taskId}`
  
  const task = filtered.find(t => t.compositeId === leadCompositeId || t.compositeId === oppCompositeId)
  if (task) return task
  
  // Fallback: check all tasks by compositeId
  return allTasks.value.find(t => t.compositeId === leadCompositeId || t.compositeId === oppCompositeId) || null
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
  
  // If in table view, update route (sync watch will open drawer) so URL reflects selection and survives refresh
  if (viewMode.value === 'table') {
    router.push({ path: `/tasks/${id}`, query: { type } })
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
