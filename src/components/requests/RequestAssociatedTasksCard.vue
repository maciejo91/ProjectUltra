<template>
  <!-- Tasks tab layout: Add task top-right, task cards without container (like Data / Conversations tabs) -->
  <div v-if="bare && tabLayout" class="space-y-6">
    <div class="flex justify-end items-center pt-3 pb-1 px-1 mb-4">
      <Button
        v-if="showAddButton && hasCustomer"
        variant="outline"
        size="sm"
        class="flex items-center gap-2 rounded-md hover:bg-muted"
        @click="$emit('add-task')"
      >
        Add task
      </Button>
    </div>
    <div v-if="associatedTasks.length > 0" class="space-y-3 pb-6">
      <button
        v-for="task in associatedTasks"
        :key="task.compositeId"
        type="button"
        class="group w-full min-w-0 text-left rounded-lg border border-border bg-card shadow-sm p-4 flex items-center gap-3 hover:bg-muted/50 cursor-pointer transition-colors"
        @click="handleTaskClick(task)"
      >
        <div class="w-10 h-7 shrink-0 rounded overflow-hidden bg-muted flex items-center justify-center">
          <img v-if="getTaskImage(task)" :src="getTaskImage(task)" alt="" class="w-full h-full object-cover" />
          <Car v-else class="size-3.5 text-muted-foreground" />
        </div>
        <div class="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
          <span
            class="text-xs font-medium px-1.5 py-0.5 rounded shrink-0"
            :class="task.type === 'lead' ? 'bg-badge-green text-emerald-800' : 'bg-purple-50 text-purple-700'"
          >
            {{ task.type === 'lead' ? 'Lead' : 'Opp' }}
          </span>
          <p class="text-sm font-medium text-foreground truncate">{{ getVehicleDisplay(task) }}</p>
          <span class="text-xs text-muted-foreground shrink-0">{{ getTaskStage(task) }}</span>
          <span
            v-if="task.type === 'opportunity' && (task.value || task.estimatedValue)"
            class="text-xs font-semibold text-foreground shrink-0"
          >
            {{ formatCurrency(task.value ?? task.estimatedValue) }}
          </span>
        </div>
        <div class="flex items-center gap-1 shrink-0">
          <span class="text-xs text-muted-foreground whitespace-nowrap">{{ formatTaskDate(task) }}</span>
          <ChevronRight class="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
      </button>
    </div>
    <div
      v-else
      class="text-center py-16 bg-background rounded-xl border border-dashed border-border mx-2"
    >
      <div class="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <ListTodo class="w-6 h-6 text-muted-foreground" />
      </div>
      <h4 class="text-foreground font-medium mb-1">No tasks yet</h4>
      <p class="text-muted-foreground text-sm">Other requests for this customer will appear here.</p>
    </div>
  </div>
  <!-- Bare: content only for tabbed layout (with container) -->
  <div v-else-if="bare" class="flex-1 min-h-0 overflow-y-auto flex flex-col rounded-lg border border-border bg-background shadow-sm overflow-hidden">
    <div class="px-4 py-3 border-b border-border shrink-0">
      <h4 class="text-sm font-semibold text-foreground">Other requests</h4>
      <p class="text-xs text-muted-foreground mt-0.5">Same customer</p>
    </div>
    <div v-if="showAddButton && hasCustomer" class="flex justify-end px-4 py-2 border-b border-border shrink-0">
      <Button variant="outline" size="sm" @click="$emit('add-task')">
        Add Task
      </Button>
    </div>
    <div class="p-4 flex-1 min-h-0 overflow-y-auto flex flex-col">
    <div v-if="associatedTasks.length > 0" class="divide-y divide-border">
      <button
        v-for="task in associatedTasks"
        :key="task.compositeId"
        type="button"
        class="group w-full min-w-0 py-2 text-left transition-colors hover:bg-muted/50 cursor-pointer flex items-center gap-2 overflow-hidden border-l-2 border-transparent first:pt-0"
        :class="task.type === 'lead' ? 'hover:border-l-emerald-700' : 'hover:border-l-purple-500'"
        @click="handleTaskClick(task)"
      >
        <div class="w-10 h-7 shrink-0 rounded overflow-hidden bg-muted flex items-center justify-center">
          <img v-if="getTaskImage(task)" :src="getTaskImage(task)" alt="" class="w-full h-full object-cover" />
          <Car v-else class="size-3.5 text-muted-foreground" />
        </div>
        <div class="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
          <span
            class="text-xs font-medium px-1.5 py-0.5 rounded shrink-0"
            :class="task.type === 'lead' ? 'bg-badge-green text-emerald-800' : 'bg-purple-50 text-purple-700'"
          >
            {{ task.type === 'lead' ? 'Lead' : 'Opp' }}
          </span>
          <p class="text-sm font-medium text-foreground truncate">{{ getVehicleDisplay(task) }}</p>
          <span class="text-xs text-muted-foreground shrink-0">{{ getTaskStage(task) }}</span>
          <span
            v-if="task.type === 'opportunity' && (task.value || task.estimatedValue)"
            class="text-xs font-semibold text-foreground shrink-0"
          >
            {{ formatCurrency(task.value ?? task.estimatedValue) }}
          </span>
        </div>
        <div class="flex items-center gap-1 shrink-0">
          <span class="text-xs text-muted-foreground whitespace-nowrap">{{ formatTaskDate(task) }}</span>
          <ChevronRight class="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
      </button>
    </div>
    <p v-else class="text-sm text-muted-foreground">No other requests for this customer.</p>
    </div>
  </div>
  <!-- Full card: standalone -->
  <Card
    v-else-if="associatedTasks.length > 0"
    class="border border-border rounded-lg shadow-mk-dashboard-card min-w-0 overflow-hidden"
  >
    <CardContent class="p-0 min-w-0 overflow-hidden">
      <div class="px-4 py-3 border-b border-border">
        <h4 class="text-sm font-semibold text-foreground">Other requests</h4>
        <p class="text-xs text-muted-foreground mt-0.5">Same customer</p>
      </div>
      <div class="divide-y divide-border">
        <button
          v-for="task in associatedTasks"
          :key="task.compositeId"
          type="button"
          class="group w-full min-w-0 px-4 py-2 text-left transition-colors hover:bg-muted/50 cursor-pointer flex items-center gap-2 overflow-hidden border-l-2 border-transparent"
          :class="task.type === 'lead' ? 'hover:border-l-emerald-700' : 'hover:border-l-purple-500'"
          @click="handleTaskClick(task)"
        >
          <div class="w-10 h-7 shrink-0 rounded overflow-hidden bg-muted flex items-center justify-center">
            <img v-if="getTaskImage(task)" :src="getTaskImage(task)" alt="" class="w-full h-full object-cover" />
            <Car v-else class="size-3.5 text-muted-foreground" />
          </div>
          <div class="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
            <span
              class="text-xs font-medium px-1.5 py-0.5 rounded shrink-0"
              :class="task.type === 'lead' ? 'bg-badge-green text-emerald-800' : 'bg-purple-50 text-purple-700'"
            >
              {{ task.type === 'lead' ? 'Lead' : 'Opp' }}
            </span>
            <p class="text-sm font-medium text-foreground truncate">{{ getVehicleDisplay(task) }}</p>
            <span class="text-xs text-muted-foreground shrink-0">{{ getTaskStage(task) }}</span>
            <span
              v-if="task.type === 'opportunity' && (task.value || task.estimatedValue)"
              class="text-xs font-semibold text-foreground shrink-0"
            >
              {{ formatCurrency(task.value ?? task.estimatedValue) }}
            </span>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <span class="text-xs text-muted-foreground whitespace-nowrap">{{ formatTaskDate(task) }}</span>
            <ChevronRight class="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </button>
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronRight, Car, ListTodo } from 'lucide-vue-next'
import { Button, Card, CardContent } from '@motork/component-library/future/primitives'
import { getDisplayStage } from '@/utils/stageMapper'
import { DEFAULT_CAR_IMAGE } from '@/utils/mockDataHelpers'
import { useLeadsStore } from '@/stores/leads'
import { useOpportunitiesStore } from '@/stores/opportunities'

