<template>
  <div class="space-y-4">
    <ThresholdBanner
      :show="true"
      :message="thresholdBannerMessage"
    />
    <BaseTaskWidget
    :title="'Unsold Feedback'"
    :description="`This opportunity has been open for ${daysOpen} days without any offer. This is a follow-up to ensure progress. Consider creating an offer or closing the opportunity.`"
    :color-scheme="{ background: 'bg-red-50/50', border: 'border-red-100' }"
    @postpone="$emit('postpone', 'ufb')"
  >
    <template #actions>
      <button
        @click="handleCreateContract"
        class="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-btn text-xs flex items-center gap-2 transition-colors"
      >
        Create Offer
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
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BaseTaskWidget from '@/components/tasks/shared/BaseTaskWidget.vue'
import SurveyWidget from '@/components/customer/SurveyWidget.vue'
import ThresholdBanner from '@/components/tasks/shared/ThresholdBanner.vue'
import { useSettingsStore } from '@/stores/settings'

const props = defineProps({
  opportunity: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['create-offer', 'survey-completed', 'survey-refused', 'not-responding', 'postpone'])

const surveyQuestions = [
  {
    key: 'lostInterest',
    label: 'Has customer lost interest?',
    type: 'radio',
    options: ['Yes', 'Maybe', 'No', 'Unknown']
  },
  {
    key: 'blockers',
    label: 'What are the blockers?',
    type: 'select',
    options: ['Pricing', 'Availability', 'Financing', 'No response', 'Changed mind', 'Found competitor', 'Other']
  },
  {
    key: 'notes',
    label: 'Additional feedback',
    type: 'text',
    placeholder: 'Describe the situation and any relevant details...'
  }
]

const settingsStore = useSettingsStore()

const daysOpen = computed(() => {
  if (!props.opportunity.createdAt) return 0
  const created = new Date(props.opportunity.createdAt)
  const now = new Date()
  const diffTime = Math.abs(now - created)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
})

const thresholdBannerMessage = computed(() => {
  const threshold = settingsStore.getSetting('ufbDays') ?? 14
  return `This task appeared because ${daysOpen.value} days passed without an offer (${threshold} days threshold as per Settings).`
})

const handleCreateContract = () => {
  emit('create-offer', props.opportunity)
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

