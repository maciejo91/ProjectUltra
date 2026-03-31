<template>
  <div
    v-if="suggestedAction"
    class="overflow-hidden p-4 rounded-lg bg-background shadow-nsc-card flex items-center gap-2.5"
  >
    <div
      class="w-7 h-7 rounded-md shrink-0 flex items-center justify-center bg-yellow-100"
    >
      <Lightbulb class="size-3.5 shrink-0 text-yellow-700" />
    </div>
    <p class="text-sm font-medium text-foreground leading-tight truncate min-w-0 flex-1">
      Suggested next: {{ suggestedAction.title }}
    </p>
  </div>
</template>

<script setup>
import { computed, toRef } from 'vue'
import { Lightbulb } from 'lucide-vue-next'
import { useLeadActions } from '@/composables/useLeadActions'
import { useOpportunityActions } from '@/composables/useOpportunityActions'
import { useLeadsStore } from '@/stores/leads'
import { useOpportunitiesStore } from '@/stores/opportunities'
import { getDisplayStage } from '@/utils/stageMapper'

const props = defineProps({
  request: {
    type: Object,
    default: null
  }
})

const leadsStore = useLeadsStore()
const opportunitiesStore = useOpportunitiesStore()

const formatDateTime = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'short',
    timeStyle: 'short'
  })
}

const enrichedOpportunity = computed(() => {
  const r = props.request
  if (!r || r.type !== 'opportunity') return null
  const displayStage = getDisplayStage(r, 'opportunity') || r.stage
  return { ...r, displayStage }
})

const opportunityActivities = computed(() => {
  if (!props.request || props.request.type !== 'opportunity') return []
  if (opportunitiesStore.currentOpportunity?.id !== props.request.id) return []
  return opportunitiesStore.currentOpportunityActivities || []
})

const leadActions = useLeadActions(toRef(() => props.request), {})
const opportunityActions = useOpportunityActions(
  toRef(() => enrichedOpportunity.value),
  toRef(() => props.request?.scheduledAppointment ?? null),
  opportunityActivities,
  {},
  formatDateTime
)

const suggestedAction = computed(() => {
  if (!props.request) return null
  if (props.request.type === 'lead') {
    return leadActions.primaryAction.value
  }
  if (props.request.type === 'opportunity') {
    return opportunityActions.primaryAction.value
  }
  return null
})

</script>