const props = defineProps({
  request: {
    type: Object,
    default: null
  },
  bare: {
    type: Boolean,
    default: false
  },
  /** Max number of tasks to show. Default 5 for compact views; pass higher or omit for main Tasks tab */
  limit: {
    type: Number,
    default: 5
  },
  /** When true, clicking a task navigates to task detail page (/tasks/:id). When false, emits request-navigate (switch request in drawer) */
  navigateToTaskDetail: {
    type: Boolean,
    default: false
  },
  /** When true, show Add Task button. Use in Tasks tab on request detail. */
  showAddButton: {
    type: Boolean,
    default: false
  },
  /** When true, use tab layout: Add task top-right, task cards without container (like Data / Conversations tabs). */
  tabLayout: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['request-navigate', 'add-task'])
const router = useRouter()

const leadsStore = useLeadsStore()
const opportunitiesStore = useOpportunitiesStore()

const hasCustomer = computed(() => !!(props.request?.customer || props.request?.customerId))

const associatedTasks = computed(() => {
  if (!props.request?.customer) return []

  const customerEmail = props.request.customer.email
  const customerPhone = props.request.customer.phone
  const currentCompositeId = props.request.compositeId || `${props.request.type}-${props.request.id}`

  const allTasks = [
    ...(leadsStore.leads || []).map((lead) => ({
      ...lead,
      type: 'lead',
      compositeId: `lead-${lead.id}`,
      displayStage: getDisplayStage(lead, 'lead'),
      customer: lead.customer || lead
    })),
    ...(opportunitiesStore.opportunities || []).map((opp) => ({
      ...opp,
      type: 'opportunity',
      compositeId: `opportunity-${opp.id}`,
      displayStage: getDisplayStage(opp, 'opportunity'),
      customer: opp.customer || opp
    }))
  ]

  const filtered = allTasks
    .filter((task) => {
      if (task.compositeId === currentCompositeId) return false
      if (!task.customer) return false
      return (
        task.customer.email === customerEmail ||
        task.customer.phone === customerPhone
      )
    })
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
  return props.limit > 0 ? filtered.slice(0, props.limit) : filtered
})

const customerRequestRows = computed(() => {
  if (!props.request?.compositeId) return []
  const current = {
    ...props.request,
    compositeId: props.request.compositeId || `${props.request.type}-${props.request.id}`,
    displayStage: props.request.displayStage || getDisplayStage(props.request, props.request.type || 'lead'),
    customer: props.request.customer || props.request
  }
  return [current, ...associatedTasks.value].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  )
})

