<template>
  <div class="page-container relative flex flex-col overflow-hidden h-full bg-surface">
    <!-- Filters + Table -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
        <!-- Customers table (tabs hidden for now) -->
        <Suspense>
          <CustomersTab @row-click="handleRowClick" />
          <template #fallback>
            <div class="flex items-center justify-center py-12">
              <div class="text-center">
                <Loader2 class="w-8 h-8 shrink-0 text-muted-foreground mb-2 animate-spin" />
                <p class="text-meta">Loading...</p>
              </div>
            </div>
          </template>
        </Suspense>
      </div>
    </div>
    
    <!-- Drawer Container -->
    <DrawerContainer :show="showDrawer" @close="closeDrawer">
      <!-- Customer Detail View -->
      <CustomerProfile
        v-if="drawerEntity && drawerEntity.type === 'customer'"
        :customer-id="drawerEntity.id"
        :customer-type="'contact'"
        :show-close-button="true"
        :close-on-convert="true"
        @close="closeDrawer"
      />
      
      <!-- Task Detail View -->
      <TaskDetailView
        v-else-if="drawerEntity && drawerEntity.type === 'task' && drawerTask && drawerManagementWidget && drawerStoreAdapter"
        :task="drawerTask"
        :management-widget="drawerManagementWidget"
        :store-adapter="drawerStoreAdapter"
        :add-new-config="drawerAddNewConfig"
        :filtered-tasks="filteredTasks"
        :is-drawer-view="true"
        @task-navigate="handleDrawerTaskNavigate"
        @close="closeDrawer"
      />
    </DrawerContainer>
    
    <!-- Add Customer Modal -->
    <AddCustomerModal
      :show="showAddModal"
      :active-tab="activeTab"
      :initial-data="newItem"
      @close="showAddModal = false"
      @save="handleAdd"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, inject, onBeforeUnmount } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import AddCustomerModal from '@/components/modals/AddCustomerModal.vue'
import TaskDetailView from '@/components/tasks/TaskDetailView.vue'
import DrawerContainer from '@/components/shared/DrawerContainer.vue'
import CustomerProfile from '@/components/customer/CustomerProfile.vue'
import CustomersTab from '@/components/customers/CustomersTab.vue'
import { useLeadsStore } from '@/stores/leads'
import { useOpportunitiesStore } from '@/stores/opportunities'
import { useTaskShell } from '@/composables/useTaskShell'
import { useTaskFilters } from '@/composables/useTaskFilters'

const router = useRouter()
const headerActionsRef = inject('headerActionsRef', null)
const leadsStore = useLeadsStore()
const opportunitiesStore = useOpportunitiesStore()

const activeTab = ref('customers')
const showAddModal = ref(false)

const newItem = ref({
  customerName: '',
  email: '',
  phone: '',
  company: '',
  vehicle: '',
  value: '',
  reason: ''
})

// Drawer state
const showDrawer = ref(false)
const drawerEntity = ref(null) // { type: 'customer' | 'task', id: number }
const drawerTaskCompositeId = ref(null) // 'lead-1' or 'opportunity-1' - used to resolve live task from store

// Use task filters composable for drawer navigation
const { allTasks } = useTaskFilters(ref(false))

// Filtered tasks for drawer navigation
const filteredTasks = computed(() => {
  return allTasks.value
})

const drawerTask = computed(() => {
  if (!drawerTaskCompositeId.value) return null
  return allTasks.value.find(t => t.compositeId === drawerTaskCompositeId.value) || null
})

// Computed ref for drawer task (for useTaskShell)
const drawerTaskRef = computed(() => drawerTask.value)

// Get task shell props for drawer task
const drawerTaskShellPropsRaw = useTaskShell(drawerTaskRef)

// Unwrap the computed refs for use in template
const drawerManagementWidget = computed(() => drawerTaskShellPropsRaw.managementWidget.value)
const drawerStoreAdapter = computed(() => drawerTaskShellPropsRaw.storeAdapter.value)
const drawerAddNewConfig = computed(() => drawerTaskShellPropsRaw.addNewConfig.value)

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

const handleAdd = () => {
  // For now we only reset the form and close the modal.
  // When a real backend/API exists, this handler should create
  // a new customer item and refresh the table data.
  newItem.value = {
    customerName: '',
    email: '',
    phone: '',
    company: '',
    vehicle: '',
    value: '',
    reason: ''
  }
  showAddModal.value = false
}

// Handle row click from tab component
const handleRowClick = (row) => {
  // Determine entity type from row ID
  if (row.id.startsWith('customer-')) {
    // Customer/Contact - use customerId from row if available, otherwise parse from id
    const customerId = row.customerId || parseInt(row.id.replace('customer-', ''))
    drawerEntity.value = { type: 'customer', id: customerId }
    drawerTaskCompositeId.value = null
    showDrawer.value = true
  } else if (row.id.startsWith('lead-')) {
    const idMatch = row.id.match(/-(\d+)$/)
    const leadId = idMatch ? parseInt(idMatch[1]) : parseInt(row.id.replace('lead-', ''))
    const task = allTasks.value.find(t => t.type === 'lead' && t.id === leadId)
    if (task) {
      drawerTaskCompositeId.value = task.compositeId
      drawerEntity.value = { type: 'task', id: leadId }
      showDrawer.value = true
      leadsStore.fetchLeadById(leadId)
    }
  } else if (row.id.startsWith('opp-')) {
    const idMatch = row.id.match(/-(\d+)$/)
    const oppId = idMatch ? parseInt(idMatch[1]) : parseInt(row.id.replace('opp-', ''))
    const task = allTasks.value.find(t => t.type === 'opportunity' && t.id === oppId)
    if (task) {
      drawerTaskCompositeId.value = task.compositeId
      drawerEntity.value = { type: 'task', id: oppId }
      showDrawer.value = true
      opportunitiesStore.fetchOpportunityById(oppId)
    }
  }
}

// Close drawer
const closeDrawer = () => {
  showDrawer.value = false
  drawerEntity.value = null
  drawerTaskCompositeId.value = null
}

// Handle drawer task navigation
const handleDrawerTaskNavigate = (direction) => {
  if (!drawerTask.value) return
  
  const index = filteredTasks.value.findIndex(t => {
    const currentCompositeId = drawerTask.value.compositeId || `${drawerTask.value.type}-${drawerTask.value.id}`
    const taskCompositeId = t.compositeId || `${t.type}-${t.id}`
    return taskCompositeId === currentCompositeId
  })
  
  if (index === -1) return
  
  if (direction === 'previous' && index > 0) {
    const prevTask = filteredTasks.value[index - 1]
    handleRowClick({ id: `${prevTask.type}-${prevTask.id}` })
  } else if (direction === 'next' && index < filteredTasks.value.length - 1) {
    const nextTask = filteredTasks.value[index + 1]
    handleRowClick({ id: `${nextTask.type}-${nextTask.id}` })
  }
}

onMounted(async () => {
  if (headerActionsRef) {
    headerActionsRef.value = {
      type: 'customers',
      onAddNew: () => router.push('/add-new')
    }
  }
  await leadsStore.fetchLeads()
  await opportunitiesStore.fetchOpportunities()
})

onBeforeUnmount(() => {
  if (headerActionsRef) headerActionsRef.value = null
})
</script>

<style scoped>
.page-container {
  background-color: var(--base-surface, #fff);
}
</style>

