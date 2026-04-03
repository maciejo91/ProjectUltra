<template>
  <div class="space-y-4">
    <ThresholdBanner
      :show="true"
      :message="thresholdBannerMessage"
    />
    <BaseTaskWidget
    :title="'Open Opportunity Feedback'"
    :description="`This opportunity has been open for ${daysOpen} days without any offer. Consider creating an offer to move forward.`"
    :color-scheme="{ background: 'bg-orange-50/50', border: 'border-orange-100' }"
    @postpone="$emit('postpone', 'oofb')"
  >
    <template #actions>
      <button
        @click="handleCreateOffer"
        class="bg-orange-600 hover:bg-orange-700 text-white font-medium px-4 py-2 rounded-btn text-sm flex items-center gap-2 transition-colors"
      >
        Create Offer
      </button>
      <button
        @click="handleReview"
        class="bg-white border border-D1D5DB text-brand-dark font-medium px-4 py-2 rounded-btn text-sm flex items-center gap-2 transition-colors hover:bg-muted"
      >
        Review Opportunity
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

const emit = defineEmits(['create-offer', 'review', 'survey-completed', 'survey-refused', 'not-responding', 'postpone'])

const surveyQuestions = [
  {
    key: 'offerStatus',
    label: 'Why hasn\'t an offer been created?',
    type: 'select',
    options: ['Still gathering information', 'Awaiting customer response', 'Vehicle unavailable', 'Pricing concerns', 'Other']
  },
  {
    key: 'customerInterest',
    label: 'Is customer still interested?',
    type: 'radio',
    options: ['Yes', 'Maybe', 'No']
  },
  {
    key: 'notes',
    label: 'Additional notes',
    type: 'text',
    placeholder: 'Any relevant feedback or next steps...'
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
  const min = settingsStore.getSetting('oofbMinDays') ?? 7
  const max = settingsStore.getSetting('oofbMaxDays') ?? 13
  return `This task appeared because the opportunity has been open for ${daysOpen.value} days without any offer (${min}-${max} days threshold as per Settings).`
})

const handleCreateOffer = () => {
  emit('create-offer', props.opportunity)
}

const handleReview = () => {
  emit('review', props.opportunity)
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

