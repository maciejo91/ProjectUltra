<template>
  <!-- Bare: content only for tabbed layout -->
  <div v-if="bare" class="p-4 flex-1 min-h-0 overflow-y-auto flex flex-col">
    <div v-if="activities.length" class="space-y-3">
      <div
        v-for="activity in activities"
        :key="activity.id"
        class="flex gap-3 py-2 border-b border-border last:border-0"
      >
        <div class="w-8 h-8 rounded-full bg-muted shrink-0 flex items-center justify-center">
          <MessageSquare class="size-4 text-muted-foreground" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm text-foreground">{{ activity.action || activity.content || 'Activity' }}</p>
          <p v-if="activity.content && activity.action" class="text-xs text-muted-foreground mt-0.5">{{ activity.content }}</p>
          <p class="text-xs text-muted-foreground mt-1">
            {{ formatDate(activity.timestamp) }}
            <span v-if="activity.user"> · {{ activity.user }}</span>
          </p>
        </div>
      </div>
    </div>
    <p v-else class="text-sm text-muted-foreground">No activity yet</p>
  </div>
  <!-- Full card: standalone -->
  <div v-else class="rounded-lg border border-border bg-card overflow-hidden">
    <div class="px-4 py-3 border-b border-border">
      <h4 class="text-sm font-semibold text-foreground">Activity</h4>
    </div>
    <div class="p-4 max-h-48 overflow-y-auto">
      <div v-if="activities.length" class="space-y-3">
        <div
          v-for="activity in activities"
          :key="activity.id"
          class="flex gap-3 py-2 border-b border-border last:border-0"
        >
          <div class="w-8 h-8 rounded-full bg-muted shrink-0 flex items-center justify-center">
            <MessageSquare class="size-4 text-muted-foreground" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm text-foreground">{{ activity.action || activity.content || 'Activity' }}</p>
            <p v-if="activity.content && activity.action" class="text-xs text-muted-foreground mt-0.5">{{ activity.content }}</p>
            <p class="text-xs text-muted-foreground mt-1">
              {{ formatDate(activity.timestamp) }}
              <span v-if="activity.user"> · {{ activity.user }}</span>
            </p>
          </div>
        </div>
      </div>
      <p v-else class="text-sm text-muted-foreground">No activity yet</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { MessageSquare } from 'lucide-vue-next'
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

const leadsStore = useLeadsStore()
const opportunitiesStore = useOpportunitiesStore()

const activities = computed(() => {
  if (!props.request) return []
  let list = []
  if (props.request.type === 'lead') {
    if (leadsStore.currentLead?.id === props.request.id) {
      list = leadsStore.currentLeadActivities || []
    }
  } else if (props.request.type === 'opportunity') {
    if (opportunitiesStore.currentOpportunity?.id === props.request.id) {
      list = opportunitiesStore.currentOpportunityActivities || []
    }
  }
  return [...list].sort((a, b) => {
    const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0
    const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0
    return tb - ta
  })
})

function formatDate(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  const diff = now - d
  if (diff < 86400000) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  if (diff < 604800000) {
    return d.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>
