<template>
  <div class="rounded-lg flex flex-col h-full bg-muted">
    <!-- Title Section -->
    <div class="px-4 py-2.5 flex items-center justify-between shrink-0">
      <div class="flex items-center gap-2">
        <List class="w-3 h-3 shrink-0 text-foreground" />
        <h2 class="text-sm font-medium text-foreground">Other Tasks for This Customer</h2>
        <span v-if="relatedTasks.length > 0" class="ml-1 px-2 py-0.5 bg-brand-blue/10 text-brand-blue text-sm font-bold rounded-full">
          {{ relatedTasks.length }}
        </span>
      </div>
    </div>
    
    <!-- Card Content -->
    <div class="bg-white rounded-lg p-3 shadow-nsc-card flex flex-col flex-1 min-h-0">
      <div v-if="loading" class="text-center py-6 text-muted-foreground">
        <Loader2 class="w-5 h-5 shrink-0 mb-2 animate-spin text-muted-foreground" />
        <p class="text-sm">Loading related tasks...</p>
      </div>
      
      <div v-else-if="relatedTasks.length > 0" class="space-y-2 overflow-y-auto flex-1">
        <div
          v-for="task in relatedTasks"
          :key="`${task.type}-${task.id}`"
          class="flex flex-col p-2 border border-border rounded-lg hover:bg-muted transition-colors cursor-pointer group"
          @click="handleTaskClick(task)"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1 min-w-0">
              <!-- Type, Status and Details in a compact layout -->
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <span 
                  class="px-1 py-0.5 rounded text-sm font-bold border leading-none uppercase"
                  :class="task.type === 'lead' 
                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                    : 'bg-purple-50 text-purple-700 border-purple-200'"
                >
                  {{ task.type === 'lead' ? 'Lead' : 'Opp' }}
                </span>
                <span 
                  class="px-1 py-0.5 rounded text-sm font-bold border leading-none uppercase"
                  :class="getStageColor(task.displayStage || task.stage, task.type)"
                >
                  {{ task.displayStage || task.stage }}
                </span>
                
                <div v-if="task.createdAt" class="hidden sm:flex items-center gap-1 text-sm text-muted-foreground">
                  <span>{{ formatDate(task.createdAt) }}</span>
                </div>
              </div>
              
              <!-- Details Row -->
              <div class="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                <!-- Mobile only creation date -->
                <div v-if="task.createdAt" class="flex sm:hidden items-center gap-1 text-sm text-muted-foreground">
                  <Calendar class="w-4 h-4 shrink-0 opacity-70" />
                  <span>{{ formatDate(task.createdAt) }}</span>
                </div>

                <!-- Assignee -->
                <div v-if="task.assignee" class="flex items-center gap-1 text-sm text-muted-foreground">
                  <User class="w-4 h-4 shrink-0 opacity-70" />
                  <span>{{ task.assignee }}</span>
                </div>
                
                <!-- Car Requested -->
                <div v-if="getCarName(task)" class="flex items-center gap-1 text-sm text-muted-foreground">
                  <Car class="w-4 h-4 shrink-0 opacity-70" />
                  <span class="truncate max-w-[150px]">{{ getCarName(task) }}</span>
                </div>
                
                <!-- Value (only for opportunities) -->
                <div v-if="task.type === 'opportunity' && task.value" class="flex items-center gap-1 text-sm">
                  <Tag class="w-4 h-4 shrink-0 text-muted-foreground opacity-70" />
                  <span class="font-bold text-foreground">€ {{ formatCurrency(task.value) }}</span>
                </div>
              </div>
            </div>
            
            <!-- Compact External Link Icon -->
            <div class="w-6 h-6 flex items-center justify-center bg-surface border border-border rounded hover:bg-white hover:border-brand-blue/30 text-muted-foreground hover:text-brand-blue transition-all shrink-0 self-center">
              <ExternalLink class="w-3 h-3 shrink-0" />
            </div>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-else class="text-center py-8 text-muted-foreground">
        <Inbox class="w-6 h-6 shrink-0 mb-2 opacity-30" />
        <p class="text-sm">No other tasks for this customer</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { List, Loader2, Calendar, User, Car, Tag, ExternalLink, Inbox } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useLeadsStore } from '@/stores/leads'
import { useOpportunitiesStore } from '@/stores/opportunities'
import { getStageColor } from '@/utils/stageMapper'

const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  entityType: {
    type: String,
    required: true // 'lead' or 'opportunity'
  }
})

const router = useRouter()
const leadsStore = useLeadsStore()
const opportunitiesStore = useOpportunitiesStore()

const loading = ref(false)
const allLeads = ref([])
const allOpportunities = ref([])

// Get customer ID from task
const customerId = computed(() => {
  return props.task.customerId || props.task.customer?.id || null
})

// Fetch all leads and opportunities
const fetchAllTasks = async () => {
  if (!customerId.value) {
    return
  }
  
  loading.value = true
  try {
    await Promise.all([
      leadsStore.fetchLeads(),
      opportunitiesStore.fetchOpportunities()
    ])
    allLeads.value = leadsStore.leads || []
    allOpportunities.value = opportunitiesStore.opportunities || []
  } catch (error) {
    console.error('Error fetching related tasks:', error)
  } finally {
    loading.value = false
  }
}

// Filter related tasks by customer ID and exclude current task
const relatedTasks = computed(() => {
  if (!customerId.value) {
    return []
  }
  
  const tasks = []
  
  // Add leads
  allLeads.value.forEach(lead => {
    if (lead.customerId === customerId.value && 
        !(lead.id === props.task.id && props.entityType === 'lead')) {
      tasks.push({
        ...lead,
        type: 'lead'
      })
    }
  })
  
  // Add opportunities
  allOpportunities.value.forEach(opp => {
    if (opp.customerId === customerId.value && 
        !(opp.id === props.task.id && props.entityType === 'opportunity')) {
      tasks.push({
        ...opp,
        type: 'opportunity'
      })
    }
  })
  
  // Sort by creation date (newest first)
  return tasks.sort((a, b) => {
    const dateA = new Date(a.createdAt || 0)
    const dateB = new Date(b.createdAt || 0)
    return dateB - dateA
  })
})


// Get car name from task
const getCarName = (task) => {
  const car = task.requestedCar || task.vehicle
  if (!car) return null
  if (car.brand && car.model) {
    return `${car.brand} ${car.model}`
  }
  return null
}

// Format currency
const formatCurrency = (value) => {
  if (!value) return '0'
  return new Intl.NumberFormat('en-US').format(value)
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Handle task click
const handleTaskClick = (task) => {
  router.push({ 
    path: `/tasks/${task.id}`, 
    query: { type: task.type } 
  })
}

// Watch for task changes
watch(() => props.task.id, () => {
  fetchAllTasks()
}, { immediate: true })

// Fetch on mount
onMounted(() => {
  fetchAllTasks()
})
</script>
