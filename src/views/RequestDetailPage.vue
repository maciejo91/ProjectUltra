<template>
  <div class="flex min-h-0 flex-1 flex-col overflow-hidden bg-muted">
    <RequestDetailView
      v-if="request"
      :key="request?.compositeId || 'empty'"
      class="flex min-h-0 min-w-0 flex-1 flex-col"
      :request="request"
      :filtered-requests="filteredRequests"
      :is-full-page="true"
      @close="handleBack"
      @request-navigate="handleRequestNavigate"
      @open-task-drawer="handleOpenTaskDrawer"
    />
    <div v-else class="flex flex-1 items-center justify-center bg-muted p-8">
      <div class="text-center">
        <p class="text-muted-foreground">{{ loading ? 'Loading...' : 'Request not found' }}</p>
      </div>
    </div>

    <!-- Task drawer (on top of request details) -->
    <DrawerContainer
      :show="showTaskDrawer"
      @close="closeTaskDrawer"
    >
      <div v-if="!drawerTask && drawerTaskCompositeId" class="flex items-center justify-center h-full p-8">
        <div class="flex flex-col items-center gap-4">
          <Loader2 class="size-8 animate-spin text-primary" />
          <p class="text-sm text-muted-foreground">Loading task...</p>
        </div>
      </div>
      <TaskDetailView
        v-if="drawerTask && drawerManagementWidget && drawerStoreAdapter && drawerAddNewConfig"
        :key="drawerTask?.compositeId || 'drawer-empty'"
        :task="drawerTask"
        :management-widget="drawerManagementWidget"
        :store-adapter="drawerStoreAdapter"
        :add-new-config="drawerAddNewConfig"
        :filtered-tasks="drawerFilteredTasks"
        :is-drawer-view="true"
        @task-navigate="handleDrawerTaskNavigate"
        @close="closeTaskDrawer"
      />
    </DrawerContainer>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Loader2 } from 'lucide-vue-next'
import RequestDetailView from '@/components/requests/RequestDetailView.vue'
import DrawerContainer from '@/components/shared/DrawerContainer.vue'
import TaskDetailView from '@/components/tasks/TaskDetailView.vue'
import { useRequestsList } from '@/composables/useRequestsList'
import { useLeadsStore } from '@/stores/leads'
import { getDisplayStage } from '@/utils/stageMapper'
import { useRequestNavigationStore } from '@/stores/requestNavigation'
import { useOpportunitiesStore } from '@/stores/opportunities'
import { useTaskShell } from '@/composables/useTaskShell'
import { useTaskFilters } from '@/composables/useTaskFilters'

const route = useRoute()
const router = useRouter()
const { filteredList, combinedList } = useRequestsList()
const requestNavigationStore = useRequestNavigationStore()
const leadsStore = useLeadsStore()
const opportunitiesStore = useOpportunitiesStore()

const showClosed = ref(true)
const { allTasks } = useTaskFilters(showClosed)

const showTaskDrawer = ref(false)
const drawerTaskCompositeId = ref(null)

const drawerTask = computed(() => {
  if (!drawerTaskCompositeId.value) return null
  return allTasks.value.find(t => t.compositeId === drawerTaskCompositeId.value) || null
})

const drawerTaskRef = computed(() => drawerTask.value)
const drawerTaskShellPropsRaw = useTaskShell(drawerTaskRef)
const drawerManagementWidget = computed(() => drawerTaskShellPropsRaw.managementWidget.value)
const drawerStoreAdapter = computed(() => drawerTaskShellPropsRaw.storeAdapter.value)
const drawerAddNewConfig = computed(() => drawerTaskShellPropsRaw.addNewConfig.value)

const drawerFilteredTasks = computed(() => allTasks.value)

watch(drawerTaskCompositeId, (id) => {
  if (!id) return
  const [type, taskId] = id.split('-')
  const numId = parseInt(taskId, 10)
  if (type === 'lead' && numId) {
    leadsStore.fetchLeadById(numId)
  } else if (type === 'opportunity' && numId) {
    opportunitiesStore.fetchOpportunityById(numId)
  }
})

const requestId = computed(() => parseInt(route.params.id, 10))
const requestType = computed(() => route.query.type || 'lead')
const compositeId = computed(() => `${requestType.value}-${requestId.value}`)

