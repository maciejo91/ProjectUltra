<template>
  <div class="flex flex-col h-full bg-muted/30">
    <!-- Tabs -->
    <div class="bg-white border-b border-border px-6 sticky top-0 z-10">
      <Tabs
        :model-value="activeTab"
        :tabs="tabs"
        :hide-counts="hideTabCounts"
        @update:model-value="$emit('update:activeTab', $event)"
      />
    </div>

    <!-- Tab Content -->
    <div class="flex-1 overflow-y-auto p-6 space-y-6">
      <div v-if="activeTab === 'overview'" class="space-y-6 max-w-5xl mx-auto">
        <!-- Highlights -->
        <HighlightsBox :summary="summary" />
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <!-- Activity Feed -->
           <div class="space-y-4">
             <ActivityFeed 
               :activities="activities" 
               @add="$emit('add-activity')"
             />
           </div>
           
           <!-- Upcoming Appointments (next 1 only) -->
           <div class="space-y-4">
             <div class="flex items-center justify-between">
               <h3 class="text-lg font-semibold text-foreground">Upcoming appointment</h3>
               <Button variant="outline" size="sm" @click="$emit('add-appointment')">Add</Button>
             </div>
             
             <UpcomingAppointments
               v-if="nextUpcomingAppointment"
               :key="nextUpcomingAppointment.id"
               :title="nextUpcomingAppointment.title"
               :date="formatDate(nextUpcomingAppointment.start)"
               :location="nextUpcomingAppointment.location"
               :customerName="nextUpcomingAppointment.customerName"
               :vehicle="nextUpcomingAppointment.vehicle"
             />
             <div v-else class="text-sm text-muted-foreground italic">No upcoming appointments.</div>
           </div>
        </div>
      </div>
      
      <div v-else-if="activeTab === 'activity'" class="w-full">
        <TaskActivityCard
          :activities="mergedActivities"
          :expanded-summaries="expandedSummaries"
          :show-add-appointment="true"
          class="w-full"
          @activity-click="() => {}"
          @add-activity="$emit('add-activity', $event)"
          @add-appointment="$emit('add-appointment')"
        />
      </div>

      <div v-else-if="activeTab === 'requests'">
        <RequestsList 
          :leads="leads" 
          :opportunities="opportunities"
          @click="handleRequestClick"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@motork/component-library/future/primitives'
import Tabs from '@/components/customer/widgets/Tabs.vue'
import HighlightsBox from './HighlightsBox.vue'
import ActivityFeed from './ActivityFeed.vue'
import UpcomingAppointments from './UpcomingAppointments.vue'
import RequestsList from './RequestsList.vue'
import TaskActivityCard from '@/components/tasks/TaskActivityCard.vue'

const props = defineProps({
  summary: String,
  activities: { type: Array, default: () => [] },
  appointments: { type: Array, default: () => [] },
  leads: { type: Array, default: () => [] },
  opportunities: { type: Array, default: () => [] },
  loading: Boolean,
  phoneNumber: { type: String, default: '' },
  customerId: { type: [Number, String], default: null },
  customerInitials: { type: String, default: '?' },
  hideTabCounts: { type: Boolean, default: false },
  activeTab: { type: String, default: 'overview' }
})

const emit = defineEmits(['add-activity', 'add-appointment', 'update:activeTab'])

const router = useRouter()
const expandedSummaries = ref({})

const nextUpcomingAppointment = computed(() => {
  const now = new Date()
  const upcoming = (props.appointments || [])
    .filter((app) => new Date(app.start || 0) >= now)
    .sort((a, b) => new Date(a.start || 0).getTime() - new Date(b.start || 0).getTime())
  return upcoming[0] || null
})

const mergedActivities = computed(() => {
  const acts = [...(props.activities || [])]
  const last3Appointments = (props.appointments || [])
    .sort((a, b) => new Date(b.start || 0).getTime() - new Date(a.start || 0).getTime())
    .slice(0, 3)
  const apps = last3Appointments.map((app) => ({
    id: `appointment-${app.id}`,
    type: 'appointment',
    user: 'Scheduled',
    action: 'Appointment',
    message: app.title || 'Appointment',
    content: app.title || 'Appointment',
    timestamp: app.start || app.createdAt || new Date().toISOString(),
    title: app.title,
    location: app.location || app.dealership,
    customerName: app.customerName || app.customer,
    vehicle: app.vehicle
  }))
  return [...acts, ...apps].sort(
    (a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
  )
})

const tabs = computed(() => [
  { key: 'overview', label: 'Overview', count: 1 },
  { key: 'requests', label: 'Requests', count: props.leads.length + props.opportunities.length },
  { key: 'activity', label: 'Activity', count: (props.activities || []).length + props.appointments.length }
])

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString()
}

const handleRequestClick = (item) => {
  const compositeId = item.type === 'lead' ? `lead-${item.id}` : `opportunity-${item.id}`
  router.push({ path: '/requests', query: { open: compositeId } })
}
</script>
