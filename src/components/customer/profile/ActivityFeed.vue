<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-foreground">Recent activity</h3>
      <Button variant="outline" size="sm" @click="$emit('add')">Add</Button>
    </div>

    <div class="space-y-3">
      <div
        v-for="activity in displayActivities"
        :key="activity.id"
        class="bg-white rounded-lg shadow-nsc-card overflow-hidden p-4"
      >
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0">
            <component :is="getActivityIcon(activity.type)" class="w-4 h-4 text-muted-foreground" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm">
              <span class="font-medium text-foreground">{{ activity.user || 'System' }}</span>
              <span class="text-muted-foreground ml-1">{{ activity.action || 'performed an action' }}</span>
            </div>
            <div class="text-xs text-muted-foreground mt-0.5">{{ formatTime(activity.timestamp) }}</div>
          </div>
        </div>
      </div>
      
      <div v-if="activities.length === 0" class="text-sm text-muted-foreground italic">No recent activities.</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Button } from '@motork/component-library/future/primitives'
import { FileText, Mail, Calendar, Phone, Plus, User } from 'lucide-vue-next'

const props = defineProps({
  activities: { type: Array, default: () => [] }
})

defineEmits(['add'])

const displayActivities = computed(() => {
  return props.activities.slice(0, 5) // Show top 5
})

const getActivityIcon = (type) => {
  const icons = {
    'note': FileText,
    'email': Mail,
    'call': Phone,
    'meeting': Calendar,
    'lead': Plus, // System added lead
    'default': User
  }
  return icons[type] || icons.default
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 60) return `${diffMins} minutes ago`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`
  return date.toLocaleDateString()
}
</script>