const request = computed(() => {
  const found = filteredList.value.find(r => r.compositeId === compositeId.value)
  if (found) return found
  const type = requestType.value
  const id = requestId.value
  if (type === 'lead') {
    const lead =
      leadsStore.leads.find(l => l.id === id) ||
      (leadsStore.currentLead?.id === id ? leadsStore.currentLead : null)
    if (lead) {
      return {
        ...lead,
        type: 'lead',
        compositeId: `lead-${lead.id}`,
        displayStage: getDisplayStage(lead, 'lead'),
        customer: lead.customer || lead
      }
    }
  } else {
    const opp = opportunitiesStore.opportunities.find(o => o.id === id)
    if (opp) {
      return {
        ...opp,
        type: 'opportunity',
        compositeId: `opportunity-${opp.id}`,
        displayStage: getDisplayStage(opp, 'opportunity'),
        customer: opp.customer || opp
      }
    }
  }
  return null
})

const requestRowsFromState = computed(() => {
  const state = window.history?.state
  return state?.requestRows ?? []
})

const filteredRequests = computed(() => {
  const fromStore = requestNavigationStore.requestRows
  const fromState = requestRowsFromState.value
  const primary = fromStore?.length ? fromStore : (fromState?.length ? fromState : filteredList.value)
  const currentId = compositeId.value
  if (!currentId) {
    return primary?.length ? primary : combinedList.value
  }
  const [routeType, routeIdStr] = String(currentId).split('-')
  const rowMatchesCurrent = (r) => {
    if (String(r.compositeId) === String(currentId)) return true
    if (routeType && r.type === routeType && String(r.id) === String(routeIdStr)) return true
    return false
  }
  if (!primary?.length || !primary.some(rowMatchesCurrent)) {
    return combinedList.value
  }
  return primary
})

const loading = computed(() => {
  const type = requestType.value
  const id = requestId.value
  if (!id) return false
  if (type === 'lead') {
    const lead =
      leadsStore.leads.find(l => l.id === id) ||
      (leadsStore.currentLead?.id === id ? leadsStore.currentLead : null)
    return !lead
  }
  const opp = opportunitiesStore.opportunities.find(o => o.id === id)
  return !opp
})

watch(
  [requestId, requestType],
  () => {
    if (!requestId.value) return
    if (requestType.value === 'lead') {
      leadsStore.fetchLeadById(requestId.value)
    } else {
      opportunitiesStore.fetchOpportunityById(requestId.value)
    }
  },
  { immediate: true }
)

function handleBack() {
  const from = route.query.from
  if (from === 'customer' && request.value?.customerId) {
    router.push({ path: `/customer/${request.value.customerId}` })
    return
  }
  if (from === 'tasks') {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
      return
    }
    router.push({ path: '/tasks', query: {} })
    return
  }
  if (from === 'home') {
    router.push({ path: '/home' })
    return
  }
  const query = from === 'requests' && request.value?.compositeId
    ? { highlight: request.value.compositeId }
    : {}
  router.push({ path: '/requests', query })
}

function handleRequestNavigate(compositeId, requestRowsOverride) {
  const [type, id] = (compositeId || '').split('-')
  if (!id) return
  const rows = requestRowsOverride?.length ? requestRowsOverride : filteredRequests.value
  requestNavigationStore.setRequestRows(rows)
  const from = route.query.from || 'requests'
  router.push({
    path: `/requests/${id}`,
    query: { type, from },
    state: rows.length ? { requestRows: rows } : undefined
  })
}

function handleOpenTaskDrawer(task) {
  if (!task?.compositeId) return
  drawerTaskCompositeId.value = task.compositeId
  showTaskDrawer.value = true
}

function closeTaskDrawer() {
  showTaskDrawer.value = false
  drawerTaskCompositeId.value = null
}

function handleDrawerTaskNavigate(direction) {
  if (!drawerTask.value) return
  const tasks = drawerFilteredTasks.value
  const currentId = drawerTask.value.compositeId || `${drawerTask.value.type}-${drawerTask.value.id}`
  const index = tasks.findIndex(t => (t.compositeId || `${t.type}-${t.id}`) === currentId)
  if (index === -1) return
  if (direction === 'previous' && index > 0) {
    drawerTaskCompositeId.value = tasks[index - 1].compositeId
  } else if (direction === 'next' && index < tasks.length - 1) {
    drawerTaskCompositeId.value = tasks[index + 1].compositeId
  }
}
</script>
