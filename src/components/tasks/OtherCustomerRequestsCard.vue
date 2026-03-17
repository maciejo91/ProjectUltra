<template>
  <div 
    v-if="relatedTasks.length > 0"
    class="overflow-hidden p-4"
    style="
      border-radius: var(--border-radius-rounded-lg, 10px);
      background: var(--base-card, #FFF);
      box-shadow: var(--nsc-card-shadow);
    "
  >
    <h3 class="text-base font-medium text-foreground mb-4 leading-6">Other customer requests</h3>
    <div class="space-y-3">
      <div
        v-for="relatedTask in relatedTasks"
        :key="relatedTask.compositeId"
        @click="goToTask(relatedTask)"
        class="group rounded-lg border border-transparent hover:border-brand-blue/30 hover:bg-blue-50/20 transition-all cursor-pointer flex items-center gap-2"
      >
        <!-- Single Line: Type + Stage + Vehicle + Price + Date -->
        <span 
          class="text-sm font-bold uppercase px-1 py-0.5 rounded leading-normal shrink-0"
          :class="relatedTask.type === 'lead' ? 'bg-badge-green text-emerald-700' : 'bg-purple-50 text-purple-600'"
        >
          {{ relatedTask.type === 'lead' ? 'Lead' : 'Opp' }}
        </span>
        <span class="text-sm font-medium text-foreground truncate shrink-0 min-w-0">
          {{ getTaskStage(relatedTask) }}
        </span>
        <span class="text-sm text-muted-foreground truncate flex-1 min-w-0">
          {{ getVehicleDisplay(relatedTask) }}
        </span>
        <span v-if="relatedTask.type === 'opportunity' && relatedTask.estimatedValue" class="text-sm font-bold text-foreground shrink-0">
          {{ formatCurrency(relatedTask.estimatedValue) }}
        </span>
        <span class="text-sm text-muted-foreground shrink-0">
          {{ formatTaskDate(relatedTask) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLeadsStore } from '@/stores/leads'
import { useOpportunitiesStore } from '@/stores/opportunities'

const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  /** When 'request', links go to request detail page; when 'task', to task detail. */
  linkTo: {
    type: String,
    default: 'task',
    validator: (v) => v === 'task' || v === 'request'
  }
})

const router = useRouter()
const leadsStore = useLeadsStore()
const opportunitiesStore = useOpportunitiesStore()

// Get related tasks from the same customer (limited to 3 most recent)
const relatedTasks = computed(() => {
  if (!props.task.customer) return []
  
  const customerEmail = props.task.customer.email
  const customerPhone = props.task.customer.phone
  const currentTaskId = props.task.compositeId
  
  // Combine all leads and opportunities
  const allTasks = [
    ...(leadsStore.leads || []).map(lead => ({ ...lead, type: 'lead', compositeId: `lead-${lead.id}` })),
    ...(opportunitiesStore.opportunities || []).map(opp => ({ ...opp, type: 'opportunity', compositeId: `opportunity-${opp.id}` }))
  ]
  
  // Filter by same customer (email or phone match) and exclude current task
  return allTasks
    .filter(task => {
      if (task.compositeId === currentTaskId) return false
      if (!task.customer) return false
      
      return task.customer.email === customerEmail || task.customer.phone === customerPhone
    })
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 3) // Only show top 3 to save space
})

const goToTask = (task) => {
  const [type, id] = task.compositeId.split('-')
  if (props.linkTo === 'request') {
    router.push({
      path: `/requests/${id}`,
      query: { type }
    })
  } else {
    router.push({
      path: `/tasks/${id}`,
      query: { type }
    })
  }
}

const getTaskStage = (task) => {
  return task.stage || task.currentStage || 'Unknown'
}

// Format date (e.g., Dec 10, 24)
const formatTaskDate = (task) => {
  const date = task.createdAt || task.nextActionDue || task.updatedAt
  if (!date) return ''
  
  try {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: '2-digit' 
    })
  } catch {
    return ''
  }
}

// Vehicle display - super compact
const getVehicleDisplay = (task) => {
  const vehicle = task.requestedCar || task.vehicle
  if (!vehicle) return 'No vehicle'
  
  const brand = vehicle.brand || ''
  const model = vehicle.model || ''
  const year = vehicle.year ? `(${vehicle.year})` : ''
  return `${brand} ${model} ${year}`.trim() || 'Vehicle info N/A'
}

// Format currency (e.g., €45k)
const formatCurrency = (amount) => {
  if (!amount) return '€0'
  if (amount >= 1000) {
    return '€' + (amount / 1000).toFixed(0) + 'k'
  }
  return '€' + amount
}
</script>