function getTaskStage(task) {
  return task.displayStage || task.stage || '—'
}

function getTaskImage(task) {
  const vehicle = task.requestedCar || task.vehicle
  if (!vehicle) return ''
  return vehicle.image || vehicle.imageUrl || (vehicle.brand || vehicle.model ? DEFAULT_CAR_IMAGE : '')
}

function getVehicleDisplay(task) {
  const vehicle = task.requestedCar || task.vehicle
  if (!vehicle) return 'No vehicle'
  const brand = vehicle.brand || ''
  const model = vehicle.model || ''
  const year = vehicle.year ? `(${vehicle.year})` : ''
  return `${brand} ${model} ${year}`.trim() || '—'
}

function formatTaskDate(task) {
  const date = task.createdAt || task.nextActionDue || task.lastActivity
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

function formatCurrency(amount) {
  if (amount == null) return '€0'
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (num >= 1000) return '€' + (num / 1000).toFixed(0) + 'k'
  return '€' + num
}

function handleTaskClick(task) {
  if (props.navigateToTaskDetail && task.compositeId) {
    const [type, id] = task.compositeId.split('-')
    if (type && id) {
      router.push({ path: `/tasks/${id}`, query: { type } })
    }
  } else {
    emit('request-navigate', task.compositeId, customerRequestRows.value)
  }
}
</script>
