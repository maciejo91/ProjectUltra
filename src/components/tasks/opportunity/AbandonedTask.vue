<template>
  <BaseTaskWidget
    :title="'Opportunity Abandoned'"
    :description="`This opportunity has been inactive for ${daysInactive} days. Consider reopening it or closing as lost.`"
    :color-scheme="{ background: 'bg-muted/50', border: 'border' }"
  >
    <template #actions>
      <button
        @click="handleReopen"
        class="bg-gray-600 hover:bg-gray-700 text-white font-medium px-4 py-2 rounded-btn text-sm flex items-center gap-2 transition-colors"
      >
        <RotateCcw class="w-4 h-4 shrink-0 inline" /> Reopen Opportunity
      </button>
      <button
        @click="handleCloseLost"
        class="bg-white border border-D1D5DB text-brand-dark font-medium px-4 py-2 rounded-btn text-sm flex items-center gap-2 transition-colors hover:bg-muted"
      >
        <X class="w-4 h-4 shrink-0 inline" /> Close as Lost
      </button>
      <button
        @click="handleRequalify"
        class="bg-white border border-D1D5DB text-brand-dark font-medium px-4 py-2 rounded-btn text-sm flex items-center gap-2 transition-colors hover:bg-muted"
      >
        <ArrowLeft class="w-4 h-4 shrink-0 inline" /> Requalify as Lead
      </button>
    </template>
    
    <template #survey>
      <SurveyWidget
        :questions="surveyQuestions"
        @survey-completed="handleSurveyCompleted"
        @survey-refused="handleSurveyRefused"
        @not-responding="handleNotResponding"
      />
    </template>
  </BaseTaskWidget>
</template>

<script setup>
import { computed } from 'vue'
import { RotateCcw, X, ArrowLeft } from 'lucide-vue-next'
import { useSettingsStore } from '@/stores/settings'
import BaseTaskWidget from '@/components/tasks/shared/BaseTaskWidget.vue'
import SurveyWidget from '@/components/customer/SurveyWidget.vue'

const props = defineProps({
  opportunity: {
    type: Object,
    required: true
  },
  activities: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['reopen', 'close-lost', 'requalify', 'survey-completed', 'survey-refused', 'not-responding'])

const settingsStore = useSettingsStore()

const surveyQuestions = [
  {
    key: 'abandonmentReason',
    label: 'Why was this opportunity abandoned?',
    type: 'select',
    options: ['No response from customer', 'Customer lost interest', 'Competitor won', 'Budget constraints', 'Timing issues', 'Other']
  },
  {
    key: 'customerStatus',
    label: 'Customer status?',
    type: 'radio',
    options: ['Still interested', 'Lost interest', 'Bought elsewhere', 'Unknown']
  },
  {
    key: 'notes',
    label: 'Additional notes',
    type: 'text',
    placeholder: 'Document any relevant information about why this opportunity was abandoned...'
  }
]

const daysInactive = computed(() => {
  const lastActivity = props.opportunity.lastActivity || props.opportunity.createdAt
  if (!lastActivity) return 0
  
  const lastActivityDate = new Date(lastActivity)
  const now = new Date()
  const diffTime = Math.abs(now - lastActivityDate)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

const handleReopen = () => {
  emit('reopen', props.opportunity)
}

const handleCloseLost = () => {
  emit('close-lost', { 
    opportunity: props.opportunity, 
    reason: 'Abandoned - no activity for extended period' 
  })
}

const handleRequalify = () => {
  emit('requalify', props.opportunity)
}

const handleSurveyCompleted = (responses) => {
  emit('survey-completed', { opportunity: props.opportunity, responses })
}

const handleSurveyRefused = () => {
  emit('survey-refused', { opportunity: props.opportunity })
}

const handleNotResponding = () => {
  emit('not-responding', { opportunity: props.opportunity })
}
</script>

