<template>
  <!-- Bare: content only for tabbed layout -->
  <div v-if="bare" class="p-4 flex-1 min-h-0 overflow-y-auto flex flex-col">
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
import { ChevronRight, Car } from 'lucide-vue-next'
import { Card, CardContent } from '@motork/component-library/future/primitives'
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
  }
})

const emit = defineEmits(['request-navigate'])

const leadsStore = useLeadsStore()
const opportunitiesStore = useOpportunitiesStore()

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

  return allTasks
    .filter((task) => {
      if (task.compositeId === currentCompositeId) return false
      if (!task.customer) return false
      return (
        task.customer.email === customerEmail ||
        task.customer.phone === customerPhone
      )
    })
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5)
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
  emit('request-navigate', task.compositeId)
}
</script>
